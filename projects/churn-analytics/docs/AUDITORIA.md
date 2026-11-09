# ChurnLab V2 — auditoria e transparência técnica

**Revisão:** 08/11/2026. **Origem:** projeto independente após a perda do dataset/PBIX do Churn anterior. Não é restauração do arquivo perdido, nem reutilização das métricas antigas.

## O que foi implementado

- Gerador [Python padrão](../src/generate.py) com seed imutável \`20261108\`, 1.800 clientes fictícios e 13.525 linhas de observação cliente-mês, de 2025-01 até 2026-06.
- Dois CSVs versionados, sem nome, e-mail, telefone, CPF, documento ou acesso a plataformas reais.
- [Esquema SQLite](../sql/schema.sql) com PK, FK, restrições de domínio e índices; [consultas SQL](../sql) para churn mensal, plano, canal, coorte e sinais.
- [Pipeline Python](../src/pipeline.py) que carrega os CSVs em SQLite em memória por padrão e publica apenas agregados \`metrics.json\`.
- [Modelo ilustrativo](../src/model.py), regressão logística sem dependências externas; treino 2025, validação 2026-T1 e teste 2026-T2, com modelo de prevalência como baseline.
- Interface [HTML/CSS/JS](../index.html) que lê \`metrics.json\` e \`model_card.json\` locais: filtros de período/plano, gráfico, tabela acessível, comparações de plano, coortes e avaliação de classificação.
- [19 testes Python](../tests/test_project.py) de integridade, reconciliação, vazamento óbvio de label, reprodução de CSV, reprodução dos relatórios e divisão temporal; [6 testes JS](../tests/ui.test.mjs) para agregação de dashboard. Resultados do CI em [EVIDENCIAS.md](EVIDENCIAS.md).

## Resultados do dataset gerado, não de empresas

| Indicador artificial | Valor |
| --- | ---: |
| Clientes fictícios distintos | 1.800 |
| Observações cliente-mês | 13.525 |
| Cancelamentos simulados | 1.130 |
| Taxa ponderada de cancelamento | 8,3549% |
| MRR contratual associado a saídas | R$ 118.360,00 |
| Mês inicial | 2025-01 |
| Mês final | 2026-06 |
| AUC ROC do teste temporal | 0,7034 |
| Brier score do teste | 0,070735 |
| Brier baseline (prevalência treino) | 0,074589 |
| Lift do decil superior | 2,8561× |

**Nunca** descrever R$ 118.360,00 como faturamento perdido realizado, LTV ou economia: é soma dos preços mensais contratuais dos cancelamentos artificiais, contabilizada uma vez por evento. A taxa é por **exposição cliente-mês**, e não percentual de clientes únicos que alguma vez cancelaram.

## Checagens de qualidade

1. Cada cliente tem ID único e plano/estado/canal de categorias fictícias.
2. Cada observação tem chave composta cliente+mês; não pode haver repetição.
3. Um cliente pode cancelar **uma única vez** e não reaparece em meses posteriores.
4. Variáveis de entrada são definidas antes do desfecho ao fim do mês; esse é o contrato temporal do gerador.
5. Soma das 3 categorias de plano reconcilia com cada mês e com a receita contratual associada.
6. Coortes de aquisição de 2025 têm 100% no início e não crescem após cancelamentos.
7. O output agregador não contém IDs de clientes; o conjunto completo fictício continua público para reprodutibilidade.
8. Treino, validação e teste separam os meses cronologicamente; há dependência longitudinal por clientes repetidos entre períodos.

## Limitações analíticas e riscos

- **Churn foi programado** por uma função probabilística do gerador. A relação observada entre inatividade, chamados, atrasos, plano e cancelamento decorre do próprio mecanismo artificial, não de descoberta de comportamento humano.
- O período de aquisição começa em 2024, mas a observação mensal começa em 2025: clientes anteriores sofrem **censura/truncamento à esquerda**, portanto não entram no quadro de coortes de novas aquisições da janela.
- A variável \`churned_end_month\` indica saída no fim daquele mês. Não existe reativação, downgrade, expansão de MRR, ajustes de cobrança, impostos, inadimplência ou renovação.
- A taxa mensal não é causal, e a diferença entre planos não significa que o plano cause churn.
- Mesmo com separação temporal, o mesmo cliente pode reaparecer em treino e teste. Avaliação é de cenário artificial longitudinal, **não** validação prospectiva em novas empresas/clientes.
- AUC ~0,70, Brier e lift **não** podem ser apresentados como previsão real, aprovação por recrutadores ou melhoria comprovada de retenção.
- Não há Power BI Desktop/PBIX novo, DAX ou Power Query neste novo projeto. A versão web é JavaScript + SQL; acrescentar PBIX nativo exigiria criação e teste futuros.
- Não há backend exposto, login, pagamentos, API externa ou dados privados. CSVs são inteiramente fictícios e intencionalmente públicos.

## Parecer para entrevistas

O projeto se presta a explicar **granularidade, definição de KPI, ETL reprodutível, SQL, chave estrangeira, sazonalidade, coortes, integridade e split temporal**. Priorize explicações e provas verificáveis, não um percentual de acurácia sintética isolado.

[Estudo de caso](ESTUDO_DE_CASO.md) · [Arquitetura](ARQUITETURA.md) · [Dicionário](DICIONARIO_DE_DADOS.md) · [Model card](MODEL_CARD.md).
