# Auditoria do portfólio — 01/11/2026

## A. Resumo executivo

Trabalho realizado no repositório original `portfolio`, branch `main`, partindo de **a74c38cc0dba532ab0308cc5c17621e26f29a404**. A árvore estava limpa. Antes das alterações, foi produzido um ZIP completo do HEAD e um inventário dos 185 arquivos rastreados, com hashes. A integridade CRC do ZIP foi conferida.

Foram examinadas **19 páginas**: página inicial; Chronos, VoxTexto, NexoLog, Ateliê Verde e NexoFiscal; Gestão Financeira, Logística e Frota, Análise Comercial e Análise de Churn; os nove manuais online. Os **169 arquivos públicos** de HTML, estilos, scripts, imagens, mídias e downloads conferidos por HTTP correspondiam ao HEAD, considerando a normalização CRLF/LF dos textos. O workflow Pages desse commit estava concluído com sucesso. Não havia publicação pendente nem diferença confirmada de cache.

As correções locais completam metadados, melhoram o acesso por teclado, acrescentam acesso ao perfil GitHub, reservam as proporções de dez imagens e oferecem feedback quando um vídeo falha. As páginas e os guias BI passam a explicar o limite da evidência disponível. O registro existente dos 60 testes de backend do NexoFiscal ganhou um resumo verificável.

Durante a auditoria, foram incorporados dois pedidos expressos: **foto acima do nome no mobile, até 700px**, e **duas metodologias alternáveis dentro da seção Método**. A identidade e as dimensões dos quatro cards foram preservadas. As categorias de projetos continuam completas: a proposta de retirar as repetições dos destaques foi documentada para decisão posterior.

**Estado ao encerrar a auditoria inicial:** entrega local, sem commit, push, release, publicação no GitHub Pages ou alteração no LinkedIn. Nenhum arquivo dos sistemas apresentados foi modificado nesta auditoria; não houve alteração de APIs, algoritmos, bases, credenciais ou integrações.

**Autorização posterior do autor:** remover a faixa “9 projetos publicados · 5 aplicativos Windows · 4 relatórios Power BI”, incluindo seus dois atalhos, e publicar o portfólio atualizado. A faixa foi retirada também do gerador para não reaparecer. A publicação deste conjunto passou a estar autorizada; os registros abaixo preservam o diagnóstico e os limites da auditoria inicial.

Depois dessa remoção, a validação estática passou com 19 páginas e 518 referências locais, a integração de interações passou e a regeneração permaneceu idempotente. As contagens de 520 referências nas seções abaixo pertencem à auditoria anterior à remoção dos dois atalhos.

## B. Problemas e evidências

| ID / gravidade | Arquivo e localização | Comportamento inicial e resultado esperado | Correção e risco | Verificação |
|---|---|---|---|---|
| A01 / média | `index.html`, head | Sem canonical, autor ou Open Graph; a página precisava identificar URL e prévia | Metadados adicionados, sem trocar título ou conteúdo do hero; baixo risco | Canonical, campos OG e imagem existente conferidos |
| A02 / baixa | `nexolog.html`, `nexofiscal.html`, head | Faltavam og:type e og:description | Campos completados pelo pós-processamento do gerador; baixo risco | Parser nas 19 páginas e regeneração idempotente |
| A03 / média | `index.html`, body/main | Sem atalho para saltar o hero por teclado | Link oculto até receber foco e alvo main focalizável; baixo risco | Estrutura e alvo conferidos; a repetição final por teclado na home foi bloqueada pelo limite da ferramenta |
| A04 / alta para acessibilidade | Oito manuais padronizados e quatro dashboards, `.case-skip` | Cascata CSS fazia texto e fundo iguais; contraste observado **1:1** | Regras específicas com cores já existentes; nenhum redesenho | Estilos computados no navegador; guia passou a texto claro e BI a texto escuro; Enter focalizou MAIN |
| A05 / baixa | `index.html`, contato | Não havia link direto ao perfil GitHub | Botão no contato com classe existente; baixo risco | Perfil correto respondeu 206 ao GET parcial |
| A06 / baixa, otimização | Dez imagens em início, NexoLog, NexoFiscal e Churn | Não reservavam proporção intrínseca; CLS não havia sido medido | Atributos reais, sem regravar imagens; altura fluida preservada nas novas capturas; baixo risco após comparação | Dimensões lidas dos arquivos; geometria após carregamento comparada nas quatro larguras |
| A07 / média documental | `docs/apresentacoes.md`, NexoFiscal | Alegação de 60 testes sem registro acessível ao visitante | Resumo JSON e JUnit sanitizado, ligados à área técnica; baixo risco | XML existente contém 60 casos, zero falhas, erros e ignorados; 151,446s |
| A08 / média documental | Quatro páginas e quatro manuais BI | Origem, modelo e fórmulas não acompanhavam a apresentação | Limitação explicitada no texto; nenhum dado ou indicador alterado | Inventário do portfólio e revisão das páginas/relatórios |
| A09 / baixa | `assets/video-player.js`, falha de reprodução | Código retornava ao botão sem explicar uma promessa play rejeitada | Mensagem acessível, recuperação e tratamento do evento error; baixo risco | Integração com rejeição e erro simulados; reprodução real preservada |

