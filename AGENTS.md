# AGENTS.md — Água Verde Site (agua-verde-site)

> Documentação de referência completa para agentes de IA trabalhando neste projeto.
> Última atualização: 2026-05-27

---

## 1. Visão Geral

Novo site institucional da **Água Verde Transfers** (`aguaverde.tur.br`), substituindo o site atual na plataforma Starter. A Água Verde é uma empresa de **transfer privado** (transporte ponto a ponto) baseada em Recife/PE — não é uma agência de excursões.

### Objetivo do site
- **Captar leads** via SEO + formulário de orçamento
- **Converter visitantes** via WhatsApp (canal preferido no Brasil)
- **Oferecer rastreamento** da viagem por token (`/acompanhar/:token`)
- **Preparar terreno** para e-commerce futuro (pacotes de transfer)

### O que este site NÃO é (ainda)
- Não é um e-commerce completo
- Não substitui o PWA de administração (`app.aguaverde.tur.br`)
- Não substitui o app nativo dos motoristas (`agua-verde-transfers`)

---

## 2. Ecossistema Água Verde

### Arquitetura completa

```
┌────────────────────────────────────────────────────────────┐
│               FORNECEDORES EXTERNOS (OTAs)                  │
│  iNeedTours • FoxTransfer EU/BR • AirportTransfer.com       │
│                    ↓ e-mail diretoria@                      │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│               AUTOMAÇÃO n8n (Backoffice)                    │
│  IMAP → Claude (Anthropic) → cria viagem no Supabase        │
│  ~99,9% das 4.888 viagens vêm deste canal                   │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                   SUPABASE (banco único)                    │
│  viagens (4.888) • motoristas (89) • perfis (93)            │
│  fornecedores (19) • avaliacoes (vazia — dados em viagens)  │
└────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
  Este site           PWA Backoffice        App Nativo
  aguaverde.tur.br    app.aguaverde.tur.br  agua-verde-transfers
  (institucional)     (admin/gerente)       (motoristas)
```

### Repositórios relacionados

| Repositório | Tecnologia | Local |
|:------------|:-----------|:------|
| `agua-verde-site` | Next.js 15 | `C:\Users\mzanl\Documents\agua-verde-site` |
| `agua-verde-app` | React + Vite (PWA) | `C:\Users\mzanl\Documents\agua-verde-app` |
| `agua-verde-transfers` | React Native + Expo | `C:\Users\mzanl\Documents\agua-verde-transfers` |

---

## 3. Stack e Configuração

| Componente | Tecnologia | Versão |
|:-----------|:-----------|:-------|
| Framework | Next.js (App Router) | 15 |
| Linguagem | TypeScript | 5.7 |
| Styling | Tailwind CSS | 4 |
| Ícones | Lucide React | ^0.460 |
| Fontes | Outfit (headings) + Inter (body) | Google Fonts |
| Backend | Supabase | mesmo projeto dos outros apps |
| Supabase SDK | @supabase/supabase-js | ^2 |
| i18n | next-intl | ^4 (configurado, middleware pendente) |
| Deploy | Vercel | — |

### Variáveis de ambiente necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=       # https://yblywknncmrbtxyhwbzr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # chave anon pública do projeto
```

### Design tokens (`globals.css` via `@theme`)

| Token | Valor | Uso |
|:------|:------|:----|
| `--color-brand-primary` | `#1a5c38` | CTAs, links, bordas de foco |
| `--color-brand-primary-light` | `#27ae60` | Hover, acentos verdes |
| `--color-brand-accent` | `#d4a853` | Badges, destaques dourados |
| `--color-bg-hero` | `#0d2e1c` | Fundo das seções hero |
| `--color-bg-main` | `#fafbfa` | Fundo das seções claras |
| `--color-text-primary` | `#1a1a2e` | Texto principal |
| `--color-text-secondary` | `#5a6570` | Texto auxiliar |
| `--font-heading` | Outfit | Todos os `h1`–`h6` |

---

## 4. Estrutura de Pastas (estado atual)

