# Plano SEO v5.1 — Landing Pages de Destino

> **Substitui v5** (2026-05-15). Incorpora **11 correções** da auditoria interna: princípio "ação única" reforçado, telefone centralizado em constante, GBP/Local Pack adicionado, KPIs de qualidade do lead, titles dentro do limite SERP, riscos CDC promovidos para bloqueador, contrato de cessão de imagem do motorista, e mais.
>
> **Changelog v5 → v5.1**:
> 1. §3 #2 reescrito: MiniForm é o CTA único, WhatsApp é fallback secundário
> 2. §4.2 CTAs alinhados — "Solicitar orçamento" único em hero
> 3. §4.3 MiniForm CTA = "Solicitar orçamento" (não promete preço instantâneo)
> 4. §8 Title reduzido para ≤ 60 chars
> 5. §9.2 #3 — variante B corrigida (residual "30 min" eliminado)
> 6. §11 — `src/lib/constants.ts` centralizando `WHATSAPP_E164`
> 7. §12 Sprint 1 — escopo telefone corrigido (11 arquivos, não 5) + contrato cessão de imagem
> 8. §14 — "1h espera" e "cancelamento 48h" promovidos para 🔴 (risco CDC Art. 37)
> 9. **NOVO §15** — Google Business Profile (Local Pack)
> 10. **NOVO §16** — KPI de qualidade do lead (lead → viagem por UTM)
> 11. **NOVO §17** — Cluster temático & keyword gap (Fase 2 / Blog)

---

## 1. Contexto — Por que mudar a versão atual

A LP atual (já buildando em produção) tem bons fundamentos visuais — hero cinematográfico, JSON-LD `Service`+`FAQPage`, FAQ acordeão, depoimentos. Mas, lida como **peça de copy comercial**, ainda comete erros que minam conversão e blindagem contra leads de baixa qualidade:

| # | Problema diagnosticado | Evidência | Impacto |
|:--|:-----------------------|:----------|:--------|
| 1 | **Headline genérica e não filtrante** | `H1: "Transfer Privado para Porto de Galinhas"` — não diz para *quem* é nem *por quê* | Atrai backpacker que busca R$ 140 e família que paga R$ 600 igual. Sem self-selection. |
| 2 | **Sem ancoragem de objeção principal** ATF | Hero não menciona "pedágio incluso", "preço fixo", "cancelamento grátis" | Visitante rola buscando o preço total → atrito desnecessário |
| 3 | **Imagem do destino, não do produto** | Hero usa foto de Porto de Galinhas (piscina natural). Concorrente premium (Welcome Pickups) usa motorista+veículo | Vende o *destino* (que ele já comprou) em vez de vender *o transporte até o destino* |
| 4 | **Falta seção "Como Funciona"** | Visitante não sabe se vai encontrar o motorista, se há plaquinha, se paga antes ou depois | Aumenta ansiedade, diminui conversão |
| 5 | **Ausência de selos regulatórios** | Sem CADASTUR, sem selo Reclame Aqui, sem logos de OTAs parceiras (iNeedTours, FoxTransfer) que dariam B2B trust | Ceticismo de turista estrangeiro/PME |
| 6 | **Form sem qualificação ATF** | `FormOrcamento` aparece só no rodapé. Sem mini-form acima da dobra com origem/destino/data/pax | Perde oportunidade de pré-qualificar lead já no primeiro scroll |
| 7 | **Telefone placeholder em 11 arquivos** | `+55-81-99999-9999` em `Header, Footer, TripTracker, contato, ContactForm, quem-somos, transfer-pdg, transfer-carneiros, FormOrcamento, Hero, WhatsAppFloat` | Bloqueia conversão real. Risco SEO (LocalBusiness com dado falso). |
| 8 | **Sem urgência/escassez calibrada** | LP "estática" — nenhum gatilho temporal | Em alta temporada (out–mar) o estoque é finito; precisa comunicar |
| 9 | **Sem prova de mídia/parceiros** | Não menciona as 4.888 viagens, parcerias com OTAs, anos de operação | Subutiliza ativos de credibilidade já existentes |
| 10 | **Match com fonte de tráfego ausente** | Mesma LP serve Google Ads (intent alto) e Facebook (browse) | Disconnect entre promessa do anúncio e copy da LP |
| 11 | **Múltiplos CTAs concorrendo na primeira tela** | `Header.tsx:110` tem CTA WhatsApp + Hero tem CTA primário + Hero secundário + `WhatsAppFloat` | Viola princípio "oferta única, ação única" — dilui conversão |
| 12 | **Local Pack do Google não otimizado** | Sem estratégia de Google Business Profile (categoria, fotos, posts, reviews recentes) | Fica fora do 3-pack mesmo com LP perfeita |
| 13 | **Métrica de qualidade do lead ausente** | Trackeia volume de leads, não fechamento → viagem | Pode otimizar para vaidade (mais leads ruins) |

### Decisão do dono (resposta às perguntas em 2026-05-15):

- **Preço-alvo**: ~R$ 200 por trecho (a confirmar com sócio). **Recalibra posicionamento**: deixa de ser "premium absoluto" e passa a ser **"qualidade premium em preço justo"** — médio-superior do mercado (R$ 140 piso → R$ 280 teto), com diferencial claro de serviço.
- **Compliance escolhido**: **CADASTUR/EMBRATUR** + **LGPD completa**.

---

## 2. Análise Competitiva — SERP "transfer aeroporto recife porto de galinhas"

Mapeamento dos 10 primeiros resultados orgânicos + Google Ads (2026-05-15):

