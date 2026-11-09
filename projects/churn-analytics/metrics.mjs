/** Funções puras de agregação: métricas SQL já calculadas, sem dados individuais. */
export const PLANS = ['Essencial', 'Pro', 'Equipe'];

export function ratio(numerator, denominator) {
  return denominator > 0 ? numerator / denominator : null;
}

export function monthlySelection(data, {plan='',from='',to=''}={}) {
  const source = plan ? data.by_plan_month.filter(row=>row.plan===plan) : data.monthly;
  return source.filter(row=>(!from||row.month>=from)&&(!to||row.month<=to));
}

export function aggregate(rows) {
  const active = rows.reduce((sum,row)=>sum+row.active_start,0);
  const churned = rows.reduce((sum,row)=>sum+row.churned,0);
  const lost = rows.reduce((sum,row)=>sum+row.lost_mrr_cents,0);
  return {active,churned,lost_mrr_cents:lost,churn_rate:ratio(churned,active)};
}

export function planComparison(data,{from='',to=''}={}) {
  return PLANS.map(plan=>{
    const rows = monthlySelection(data,{plan,from,to});
    return {plan,...aggregate(rows)};
  });
}

export function cohortMatrix(data,cohortYear='2025',maximumAge=8){
  const cohorts = [...new Set(data.cohorts.filter(r=>r.cohort.startsWith(cohortYear)).map(r=>r.cohort))];
  return cohorts.map(cohort=>{
    const rows=data.cohorts.filter(r=>r.cohort===cohort);
    const byAge=new Map(rows.map(r=>[r.age_months,r.retention_rate]));
    const maxObservedAge=rows.length?Math.max(...rows.map(r=>r.age_months)):-1;
    return {
      cohort,
      size:rows.length?rows[0].cohort_size:0,
      ages:Array.from({length:maximumAge+1},(_,age)=>{
        if(age>maxObservedAge)return null;
        return byAge.get(age)??0;
      }),
    };
  });
}
