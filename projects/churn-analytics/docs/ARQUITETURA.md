# ChurnLab — arquitetura técnica

**Implantação atual:** apenas arquivos estáticos no GitHub Pages; o processamento Python/SQLite roda offline em CI ou na máquina do avaliador. Nenhum backend, cliente ou classificador é executado no servidor público.

## Visão geral baseada nos módulos versionados

~~~mermaid
flowchart LR
  SEED[Seed 20261108 + parâmetros fictícios] --> GEN[src/generate.py]
  GEN --> CUSTOMERS[data/customers.csv]
  GEN --> OBS[data/monthly_observations.csv]
  CUSTOMERS --> ETL[src/pipeline.py]
  OBS --> ETL
  SCHEMA[sql/schema.sql] --> ETL
  ETL --> DB[(SQLite em memória)]
  QUERIES[sql/*.sql] --> DB
  DB --> AGG[metrics.json - somente agregados]
  DB --> MODEL[src/model.py]
  MODEL --> CARD[model_card.json - métricas e pesos]
  AGG --> JS[metrics.mjs + app.mjs]
  CARD --> JS
  JS --> WEB[HTML/CSS/SVG - GitHub Pages]
  GEN --> QA[Testes Python: regeneração e consistência]
  ETL --> QA
  AGG --> QA
  JS --> TESTJS[Testes JS: filtros e denominadores]
  QA --> CI[GitHub Actions]
  TESTJS --> CI
~~~

## Modelo de dados

~~~mermaid
erDiagram
  customers ||--o{ monthly_observations : customer_id
  customers {
    string customer_id PK
    string signup_month
    string plan
    string segment
    string channel
    string state
    int mrr_cents
  }
  monthly_observations {
    string customer_id PK,FK
    string month PK
    int tenure_months
    int tickets_last30d
    int inactive_days_last30d
    int late_invoices_last90d
    int churned_end_month
  }
~~~

**Granularidade:** uma observação por cliente **ativo no início** de cada mês. A chave composta `(customer_id, month)` evita repetição. Há restrição FK e um cancelamento por cliente, após o qual o gerador não emite novas observações.

## Definição temporal sem vazamento direto

~~~mermaid
sequenceDiagram
  actor S as Cliente fictício
  participant F as Features do início do mês
  participant G as Gerador de evento sintético
  participant SQL as SQLite / SQL
  S->>F: Plano, tenure, tickets e inatividade anteriores
  F->>G: Estimar propensão artificial
  G-->>SQL: Label churned_end_month após o início
  SQL->>SQL: Agregar cancelamentos por mês e plano
  SQL-->>S: Indicadores históricos sem IDs individuais
~~~

O label **não** entra como variável do classificador. Como todos os resultados são artificiais, isso não equivale a validação prospectiva real.

## Experimento temporal

~~~mermaid
flowchart LR
  TRAIN[2025-01 a 2025-12] --> FIT[Regressão logística sem bibliotecas externas]
  FIT --> VAL[Validação 2026-01 a 2026-03]
  FIT --> TEST[Teste final 2026-04 a 2026-06]
  VAL --> REPORT[Model card: AUC, Brier, lift]
  TEST --> REPORT
~~~

Um mesmo cliente pode ter observações em meses diferentes de train/validation/test. É um **split cronológico**, não separação completa por entidade. Não confundir este experimento com previsão de clientes nunca vistos.

## Fluxo de atualização

1. Gerar CSVs determinísticos (Python padrão) no CI de uma branch, sob permissão limitada.
2. Executar SQLite, SQL e classificador, exportando JSON agregado + model card.
3. Executar os testes Python e Node; conferir regeneração byte a byte em arquivos temporários.
4. Revisar diff para assegurar que os outputs são exclusivamente artificiais.
5. Integrar ao GitHub Pages; dashboard apenas lê `metrics.json` e `model_card.json`.

[Auditoria](AUDITORIA.md) · [SQL](../sql) · [Dicionário](DICIONARIO_DE_DADOS.md).
