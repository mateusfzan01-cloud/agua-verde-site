# O que a comunidade recomenda em 2026 para um pequeno operador de transfer vender no próprio site

**Cliente:** Água Verde Transfers (Recife/PE) — transfer privado ponto a ponto; site Next.js 15 na Vercel; Supabase em produção (tabela `viagens`, PWA de gestão, app de motoristas, WhatsApp Cloud API com IA de auto-resposta); hoje vende pela Paytour (R$ 250/mês); teto de custo fixo R$ 250–300/mês; público PT/ES/EN; quer Pix + cartão (inclusive estrangeiro).

**Data da pesquisa:** 08/10/2026.

## Como esta pesquisa foi feita (e seus limites)

- **Reddit:** o buscador web não indexa threads do Reddit e o site bloqueia IPs de datacenter. O acesso foi feito pelos feeds RSS públicos (`/r/<sub>/search.rss` e `<post>.rss?sort=top`), que entregam o post e os comentários ordenados por "top", **mas não mostram a contagem de votos**. Foram lidos ~70 threads de 2025-2026 em r/Tourguide, r/smallbusiness, r/brdev, r/empreendedorismo, r/stripe, r/Supabase, r/whatsapp, r/WhatsappBusinessAPI, r/n8n, r/automation, r/SaaS, r/PPC e r/googleads.
- **Hacker News:** via API Algolia (2 threads relevantes).
- **TabNews, blogs técnicos e páginas oficiais** (Stripe BR, Mercado Pago, Bókun, Meta via terceiros, Google Ads Help) via curl. Algumas páginas (developers.facebook.com, Paytour, Arival, Search Engine Land) estavam bloqueadas; nesses casos usei resumos de terceiros e sinalizo.
- **Convenção de rótulos:** `FATO (citado)` = afirmação de uma fonte, com link e data. `OPINIÃO` = minha leitura aplicada ao caso da Água Verde. Citações em inglês foram mantidas no original para não distorcer.

---

## 1. Motor de reservas próprio vs. SaaS (Bókun, Rezdy, FareHarbor, TrekkSoft, Peek, Checkfront, Paytour)

### (a) O que a comunidade recomenda

1. **O debate em 2026 não é "qual SaaS", é "quem paga a comissão da venda direta".** Operadores pequenos no r/Tourguide repetem o mesmo argumento: pagar 6–8 % sobre uma reserva que o seu próprio site gerou é o pior modelo; preferem taxa fixa mensal (Bookeo, Checkfront, Orioly, BookingTerminal) ou percentual baixo (Bókun 1,5 %, TicketingHub 3 %).
2. **FareHarbor é o alvo recorrente das reclamações** (repasse de 6–8 % ao cliente no checkout, "booking fee" visível, taxa de 2 % sobre API). Bókun é o mais citado como alternativa barata, com a ressalva de ser "confuso" e pertencer ao grupo Viator/Tripadvisor.
3. **Rezdy divide opiniões** (um consultor chama de "pesadelo", outro operador usa há anos "sem problemas"); Checkfront é descrito como "software morto"; TrekkSoft e Peek quase não aparecem em discussões de 2026.
4. **A única regra técnica unânime:** uma única fonte de verdade de disponibilidade. Dois threads de 2026 relatam overbooking por sincronizar dois sistemas ao mesmo tempo.
5. **Construir o próprio motor** aparece pouco no Reddit (quem posta lá normalmente não é dev). Nas fontes de dev (TabNews, r/brdev, HN) o consenso é que o "motor" de um checkout simples é pequeno: formulário + gateway + webhook + banco; o que é caro em SaaS de turismo é a **distribuição** (channel manager para Viator/GYG), não o checkout.
6. **Dado de mercado em disputa:** Arival (5.000+ operadores) diz que a venda direta caiu e OTAs chegaram a 37 % em 2025; Rezdy (280 operadores) diz que 69 % das reservas são diretas. As amostras são diferentes; a leitura comum é "OTA para aquisição, direto para margem".

### (b) Citações (link e data)

- r/Tourguide, **"Switching from Bokun to FareHarbor or vice versa"**, 03/09/2026 — <https://www.reddit.com/r/Tourguide/comments/1w6jq18/switching_from_bokun_to_fareharbor_or_vice_versa/>
  - u/Agnosco_Digital (04/09/2026): *"FareHarbor takes 6% on every direct booking through your own website, Bokun is half that. That's not an OTA fee, that's your own customers finding you directly and you're still paying commission on them. Some systems charge a flat monthly fee and take nothing on direct bookings at all."*
- r/Tourguide, **"Which channel manager to choose? FareHarbour or TicketingHub?"**, 14/05/2026 — <https://www.reddit.com/r/Tourguide/comments/1tcw0ju/which_channel_manager_to_choose_fareharbour_or/>
  - OP: *"I noticed that FareHarbour passes the booking fee to the customer, which is quite brutal."*
  - Fundador do TicketingHub (15/05/2026, com disclosure): *"your customer sees a £100 tour become £106, which hits conversion and occasionally shows up in reviews."*
  - u/rayabana (18/05/2026): *"check how are they doing on the AI search / chat side of things. That's a channel coming up fast as users are doing a lot more research and planning using ChatGPT."*
- r/Tourguide, **"Recommendation for a booking / ticketing system"**, 05/02/2026 — <https://www.reddit.com/r/Tourguide/comments/1qwyjpv/recommendation_for_a_booking_ticketing_system/>
  - u/itsmeJaxx0r: *"They wanted to charge us 8% per booking. [...] Avoid checkfront. The software is dead. They haven't updated it properly since 2 years."*
  - u/GTFU-Already (20/05/2026): *"We have been using Rezdy for quite some time and have had no issues. [...] the i-Frame approach for booking widgets is not the best, however it is pretty solid and stable."*
  - u/Serious_Confection51 (12/09/2026): *"I am trying Bokun right now [...] €49 a month + 1,5% on bookings. [...] I will mainly use it for payments on my website."*
- r/smallbusiness, **"Thoughts on Rezdy tour software?"**, 22/11/2025 — <https://www.reddit.com/r/smallbusiness/comments/1p41oln/thoughts_on_rezdy_tour_software/>
  - u/Keepcuriousandkind (06/02/2026): *"Don't. Go to Bokun. Client has a full setup on Rezdy and it's a nightmare. [...] their web widgets are simply awful."*
  - OP (05/05/2026): *"This season we decided to stay with Fareharbor. I spoke with over 20+ companies in this space."*
- r/Tourguide, **"Tour Booking and Payment Platform"**, 14/04/2026 — <https://www.reddit.com/r/Tourguide/comments/1sleg3q/tour_booking_and_payment_platform/>
  - u/rayabana (20/05/2026), taxonomia dos modelos: *"1. SaaS style fixed monthly fee - no commissions. 2. No listing fee, but commissions. 3. Both [...] 4. No flat fee, no commissions - but a catch, your clients pay - which is just a round about way to commissions still."*
- r/Tourguide, **"How tour operators find reliable booking software and how I basically broke our whole season"**, 04/09/2026 — <https://www.reddit.com/r/Tourguide/comments/1w6ujbu/how_tour_operators_find_reliable_booking_software/>
  - u/KevinAdamo: *"During a migration, you need one source of truth. [...] If the old system says 28 seats and the new system also says 28, the API will sell 56 and let you deal with the fallout."*
