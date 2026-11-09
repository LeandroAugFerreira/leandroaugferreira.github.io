-- Churn mensal = cancelamentos no FINAL do mês / clientes ativos no INÍCIO.
-- MRR perdido é soma contratual dos cancelamentos (não caixa realizado).
SELECT
  o.month,
  COUNT(*) AS active_start,
  SUM(o.churned_end_month) AS churned,
  COUNT(*) - SUM(o.churned_end_month) AS retained_end,
  SUM(c.mrr_cents) AS active_mrr_cents,
  SUM(o.churned_end_month * c.mrr_cents) AS lost_mrr_cents,
  ROUND(1.0 * SUM(o.churned_end_month) / COUNT(*), 8) AS churn_rate
FROM monthly_observations AS o
INNER JOIN customers AS c USING (customer_id)
GROUP BY o.month
ORDER BY o.month;
