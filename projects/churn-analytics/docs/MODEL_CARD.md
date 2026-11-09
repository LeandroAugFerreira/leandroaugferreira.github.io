# ChurnLab — model card do experimento preditivo

**Finalidade:** demonstração técnica de avaliação temporal em dados sintéticos. **Não usar este modelo para classificar ou tomar decisões sobre clientes reais.**

## Dados e rótulo

O gerador cria 1.800 clientes fictícios e 13.525 linhas de observação mensal de 2025-01 a 2026-06. O rótulo `churned_end_month` indica um cancelamento artificial ao fim do mês.

Variáveis em `src/model.py` (conhecidas **antes** do rótulo): tenure, chamados últimos 30 dias, dias sem atividade últimos 30, faturas atrasadas últimos 90, indicadores de plano/canal e mensalidade artificial.

O mecanismo de rótulo é uma função logística sintética, com risco latente não observado. Assim, a habilidade do modelo de capturar associações **não indica** precisão para pessoas ou mercados reais.

## Modelo e separação

- **Algoritmo:** regressão logística implementada com gradiente em Python puro (sem pandas, numpy ou scikit-learn), 175 iterações, taxa de aprendizado 1,9, regularização L2 de 0,001.
- **Treino:** janeiro–dezembro/2025; prevalência no treino 8,4229%.
- **Validação:** janeiro–março/2026.
- **Teste final:** abril–junho/2026. Os parâmetros fixos não foram selecionados com base no teste.
- **Baseline:** probabilidade constante igual à prevalência observada **somente no treino**, para comparação de Brier score.

## Resultados observados no conjunto artificial

| Corte | Observações | Churn | AUC ROC | Brier modelo | Brier baseline | Lift top 10% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Treino | 9.118 | 768 | 0,72964 | 0,071748 | 0,077134 | 3,1894 |
| Validação | 2.214 | 184 | 0,70996 | 0,072187 | 0,076202 | 2,6558 |
| Teste final | 2.193 | 178 | 0,70340 | 0,070735 | 0,074589 | 2,8561 |

No teste, a taxa observada foi 178/2.193 ≈ 8,12%. A precisão entre as 10% observações com maior risco artificial foi ≈ 23,18%. Os registros de teste são **exposições cliente-mês**, não clientes únicos. A avaliação pode ter dependência por repetição do mesmo cliente em meses de cortes diferentes.

## O que estas métricas significam

- **AUC ROC:** quão bem o modelo ordena casos positivos e negativos deste dataset sintético; não equivale a “70,34% de acerto”.
- **Brier score:** média do erro quadrático nas probabilidades, menor é melhor. Comparado aqui a uma constante calculada do treino.
- **Lift top 10%:** razão entre frequência de churn no decil artificial de maior score e taxa base do conjunto de teste. **Não** é economia ou efeito de campanha.
- Não houve escolha de limiar operacional, validação prospectiva, fair lending, experimento A/B, custo-benefício ou monitoramento pós-deploy.

## Limitações e riscos

1. Dados fictícios e fórmula geradora criada pelo projeto; sem validade externa.
2. Um cliente pode aparecer em treino e teste em meses diferentes; correlação intracliente impede tratar 2.193 linhas como 2.193 pessoas independentes.
3. Coortes antigas podem sofrer censura à esquerda antes da janela observada.
4. Canais/planos e inatividade foram gerados com pressupostos arbitrários. As métricas não demonstram que essas características causam cancelamentos.
5. Não há atributos sensíveis, mas um dataset real exigiria revisão de privacidade, consentimento, justiça e governança.
6. A geração não modela intervenções, preços promocionais reais, renegociações, churn involuntário ou retornos de clientes.

## Para reproduzir

~~~bash
python -m src.generate
python -m src.pipeline
python -m unittest discover -s tests -v
~~~

O arquivo [model_card.json](../model_card.json) é gerado automaticamente e contém parâmetros, coeficientes e métricas. Nunca editar apenas o valor de AUC na interface: regenerar e validar os snapshots.

[Estudo de caso](ESTUDO_DE_CASO.md) · [Arquitetura](ARQUITETURA.md) · [Código do modelo](../src/model.py).
