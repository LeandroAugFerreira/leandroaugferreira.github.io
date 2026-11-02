# Evolução estratégica do portfólio — 01/11/2026

## A. Resumo executivo

Implementação local no repositório original `portfolio`, branch `main`, a partir de `f099ce0edf6e6e4582ddc46e5ac6e6ce256a665a`. A árvore estava limpa. Antes das alterações, foram registrados 197 arquivos e produzido um ZIP de restauração integral, guardado fora do repositório e conferido por CRC.

A auditoria examinou as 19 páginas: início; cinco aplicativos; quatro dashboards; nove manuais. A comparação de **176 recursos publicados** confirmou correspondência com o commit inicial. Dois XML exigiram comparação com o blob Git por diferenças de fim de linha da cópia de trabalho. O workflow Pages desse commit havia concluído com sucesso. Não foi confirmada diferença de publicação ou cache.

A página inicial tinha 12 cards distribuídos em três listagens para nove projetos. A nova versão reúne os nove projetos uma única vez, com quatro filtros e quatro destaques primeiro. Reutiliza o seletor de metodologias e revisa introdução, resumos, posicionamento profissional, competências e contato. As apresentações completas, os manuais e os downloads foram preservados.

**Esta evolução não foi publicada, commitada ou enviada ao remoto.** Nenhum sistema apresentado, algoritmo, API, banco ou integração foi alterado. A implementação e os testes locais estão entregues; o aceite visual da nova versão em navegador real permanece pendente, conforme descrito em F/H.

### Diagnóstico e classificação

| Classificação / arquivo | Achado | Gravidade | Correção e risco | Validação |
|---|---|---|---|---|
| Melhoria aprovada — início/gerador | Chronos, VoxTexto e Churn repetidos; 12 cards para nove projetos | Editorial média | Listagem única; risco de perder âncoras ou tocar um vídeo oculto | Contagem, identidade dos nós, links antigos e pausa testados |
| Funcionalidade já adequada — Método | Dois métodos com rádios nativos já funcionavam | Sem defeito confirmado | Reutilizar comportamento; atualizar textos, sem criar outro seletor | Trocas de método e independência em relação aos projetos testadas |
| Melhoria aprovada — início/catálogo | Posicionamento pouco explícito sobre software e gestão de processos | Editorial média | Textos revisados sem inventar carreira, certificações ou resultados | Comparação com conteúdo público e referência fornecida pelo autor |
| Funcionalidade já adequada — 19 páginas | Metadados, H1, IDs, alt, rotas, manuais e distribuições presentes | Sem defeito confirmado | Preservar; atualizar apenas metadados associados aos novos resumos | Validação estática e comparações de preservação |
| Funcionalidade já adequada — VoxTexto | V2.0 consistente com a release oficial | Sem defeito confirmado | Versão, instalador e histórico mantidos | Tag e digest verificados na API pública |
| Verificação pendente — BI | Base, PBIX e fórmulas não acompanham o repositório do portfólio | Documental | Não inventar DAX, Power Query, SQL ou metodologia atribuídos a um relatório específico | Inventário e consulta aos formatos PBIX/PBIT/DAX/PQ no workspace |
| Verificação pendente — contato | Currículo não encontrado no portfólio | Baixa | Nenhum PDF ou endereço presumido | Inventário dos arquivos e links |
| Verificação limitada — LinkedIn | HTTP 999 nesta rodada | Não confirma defeito | URL preservada; na auditoria anterior o navegador abriu o perfil correto | Limitação registrada, sem declarar novo teste visual aprovado |
| Funcionalidade já adequada — placeholders | Novo projeto 02/03 e faixa de contagem já estavam ausentes | Sem defeito | Não recriar | Ausência verificada |

Os links de downloads, GitHub e quatro relatórios Power BI responderam com 2xx. `sql.html` e `excel.html` seguem sem referências ativas; não foram recriados por causa de URLs históricas. `python.html` continua sendo o VoxTexto. A API pública de configuração Pages respondeu 404; nenhuma configuração ou origem de publicação foi presumida ou alterada.

