# Seção Método

A seção original da página inicial mantém título, descrição, quatro cards, números, fundo, tipografia, medidas, bordas e efeitos. O seletor acrescenta duas leituras: **Dados & BI** e **Desenvolvimento & Automação**.

O conteúdo está em `index.html`, na seção `#metodo`. `assets/methodology.js` escuta o evento nativo de mudança dos rádios e atualiza quais textos estão expostos. Não navega, não recarrega a página e não chama APIs.

`assets/methodology.css` limita suas regras ao seletor e aos textos desta seção. As versões dos textos compartilham uma célula de grid: a maior reserva o espaço necessário. A cópia original também permanece no HTML como reserva invisível. Textos inativos ficam com `visibility: hidden` e `aria-hidden="true"`, sem duplicar as etapas na árvore de acessibilidade. Nenhuma altura fixa ou medição por JavaScript é necessária.

Os rádios compartilham nome, possuem rótulos e ficam num `fieldset` com legenda. Tab entra na opção selecionada; as setas alternam as opções. Um status anuncia a troca. O foco permanece no seletor. Sem JavaScript, a leitura Dados & BI permanece disponível, com o seletor desabilitado.

Para alterar o conteúdo, edite as duas versões de cada card. Preserve os quatro elementos `.process-card` e seus números. Rode `python tools/standardize_projects.py` para atualizar os identificadores de cache e `python tools/check_portfolio.py` para verificar o site. Compare ambas as opções nas resoluções documentadas na auditoria. Não use o gerador para alterar aplicações ou seus bancos.

Na comparação de 01/11/2026, os cards preservaram as medidas originais e a seção permaneceu com altura idêntica entre as duas metodologias, em 1920, 1366, 768 e 390 pixels de largura.
