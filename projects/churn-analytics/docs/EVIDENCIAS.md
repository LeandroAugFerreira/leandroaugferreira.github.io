# ChurnLab — evidências e testes verificáveis

## O que foi executado

O pipeline da branch de reconstrução gera os dados em Python 3.12, carrega em SQLite em memória, executa SQL, treina regressão logística e exporta somente agregados. A execução inicial do GitHub Actions **passou** e versionou `customers.csv`, `monthly_observations.csv`, `metrics.json` e `model_card.json`.

A suíte [tests/test_project.py](../tests/test_project.py) possui **19 testes Python**, cobrindo:

- procedência e seed fixas; ausência de atributos de identificação pessoal;
- unicidade das chaves de cliente e mês e integridade da FK;
- cada cliente cancela no máximo uma vez e não reaparece depois;
- domínio das features, valores contratuais positivos e 18 meses;
- reconciliação independente de 1.130 cancelamentos e 13.525 clientes-mês;
- MRR contratual associado às saídas (R$ 118.360,00), sem classificar como perda de caixa;
- soma dos planos fecha com cada mês, inclusive MRR vinculado;
- retenção de coorte inicia em 100% e não cresce após saídas;
- divisão cronológica dos dados e ausência de label na lista de features;
- métricas de AUC/Brier/lift numéricas e verificáveis;
- geração CSV byte a byte com seed fixa em diretório temporário;
- recriação de `metrics.json` e `model_card.json` byte a byte;
- ausência de IDs de clientes nos JSON publicados de indicadores.

A suíte [tests/ui.test.mjs](../tests/ui.test.mjs) acrescenta **6 testes Node.js** de filtros, taxas ponderadas, soma entre planos e consistência de coortes.

**Total executado na branch:** **25 testes aprovados (19 Python + 6 Node)**, verificados no [GitHub Actions #42547314807](https://github.com/LeandroAugFerreira/leandroaugferreira.github.io/actions/runs/42547314807). A execução final da versão principal será verificada após o merge. A contagem de testes é distinta da geração/pipeline.

## Valores reprodutíveis de referência

| Recurso | Resultado |
| --- | ---: |
| Fonte | 100% sintética, seed 20261108 |
| Clientes criados | 1.800 |
| Observações (clientes-mês) | 13.525 |
| Saídas geradas | 1.130 |
| Churn ponderado | 8,3549% |
| Soma de MRR associado a saídas | R$ 118.360,00 |
| Observações do teste temporal | 2.193 |
| Eventos no teste temporal | 178 |
| AUC ROC do teste | 0,70340 |
| Brier score do teste | 0,070735 |
| Baseline Brier no teste | 0,074589 |

Os números não vieram do projeto antigo; foram gerados e versionados nesta nova análise.

## O que não foi executado nem comprovado

- Recuperação do CSV antigo ou do PBIX antigo.
- Publicação de modelo preditivo para terceiros/produção ou monitoramento de pessoas.
- Power BI Desktop, DAX, Power Query ou SQL de sistema corporativo real.
- Efeitos de campanhas, retenção causal, economia, receita real, ROI, redução de cancelamentos.
- Benchmark de modelo em clientes reais, validação de justiça, auditoria LGPD ou revisão de segurança empresarial.
- A ausência de dados sensíveis se refere às colunas **criadas pelo gerador**, não a uma inspeção de sistemas externos.

## Evidências externas e locais

- [Fonte Python](../src/generate.py) e [pipeline SQL](../src/pipeline.py).
- [Modelo e split](../src/model.py) / [model card JSON](../model_card.json).
- [Testes Python](../tests/test_project.py) e [testes JavaScript](../tests/ui.test.mjs).
- [SQL](../sql), [dicionário](DICIONARIO_DE_DADOS.md), [dashboard](../index.html).
- [Workflow auditável](../../../.github/workflows/churnlab.yml).

Na demonstração pública, os filtros trabalham **somente com agregados**. CSVs de clientes também são públicos para reprodução, mas os registros e IDs são inteiramente artificiais.

[Auditoria](AUDITORIA.md) · [Roteiro](ROTEIRO_DEMO.md).
