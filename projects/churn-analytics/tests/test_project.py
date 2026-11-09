"""Testes de qualidade, SQL, corte temporal e reprodução do ChurnLab.

Executar na raiz deste projeto: python -m unittest discover -s tests -v.
Somente dados 100% sintéticos, sem rede ou dependências de terceiros.
"""
from collections import defaultdict
import csv
from hashlib import sha256
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from src.generate import CUSTOMER_COUNT, SEED, generate
from src.pipeline import database, pipeline
from src.model import sample_rows, split_samples, auc_rank, vector

ROOT = Path(__file__).resolve().parents[1]


class ChurnReconstructionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.customers = list(csv.DictReader((ROOT / "data/customers.csv").open(encoding="utf-8", newline="")))
        cls.observations = list(csv.DictReader((ROOT / "data/monthly_observations.csv").open(encoding="utf-8", newline="")))
        cls.metrics = json.loads((ROOT / "metrics.json").read_text(encoding="utf-8"))
        cls.card = json.loads((ROOT / "model_card.json").read_text(encoding="utf-8"))

    def test_01_synthetic_source_declared(self):
        self.assertTrue(self.metrics["metadata"]["synthetic"])
        self.assertTrue(self.card["synthetic"])
        self.assertTrue(self.card["not_for_decisions"])
        self.assertEqual(self.metrics["metadata"]["seed"], SEED)
        self.assertEqual(self.metrics["metadata"]["customer_count"], CUSTOMER_COUNT)

    def test_02_no_personal_identifiers(self):
        customer_fields = set(self.customers[0])
        self.assertEqual(customer_fields, {
            "customer_id", "signup_month", "plan", "segment", "channel", "state", "mrr_cents",
        })
        self.assertFalse(any(s in customer_fields for s in ("name", "email", "cpf", "phone", "address")))
        self.assertTrue(all(c["customer_id"].startswith("C") for c in self.customers))

    def test_03_unique_customers(self):
        ids = [r["customer_id"] for r in self.customers]
        self.assertEqual(len(ids), CUSTOMER_COUNT)
        self.assertEqual(len(set(ids)), len(ids))

    def test_04_relational_integrity(self):
        ids = {r["customer_id"] for r in self.customers}
        keys = [(r["customer_id"], r["month"]) for r in self.observations]
        self.assertEqual(len(keys), len(set(keys)))
        self.assertTrue(all(r["customer_id"] in ids for r in self.observations))
        self.assertEqual(len(self.observations), self.metrics["metadata"]["customer_months"])

    def test_05_each_customer_churns_at_most_once_and_never_reappears(self):
        by_customer = defaultdict(list)
        for row in self.observations:
            by_customer[row["customer_id"]].append(row)
        for cust, rows in by_customer.items():
            rows.sort(key=lambda row: row["month"])
            churned = [i for i, row in enumerate(rows) if row["churned_end_month"] == "1"]
            self.assertLessEqual(len(churned), 1, cust)
            if churned:
                self.assertEqual(churned[0], len(rows)-1, cust)

    def test_06_no_negative_mrr_or_out_of_range_features(self):
        self.assertTrue(all(int(r["mrr_cents"]) > 0 for r in self.customers))
        for r in self.observations:
            self.assertGreaterEqual(int(r["tenure_months"]), 0)
            self.assertTrue(0 <= int(r["tickets_last30d"]) <= 5)
            self.assertTrue(0 <= int(r["inactive_days_last30d"]) <= 30)
            self.assertTrue(0 <= int(r["late_invoices_last90d"]) <= 2)
            self.assertIn(r["churned_end_month"], ("0", "1"))

    def test_07_months_cover_18_periods(self):
        months = [r["month"] for r in self.metrics["monthly"]]
        self.assertEqual(len(months), 18)
        self.assertEqual(months[0], "2025-01")
        self.assertEqual(months[-1], "2026-06")

    def test_08_independent_event_reconciliation(self):
        churn = sum(int(r["churned_end_month"]) for r in self.observations)
        self.assertEqual(churn, self.metrics["overview"]["churn_events"])
        self.assertEqual(len(self.observations), self.metrics["overview"]["customer_months"])
        self.assertAlmostEqual(churn/len(self.observations), self.metrics["overview"]["event_rate"], places=5)

    def test_09_mrr_lost_is_contractual_not_cash(self):
        fees = {c["customer_id"]: int(c["mrr_cents"]) for c in self.customers}
        lost = sum(fees[r["customer_id"]] for r in self.observations if r["churned_end_month"] == "1")
        self.assertEqual(lost, self.metrics["overview"]["lost_mrr_cents"])
        self.assertIn("NÃO perda financeira realizada", self.metrics["metadata"]["financial_definition"])

    def test_10_monthly_sql_reconciles_independent_counts(self):
        monthly = defaultdict(lambda: [0, 0])
        for row in self.observations:
            monthly[row["month"]][0] += 1
            monthly[row["month"]][1] += int(row["churned_end_month"])
        for item in self.metrics["monthly"]:
            active, churn = monthly[item["month"]]
            self.assertEqual(item["active_start"], active)
            self.assertEqual(item["churned"], churn)
            self.assertEqual(item["retained_end"], active - churn)
            self.assertAlmostEqual(item["churn_rate"], churn/active, places=5)

    def test_11_plan_month_sums_to_monthly(self):
        groups = defaultdict(list)
        for row in self.metrics["by_plan_month"]:
            groups[row["month"]].append(row)
        for item in self.metrics["monthly"]:
            groups_month = groups[item["month"]]
            self.assertEqual(len(groups_month), 3)
            self.assertEqual(sum(x["active_start"] for x in groups_month), item["active_start"])
            self.assertEqual(sum(x["churned"] for x in groups_month), item["churned"])
            self.assertEqual(sum(x["lost_mrr_cents"] for x in groups_month), item["lost_mrr_cents"])

    def test_12_cohort_retention_is_monotonic_and_age_zero_is_full(self):
        groups = defaultdict(list)
        for row in self.metrics["cohorts"]:
            groups[row["cohort"]].append(row)
        self.assertTrue(groups)
        for cohort, rows in groups.items():
            rows.sort(key=lambda r:r["age_months"])
            self.assertEqual(rows[0]["age_months"], 0)
            self.assertEqual(rows[0]["active_start"], rows[0]["cohort_size"])
            self.assertEqual(rows[0]["retention_rate"], 1.0)
            for previous, current in zip(rows, rows[1:]):
                self.assertLessEqual(current["active_start"], previous["active_start"], cohort)

    def test_13_temporal_split_and_no_future_feature(self):
        conn = database(ROOT / "data")
        try:
            data = sample_rows(conn)
        finally:
            conn.close()
        splits = split_samples(data)
        self.assertTrue(all(r["month"] <= "2025-12" for r in splits["train"]))
        self.assertTrue(all("2026-01" <= r["month"] <= "2026-03" for r in splits["validation"]))
        self.assertTrue(all("2026-04" <= r["month"] <= "2026-06" for r in splits["test"]))
        self.assertEqual(sum(len(v) for v in splits.values()), len(data))
        self.assertFalse(any("future" in x or "churn" in x for x in self.card["features"]))
        self.assertEqual(len(vector(data[0])), len(self.card["features"])+1)

    def test_14_model_metrics_are_finite_and_traceable(self):
        self.assertEqual(self.card["label"], "churned_end_month")
        for name, part in self.card["metrics"].items():
            self.assertGreater(part["rows"], 0, name)
            self.assertGreater(part["churn_events"], 0, name)
            self.assertTrue(0 <= part["event_rate"] <= 1)
            self.assertTrue(0 <= part["auc_roc"] <= 1)
            self.assertTrue(0 <= part["brier_score"] <= 1)
            self.assertTrue(0 <= part["baseline_brier_train_prevalence"] <= 1)

    def test_15_auc_rank_sanity(self):
        self.assertEqual(auc_rank([0,1],[0.1,0.9]), 1.0)
        self.assertEqual(auc_rank([1,0],[0.1,0.9]), 0.0)
        self.assertEqual(auc_rank([0,1],[0.5,0.5]), 0.5)
        self.assertIsNone(auc_rank([0,0],[0.1,0.9]))

    def test_16_generator_reproduces_versioned_source_byte_for_byte(self):
        with TemporaryDirectory(prefix="churnlab-generate-") as tmp:
            generate(Path(tmp), SEED, CUSTOMER_COUNT)
            for name in ("customers.csv", "monthly_observations.csv"):
                expected = (ROOT / "data" / name).read_bytes()
                actual = (Path(tmp) / name).read_bytes()
                self.assertEqual(sha256(actual).digest(), sha256(expected).digest(), name)

    def test_17_pipeline_recreates_metrics_and_model_card(self):
        with TemporaryDirectory(prefix="churnlab-pipeline-") as tmp:
            with TemporaryDirectory(prefix="churnlab-output-") as out:
                generate(Path(tmp), SEED, CUSTOMER_COUNT)
                metrics, card = pipeline(Path(tmp), Path(out))
                self.assertEqual(metrics, self.metrics)
                self.assertEqual(card, self.card)
                self.assertEqual((Path(out)/"metrics.json").read_bytes(), (ROOT/"metrics.json").read_bytes())
                self.assertEqual((Path(out)/"model_card.json").read_bytes(), (ROOT/"model_card.json").read_bytes())

    def test_18_no_customer_level_data_in_published_aggregates(self):
        metrics_text = (ROOT/"metrics.json").read_text(encoding="utf-8")
        card_text = (ROOT/"model_card.json").read_text(encoding="utf-8")
        self.assertNotIn('"customer_id"', metrics_text)
        self.assertNotIn('"customer_id"', card_text)
        self.assertNotIn("C00001", metrics_text+card_text)

    def test_19_split_baseline_compares_brier_without_unsupported_claims(self):
        metrics = self.card["metrics"]
        self.assertGreater(metrics["test"]["rows"], 100)
        self.assertGreater(metrics["validation"]["rows"], 100)
        self.assertIsInstance(metrics["test"]["lift_top_10pct"], float)
        self.assertIn("Dados e mecanismo de churn inteiramente sintéticos.", self.card["limits"])


if __name__ == "__main__":
    unittest.main()