| Player | Ângulo de Copy | Preço base (1-4 pax) | Pontos fortes | Pontos fracos (oportunidade) |
|:-------|:---------------|:---------------------|:--------------|:-----------------------------|
| **TransferRecifePorto** | "Tarifário transparente" | R$ 140 ida / R$ 280 ida+volta | Preço imbatível, tarifário claro | Site amador, sem prova social, sem rastreamento |
| **4Trip** | "Privativo ou compartilhado" | R$ 170 (priv.) / R$ 122,50 (comp.) | Opção compartilhada (mais barata) | Confunde proposta (privado vs. shared no mesmo card) |
| **Vivo Porto de Galinhas** | "Receptivo completo" | R$ 350 ida+volta | Ativo de marca (cidade) | Pedágio NÃO incluso — atrito de objeção |
| **TaxSim / Passeios PdG** | "TaxSim — Privativo a partir de R$ 99,70" | R$ 180 (Carneiros) | Preço-isca chamativo | Bait-and-switch típico (preço só de Boa Viagem) |
| **Romulo Turismo (TripAdvisor)** | "Confiável no TripAdvisor" | $$ via TripAdvisor | Selo TripAdvisor + reviews abundantes | Sem site próprio robusto; refém do TA |
| **Translado Recife** | "Promocional" | Variável | Promessa de barganha | Ausência de prova / muita FAQ defensiva |
| **Vans Recife** | "Van 15 lugares" | $$$ (grupos) | Nicho de grupo | Não compete em 1-4 pax |
| **Coopstar** | "Coop. de táxi 20 anos" | $$ | Longevidade | Visual datado, sem trust signals modernos |
| **Enter.Travel** | "Pedágios inclusos + rastreamento de voo" | $$$ (Carneiros) | **Copy mais profissional do mercado** — todos os removedores de atrito presentes | Preço mais alto que média (concorre com Água Verde) |

### Benchmarks globais consultados

- **Welcome Pickups** (welcomepickups.com): hero = "Book Your Airport Pickup in Minutes". Trust stack = Trustpilot 47.565 reviews + Tripadvisor Travelers' Choice 2023/2024 + 1.500 hotel partners + 1M passageiros em 2022. Diferencial: **driver bios com personalidade**. Posicionamento premium-personalizado.
- **Suntransfers** (suntransfers.com): hero = "Hassle-free airport transfers". Trust = "Founded in 2008 — Europe's favourite", 500+ airports, 45.255 Trustpilot reviews. Diferencial: **Best Price Guarantee**. Posicionamento valor-volume.

### Posicionamento estratégico da Água Verde

**Posição estratégica**: Quadrante **"Médio preço × Alto serviço"** — o vácuo competitivo. Welcome Pickups ocupa este quadrante globalmente, mas **não opera em Recife/PdG/Carneiros**. Esta é a vaga a tomar.

**Diferenciais defensáveis**:

1. **Volume operacional verificável** — 4.888 viagens concluídas, 89 motoristas próprios, 19 fornecedores ativos (B2B com iNeedTours, FoxTransfer, AirportTransfer.com)
2. **Monitoramento de voo automatizado** — herdado do n8n + Claude
3. **App nativo de motoristas com GPS** — passageiro acompanha via `/acompanhar/[token]`
4. **Trilíngue PT/EN/ES**
5. **Selo CADASTUR** — barreira de entrada que filtra concorrência informal
6. **Sem surge pricing**
7. **Ecossistema verticalizado** — única operadora local com app nativo + PWA de gestão

---

## 3. Princípios da nova LP

| # | Princípio | Como se manifesta na LP |
|:--|:----------|:------------------------|
| 1 | **Concordância com fonte de tráfego** | Variantes de hero por UTM. Google Ads (intent) → headline literal + form ATF. Meta Ads (browse) → headline emocional + foto destino |
| 2 | **Oferta única, ação única (REVISADO v5.1)** | **MiniForm é o CTA primário único na primeira tela.** Botão WhatsApp existe **apenas como secundário visual** (1 botão, não 4). Header passa a usar "Solicitar orçamento" (link para `#orcamento`) em vez de WhatsApp permanente. `WhatsAppFloat` aparece **apenas após scroll de 50%** (gatilho de saída/objeção, não competição com hero) |
| 3 | **Remoção de atrito explícita** | 4 removedores de objeção visíveis ATF: pedágio incluso, preço fixo, monitoramento de voo, pagamento só após confirmação |
| 4 | **Copy orientado à pesquisa** | Linguagem do passageiro: "saio do aeroporto", "minha mala", "meu voo atrasou", "viajo com criança". Evitar "transporte rodoviário receptivo" |
| 5 | **Gatilhos psicológicos calibrados** | Autoridade (CADASTUR), Prova social (4.9★ Google + 4.888 viagens), Reciprocidade (orçamento sem cartão), Escassez sutil (alta temporada), Urgência (WhatsApp como canal direto) |
| 6 | **Simplicidade** | Um conceito por seção. Hero diz UMA coisa. Bullet points ≤ 7 palavras. Hierarquia tipográfica brutal |
| 7 | **Mobile-first** | Layout pensado para 375px primeiro. Form ATF mobile com 4 campos. Tap targets ≥ 44px. Hero card de preço **não pode** sumir no mobile (bug atual) |
| 8 | **Mentalidade de teste** | Microsoft Clarity (heatmap + rage clicks) + GA4 events + UTMs por origem. Pelo menos 3 elementos preparados para A/B (headline, hero image, CTA) |

---

## 4. Estrutura do Copy — Above the Fold (Primeira Tela)

### 4.1 Anatomia visual (mobile-first → desktop)

