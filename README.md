# 📦 Logistics Hub - Gestão de Encomendas, Rastreios & Rateio

> Plataforma web centralizada para automação logística, emissão de etiquetas, acompanhamento de rastreios em tempo real e rateio financeiro por Centro de Custo.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge)

---

## 🎯 O Problema & A Solução

Em operações corporativas de grande escala, a gestão de correspondências e malotes frequentemente sofre com falta de visibilidade nos gastos por centro de custo, lentidão na criação de etiquetas e consultas manuais de status de entrega.

O **Logistics Hub** resolve esse gargalo fornecendo:
* **Geração de Etiquetas e Pré-Postagem:** Fluxo simplificado para solicitação e geração de etiquetas via integração direta com a **API dos Correios**.
* **Rateio Financeiro Automático:** Associação direta de cada envio ao seu respectivo Centro de Custo (CC), facilitando a prestação de contas contábil.
* **Notificações Ativas:** Monitoramento de status de entrega integrado com webhooks do **Microsoft Teams** para avisos automáticos de movimentação e entrega.
* **Painel Executivo:** Dashboard com métricas consolidadas de volume, gastos e prazos médios de entrega.

---

## 👥 Controle de Acesso e Papéis (RBAC)

O sistema implementa regras de visualização baseadas no perfil do usuário via `ProfileContext`:

| Papel | Permissões de Acesso |
| :--- | :--- |
| **Colaborador** | Solicita envios e acompanha apenas seus próprios registros e malotes. |
| **Operador Logístico** | Gerencia solicitações de todas as áreas, emite etiquetas e atualiza status. |
| **Administrador** | Acesso completo a relatórios financeiros, rateios consolidados e cadastros. |

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com paleta moderna baseada em variáveis CSS (`OKLCH`)
* **Componentes:** [shadcn/ui](https://ui.shadcn.com/) & [Lucide Icons](https://lucide.dev/)
* **Integrações (Planejadas/Em Desenvolvimento):** API Correios REST & Microsoft Teams Incoming Webhooks

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [pnpm](https://pnpm.io/) ou `npm`

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/pwdro2brb/Teste_correios_geral.git](https://github.com/pwdro2brb/Teste_correios_geral.git)
   cd Teste_correios_geral
