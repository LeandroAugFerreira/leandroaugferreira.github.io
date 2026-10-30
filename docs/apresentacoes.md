# Apresentações dos projetos

Todos os vídeos usam o mesmo mascote como apresentador, voz masculina neural em português brasileiro (Antonio) e legendas PT-BR e inglês. A captura inteira do sistema ocupa o quadro, preservando sua proporção, com o mascote no canto inferior esquerdo. Sua altura passou de 180 para 243 pixels, um aumento de 35%. Os títulos, as legendas e os controles ficam em áreas próprias do player, fora da imagem do sistema, inclusive em tela cheia. Não há painel lateral, rótulos do apresentador nem contadores de cenas. As capturas permanecem fixas, com cortes diretos e sem escurecer o quadro final; o visor do personagem acompanha a voz.

A página inicial tem anúncios curtos dos projetos; Chronos e VoxTexto também possuem players nos cartões de destaque. As páginas dos aplicativos oferecem apresentações mais detalhadas; as páginas dos dashboards mantêm os relatórios interativos.

| Projeto | Anúncio na página inicial | Apresentação completa |
| --- | --- | --- |
| Chronos 1.0 | 21.4 s | 82.3 s |
| VoxTexto | 19.1 s | 108.7 s |
| NexoLog | 17.4 s | 116.1 s |
| NexoFiscal | 19.9 s | 95.3 s |
| Ateliê Verde | 16.0 s | 126.7 s |
| Gestão Financeira | 16.7 s | Relatório interativo |
| Logística e Frota | 14.8 s | Relatório interativo |
| Análise Comercial | 15.7 s | Relatório interativo |
| Análise de Churn | 15.3 s | Relatório interativo |

Não há reprodução automática. Ao iniciar outro anúncio, o anterior é pausado. Os vídeos usam H.264/AAC e carregamento sob demanda.

A narração é gerada como uma fala contínua para cada vídeo, com ritmo de conversa e sem intervalos acrescentados nas mudanças de cena. O áudio permanece em uma única faixa durante toda a apresentação. As legendas e as trocas de tela acompanham os tempos das palavras.

Configuração da voz: `pt-BR-AntonioNeural`, ritmo `+3%` e tom `-2Hz`, com normalização de volume aplicada ao vídeo inteiro.

O player compartilhado está em `assets/video-player.js` e `assets/video-player.css`. Cada vídeo possui um arquivo `*-cenas.json` para sincronizar os títulos. As legendas selecionadas usam os tempos do WebVTT e são exibidas abaixo do vídeo. O modo de tela cheia abrange o player inteiro, preservando a separação entre imagem, textos e controles.

As capturas do Churn foram refeitas após carregar os visuais e os componentes personalizados. A página de risco inclui os gráficos, os insights e a tabela de clientes preenchida.

O VoxTexto é apresentado pelo propósito e pelo fluxo do aplicativo: selecionar gravações, transcrever, consultar o histórico e exportar Word. As capturas usam uma base isolada e uma transcrição real de um áudio de teste.

O conteúdo explicativo do NexoLog e Ateliê Verde foi preservado e reapresentado com o mascote.

A numeração pública do VoxTexto passou a V1.0 (antiga v1.2.0) e V2.0 (antiga v1.2.1). O download principal oferece o instalador V2.0, correspondente à interface demonstrada. A versão anterior V1.0 mantém o link histórico v1.2.0.

A imagem original e o prompt do mascote estão documentados em [mascote-vox.md](mascote-vox.md).

NexoFiscal incluído em 18/10/2026: capturas atuais de instalação isolada, dados fictícios, resumo e apresentação com os mesmos mascote e voz. Código-fonte distribuído sem banco/configurações locais; instalação e 60 testes aprovados. A página apresenta emissão simulada, sem validade fiscal e sem API pública.

Chronos 1.0 incluído em 27/10/2026: destaque na página inicial e página própria com manual público incorporado, texto acessível, PDF e código-fonte para avaliação. Os dois vídeos mantêm mascote de 243 pixels, Antonio, fala contínua, legendas PT/EN e controles fora da imagem. Seus visuais são diagramas explicativos identificados como ilustrativos, não capturas da aplicação. A página não hospeda o backend nem publica o administrador pessoal; a conta demo de consulta é descrita como acesso local a configurar em instalações novas. n8n e a liberação operacional de produção permanecem pendentes no projeto.
