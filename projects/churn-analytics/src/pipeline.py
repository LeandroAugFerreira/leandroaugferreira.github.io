"""Carrega CSV sintético em SQLite e publica somente métricas agregadas.

Interface:
  python -m src.pipeline --data-dir data --output-dir .
  python -m src.pipeline --db build/churn.sqlite3  # banco local opcional
"""
from __future__ import annotations
import argparse
import csv
import json
import sqlite3
from pathlib import Path

from .model import experiment

ROOT = Path(__file__).resolve().parents[1]


def read_csv(path):
    with path.open(encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def database(data_dir: Path, db_file: Path | None = None):
    if db_file is not None:
        db_file.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(str(db_file) if db_file else ":memory:")
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.executescript((ROOT / "sql" / "schema.sql").read_text(encoding="utf-8"))
    customers = read_csv(data_dir / "customers.csv")
    observations = read_csv(data_dir / "monthly_observations.csv")
    with connection:
        connection.executemany(
            """INSERT INTO customers
            (customer_id,signup_month,plan,segment,channel,state,mrr_cents)
            VALUES (?,?,?,?,?,?,?)""",
            [
                (r["customer_id"], r["signup_month"], r["plan"], r["segment"],
                 r["channel"], r["state"], int(r["mrr_cents"]))
                for r in customers
            ],
        )
        connection.executemany(
            """INSERT INTO monthly_observations
            (customer_id,month,tenure_months,tickets_last30d,
             inactive_days_last30d,late_invoices_last90d,churned_end_month)
             VALUES (?,?,?,?,?,?,?)""",
            [
                (r["customer_id"], r["month"], int(r["tenure_months"]),
                 int(r["tickets_last30d"]), int(r["inactive_days_last30d"]),
                 int(r["late_invoices_last90d"]), int(r["churned_end_month"]))
                for r in observations
            ],
        )
    return connection


def query(connection, filename):
    sql = (ROOT / "sql" / filename).read_text(encoding="utf-8")
    return [dict(r) for r in connection.execute(sql)]


def round_rates(items):
    for row in items:
        for name in list(row):
            if name.endswith("_rate") and row[name] is not None:
                row[name] = round(float(row[name]), 6)
    return items


def summarize(connection):
    monthly = round_rates(query(connection, "monthly.sql"))
    by_plan = round_rates(query(connection, "by_plan_month.sql"))
    by_channel = round_rates(query(connection, "by_channel.sql"))
    cohorts = round_rates(query(connection, "cohorts.sql"))
    signals = round_rates(query(connection, "signals.sql"))
    count_customers = connection.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
    total_exposures = sum(r["active_start"] for r in monthly)
    total_churn = sum(r["churned"] for r in monthly)
    lost_cents = sum(r["lost_mrr_cents"] for r in monthly)
    latest = monthly[-1]
    return {
        "metadata": {
            "project": "ChurnLab — Retenção e Risco",
            "synthetic": True,
            "seed": 20261108,
            "source": "Gerador Python reproduzível, sem dados originais recuperados",
            "time_range": ["2025-01", "2026-06"],
            "customer_count": count_customers,
            "customer_months": total_exposures,
            "definition": "churn mensal = cancelamentos ao fim do mês / base ativa no início",
            "financial_definition": "MRR contratual associado a cancelamentos, NÃO perda financeira realizada",
        },
        "overview": {
            "customer_months": total_exposures,
            "churn_events": total_churn,
            "event_rate": round(total_churn / total_exposures, 6),
            "lost_mrr_cents": lost_cents,
            "latest_month": latest["month"],
            "latest_active_start": latest["active_start"],
            "latest_churned": latest["churned"],
            "latest_monthly_churn_rate": latest["churn_rate"],
        },
        "monthly": monthly,
        "by_plan_month": by_plan,
        "by_channel": by_channel,
        "cohorts": cohorts,
        "signals": signals,
    }


def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
        encoding="utf-8",
    )


def pipeline(data_dir=ROOT / "data", output_dir=ROOT, db_file=None):
    conn = database(Path(data_dir), db_file)
    try:
        metrics = summarize(conn)
        card = experiment(conn)
    finally:
        conn.close()
    write_json(Path(output_dir) / "metrics.json", metrics)
    write_json(Path(output_dir) / "model_card.json", card)
    return metrics, card


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=ROOT / "data")
    parser.add_argument("--output-dir", type=Path, default=ROOT)
    parser.add_argument("--db", type=Path)
    args = parser.parse_args()
    metric, card = pipeline(args.data_dir, args.output_dir, args.db)
    print(json.dumps({
        "synthetic": True,
        "customer_months": metric["overview"]["customer_months"],
        "churn_events": metric["overview"]["churn_events"],
        "test_auc": card["metrics"]["test"]["auc_roc"],
        "test_brier": card["metrics"]["test"]["brier_score"],
    }, ensure_ascii=False, indent=2))
