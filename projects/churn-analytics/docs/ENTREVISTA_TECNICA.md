# ChurnLab — 15 perguntas técnicas para entrevistas de Analista de Dados/Python/BI

As respostas abaixo são baseadas **nesta nova implementação sintética**. O projeto antigo de Power BI não foi recuperado. O candidato deve saber explicar o código, as decisões, suas próprias contribuições e qualquer apoio recebido de ferramentas.

## 1. O que é churn no estudo?
É um cliente ativo no início do mês que tem `churned_end_month=1` no fim. A taxa do mês é `SUM(churned)/COUNT(clientes ativos no início)`. [SQL](../sql/monthly.sql).

## 2. Por que 13.525 clientes-mês não significam 13.525 clientes?
Porque a mesma pessoa fictícia pode aparecer em meses sucessivos enquanto ativa. A base contém **1.800 IDs diferentes**; 13.525 são exposições ao cancelamento. **Estudar:** grão da fato e denominador de KPI.

## 3. Por que a taxa total é 8,3549%, e como é calculada?
É `1130 / 13525` = 8,3549%, arredondada; uma taxa **ponderada por exposições**, e não média simples das taxas dos 18 meses.

## 4. Como garante que os dados não são reais?
`src/generate.py` constrói todos os valores com seed fixa, canais/planos predeterminados e IDs artificiais. Não lê sistemas, planilhas antigas, contas ou dados pessoais. [Gerador](../src/generate.py).

## 5. Qual modelo de dados foi usado?
SQLite com `customers` (chave primária `customer_id`) e `monthly_observations` (PK composta `customer_id + month`, FK para customers). CHECKs limitam taxas e domínios. [Schema](../sql/schema.sql).

## 6. Como o SQL calcula MRR associado a cancelamentos?
`SUM(churned_end_month * mrr_cents)` usando JOIN à dimensão de clientes. O total fictício é R$ 118.360,00. **Não equivale** a perda de caixa, faturamento real ou receita anual perdida.

## 7. Por que observar coortes de aquisição?
A coorte permite analisar retenção pelo número de meses desde a entrada e comparar cadastros com a mesma idade de relacionamento, em vez de confundir períodos corridos com tempo de vida. [SQL](../sql/cohorts.sql).

## 8. Por que excluir coortes anteriores a janeiro/2025?
A simulação passa a observar desfechos mensais em janeiro/2025. Clientes cadastrados antes não têm a trajetória completa desde a adesão, o que causa **censura/truncamento à esquerda**.

## 9. O que impede “ressuscitar” um cliente que cancelou?
O gerador interrompe o loop mensal quando `churned=1`, e o teste exige no máximo um cancelamento e nenhuma observação posterior. [Teste](../tests/test_project.py).

## 10. Qual é a diferença entre o dashboard e o pipeline?
Python/SQLite geram e agregam as métricas. JavaScript lê os **agregados JSON** e aplica filtros visuais por plano/mês, sem acessar um banco em produção. O navegador não treina o modelo e não executa SQL.

## 11. Qual a estratégia para evitar label leakage?
Variáveis como `inactive_days_last30d`, `tickets_last30d` e inadimplência são geradas como observadas no início do mês. O rótulo é o cancelamento ao fim; a lista de features não inclui `churned_end_month`. **Estudar:** tempo de disponibilidade real das variáveis.

## 12. Por que foi escolhido um split temporal?
Para simular o uso de informações passadas para eventos futuros: treino 2025, validação Q1/2026, teste final Q2/2026. **Cuidado:** o mesmo ID pode aparecer em mais de um período, então as linhas não são amostras independentes.

## 13. AUC ROC de 0,7034 significa 70,34% de acerto?
**Não.** AUC mede ordenação relativa de classes; acurácia depende de limiar. O valor foi calculado numa base **programada artificialmente**, sem validação externa.

## 14. Qual a utilidade de Brier e lift?
Brier mede erro de probabilidade; no teste sintético foi 0,070735 contra 0,074589 da referência constante. Lift de ~2,86× indica concentração relativa de saídas na faixa de maior score **desse dataset**, não economia ou eficácia de campanha.

## 15. O que faria antes de trabalhar com dados reais?
Verificaria autorização e LGPD, qualidade e datas de disponibilidade, definição de churn, censura de coortes, split por cliente/tempo, viés de seleção, custos de falsos positivos/negativos, justiça, segurança e validação prospectiva. Testaria SQL e mediria desempenho sem inventar ROI.

---

## Treino para apresentar o projeto

Em três minutos, abra [o dashboard](../index.html), filtre o plano, mostre `sql/monthly.sql`, explique o número de exposições e abra `model_card.json`. Termine explicando duas limitações: **base original perdida** e **resultado do modelo só sintético**. O valor do case está na rastreabilidade e na qualidade analítica.

[Estudo de caso](ESTUDO_DE_CASO.md) · [Roteiro](ROTEIRO_DEMO.md).