**Mobile (375px)**:
```
┌─────────────────────────────────────┐
│ ▣ LOGO         Menu (hambúrguer)    │
├─────────────────────────────────────┤
│ A partir de R$ 200 · [Orçamento →]  │ ← sticky preço bar
├─────────────────────────────────────┤
│  [EYEBROW pequeno, dourado]         │
│  HEADLINE H1 GRANDE                 │
│  Subheadline (1 linha)              │
│  ✓ Bullet 1                         │
│  ✓ Bullet 2                         │
│  ✓ Bullet 3                         │
│  ✓ Bullet 4                         │
│  ┌─ MiniForm (4 campos) ──────┐     │
│  │ De / Para / Data / Pax     │     │
│  │ [ SOLICITAR ORÇAMENTO ]    │ ← CTA PRIMÁRIO ÚNICO
│  └────────────────────────────┘     │
│  Sem cartão. Pagamento só após      │
│  confirmação da viagem.             │
│  ───────────────────                │
│  ★ 4.9 Google · ▣ CADASTUR · 4.888v │
│                                     │
│  [ Conversar no WhatsApp ]          │ ← CTA SECUNDÁRIO ÚNICO
└─────────────────────────────────────┘
```

**Desktop (≥1024px)**: layout 2 colunas — texto à esquerda, MiniForm à direita (sticky), WhatsApp como link de texto discreto abaixo do MiniForm.

Sobre a hero image: **substituir foto do destino por foto do motorista uniformizado ao lado de veículo limpo com plaquinha** (Welcome Pickups playbook). A foto do destino vai para a seção "Sobre Porto de Galinhas", abaixo da dobra. **Por quê?** O passageiro **já decidiu ir ao destino** quando chega na LP — não precisamos vender o destino, precisamos vender o transporte.

### 4.2 Copy por LP

#### 4.2.1 `/transfer-porto-de-galinhas`

| Elemento | Versão atual | **Versão proposta (v5.1)** |
|:---------|:-------------|:---------------------------|
| **Eyebrow** | "Rota mais reservada em Recife" | "PARA QUEM CHEGA AO REC E VAI DIRETO PARA AS PISCINAS NATURAIS" |
| **H1** | "Transfer Privado para Porto de Galinhas" | "Saia do desembarque e em 1h15 esteja em Porto de Galinhas — sem fila de táxi, sem surpresa de preço" |
| **Subheadline** | "Do aeroporto de Recife direto para as piscinas naturais mais famosas do Brasil. Conforto, pontualidade e motorista que monitora seu voo." | "Veículo exclusivo para você e seu grupo (até 3 pax). Motorista profissional acompanha seu voo em tempo real, recebe na sala de desembarque com plaquinha e leva direto ao seu hotel." |
| **Marcadores de valor (4)** | (ausentes ATF) | • **Preço fixo desde a reserva** — sem surge, sem extra de bagagem<br>• **Pedágios inclusos** — orçamento sem letra miúda<br>• **Monitoramento automático do voo** — atrasou? motorista já sabe<br>• **Motorista que fala PT / EN / ES** — comunicação garantida |
| **CTA primário (ÚNICO)** | "Solicitar Orçamento" + "WhatsApp" (dois CTAs concorrentes) | **"Solicitar orçamento"** — único botão grande, dispara MiniForm |
| **CTA secundário** | (redundante WhatsApp) | "Conversar no WhatsApp" — botão menor, abaixo do MiniForm |
| **Removedor de atrito (abaixo CTA)** | (ausente) | "Sem cartão agora. Pagamento apenas após confirmação da viagem." |
| **Prova social ATF (strip)** | (ausente) | "★ 4,9/5 (47 avaliações Google) · ▣ CADASTUR ativo · ▶ 4.888 viagens realizadas" |

#### 4.2.2 `/transfer-praia-de-carneiros`

| Elemento | Versão atual | **Versão proposta (v5.1)** |
|:---------|:-------------|:---------------------------|
| **Eyebrow** | "Rota mais reservada em Recife" *(genérica — repete PdG)* | "PARA HÓSPEDES DOS RESORTS DA COSTA SUL DE PE" |
| **H1** | "Transfer Privado para Praia de Carneiros" | "Do desembarque ao seu resort em Carneiros em 1h45 — descansando, não negociando preço" |
| **Subheadline** | "Do aeroporto de Recife direto para a praia de águas cristalinas mais paradisíaca do Brasil." | "Veículo exclusivo, ar-condicionado e GPS rastreado para o trajeto de 115 km até Tamandaré. Motorista bilíngue te recebe na sala de desembarque com plaquinha." |
| **Marcadores de valor (4)** | (ausentes) | • **Trajeto direto pela BR-101** — sem desvios, sem paradas comerciais<br>• **Pedágios + água a bordo inclusos** — sem custo na chegada<br>• **Motoristas que conhecem todos os resorts** (Carneiros Beach, Casa de Carneiros, Salinas...) — sem perder tempo procurando<br>• **Atendimento em PT / EN / ES** — equipe trilíngue antes, durante e após |
| **CTA primário (ÚNICO)** | "Solicitar Orçamento" | "Solicitar orçamento" — dispara MiniForm |
| **CTA secundário** | (ausente) | "Conversar no WhatsApp" — botão menor |
| **Removedor de atrito** | (ausente) | "Reserve agora, pague apenas após confirmarmos veículo e horário." |
| **Prova social ATF** | (ausente) | "★ 4,9/5 · ▣ CADASTUR · Parceiros: iNeedTours, FoxTransfer, AirportTransfer" |

### 4.3 Mini-form ATF (NOVO — gap crítico)

Componente reutilizável posicionado **ao lado do texto (desktop)** ou **logo abaixo dos bullets (mobile)**. **É o CTA primário único da LP**.

```
┌─ Solicite seu orçamento ─────────────┐
│ Origem      [Aeroporto REC ▾]        │
│ Destino     [Porto de Galinhas ▾]    │
│ Data        [__/__/____]             │
│ Passageiros [1 ▾]                    │
│ [    SOLICITAR ORÇAMENTO    ]        │ ← CTA primário único
│ ──────────────────────────           │
│ ✓ Resposta direta no seu WhatsApp    │
│ ✓ Sem cartão, sem cadastro           │
└──────────────────────────────────────┘
```

> Submissão grava em `orcamentos_site` (Fase 2 do plano original — sem mudar modelagem). UTMs preservadas. CTA **não promete preço instantâneo** — promete contato qualificado.

