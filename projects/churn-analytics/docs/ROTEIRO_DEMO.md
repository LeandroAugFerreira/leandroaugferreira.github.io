# ChurnLab — apresentação de 3 minutos

## 00:00–00:25 · Origem e transparência

Abrir [dashboard ChurnLab](https://leandroaugferreira.github.io/projects/churn-analytics/).

“Eu havia desenvolvido uma análise de churn, mas os arquivos e o PBIX originais foram perdidos. Por isso construí um **novo projeto do zero**, com dados sintéticos reprodutíveis, para demonstrar Python, SQL, análise de coortes e métricas de classificação.”

## 00:25–00:55 · KPI e denominador

No dashboard, mostrar 1.800 clientes únicos, 13.525 clientes-mês, 1.130 cancelamentos e churn ponderado 8,35%.

“Uma exposição cliente-mês não é um cliente único. Minha taxa no intervalo é cancelamentos divididos pela soma de clientes ativos no começo de cada mês, não a média simples das porcentagens.”

## 00:55–01:25 · SQL e integridade

Abrir [sql/monthly.sql](../sql/monthly.sql) e [schema](../sql/schema.sql).

“Carrego dois CSVs sintéticos em SQLite, com chave composta para observações mensais, FK para clientes e SQL para churn, receita contratual associada às saídas, plano e coorte. Um teste garante que nenhum cliente aparece depois de cancelar.”

## 01:25–01:55 · Segmentação e coortes

Trocar plano ou período, mostrar coortes 2025 e a análise de inatividade.

“Comparações são associações **do gerador**. Não afirmo que inatividade causa churn nem que alguma campanha reduziria essas taxas.”

## 01:55–02:30 · Experimento preditivo

Abrir a seção de modelo e [model card](MODEL_CARD.md).

“Implementei uma regressão logística em Python, com treino 2025, validação Q1/2026 e teste Q2/2026. O resultado sintético de teste foi AUC 0,7034 e Brier 0,070735 versus baseline 0,074589. Isso não demonstra precisão no mercado real.”

## 02:30–03:00 · Testes e próximos passos

Abrir [GitHub Actions](https://github.com/LeandroAugFerreira/leandroaugferreira.github.io/actions/workflows/churnlab.yml) e [testes Python](../tests/test_project.py).

“O CI regenera CSV e JSON com seed fixa, verifica SQL, testes e o corte temporal. Se recebesse dados reais autorizados, priorizaria definição de churn e modelo por coorte, verificação de vazamento e avaliação em produção; não inventaria ganhos de retenção.”

## Respostas a objeções

- *“É o antigo Power BI?”* Não. É um projeto novo; o PBIX/CSV antigos não foram recuperados.
- *“Os dados são reais?”* Não, clientes e cancelamentos são inteiramente fictícios.
- *“AUC 0,70 significa 70% de acerto?”* Não. AUC é ordenação, sem limiar.
- *“O MRR perdido foi dinheiro de cliente?”* Não. É soma contratual artificial dos clientes que cancelaram.
- *“Existe backend para enviar dados?”* Não; o dashboard é estático, com JSON agregados, e não recebe uploads.

[15 perguntas](ENTREVISTA_TECNICA.md) · [Auditoria](AUDITORIA.md).
