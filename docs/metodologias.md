# Seção Método

A seção original da página inicial mantém título, quatro cards, números, fundo, tipografia, bordas e efeitos. Na evolução estratégica local, a introdução e os resumos foram revisados para explicar as duas abordagens: **Dados & BI** e **Desenvolvimento & Automação**. O desenho e o mecanismo de alternância foram reutilizados.

O conteúdo está em `index.html`, na seção `#metodo`. `assets/methodology.js` escuta o evento nativo de mudança dos rádios e atualiza quais textos estão expostos. Não navega, não recarrega a página e não chama APIs.

`assets/methodology.css` limita suas regras ao seletor e aos textos desta seção. As versões dos textos compartilham uma célula de grid: a maior reserva o espaço necessário. A cópia original também permanece no HTML como reserva invisível. Textos inativos ficam com `visibility: hidden` e `aria-hidden="true"`, sem duplicar as etapas na árvore de acessibilidade. Nenhuma altura fixa ou medição por JavaScript é necessária.

Os rádios compartilham nome, possuem rótulos e ficam num `fieldset` com legenda. Tab entra na opção selecionada; as setas alternam as opções. Um status anuncia a troca. O foco permanece no seletor. Sem JavaScript, a leitura Dados & BI permanece disponível, com o seletor desabilitado.

Para alterar o conteúdo, edite as duas versões de cada card. Preserve os quatro elementos `.process-card` e seus números. Rode `python tools/standardize_projects.py` para atualizar os identificadores de cache e `python tools/check_portfolio.py` para verificar o site. Compare ambas as opções nas resoluções documentadas na auditoria. Não use o gerador para alterar aplicações ou seus bancos.

Na auditoria anterior de 01/11/2026, os cards preservaram as medidas originais e a seção permaneceu com altura idêntica entre as duas metodologias, em 1920, 1366, 768 e 390 pixels de largura. Essa medição pertence aos textos anteriores. A evolução atual usa resumos fiéis para caber na composição, mantém a reserva de altura e exige nova conferência real nas quatro resoluções antes de afirmar equivalência visual dos novos textos.

## Conteúdo atual

Introdução: Cada projeto exige uma abordagem específica. Em Dados e Business Intelligence, o foco está em transformar informações em conhecimento para decisões. Em Desenvolvimento e Automação, o objetivo é construir soluções confiáveis, integrar tecnologias e tornar os processos mais eficientes. Conheça as etapas que orientam cada abordagem.

### Dados & BI

1. **Entendimento do Negócio:** investigo o contexto, as perguntas do negócio e os indicadores para orientar a análise.
2. **Preparação e Modelagem:** coleto, limpo, integro e valido dados, estruturando uma base consistente para análise.
3. **Análise e Visualização:** exploro dados com SQL, Excel, Python e Power BI para construir métricas e dashboards.
4. **Insights e Decisões:** traduzo os resultados em recomendações e indicadores para acompanhar o negócio.

### Desenvolvimento & Automação

1. **Análise de Requisitos:** mapeio processos, necessidades dos usuários e regras para definir os requisitos.
2. **Arquitetura da Solução:** planejo interfaces, APIs, dados e integrações, considerando manutenção e segurança.
3. **Desenvolvimento e Integração:** integro interfaces, APIs e automações com regras e versionamento.
4. **Testes, Entrega e Evolução:** valido regras, corrijo falhas e documento a entrega e a evolução da solução.

O seletor de projetos é outro grupo de rádios, com nome e escopo próprios. Filtrar projetos não altera a metodologia, e trocar a metodologia não altera a listagem selecionada.