---

## 5. Estrutura do Copy — Below the Fold

| # | Seção | Mudança vs. atual | Racional |
|:--|:------|:------------------|:---------|
| 1 | **Stats Bar** | Manter, mas trocar `~70 km` por **"4.888 viagens já realizadas"** | Stats devem ser *sociais*, não descritivos |
| 2 | **Como Funciona (NOVO)** | **Inserir** com 4 passos visuais: (1) você solicita orçamento (2) confirmamos por WhatsApp (3) motorista monitora seu voo (4) recebe com plaquinha e leva ao hotel | Mata ansiedade do estrangeiro / primeira vez |
| 3 | **Route Cards** | Manter, mas ajustar para 2 cards (ida / volta / combo) — 3 cards confunde | Princípio 2 |
| 4 | **Diferenciais** | Manter os 5, mas reescrever em linguagem 1ª pessoa: "Quando seu voo atrasa..." | Princípio 4 |
| 5 | **Comparativo de Opções (NOVO)** | **Inserir tabela**: Transfer Água Verde vs. Táxi de balcão (~R$ 240) vs. Transfer compartilhado (~R$ 122/pax) vs. Uber (sem preço fixo) — usar preços reais do mercado, validados na pesquisa | Ancora o preço em alternativas |
| 6 | **Sobre Porto de Galinhas / Carneiros** | Manter — bom para SEO de cauda longa | AI Overviews do Google |
| 7 | **Depoimentos** | Adicionar **fotos** (avatars) + **link "Ver mais avaliações no Google"** | Trust signal externo > interno |
| 8 | **Selos & Parcerias (NOVO)** | Faixa horizontal: logos OTAs parceiras + CADASTUR + Reclame Aqui + meios de pagamento | B2B trust |
| 9 | **FAQ** | Adicionar 3 perguntas: "Pedágios estão inclusos?", "Posso cancelar?", "Aceita cartão internacional?" | SEO + remoção de atrito |
| 10 | **CTA + Form completo** | Manter `FormOrcamento`, mas pré-popular `origem` e `destino` quando vier do MiniForm | UX continuum |

---

## 6. Compliance Regulatório

### 6.1 CADASTUR / EMBRATUR

- Selo CADASTUR + nº de registro **visível**: faixa de Selos & Parcerias, rodapé, JSON-LD `LocalBusiness.identifier`.
- Validar nº real em <https://cadastur.turismo.gov.br/cadastur/>. **Bloqueador go-live se não houver**.

### 6.2 LGPD completa

| Item | Implementação |
|:-----|:--------------|
| **Banner de consentimento** | **Solução própria leve** — `<ConsentBanner />` + `localStorage` + `consent_update` via `dataLayer` para GTM. Bloquear GA4/Clarity/Pixel até consentimento granular |
| **Política de Privacidade** | `/privacidade` linkada no rodapé + abaixo do form ATF |
| **Opt-in no formulário** | Checkbox não pré-marcado |
| **Direitos do titular** | E-mail `lgpd@aguaverde.tur.br` |
| **Tratamento de logs** | `ip_origem` e `user_agent` só com consentimento. Pseudonimizar após 90 dias |
| **Cookies** | Banner próprio documentando todos os scripts |
| **Transferência internacional** | Resend (EUA), Vercel (EUA) → cláusula contratual padrão declarada na Política |

---

## 7. Otimização Mobile

| Bug atual | Correção |
|:----------|:---------|
| Card lateral de preço (`hidden lg:block lg:col-span-5`) some no mobile | **Strip horizontal sticky** no topo do mobile abaixo do header, com "A partir de R$ 200 · [Orçamento →]" |
| Form de orçamento só no fim da página | MiniForm ATF na primeira tela |
| Hero animations com delays sequenciais (até 0.45s) | Reduzir para 0.15s — velocidade percebida |
| WhatsApp Float compete com hero | Float aparece **apenas após scroll 50%** |
| Logo + menu hambúrguer competem com badge "Mais reservado" | Badge desce 1 linha (block) no mobile |
| Background image hero pesa em 4G | `next/image` com `quality={70}`, AVIF/WebP, `sizes` correto |

**Meta**: Lighthouse mobile ≥ 90, LCP < 2.0s no 4G simulado, INP < 100ms.

---

## 8. SEO Técnico

| Item | Implementação |
|:-----|:--------------|
| **Title (PdG)** | **REVISADO**: `"Transfer Aeroporto Recife → Porto de Galinhas \| Água Verde"` (58 chars — dentro do limite SERP de ~60) |
| **Title (Carneiros)** | `"Transfer Aeroporto Recife → Praia de Carneiros \| Água Verde"` (59 chars) |
| **Meta description** | "Transfer privativo aeroporto Recife → Porto de Galinhas. 1h15, ~70km, a partir de R$ 200 (pedágio incluso). Motorista bilíngue, monitoramento de voo. Reserve sem cartão." (167 chars — ajustar para ≤ 160) |
| **H1 único** | Um por página. H2-H6 em cascata semântica |
| **JSON-LD** | `Service` + `FAQPage` + `LocalBusiness` + `BreadcrumbList` + `AggregateRating` (do Google Reviews — não inventar) |
| **OG image** | Trocar foto destino por card com texto ("Transfer Privado · REC → PdG · A partir de R$ 200 · Pedágios inclusos") |
| **Canonical** | Manter |
| **hreflang** | Quando next-intl ativar: PT/EN/ES |
| **Sitemap** | Prioridade 0.9 às LPs (vs. 1.0 home, 0.7 institucionais) |
| **Schema enriquecido** | `Offer.priceValidUntil` dinâmico, `availability="InStock"`, `Service.areaServed` com `GeoCircle` (raio 100km centrado no REC) |
| **Internal linking** | Bidirecional: Home → LP, LP → Blog (Fase 2), LP ↔ LP |
| **Imagens** | `next/image` com `priority` só hero, alt-text descritivo |

