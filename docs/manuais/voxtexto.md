# Manual do VoxTexto V2.0

Transforme gravações em texto e documentos Word. Este guia começa pelo uso do aplicativo e termina com os pontos que ajudam a avaliar sua implementação.

## O que este projeto resolve

O VoxTexto organiza a passagem de uma gravação para um documento revisável. Reúne seleção de mídias, fila de processamento, transcrição, histórico por usuário e exportação Word.

Para uma avaliação rápida, use uma gravação curta que você tenha autorização para processar. A precisão depende da qualidade do áudio, do idioma, dos ruídos e da fala; revise o texto antes de utilizá-lo.

## Instale e abra

1. Na página do projeto, clique em **Baixar para Windows — V2.0**.
2. Abra o instalador e acompanhe as instruções apresentadas.
3. Inicie o **VoxTexto** pelo atalho criado. A interface abre no navegador, com processamento no seu computador.
4. Crie sua conta no primeiro acesso ou entre com uma conta que você já cadastrou nessa instalação.

O instalador inclui os recursos de execução, inclusive FFmpeg. Não é necessário preparar Python ou um ambiente de desenvolvimento. O modelo Whisper pode precisar de download na primeira utilização; tenha conexão com a internet nessa etapa. Depois de disponível, a transcrição é local.

Se a política do computador impedir a instalação, consulte o responsável pelo equipamento. Os vídeos e as telas da página permitem conhecer o projeto sem instalar o aplicativo.

## Roteiro de cinco minutos

1. **Selecione:** adicione um áudio curto e confira os dados do arquivo. Também é possível selecionar uma pasta ou arrastar mídias para a área de envio.
2. **Transcreva:** inicie a fila e acompanhe o status do arquivo e os cronômetros.
3. **Leia:** abra o resultado e confira o texto reconhecido.
4. **Exporte:** baixe o documento Word para continuar a revisão.
5. **Consulte novamente:** procure o item no histórico e observe os filtros e as estatísticas da sua conta.

Use os temas Escuro, Claro e HUD para conhecer as opções da interface. A apresentação do portfólio mostra o fluxo com uma gravação de teste.

## Arquivos e fila de processamento

A V2.0 aceita **MP3, WAV, MP4, M4A e OGG**. O suporte OGG inclui Vorbis e Opus. Confira o formato antes de iniciar; uma extensão alterada manualmente não converte o conteúdo da mídia.

Os arquivos são processados em sequência. É possível adicionar novos itens, acompanhar os estados individuais e pausar entre arquivos. O cancelamento interrompe a transcrição e prepara o worker para a próxima tarefa. Se um arquivo falhar, confira sua integridade e use a opção de tentar novamente quando disponível.

A duração do processamento depende do tamanho da gravação e do computador. Começar com um áudio curto ajuda a verificar o fluxo antes de enviar uma pasta inteira.

## Histórico, documentos e privacidade

O histórico permite buscar resultados da própria conta e consultar novamente o texto e o Word. A administração de contas segue os perfis do aplicativo.

O processamento das mídias é local; elas não são encaminhadas a uma API externa de transcrição. Ainda assim, cuide dos arquivos e documentos salvos no computador, principalmente se contiverem informações de outras pessoas. O documento exportado pode ser aberto fora do aplicativo e não mantém o controle de acesso do histórico.

Ao terminar, aguarde a conclusão ou cancele a fila e encerre o aplicativo pela janela de controle. Fechar somente a aba do navegador não garante o encerramento do processamento.

## Para quem avalia o desenvolvimento

O projeto usa **Python, Flask, Whisper, FFmpeg, SQLite, JavaScript e python-docx**. A distribuição Windows utiliza PyInstaller e Inno Setup.

Observe a separação entre interface e worker de transcrição, o tratamento de cancelamentos e falhas, a persistência do histórico por usuário e a geração de documentos. O foco é um fluxo completo de uso local, com uma interface para acompanhar tarefas demoradas.

A versão pública atual é **V2.0**. A numeração anterior aparece nos arquivos históricos do repositório; a página do projeto aponta para o instalador atual. Código e documentação permanecem disponíveis como alternativa para avaliação técnica.