A06 é melhoria preventiva de carregamento; a ausência de dimensões, isoladamente, não foi apresentada como reprovação de Core Web Vitals. Em A09, a lacuna do código foi confirmada; não foi encontrada mídia publicada indisponível. A falha foi induzida apenas no teste isolado.

### Apontamentos externos que já estavam resolvidos

- **VoxTexto:** início, página, manual, catálogo e instalador apontam para **V2.0**. A release oficial tem tag V2.0 e arquivo `TranscricaoEmTexto-Setup-V2.0.exe`; seu digest é `71c37f09801bf0d7426ef679f91e79b9c7545c51b78b764d7ebb411eb526ed53`. A numeração v1.2.1 consta como identificação histórica, documentada em `docs/apresentacoes.md`. A release anterior v1.2.0/V1.0 foi preservada. Nenhum vídeo, captura, instalador ou release foi renomeado.
- **Novo projeto 02/03:** não existem mais na base auditada. Há nove projetos existentes; nenhum foi inventado para substituir placeholders.
- **sql.html e excel.html:** não existem na árvore atual nem em links ativos. Os dois endereços antigos retornam 404. Não há evidência suficiente para reconstruí-los ou escolher um destino de redirecionamento. `python.html` continua sendo a página do VoxTexto.

### Suspeitas e informações insuficientes

- No Financeiro incorporado, o card de receita mostra unidade “Mil”, enquanto uma narrativa usa outro valor com a mesma unidade aparente. Sem base, PBIX e definição das medidas, não se conclui qual expressão está correta. **Revisão das unidades recomendada ao responsável pelo relatório; nenhum número foi corrigido por suposição.**
- O HTTP do LinkedIn retornou 999, bloqueio de automação. O destino foi depois aberto no navegador e mostrou o perfil **Leandro Augusto Ferreira** em `/in/leandro-datainsights/`. O link funciona; o 999 não foi tratado como defeito do site. Nenhuma ação foi executada no perfil.
- Não foi encontrado currículo PDF no repositório. O download de currículo permanece pendente, sem documento ou URL presumidos.
- Não se afirma conformidade WCAG integral, sucesso de todas as operações dos aplicativos ou desempenho em produção a partir desta auditoria do site.

## C. Arquivos e motivos

| Arquivos | Alteração |
|---|---|
| `index.html` | Metadados, skip link, alvo main, GitHub no contato, dimensões da foto, ordem mobile autorizada e seletor Método |
| `assets/methodology.css`, `assets/methodology.js` | Comportamento restrito ao Método; rádios nativos e altura estável |
| `assets/portfolio-a11y.css` | Contraste do skip link, foco no início e preservação da altura fluida das imagens recém-dimensionadas |
| `assets/video-player.js` | Feedback acessível de falha e recuperação; arquivos de vídeo e legenda intactos |
| `atelie-verde.html`, `python.html`, `nexolog.html`, `nexofiscal.html` | Inclusão do CSS corretivo e alvo main focalizável; cache do player atualizado; OG e dimensões onde faltavam; link de evidência do NexoFiscal |
| `chronos.html`, `chronos-manual.html` | Apenas CSS corretivo compartilhado e tabindex do alvo main; conteúdo e identidade mantidos |
| `churn.html`, `financeiro.html`, `transporte.html`, `venda.html` | Limites documentais no parágrafo existente, CSS/foco, cache do player e dimensões do Churn |
| Oito demais arquivos `*-manual.html` | CSS corretivo e alvo main; quatro guias BI incluem contexto dos dados |
| `docs/manuais/{churn,financeiro,transporte,venda}.md` | Fontes editoriais dos limites de reprodução das análises |
| `downloads/NexoFiscal-testes-backend.json`, `.xml` | Registro sanitizado do resultado já existente, sem hostname, caminhos pessoais ou credenciais |
| `docs/apresentacoes.md` | Escopo e evidência da contagem de testes |
| `tools/audit_metadata.py`, `tools/standardize_projects.py` | Preservar as correções nas próximas gerações, sem dependências novas |
| `tools/check_portfolio.py` | Verificação estática reutilizável das rotas, metadados e contratos de apresentação |
| `robots.txt`, `sitemap.xml` | Descoberta das 19 URLs canônicas; melhoria opcional sem efeito visual |
| `.gitignore` | Ignorar cache Python gerado pelas ferramentas locais |
| `docs/metodologias.md`, este relatório | Manutenção, evidências, riscos e pendências |

