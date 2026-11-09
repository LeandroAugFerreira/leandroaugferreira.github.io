# ChurnLab — dicionário das bases e medidas

Todos os registros são fictícios e foram gerados com seed 20261108. O período analisado vai de 2025-01 até 2026-06. Datas têm granularidade **mês** (não dia de pagamento).

## Tabela \`customers\` (1 linha por cliente fictício)

| Campo | Significado |
| --- | --- |
| \`customer_id\` | ID sintético, ex. C00001; não corresponde a pessoa real |
| \`signup_month\` | Mês de adesão artificial, podendo iniciar antes da janela observada |
| \`plan\` | Essencial, Pro ou Equipe |
| \`segment\` | Individual, Microempresa, Pequena empresa |
| \`channel\` | Orgânico, Anúncios, Indicação |
| \`state\` | UF fictícia entre SP/MG/RJ/PR |
| \`mrr_cents\` | Mensalidade contratual sintética em centavos, inteira e positiva |

## Tabela \`monthly_observations\` (1 linha por cliente ativo no início do mês)

| Campo | Significado e temporalidade |
| --- | --- |
| \`customer_id\` | FK para customers |
| \`month\` | Período YYYY-MM |
| \`tenure_months\` | Meses entre adesão e início do período |
| \`tickets_last30d\` | Chamados fictícios observados **antes** da decisão de cancelamento |
| \`inactive_days_last30d\` | Dias anteriores sem atividade, 0..30 |
| \`late_invoices_last90d\` | Quantidade de faturas anteriores em atraso, 0..2 |
| \`churned_end_month\` | Label: 1 se cancelou **ao fim** do período; caso contrário 0 |

## Medidas e denominadores

| Indicador | Definição | Unidade |
| --- | --- | --- |
| Clientes ativos no início | COUNT das linhas de um mês | Cliente-mês naquele mês |
| Cancelamentos | SUM(churned_end_month) | Eventos |
| Churn mensal | SUM(churn) / COUNT(obs) no mesmo mês | Percentual |
| Churn no intervalo | SUM(churn) / SUM(obs) entre meses | Percentual ponderado por exposições |
| Retidos ao fim | Ativos no início − cancelamentos | Clientes, sem modelar novas entradas após o início |
| MRR ativo no início | SUM(mrr_cents) em observações do mês | Centavos contratuais |
| MRR associado a saídas | SUM(churned_end_month × mrr_cents) | Centavos contratuais; não caixa |
| Retenção de coorte | Ativos no início da idade da coorte / tamanho inicial | Percentual |
| AUC ROC | Capacidade de ordenação entre exemplos artificiais do teste | 0..1 |
| Brier score | Média do erro quadrático da probabilidade prevista | 0..1; menor é melhor |
| Lift top 10% | Precisão entre top 10% das pontuações / churn observado no teste | Razão |

## Cautelas de denominador

- Não usar **1.800 clientes** para dividir **1.130 saídas / 13.525 exposições**; são medidas distintas.
- Não somar percentuais, comparar sem ponderar a base ou afirmar churn “anual” apenas com soma de meses.
- \`retained_end\` é a base ao fim do mês **entre as pessoas presentes no início**; novas aquisições durante o mês foram incorporadas no snapshot daquele mês pelo gerador.
- O total de MRR associado a cancelamentos de meses diferentes **não é** receita perdida reconhecida, nem projeção de caixa.
- Coortes anteriores à janela observada ficam fora da tabela de retenção de novas adesões.

[Modelo relacional](ARQUITETURA.md) · [SQL](../sql) · [Metodologia](MODEL_CARD.md).
