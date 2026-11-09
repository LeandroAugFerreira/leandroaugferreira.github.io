PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customers (
  customer_id TEXT PRIMARY KEY,
  signup_month TEXT NOT NULL CHECK(length(signup_month) = 7),
  plan TEXT NOT NULL CHECK(plan IN ('Essencial', 'Pro', 'Equipe')),
  segment TEXT NOT NULL,
  channel TEXT NOT NULL,
  state TEXT NOT NULL,
  mrr_cents INTEGER NOT NULL CHECK(mrr_cents > 0)
);

CREATE TABLE IF NOT EXISTS monthly_observations (
  customer_id TEXT NOT NULL REFERENCES customers(customer_id),
  month TEXT NOT NULL CHECK(length(month) = 7),
  tenure_months INTEGER NOT NULL CHECK(tenure_months >= 0),
  tickets_last30d INTEGER NOT NULL CHECK(tickets_last30d BETWEEN 0 AND 5),
  inactive_days_last30d INTEGER NOT NULL CHECK(inactive_days_last30d BETWEEN 0 AND 30),
  late_invoices_last90d INTEGER NOT NULL CHECK(late_invoices_last90d BETWEEN 0 AND 2),
  churned_end_month INTEGER NOT NULL CHECK(churned_end_month IN (0, 1)),
  PRIMARY KEY (customer_id, month)
);

CREATE INDEX IF NOT EXISTS idx_observation_month ON monthly_observations(month);
CREATE INDEX IF NOT EXISTS idx_observation_churn ON monthly_observations(churned_end_month);
CREATE INDEX IF NOT EXISTS idx_customers_plan ON customers(plan);
