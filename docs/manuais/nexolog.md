# Manual do NexoLog

Explore uma operação de logística: produtos, estoque, pedidos, entregas e indicadores conectados em uma demonstração local.

## O que este projeto resolve

O NexoLog reúne as etapas entre cadastrar um produto e acompanhar sua entrega. O objetivo é dar visibilidade ao estoque, às reservas, aos pedidos e ao histórico das operações.

A base inicial é fictícia: **144 produtos e variantes, 24 fornecedores, 48 clientes e 408 pedidos**, com histórico de 2024 a 2026. Esses números descrevem a demonstração e podem mudar depois das suas alterações.

## Baixe e entre

1. Baixe **NexoLog.exe** na página do projeto e abra o arquivo em Windows de 64 bits.
2. Aguarde a abertura do navegador. Se necessário, use o endereço apresentado pela janela do aplicativo.
3. Na tela de login, clique em **Usar acesso demo**.
4. Mantenha a janela do NexoLog aberta enquanto explora o sistema.

O executável inclui os recursos de execução. Não exige instalação de Python ou Node.js.

- **E-mail público:** `demo@nexolog.app`
- **Senha de demonstração:** `NexoLog@2026`

Essas credenciais pertencem à base fictícia. Use apenas dados de teste durante a avaliação.

## Roteiro de cinco minutos

1. **Dashboard:** observe os indicadores, o fluxo de estoque, os pedidos recentes e os alertas.
2. **Produtos:** consulte categoria, marca, variante e código de barras. Confira como cada item mantém saldo e preço.
3. **Pedidos:** abra o Kanban e percorra as etapas de processamento, expedição e entrega.
4. **Rastreamento:** abra um pedido e acompanhe o mapa esquemático e o histórico da entrega simulada.
5. **Relatórios:** aplique um período e consulte os indicadores e registros de auditoria.

O rastreamento é uma simulação de transporte. Não consulta GPS ou uma transportadora real.

## Produtos, parceiros e estoque

Os cadastros de produtos, clientes e fornecedores oferecem busca, filtros e informações para consulta e edição. Antes de criar um pedido, confira os itens e o saldo disponível.

As operações de estoque mantêm movimentações e reservas. Uma reserva representa quantidade comprometida com um pedido; não deve ser confundida com uma nova entrada física de mercadoria.

Para avaliar o comportamento, utilize um produto fictício com saldo disponível e acompanhe o efeito de uma operação pequena. Confira os registros antes de repetir a mesma ação.

## Pedidos e entregas

Crie um pedido com os dados solicitados e acompanhe seu estado no Kanban. Expedição, cancelamento e devolução seguem regras próprias para manter a relação entre o pedido e o estoque.

Para repetir uma entrega de demonstração, abra o detalhe do rastreamento e escolha **Simular outra entrega hoje**, quando disponível. Os eventos e resultados são registrados no banco enquanto o aplicativo está em execução.

Use os filtros de período para comparar os pedidos exibidos. Um resultado filtrado não representa necessariamente toda a operação.

## Relatórios e continuidade

Relatórios por período, exportações CSV e auditoria ajudam a relacionar os indicadores às operações que os originaram. Um arquivo exportado passa a existir fora do controle de acesso do aplicativo; escolha uma pasta apropriada para guardá-lo.

Os dados ficam em `%LOCALAPPDATA%\NexoLog`, separados do executável. A demonstração reutiliza essa base nas próximas aberturas. Atualizar o programa não deve substituir seu banco local.

Ao terminar, encerre a sessão e feche a janela do NexoLog. A aba do navegador pode continuar aberta, mas deixa de receber dados quando o serviço local é encerrado.

## Para quem avalia o desenvolvimento

O projeto usa **React, FastAPI, Python, SQLAlchemy e SQLite**, com distribuição Windows por PyInstaller.

Observe a relação entre reservas, estoque e estados do pedido, o uso de transações, os perfis de acesso, a persistência do rastreamento e os registros de auditoria. O objetivo da demonstração é mostrar como uma ação operacional repercute nos dados e nos indicadores.

O código-fonte está disponível na página do projeto como alternativa para análise técnica.
