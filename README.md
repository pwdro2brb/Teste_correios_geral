# Logistics Hub

Aplicacao interna para gerenciamento de postagens, malotes, percursos e governanca de custos logisticos por centro de custo.

## Estado atual

O projeto apresenta fluxos simulados no cliente para demonstracao de interface e regras de visualizacao. A integracao com a API dos Correios, a emissao real de etiquetas e DC-e, persistencia de dados, importacao de centros de custo e notificacoes externas ainda nao estao implementadas.

## Tecnologias

- Next.js 16 com App Router
- React 19 e TypeScript
- Tailwind CSS 4
- shadcn/ui, configurado com o estilo `base-nova`
- Lucide React para icones

## Modulos

- Painel geral: indicadores, custos e postagens recentes.
- Correios: criacao simulada de postagens, contatos salvos, consulta e detalhe de rastreio.
- Malotes: registro e acompanhamento de malotes por rota.
- Percursos: consulta e aprovacao de percursos.
- Centros de custo: rateio e relatorios operacionais.
- Notificacoes: avisos internos.
- Auditoria: historico de acoes do sistema.

## Papeis de acesso

| Papel | Responsabilidade |
| --- | --- |
| Colaborador | Acessa seus proprios registros e solicitacoes. |
| Operador logistico | Opera malotes e acompanha demandas operacionais autorizadas. |
| Administrador | Acessa os dados consolidados, relatorios e cadastros corporativos. |

As regras de acesso ficam em [lib/roles.ts](lib/roles.ts) e o perfil ativo e fornecido por `ProfileProvider`.

## Estrutura

```text
app/                 Rotas, layout e estilos globais
components/          Shell, navegacao, componentes de UI e visoes por modulo
components/views/    Telas funcionais de cada modulo
lib/                 Dados mockados, papeis, formatacao e utilitarios
public/              Arquivos estaticos
```

## Executar localmente

### Pre-requisitos

- Node.js 20.9 ou superior
- pnpm 9 ou superior, recomendado pelo lockfile do projeto

### Comandos

```bash
pnpm install
pnpm dev
```

A aplicacao ficara disponivel em `http://localhost:3000`.

Para gerar uma build de producao:

```bash
pnpm build
pnpm start
```

Tambem e possivel usar npm quando necessario:

```bash
npm install
npm run dev
```

## Qualidade

```bash
pnpm lint
pnpm build
```

O ambiente precisa ter Node.js e o gerenciador de pacotes disponiveis no `PATH` para executar esses comandos.

## Requisitos e evolucao

O plano funcional das abas Malotes, Percursos, Notificacoes, Centros de custo e Auditoria esta em [REQUIREMENTS.md](REQUIREMENTS.md). O documento tambem registra regras de permissao, integracoes futuras e a ordem recomendada de implementacao.

## Seguranca e integracoes futuras

- Credenciais de integracoes devem permanecer somente no servidor e em variaveis de ambiente.
- Dados sensiveis nao devem ser mantidos em mocks de cliente ou versionados no repositorio.
- Integracoes com Correios e Microsoft Teams devem ser ativadas somente apos autenticacao, autorizacao corporativa e trilha de auditoria.
