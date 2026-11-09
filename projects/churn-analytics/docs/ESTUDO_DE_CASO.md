# ChurnLab V2 — estudo de caso reproduzível de cancelamento

## Situação de partida

O estudo anterior de Churn não tem mais o arquivo tabular de origem nem seu PBIX original. Portanto, esta entrega é **outra implementação**, com dados gerados do zero, fórmulas documentadas e um pipeline que qualquer entrevistador pode reproduzir sem licença, login ou API.

## Perguntas demonstrativas

1. Qual a taxa mensal de cancelamento com denominador bem definido?
2. Quais planos representam mais **exposições** e cancelamentos dentro de um intervalo?
3. Como observar retenção das coortes adquiridas entre janeiro e dezembro de 2025?
4. Qual valor de MRR **contratual** está associado aos cancelamentos fictícios?
5. O experimento preditivo baseado em sinais anteriores ao desfecho se comporta melhor do que uma constante de prevalência **neste gerador artificial**?

## Pipeline construído

\`gerador Python → customers.csv + monthly_observations.csv → SQLite + consultas SQL → metrics.json → dashboard HTML/JS\`.

Em paralelo: \`SQLite → regressão logística Python padrão → model_card.json → painel de avaliação\`.

A mesma seed fixa \`20261108\` reproduz os CSVs, métricas e modelo. O CI verifica essas saídas e as regras do projeto. Os dados não têm informações pessoais reais.

## Resultado descritivo: somente simulação

Foram gerados **1.800 clientes**, **13.525 exposições cliente-mês** e **1.130 eventos de cancelamento** entre jan/2025 e jun/2026. A taxa agregada é:

\[
\text{Churn agregado por exposição}=\frac{1.130}{13.525}=8,3549\%.
\]

O total financeiro é **R$ 118.360,00 de mensalidades contratuais associadas a saídas simuladas**, sem prova de recebimento, perda efetiva, LTV ou receita anualizada. O gráfico por mês permite verificar proporções e os diferentes denominadores.

## Exposição versus cliente único

Um cliente pode aparecer em vários meses até cancelar. Isso é **correto** para uma métrica mensal por base em risco, mas exige dizer que a taxa agregada usa 13.525 **clientes-mês**, não 1.800 clientes únicos como denominador. A soma de percentuais mensais é incorreta; utilizar \`SUM(churned) / SUM(active_start)\`.

## Coortes de aquisição

O gráfico de coortes agrupa cadastros por mês de aquisição **dentro** da janela observada e divide os clientes ativos no começo de cada idade da coorte pelo tamanho inicial. Só existe saída definitiva, sem reativação. Coortes anteriores a jan/2025 não têm observação de churn desde a adesão e foram excluídas desse gráfico para evitar falsa interpretação.

## Variáveis e associação

No início de cada mês são definidas: tempo desde adesão, chamados dos 30 dias anteriores, dias de inatividade anteriores, faturas atrasadas nos 90 dias anteriores, plano, canal e mensalidade sintética. O churn é gerado no fim do mês segundo uma fórmula probabilística *artificial*.

A leitura de grupos por inatividade pode produzir diferenças, mas **não demonstra causalidade nem o efeito de uma campanha de reativação**.

## Experimento preditivo controlado

Regressão logística em Python puro, sem dependência de scikit-learn; treino de jan-dez/2025, validação jan-mar/2026, teste final abr-jun/2026, sem ajuste pelo teste. A métrica observada no corte final sintético foi:

| Indicador | Resultado sobre dados artificiais |
| --- | ---: |
| Exposições no teste | 2.193 |
| Cancelamentos no teste | 178 |
| Taxa de churn do teste | 8,1167% |
| AUC ROC | 0,7034 |
| Brier score do modelo | 0,070735 |
| Brier score baseline | 0,074589 |
| Precisão do decil superior | 23,18% |
| Lift do decil superior | 2,8561× |

**Limite:** o mecanismo que gerou o label é conhecido e artificial. Não há evidência de previsão de clientes reais nem otimização de estratégias de retenção. Um mesmo ID aparece em mais de um período, então o experimento é longitudinal com dependência entre linhas.

## Validação e valor para recrutadores

- SQL: agregações, joins, chaves, taxas, coortes e qualidade.
- Python: geração reproduzível, SQLite, scripts, regressão sem bibliotecas externas.
- Frontend: filtros acessíveis e visualização responsiva, lendo somente agregados.
- Metodologia: label temporal, baseline, métricas apropriadas, limites de interpretação.
- Reprodutibilidade: testes automáticos verificam CSV, JSON, SQL e painel.

**Lição central:** um projeto é mais forte quando permite verificar hipóteses, numerador, denominador, premissas e limitações. Este substitui o antigo estudo *no portfólio*, mas **não recupera suas métricas ou o PBIX**.

[Arquitetura](ARQUITETURA.md) · [Evidências](EVIDENCIAS.md) · [Entrevista](ENTREVISTA_TECNICA.md).
