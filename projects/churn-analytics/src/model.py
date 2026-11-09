"""Experimento temporal ilustrativo: regressão logística em Python puro.

Treino: 2025; validação: jan-mar/2026; teste final: abr-jun/2026.
As features são observadas no começo do mês, antes do desfecho.
Não substitui validação prospectiva com clientes reais.
"""
from __future__ import annotations
import math
import sqlite3

FEATURE_NAMES = [
    "tenure_months/24", "tickets_last30d/5", "inactive_days_last30d/30",
    "late_invoices_last90d/2", "plan_essencial", "plan_equipe",
    "channel_ads", "mrr_cents/30000",
]
ITERATIONS = 175
LEARNING_RATE = 1.9
REGULARIZATION = 0.001


def sigmoid(value):
    value = max(-30.0, min(30.0, value))
    return 1.0 / (1.0 + math.exp(-value))


def vector(row):
    return [
        1.0,
        min(int(row["tenure_months"]), 24) / 24.0,
        int(row["tickets_last30d"]) / 5.0,
        int(row["inactive_days_last30d"]) / 30.0,
        int(row["late_invoices_last90d"]) / 2.0,
        float(row["plan"] == "Essencial"),
        float(row["plan"] == "Equipe"),
        float(row["channel"] == "Anúncios"),
        int(row["mrr_cents"]) / 30000.0,
    ]


def sample_rows(connection: sqlite3.Connection):
    return [dict(row) for row in connection.execute("""
        SELECT o.month, o.customer_id, o.tenure_months, o.tickets_last30d,
               o.inactive_days_last30d, o.late_invoices_last90d,
               o.churned_end_month, c.plan, c.channel, c.mrr_cents
        FROM monthly_observations o
        JOIN customers c USING (customer_id)
        ORDER BY o.month, o.customer_id
    """)]


def split_samples(rows):
    return {
        "train": [r for r in rows if r["month"] <= "2025-12"],
        "validation": [r for r in rows if "2026-01" <= r["month"] <= "2026-03"],
        "test": [r for r in rows if "2026-04" <= r["month"] <= "2026-06"],
    }


def fit(train_rows):
    if not train_rows:
        raise ValueError("Treino temporal sem observações.")
    n = len(train_rows)
    prevalence = sum(int(r["churned_end_month"]) for r in train_rows) / n
    if not 0 < prevalence < 1:
        raise ValueError("Treino precisa conter duas classes.")
    weights = [math.log(prevalence / (1.0 - prevalence))] + [0.0] * len(FEATURE_NAMES)
    examples = [(vector(r), int(r["churned_end_month"])) for r in train_rows]
    for _ in range(ITERATIONS):
        grad = [0.0] * len(weights)
        for x, y in examples:
            p = sigmoid(sum(a * b for a, b in zip(weights, x)))
            error = p - y
            for j, xj in enumerate(x):
                grad[j] += error * xj
        for j in range(len(weights)):
            penalty = 0.0 if j == 0 else REGULARIZATION * weights[j]
            weights[j] -= LEARNING_RATE * (grad[j] / n + penalty)
    return weights, prevalence


def auc_rank(labels, scores):
    """AUC ROC com empates por posto médio; não depende de sklearn."""
    n = len(labels)
    positives = sum(labels)
    negatives = n - positives
    if positives == 0 or negatives == 0:
        return None
    pairs = sorted(zip(scores, labels), key=lambda x: x[0])
    positive_ranks = 0.0
    i = 0
    while i < n:
        j = i + 1
        while j < n and pairs[j][0] == pairs[i][0]:
            j += 1
        average_rank = (i + 1 + j) / 2.0
        positive_ranks += average_rank * sum(label for _, label in pairs[i:j])
        i = j
    return (positive_ranks - positives * (positives + 1) / 2.0) / (positives * negatives)


def evaluate(rows, weights, train_rate):
    labels = [int(row["churned_end_month"]) for row in rows]
    scores = [
        sigmoid(sum(w * x for w, x in zip(weights, vector(row))))
        for row in rows
    ]
    n = len(rows)
    if not n:
        raise ValueError("Corte temporal sem amostras.")
    event_rate = sum(labels) / n
    brier = sum((p - y) ** 2 for p, y in zip(scores, labels)) / n
    baseline_brier = sum((train_rate - y) ** 2 for y in labels) / n
    top_count = max(1, math.ceil(n * 0.1))
    top = sorted(zip(scores, labels), key=lambda pair: pair[0], reverse=True)[:top_count]
    precision_at_10 = sum(y for _, y in top) / top_count
    return {
        "rows": n,
        "churn_events": sum(labels),
        "event_rate": round(event_rate, 6),
        "auc_roc": None if auc_rank(labels, scores) is None else round(auc_rank(labels, scores), 5),
        "brier_score": round(brier, 6),
        "baseline_brier_train_prevalence": round(baseline_brier, 6),
        "precision_at_top_10pct": round(precision_at_10, 6),
        "lift_top_10pct": round(precision_at_10 / event_rate, 4) if event_rate else None,
    }


def experiment(connection):
    rows = sample_rows(connection)
    partitions = split_samples(rows)
    weights, prior = fit(partitions["train"])
    result = {
        "synthetic": True,
        "not_for_decisions": True,
        "algorithm": "Regressão logística manual (biblioteca padrão Python)",
        "features": FEATURE_NAMES,
        "label": "churned_end_month",
        "feature_timing": "início do mês; desfecho no fim",
        "split": {
            "train": "2025-01 a 2025-12",
            "validation": "2026-01 a 2026-03",
            "test": "2026-04 a 2026-06",
        },
        "hyperparameters": {
            "iterations": ITERATIONS,
            "learning_rate": LEARNING_RATE,
            "l2_regularization": REGULARIZATION,
        },
        "train_prevalence": round(prior, 6),
        "metrics": {
            key: evaluate(partitions[key], weights, prior)
            for key in ("train", "validation", "test")
        },
        "coefficients": [round(v, 6) for v in weights],
        "limits": [
            "Dados e mecanismo de churn inteiramente sintéticos.",
            "Clientes podem reaparecer em meses de diferentes cortes; há dependência longitudinal.",
            "AUC e lift do dataset artificial não comprovam previsão em clientes reais.",
            "Sem otimização de limiar, comparação de intervenção, medição causal ou ROI.",
            "Não contém nomes, gênero, raça, religião, crédito pessoal ou dados sensíveis.",
        ],
    }
    return result
