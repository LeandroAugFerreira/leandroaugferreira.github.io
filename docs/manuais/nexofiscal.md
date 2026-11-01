# Manual do NexoFiscal 0.1.0

Explore a jornada entre cadastrar um cliente, revisar um serviço e gerar um documento demonstrativo. Nenhuma emissão desta demonstração possui validade fiscal.

## O que este projeto resolve

O NexoFiscal organiza o fluxo **cliente → serviço e valor → revisão → documento e histórico**. O projeto atende à demonstração de serviços de diferentes segmentos, com clientes pessoa física e jurídica.

É uma aplicação de portfólio com emissão simulada. Não transmite notas à prefeitura nem recebe autorização governamental. O PDF gerado pelo aplicativo mantém a identificação de demonstração.

## Baixe e abra o aplicativo

1. Na página do projeto, baixe **NexoFiscal.exe** para Windows de 64 bits.
2. Abra o arquivo e aguarde a janela indicar que está pronto.
3. O aplicativo abre no navegador. Se isso não acontecer, clique em **Abrir NexoFiscal**.
4. Mantenha a janela do aplicativo aberta durante o uso.

O executável inclui a interface, a API e os recursos necessários para a demonstração. Não exige instalação de Python, Node.js, Docker ou n8n. A primeira execução cria uma base fictícia própria no seu computador.

Se a política do computador impedir a abertura, confira a origem do arquivo e procure o responsável pelo equipamento. Você também pode conhecer o projeto pelos vídeos e pelas telas da página.

## Entre no portfólio

Na tela de login, escolha **Entrar no portfólio**. O executável prepara essa conta automaticamente.

- **E-mail público:** `portfolio@nexofiscal.example.com`
- **Senha de demonstração:** `NexoFiscalDemo@2026`

O perfil permite explorar a emissão simulada e preparar uma mensagem de e-mail, mas não envia mensagens reais. A instalação inicia sem remetente SMTP e sem conexão n8n.

Para avaliar a administração com dados fictícios, a edição local também mantém a conta demonstrativa `admin@nexofiscal.example.com`, com senha pública `Adm@2026`. Essas contas são exclusivas da demonstração e não devem ser usadas para uma operação real.

## Roteiro de cinco minutos

1. Abra **Sobre e demonstração → Demonstração**.
2. Escolha um exemplo de pessoa física, pessoa jurídica ou rejeição. A escolha preenche um exemplo; ainda não emite um documento.
3. Em **Emitir NFS-e**, percorra cliente, serviço, valor e revisão.
4. Confira a revisão pelo servidor e escolha **Emitir NFS-e simulada**.
5. Abra o resultado, consulte o histórico e baixe o PDF demonstrativo.

Listas e históricos usam cinco itens por página. Os filtros ajudam a localizar registros; limpar ou alterar um filtro pode mudar o conjunto de resultados exibido.

## Clientes e revisão

O cadastro distingue pessoas físicas e jurídicas e valida os campos solicitados. Use os exemplos fictícios incluídos para avaliar o fluxo sem inserir dados reais.

A emissão avulsa permite selecionar um cliente e um serviço, informar valor, competência e descrição e revisar os dados antes da confirmação. Ela não exige criar um contrato, uma cobrança ou um pagamento apenas para gerar a nota simulada.

Os campos e as mensagens de revisão ajudam a identificar uma pendência antes da emissão. Se uma operação for recusada por conflito ou repetição, confira o estado do documento antes de tentar novamente.

## Documento e histórico

No detalhe da nota, consulte **Documento**, **Dados da nota** e **Histórico fiscal**. O exemplo de rejeição permite acompanhar o reprocessamento e suas tentativas.

O PDF, a visualização HTML e o XML demonstrativo representam a mesma operação simulada. A marca-d’água e os identificadores deixam esse escopo explícito. O arquivo XML é próprio da demonstração; não representa integração oficial com uma prefeitura.

O cancelamento de exemplo também é simulado e permanece registrado no histórico.

## E-mail e automações

Na área **E-mail**, o visitante pode usar **Avançado → Baixar mensagem (.eml)** para preparar uma mensagem com o PDF anexo. Preparar o arquivo não equivale a enviar um e-mail.

O envio real exige perfil autorizado e uma conta remetente configurada pelo operador. Nenhuma conta Gmail, senha SMTP ou credencial do autor acompanha o download. Para a avaliação inicial, mantenha a demonstração sem remetente.

A central reúne seis rotinas locais relacionadas a emissão, preparação de entrega, lembretes, falhas, fechamento e alertas. A integração com n8n é opcional e não é iniciada pelo executável de demonstração.

## Continuidade e encerramento

As alterações confirmadas ficam na base local. A próxima abertura reutiliza a mesma instalação, sem copiar o banco do autor ou apagar seu progresso.

O botão **Pasta de dados** abre `%LOCALAPPDATA%\NexoFiscal\0.1-demo`. Essa pasta contém dados e configuração da sua instalação. Encerre o aplicativo antes de fazer uma cópia de segurança e não publique essa pasta.

Use a opção de sair da conta e, depois, **Encerrar** na janela do NexoFiscal. Fechar somente a aba do navegador não encerra a API local.

## Para quem avalia o desenvolvimento

O projeto usa **React, FastAPI, Python, SQLAlchemy, SQLite e Alembic**, com geração de PDF e preparação de mensagens com anexo. Há configuração opcional de automações n8n.

Observe a revisão no servidor, a proteção contra emissão duplicada, os perfis de acesso, as transações e o histórico das tentativas. A proposta é mostrar uma jornada completa e rastreável, mantendo clara a diferença entre simulação e integração fiscal oficial.

Código-fonte, manifesto de integridade e apresentação estão disponíveis na página do projeto. A demonstração Windows não constitui liberação para emissão fiscal real.