---

## 9. Mensuração & Mentalidade de Teste

### 9.1 Tracking obrigatório (com consent)

| Ferramenta | Função |
|:-----------|:-------|
| **GA4** | Conversão `orcamento_enviado`, scroll depth, source/medium |
| **Microsoft Clarity** | Heatmap, scroll map, rage clicks, session replay |
| **GTM** | Eventos: `miniform_submit`, `whatsapp_click`, `form_field_focus`, `form_abandon` |
| **Meta Pixel** (quando ativar) | `Lead`, `ViewContent` |
| **Server-side** | Edge Function `notificar-orcamento` registra UTMs em `orcamentos_site.utm_*` |

### 9.2 A/B tests prioritários

| Teste | Variante A (controle) | Variante B (hipótese) | Métrica primária |
|:------|:----------------------|:----------------------|:-----------------|
| **#1 Hero image** | Foto do destino (atual) | Foto motorista+veículo | Conversão MiniForm |
| **#2 Headline** | "Transfer Privado para PdG" | "Saia do desembarque e em 1h15 esteja em PdG" | Scroll past hero |
| **#3 CTA wording** | "Solicitar Orçamento" | **"Receber orçamento no WhatsApp"** | Click rate MiniForm |
| **#4 MiniForm ATF** | Ausente (atual) | Presente | Lead/visit |
| **#5 Preço visível ATF** | Apenas no card desktop | Strip horizontal mobile+desktop | Conversão |

Cada teste **2 semanas mínimas**, IC 95%, separar por dispositivo.

### 9.3 KPIs alvo (referência Travel & Hospitality)

| KPI | Benchmark (Unbounce 2025) | Alvo Água Verde 6 meses |
|:----|:--------------------------|:------------------------|
| Conversion rate LP (form) | 4,8% mediana | **6,5%** |
| Bounce rate | 51% | < 45% |
| LCP | < 2,5s | < 2,0s |
| Mobile conv. vs. desktop | -40 a -51% gap | < -25% gap |
| WhatsApp CTR | (sem benchmark) | > 8% |

---

## 10. Match com Fonte de Tráfego (variantes de hero)

Implementar via `searchParams.src` (server component, sem JS, sem CLS):

| Origem | Headline variante | Subheadline | CTA |
|:-------|:------------------|:------------|:----|
| **Google Ads — kw: "transfer aeroporto recife porto de galinhas"** | "Transfer aeroporto Recife → Porto de Galinhas — Privado, R$ 200, sem fila" | "Veículo exclusivo, pedágio incluso, motorista bilíngue. Resposta direta no WhatsApp." | "Ver preço para minha data" |
| **Google Ads — kw: "como ir aeroporto recife porto de galinhas"** | "Como sair do aeroporto de Recife para PdG sem dor de cabeça" | "Transfer privativo. Pegamos sua bagagem, te levamos direto. Sem fila de táxi." | "Reservar meu transfer" |
| **Orgânico** (padrão) | Headline-resposta direta (4.2.1) | (4.2.1) | "Solicitar orçamento" |
| **Direct/Referral (parceiro)** | "Você foi indicado pela [parceiro]. Transfer com 5% off." | "Apresente este link no orçamento e receba desconto exclusivo." | "Solicitar orçamento com desconto" |

> **Meta Ads** — não ativo. Recomendação completa em §10.1.

### 10.1 Recomendação para Meta Ads (fora do escopo desta entrega)

**Quando ativar**: depois que LP atual tiver 2+ meses de tracking sólido — sem isso não há base de pixel para lookalike.

**Estratégia**:
- **Objetivo**: Lead generation (form nativo do Meta) + retargeting de visitantes da LP
- **Públicos**: Lookalike 1-3% de quem submeteu orçamento via Google Ads + interesses (viagem ao Nordeste, PdG, Carneiros, resorts PE, hotéis 4-5★) + comportamento "viaja frequentemente"
- **Geo**: SP/RJ/MG/RS/DF/PR + Argentina/Uruguai/Chile/Portugal
- **Formatos**: Reels (motorista te recebendo no aeroporto), Carrossel (rotas + preço-âncora), Coleção (catálogo Fase 3)
- **Tracking**: Meta Pixel via GTM + **Conversions API (sCAPI)** em Vercel Edge Function (sem CAPI, perde >40% no iOS)
- **Orçamento inicial**: R$ 30-50/dia × 2 semanas → calibra CAC → escala
- **Variante hero específica Meta**:
  - Headline: "O Brasil te espera em Porto de Galinhas. Nós te buscamos no aeroporto."
  - Subheadline: "Transfer privado com motorista que monitora seu voo. A partir de R$ 200, pedágio incluso."
  - CTA: "Quero saber mais" (browse, não força conversão)
  - Imagem: foto emocional do destino (vender o sonho)
- **Por que não ativar agora**: sem audience madura, sem catálogo testado, sem CAC validado — queimaria budget em aprendizado de algoritmo.

---

## 11. Arquivos a Modificar

