# Padrão de apresentação dos projetos

Revisão de 01/11/2026. Autoria: Leandro Augusto Ferreira.

## Organização

O portfólio reúne nove projetos publicados: cinco aplicativos Windows e quatro relatórios Power BI. A seleção de destaques apresenta Chronos, VoxTexto e Análise de Churn. As listas seguintes separam aplicativos e dashboards, com cartões de proporção consistente, resumo, tecnologias e acesso ao projeto e ao manual.

Os espaços de projetos futuros foram retirados da seleção publicada. Os endereços existentes e as âncoras dos aplicativos foram preservados. A Análise de Churn ganhou uma página própria; seu relatório original continua acessível por essa página.

## Página e guia

Cada projeto apresenta problema, solução e pontos de implementação que podem ser avaliados. As identidades existentes, as capturas reais, os vídeos, as galerias e os controles compartilhados foram mantidos. A assinatura do autor aparece nas páginas e nos guias.

O manual abre em nova aba e é lido em HTML, com índice e roteiro rápido. As explicações técnicas ficam ao final. Os relatórios Power BI utilizam guias de leitura, em vez de um executável artificial para abrir a visualização online.

O PDF demonstrativo do NexoFiscal continua disponível como exemplo de saída do aplicativo. Ele é um documento fiscal simulado, diferente de um manual de uso.

## Distribuições

- Chronos: executável já validado na entrega anterior, preservado nesta revisão.
- VoxTexto V2.0: instalador oficial preservado. Arquivo local conferido com o tamanho e o SHA-256 informados pela release pública.
- NexoLog: executável existente preservado e testado novamente em uma pasta isolada, sem Python ou Node no PATH.
- Ateliê Verde: ZIP oficial com EXE e pasta de recursos preservado. Tamanho e SHA-256 conferidos com a release pública. O guia explica a extração completa e a necessidade de conexão própria para o assistente.
- NexoFiscal 0.1.0: nova distribuição independente para Windows, com base fictícia por instalação, manual HTML e configuração de desenvolvimento excluída. O teste do EXE verificou autenticação, emissão simulada, PDF, preparação de mensagem, bloqueio do envio real pelo perfil público e integridade SQLite. SMTP e n8n iniciam sem configuração.

As informações de integridade ficam em `downloads/portfolio-distribuicoes.json` e nos manifestos específicos. A existência de uma demonstração não representa liberação operacional de produção nem comprovação de resultados de negócio.

## Manutenção

`tools/project_catalog.json` centraliza nomes, links, resumos e informações de cada projeto. Os textos dos novos guias ficam em `docs/manuais`. Execute `python tools/standardize_projects.py` para regenerar os guias, as páginas analíticas, os blocos comuns das páginas de aplicativos e os cartões da página inicial.

A edição atual do Chronos permanece na estrutura própria já aprovada; o catálogo aponta para sua página e seu manual existentes. O gerador preserva os marcadores Chronos dos cartões para compatibilidade com seu fluxo de manutenção.

`assets/project-standard.css` cuida da apresentação comum, com cores próprias por projeto e ajustes para telas estreitas. O gerador pode ser repetido sem duplicar blocos ou alterar o resultado.

## Verificações

- 19 páginas HTML: nove apresentações, nove guias e a página inicial.
- Links locais, âncoras, IDs, metadados, downloads e referências de recursos conferidos.
- Players compartilhados inicializados em DOM de teste; reprodução e pausa entre players verificadas. As regras CSS foram interpretadas sem erro nesse ambiente.
- 60 testes da API do NexoFiscal aprovados em uma cópia isolada, além dos testes dos iniciadores e dos executáveis.
- Binário e pacote fonte novos examinados sem achados de credenciais/configuração pessoal. O manual incluído no EXE foi comparado à edição web.

Não houve revisão visual automatizada em navegador real nesta etapa. As checagens de DOM e arquivos não substituem a observação do layout no navegador. Os links Power BI foram conferidos por HTTP; isso não representa inspeção visual de todos os dados e filtros carregados no serviço externo.

Os títulos e textos para Destaques do LinkedIn ficam em `docs/linkedin-destaques-padrao.md`. O acesso ao Chrome havia sido impedido pela revisão automática por limite de uso; o arquivo de conteúdo não comprova publicação no perfil.
