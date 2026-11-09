-- O denominador da taxa é exposição de clientes ativos no começo do mês.
SELECT
  o.month,
  c.plan,
  COUNT(*) AS active_start,
  SUM(o.churned_end_month) AS churned,
  SUM(o.churned_end_month * c.mrr_cents) AS lost_mrr_cents,
  ROUND(1.0 * SUM(o.churned_end_month) / COUNT(*), 8) AS churn_rate
FROM monthly_observations AS o
INNER JOIN customers AS c USING (customer_id)
GROUP BY o.month, c.plan
ORDER BY o.month, c.plan;