| Arquivo | Modificação |
|:--------|:------------|
| **(NOVO)** `src/lib/constants.ts` | **Centralizar** `WHATSAPP_E164 = '+5581994730200'`, `WHATSAPP_DISPLAY = '(81) 9 9473-0200'`, `WHATSAPP_WA_ME = 'https://wa.me/5581994730200'`. Importar em **todos** os 11 arquivos que hoje têm placeholder |
| `src/app/transfer-porto-de-galinhas/page.tsx` | Reescrever hero + MiniForm ATF + reordenar seções (Como Funciona + Comparativo + Selos) |
| `src/app/transfer-praia-de-carneiros/page.tsx` | Idem, copy 4.2.2 |
| `src/components/transfer-porto-de-galinhas/FaqAccordion.tsx` | +3 FAQs |
| `src/components/transfer-praia-de-carneiros/FaqAccordion.tsx` | +3 FAQs |
| `src/components/home/FormOrcamento.tsx` | Opt-in LGPD + UTM persistence + suporte `?src=` |
| `src/components/layout/Header.tsx` | Trocar CTA "WhatsApp" por **link `Solicitar orçamento`** que rola até `#orcamento` (anchor link). WhatsApp permanece apenas em rotas que não têm form (404, /termos, /privacidade) |
| `src/components/shared/WhatsAppFloat.tsx` | Aparecer **apenas após 50% scroll** (gatilho de objeção, não competição com hero) |
| **(NOVO)** `src/components/shared/MiniFormATF.tsx` | 4 campos, validação Zod, sticky state via `sessionStorage` para popular `FormOrcamento` no fim |
| **(NOVO)** `src/components/shared/HowItWorks.tsx` | 4 passos visuais — props para texto específico por LP |
| **(NOVO)** `src/components/shared/ComparisonTable.tsx` | Transfer vs. táxi vs. shared vs. app |
| **(NOVO)** `src/components/shared/TrustBadges.tsx` | CADASTUR, OTAs, pagamentos, Reclame Aqui |
| **(NOVO)** `src/components/shared/HeroVariant.tsx` | Server component lê `searchParams.src` |
| **(NOVO)** `src/components/shared/ConsentBanner.tsx` | Banner LGPD próprio + `localStorage` + `dataLayer` |
| **(NOVO)** `src/app/privacidade/page.tsx` | Política LGPD |
| **(NOVO)** `src/app/termos/page.tsx` | Termos de Uso (inclui política de cancelamento e janelas) |
| `src/app/layout.tsx` | Adicionar `<ConsentBanner />` + injeção condicional de GA4/Clarity |
| `next.config.js` | Headers de segurança (CSP, X-Frame-Options, Referrer-Policy) |

**Reuso explícito**: `cn()`, `supabase`, `FormOrcamento`, `animate-fade-in-up`, tokens `@theme`, `Header`, `Footer`.

---

## 12. Roadmap de Entrega (3 sprints)

### Sprint 1 (1 semana) — Reescrita de copy & componentes ATF
- [ ] Criar `src/lib/constants.ts` com `WHATSAPP_E164`, `WHATSAPP_WA_ME`, etc.
- [ ] Substituir placeholder em **11 arquivos** (importar de `constants.ts`). Verificar com `grep -r "99999-9999\|5581999999999" src/` (deve retornar zero)
- [ ] Hero v5.1 nas duas LPs (eyebrow, H1, sub, bullets, CTA único, removedor, trust strip)
- [ ] `MiniFormATF` (componente + integração com `FormOrcamento` via `sessionStorage`)
- [ ] Substituição hero image pelas fotos próprias (acervo já existe)
- [ ] **Contrato de cessão de uso de imagem** do(s) motorista(s) fotografado(s) — assinado antes de publicar (LGPD + Código Civil Art. 20)
- [ ] Variantes `HeroVariant` por `searchParams.src`
- [ ] `Header.tsx` — CTA passa a ser "Solicitar orçamento" → ancora `#orcamento`
- [ ] `WhatsAppFloat` — aparece após scroll 50%

### Sprint 2 (1 semana) — Seções abaixo da dobra & compliance
- [ ] `HowItWorks` (4 passos)
- [ ] `ComparisonTable` (com preços reais validados na §2)
- [ ] `TrustBadges` (CADASTUR, OTAs, pagamentos)
- [ ] FAQ +3 perguntas por LP
- [ ] `ConsentBanner` LGPD próprio + `/privacidade` + `/termos` (com política de cancelamento)
- [ ] Opt-in checkbox no `FormOrcamento`

### Sprint 3 (1 semana) — Tracking, performance, GBP & QA
- [ ] GTM container + eventos definidos (§9.1)
- [ ] Microsoft Clarity + GA4 (post-consent)
- [ ] **Google Business Profile** (§15): atualizar categoria, fotos, posts semanais, horários, atributos
- [ ] **Setup KPI qualidade do lead** (§16): dashboard Supabase + view `vw_leads_qualidade` por UTM
- [ ] Otimização mobile (§7): LCP < 2s, INP < 100ms, Lighthouse ≥ 90
- [ ] Setup A/B framework (Vercel feature flags ou solução simples)
- [ ] QA cross-browser, cross-device
- [ ] Validar JSON-LD em <https://search.google.com/test/rich-results>
- [ ] Submeter URLs no Search Console + nova sitemap

---

## 13. Verificação (Definition of Done)

### Conteúdo & SEO
- [ ] H1 contém keyword primária
- [ ] Title ≤ 60 chars, Meta description ≤ 160 chars
- [ ] JSON-LD valida (Service + FAQPage + LocalBusiness + BreadcrumbList)
- [ ] Zero ocorrências de placeholder: `grep -r "99999-9999\|5581999999999" src/` retorna 0
- [ ] Selo CADASTUR com nº real e link válido

### Performance
- [ ] Lighthouse mobile ≥ 90
- [ ] LCP < 2,0s no "Fast 4G"
- [ ] Sem CLS visível no hero
- [ ] Imagens `next/image` com `priority` apenas hero