As referências de cache alteradas nos HTML correspondem ao conteúdo dos scripts/estilos. O gerador foi executado novamente sobre o resultado e não produziu diferenças de bytes.

## D. Preservação visual

Foram preservados **146 arquivos originais protegidos**, byte a byte: imagens, mídias, downloads e folhas de estilo existentes. Isso inclui foto, fundos, mascotes, Rafinha, marcas, thumbnails, vídeos, áudio, 28 legendas WebVTT e distribuições Windows. Não houve recompressão, substituição ou criação de material audiovisual.

Os estilos originais de Chronos, VoxTexto, NexoLog, Ateliê Verde e NexoFiscal não foram alterados. Fontes, paleta, gradientes, transparências, bordas, sombras, efeitos, animações e ordem dos projetos permanecem. As novas regras reutilizam cores da página e corrigem especificamente foco/contraste.

As únicas mudanças intencionais de composição foram as autorizadas: foto primeiro no breakpoint mobile; seletor na seção Método; botão GitHub na área de contato, usando o componente existente. As demais mudanças de conteúdo são documentais. A ordem desktop do hero permanece texto/foto, em duas colunas.

A comparação semântica do corpo da home com a cópia original, desconsiderando apenas Método, atalho de conteúdo, GitHub, atributos intrínsecos da foto e chaves de cache autorizados, resultou em conteúdo idêntico. Nenhum arquivo estava no staging; o HEAD permaneceu no commit inicial.

### Método: comparação original × duas opções

| Viewport | Medidas de cada card no original | Medidas nas duas metodologias | Altura da seção ao alternar |
|---|---|---|---|
| 1920×1080 | 280 × 265,75px | Iguais | 698,4375px nas duas opções |
| 1366×768 | 280 × 265,75px | Iguais | 698,4375px nas duas opções |
| 768×1024 | 346,5 × 242,53125px | Iguais | 924,703125px nas duas opções |
| 390×844 | 335 × 242,53125px | Iguais | 1505,34375px nas duas opções |

O seletor ocupa espaço adicional fixo na seção; **trocar de metodologia não altera sua altura**. As quatro caixas mantêm o tamanho anterior, padding de 30px 24px, raio de 14px e fundo rgba(6,17,36,0.75). Não há altura fixa que corte textos. As capturas original/nova foram comparadas no navegador em desktop e mobile; a geometria foi medida nas quatro resoluções. As capturas foram exibidas na conversa, sem afirmar exportação de arquivos de imagem.

Na tela de 390px, a foto preservou 260px de largura, começando a 60px do topo; o nome aparece abaixo. Em larguras de desktop, a ordem original foi preservada. NexoLog, NexoFiscal e Churn mantiveram a geometria das capturas **após o carregamento**, nas quatro larguras. A reserva de espaço das imagens lazy antes de carregar é intencional; não foi confundida com mudança de proporção.

## E. Testes e limites

Ambiente: Windows, Python local, Node.js 22, JSDOM já disponível para integração isolada e navegador Chromium do aplicativo, operado via CUA. Nenhuma dependência foi adicionada ao site. Servidor de teste vinculado apenas a `127.0.0.1`; não hospeda APIs dos sistemas.

