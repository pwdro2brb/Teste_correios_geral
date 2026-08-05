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

## Estrutura principal

- app/: estrutura principal da aplicação e página inicial
- components/: componentes de interface, shell da aplicação, sidebar, topbar e views
- lib/: dados mockados, regras de perfil e utilidades
- public/: arquivos estáticos

## Como executar localmente

1. Instale as dependências:
   ```bash
   pnpm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

3. Acesse no navegador:
   ```text
   http://localhost:3000
   ```

## Observação

Os dados exibidos no projeto são mockados para simular uma experiência de uso real de forma rápida e visual.
