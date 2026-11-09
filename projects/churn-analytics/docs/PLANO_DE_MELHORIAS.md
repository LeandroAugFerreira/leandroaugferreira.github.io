# ChurnLab — plano de evolução por valor de recrutamento

O principal objetivo não é gerar mais um dashboard, mas demonstrar **qualidade, SQL, Python, modelagem de dados, teste temporal e comunicação**. Os dados anteriores foram perdidos; nenhum número do passado é recuperável por esta versão.

| Prioridade | Melhoria | Valor para recrutador | Esforço | Risco | Aceite |
| --- | --- | --- | --- | --- | --- |
| P0 | Gerar base nova com Python determinístico e licença/origem explícitas | Muito alto | Médio | Baixo | 1.800 IDs fictícios, CSV regenerável |
| P0 | SQL dimensional de clientes, observações e métricas de cancelamento | Muito alto | Médio | Baixo | 18 meses, taxas e MRR agregados reproduzíveis |
| P0 | Dashboard interativo estático, acessível e com definições visíveis | Alto | Médio | Baixo | Filtros plano/mês, série, tabela, coorte, modelo |
| P0 | Testes automáticos, reconciliação de totais, coortes e hashes | Muito alto | Médio | Baixo | GitHub Actions verde para Python e Node |
| P0 | Documentação para entrevistas, demo e model card honesto | Alto | Baixo | Baixo | Origem sintética e limitações em todas as telas |
| P1 | Testes Playwright/axe de navegação, teclado e mobile | Alto | Médio | Médio | E2E e acessibilidade no CI |
| P1 | Benchmarks de performance e tamanho dos CSVs para GitHub Pages | Médio | Médio | Baixo | Métricas medidas de carregamento |
| P1 | Testar splits com agrupamento por cliente para evitar dependência entre cortes | Muito alto | Médio | Médio | Avaliação adicional com clientes disjuntos e limitações |
| P1 | Calibrar probabilidades por faixa e acompanhar drift de dados sintéticos | Alto | Médio | Baixo | Curva/calibração/PSI com testes |
| P1 | Criar consultas SQL equivalentes a mais recortes do dashboard | Alto | Baixo | Baixo | Chaves e números conciliados |
| P2 | Criar nova versão nativa Power BI a partir da base sintética | Alto para BI | Alto | Médio | PBIX + DAX/Power Query verificados no Desktop |
| P2 | Consolidar conteúdo numa nova repo `churn-analytics` própria | Médio/alto | Baixo | Baixo | CI independente, links atualizados |
| P2 | Caso real autorizado, com dados de cliente e governança | Muito alto | Alto | Alto | Contrato, consentimento, LGPD e validação antes de uso |
| P3 | Experimento A/B de retenção e análise causal | Condicional | Muito alto | Alto | Grupo de controle, custo/benefício, avaliação ética |

## Estado entregue

O projeto fornece Python + SQLite/SQL, CSV sintético, agregados versionados, modelo temporal ilustrativo, dashboard e documentação. Os testes são reproduzíveis sem instalar bibliotecas externas.

**A avaliação preditiva é exclusivamente artificial**. Não é possível inferir economia, receita futura ou churn de um negócio real a partir desses números.

## Por que não começar com novos recursos de IA?

Em entrevistas, explicar **por que a taxa usa cliente-mês, por que datas e cortes importam, por que AUC ≠ accuracy e por que associação ≠ causalidade** tem mais valor do que acrescentar outro algoritmo sem validação.

[Estudo](ESTUDO_DE_CASO.md) · [Auditoria](AUDITORIA.md) · [Model card](MODEL_CARD.md).