| Teste | Resultado |
|---|---|
| HTTP comparativo antes de editar | 169/169 arquivos públicos com hash correspondente; nenhuma diferença confirmada de publicação |
| Downloads e links externos principais | Executáveis, fontes, releases e quatro URLs Power BI com resposta 2xx; GitHub validado; LinkedIn confirmado no navegador |
| Validação estática final | 19 páginas, nove projetos e 520 referências locais; zero erros |
| Metadados e navegação | Canonical e OG presentes, um H1 por página, IDs únicos, âncoras existentes, alt/dimensões de imagens e títulos de iframes |
| Conteúdo e manuais | Nove manuais HTML, sem leitor PDF incorporado; documento fiscal PDF continua disponível como saída demonstrativa |
| Responsividade inicial e final | 19 páginas × quatro resoluções: 76 estados antes e 76 depois; sem overflow horizontal observado |
| Reflow adicional | Início e nove manuais em 320×844, sem overflow horizontal |
| Método real | Mouse/toque via ação de rádio, setas do teclado, estado selecionado, foco visível e status anunciável; quatro cards e títulos corretos; altura estável nas quatro resoluções |
| Árvore acessível | Apenas a metodologia ativa exposta; textos de reserva/inativos não duplicam as etapas |
| Skip link real | Tab mostra texto legível; Enter leva o foco a MAIN#conteudo |
| Mídias | 64 imagens verificadas por decodificador; 14 vídeos examinados com ffprobe; 28 arquivos WebVTT presentes; 21 instâncias de player no HTML |
| Player em navegador | Reprodução, seleção PT/EN, legenda exibida e pausa do player anterior observadas na versão inicial; a repetição final após o tratamento de erros foi bloqueada pela ferramenta. O código alterado passou pela integração JSDOM |
| Integração JSDOM | Quatro alternâncias de método, 12 players do início, play/pause, pausa automática, legenda, falha induzida e recuperação; zero erros JSDOM |
| Relatórios incorporados | Os quatro relatórios renderizaram a estrutura do Power BI no navegador. Financeiro e Churn expuseram indicadores/segmentações na árvore. Não foram auditadas todas as medidas ou combinações de filtros |
| Console | Nenhum erro/aviso capturado nas leituras locais consultadas; isso não equivale a monitoramento de todos os serviços externos |
| Preservação | Hashes dos 146 arquivos protegidos iguais; estilos originais intactos; nenhuma aplicação modificada |
| Gerador e revisão | Regeneração idempotente; `git diff --check` sem problemas |

Comandos reutilizáveis: `python tools/check_portfolio.py` e `python tools/standardize_projects.py`. A integração de interações foi executada em arquivo temporário da auditoria, usando JSDOM já instalado, sem transformar esse recurso em dependência do portfólio.

**Limites explícitos:** zoom nativo de 200% não foi executado; 320px é teste de reflow, não uma afirmação de zoom. Não houve teste com NVDA/JAWS, leitor de tela físico, Lighthouse, Core Web Vitals, auditoria integral de contraste sobre fotografias/gradientes, Power BI Desktop ou homologação de produção. A árvore de acessibilidade foi inspecionada, sem confundi-la com teste completo de leitor de tela. Os aplicativos Windows não foram reinstalados nem seus bancos reabertos durante esta auditoria. O registro NexoFiscal é revisão de um JUnit existente, claramente identificado; não é uma nova execução de backend.

Na última tentativa de voltar à página inicial local para repetir skip link e player, a revisão automática de aprovação não pôde autorizar a navegação por **limite de uso da ferramenta**. A ação não foi executada. Não houve rejeição manual do usuário nem determinação de que a navegação era insegura. Nenhum outro navegador, protocolo ou ferramenta foi usado para contornar o bloqueio. Os testes de Método, foto, responsividade, contraste dos manuais, relatórios e geometrias já descritos tinham sido executados antes desse limite. A repetição final bloqueada permanece pendente; os testes estáticos e de integração locais foram concluídos separadamente.

## F. Pendências

