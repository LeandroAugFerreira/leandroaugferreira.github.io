# ChurnLab — reconstrução independente de análise de evasão

**Projeto 100% novo.** A base e o PBIX usados no antigo projeto de Churn foram perdidos. Este repositório de trabalho NÃO recupera aquela base, seus resultados ou medidas. Foi construído um caso didático e reproduzível, com **dados 100% sintéticos**, Python, SQLite/SQL, teste temporal de regressão logística e dashboard JavaScript/SVG.

## Pergunta de negócio

Quais segmentos da base sintética concentram mais cancelamentos mensais? Quanto do MRR **contratual** estava associado aos clientes cancelados? Como avaliar um classificador de risco usando apenas variáveis conhecidas **antes** do cancelamento, sem confundir associação com causalidade?

## Ferramentas e entrega

- Python 3.12+ **sem dependências externas**: gerador determinístico, pipeline SQLite e regressão logística implementada com biblioteca padrão.
- SQL em arquivos \`sql/\`: esquema relacional, taxa de churn, canal, plano, retenção por coorte e sinais de inatividade.
- \`data/\`: **clientes fictícios** e observações mensais CSV, sem nomes, e-mails, CPF, telefones ou dados de empresas reais.
- \`metrics.json\` e \`model_card.json\`: somente agregados e métricas de treino/validação/teste; não expõem IDs individuais.
- Página web estática em \`index.html\`, com filtros por plano/mês, gráfico temporal, comparação de planos, coortes, sinais e métricas do teste final.
- Testes de integridade, reprodutibilidade, reconciliação e corte temporal.

## Reprodução local

Na pasta \`projects/churn-analytics\`:

~~~bash
python -m src.generate
python -m src.pipeline
python -m unittest discover -s tests -v
python -m http.server 8000
~~~

Depois, abrir http://localhost:8000. O comando de geração **sobrescreve os CSV/JSON dessa pasta**, portanto faça isso somente num clone descartável ou use \`--output\` para um diretório separado:

~~~bash
python -m src.generate --output /tmp/churnlab-data
python -m src.pipeline --data-dir /tmp/churnlab-data --output-dir /tmp/churnlab-output
~~~

Opcionalmente, para inspecionar as tabelas via SQLite:

~~~bash
python -m src.pipeline --db build/churn.sqlite3
sqlite3 build/churn.sqlite3 < sql/monthly.sql
~~~

O banco opcional é uma saída local **não versionada**. **Não** usar dados reais, credenciais ou senhas. Os CSV são fictícios e estão publicados somente para permitir reprodução.

## Definições de indicadores

- **Cliente-mês:** cada cliente ativo no **início** de um mês. Um cliente pode contribuir para muitos meses; exposições não são clientes únicos.
- **Churn mensal:** cancelamentos ao **fim** do mês ÷ clientes ativos no **início** daquele mesmo mês.
- **Taxa total do período:** soma de cancelamentos ÷ soma das exposições cliente-mês, não média simples de percentuais mensais, nem percentual de clientes únicos que saíram.
- **MRR vinculado a cancelamentos:** mensalidade contratual dos clientes que cancelaram; **não** caixa perdido/estorno ou LTV.
- **Retenção por coorte:** clientes ativos no início de cada idade de coorte ÷ cadastros da coorte, apenas para aquisições dentro da janela observada.
- **Sinais de risco:** associação descritiva entre variáveis fictícias e churn, não efeito causal de suporte, cobrança ou campanhas.

## Experimento preditivo ilustrativo

Features: tempo desde adesão, chamados últimos 30 dias, dias sem atividade últimos 30, atrasos de faturas últimos 90, plano, canal e mensalidade. **Todas representam o início do mês.** O desfecho é cancelamento no fim do mês.

Divisão temporal: treino jan–dez/2025, validação jan–mar/2026, teste reservado abr–jun/2026. Regressão logística em Python puro com gradiente, sem tuning pelo teste. Avaliamos AUC ROC, Brier score versus modelo de prevalência do treino e lift do decil superior. **Não** foi treinado ou testado em clientes reais; clientes podem aparecer em cortes temporais diferentes, e isso limita a independência das amostras.

O dashboard é um estudo de **observabilidade de dados e experimentação**, não um sistema para disparar decisões de retenção ou perfilar pessoas.

## Roteiro para recrutadores

1. Explique por que taxa mensal usa denominador de **clientes ativos no começo**.
2. Abra o gráfico dos 18 meses, filtros por plano e comparações.
3. Demonstre SQL em \`sql/monthly.sql\`, \`by_plan_month.sql\`, \`cohorts.sql\` e \`signals.sql\`.
4. Mostre o teste de qualidade que impede clientes reingressarem após cancelar.
5. Explore \`model_card.json\`: recorte temporal, baseline, AUC/Brier/Lift **somente sintéticos**.
6. Abra o GitHub Actions e refaça a geração com seed fixa para demonstrar os mesmos arquivos.
7. Cite limitações: dados perdidos do projeto antigo, sobrevivência anterior a 2025, censura de coortes, simulação por risco programado, ausência de causalidade/ROI/Power BI Desktop.

Leia também [documentação de auditoria](docs/AUDITORIA.md), [estudo de caso](docs/ESTUDO_DE_CASO.md), [arquitetura Mermaid](docs/ARQUITETURA.md), [model card](docs/MODEL_CARD.md), [perguntas técnicas](docs/ENTREVISTA_TECNICA.md) e [demo de 3 minutos](docs/ROTEIRO_DEMO.md).

## Segurança e procedência

**Todos os registros são gerados artificialmente.** O projeto não contém clientes, dados, vídeos, relatórios, arquivos ou medidas originais recuperados. Não há dependências externas, requests HTTP, envio de métricas ao servidor ou acesso a sistemas comerciais. Os resultados ilustram conceitos, não ganhos realizados.

**Localização temporária do projeto:** esta entrega está em uma pasta isolada do repositório GitHub Pages do portfólio, para poder ser transferida depois a um repositório próprio sem reescrever a implementação.
