import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ratio,monthlySelection,aggregate,planComparison,cohortMatrix} from '../metrics.mjs';

const data = JSON.parse(readFileSync(new URL('../metrics.json',import.meta.url),'utf8'));

test('churn usa soma de cancelamentos / soma de clientes-mês',()=>{
 const result=aggregate(data.monthly);
 assert.equal(result.active,data.overview.customer_months);
 assert.equal(result.churned,data.overview.churn_events);
 assert.equal(result.lost_mrr_cents,data.overview.lost_mrr_cents);
 assert.ok(Math.abs(result.churn_rate-data.overview.event_rate)<1e-6);
});

test('filtro por mês é inclusivo, e coorte de janeiro não se perde',()=>{
 const rows=monthlySelection(data,{from:'2025-01',to:'2025-01'});
 assert.equal(rows.length,1);
 assert.equal(rows[0].month,'2025-01');
});

test('filtrar Pro não conta dados de Essencial ou Equipe',()=>{
 const rows=monthlySelection(data,{plan:'Pro'});
 assert.equal(rows.length,18);
 assert.ok(rows.every(row=>row.plan==='Pro'));
 assert.ok(aggregate(rows).active<aggregate(data.monthly).active);
});

test('cada mês é reconciliado pela soma de três planos',()=>{
 for(const month of data.monthly){
   const plans=planComparison(data,{from:month.month,to:month.month});
   assert.equal(plans.reduce((a,x)=>a+x.active,0),month.active_start);
   assert.equal(plans.reduce((a,x)=>a+x.churned,0),month.churned);
   assert.equal(plans.reduce((a,x)=>a+x.lost_mrr_cents,0),month.lost_mrr_cents);
 }
});

test('intervalo inválido retorna nenhuma exposição, sem inventar taxa',()=>{
 const rows=monthlySelection(data,{from:'2026-06',to:'2025-01'});
 assert.equal(rows.length,0);
 assert.equal(aggregate(rows).churn_rate,null);
 assert.equal(ratio(2,0),null);
});

test('coortes exibem idade zero igual a 100% e não crescem depois',()=>{
 const cohorts=cohortMatrix(data,'2025',8);
 assert.equal(cohorts.length,12);
 for(const cohort of cohorts){
  assert.equal(cohort.ages[0],1);
  let previous=1;
  for(const rate of cohort.ages){
   if(rate===null)continue;
   assert.ok(rate<=previous);
   previous=rate;
  }
 }
});
