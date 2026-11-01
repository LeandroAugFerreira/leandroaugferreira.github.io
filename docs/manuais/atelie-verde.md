# Manual do Ateliê Verde

Da loja ao acompanhamento do jardim: um roteiro para explorar o portal do cliente, a gestão e o assistente Rafinha.

## O que este projeto resolve

O Ateliê Verde conecta venda de plantas e produtos, serviços de jardinagem e execução de paisagismo. O portal do cliente e o ambiente administrativo compartilham regras, estoque e registros financeiros.

A identidade botânica faz parte da experiência: imagens do catálogo, conteúdo de cultivo e o Rafinha aproximam a apresentação dos produtos do uso prático.

## Baixe e abra no Windows

1. Na página do projeto, baixe **AtelieVerde-Windows.zip**.
2. Extraia **a pasta inteira** para um local do seu computador.
3. Abra **AtelieVerde.exe** e aguarde a interface no navegador.
4. Mantenha os arquivos extraídos e a janela do aplicativo enquanto usa a demonstração.

O ZIP contém o aplicativo e seus recursos. Não é um pacote apenas de código-fonte. Não mova somente o EXE: a pasta `_internal` precisa continuar junto dele. Não é necessário instalar Python ou Node.js para utilizar essa distribuição.

## Escolha o perfil

Na tela de login há atalhos **Administrador** e **Cliente**.

- **Cliente:** `cliente@atelieverde.local`
- **Administrador:** `admin@atelieverde.local`
- **Senha pública de demonstração:** `AtelieVerde@2026`

As contas e os dados são fictícios. O cadastro público cria clientes; o acesso administrativo demonstra a gestão. Não utilize informações pessoais reais para experimentar os fluxos.

## Roteiro de cinco minutos

1. Entre como **Cliente** e percorra a loja, as categorias e o detalhe de uma planta.
2. Veja as fotos, as informações de cultivo e as opções de produtos e serviços.
3. Consulte os exemplos de projetos e o acompanhamento disponível para a conta.
4. Saia e entre como **Administrador** para conhecer o dashboard, o estoque e a organização dos serviços.
5. Observe como pedidos, agendamentos, orçamentos e projetos possuem estados próprios.

O cliente consulta os registros vinculados à sua conta. Trocar de perfil ajuda a entender a separação entre a experiência de compra e o controle da operação.

## Loja, pedidos e serviços

No catálogo, use as categorias e abra o produto para conferir suas informações antes de adicionar itens. A conclusão de um pedido atualiza os registros relacionados, conforme as regras da aplicação.

Nos serviços, consulte a descrição e siga os campos solicitados para um agendamento. Os horários e responsáveis precisam ser compatíveis com a disponibilidade cadastrada.

A demonstração não representa uma compra, um pagamento ou uma contratação real de jardinagem.

## Orçamentos, projetos e gestão

Uma solicitação de paisagismo pode reunir fotos, medidas e necessidades do espaço. Na administração, acompanhe proposta, aprovação e execução, com espécies, materiais e etapas do projeto.

O estoque reúne entradas, saídas e alertas. O financeiro acompanha receitas, despesas, vencimentos e baixas. A área de consumo registra materiais utilizados em um projeto e ajuda a relacionar execução e custo histórico.

Use dados pequenos e fictícios para avaliar uma alteração e confira seus efeitos nas áreas relacionadas antes de repetir a ação.

## Rafinha e conexão própria

O Rafinha é o assistente ilustrado do Ateliê Verde. Suas expressões, o histórico de conversa e a apresentação progressiva das respostas integram o portal.

As conversas dependem de uma **conexão ChatGPT autorizada na própria instalação**. O download não inclui a conta ou as credenciais do autor. A configuração fica em **Administrador → Configurações → Inteligência Artificial**. Siga o fluxo de autorização apresentado pelo aplicativo com uma conta própria elegível.

Sem conexão, você pode explorar o catálogo e as demais funções. Pesquisa e respostas dependem da disponibilidade da conta e do serviço conectado. Conteúdo gerado deve ser conferido antes de orientar uma compra ou um cuidado específico com plantas.

## Salve e encerre

Os dados da demonstração são mantidos localmente, fora do pacote distribuído. A instalação preserva os registros entre aberturas. As conversas, fotos e documentos seguem os vínculos de acesso do sistema.

Ao terminar, encerre a sessão e feche a janela de controle do aplicativo. Não publique sua pasta de dados, uploads ou armazenamento de credenciais ao compartilhar o projeto.

## Para quem avalia o desenvolvimento

O projeto usa **React, TypeScript, FastAPI, Python, SQLAlchemy e SQLite**. Observe a integração entre portal e administração, as transações de pedidos e estoque, os estados dos orçamentos e a separação dos dados por usuário.

A identidade visual, o catálogo e o Rafinha foram trabalhados como parte do produto. A integração do assistente complementa os fluxos comerciais e operacionais; as regras e os registros permanecem na aplicação.
