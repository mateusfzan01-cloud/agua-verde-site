# CLAUDE.md — agua-verde-site

> Guia principal para o Claude Code trabalhar neste projeto.
> Última atualização: 2026-05-27

---

## O Projeto

Novo site institucional da **Água Verde Transfers** (`aguaverde.tur.br`), substituindo o site atual da plataforma Starter. Empresa de **transfer privado** (transporte ponto a ponto) baseada em Recife/PE — NÃO é uma agência de excursões/passeios.

**Objetivo do site**: captar leads via SEO + formulário de orçamento, converter via WhatsApp, e oferecer rastreamento de viagem por token.

---

## Estado Atual — Fase 1 Concluída + SEO ✅

Site institucional completo com 12 páginas (10 estáticas + 1 dinâmica) e infraestrutura SEO implementada.

### Rotas do site

| Rota | Tipo | Descrição |
|:-----|:-----|:----------|
| `/` | Estática | Home: Hero, Stats, RotasGrid, Diferenciais, App, Depoimentos, FormOrcamento + JSON-LD |
| `/transfer-porto-de-galinhas` | Estática | Landing page SEO — transfer REC↔PDG (~70km, R$350) + JSON-LD |
| `/transfer-praia-de-carneiros` | Estática | Landing page SEO — transfer REC↔Carneiros (~115km, R$420) + JSON-LD |
| `/quem-somos` | Estática | Sobre a empresa, frota, motoristas, valores + JSON-LD |
| `/contato` | Estática + form client | Canais de contato, horários, formulário + JSON-LD (ContactPoint) |
| `/politica-de-privacidade` | Estática | Texto LGPD |
| `/termos-de-uso` | Estática | Termos e condições |
| `/acompanhar/[token]` | Dinâmica (SSR) | Rastreamento de viagem via `token_cliente` no Supabase |
| `/robots.txt` | Gerado | Disallow `/acompanhar/`, sitemap |
| `/sitemap.xml` | Gerado | 7 URLs indexáveis |

### Navegação

- **Header**: Início → Destinos (dropdown) → Quem Somos → Contato + botão WhatsApp
- **Footer**: colunas Destinos (links reais), Empresa (links reais), Contato

---

## Stack

| Componente | Tecnologia |
|:-----------|:-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS 4 + tokens em `globals.css` via `@theme` |
| Ícones | Lucide React |
| Fontes | Outfit (headings `font-heading`) + Inter (body) |
| Backend | Supabase (`@supabase/supabase-js`) — mesmo projeto dos outros apps |
| i18n | next-intl | ^4 (configurado, middleware pendente — deferred) |
| Deploy | Vercel |

### Design tokens principais

```
#1a5c38  verde primário (CTAs, links, bordas)
#27ae60  verde claro (hover, acentos)
#d4a853  dourado (badges, destaques)
#0d2e1c  fundo hero escuro
#fafbfa  fundo de seções
#1a1a2e  texto primário
#5a6570  texto secundário
```

### Arquivos-chave

```
src/
├── app/
│   ├── layout.tsx                  # Root layout com fontes, metadataBase, og:image, twitter:card, robots
│   ├── globals.css                 # @theme tokens + animações CSS
│   ├── page.tsx                    # Home + metadata + JSON-LD (Organization + WebSite)
│   ├── sitemap.ts                  # Gera /sitemap.xml (7 URLs)
│   ├── robots.ts                   # Gera /robots.txt (disallow /acompanhar/)
│   ├── quem-somos/page.tsx         # + JSON-LD (Organization + BreadcrumbList)
│   ├── contato/page.tsx + ContactForm.tsx  # + JSON-LD (Organization + ContactPoint)
│   ├── politica-de-privacidade/page.tsx
│   ├── termos-de-uso/page.tsx
│   ├── acompanhar/[token]/
│   │   ├── page.tsx                # Server component
│   │   └── TripTracker.tsx         # Client component com Supabase
│   ├── transfer-porto-de-galinhas/page.tsx  # + JSON-LD (Service + FAQPage + BreadcrumbList)
│   └── transfer-praia-de-carneiros/page.tsx # + JSON-LD (Service + FAQPage + BreadcrumbList)
├── components/
│   ├── layout/Header.tsx           # Nav fixo com dropdown Destinos + <noscript> fallback
│   ├── layout/Footer.tsx           # Links reais para Privacidade e Termos
│   ├── home/FormOrcamento.tsx      # Aceita initialOrigem e initialDestino
│   ├── home/RotasGrid.tsx          # 4 cards; PDG e Carneiros têm links para landing pages
│   ├── shared/WhatsAppFloat.tsx
│   ├── transfer-porto-de-galinhas/FaqAccordion.tsx
│   └── transfer-praia-de-carneiros/FaqAccordion.tsx
└── lib/
    ├── supabase.ts                 # Cliente Supabase + tipos Viagem/StatusViagem
    ├── json-ld.ts                  # getOrganizationSchema() reutilizável em todo o site
    └── utils.ts                    # cn() com clsx + tailwind-merge
```

