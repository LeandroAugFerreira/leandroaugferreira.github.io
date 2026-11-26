(() => {
  const root = document.querySelector('[data-transition-tour]');
  if (!root) return;
  const selector = root.querySelector('fieldset');
  const status = root.querySelector('[data-status]');
  const output = root.querySelector('[data-result]');
  const money = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  const hours = minutes => `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, '0') : ''}`;
  let examples;
  function render(id) {
    const selected = examples.find(example => example.id === id);
    if (!selected) return;
    const value = selected.result;
    root.querySelector('[data-phase]').textContent = selected.label;
    root.querySelector('[data-weekly]').textContent = hours(value.effective_weekly_minutes);
    root.querySelector('[data-rests]').textContent = `${value.phase.rest_days} de 24h`;
    root.querySelector('[data-hourly]').textContent = money(value.hourly_cents);
    root.querySelector('[data-salary]').textContent = money(value.monthly_salary_cents);
    root.querySelector('[data-divisor]').textContent = value.monthly_divisor_hours;
    root.querySelector('[data-date]').textContent = value.assumptions.reference_date.split('-').reverse().join('/');
    root.querySelector('[data-digest]').textContent = value.digest;
    const list = root.querySelector('[data-findings]');
    list.replaceChildren();
    for (const finding of value.findings) {
      const item = document.createElement('li'); item.textContent = finding.message; list.append(item);
    }
    output.hidden = false;
    status.textContent = `${selected.label}. Exemplo carregado para comparação, sujeito à revisão.`;
  }
  selector.addEventListener('change', event => {
    if (event.target.matches('input[name="transition-phase"]') && event.target.checked) render(event.target.value);
  });
  fetch(root.dataset.source).then(response => { if (!response.ok) throw new Error('unavailable'); return response.json(); })
    .then(data => {
      if (!Array.isArray(data.examples) || data.examples.length !== 3 || data.policy_version !== 'br-ec141-2026.11.25') throw new Error('invalid');
      examples = data.examples; render(selector.querySelector(':checked').value); selector.disabled = false;
    }).catch(() => { status.textContent = 'Não foi possível carregar os exemplos. Consulte o arquivo de resultados ou o código-fonte pelos links abaixo.'; });
})();
