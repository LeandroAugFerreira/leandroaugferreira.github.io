-- Associação descritiva, NÃO demonstra causa ou efeito de intervenção.
SELECT
  CASE WHEN o.inactive_days_last30d >= 14 THEN '14+ dias inativo'
       ELSE '0-13 dias inativo' END AS bucket,
  COUNT(*) AS customer_months,
  SUM(o.churned_end_month) AS churned,
  ROUND(1.0 * SUM(o.churned_end_month) / COUNT(*), 8) AS churn_rate
FROM monthly_observations AS o
GROUP BY bucket ORDER BY bucket;