---

## Regras Críticas

### 1. NÃO alterar `perfis.tipo` no Supabase
O app nativo (`agua-verde-transfers`) tem constraint `CHECK (tipo = ANY (ARRAY['admin','gerente','motorista','guia','estagiario']))`. Alterar quebra o app para todos os motoristas. Se precisar de passageiro autenticado, criar tabela `passageiros` separada.

### 2. E-commerce (Fase 3) só com demanda comprovada
Gatilho rígido: >20 orçamentos/mês por 2 meses consecutivos. Não criar tabelas `pedidos`, `carrinho_itens` ou `rotas` antes disso.

### 3. Supabase — variáveis de ambiente obrigatórias para `/acompanhar`
A página `/acompanhar/[token]` precisa de `.env.local` com:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
O Project ID do Supabase é `yblywknncmrbtxyhwbzr`.

### 4. Logo: sempre imagem, nunca texto
No Header, usar `public/images/logo-agua-verde.png`. Não substituir por texto "Água Verde Transfers".

### 5. Imagens externas permitidas
`next.config.js` permite `images.unsplash.com` e `images.pexels.com`.

---

## Integrações e URLs Externas

| Serviço | Detalhe |
|:--------|:--------|
| Supabase | Project ID: `yblywknncmrbtxyhwbzr` |
| WhatsApp | `https://wa.me/558199473200` |
| Instagram | `https://www.instagram.com/aguaverdeviagens/` |
| E-mail | `contato@aguaverde.tur.br` |
| TripAdvisor | `https://www.tripadvisor.com.br/Attraction_Review-g304560-d12087015-Reviews-Uluwatour_Viagens_Receptivos-Recife_State_of_Pernambuco.html` |
| PWA público | `https://app.aguaverde.tur.br/acompanhar/:token` |

---

## Infraestrutura SEO (já implementada)

- **Root layout**: `metadataBase: 'https://aguaverde.tur.br'`, `og:image`, `twitter:card`
- **Sitemap**: `src/app/sitemap.ts` → 7 URLs indexáveis
- **Robots**: `src/app/robots.ts` → disallow `/acompanhar/`
- **JSON-LD**: Utilitário `src/lib/json-ld.ts` com `getOrganizationSchema()` reutilizável
- **JSON-LD por página**: Home (Organization+WebSite), Quem Somos (Organization+BreadcrumbList), Contato (Organization+ContactPoint), Landings (Service+FAQPage+BreadcrumbList+LocalBusiness)
- **Header**: `<noscript>` fallback para links do dropdown de Destinos
- **`next.config.js`**: `poweredByHeader: false`, `images.formats: ['avif', 'webp']`
- **Páginas legais**: `/politica-de-privacidade`, `/termos-de-uso` (links reais no footer)

---

## Próximas Fases

| Fase | Prioridade | Gatilho |
|:-----|:-----------|:--------|
| **Fase 2** — Webhook orçamentos + Blog | Alta | Imediato após deploy |
| **Fase 3** — E-commerce pacotes transfer | Opcional | >20 orçamentos/mês × 2 meses |
| **Fase 4** — SEO conteúdo contínuo | Média | Paralela à Fase 2 |

**Fase 2 inclui:**
- Edge Function `notificar-orcamento` → WhatsApp + email para admin ao receber orçamento
- Tabela `orcamentos_site` no Supabase (já modelada em `implementation_plan.md`)
- `FormOrcamento` e `ContactForm` conectados ao Supabase (hoje só simulam envio)
- Blog MDX para artigos de destino (Porto de Galinhas, Praia de Carneiros)
- Redirects 301 das URLs do Starter (via `vercel.json`)
- Google Search Console: sitemap submetido

---

## Contexto do Ecossistema

O site faz parte de um ecossistema maior:
- **PWA** (`app.aguaverde.tur.br`) — backoffice admin/gerente, já em produção
- **App nativo** (`agua-verde-transfers`) — app dos motoristas (React Native)
- **n8n** — automação que cria viagens no Supabase via e-mail de OTAs (4.888 viagens existentes)

Referência completa: `AGENTS.md` e `implementation_plan.md`.
