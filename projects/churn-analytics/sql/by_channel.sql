-- Agregado de customer-months. NÃO é taxa de uma coorte de novos clientes.
SELECT
  c.channel,
  COUNT(*) AS customer_months,
  SUM(o.churned_end_month) AS churned,
  ROUND(1.0 * SUM(o.churned_end_month) / COUNT(*), 8) AS churn_rate
FROM monthly_observations AS o
INNER JOIN customers AS c USING (customer_id)
GROUP BY c.channel
ORDER BY c.channel;