```
agua-verde-site/
├── public/
│   └── images/
│       ├── logo-agua-verde.png    # Logo oficial — NÃO substituir por texto
│       └── app-screenshot.png     # Screenshot do PWA (seção tecnologia na home)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout: fontes Outfit + Inter, metadataBase, og:image, twitter:card
│   │   ├── globals.css            # @theme tokens + animações fade-in-up/fade-in
│   │   ├── page.tsx               # Home completa + metadata + JSON-LD (Organization + WebSite)
│   │   ├── sitemap.ts             # 7 URLs: /, quem-somos, contato, 2 landings, 2 legal
│   │   ├── robots.ts              # Disallow /acompanhar/, aponta para sitemap
│   │   ├── quem-somos/
│   │   │   └── page.tsx           # Estática: história, frota, motoristas, valores + JSON-LD
│   │   ├── contato/
│   │   │   ├── page.tsx           # Estática: canais, horários, destinos + JSON-LD (ContactPoint)
│   │   │   └── ContactForm.tsx    # Client: formulário de contato
│   │   ├── acompanhar/
│   │   │   └── [token]/
│   │   │       ├── page.tsx       # Server component (SSR), robots: noindex
│   │   │       └── TripTracker.tsx # Client: busca viagem no Supabase
│   │   ├── transfer-porto-de-galinhas/
│   │   │   └── page.tsx           # Landing SEO estática + JSON-LD (Service+FAQPage+BreadcrumbList)
│   │   ├── transfer-praia-de-carneiros/
│   │   │   └── page.tsx           # Landing SEO estática + JSON-LD (Service+FAQPage+BreadcrumbList)
│   │   ├── politica-de-privacidade/
│   │   │   └── page.tsx           # Estática: texto LGPD
│   │   └── termos-de-uso/
│   │       └── page.tsx           # Estática: termos e condições
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Nav fixo: Início | Destinos↓ | Quem Somos | Contato + <noscript> fallback
│   │   │   └── Footer.tsx         # Colunas: Brand | Destinos | Empresa | Contato — links reais para Privacidade/Termos
│   │   ├── home/
│   │   │   ├── Hero.tsx
│   │   │   ├── RotasGrid.tsx      # 4 cards: PDG (×2), Maragogi, Carneiros
│   │   │   ├── Depoimentos.tsx
│   │   │   ├── SocialProof.tsx
│   │   │   └── FormOrcamento.tsx  # Props: initialOrigem?, initialDestino?
│   │   ├── shared/
│   │   │   ├── WhatsAppFloat.tsx
│   │   │   └── SocialIcons.tsx
│   │   ├── transfer-porto-de-galinhas/
│   │   │   └── FaqAccordion.tsx   # 6 FAQs REC→PDG
│   │   └── transfer-praia-de-carneiros/
│   │       └── FaqAccordion.tsx   # 6 FAQs REC→Carneiros
│   ├── lib/
│   │   ├── supabase.ts            # createClient + tipos Viagem, StatusViagem
│   │   ├── json-ld.ts             # getOrganizationSchema() reutilizável
│   │   └── utils.ts               # cn() com clsx + tailwind-merge
│   └── i18n/
│       ├── config.ts              # locales: pt, en, es
│       └── messages/              # pt.json, en.json, es.json
├── CLAUDE.md                      # ← Lido pelo Claude Code: contexto condensado
├── AGENTS.md                      # ← Este arquivo: referência completa
├── implementation_plan.md         # Plano técnico detalhado v4
├── next.config.js                 # remotePatterns: Unsplash, Pexels
└── package.json
```

---

## 5. Páginas e Rotas

### Build atual (todas estáticas exceto `/acompanhar/[token]`)

```
○ /                                ~ 181 B   home
○ /quem-somos                      ~ 1.7 kB  sobre a empresa
○ /contato                         ~ 2.8 kB  fale conosco
○ /transfer-porto-de-galinhas      ~ 2.1 kB  landing SEO
○ /transfer-praia-de-carneiros     ~ 2.0 kB  landing SEO
○ /politica-de-privacidade         ~ 1.7 kB  texto LGPD
○ /termos-de-uso                   ~ 1.7 kB  termos e condições
ƒ /acompanhar/[token]              ~63.4 kB  rastreamento (SSR + Supabase)
```

### Estrutura padrão das landing pages de destino

Cada landing page (`/transfer-X`) segue esta estrutura:
1. Hero full-viewport + badge + H1 + rota pill + preço flutuante (desktop)
2. Stats bar verde (distância, tempo, preço, avaliação)
3. 3 cards de rota (ida, volta, saída de hotel)
4. Diferenciais — split layout foto + 5 itens
5. Sobre o destino — editorial com sidebar de cards informativos
6. Depoimentos filtrados para o destino
7. FAQ accordion (6 perguntas, respostas ricas para AI Search)
8. Formulário de orçamento com destino pré-preenchido
9. JSON-LD: `Service` + `FAQPage` + `BreadcrumbList` + `LocalBusiness`

---

## 6. Regras de Negócio Críticas

### 6.1 NUNCA alterar `perfis.tipo`

O app nativo depende de:
```sql
CHECK (tipo = ANY (ARRAY['admin','gerente','motorista','guia','estagiario']))
```
Alterar quebra o app para todos os motoristas ativos. Se precisar de passageiro autenticado (Fase 3), criar tabela `passageiros` separada com FK para `auth.users(id)`.

### 6.2 E-commerce só após validação de demanda

Gatilho rígido: **>20 orçamentos/mês por 2 meses consecutivos**.
Não criar antes: `pedidos`, `carrinho_itens`, `rotas` (tabela).

### 6.3 Dados do Supabase — avisos

- `viagens.id` é `INTEGER` (serial), NÃO UUID
- Tabela `avaliacoes` existe mas está vazia — avaliações reais estão em `viagens.avaliacao_nota`
- Campo `token_cliente` presente em 100% das viagens
- `viagens.status` mais comum: `concluida` (2.934 registros)