### Compliance
- [ ] Banner LGPD bloqueia GA4 + Clarity até consentimento
- [ ] Form tem opt-in não pré-marcado
- [ ] `/privacidade` e `/termos` publicadas e linkadas
- [ ] Headers de segurança via `next.config.js` (testar com <https://securityheaders.com>)
- [ ] Contrato de cessão de imagem do motorista arquivado
- [ ] Política de cancelamento publicada em `/termos` corresponde ao bullet do hero

### Funcional
- [ ] `MiniFormATF` submete e popula `FormOrcamento` no scroll
- [ ] WhatsApp deep link funciona em iOS + Android real
- [ ] Variantes `?src=` funcionam (testar 5 origens)
- [ ] Submit grava em `orcamentos_site` com UTMs

### Tracking
- [ ] GA4 recebe `orcamento_enviado`
- [ ] Microsoft Clarity grava sessão
- [ ] Eventos GTM disparam (Tag Assistant)

### A/B prontidão
- [ ] Pelo menos #1 (hero image) e #3 (CTA wording) configurados
- [ ] Documento de hipóteses em `docs/ab-tests.md`

### Local Pack
- [ ] Google Business Profile atualizado (categoria, fotos, posts, atributos)
- [ ] Respostas às últimas 10 reviews

---

## 14. Pontos Resolvidos & Em Aberto

### Resolvidos (decisões do dono em 2026-05-15)

| Item | Decisão |
|:-----|:--------|
| **Foto motorista+veículo** | ✅ Já existe acervo próprio — será colocado durante implementação. Contrato de cessão de imagem assinado antes de publicar |
| **Telefone WhatsApp** | ✅ `+5581994730200` — centralizar em `src/lib/constants.ts`, importar nos 11 arquivos |
| **Consent Banner** | ✅ Solução própria leve |
| **Meta Ads** | ✅ Não ativo — variante postergada (§10.1) |
| **Pedágios inclusos** | ✅ Confirmado |
| **Compromisso "30 min" de resposta** | ✅ Sem compromisso fixo — copy ajustada para "Resposta direta no seu WhatsApp" |

### Em aberto (bloqueiam go-live)

| # | Decisão | Risco |
|:--|:--------|:------|
| 1 | **Preço final** (R$ 200 indicativo — confirmar com sócio) | 🔴 Bloqueia hero copy + ancoragens "a partir de R$ X" + tabela comparativa |
| 2 | **Nº CADASTUR ativo** — verificar em <https://cadastur.turismo.gov.br/> ou regularizar | 🔴 Sem nº real, selo vira mentira — risco legal + reputacional |
| 3 | **"Cancelamento gratuito até 48h antes"** — operação cumpre? (PROMOVIDO PARA 🔴 v5.1) | 🔴 CDC Art. 37 — publicidade enganosa se não cumpre |
| 4 | **"Pedágios + 1h de espera grátis inclusos"** — operação cumpre 1h? (PROMOVIDO PARA 🔴 v5.1) | 🔴 CDC Art. 37 — idem |
| 5 | **Política de cancelamento publicada** em `/termos` | 🔴 Sem isso, o bullet ATF não pode ir ao ar |
| 6 | **Programa de parceiros** (referrer 5% off) — quem opera o desconto? Códigos promocionais? | 🟡 Pode remover o item enquanto não há parceiros formais |
| 7 | **Texto exato opt-in LGPD** — revisão jurídica recomendada | 🟢 Modelo legal padrão funciona |

---

## 15. Google Business Profile (Local Pack) — NOVO v5.1

Mesmo a melhor LP não rankeia no Local Pack do Google sem GBP otimizado. **Esta seção é tão importante quanto a LP em si** para tráfego "transfer Recife".

### Auditoria inicial necessária

1. **Identificar o GBP atual**: existe? está reivindicado? quem tem acesso?
2. **Categoria primária**: deve ser **"Serviço de transporte para aeroporto"** (categoria certa) — não "Empresa de turismo" genérica
3. **Categorias secundárias** (até 9): "Serviço de transfer", "Locação de van", "Táxi", "Receptivo turístico"

### Otimizações contínuas

| Item | Frequência | Owner |
|:-----|:-----------|:------|
| **Fotos** | 4-6 fotos/mês (frota, motoristas, embarques) — algoritmo prioriza GBP ativos | Operação |
| **Posts** | 1-2 posts/semana: ofertas, depoimentos, dicas de destino | Marketing |
| **Reviews** | Responder 100% em ≤ 48h, em PT/EN/ES quando aplicável | Atendimento |
| **Atributos** | Marcar: "Aceita reservas online", "Pagamento sem contato", "Wi-Fi", "Cadeirinha infantil disponível", "Acessível para cadeirantes" (se for) | Único setup |
| **Q&A** | Pré-popular 8-10 perguntas frequentes (mesmas da FAQ da LP) | Único setup |
| **Mensagens** | Ativar mensagens diretas via GBP → encaminhar para WhatsApp | Único setup |
| **Horário** | Atualizar antes de feriados e alta temporada | Operação |

### Sinais de ranking no 3-pack

1. **Proximidade**: depende da localização do usuário (não controlamos)
2. **Relevância**: categoria correta + nome do negócio + descrição com keywords
3. **Proeminência**: volume e qualidade de reviews + presença em diretórios (TripAdvisor, Booking Experiences, Yelp BR)
4. **Engagement**: posts ativos, fotos recentes, respostas rápidas

### Meta 6 meses

- 100+ reviews Google (atual: 47)
- Avaliação ≥ 4,8★
- Top 3 do Local Pack para "transfer aeroporto Recife"
- 200+ ações no GBP/mês (cliques, ligações, rotas)

---

## 16. KPIs de Qualidade do Lead — NOVO v5.1

Volume de leads é vaidade. **O que importa é receita gerada por lead**. Sem esse KPI, podemos otimizar a LP para gerar muitos leads ruins (não-pagantes, fora de área, datas impossíveis).

### Definição

| KPI | Fórmula | Origem |
|:----|:--------|:-------|
| **Taxa de conversão lead → orçamento respondido** | `orçamentos_site WHERE status='respondido'` / total leads | DB |
| **Taxa de conversão lead → viagem realizada** | `orçamentos_site WHERE viagem_id IS NOT NULL AND viagens.status='concluida'` / total leads | DB join |
| **Ticket médio por origem (UTM)** | `AVG(viagens.valor)` agrupado por `orcamentos_site.utm_source` | DB join |
| **CAC por canal** | Gasto em Ads / nº de viagens fechadas com esse `utm_source` | Manual + GA4 + DB |
| **LTV/CAC por canal** | LTV médio (incluindo retenção) / CAC | Análise trimestral |

### Implementação técnica

**View no Supabase** (não cria nova tabela):

```sql
CREATE OR REPLACE VIEW vw_leads_qualidade AS
SELECT
  os.utm_source,
  os.utm_campaign,
  DATE_TRUNC('week', os.created_at) AS semana,
  COUNT(*) AS leads,
  COUNT(*) FILTER (WHERE os.status = 'respondido') AS respondidos,
  COUNT(*) FILTER (WHERE os.viagem_id IS NOT NULL) AS convertidos_em_viagem,
  COUNT(*) FILTER (WHERE v.status = 'concluida') AS viagens_concluidas,
  ROUND(AVG(v.valor) FILTER (WHERE v.valor IS NOT NULL), 2) AS ticket_medio,
  ROUND(100.0 * COUNT(*) FILTER (WHERE v.status = 'concluida') / NULLIF(COUNT(*), 0), 1) AS taxa_lead_to_viagem_pct
FROM orcamentos_site os
LEFT JOIN viagens v ON v.id = os.viagem_id
GROUP BY 1, 2, 3
ORDER BY semana DESC;
```

### Dashboard

- **PWA backoffice** (`app.aguaverde.tur.br`) — adicionar rota `/admin/leads-qualidade` consumindo `vw_leads_qualidade`
- Visualizações: tabela semanal por UTM + gráfico de linha (taxa lead→viagem por canal)
- Alerta automático: se uma origem cair > 30% em 2 semanas seguidas → notificação WhatsApp para o gerente

### Decisão de canal por KPI

| Sinal | Decisão |
|:------|:--------|
| Canal X: taxa lead→viagem > 30% E ticket > média | **Escalar** budget nesse canal |
| Canal Y: taxa < 10% mesmo com leads abundantes | **Cortar** ou refinar segmentação |
| Canal Z: ticket alto mas volume baixo | **Investigar** — pode ser nicho premium escalável |

---

## 17. Cluster Temático & Keyword Gap — NOVO v5.1

Conexão entre LPs (transactional intent) e Blog (informational intent) — vital para Fase 2.

### Pilares (LPs já existentes)

- `/transfer-porto-de-galinhas` (keyword: "transfer aeroporto recife porto de galinhas")
- `/transfer-praia-de-carneiros` (keyword: "transfer aeroporto recife praia de carneiros")

### Conteúdo cluster (Blog Fase 2 — apontam para as LPs)

| Slug do Blog | Keyword primária | Intent | Link interno |
|:-------------|:-----------------|:-------|:-------------|
| `/blog/como-ir-aeroporto-recife-porto-de-galinhas` | "como ir aeroporto recife porto de galinhas" | Informacional | → LP PdG |
| `/blog/porto-de-galinhas-o-que-fazer` | "o que fazer porto de galinhas" | Informacional | → LP PdG (no CTA) |
| `/blog/ônibus-aeroporto-recife-porto-de-galinhas` | "ônibus aeroporto recife porto de galinhas" (alta busca, intent "barato") | Informacional + comparativo | → LP PdG (justifica premium) |
| `/blog/uber-aeroporto-recife-funciona` | "uber aeroporto recife" | Objection-handling | → LP PdG/Carneiros |
| `/blog/distancia-recife-tamandare` | "distância recife tamandaré" | Informacional | → LP Carneiros |
| `/blog/melhores-resorts-praia-de-carneiros` | "resorts praia de carneiros" | Comercial | → LP Carneiros |
| `/blog/voo-atrasado-o-que-fazer-aeroporto-recife` | "voo atrasado recife" | Informacional + brand affinity | → LP (qualquer) |

### Estrutura do internal linking

```
                            ┌─── LP Porto de Galinhas ───┐
                            │                            │
   Home ──────────────────► │                            │ ◄── Blog "Como ir..."
                            │                            │ ◄── Blog "O que fazer..."
                            │                            │ ◄── Blog "Ônibus..."
                            │                            │
                            └────────── LP Carneiros ────┘
                                                    ▲
                            Footer ─────────────────┤
                            (link em toda LP) ──────┤
                                                    │
                                         Blog "Distância..."
                                         Blog "Resorts..."
```

### Anchor text padrão

- De Blog → LP: usar âncoras descritivas, **não "clique aqui"**. Ex: "veja como funciona nosso [transfer privativo para Porto de Galinhas](/transfer-porto-de-galinhas)"
- De LP → LP (cross-link): "Vai para Carneiros? [Veja nosso transfer para a Praia de Carneiros](/transfer-praia-de-carneiros)"
- De Home → LP: cards com texto descritivo (já existe)

### Keywords gap a explorar (oportunidades baixa concorrência)

| Keyword | Volume estimado/mês | Concorrência | Ação |
|:--------|:--------------------|:-------------|:-----|
| "transfer recife maragogi" | ~390 | Média | Criar LP `/transfer-maragogi` na Fase 1.5 |
| "transfer recife joão pessoa" | ~210 | Baixa | Avaliar (rota longa, ROI) |
| "como ir aeroporto recife centro" | ~720 | Alta (concorre com Uber) | Artigo de blog, não LP |
| "transfer privado recife ingleses" | ~50 | Baixa | Variante de hero para tráfego EN |
| "airport transfer recife to porto de galinhas" | ~140 (EN) | Baixa | Quando i18n EN ativar, otimizar versão EN |

---

*Plano v5.1 gerado em 2026-05-15. Substitui v5. Sob ótica de SEO Manager, com base em análise da concorrência local (10 players SERP) e benchmarks globais (Welcome Pickups, Suntransfers, Unbounce Travel & Hospitality Report 2025), revisado em segunda passagem para corrigir 11 achados de auditoria interna.*
