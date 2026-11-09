import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { aggregate, monthlySelection } from '../../metrics.mjs';

const metrics = JSON.parse(readFileSync(new URL('../../metrics.json', import.meta.url), 'utf8'));
const card = JSON.parse(readFileSync(new URL('../../model_card.json', import.meta.url), 'utf8'));
const asInt = num => new Intl.NumberFormat('pt-BR').format(num);
const asPct = num => new Intl.NumberFormat('pt-BR', { style:'percent', minimumFractionDigits:2, maximumFractionDigits:2 }).format(num);
const asMoney = cents => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:2 }).format(cents / 100);

test('dashboard carrega dados sintéticos, indicadores e prévia acessível', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#status')).toContainText('FONTE FICTÍCIA');
  await expect(page.locator('#k-exposures')).toHaveText(asInt(metrics.overview.customer_months));
  await expect(page.locator('#k-churned')).toHaveText(asInt(metrics.overview.churn_events));
  await expect(page.locator('#k-rate')).toHaveText(asPct(metrics.overview.event_rate));
  await expect(page.locator('#k-lost-mrr')).toHaveText(asMoney(metrics.overview.lost_mrr_cents));
  await expect(page.locator('#modelAuc')).toHaveText(card.metrics.test.auc_roc.toFixed(4).replace('.', ','));
  await expect(page.locator('#chart svg')).toHaveCount(1);
  await expect(page.locator('#monthTable tr')).toHaveCount(18);
  await expect(page.locator('#cohortHeatmap tbody tr')).toHaveCount(12);
  expect(errors).toEqual([]);
  mkdirSync('artifacts', { recursive: true });
  await page.screenshot({ path:'artifacts/churnlab-'+testInfo.project.name+'.png', fullPage:true, animations:'disabled' });
});

test('filtros de plano e período modificam KPI usando o mesmo denominador dos testes SQL', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#status')).toContainText('FONTE FICTÍCIA');
  await page.locator('#plan').selectOption('Pro');
  await page.locator('#fromMonth').selectOption('2026-04');
  await page.locator('#toMonth').selectOption('2026-06');
  const selection = aggregate(monthlySelection(metrics, {plan:'Pro',from:'2026-04',to:'2026-06'}));
  await expect(page.locator('#k-exposures')).toHaveText(asInt(selection.active));
  await expect(page.locator('#k-churned')).toHaveText(asInt(selection.churned));
  await expect(page.locator('#k-rate')).toHaveText(asPct(selection.churn_rate));
  await expect(page.locator('#k-lost-mrr')).toHaveText(asMoney(selection.lost_mrr_cents));
  await expect(page.locator('#monthTable tr')).toHaveCount(3);
});

test('intervalo invertido mostra aviso, não inventa percentual, e reset restabelece valores', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#status')).toContainText('FONTE FICTÍCIA');
  await page.locator('#fromMonth').selectOption('2026-06');
  await page.locator('#toMonth').selectOption('2025-01');
  await expect(page.locator('#status')).toContainText('Período inválido');
  await expect(page.locator('#k-rate')).toHaveText('—');
  await page.getByRole('button', { name:'Limpar filtros' }).click();
  await expect(page.locator('#k-rate')).toHaveText(asPct(metrics.overview.event_rate));
  await expect(page.locator('#monthTable tr')).toHaveCount(18);
});

test('visualização mantém largura da página no celular e no desktop', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('#status')).toContainText('FONTE FICTÍCIA');
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  expect(metrics.documentWidth, 'horizontal overflow de documento').toBeLessThanOrEqual(metrics.innerWidth + 2);
  expect(metrics.bodyWidth, 'horizontal overflow de body').toBeLessThanOrEqual(metrics.innerWidth + 2);
});

test('teclado encontra link de salto para o conteúdo sem depender de mouse', async ({page}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});