### 6.4 Imagens externas

`next.config.js` permite apenas `images.unsplash.com` e `images.pexels.com`. Qualquer outro domínio precisa ser adicionado ao `remotePatterns`.

---

## 7. Roadmap de Fases

| Fase | Escopo | Status |
|:-----|:-------|:-------|
| Fase 0 | Setup + reconhecimento Starter + redirects 301 | Parcialmente feito |
| **Fase 1** | Site institucional + landing pages de destino + SEO | **✅ Concluída** |
| Fase 2 | Webhook orçamentos + blog MDX + redirects Starter | Próxima |
| Fase 3 | E-commerce pacotes de transfer (Mercado Pago) | Opcional — só com demanda |
| Fase 4 | SEO conteúdo contínuo (blog) | Paralela à Fase 2 |

### Fase 2 — o que fazer

- [ ] Tabela `orcamentos_site` no Supabase (schema em `implementation_plan.md` §4)
- [ ] Edge Function `notificar-orcamento` → WhatsApp + email para admin
- [ ] `FormOrcamento` conectado ao Supabase (hoje só simula envio)
- [ ] `ContactForm` conectado ao Supabase ou Resend
- [ ] Blog com MDX: artigos de destino (Porto de Galinhas, Praia de Carneiros)
- [ ] Redirects 301 das URLs do Starter em `vercel.json`
- [ ] Google Search Console: sitemap submetido

---

## 8. Integrações e Referências Externas

| Serviço | Detalhe |
|:--------|:--------|
| Supabase | Project ID: `yblywknncmrbtxyhwbzr` |
| WhatsApp | `https://wa.me/558199473200` |
| Instagram | `https://www.instagram.com/aguaverdeviagens/` |
| E-mail | `contato@aguaverde.tur.br` |
| TripAdvisor | `https://www.tripadvisor.com.br/Attraction_Review-g304560-d12087015-Reviews-Uluwatour_Viagens_Receptivos-Recife_State_of_Pernambuco.html`
| PWA público | `https://app.aguaverde.tur.br/acompanhar/:token` |

---

## 9. Convenções de Código

- TypeScript obrigatório, sem `any` explícito
- Componentes de página: Server Components por padrão; `'use client'` só quando necessário (formulários, estado, Supabase no cliente)
- Tailwind para 100% dos estilos — sem CSS modules ou styled-components
- Comentários: apenas quando o "porquê" não é óbvio; sem comentários explicando o que o código faz
- `next/image` para todas as imagens externas e estáticas pesadas
- `priority` apenas em hero e logo (LCP crítico)

---

## 10. Checklist para novas alterações

- [ ] A mudança afeta `perfis.tipo` ou alguma tabela usada pelo PWA ou app nativo?
- [ ] Precisa de nova tabela no Supabase? Está dentro do escopo da fase atual?
- [ ] Novos componentes com estado → `'use client'`; sem estado → Server Component
- [ ] Imagens novas usam `next/image` com `sizes` adequado?
- [ ] A logo no header continua sendo a imagem (não texto)?
- [ ] Nova página adicionada ao `sitemap.ts`?
- [ ] JSON-LD adequado para o tipo de página?
- [ ] Build passa sem erros? (`npm run build`)

---

## 11. Infraestrutura SEO

### Arquivos de indexação
| Arquivo | Função |
|:--------|:-------|
| `src/app/sitemap.ts` | Gera `/sitemap.xml` com 7 URLs indexáveis |
| `src/app/robots.ts` | Gera `/robots.txt`, disallow `/acompanhar/` |

### Dados estruturados (JSON-LD)
| Página | Schema |
|:-------|:-------|
| `/` | `Organization` + `WebSite` |
| `/quem-somos` | `Organization` + `BreadcrumbList` |
| `/contato` | `Organization` (com `ContactPoint`) + `BreadcrumbList` |
| `/transfer-porto-de-galinhas` | `Service` + `FAQPage` + `BreadcrumbList` + `LocalBusiness` |
| `/transfer-praia-de-carneiros` | `Service` + `FAQPage` + `BreadcrumbList` + `LocalBusiness` |

### Utilitário centralizado
`src/lib/json-ld.ts` exporta `getOrganizationSchema()` com dados completos da empresa:
nome, URL, telefone, endereço, GeoCoordinates, priceRange, AggregateRating (4.9/47),
sameAs (Instagram + TripAdvisor), ContactPoint multilíngue, numberOfEmployees (89).

### Configurações do root layout
- `metadataBase: 'https://aguaverde.tur.br'`
- `robots: { index: true, follow: true }`
- `openGraph.images` default (logo)
- `twitter: { card: 'summary_large_image' }`

### `next.config.js`
- `poweredByHeader: false`
- `images.formats: ['image/avif', 'image/webp']`
- `remotePatterns: images.unsplash.com, images.pexels.com`

---

*Referências adicionais: `implementation_plan.md` (plano técnico v4, modelo de dados completo, fases detalhadas)*