## B. Reorganização dos projetos

Há uma seção **Projetos**, com a introdução solicitada: “Explore soluções em desenvolvimento de software, automação de processos, inteligência artificial e análise de dados.”

| Filtro | Quantidade | Ordem |
|---|---:|---|
| Todos, padrão | 9 | Chronos, VoxTexto, NexoLog, Análise de Churn, Ateliê Verde, NexoFiscal, Gestão Financeira, Logística e Frota, Análise Comercial |
| Destaques | 4 | Chronos, VoxTexto, NexoLog, Análise de Churn |
| Desenvolvimento & Automação | 5 | Chronos, VoxTexto, NexoLog, Ateliê Verde, NexoFiscal |
| Dados & BI | 4 | Análise de Churn, Gestão Financeira, Logística e Frota, Análise Comercial |

Os quatro destaques recebem apenas uma marca no estilo das tags existentes. Todos usam a mesma classe de card, estrutura, botões e proporção de mídia. As categorias e o indicador de destaque ficam em `tools/project_catalog.json`.

Os filtros são rádios nativos dentro de um fieldset com legenda e rótulos. O JavaScript usa `hidden` nos nove artigos já existentes: não clona, recria ou duplica cards. O CSS corretivo faz o ocultamento prevalecer sobre o display flex original. Cada troca mantém o foco no filtro, anuncia a quantidade e pausa os vídeos que ficarem ocultos, conservando sua posição de reprodução. A grade se reorganiza; não há rolagem programática numa troca normal de filtro.

Sem JavaScript, os nove projetos continuam visíveis e os filtros ficam desabilitados. As preferências de movimento reduzido são respeitadas pelo CSS existente dos cards e pela regra de rolagem acrescentada à home.

As âncoras `#chronos-aplicacao`, `#featured-voxtexto` e `#featured-churn` apontam para os mesmos cards únicos. `#aplicativos` e `#dashboards` continuam úteis como entrada para o filtro correspondente. Ao abrir a home sem uma entrada antiga de categoria, Todos é o padrão. Um link para card oculto pode revelar a lista antes de posicioná-lo, sem mover o foco para outro controle.

## C. Metodologias

Foi preservada a implementação existente: quatro cards, números 01–04, estilos originais e reserva de espaço pela sobreposição de textos em grid. O conteúdo inativo fica invisível e fora da árvore acessível; não há altura fixa que corte o texto. A cópia original de conteúdo permanece como reserva invisível.

A introdução foi substituída pelo texto solicitado sobre as diferenças entre Dados/BI e Desenvolvimento/Automação, concluindo com “Conheça as etapas que orientam cada abordagem”. Os cards usam resumos fiéis das referências extensas, descritos em [Metodologias](metodologias.md).

- **Dados & BI:** Entendimento do Negócio; Preparação e Modelagem; Análise e Visualização; Insights e Decisões.
- **Desenvolvimento & Automação:** Análise de Requisitos; Arquitetura da Solução; Desenvolvimento e Integração; Testes, Entrega e Evolução.

Os seletores têm nomes, escopos e status separados. Os testes alternaram as duas metodologias sem mudar o filtro de projetos e vice-versa. A escolha inicial continua Dados & BI. Os controles nativos oferecem semântica e operação por teclado; a verificação real de setas, altura, quebras de linha e leitor de tela desta nova redação segue pendente. As medições da auditoria anterior não foram reutilizadas como aprovação visual dos novos textos.

## D. Conteúdo profissional

### Cabeçalho — index.html

Título: **Desenvolvimento de Software | Dados & BI | Automação de Processos.**

Apresentação: “Desenvolvo aplicações com Python, React e FastAPI, automações e dashboards com SQL e Power BI. Conecto processos, dados e tecnologia para organizar rotinas e apoiar decisões.”

