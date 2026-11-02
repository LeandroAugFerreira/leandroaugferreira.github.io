# Homologação final do portfólio — 01/11/2026

**Parecer: APTO PARA PUBLICAÇÃO. Não houve commit, push, deploy ou publicação nesta etapa.**

Escopo: validar a evolução local já implementada, sem reformular o site. Comparação com a publicação `f099ce0edf6e6e4582ddc46e5ac6e6ce256a665a`, branch `main`. Os 20 arquivos da evolução que já estavam alterados foram inventariados e copiados antes da homologação. A base publicada foi extraída separadamente para servir de referência visual.

Ambiente: Windows; navegador real integrado ao Codex; servidor de QA limitado a `127.0.0.1:5198`; Python e Node.js existentes. JSDOM foi utilizado apenas como teste complementar de integração, sem instalar bibliotecas. A disponibilidade normal do navegador foi restabelecida nesta rodada; nenhum bloqueio de ferramenta foi contornado.

## 1. Resoluções testadas

Foram executadas interações reais, medições do DOM e comparação visual de capturas antes/depois nas quatro dimensões. Após corrigir a restauração do filtro, a matriz de filtros e metodologias foi repetida integralmente.

| Resolução | Grade de projetos | Resultado | Altura do Método nas duas opções |
|---|---|---|---:|
| Desktop — 1920 × 1080 | 3 colunas | Aprovado | 759,69 px |
| Notebook — 1366 × 768 | 3 colunas | Aprovado | 759,69 px |
| Tablet — 768 × 1024 | 2 colunas | Aprovado | 982,30 px |
| Mobile — 390 × 844 | 1 coluna | Aprovado | 1.678,13 px |

Em todas: sem rolagem horizontal indesejada, sobreposição de cards ou corte de texto nos quatro cards ativos do Método. Imagens, posters, proporção dos vídeos, botões e quebras de linha permaneceram adequados. O background fixo e o efeito de hover original foram preservados. No celular, a fotografia continua acima do nome. As quebras adicionais dos textos revisados e das tags são naturais; os componentes crescem sem ocultar conteúdo.

O acesso ao conteúdo por link de salto, o botão de projetos e os controles da página foram verificados. A home não contém um menu móvel expansível; não foi acrescentado um menu para esta homologação.

## 2. Capturas antes/depois

Foram revisadas **24 capturas originais**, correspondentes a topo, projetos e Método, antes/depois, nas quatro resoluções. Não foram editadas nem recomprimidas. A galeria abre cada captura em seu tamanho original e inclui uma evidência adicional do vídeo de Churn com legenda, em tela cheia nativa.

- [Galeria comparativa local](C:/Users/leand/.codex/visualizations/2026/10/24/01a16f80-a854-7dd2-abbc-ed567dc8b313/portfolio-homologation-20261101/comparacao-visual.html)
- [ZIP de evidências visuais](C:/Users/leand/.codex/visualizations/2026/10/24/01a16f80-a854-7dd2-abbc-ed567dc8b313/portfolio-homologation-20261101/evidencias-visuais.zip)
- [Registro das interações reais](C:/Users/leand/.codex/visualizations/2026/10/24/01a16f80-a854-7dd2-abbc-ed567dc8b313/portfolio-homologation-20261101/browser-record.json)
- [Integridade e respostas HTTP locais](C:/Users/leand/.codex/visualizations/2026/10/24/01a16f80-a854-7dd2-abbc-ed567dc8b313/portfolio-homologation-20261101/integrity-after.json)

Capturas iniciais de calibração do viewport e de tela cheia sob dimensão simulada foram excluídas da galeria de aceite. Em tela cheia, a simulação de dimensão produzia margens no capturador; a dimensão temporária foi removida e a captura nativa foi repetida com sucesso em 1920 × 1080. O player original não foi alterado. Diferenças na porção visível do fundo entre seções decorrem da posição da rolagem e do background fixo, cujos arquivos e estilos são idênticos aos da base.

## 3. Projetos e filtros

| Filtro | Quantidade | Ordem confirmada |
|---|---:|---|
| Todos | 9 | Chronos, VoxTexto, NexoLog, Análise de Churn, Ateliê Verde, NexoFiscal, Gestão Financeira, Logística e Frota, Análise Comercial |
| Destaques | 4 | Chronos, VoxTexto, NexoLog, Análise de Churn |
| Desenvolvimento & Automação | 5 | Chronos, VoxTexto, NexoLog, Ateliê Verde, NexoFiscal |
| Dados & BI | 4 | Análise de Churn, Gestão Financeira, Logística e Frota, Análise Comercial |