- Currículo PDF: arquivo não encontrado no portfólio; aguarda material fornecido ou validado pelo autor.
- Zoom nativo de 200%, tecnologia assistiva real e medições de desempenho: executar numa rodada específica antes de qualquer alegação de conformidade integral.
- Repetição final, no navegador, do skip link da home e da reprodução após a mudança de tratamento de erros: impedida pelo limite de uso da revisão automática. Não foi declarada aprovada.
- Fonte de dados, PBIX, medidas e decisões de modelagem dos quatro BI: materiais não encontrados neste repositório; não foram presumidos.
- Possível inconsistência de unidades do Financeiro: depende de revisão do relatório original; dados preservados.
- Integração n8n do Chronos e homologações já declaradas nos projetos permanecem no escopo de seus sistemas. Esta auditoria não as habilitou.
- O manual embutido em executáveis existentes não foi reempacotado; as correções de acessibilidade deste trabalho se aplicam ao site e aos manuais online. Downloads originais foram preservados.
- Publicação das alterações: inicialmente mantida pendente por instrução expressa; autorizada posteriormente junto da remoção da faixa de contagem. O estado efetivo deve ser conferido no workflow GitHub Pages do commit publicado.

## G. Melhorias futuras, separadas das correções

**Proposta editorial pendente:** manter Chronos, VoxTexto e Análise de Churn apenas nos destaques; apresentar os outros três aplicativos em “Mais aplicativos” e os outros três dashboards em “Mais dashboards”. Isso reduz repetição, mantém os nove projetos acessíveis e exige alterar a composição da home. A disposição atual foi preservada nesta rodada.

Outras propostas opcionais: disponibilizar currículo validado; documentar datasets/modelagem e definições dos indicadores; criar um caso público de pipeline de dados com execução reprodutível; avaliar a altura da prévia principal do NexoFiscal no mobile, atualmente herdada do original. Mudanças visuais relevantes ou nos sistemas exigem definição de escopo antes da execução.

Os metadados e o sitemap seguem os princípios de URLs canônicas e títulos descritivos do [Google Search Central](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) e da [documentação de sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). Isso facilita a identificação das páginas; não promete posição nos resultados.

Os critérios de teclado, foco e reflow se baseiam nas [WCAG](https://www.w3.org/TR/WCAG22/) e na [explicação de reflow do W3C](https://www.w3.org/WAI/WCAG21/Understanding/reflow). As verificações realizadas e as não realizadas estão discriminadas acima.

## H. Comparação profissional

Critérios: problema de negócio explícito; solução e contribuição identificáveis; tecnologias e arquitetura verificáveis; regras e limitações claras; demonstração acessível sem instalação; código/documentação; evidência de testes/resultados; possibilidade de reproduzir a avaliação. Não foram usadas notas de contratação ou probabilidades.

| Área | Evidências disponíveis e posicionamento | Limite para avaliação técnica aprofundada |
|---|---|---|
| Dados & BI | Quatro relatórios, perguntas de negócio, indicadores, comparações, capturas, vídeos e guias. A nova metodologia distingue preparação, análise e interpretação | Origem e modelo não documentados neste repositório; não permite verificar integralmente tratamento, DAX e cálculos |
| Python | Cinco aplicativos Windows, APIs/regras descritas, processamento local e otimização. VoxTexto possui repositório público; há pacotes-fonte para Chronos, NexoLog e NexoFiscal. Registro de 60 testes fiscais verificável | Distribuição funcional e testes delimitados não demonstram escala, manutenção ou resultados de produção; código do Ateliê Verde não é oferecido nesta página |
| Full Stack | React/TypeScript, FastAPI/Flask conforme o projeto, persistência, migrações, autenticação, permissões e fluxos de ponta a ponta descritos; materiais permitem leitura sem EXE | O portfólio é estático; operação real das APIs exige ambiente local. Não apresenta validação universal de segurança ou disponibilidade |
| Automação de processos | Filas, workers, estados, exportações, documentos, rastreabilidade e integrações opcionais possuem contexto empresarial | n8n opcional/desativado ou bloqueado conforme o projeto; não alegar automação externa de produção nem envios reais por demonstração |
| Engenharia de Dados e Integrações | Modelagem relacional, migrações, importação/exportação e integração entre módulos oferecem evidências iniciais | Não foi identificado um caso público completo de pipeline reprodutível com origem, qualidade, execução incremental e observabilidade; possível expansão futura |

O conjunto facilita uma primeira leitura por recrutadores: contexto, fluxo, evidência visual, manual e alternativa técnica estão localizáveis. A distinção entre demonstração, teste e produção permanece explícita. O ponto a aprofundar para Dados/Engenharia de Dados é a reprodução da transformação e das medidas, sem converter ausência de material em alegação de experiência inexistente.