Disponibilidade: “Disponível para oportunidades em Software, Dados & BI e Automação”. O nome e a fotografia foram preservados. O title e a meta description da página foram atualizados de modo coerente, incluindo Open Graph, sem inserir um cargo ou senioridade.

### Sobre mim — index.html

“Minha trajetória combina experiência em gestão de processos e melhoria contínua com o desenvolvimento de soluções para rotinas empresariais.

Essa visão de negócio orienta meus projetos autorais em Desenvolvimento de Software, Dados, Business Intelligence e Automação. Parto das necessidades dos usuários para organizar informações, definir regras e escolher as ferramentas adequadas.

O portfólio reúne aplicações full stack, sistemas de gestão, transcrição com inteligência artificial e dashboards. Python, SQL, Power BI, React e FastAPI fazem parte das implementações apresentadas.

Busco oportunidades para unir conhecimento de processos e capacidade técnica no desenvolvimento de soluções digitais e na transformação de dados em decisões.”

### Competências — index.html

Os mesmos quatro cards agora apresentam Desenvolvimento de Software; Dados & Business Intelligence; Automação & Inteligência Artificial; Processos & Gestão. Foram preservadas as tecnologias já publicadas e acrescentadas competências sustentadas pelas aplicações/referência do autor, como APIs REST, SQLAlchemy, Alembic, mapeamento de processos e regras de negócio.

DAX e Power Query não foram acrescentados como implementações comprovadas dos dashboards: não foi encontrado material que permita vincular medidas ou transformações aos relatórios originais. Nenhuma medida foi inventada. Não se declarou formação, certificação, tempo de experiência, uso em produção ou ganho financeiro.

### Contato — index.html

Título: **Vamos transformar desafios em soluções?**

Texto: “Tenho interesse em oportunidades em Desenvolvimento de Software, Python, Dados & BI e Automação de Processos. Explore os projetos e entre em contato para conversarmos sobre colaboração e novos desafios.”

E-mail, LinkedIn e GitHub permanecem nos botões existentes, com os endereços já publicados. Nenhuma mensagem foi enviada, perfil editado ou link de currículo inventado.

### Resumos — catálogo e cards

| Projeto | Resumo revisado |
|---|---|
| Chronos | Gestão de jornadas e escalas com cenários, custos e otimização OR-Tools, sujeita à revisão humana. |
| VoxTexto | Transcrição local de áudio e vídeo com Whisper e FFmpeg, fila de tarefas, histórico e exportação Word. |
| NexoLog | Gestão logística full stack com estoque, reservas e pedidos integrados a indicadores e entregas simuladas. |
| Ateliê Verde | Loja e gestão de jardinagem e paisagismo: catálogo, pedidos, serviços, projetos e financeiro, com o Rafinha. |
| NexoFiscal | Protótipo de emissão simulada de NFS-e, com revisão no servidor, documento demonstrativo e histórico. |
| Análise de Churn | Cancelamentos, impacto financeiro e segmentos da base para investigar padrões e perguntas de retenção. |
| Gestão Financeira | Receitas, despesas, margens e fluxo de caixa para acompanhar o resultado e compará-lo com o planejamento. |
| Logística e Frota | Viagens, pontualidade, volume e tempo de transporte, com recortes por rota, cliente e tipo de frota. |
| Análise Comercial | Faturamento, lucro, margem e devoluções para comparar o desempenho comercial por produto, canal e região. |

Os nomes dos produtos foram mantidos. Não foram acrescentados custos de transporte, utilização de frota ou ticket médio às descrições quando esses indicadores não estavam sustentados pelo material examinado. As páginas completas preservam regras, arquitetura, fluxo, dados fictícios e limitações jurídicas/fiscais já documentados. As descrições de busca e compartilhamento foram atualizadas e encurtadas onde necessário. O arquivo local de rascunhos LinkedIn foi regenerado, sem publicação externa.

## E. Preservação visual

