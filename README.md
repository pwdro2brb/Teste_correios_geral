# Teste Correios Geral

Este projeto é uma aplicação web para acompanhamento operacional e financeiro de processos logísticos, com foco em correios, malotes, percursos, notificações e centros de custo.

## Objetivo

O sistema foi desenvolvido para oferecer uma visão centralizada das atividades logísticas e permitir o monitoramento de:

- postagens e entregas;
- movimentação de malotes;
- solicitações de novos percursos;
- notificações operacionais;
- gastos por centro de custo.

A interface foi pensada para funcionar como um painel executivo, com navegação por módulos e visualização de indicadores principais.

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react

## Recursos principais

### 🎨 Sistema de Design
- **Paleta de cores universal**: Verde (#55 155), Laranja (#62 55), Branco (#98 001), Cinza (#92 003)
- **Tema em modo claro**: Aplicado globalmente para melhor legibilidade
- **CSS Variables em OKLCH**: Sistema de cores adaptativo e acessível
- **Sidebar cinza claro**: Interface limpa e moderna com `--sidebar: oklch(0.94 0.003 0)`

### 👥 Controle de Acesso e Filtros por Papel
O sistema implementa filtros baseados no papel do usuário:

- **Colaborador**: Visualiza apenas seus próprios registros (postagens, malotes)
- **Operador Logístico**: Visualiza registros de todos os colaboradores
- **Administrador**: Acesso completo a toda a plataforma e dados

Os filtros são aplicados através do `ProfileContext` em componentes como `dashboard-view`, garantindo que cada usuário veja apenas os dados relevantes ao seu papel.

## Estrutura principal

- `app/`: estrutura principal da aplicação e página inicial
- `components/`: componentes de interface, shell da aplicação, sidebar, topbar e views
- `lib/`: dados mockados, regras de perfil e utilidades
- `public/`: arquivos estáticos

## Como executar localmente

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   $env:Path = "C:\Users\pedro.henrsilva\OneDrive - MRV\Área de Trabalho\node-v24.18.0-win-x64;" + $env:Path
   pnpm dev
   ```
   
   Ou simplesmente:
   ```bash
   npm.cmd run dev
   ```

3. Acesse no navegador:
   ```text
   http://localhost:3000
   ```

## Customização de tema

O tema da aplicação é controlado através de variáveis CSS em `app/globals.css`. Para alterar cores:

- `--background`: Cor de fundo principal
- `--primary`: Cor primária (verde)
- `--accent`: Cor de destaque (laranja)
- `--sidebar`: Cor da barra lateral

Todas as cores utilizam o espaço de cor OKLCH para melhor consistência visual.

## Observação

Os dados exibidos no projeto são mockados para simular uma experiência de uso real de forma rápida e visual.