Trocas e reentrada em categorias passaram nas quatro resoluções, sem recarregar, duplicar ou recriar cards. Todos é o padrão de uma entrada nova sem âncora de categoria. O rádio ativo, o foco e o status de quantidade acompanham a seleção. As setas do teclado percorrem os filtros nativos.

Os nove botões “VER PROJETO COMPLETO” foram abertos no navegador real, com confirmação de URL e H1. O manual de Chronos abriu em nova aba, preservando a página principal. As 19 páginas e os demais manuais passaram também na validação de referências locais e HTTP.

As entradas antigas `#aplicativos`, `#dashboards`, `#chronos-aplicacao`, `#featured-voxtexto` e `#featured-churn` continuaram válidas. Voltar/Avançar foram testados com entrada por âncora e com seleção manual de categoria. A falha encontrada no segundo caso foi corrigida e retestada. A escolha passa a ser guardada somente no estado da entrada do histórico, sem criar entradas a cada filtro nem alterar a URL.

O teste de integração complementar confirmou o fallback sem JavaScript: nove cards visíveis e seletor desabilitado.

## 4. Metodologias

Dados & BI e Desenvolvimento & Automação atualizaram os quatro cards corretamente em todas as resoluções. A reserva de espaço mantém a altura da seção idêntica entre as opções, conforme tabela. Nenhum título ou parágrafo ativo ultrapassou seu card nas medições.

O teclado alternou as metodologias com setas. A árvore acessível contém apenas os quatro conteúdos ativos, com nomes e grupos separados dos filtros de projetos. Foram verificadas trocas repetidas e independência entre os dois seletores. Números, formas, ícones, cores, tipografia, efeito de hover e estilos originais dos cards foram mantidos.

## 5. Mídia e downloads

Houve reprodução real dos quatro vídeos de destaque, com quadros decodificados e controles operantes:

| Projeto | Evidência observada |
|---|---|
| Chronos | Reprodução em aproximadamente 12,95 s e legenda em inglês; ao ocultar com Dados & BI, pausou em aproximadamente 13,06 s; ao retornar, conservou a posição e permaneceu pausado |
| VoxTexto | Reprodução; legenda em inglês; busca na linha do tempo em 9,6 s e ajuste por teclado para 9,7 s; alternância de som; opção Sem legendas ocultou o texto |
| NexoLog | Reprodução até o fim do resumo de 17,42 s; pausa ao iniciar outro player; legenda em português observada em aproximadamente 8,7 s |
| Análise de Churn | Reprodução e pausa em aproximadamente 9,46 s, com “Explore os indicadores e encontre padrões na base demonstrativa.”; entrada e saída de tela cheia; captura final nativa com legenda |

Intervalos sem fala e o fim do vídeo podem deixar a área de legenda vazia, conforme os arquivos VTT originais. Isso não foi tratado como falha. Os posters carregaram; nenhuma imagem quebrada foi encontrada na home.

**127 recursos locais únicos** responderam HTTP 200, incluindo páginas, estilos, scripts, imagens, mídias, legendas e downloads referenciados. A validação estática examinou 496 referências locais nas 19 páginas, sem erro. Os executáveis locais de Chronos, NexoLog e NexoFiscal conferem em tamanho e SHA-256 com seus manifestos. Todos os downloads originais permaneceram com os mesmos hashes da base publicada.

Os destinos externos de releases e Power BI não foram modificados; a verificação HTTP pública documentada na evolução anterior havia retornado 2xx. Esta rodada não reinstalou aplicativos, não executou EXEs, não refez seus testes internos e não validou todas as interações dentro dos relatórios externos. O aceite refere-se ao portfólio e à preservação dessas distribuições.

## 6. Console e acessibilidade

- Console real da aba de homologação: nenhuma entrada de erro ou aviso no registro consultado após os testes de navegação e mídia.
- Integração DOM: zero erros JSDOM.
- Primeiro Tab alcança “Pular para o conteúdo”; Enter transfere o foco para `main#conteudo`.
- Filtros e metodologias usam rádios, legendas e rótulos nativos. Setas funcionaram; foco ciano de 2 px visível e preservado.
- Os status têm `role="status"`; a mudança de filtro apresentou, por exemplo, “4 projetos exibidos: Destaques.” A árvore acessível foi inspecionada e registrada.
- O pequeno SVG decorativo próximo a “Dados & Desenvolvimento” deixou de ser uma imagem sem nome na árvore acessível; sua dimensão continua 12 × 12. O texto alternativo da fotografia foi preservado.
- Regras `prefers-reduced-motion` foram inspecionadas no navegador e analisadas no teste DOM: removem a transformação/transição dos cards de projetos e tornam a rolagem automática. Os novos filtros não acrescentam animações; os estilos preexistentes foram preservados.