- Bókun, página oficial de preços (acessada 08/10/2026) — <https://www.bokun.io/pricing>: FREE; START US$ 49/mês + 1,5 %; PLUS US$ 149 + 1,25 %; PREMIUM US$ 499 + 1 %; 0 % em reservas Viator e offline; opção de repassar a taxa ao cliente.
- CaptainBook (concorrente, viés), **"FareHarbor Pricing & Fees Explained (2026)"**, 09/04/2026 — <https://captainbook.io/blog/fareharbor-pricing-fees-explained>: *"6–8% booking fee at checkout, paid by your customers"*; custo efetivo calculado de 10,3 % com processamento.
- Arival, **"API Fees Increasingly Common Among Booking Systems"** — <https://arival.travel/article/api-fees-increasing-among-booking-systems/>: FareHarbor passou a cobrar 2 % em reservas via API (Europa em 2023, EUA em maio/2025).
- Arival, **Global Operator Landscape (4ª ed.)** via Travel Daily News — <https://www.traveldailynews.com/tag/arival/>: OTAs *"surging to 37% of bookings in 2025"*, *"starkest decline of direct website bookings"*, online estável em 60 %.
- Rezdy, **"Global Trends in Tours & Activities: The 2026 Report"**, 24/10/2025 — <https://rezdy.com/blog/global-trends-in-tours-activities-the-2026-report/>: *"SEO (71%) has overtaken word-of-mouth (50%) as the #1 booking driver"*; *"69% of all bookings now coming direct and 40.7% no longer using OTAs"* (280 respondentes, viés de base de clientes).
- Paytour (fontes de terceiros; site oficial bloqueado): B2B Stack lista R$ 249/mês (<https://www.b2bstack.com.br/product/paytour>); Capterra 4,5/5 em 34 avaliações, com críticas *"em momentos de alto fluxo, o backoffice e a loja online ficam lentos"* e *"não permite transferir datas com facilidade"* (<https://www.capterra.ca/software/206213/paytour>).

### (c) O que se aplica à Água Verde

- `FATO`: o custo fixo atual (R$ 250/mês) é comparável ao Bókun START (≈ US$ 49 ≈ R$ 270) e supera o custo fixo de um checkout próprio com Stripe/Mercado Pago (R$ 0 de mensalidade; só taxas por transação).
- `OPINIÃO`: a Água Verde **não precisa de channel manager**: ela não vende em Viator/GYG como tour; suas OTAs (iNeedTours, Fox, Mozio, Kiwitaxi) já entram por e-mail → `viagens` via n8n/Edge Function. O que a Paytour entrega de valor é "loja + pagamento"; isso é exatamente o que um checkout próprio em Next.js + Supabase cobre, e com integração nativa à tabela `viagens` (hoje a Paytour é uma ilha).
- `OPINIÃO`: antes de cancelar a Paytour, pedir o relatório de origem das vendas dos últimos 12 meses. Se >20 % vier do marketplace/afiliados da Paytour, manter por um trimestre em paralelo; se vier do próprio site/Instagram, migrar.
- `OPINIÃO`: a lição dos threads de overbooking vale literalmente: **Supabase é a única fonte de verdade**; o checkout do site insere em `viagens` (ou em uma tabela `reservas_site` que vira `viagens` ao pagar) — nunca manter dois calendários.
- `FATO` a considerar: o `CLAUDE.md` do projeto define que e-commerce (Fase 3) só entra com >20 orçamentos/mês por 2 meses. A pesquisa sugere um **checkout leve** (1 rota fixa, pagamento, confirmação) como degrau intermediário; a decisão de antecipar a Fase 3 é do cliente.

---

## 2. Checkout em Next.js + Supabase (Stripe vs. Mercado Pago, webhooks, idempotência, pedidos pendentes)

### (a) O que a comunidade recomenda

1. **Stripe tem a melhor experiência de desenvolvimento e cobre cartão estrangeiro**; devs brasileiros reclamam de dois pontos: taxa mais alta que gateways locais e histórico de Pix "em lista de espera" (há relato de jan/2026 dizendo que a Stripe "parou" o Pix, contestado no mesmo thread; a página oficial da Stripe BR lista Pix a 1,19 % e a documentação confirma Pix para contas no Brasil).
2. **Mercado Pago é o mais citado para Pix barato e checkout pronto**, mas r/brdev tem vários relatos de bugs no Checkout (botão "pagar" cinza sem erro), documentação ruim, credenciais de teste confusas e suporte lento. Alternativas locais citadas com frequência: Asaas (checkout pronto, taxas fixas em centavos), Pagar.me (melhor doc de API no Brasil, mas conta demora para liberar Pix), AbacatePay, Woovi/OpenPix, Efí.
3. **Padrão de arquitetura consolidado (2026):** o redirect de sucesso **não** confirma pagamento; o webhook é a fonte de verdade; uma única função de "fulfillment" idempotente é chamada tanto pelo webhook quanto pela página de sucesso (reconciliação com o `CHECKOUT_SESSION_ID`); deduplicar por `event.id` com unique constraint no banco; verificar assinatura no corpo cru (`req.text()`), em Edge Function usar `constructEventAsync`; responder 2xx só depois de persistir; esperar eventos fora de ordem e retentativas.
4. **Pedidos pendentes:** criar o pedido no banco antes de abrir o Checkout (com UUID que vira idempotency key), guardar o `session_id`, e expirar pendentes por cron (Checkout Session expira; `checkout.session.expired` existe). Não criar a viagem "real" antes do pagamento, ou criá-la com status explícito de aguardando pagamento.
5. **Cartão de brasileiro em conta estrangeira é recusado em massa** (85 % de bloqueio relatado); Pix resolve. Para a Água Verde isso é irrelevante no sentido inverso: ela terá conta brasileira e precisa aceitar cartão estrangeiro, que a Stripe BR cobra com +2 %.

### (b) Citações (link e data)

- Stripe Brasil, página oficial de preços (acessada 08/10/2026) — <https://stripe.com/br/pricing>: *"3,99% + R$ 0,39 por transação realizada para cartões nacionais"*; *"+ 2% para transações com cartões internacionais"*; *"1,19% por PIX pago"*; *"R$ 3,45 Boleto bancário"*; contestação R$ 55; *"Sem tarifas mensais, ocultas ou de configuração"*.
- Stripe Docs, **Pix** — <https://docs.stripe.com/payments/pix>: *"Stripe accounts in Brazil can accept Pix one-time payments with BRL settlement. Pix Automático isn't available in Brazil."*
- Mercado Pago, blog oficial **"Quanto custa receber pagamentos via Pix e Código QR"**, 30/03/2026 — <https://www.mercadopago.com.br/blog/quanto-custa-receber-pagamentos-via-pix-e-codigo-qr>: *"a taxa para receber pagamentos via Pix na hora é de 0% [...] para novos vendedores CNPJ que faturam a partir de R$15.000 por mês, a taxa de Pix é de apenas 0,49%"*; débito na hora 1,99 %; *"cartão de crédito na hora, a taxa é de 4,98%"*; crédito em 30 dias 3,98 %. (Texto voltado ao kit QR/maquininha; a taxa do Checkout Pro deve ser confirmada no painel.)
- r/brdev, **"gateway de pagamento que aceita PIX e que tenha IPs públicos"**, 25/01/2026 — <https://www.reddit.com/r/brdev/comments/1qmmwlw/gateway_de_pagamento_que_aceita_pix_e_que_tenha/>
  - OP: *"Eu me integro principalmente com a Stripe, mas eles pararam a integração com o PIX recentemente. Dei uma olhada na do mercado pago, mas além da doc e plataforma ser horrível, eles não compartilham os IPs."*
  - u/denisgomesfranco: *"acabei de ver no site deles e a documentação da API, eles continuam oferecendo o pix para o Brasil."*
  - u/Striking_Peak6908: *"Pra que precisa dos IPs do Mercado Pago? Só vem a notificação, seu sistema que vai lá buscar o status."*
- r/brdev, **"Problema no Checkout do Mercado pago"**, 18/12/2025 — <https://www.reddit.com/r/brdev/comments/1ppj586/problema_no_checkout_do_mercado_pago/>
  - OP: *"já fazem 4 dias que entro na tela de checkout e vejo o botão de pagar cinza, sem mensagem, sem erro [...] Vou migrar para a Asaas. Único problema é que eles pedem CPF e endereço no checkout."*
- r/brdev, **"Qual sistema de pagamento usar para SaaS?"**, 15/04/2026 — <https://www.reddit.com/r/brdev/comments/1sltdap/qual_sistema_de_pagamento_usar_para_saas/>: respostas curtas, maioria "Asaas" e "Stripe", seguidas de "Abacate Pay" e "Pagar.me pra Pix".
- r/brdev, **"Gateway de pagamento pra SaaS. Como escolher?"**, 17/09/2026 — <https://www.reddit.com/r/brdev/comments/1wj8tdy/gateway_de_pagamento_pra_saas_como_escolher/>
  - OP: *"cada um parece ter um ponto fraco diferente (PIX só pra convidados, taxa alta p kct, emissão de nota não integrada, suporte a recorrência e tal)."*
- TabNews, **"[DÚVIDA] Qual gateway/API de pagamento devo usar?"** (≈ maio/2026) — <https://www.tabnews.com.br/RickRibeiro/5ef2665c-40cc-4d02-a98a-76cf794bf670>: *"Em muitos casos esses centavos fixos quebram a gente. [...] no pix a margem de lucro é bem maior."*
- r/stripe, **"85% of my card payments are getting blocked in Brazil — why?"**, 18/06/2026 — <https://www.reddit.com/r/stripe/comments/1u91ktt/85_of_my_card_payments_are_getting_blocked_in/>
  - u/mazyartr: *"Brazil has some of the highest card decline rates for international CNP transactions anywhere in the world. [...] Pix working at 90% confirms this."*
  - u/_BreakingGood_: *"Brazilian's use Pix and pretty much nothing else."*
- r/stripe, **"Stripe Checkout success redirect vs webhook sync"**, 09/09/2026 — <https://www.reddit.com/r/stripe/comments/1wbw4dv/stripe_checkout_success_redirect_vs_webhook_sync/>
  - u/hamanovich: *"put {CHECKOUT_SESSION_ID} in your success_url, read it server side, and call the same fulfillment function the webhook calls. Webhooks stay required, they just stop being the only route in."*
  - u/Mission_Tea9876: *"If you mark the event processed before that update commits, retries can skip it forever [...] Keep durable receipt and successful processing separate."*
  - u/Hugo_SecureHoldWP: *"The important part is having one state-transition function rather than three different implementations."*
- r/Supabase, **"Billing on Supabase + Stripe: the edge cases nobody warns you about"**, 17/06/2026 — <https://www.reddit.com/r/Supabase/comments/1u8o4od/billing_on_supabase_stripe_the_edge_cases_nobody/>
  - u/StripeTeam (24/07/2026): *"using your database's unique constraint on the event ID column so duplicate processing fails at the DB level, not just in application logic [...] If you're using Next.js App Router, make sure you export the route config to disable body parsing."*
- r/Supabase, **"Stripe webhooks in Supabase Edge Functions: 5 ways they fail silently"**, 29/09/2026 — <https://www.reddit.com/r/Supabase/comments/1wt8sde/stripe_webhooks_in_supabase_edge_functions_5_ways/>: *"Read the body once with `await req.text()` and verify with `stripe.webhooks.constructEventAsync(body, signature, secret, undefined, Stripe.createSubtleCryptoProvider())`. It has to be the async variant."*
- r/stripe, **"Spent 3 days debugging Next.js Webhooks so you don't have to"**, 18/01/2026 — <https://www.reddit.com/r/stripe/comments/1qgn6xi/spent_3_days_debugging_nextjs_webhooks_so_you/>
  - u/nullfox: *"ACK fast, always. Treat webhook handlers as ingress, not business logic. Make side effects idempotent at the boundary."*
- Blog Alex Cloudstar, **"Stripe Webhooks in Production: Idempotency, Retries, and the Mistakes That Cost Me Real Money"**, 14/05/2026 — <https://alexcloudstar.com/blog/stripe-webhooks-production-2026/>: *"Stripe retried the same event nine seconds later because my response had taken longer than the timeout. The retry created a second workspace."* Padrão: tabela `processed_webhook_events (event_id PRIMARY KEY)` com `ON CONFLICT DO NOTHING`.

### (c) O que se aplica à Água Verde

- `FATO`: para uma reserva de R$ 350 (REC↔Porto de Galinhas), as taxas ficam: Stripe Pix ≈ R$ 4,17; Stripe cartão nacional ≈ R$ 14,36; Stripe cartão internacional ≈ R$ 21,36 (5,99 % + R$ 0,39, mais conversão cambial se houver); Mercado Pago Pix R$ 0–1,72; Mercado Pago crédito na hora ≈ R$ 17,43.
- `OPINIÃO`: **Stripe Checkout (hosted) com Pix + cartão + Apple/Google Pay** é a escolha de menor risco para o público PT/ES/EN: localização automática do checkout, cartão estrangeiro sem fricção, SDK/documentação maduros para Next.js 15 e Supabase, relatos de comunidade muito mais limpos que os do Mercado Pago. A diferença de taxa de Pix (≈ 1,2 p.p.) só justifica um segundo gateway se o volume Pix passar de alguns milhares de reais/mês.
- `OPINIÃO` (arquitetura mínima, compatível com o que já existe no projeto):
  1. `reservas_site` (uuid, rota, data/hora, pax, valor, moeda, idioma, status `pendente|pago|expirado|cancelado`, `stripe_session_id`, `idempotency_key`, `viagem_id` nullable).
  2. Server Action cria a linha pendente → cria Checkout Session (`expires_at` 30 min, `metadata.reserva_id`, `client_reference_id`) → redireciona.
  3. Route Handler `/api/stripe/webhook` (ou Edge Function, já que o projeto usa Edge Functions) com `req.text()`, `constructEvent`, `INSERT ... ON CONFLICT DO NOTHING` em `stripe_eventos`, e **uma** função `confirmarReserva(reserva_id)` que: marca `pago`, insere em `viagens` (com `token_cliente`), dispara template WhatsApp de confirmação. A mesma função é chamada pela página de sucesso após ler a sessão pelo `CHECKOUT_SESSION_ID`.
  4. pg_cron a cada 15 min expira `pendente` com `created_at < now() - 45 min` (e trata `checkout.session.expired`).
  5. Só depois do `pago` a viagem entra no fluxo do app dos motoristas; nada de "segurar" vaga de motorista para pendente.
- `OPINIÃO`: manter o `FormOrcamento` atual como caminho sem pagamento (orçamento → WhatsApp) para rotas fora da tabela fixa; o checkout cobre só rotas com preço fechado.

---

## 3. WhatsApp para vendas e atendimento (Cloud API vs. Z-API/Evolution/Twilio/360dialog, bots de IA, custo por conversa, o que está "hypado")

### (a) O que a comunidade recomenda

1. **A notícia de 2026 é a cobrança de mensagens de serviço a partir de 1º/10/2026**: respostas dentro da janela de 24 h, humanas ou de bot, passam a ser cobradas por mensagem (tarifa de utilidade do país), com franquia de 1.000 mensagens de serviço por número/mês; templates de utilidade dentro da janela também passam a ser cobrados. A janela gratuita de 72 h de anúncios "Click to WhatsApp" continua gratuita. Preços só mudam no primeiro dia de cada trimestre. Faturamento em BRL começou em 1º/07/2026.
2. **Reação em r/brdev e r/empreendedorismo:** muita raiva, ameaças de voltar para Baileys/Evolution e para o Telegram; mas quem fez a conta para operações pequenas achou o impacto baixo (R$ 300–400/mês numa solução com vários clientes), e os comentários mais experientes dizem que o vilão de custo é **marketing proativo**, não o atendimento.
3. **Oficial vs. não oficial:** consenso dos devs com produto sério: "API oficial; a não oficial é perfeita até o primeiro banimento". Relatos de ban por IP de VPS, por cadência de disparos, por conteúdo. A Evolution API suporta tanto Baileys quanto a Cloud API, então "Evolution" por si só não é o risco; o canal Baileys é. Há uma corrente de "caixa mista" (template pelo oficial com Coexistência, resto pelo não oficial) — descrita pelos próprios autores como gambiarra de alto risco.
4. **BSP vs. Cloud API direta:** a maioria dos BSPs são "wrappers reskinados" da mesma Cloud API com markup; a dor real de ir direto é o Business Manager da Meta, não o código. Um relato de aumento de taxa de US$ 5 para US$ 25/mês na 360dialog com conta presa à linha de crédito do BSP.
5. **Política de IA da Meta:** desde 15/01/2026 bots de IA de propósito geral são proibidos na API; bots de negócio (reservas, suporte, notificações) com IA auxiliar são permitidos e devem ter escalonamento humano. A UE forçou exceções na Europa (ordem interina de 2026), irrelevante para o Brasil.
6. **O que está hypado:** "agentes de IA" de WhatsApp que "fazem tudo", agentes de voz, ferramentas no-code (Manychat, Kommo) com custo mensal alto. O que a comunidade diz que funciona: fluxos estruturados, resposta rápida, handoff humano real, e reduzir o número de mensagens por conversa (porque agora cada uma custa).

### (b) Citações (link e data)

- r/whatsapp, **"WhatsApp Business API Pricing Is Changing Tomorrow (Oct 1): Service Messages Are No Longer Free"**, 30/09/2026 — <https://www.reddit.com/r/whatsapp/comments/1wtug8t/whatsapp_business_api_pricing_is_changing/>: *"Each business phone number will get 1,000 free service messages per month."*
- r/brdev, **"API do WhatsApp terá cobrança por mensagens de serviço"**, 02/07/2026 — <https://www.reddit.com/r/brdev/comments/1uly09u/api_do_whatsapp_ter%C3%A1_cobran%C3%A7a_por_mensagens_de/>
  - u/wfreitas_talkaio (03/07/2026): *"Com cobrança, vai ser obrigatório ter processo definido — janela de 24h, triagem antes de mandar, resolução na primeira interação. Quem já tem isso organizado vai sentir pouco."*
  - u/Famous-Educator-2527 (30/09/2026): *"Na empresa que eu trabalho não mandamos mensagem, só aviso de confirmação de compra e usamos o menu pra direcionar as pessoas certas."*
- r/brdev, **"WhatsApp API: como vocês estão lidando com a nova cobrança?"**, 25/08/2026 — <https://www.reddit.com/r/brdev/comments/1vygmw2/whatsapp_api_como_voc%C3%AAs_est%C3%A3o_lidando_com_a_nova/>
  - u/ManOnTheRoom: *"Fizemos os cálculos e o impacto da cobrança ia subir uns 300/400 reais por mês na solução, aí pro nosso caso valia a pena manter."*
  - u/WillingnessLow1778 (09/09/2026): *"Usar API não oficial acho complicado. A chance de ser banido permanentemente é enorme e ficar trocando de número acaba gerando desconfiança por parte de quem recebe a mensagem."*
  - u/EduVG_BR (31/08/2026), a "caixa mista": *"Habilite o COEX, conecte um WAHA, WHATSMEOW, EVO [...] faça a aplicação enviar o template pelo COEX e 10/20% da conversa pelo oficial e o restante pelos paralelos."*
- r/empreendedorismo, **"Whatsapp Business e a cobrança de 3 centavos por cada mensagem"**, 30/07/2026 — <https://www.reddit.com/r/empreendedorismo/comments/1vafzr6/whatsapp_business_e_a_cobran%C3%A7a_de_3_centavos_por/>
  - OP (usa Manychat, gasta R$ 4–5 mil/mês): *"fiz um cálculo rápido e cheguei num número inviável para a minha operação: custo extra mensal de 15k."*
  - u/mauri0686: *"O que manda nessa conta é a categoria da mensagem, não só o volume. [...] Só de mover o proativo pro reativo já corta boa parte, sem trocar de ferramenta."*
- r/brdev, **"Quem trabalha com API de WhatsApp em produção, qual solução utiliza hoje?"**, 18/06/2026 — <https://www.reddit.com/r/brdev/comments/1u9jxoj/quem_trabalha_com_api_de_whatsapp_em_produ%C3%A7%C3%A3o/>
  - u/calzone_gigante: *"API oficial tem restrições rígidas e arbitrárias, mas obedecendo as regras funciona perfeitamente. Teu caso de uso pode deixar de ser suportado do nada."*
  - u/BetoPaudeConcreto: *"usei z-api num saas [...] meu medo era se o negocio escalasse e eu tomasse um ban. se puder use a oficial."*
  - u/ArtisticRaise1120: *"Uso o twilio. É caro mas preciso de algo confiavel e sólido e oficial."*
- r/brdev, **"Alguma alternativa a API Oficial do WhatsApp para disponibilizar para clientes?"**, 21/09/2026 — <https://www.reddit.com/r/brdev/comments/1wmbuea/alguma_alternativa_a_api_oficial_do_whatsapp_para/>
  - u/klyn_999: *"Não tem. Se vai usar em produto sério tem que usar a API oficial. Pro cliente a API não oficial é perfeita até o primeiro banimento interromper a operação."*
  - u/Harehau (contraponto): *"Eu uso a EvolutionAPI [...] não faço disparos de 1s, dou intervalos de pelo menos 10s e nunca tive problema com banimento."*
- r/brdev, **"API Oficial Whatsapp x API Não Oficial"**, 23/06/2026 — <https://www.reddit.com/r/brdev/comments/1udum9j/api_oficial_whatsapp_x_api_n%C3%A3o_oficial/>
  - u/ovrlrd1377: *"Eu estava usando o baileys/evolution antes mas migrei do meu homelab pra um VPS e a meta bloqueia o IP deles na unha, aí tive que aceitar e ir pra oficial."*
- r/empreendedorismo, **"Whatsapp API oficial não entregando mensagens. O que fazer?"**, 25/06/2026 — <https://www.reddit.com/r/empreendedorismo/comments/1ufqelt/whatsapp_api_oficial_n%C3%A3o_entregando_mensagens_o/>
  - u/americanosbr: *"te aconselho a repensar a estratégia de cadência de mensagens com urgência. Caso contrário, a Meta vai BANIR seu número em breve."*
- r/automation, **"WhatsApp bots: official API vs web automation - tradeoffs I wish I knew earlier"**, 03/09/2026 — <https://www.reddit.com/r/automation/comments/1w5vdkj/whatsapp_bots_official_api_vs_web_automation/>: *"Once up, solid - no disconnects, no browser to babysit, less ban risk. [...] Pricing now per-message [...] multi-turn agents get unpredictable, incentivizes condensing flows into paragraphs."*
- r/WhatsappBusinessAPI, **"I Stopped Using BSPs Like 360Dialog, Interkt, Gupshup, etc."**, 28/03/2026 — <https://www.reddit.com/r/WhatsappBusinessAPI/comments/1s5pnxm/i_stopped_using_bsps_like_360dialog_interkt/>: *"Their fee was originally $5 a month [...] Then they suddenly increased the price to $25 a month on top of the Meta API charges. My account was tied to their credit line."*
- r/whatsapp, **"Best WhatsApp Business API providers in 2026? What actually matters for small teams"**, 10/03/2026 — <https://www.reddit.com/r/whatsapp/comments/1rppryl/best_whatsapp_business_api_providers_in_2026_what/>
  - u/offroad5019 (06/04/2026): *"90% of these platforms are reskinned wrappers around the same Meta Cloud API. [...] the real unlock is owning the integration layer yourself (Cloud API direct + your own AI routing), not renting someone else's dashboard at 3x markup."*
- r/n8n, **"Direct Meta WhatsApp Cloud API vs third-party BSP for appointment reminders"**, 30/06/2026 — <https://www.reddit.com/r/n8n/comments/1ujqn6o/direct_meta_whatsapp_cloud_api_vs_thirdparty_bsp/>
  - u/Dry-College4773: *"The only painful part of going direct with Meta is navigating their Facebook Developer Portal [...] the actual Next.js and n8n integration is dead simple and bulletproof."*
- Hacker News, **"WhatsApp Business API pricing 2026: what's free and where markup hides"**, 12/06/2026 — <https://news.ycombinator.com/item?id=48504753>: perks_12: *"Implementation was fairly easy. What was horrible was navigating the mess of Meta Business Manager."*
- Hora de Codar, **"Evolution API ou API oficial do WhatsApp: qual escolher para o seu bot com IA?"**, 11/08/2026 — <https://horadecodar.com.br/evolution-api-vs-api-oficial-whatsapp/>: Brasil *"US$ 0,0625 em marketing e US$ 0,0068 em utilidade"*; *"1º de julho de 2026: começou o faturamento local em reais"*; *"1º de outubro de 2026: mensagens de serviço passam a ser cobradas por mensagem"*; janela de 72 h de anúncio *"não foi afetada"*.
- Darwin AI Help Center, **"WhatsApp Business Platform pricing changes: service messages billed starting October 2026"** — <https://help.getdarwin.ai/en/articles/16516839-whatsapp-business-platform-pricing-changes-service-messages-billed-starting-october-2026>: *"Service messages don't get those tiers: the per-message rate is flat"*; *"Any message inside the 72-h Click to WhatsApp window: Free"*.
- AiSensy, **"WhatsApp Service Message Pricing Update October 2026"** — <https://m.aisensy.com/blog/whatsapp-pricing-update-october-2026/>: *"Each WhatsApp Business API will get 1,000 free service messages every month. Billing will start from the 1,001st delivered service message."*
- ChatMaxima, tabela BRL (jul/2026) — <https://chatmaxima.com/whatsapp-api-pricing/brazil/>: marketing R$ 0,3217; utilidade/autenticação R$ 0,035 (terceiro; confirmar no rate card da Meta).
- respond.io, **"Not All Chatbots Are Banned: WhatsApp's 2026 AI Policy Explained"** — <https://respond.io/blog/whatsapp-general-purpose-chatbots-ban>: *"Banned: Chatbots offering open-ended or assistant-style interactions. Allowed: Structured bots for support, bookings, order tracking, notifications and sales."* (TechCrunch, 18/10/2025, confirma as datas 15/10/2025 e 15/01/2026.)
- Cupom Online (comparativo de jun/2026, site de cupons, viés): Z-API a partir de ≈ R$ 97/mês; Twilio ≈ US$ 150+/mês; Whapi ≈ US$ 30/mês — <https://cupomonline.com.br/melhores-api-whatsapp/>.

### (c) O que se aplica à Água Verde

- `FATO`: a Água Verde já está no cenário que a comunidade recomenda: Cloud API direta (sem BSP), Coexistência com o app no celular, templates de utilidade aprovados, IA com guardrails, handoff e kill switch.
- `OPINIÃO` (estimativa de impacto da cobrança de serviço): com ~100 viagens/dia-pico e uma média de, digamos, 1.500–3.000 mensagens de serviço por mês, o excedente sobre as 1.000 gratuitas custa de R$ 17 a R$ 70/mês à tarifa de utilidade (≈ R$ 0,035). Lembretes já são templates de utilidade (R$ 0,035 cada). O orçamento de WhatsApp continua muito abaixo de R$ 100/mês, **desde que não se use templates de marketing** (R$ 0,32 cada).
- `OPINIÃO`: medidas baratas e alinhadas ao que a comunidade diz:
  1. Fazer a IA responder em **uma mensagem consolidada** em vez de várias curtas (cada uma agora é cobrada); `ia_max_tokens_resposta` já existe para isso.
  2. Registrar `direcao='saida'` por categoria (serviço/utilidade/marketing) em `mensagens_whatsapp` e montar no painel `ConfiguracoesWhatsApp` um contador mensal de mensagens de serviço contra a franquia de 1.000.
  3. Não migrar nada para Evolution/Z-API; o número do WhatsApp é o canal comercial da empresa e um ban interrompe a operação.
  4. Se rodar Meta Ads "Click to WhatsApp", a janela de 72 h é gratuita: é o único caso em que anúncios reduzem custo de mensagem.
  5. Checar se o bot está dentro da política: só responde sobre transfer, orçamento, acompanhamento; sempre oferece humano. O prompt do `ia-responder-whatsapp` deve recusar perguntas genéricas.

---

## 4. Automação com IA em pequenas agências de viagem/transfer: o que funcionou e o que foi exagero

### (a) O que a comunidade recomenda

1. **Relatos reais de donos de negócio (não vendedores) são raros e críticos.** Em r/smallbusiness a reação padrão a chatbots é hostil ("customers hate them"); os relatos positivos têm sempre o mesmo formato: **um** caso de uso de alto volume e baixo risco (horário, preço, status), handoff humano claro e dados corretos por trás.
2. **O que funcionou em casos relatados com números:** não perder a primeira resposta (oficina de reparos: "80+ horas/mês" respondendo as mesmas perguntas; cadeia de restaurantes: recuperar 30–40 % de chamadas perdidas valia ≈ US$ 500/dia por loja); rascunho de e-mails e conteúdo (≈ 5 h/semana); limpeza de dados. **O que não funcionou:** copy de vendas, bots que "mentem" sobre reservas, handoff que some, automatizar reembolso/reclamação cedo demais.
3. **Regra técnica repetida em r/n8n:** a IA nunca é a fonte de verdade da reserva. O agente devolve dados estruturados; o sistema grava, verifica a gravação (readback por ID) e só então confirma ao cliente; segurar o horário por 5 minutos para evitar corrida; timeout no handoff para o cliente não ficar "no vácuo".
4. **O que é exagero:** "agentes que resolvem 90 %", agentes de voz como primeiro projeto, CRMs no-code caros (Manychat, Kommo) para operações pequenas, e os números de vendedores (60 % de resolução, ROI em 2–3 meses) sem fonte.
5. **Mudança de canal:** há sinais (Arival/Bókun, Criteo, operadores no r/Tourguide) de que pesquisa de viagem está migrando para ChatGPT/Gemini e de que o CTR do primeiro resultado do Google caiu. Para operadores, isso vira "preparar conteúdo que modelos citem" (preços claros, FAQ, dados estruturados), não "fazer bot".

### (b) Citações (link e data)

- r/smallbusiness, **"Do small businesses actually benefit from AI chatbots for customer support?"**, 12/01/2026 — <https://www.reddit.com/r/smallbusiness/comments/1qastb0/do_small_businesses_actually_benefit_from_ai/>
  - u/bert1589: *"As a consumer, I have only maybe had 1 in 10 AI interactions end without frustration for me."*
  - u/arman_builds77 (22/09/2026): *"yes, but only if implemented narrowly. The businesses that see real benefit are the ones that start with ONE high-volume, low-risk use case (like FAQs, hours, pricing, order status) [...] No clear handoff to a human when the AI got stuck [is a common mistake]."*
- r/smallbusiness, **"Small business owners who have tried 'AI automation' — what did you automate first, and did it actually pay for itself?"**, 04/08/2026 — <https://www.reddit.com/r/smallbusiness/comments/1vfj336/small_business_owners_who_have_tried_ai/>: *"Everyone wants the flashy chatbot. Almost nobody wants to fix the lead-capture workflow that feeds it. Fix the pipeline first, the bot second."* (autor é consultor; os comentários rejeitaram o post como propaganda.)
- r/smallbusiness, **"I automated half my small business with AI. Here's what actually worked"**, 20/12/2025 — <https://www.reddit.com/r/smallbusiness/comments/1pr8yhi/i_automated_half_my_small_business_with_ai_heres/>
  - u/StringConnection: *"Still can't get it to write good sales copy though. Always sounds like a robot pretending to be excited about features."*
- r/n8n, **"I built a WhatsApp + voice AI agent in n8n that handles 90% of customer service. Sold the business"**, 04/04/2026 — <https://www.reddit.com/r/n8n/comments/1sc3i30/i_built_a_whatsapp_voice_ai_agent_in_n8n_that/>
  - OP: *"I was losing 80+ hours a month answering the same WhatsApp messages: 'how much to fix my screen?', 'when can I pick it up?'"*
  - u/Deep_Ad1959 (19/04/2026): *"the biggest unlock wasn't agent accuracy, it was just not dropping the call. [...] accuracy on modifications was never 100 but 90 was enough because the alternative was zero. the only real failure mode i saw was the agent confidently guessing menu items the kitchen didn't actually carry."*
- r/n8n, **"I made a WhatsApp bot to handle clinic bookings and queries"**, 16/04/2026 — <https://www.reddit.com/r/n8n/comments/1smukzv/i_made_a_whatsapp_bot_to_handle_clinic_bookings/>
  - u/Ok-Engine-5124: *"watch out for the 'handoff abyss.' When you mute the AI to let staff take over, you need a secondary timeout workflow [...] make sure your n8n flow applies a temporary 5-minute 'hold' on a time slot."*
- r/n8n, **"stuck on 2 things (webhook verify token + AI lying about bookings)"**, 26/09/2026 — <https://www.reddit.com/r/n8n/comments/1wqlwma/im_very_confused_stuck_on_2_things_webhook_verify/>
  - u/iamrmehdi (01/10/2026): *"I wouldn't let the AI be the source of truth. Have the agent return structured booking data, write it through a normal node, verify the write, and only then send the confirmation."*
  - u/firstratetechie: *"I'd also do a readback using a unique booking ID before promising an appointment."*
- r/twilio, **"Built a WhatsApp AI-to-human handoff system in n8n with Twilio Flex"**, 11/05/2026 — <https://www.reddit.com/r/twilio/comments/1ta8yfk/built_a_whatsapp_aitohuman_handoff_system_in_n8n/>: *"the AI tells the user 'I'm transferring you to a human' and then nothing happens. The conversation just dies."*; u/Kindly-Duty272: *"before connecting, have the ai write a 3-line summary (who they are, what's been tried, the one open question)."*
- Rezdy 2026 Report (24/10/2025) — <https://rezdy.com/blog/global-trends-in-tours-activities-the-2026-report/>: *"62% of operators are using AI for content creation"*; *"56% of operators are using AI, with 75.7% of those users reporting significant time savings"*.
- Bókun, recap do Arival Valencia 2025 — <https://bokun.io/?p=4309>: CTR da primeira posição do Google caiu *"from 32% in November 2023 to 14.2% in 2024"* atribuído a resultados gerados por IA (dado apresentado em palestra).
- Criteo, **"Summer travel trends 2026"** — <https://www.criteo.com/blog/summer-travel-trends-2026/>: em março/2026 o ChatGPT gerou maior participação de landings em páginas de produto do que a busca (+13 p.p.) nos clientes da Criteo (resumo via busca; página completa não acessível).
- Vendedores (viés, sem fonte): Kommo *"Solve over 60% of traveler inquiries"* (<https://en.kommo.com/ai-agent-travel-agency>); Aurora Inbox *"positive ROI within 2-3 months"* (<https://www.aurorainbox.com/en/2025/11/25/travel-agencies-quotes-itineraries-and-payment-reminders-on-autopilot/>).

### (c) O que se aplica à Água Verde

- `FATO`: o desenho atual (fila assíncrona, guardrails, handoff com despedida, kill switch) corresponde ao que a comunidade descreve como "bot que não irrita". O risco apontado pela comunidade que ainda pode existir no projeto: a IA **não deve prometer reserva**; hoje ela responde dúvidas — manter assim até existir ferramenta estruturada que grava em `reservas_site` e faz readback.
- `OPINIÃO` — prioridades que a pesquisa sustenta, por custo/benefício:
  1. **Tempo de primeira resposta** no WhatsApp (já automatizado) e no formulário do site (hoje o `FormOrcamento` só simula envio — conectar ao Supabase e notificar o admin é a automação com maior retorno citado).
  2. **Cotação instantânea por rota** no bot (tabela de preços fixa no prompt/contexto) com link para o checkout do site — é "status/preço", o caso de uso de menor risco.
  3. **Conteúdo com IA** para páginas de destino em PT/ES/EN e FAQ (62 % dos operadores fazem isso); revisão humana obrigatória para copy comercial.
  4. **Não fazer agora:** agente de voz, bot que cria `viagens` sozinho, campanhas de marketing por template.
  5. `OPINIÃO` sobre "AI search": manter preços explícitos, FAQ com JSON-LD (já existe), páginas por rota; é a forma barata de aparecer em respostas de ChatGPT/Gemini.

---

## 5. Navegação e conversão em sites de reserva mobile-first (widget, preço na primeira tela, book-now-pay-later, prova social)

### (a) O que a comunidade recomenda

1. **O thread mais parecido com o caso da Água Verde** (transfer de aeroporto em Paris, r/PPC, mar/2026) mostra o padrão de falha: tráfego bom, formulário preenchido, preço revelado, abandono. O diagnóstico da comunidade: mostrar o preço **antes** (no anúncio e na primeira tela), justificar o prêmio sobre Uber/táxi de tarifa fixa ("o que está incluído: preço fixo, sem surge, motorista espera, monitoramento de voo"), prova social na tela do preço, e oferecer WhatsApp como alternativa ao formulário.
2. **"Book now" faz sentido para serviço de preço fixo**; para serviço que exige conversa, o CTA deve ser contato. Transfer por rota com preço fechado é o caso em que "reservar agora" funciona.
3. **Confiança é a barreira do operador pequeno:** operadores no r/Tourguide dizem que clientes hesitam em pagar no site de empresa desconhecida; o remédio citado é reviews no Google/TripAdvisor (pedidos no fim da viagem, via WhatsApp) e Google Business Profile antes de Instagram.
4. **Benchmarks 2026 (fornecedores, viés, mas consistentes):** 84 % das reservas online em mobile; 35 % após 17 h; carteiras digitais 24 % das transações; páginas de transporte/serviços de viagem convertem 14,8 % (melhor subcategoria do setor); ~62 % de quem chega ao motor de reservas não completa; 0,1 s de carregamento vale +10 % de progresso na reserva; widget deve carregar em <2 s na própria página do produto; taxa extra revelada no checkout é a causa nº 1 de abandono (Baymard, 48 %).
5. **"Book now, pay later":** nenhuma discussão de operadores encontrada no Reddit em 2025-2026; só material de Viator (Reserve Now & Pay Later) e PayPal "Pay in 3". Não há evidência independente de ganho para transfers.

### (b) Citações (link e data)

- r/PPC, **"12% CTR on Google Ads, but 0 conversions for my Paris Chauffeur site. UX or Pricing?"**, 28/03/2026 — <https://www.reddit.com/r/PPC/comments/1s5v78h/12_ctr_on_google_ads_but_0_conversions_for_my/>
  - OP: *"Users fill out the booking form, click 'Calculate Price,' see the final price (around €75 for CDG airport to Paris), and then immediately close the page."*
  - u/Different-Goose-8367: *"Put the price in your ad first headline to qualify the traffic. [...] Show the price and add 'premium' too."*
  - u/Aunker: *"Things like what's included, reliability, pickup experience, no surge, fixed pricing, and real social proof matter a lot right there [at the price step]."*
  - u/tsukihi3: *"56 € entre l'aéroport de Paris - Charles-de-Gaulle et Paris rive droite [tarifa fixa oficial de táxi] [...] If you can't justify the 10-19€ difference, you're not going to convert."*
  - u/Far-East-locker: *"have them WhatsApp you for the quote, you got their contact and can nurture the lead better."*
  - u/fatihtas (anunciante de táxis em 20+ cidades): *"booking form is also a waste of time. [...] usually passengers handle all this by talking on the phone."*
- r/PPC, **"How important is a 'buy now' button for non-tangible goods?"**, 01/12/2025 — <https://www.reddit.com/r/PPC/comments/1pbeolw/how_important_is_a_buy_now_button_for_nontangible/>
  - u/petebowen: *"unless it's a fixed price service, that's very easy to understand, having a buy now button for a service business doesn't make sense."*
- r/Tourguide, **"Struggling to get online bookings and reviews as a small tour business"**, 29/08/2026 — <https://www.reddit.com/r/Tourguide/comments/1w1qm9n/struggling_to_get_online_bookings_and_reviews_as/>
  - u/Vine_Travel (14/09/2026): *"people are reluctant to book on the sites of smaller operators due to lack of trust. [...] I keep in contact with the majority of my clients through whatsapp and then send links to TripAdvisor and Google."*
  - u/bogdanelcs (28/09/2026): *"Google Business Profile does more heavy lifting than people expect for local tours, way more than Instagram."*
- r/Tourguide, **"what would make you trust the company from day one?"**, 28/09/2026 — <https://www.reddit.com/r/Tourguide/comments/1wsgle9/if_an_experienced_tourism_professional_started_a/>: u/echoesinthepit: *"How could a brand new company on day 1 have reviews? That would immediately tell me 'scam'."*
- r/smallbusiness, **"I started a boat tour company a year ago [...] private bookings are almost nonexistent"**, 08/10/2026 — <https://www.reddit.com/r/smallbusiness/comments/1x0o5jb/i_started_a_boat_tour_company_a_year_ago_our/>: u/False_Assumption_972: *"Build a page per use case [...] with clear prices. Pitch concierges at nearby hotels with a commission, and collect emails from sunset guests at boarding."*
- ROLLER, **"5 Key Online Checkout Insights from the 2026 Benchmark Report"**, 28/09/2026 (3.500+ venues) — <https://www.roller.software/blog/5-key-online-checkout-insights-2026-benchmark-report>: *"In 2025, 84% of online bookings happened on mobile"*; *"35% of all online bookings [...] occurred after 5 p.m."*; *"Digital wallets like Apple Pay and Google Pay now account for 24% of all online transactions"*; recomendações: *"Fewer steps, Large, tap-friendly buttons, Clear pricing, Fast load times."*
- Web Tonic, **"Hospitality and Travel Landing Page CRO: The 2026 Report"**, 26/09/2026 — <https://www.webtonic.io/blog/hospitality-and-travel-landing-pages-and-cro-statistics>: *"Transportation and travel-services pages convert at 14.8%, the strongest subcategory"*; *"Around 62% of visitors who reach a booking engine never complete it"*; *"A 0.1-second load-time improvement lifted travel booking-rate progression by 10%"*; *"Average travel mobile pages load in 10.1 seconds, against a 53% mobile abandonment threshold at 3 seconds."*
- Zaui, **"How Tour Operators Can Drive 35% More Direct Bookings in 2026"**, 28/04/2026 — <https://www.zaui.com/resources/blog/tour-operator-direct-bookings-2026>: *"the booking widget loads in under two seconds and is embedded directly on the activity or tour page — not buried in a separate 'reservations' tab"*; *"availability is shown in real time"*; *"automated confirmation [...] sent within seconds of payment"*.
- CaptainBook (09/04/2026), citando Baymard: *"48% of cart abandonments are caused by extra costs being too high [...] revealed at checkout."*
- Reservio, **"Mobile Booking: Why It's Essential in 2026"** (26/02/2026) cita Checkfront: mobile 44,3 % das reservas e conversão mobile 61,9 % vs. 45,3 % desktop — <https://www.reservio.com/blog/tips/mobile-first-booking>. **Atenção:** esses números são de 2017 (PhocusWire), reciclados em 2026.
- Viator Partner Resources, **Reserve Now & Pay Later** — <https://partnerresources.viator.com/blog/reservenowpaylater/>: reservar até 4 meses antes e cancelar até 2 dias antes; afirma aumento de conversão sem dados.

### (c) O que se aplica à Água Verde

- `FATO`: as landing pages atuais já exibem preço (R$ 350 / R$ 420) e FAQ, o que é o padrão recomendado. O que falta, segundo a comunidade, é o passo seguinte: do preço para o pagamento sem sair da página.
- `OPINIÃO` — fluxo mobile de 3 telas, uma rolagem cada:
  1. **Primeira tela da home e de cada rota:** origem/destino (chips), data, hora, pax → preço fixo em R$ (com conversão aproximada em US$/EUR para o visitante estrangeiro), e abaixo "o que está incluído" (preço fixo, sem surge, espera monitorada do voo, cadeira infantil opcional) + 2 reviews reais com link ao Google/TripAdvisor.
  2. **Checkout:** nome, WhatsApp, voo (opcional), idioma; Pix / cartão / Apple Pay / Google Pay (Stripe Checkout cobre); nenhuma taxa extra revelada aqui — se houver taxa de cartão internacional, embutir no preço.
  3. **Confirmação:** link `/acompanhar/[token]` + mensagem de WhatsApp (template de utilidade).
- `OPINIÃO`: manter o botão WhatsApp flutuante como segunda via (comunidade de táxi/transfer diz que muita gente prefere falar), mas medir separadamente conversões "pagou no site" e "pediu no WhatsApp".
- `OPINIÃO` sobre book-now-pay-later: para transfer, a versão útil é "reserve com cartão, cobramos só na véspera" (Stripe permite salvar o método e cobrar off-session) ou "Pix na reserva com cancelamento grátis até 24 h". Sem evidência de ganho, tratar como teste A/B, não como padrão.
- `OPINIÃO`: performance mobile (LCP < 2,5 s) e idioma (next-intl ainda não ativado) são pré-requisitos de qualquer ganho de conversão; a comunidade coloca velocidade antes de design.

---

## 6. Google Ads para transfer de aeroporto (estrutura, IA para anúncios, Performance Max vs. Search em 2026)

### (a) O que a comunidade recomenda

1. **Search primeiro, PMax depois (ou nunca) para lead gen local com orçamento pequeno.** Regra repetida em r/PPC e r/googleads: PMax "é 90 % Search de qualquer jeito", otimiza para a conversão mais fácil, canibaliza marca, precisa de ~30 conversões/mês (requisito de tCPA; Max Conversions aceita menos) e orçamento de milhares de dólares. Dado externo: em 3.300+ campanhas PMax não-varejo, Search teve taxa de conversão maior em 84 % das vezes (Adalysis, via NAV43).
2. **AI Max for Search em 2026:** relatos majoritariamente negativos para nichos pequenos (955 consultas vs. 30, 72 % do gasto fora do tema; "mais conversões a um CPA maior"); negativas não resolvem porque o sistema inventa consultas a partir da página. A migração automática de campanhas com broad match/ACA para AI Max começou em 1º/09/2026 — conferir a conta.
3. **Erros de iniciante que a comunidade cita em sequência:** usar "Maximizar cliques" (compra cliques baratos), não verificar a conversão (preencher o próprio formulário a partir do anúncio), segmentação "interessado em" em vez de "presença", não ler o relatório de termos de busca, declarar vitória/derrota com 50–60 cliques.
4. **Conversões:** só reserva paga ou contato forte como primária; abertura de página de contato como secundária; para chamadas, exigir duração mínima (2 min) e importar conversões offline qualificadas.
5. **Para transfer/táxi especificamente:** preço no título do anúncio para qualificar; campanhas por rota/aeroporto; negativas de "uber", "ônibus", "emprego", "como chegar"; para público estrangeiro, segmentar país de origem + idioma + palavras-chave do destino (ex.: "Recife airport transfer" para EUA/Reino Unido; "traslado aeropuerto Recife" para Argentina/Chile).
6. **IA para criar anúncios:** as fontes de 2026 tratam a geração de texto (Gemini em RSA/AI Max) como útil para rascunhos, mas alertam que "text customization" sobrescreve anúncios bem escritos; a prática recomendada é gerar variações com IA e aprovar manualmente, mantendo preço e nome do destino fixados.
7. **Local Services Ads** voltam em ago/2026 dentro do PMax pay-per-lead — provavelmente só EUA/Canadá/alguns países europeus; call-only ads descontinuados em fev/2026.

### (b) Citações (link e data)

- r/PPC, **"12% CTR on Google Ads, but 0 conversions for my Paris Chauffeur site"**, 28/03/2026 — <https://www.reddit.com/r/PPC/comments/1s5v78h/12_ctr_on_google_ads_but_0_conversions_for_my/>: OP: *"phrase match for keywords like 'paris airport transfer' and getting a solid 12% CTR at ~$2.50 CPC. [...] 50 clicks, €120 spent, 0 bookings."* u/ppcbetter_says: *"Look at the queries, not the keywords."*
- r/PPC, **"Pulled the search terms after AI Max was on for a week. 955 queries vs 30 after turning it off."**, 31/08/2026 — <https://www.reddit.com/r/PPC/comments/1w3sz2n/pulled_the_search_terms_after_ai_max_was_on_for_a/>
  - OP: *"72% of reported spend went to stuff that had nothing to do with the product."*
  - u/Accomplished_Pay_948: *"Negatives cannot fix this, by design. AI Max invents queries off your page text."*
  - u/Recent-Development49: *"I'd leave it off until there's enough converting search volume that the extra queries are actually in-category."*
- r/PPC, **"AI Max performance - working for you?"**, 30/09/2026 — <https://www.reddit.com/r/PPC/comments/1wucnu6/ai_max_performance_working_for_you/>: OP: *"saw an increase in conversions, however, at an higher CPA."* u/optmyzr-aaron: *"ai max is mostly just broad match unless you're using url expansion."*
- r/googleads, **"Honest feedback on Performance Max (PMax) after long-term use?"**, 06/04/2026 — <https://www.reddit.com/r/googleads/comments/1se4oyd/google_ads_honest_feedback_on_performance_max/>
  - u/NoPause238: *"it struggles for lead gen because it optimizes for easy conversions not qualified ones."*
  - u/Pretend-Leg-6760: *"I believe it wants around 30 conversions a month which just isn't doable for the niches I work with. I've dabbled with 'micro conversions' but it's always just led to more spam."*
- r/PPC, **"PMax campaign seems to be optimizing for low-quality micro-conversions"**, 05/07/2026 — <https://www.reddit.com/r/PPC/comments/1unuurs/pmax_campaign_seems_to_be_optimizing_for/>
  - u/QuantumWolf99: *"800 contact-page opens vs 33 actual bookings is the giveaway. [...] move contact page open to Secondary immediately."*
  - u/TTFV: *"Completed phone calls, you can set a minimum call length of 2 minutes."*
- r/PPC, **"Pmax, Search or Call only?"**, 25/01/2026 — <https://www.reddit.com/r/PPC/comments/1qmhja3/pmax_search_or_call_only/>
  - u/tristeecfome: *"PMax usually is 90% Search anyway. So imo it makes a lot more sense to expand your search campaign than using a PMax."*
  - u/JF_Bacchini: *"exhaust search campaigns potential before you jump to PMax. [...] The awareness channels rarely bring in quality leads, but the clicks are cheap so PMax gets to look like its averages are better."*
- r/googleads, **"Paused a Rep-suggested PMax, fixed 'Store Visit' tracking, and went back to basics. 78-day results"**, 24/03/2026 — <https://www.reddit.com/r/googleads/comments/1s29pll/paused_a_repsuggested_pmax_fixed_store_visit/>: u/QuantumWolf99: *"Search with proper intent targeting beats automation every time when conversion quality actually matters."*
- r/googleads, **"Bid strategy for new lead gen accounts?"**, 25/08/2026 — <https://www.reddit.com/r/googleads/comments/1vy8q4o/bid_strategy_for_new_lead_gen_accounts/>
  - u/Bitter-Quail-7441: *"Max clicks at that budget does exactly what you're describing. It has one job, buy clicks [...] The 30-a-month figure everyone repeats is the requirement for Target CPA, not for plain Max Conversions."*
  - u/BigBrightLightsDigi: *"Start with Manual CPC until conversion tracking is verified and coming in."*
- r/PPC, **"$626 spent on Google Search Ads, 61 clicks, but zero leads"**, 22/07/2026 — <https://www.reddit.com/r/PPC/comments/1v3eyn0/626_spent_on_google_search_ads_61_clicks_but_zero/>
  - u/BaptisteNo: *"fill in your own form from the live ad. if it registers, it's a tracking problem. if it doesn't, it's the page."*
  - u/chiguy09: *"confirm location targeting is set to people IN your location. You don't want people 'interested in' your location."*
  - OP (update 24/07): *"Paused phrase-match keywords. Kept a small group of high-intent exact-match keywords."*
- r/PPC, **"How to target people who book food tours in advance, from abroad?"**, 13/03/2026 — <https://www.reddit.com/r/PPC/comments/1rsjahz/how_to_target_people_who_book_food_tours_in/>: dados de um concorrente: *"Stripe (Website + Direct): €42,778 - Viator: €23,459 - GetYourGuide: €3,007"*; u/ernosem: *"$15/day with a $0.7 CPC means you're getting roughly 20 clicks a day. That's not enough data [...] are your campaigns actually targeting the UK and Germany?"*
- r/PPC, **"Google ads for Travel agency"**, 15/03/2026 — <https://www.reddit.com/r/PPC/comments/1ru8tlt/google_ads_for_travel_agency/>: u/pixelyash1: *"even exact match keywords now trigger for related terms [...] add them as exact match negative keywords immediately."*
- r/PPC, **"I manage 50+ call-focused Google Ads campaigns [táxis]"**, 02/09/2026 — <https://www.reddit.com/r/PPC/comments/1w56yyu/i_manage_50_callfocused_google_ads_campaigns/>: u/Content-Parking-621: *"Feeding your business owner call-quality feedback back into Google Ads as an offline conversion import would let smart bidding actually optimize toward real customer calls."*
- r/googleads, **"Google Ads: Local Services Ads Are Back"**, 07/08/2026 — <https://www.reddit.com/r/googleads/comments/1vhzebj/google_ads_local_services_ads_are_back/>: *"Google is moving Local Services Ads into Google Ads as Performance Max pay-per-lead campaigns [...] beginning August 2026."*; u/Swimming_Case: *"I wonder if this time they will be available for all geographic locations, instead of just for US, Canada and some select countries in Europe."*
- NAV43, **"Search vs Performance Max for Lead Gen: Which Should You Scale First?"** (2026) — <https://nav43.com/blog/search-vs-performance-max-for-lead-gen-scale-guide-2026/>: *"Search campaigns had higher conversion rates 84% of the time when both campaign types were eligible for the same search terms (Adalysis, 2024-2025)"*; *"91.45% of accounts have keyword overlap between Search and PMax (Optmyzr, 2025)"*; PMax aceita até 10.000 negativas por campanha desde jan/2025; relatório por canal desde nov/2025.
- Valley Marketing Group, **"Performance Max for Local Service Businesses: Worth It in 2026?"**, 07/09/2026 — <https://thevalleymarketinggroup.com/blog/performance-max-local-service-businesses-2026/>: *"PMax is probably not worth it if your total monthly ad budget is under $5,000"*; *"Brand exclusions set up at the account level. This is non-negotiable."*
- Groas, **"Performance Max vs. Search campaigns In 2026"**, 23/04/2026 — <https://groas.com/post/performance-max-vs-search-campaigns-2026-which-should-you-use>: *"At lower budgets (under $3,000 per month), Search campaigns often deliver more predictable results."*
- Groas, **"Google Ads AI Max 2026: Review, Limitations"**, 06/05/2026 — <https://groas.com/post/google-ads-ai-max-2026-review-limitations-how-to-manage>: *"URL expansion can send paid traffic to pages that were never designed to convert: your careers page, your about page."*
- Google Ads Help, **"Performance Max best practices for lead generation"** — <https://support.google.com/google-ads/answer/13775965>: *"Use lead generation specific goals, like 'Contact', 'Submit Lead Form', 'Book Appointment' [...] Optimize to deeper funnel conversion actions where possible."*; para lances por valor, *"at least 15 conversions in the last 30 days"*.
- Search Engine Roundtable (via busca): *"starting September 1, 2026, campaigns using automatically created assets (ACA) and/or campaign-level broad match setting will automatically be upgraded to AI Max for Search campaigns."* — <https://seroundtable.com/google-ads-migrate-ai-max-sep1-41829.html>
- ALM Corp, **"Google Ads Updates in 2026"** — <https://almcorp.com/blog/google-ads-updates-2026/>: criação de call-only ads removida em fev/2026; param de servir em fev/2027.

### (c) O que se aplica à Água Verde

- `OPINIÃO` — estrutura inicial (orçamento R$ 1–3 mil/mês, abaixo de todos os limiares citados para PMax):
  1. **Campanhas Search por rota e idioma:** `REC→Porto de Galinhas (PT)`, `REC→Carneiros (PT)`, `Recife airport transfer (EN, países EUA/Reino Unido/Canadá)`, `traslado aeropuerto Recife (ES, Argentina/Chile/Uruguai/Espanha)`. Correspondência exata e de frase; sem broad; **AI Max desligado** e conferir se a conta não foi migrada em setembro.
  2. **Localização:** "presença" em Brasil para PT; para EN/ES, presença no país de origem + palavra-chave do destino (o viajante pesquisa antes de embarcar).
  3. **Anúncio:** preço fixo no título ("Transfer Recife → Porto de Galinhas R$ 350 · preço fixo"), "motorista espera seu voo", "pague com Pix/cartão"; sitelinks para as duas landing pages e para `/quem-somos`.
  4. **Conversões:** primária = reserva paga (evento do webhook, importado via Google Ads API/GA4) e envio do formulário de orçamento com validação; secundária = clique em WhatsApp. Verificar disparo preenchendo o próprio formulário a partir do anúncio.
  5. **Lances:** manual/ECPC nas primeiras semanas até confirmar rastreamento; depois Maximizar conversões (sem tCPA até ~30 conv/mês).
  6. **Negativas desde o dia 1:** uber, 99, táxi comum, ônibus, "como chegar", "distância", emprego, motorista (vaga), aluguel de carro.
  7. **IA para peças:** gerar 15 títulos/4 descrições por rota e idioma com Gemini/Claude a partir das landing pages, revisar e fixar título 1 com preço; não ativar "text customization"/"URL expansion".
  8. **PMax** só se o volume passar de ~30 reservas pagas/mês por 2 meses, com exclusão de marca e páginas de conversão apenas.
- `FATO` relevante: Local Services Ads provavelmente não estarão disponíveis no Brasil; não contar com isso.

---

## 10 decisões sugeridas

Separadas em "sustentado pelas fontes" (`FATO`) e "minha recomendação" (`OPINIÃO`).

1. **Substituir a Paytour por um checkout próprio em Next.js + Supabase para as rotas de preço fixo.** `FATO`: comissão sobre venda direta é o que a comunidade mais rejeita; o checkout em si é pequeno. `OPINIÃO`: economia de R$ 250/mês e integração nativa com `viagens`; manter a Paytour um trimestre em paralelo se ela trouxer >20 % das vendas.
2. **Stripe (conta brasileira) com Checkout hosted: Pix + cartão nacional/internacional + Apple/Google Pay.** `FATO`: Pix 1,19 %, cartão nacional 3,99 % + R$ 0,39, internacional +2 %, sem mensalidade; relatos de dev com Mercado Pago são piores. `OPINIÃO`: reavaliar Mercado Pago/Asaas para Pix só se o volume Pix justificar a diferença de ~1,2 p.p.
3. **Webhook idempotente com uma única função de confirmação** (tabela `stripe_eventos` com unique em `event_id`, corpo cru, `constructEventAsync` em Edge Function, página de sucesso que reconcilia pelo `CHECKOUT_SESSION_ID`, cron de expiração de pendentes). `FATO`: padrão convergente em r/stripe, r/Supabase e Stripe Team.
4. **Supabase como única fonte de verdade da reserva; nada de calendário paralelo.** `FATO`: dois threads de 2026 com overbooking por dupla fonte. `OPINIÃO`: `reservas_site` → `viagens` somente após `pago`.
5. **Permanecer na WhatsApp Cloud API oficial, sem BSP e sem Evolution/Z-API.** `FATO`: consenso dos devs com produto sério; impacto da cobrança de serviço para operação pequena fica em dezenas de reais/mês. `OPINIÃO`: não usar templates de marketing; medir mensagens de serviço contra a franquia de 1.000/mês.
6. **Reduzir mensagens por conversa do bot e nunca deixá-lo prometer reserva.** `FATO`: cobrança por mensagem desde 1º/10/2026; relatos de "IA mentindo sobre reservas". `OPINIÃO`: resposta única consolidada; qualquer função de reserva grava, faz readback e só então confirma.
7. **Conectar `FormOrcamento`/`ContactForm` ao Supabase com notificação imediata ao admin (Fase 2 já planejada).** `FATO`: "não perder a primeira resposta" é o ganho de automação mais citado por donos de negócio. `OPINIÃO`: é a automação de maior retorno antes de qualquer IA nova.
8. **Preço fixo na primeira tela e no anúncio, com "o que está incluído" e reviews reais ao lado do preço.** `FATO`: diagnóstico unânime no caso do transfer de Paris; páginas de transporte convertem 14,8 % quando bem feitas. `OPINIÃO`: botão WhatsApp como segunda via, medida separadamente.
9. **Google Ads: só Search, por rota e idioma, correspondência exata/frase, AI Max e PMax desligados, conversão primária = reserva paga.** `FATO`: Search vence PMax em 84 % dos casos de lead gen; AI Max com relatos de 72 % de gasto fora do tema; limiares de 30 conv/mês e US$ 3–5 mil/mês. `OPINIÃO`: usar IA apenas para rascunhar RSAs, com revisão e preço fixado.
10. **Tratar "book now, pay later", agente de voz e marketplaces de IA como testes futuros, não como base.** `FATO`: nenhuma evidência independente de ganho encontrada para transfers; vendedores são a única fonte. `OPINIÃO`: priorizar velocidade mobile, idioma (ativar next-intl) e coleta de reviews via WhatsApp pós-viagem, que a comunidade coloca antes de qualquer feature nova.

---

## Fontes consultadas que não entraram nas citações (para rastreabilidade)

- r/Tourguide: "Bokun referral" (30/08/2026), "Tour operators managing bookings across platforms" (24/09/2026), "How to sync tour availability across platforms" (02/10/2026), "Problem: I'm getting bookings" (15/05/2026).
- r/brdev: "Tomei ban no whats por causa da minha empresa" (27/08/2026), "Clonei o outbid.lol [...] o que o Pix real me ensinou" (26/08/2026), "Gateway de pagamento pra SaaS" (17/09/2026).
- r/empreendedorismo: "Qual a melhor estratégia de WhatsApp para quem está começando?" (03/05/2026), "Melhor combinação de WhatsApp API oficial e não oficial?" (25/05/2026), "ajuda a escolher crm e api" (agência de viagens, 07/08/2026, sem respostas úteis).
- r/n8n: "5 things Meta doesn't tell you about WhatsApp Cloud API + n8n" (09/07/2026).
- r/SaaS: "I built a WhatsApp AI agent because every alternative charged per-message fees" (12/02/2026).
- r/whatsapp: "How much $$$ is Meta going to make by charging for service messages" (30/09/2026), "WhatsApp Business API Pricing Is So Confusing" (09/12/2025).
- Hacker News: "Tell HN: Meta developer account suspended" (24/06/2025, 172 pontos) — risco de dependência de plataforma.
- TabNews: "Alternativas ao stripe billing?" (≈ 2024), comentário sobre Pix da Stripe "liberado depois de 90 dias se você for aceito na fila de convite" — desatualizado em 2026.
- Google Ads Help (PMax lead gen), Localsearchforum (2024), Practical Ecommerce (PMax 2026), YCloud (reajuste jul/2026 por país), Wexio (preços 2026), Meta/TechCrunch (política de IA), Engadget/Reuters (ordem da UE).
