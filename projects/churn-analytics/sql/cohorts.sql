-- Retenção no INÍCIO do mês por coorte de aquisição.
-- Coortes anteriores a 2025-01 são excluídas por censura à esquerda.
-- Uma coorte é medida pelo número inicial de cadastros, não por receita.
WITH ages AS (
  SELECT c.signup_month AS cohort,
         ((CAST(substr(o.month,1,4) AS INTEGER)
         - CAST(substr(c.signup_month,1,4) AS INTEGER)) * 12
         + CAST(substr(o.month,6,2) AS INTEGER)
         - CAST(substr(c.signup_month,6,2) AS INTEGER)) AS age_months,
         o.customer_id
  FROM monthly_observations AS o
  INNER JOIN customers AS c USING(customer_id)
  WHERE c.signup_month BETWEEN '2025-01' AND '2026-06'
), cohort_sizes AS (
  SELECT signup_month AS cohort, COUNT(*) AS cohort_size
  FROM customers
  WHERE signup_month BETWEEN '2025-01' AND '2026-06'
  GROUP BY signup_month
)
SELECT
  a.cohort, a.age_months, s.cohort_size, COUNT(*) AS active_start,
  ROUND(1.0 * COUNT(*) / s.cohort_size, 8) AS retention_rate
FROM ages AS a INNER JOIN cohort_sizes AS s USING(cohort)
GROUP BY a.cohort, a.age_months
ORDER BY a.cohort, a.age_months;