**Limitações não bloqueantes:** não houve uma sessão instrumentada de NVDA, JAWS ou Narrador; não se afirma validação auditiva dos anúncios. A ferramenta de navegador disponível não oferece emulação da preferência de movimento reduzido, e a configuração global do Windows não foi alterada. Assim, a preferência foi verificada nas regras CSS, mas sua ativação real não foi testada. Este relatório não é uma certificação geral de conformidade WCAG, nem um teste em todos os navegadores ou aparelhos físicos.

## 7. Problemas encontrados e correções

| Classificação | Problema | Correção e reteste |
|---|---|---|
| Bloqueante, corrigido | Após escolher Dados & BI, abrir Churn e voltar, o rádio indicava BI, mas os nove cards reapareciam | Estado do filtro por entrada de histórico; restauração em carregamento, `pageshow` e `popstate`. Voltar/Avançar e todas as quatro matrizes foram repetidos; quatro cards BI corretos |
| Não bloqueante, corrigido | SVG decorativo anunciado como imagem sem nome | `aria-hidden="true"` e `focusable="false"`; árvore e dimensão original conferidas |
| Ambiente de QA, resolvido | Servidor de prévia inicial não oferecia HTTP Range para MP4, impedindo busca além de zero | Suporte 206 no servidor temporário, fora do repositório; busca e legendas retestadas; nenhum vídeo ou player modificado |
| Ambiente de captura, resolvido | Tela cheia com viewport simulado gerava captura com margens | Repetição sem dimensão temporária; evidência nativa final correta |
| Não bloqueante, pendente | Leitor de tela auditivo e preferência de movimento reduzido ativada | Limitações explicitadas na seção 6 |
| Não bloqueante, evolução futura | Currículo PDF, PBIX, DAX documentado, Power Query e novo projeto de Engenharia de Dados | Mantidos fora deste aceite, conforme solicitação; nenhum material ou resultado foi inventado |

Não há defeito bloqueante conhecido remanescente nos fluxos essenciais executados.

## 8. Arquivos modificados nesta homologação

Em relação ao inventário dos 20 arquivos já alterados antes desta rodada:

1. `assets/project-filters.js`: restauração mínima do filtro no histórico.
2. `index.html`: atributos do SVG decorativo e atualização automática do hash de versão do script de filtros.
3. `tools/check_interactions.cjs`: regressão de `pageshow`/`popstate`, com JSDOM visual para `requestAnimationFrame`.
4. `docs/homologacao-final-2026-11-01.md`: este relatório novo.

As capturas, logs, ZIPs e servidor de QA estão fora do repositório, na pasta de evidências indicada na seção 2. Nenhum outro arquivo da evolução anterior foi alterado por esta homologação. Não houve mudança em sistemas apresentados, APIs, bancos, algoritmos ou automações.

## 9. Preservação e regressão

A comparação de hashes confirmou **155 arquivos originais de assets, imagens, mídias e downloads sem alteração**. Os 14 vídeos e 28 arquivos de legenda permanecem íntegros e referenciados. CSS inline original da home e atributos da fotografia idênticos à base. Nenhuma mídia foi removida ou recomprimida.

Os corpos das quatro páginas de aplicativos revisadas permanecem semanticamente iguais à publicação; nos quatro BI, somente o resumo editorial aprovado difere. O catálogo mantém identidades, fontes de mídia, posters, links, cores, marcas, versões e destinos de download.

As diferenças visuais verificadas correspondem à evolução aprovada: grade única com filtros, textos revisados e metodologias. Não foi identificado desvio visual não autorizado que exigisse nova alteração de layout. Efeitos e transições originais não foram reescritos.

Os checks estáticos, de interação e de preservação passaram. A regeneração do site foi repetida sem produzir alterações adicionais. HEAD continua `f099ce0edf6e6e4582ddc46e5ac6e6ce256a665a`; staging vazio. Nenhum procedimento de publicação foi acionado.

## 10. Parecer final

**APTO PARA PUBLICAÇÃO**, dentro do escopo e das limitações documentados. O defeito bloqueante de restauração foi corrigido e os testes afetados passaram novamente. A identidade visual e os arquivos protegidos foram preservados. As pendências documentais e os testes assistivos não executados estão classificados como não bloqueantes, sem serem apresentados como aprovados.

**PORTFÓLIO HOMOLOGADO — APTO PARA PUBLICAÇÃO. Aguardando autorização para publicar.**
