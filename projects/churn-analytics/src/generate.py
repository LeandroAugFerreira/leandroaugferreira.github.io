"""Geração determinística de clientes e eventos 100% FICTÍCIOS.

Não lê fontes particulares, não usa IA generativa e não simula resultados reais.
A linha mensal observa características do INÍCIO do mês; churn é o desfecho
registrado ao FIM do mesmo mês, para evitar leakage temporal direto.
"""
from __future__ import annotations
import argparse
import csv
import json
import math
import random
from pathlib import Path

SEED = 20261108
CUSTOMER_COUNT = 1800
START_OBS = 12   # 2025-01, índice contado desde 2024-01
END_OBS = 29     # 2026-06
ROOT = Path(__file__).resolve().parents[1]

CUSTOMER_COLUMNS = ["customer_id", "signup_month", "plan", "segment", "channel", "state", "mrr_cents"]
OBS_COLUMNS = [
    "customer_id", "month", "tenure_months", "tickets_last30d",
    "inactive_days_last30d", "late_invoices_last90d", "churned_end_month",
]


def ym(index: int) -> str:
    return f"{2024 + index // 12:04d}-{index % 12 + 1:02d}"


def choice(rng, options, probabilities):
    return rng.choices(options, weights=probabilities, k=1)[0]


def rows(seed=SEED, customers_count=CUSTOMER_COUNT):
    rng = random.Random(seed)
    customers, observations = [], []
    for i in range(1, customers_count + 1):
        customer_id = f"C{i:05d}"
        signup = rng.randrange(0, END_OBS + 1)
        plan = choice(rng, ["Essencial", "Pro", "Equipe"], [52, 33, 15])
        segment = choice(rng, ["Individual", "Microempresa", "Pequena empresa"], [54, 31, 15])
        channel = choice(rng, ["Orgânico", "Anúncios", "Indicação"], [44, 31, 25])
        state = choice(rng, ["SP", "MG", "RJ", "PR"], [50, 22, 16, 12])
        fee = {"Essencial": 5900, "Pro": 12900, "Equipe": 26900}[plan]
        fee += rng.choice([0, 0, 0, 1000, 2000])
        customer = {
            "customer_id": customer_id,
            "signup_month": ym(signup),
            "plan": plan,
            "segment": segment,
            "channel": channel,
            "state": state,
            "mrr_cents": fee,
        }
        customers.append(customer)
        latent = rng.uniform(-0.7, 0.7)

        for month_index in range(max(signup, START_OBS), END_OBS + 1):
            tenure = month_index - signup
            tickets = sum(rng.random() < (0.18 + (0.05 if plan == "Essencial" else 0)) for _ in range(5))
            late_invoices = sum(rng.random() < (0.08 + (0.05 if channel == "Anúncios" else 0)) for _ in range(2))
            inactivity = min(30, max(0, int(
                rng.random() ** 1.4 * 26
                + (4 if plan == "Essencial" else 0)
                + (4 if late_invoices else 0)
                - (3 if plan == "Equipe" else 0)
            )))
            # Mecanismo sintético de propensão, sem calibração empírica.
            log_odds = (
                -4.2
                + 0.065 * inactivity
                + 0.35 * tickets
                + 0.75 * late_invoices
                + (0.28 if tenure <= 2 else 0)
                + (0.25 if plan == "Essencial" else 0)
                + (0.25 if channel == "Anúncios" else 0)
                - (0.22 if plan == "Equipe" else 0)
                + 0.30 * latent
            )
            p_cancel = 1 / (1 + math.exp(-log_odds))
            churned = int(rng.random() < p_cancel)
            observations.append({
                "customer_id": customer_id,
                "month": ym(month_index),
                "tenure_months": tenure,
                "tickets_last30d": tickets,
                "inactive_days_last30d": inactivity,
                "late_invoices_last90d": late_invoices,
                "churned_end_month": churned,
            })
            if churned:
                break

    observations.sort(key=lambda r: (r["month"], r["customer_id"]))
    return customers, observations


def save_csv(path: Path, fieldnames: list[str], source):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(source)


def generate(output: Path, seed=SEED, customers_count=CUSTOMER_COUNT):
    customers, observations = rows(seed, customers_count)
    save_csv(output / "customers.csv", CUSTOMER_COLUMNS, customers)
    save_csv(output / "monthly_observations.csv", OBS_COLUMNS, observations)
    return {
        "seed": seed, "synthetic": True, "customers": len(customers),
        "customer_months": len(observations),
        "churn_events": sum(r["churned_end_month"] for r in observations),
        "observation_window": [ym(START_OBS), ym(END_OBS)],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gerar dataset ChurnLab integralmente sintético")
    parser.add_argument("--output", type=Path, default=ROOT / "data")
    parser.add_argument("--seed", type=int, default=SEED)
    parser.add_argument("--customers", type=int, default=CUSTOMER_COUNT)
    args = parser.parse_args()
    print(json.dumps(generate(args.output, args.seed, args.customers), ensure_ascii=False, indent=2))
