# Logistics Hub

Aplicacao interna para gerenciamento de postagens, malotes, percursos e governanca de custos logisticos por centro de custo.


## Estado atual
O projeto possui uma interface funcional com dados de demonstracao e uma camada server-side em preparacao para operacao real. Ja estao implementados:

- autenticacao local temporaria para e-mails `@mrv.com.br`;
- persistencia local em SQLite para desenvolvimento;
- contratos de repositorio para postagens, malotes, contatos, centros de custo e auditoria;
- validacao de payloads e testes automatizados;
- adapter server-side dos Correios com token, pre-postagem, etiqueta assincrona, DC-e, prazo, preco e rastreio;
- paginacao e estados de carregamento/erro nas telas.

O login local e temporario e devera ser substituido por Entra ID quando o SSO corporativo estiver disponivel. A interface ainda possui telas que exibem mocks e devem ser migradas gradualmente para os endpoints persistentes.

## Tecnologias

- Next.js 16 com App Router
- React 19 e TypeScript
- Tailwind CSS 4
- shadcn/ui, configurado com o estilo `base-nova`
- Lucide React para icones

## Modulos

- Painel geral: indicadores, custos e postagens recentes.
- Correios: criacao de postagens, contatos salvos, consulta e detalhe de rastreio; integracao server-side em andamento.
- Malotes: registro e acompanhamento de malotes por rota.
- Percursos: consulta e aprovacao de percursos.
- Centros de custo: rateio, relatorios operacionais e importacao administrativa de planilha.
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
lib/                 APIs, persistencia, validacao, dados mockados e utilitarios
scripts/             Scripts administrativos locais
tests/               Testes de validacao e autenticacao
public/              Arquivos estaticos
```

## Executar localmente

### Pre-requisitos
- Node.js 24.18 ou superior recomendado para o SQLite nativo usado no desenvolvimento local
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

### Configuracao local

Copie `.env.example` para `.env.local` e preencha os valores localmente. Nunca versione `.env`, `.env.local`, credenciais dos Correios, `AUTH_SECRET` ou a pasta `data/`.

```powershell
Copy-Item .env.example .env.local
```

Principais variaveis:

- `CORREIOS_USUARIO`: usuario Meu Correios, como `correiosmrv`;
- `CORREIOS_CODIGO_ACESSO`: codigo de acesso das APIs, nunca a chave de acesso;
- `AUTH_SECRET`: segredo usado para assinar a sessao local;
- `DATABASE_URL`: por padrao, `sqlite:./data/app.db`.

Para criar um usuario local de teste:

```powershell
npm.cmd run seed:user -- pedro@mrv.com.br "Pedro Silva" admin "senha-temporaria"
```

## Qualidade

```bash
pnpm lint
pnpm test
pnpm build
```

O ambiente precisa ter Node.js e o gerenciador de pacotes disponiveis no `PATH` para executar esses comandos.

## Requisitos e evolucao

O plano funcional das abas Malotes, Percursos, Notificacoes, Centros de custo e Auditoria esta em [REQUIREMENTS.md](REQUIREMENTS.md). O documento tambem registra regras de permissao, integracoes futuras e a ordem recomendada de implementacao.

## Seguranca e integracoes
- O login local aceita apenas e-mails `@mrv.com.br`, usa hash `scrypt` e cookie `httpOnly`; ele e temporario para desenvolvimento.
- O usuario `correiosmrv` e o codigo de acesso dos Correios sao lidos de `CORREIOS_USUARIO` e `CORREIOS_CODIGO_ACESSO`; nenhum deles deve ser colocado no codigo ou commitado.
- O banco SQLite e criado sob demanda em `data/app.db`, uma pasta ignorada pelo Git.
- Credenciais de integracoes devem permanecer somente no servidor e em variaveis de ambiente.
- As chamadas dos Correios passam pelo servidor, com renovacao de token, timeout/retry controlado e auditoria da criacao de postagem.
- A integracao com Microsoft Teams continua desativada ate existir configuracao corporativa autorizada.