- **155 arquivos originais** em assets, imagens, mídias e downloads com hashes inalterados. Isso inclui todas as folhas de estilo e scripts preexistentes, foto, fundos, marcas, mascotes, Rafinha, capturas, executáveis, pacotes e manifestos.
- Os **14 vídeos e 28 legendas** continuam intactos e referenciados nas páginas. Foram retiradas três instâncias duplicadas do player na home, sem remover material multimídia.
- Os estilos inline da home e os atributos da fotografia são idênticos aos da base. A ordem mobile com foto acima do nome foi preservada.
- O corpo das quatro páginas de aplicativos revisadas é semanticamente igual ao anterior. Nos quatro BI, o corpo é igual exceto pelo resumo editorial. Chronos e todos os manuais permanecem na edição existente.
- Os novos arquivos de filtro reutilizam o seletor do Método, as cores já definidas e o card original. Não há fonte, paleta, tema, background, imagem ou framework visual novo.

A mudança de organização é a expressamente autorizada: uma grade no lugar de três listagens. Ela mantém os breakpoints existentes de três, duas e uma coluna. Não se afirma equivalência visual comprovada dos novos textos/filtros nas quatro resoluções sem uma nova inspeção de navegador.

## F. Testes executados, resultados e limites

Ambiente: Windows, Python local e Node.js 22. A integração utilizou uma instalação de desenvolvimento de JSDOM já disponível, sem instalar dependências ou alterar outro projeto. As verificações de mídia com mocks exercitam a lógica; não são reprodução física de áudio/vídeo.

| Verificação executada | Resultado |
|---|---|
| Diagnóstico público × base inicial | 176 recursos correspondentes ao commit; workflow Pages concluído com sucesso |
| Links públicos principais | GitHub, downloads/releases e quatro Power BI com 2xx; LinkedIn 999 identificado como limitação de automação |
| Validação estática atual | 19 páginas, nove projetos, 496 referências locais; zero erros |
| Listagem única | Nove artigos únicos, quatro destaques primeiro; sem seções antigas duplicadas |
| Filtros em integração DOM | Todos 9, Destaques 4, Desenvolvimento & Automação 5, Dados & BI 4; ordem preservada em trocas repetidas |
| Integridade durante filtragem | Mesmos nós, imagens, fontes de vídeo, posters e links; nenhuma navegação ou recriação de cards |
| Foco e status em DOM | Foco permanece no rádio usado; quantidade anunciável atualizada |
| Vídeo oculto | Pausado, com posição de reprodução preservada |
| Seletores independentes | Três alternâncias de metodologia, quatro cards corretos; filtro de projetos preservado |
| Âncoras e fallback | Rotas antigas e hash inválido tratados; sem JS, os nove projetos permanecem visíveis |
| Player, com mocks | Play/pause, pausa entre players, idioma, feedback de falha e recuperação preservados |
| CSS | Regras interpretadas no DOM; hidden prevalece e regra de movimento reduzido está presente |
| Erros de integração | Zero erros JSDOM |
| Regeneração | Idempotente, sem diferenças ao executar novamente |
| Preservação | 155 arquivos originais intactos, 42 vídeos/legendas referenciados, estilos inline e fotografia mantidos |
| Revisão Git | diff sem problemas de whitespace, HEAD original e staging vazio; nenhuma publicação |

Comandos: `python tools/check_portfolio.py`; `node tools/check_interactions.cjs <caminho-jsdom>`; `python tools/standardize_projects.py` para regenerar. Evidências detalhadas de inventário, HTTP, integração e preservação foram guardadas na pasta local da tarefa, fora do site.

| Conferência real da nova versão | Estado |
|---|---|
| Desktop 1920×1080 | Pendente |
| Notebook 1366×768 | Pendente |
| Tablet 768×1024 | Pendente |
| Mobile 390×844 | Pendente |
| Comparação de capturas anterior/nova | Pendente |
| Teclado nativo, leitor de tela e console real | Pendente |

