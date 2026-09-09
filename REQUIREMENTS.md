# Requisitos do Produto

## Contexto

O Logistics Hub centraliza a operacao corporativa de envios, malotes, acompanhamento e governanca de custos. Este documento registra os requisitos funcionais e a sequencia de implementacao das abas a partir de Malotes. Painel geral e Correios ficam fora deste escopo, pois serao tratados em requisitos proprios.

## Papeis

| Papel | Responsabilidade principal |
| --- | --- |
| Colaborador | Cria solicitacoes e acompanha somente seus proprios malotes e postagens. |
| Operador logistico | Opera o fluxo de malotes, atualiza status e apoia a confirmacao de entrega. |
| Administrador | Administra percursos, centros de custo, dados universais e consulta todos os registros. |

O operador logistico deve ser mantido. Sua responsabilidade e operacional, separada do colaborador, e nao se limita ao acesso a centros de custo.

## Malotes

### Requisitos funcionais

- Exibir somente as rotas fixas aplicaveis a regional do usuario.
- Manter os status `aguardando_coleta`, `em_transito` e `entregue` na lista de malotes; o primeiro nao deve aparecer como indicador ou destaque global da tela.
- Permitir que o solicitante acompanhe os tres status do seu malote.
- Permitir que administrador e operador logistico acompanhem todos os malotes autorizados e atualizem seu status.
- Permitir que o administrador conclua um malote apos a confirmacao de entrega.
- Remover QR Code do fluxo e da interface atual.
- Remover valor estimado do formulario de registro de malote.
- Manter o registro de malote extensivel para novos campos, eventos e regras futuras.

### Implementacao

1. Ajustar regras de visibilidade de rotas e malotes por papel e regional.
2. Remover QR Code e valor estimado do formulario e dos dados de exibicao.
3. Criar transicoes de status com permissao por papel e trilha de auditoria.
4. Incluir confirmacao de entrega e acao de conclusao para administradores.

## Percursos

### Requisitos funcionais

- Permitir que administrador crie um novo percurso.
- Permitir suspender percursos aprovados.
- Permitir reativar percursos suspensos.
- Permitir cancelar percursos aprovados ou suspensos.
- Tratar cancelamento como definitivo: um percurso cancelado nao pode ser reativado; sera necessario criar outro.

### Implementacao

1. Adicionar formulario de novo percurso restrito ao administrador.
2. Modelar os estados `aprovado`, `suspenso` e `cancelado` e as transicoes permitidas.
3. Exibir acoes contextualizadas por status e registrar toda mudanca na auditoria.

## Notificacoes

### Requisitos funcionais

- Preservar o comportamento atual de leitura e filtragem.
- Remover qualquer mensagem que apresente integracao com Microsoft Teams como ativa.
- Tratar Teams apenas como integracao futura, sem prometer notificacao externa ate que haja credenciais e aprovacao tecnica.

### Implementacao

1. Revisar textos e dados de mock relacionados a Teams.
2. Manter o centro de notificacoes interno como fonte atual de avisos.

## Centros de Custo

### Requisitos funcionais

- Exibir total rateado no mes como total gasto no periodo.
- Exibir orcamento consolidado anual, alimentado pela fonte corporativa definida para o contrato dos Correios.
- Exibir centros de custo validos e os mais utilizados.
- Permitir que administrador importe uma planilha de centros de custo validos.
- Usar a base importada como fonte pesquisavel para selecao de centro de custo nas postagens.
- Validar centro de custo no envio e preservar o codigo utilizado no historico, mesmo se a planilha for atualizada depois.

### Implementacao

1. Definir layout e formato aceitos para importacao: XLSX ou CSV, com colunas obrigatorias de codigo e descricao.
2. Criar validacao, resumo de importacao e tratamento de linhas invalidas.
3. Persistir versao, data e responsavel pela importacao.
4. Expor campo de selecao pesquisavel para todos os fluxos que pedem centro de custo.
5. Reformular indicadores e listas da aba usando os dados validados.

## Auditoria

### Requisitos funcionais

- Remover a coluna e a exibicao de origem IP.
- Permitir abrir o detalhe de cada evento de auditoria.
- No detalhe, exibir acao, responsavel, data e hora, entidade afetada, valores anteriores e novos quando aplicavel, e observacoes relacionadas.

### Implementacao

1. Remover IP do modelo visual e dos mocks exibidos.
2. Adicionar painel de detalhe com rolagem automatica ao abrir o evento.
3. Padronizar eventos de malotes, percursos e importacao de centros de custo para este formato.

## Integracoes e seguranca

- Integracao com Correios devera ficar em uma camada de servidor, nunca expondo credenciais no cliente.
- Estimativa, etiqueta, DC-e e atualizacao de status devem usar chamadas autenticadas e auditaveis.
- Importacoes de centros de custo devem validar tipo, tamanho, colunas e conteudo antes da persistencia.
- A integracao com Teams permanece desativada ate existir configuracao corporativa autorizada.

## Ordem recomendada

1. Malotes: remover QR Code e valor, definir permissoes e transicoes de status.
2. Percursos: incluir criacao, suspensao, reativacao e cancelamento definitivo.
3. Centros de custo: importacao de planilha e selecao pesquisavel.
4. Auditoria: detalhe de eventos e padronizacao dos novos registros.
5. Notificacoes: limpar mensagens de integracoes ainda indisponiveis.