A última tentativa de navegação da sessão foi impedida pela **revisão automática de aprovação por limite de uso da ferramenta**, com retomada então indicada para 21:51. Durante esta implementação, esse horário ainda não havia chegado. Não foi usado outro navegador, CDP, automação ou renderizador para contornar o bloqueio. Os testes locais de DOM foram descritos como tal, sem substituir o aceite visual. Capturas e medições da rodada anterior pertencem à versão anterior e não foram apresentadas como aprovação desta evolução.

Os controles nativos e seus agrupamentos seguem a [orientação de formulários do W3C](https://www.w3.org/WAI/tutorials/forms/grouping/). O uso de hidden considera a [especificação HTML](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute), inclusive a necessidade de impedir que o display do card anule o atributo. Essas referências não constituem certificação de acessibilidade.

## G. Arquivos modificados

1. `index.html`: listagem única, filtros, introduções, métodos, posicionamento, competências, sobre e contato.
2. `assets/project-filters.css`: complemento mínimo para filtros, hidden, âncoras e movimento reduzido.
3. `assets/project-filters.js`: filtragem, status, pausa de vídeo oculto e compatibilidade de âncoras.
4. `tools/project_catalog.json`: resumos e classificação dos quatro destaques; nomes, versões, tecnologias, cores e URLs originais preservados.
5. `tools/standardize_projects.py`: geração da listagem única e metadados editoriais coerentes.
6. `tools/check_portfolio.py`: contratos estáticos da nova listagem e dos filtros.
7. `tools/check_interactions.cjs`: integração reutilizável, sem dependência nova de execução do site.
8. `atelie-verde.html`, `nexolog.html`, `nexofiscal.html`, `python.html`: apenas meta descriptions e OG descriptions.
9. `churn.html`, `financeiro.html`, `transporte.html`, `venda.html`: resumo e metadados correspondentes.
10. `docs/chronos.md`: documentação do card único e da âncora antiga.
11. `docs/metodologias.md`: conteúdo atual e limites da validação visual.
12. `docs/padrao-dos-projetos.md`: manutenção da listagem única e distinção entre evidências antigas/atuais.
13. `docs/linkedin-destaques-padrao.md`: rascunhos locais atualizados, sem envio ao perfil.
14. Este relatório.

São 20 arquivos, contando individualmente as páginas agrupadas acima. Não houve exclusão de arquivo nem alteração em outro repositório.

## H. Pendências

- Inspeção visual real nas quatro resoluções, alternância nativa por teclado, leitor de tela e console, após liberação da ferramenta. É o ponto ainda necessário para o aceite visual completo.
- Currículo: arquivo não encontrado no repositório; nenhum download fictício adicionado.
- Datasets, PBIX, DAX, Power Query e fórmulas dos BI: não disponibilizados como evidência reprodutível neste portfólio; preservadas as notas de limitação.
- LinkedIn: HTTP bloqueado nesta rodada; URL mantida com a confirmação visual histórica identificada como anterior. Nenhuma publicação foi feita.
- Observação antiga sobre unidades do Financeiro: não retestada nesta rodada e não corrigida por suposição; depende do relatório/modelo original.
- Publicação desta evolução: não autorizada neste novo pedido e, portanto, não executada. O site público permanece no commit inicial.

## I. Recomendações futuras

Concluir a conferência visual antes de publicar esta evolução. Quando houver material verificável, documentar as fontes, transformações, medidas e regras de cálculo dos dashboards; disponibilizar apenas amostras e arquivos autorizados. Acrescentar currículo validado quando estiver disponível.

Um projeto de Engenharia de Dados pode futuramente demonstrar origem, ETL/ELT, qualidade, execução incremental, integração e observabilidade. **DataFlow não foi criado nesta etapa**, nem apresentado como trabalho concluído. Qualquer novo sistema, mudança relevante de identidade ou publicação exige escopo e autorização próprios.
