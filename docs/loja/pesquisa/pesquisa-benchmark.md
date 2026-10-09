# Benchmark de sites de venda de transfer/receptivo — Europa e Brasil

**Objetivo:** orientar a loja própria da Água Verde Transfers (Recife/PE; transfer privado aeroporto ↔ Porto de Galinhas, Maragogi, Carneiros etc.; público PT/ES/EN; hoje vende via Paytour).

**Método:** navegação headless (Playwright/Chromium, viewport 1366×900, UA de Chrome 130, locale pt-BR) em 8/10/2026 (UTC). Para cada site: home → página de rota/produto → fluxo de reserva até a tela de dados/pagamento, sem pagar. Capturas (`.png`, `.txt`, `.links.txt`) ficaram em `/tmp/claude-0/-home-user/2cdd4f05-4745-5825-b064-4b321fb34806/scratchpad/pw/`.

**Convenção:** cada seção separa **Fatos observados** (texto literal do site) de **Opinião** (minha leitura). Preços são os exibidos no dia e servem só como referência de estrutura.

**Cobertura:**

| Site | Home | Rota/produto | Reserva até dados/pagamento |
|---|---|---|---|
| welcomepickups.com | ✅ | ✅ | parcial (widget não avançou sem data válida; app de reserva é `traveler.welcomepickups.com`) |
| suntransfers.com | ✅ | ✅ | ✅ 5 passos completos até tela de pagamento |
| hoppa.com | ✅ | ✅ | ✅ até resultados + aviso de endereço |
| transfeero.com | ✅ | ✅ | ✅ passos 1 (veículo) e 2 (dados) de 4 |
| blacklane.com | ✅ | ✅ | ✅ seleção de classe + dados do passageiro |
| mozio.com | ✅ | ✅ | ❌ formulário exige data via datepicker; não avançou (2 tentativas) |
| kiwitaxi.com | ✅ | ✅ | ✅ checkout (1ª tentativa deu erro 500 do site; 2ª OK) |
| 4trip.com.br (→ vepway.com.br) | ✅ | ✅ | parcial (seleção de tarifa; carrinho não abriu) |
| enter.travel (+ app.enter.travel) | ✅ | ✅ | ✅ calendário com preço por dia + seletor de veículos |
| vivoportodegalinhas.com.br | ❌ domínio estacionado (GoDaddy) — substituído por Luck Viagens e Book Transfer | | |
| cvc.com.br/transfer | ❌ 403 (Cloudflare "Um momento…") via Playwright, curl e WebFetch (EGRESS_BLOCKED) | | |
| transferaguiarj.com.br (Rio) | ✅ | ✅ | n/a — só orçamento via WhatsApp |
| booktransfer.com.br (Rio/BR) | ✅ | ✅ | ✅ carrinho WooCommerce + checkout Mercado Pago |
| evertransfer.com.br (SP) | ✅ | — | n/a — formulário/WhatsApp |
| chmtransportes.com.br (SP) | ✅ | ✅ | n/a — tabela de preços + WhatsApp/Telegram |

---

## 1. Welcome Pickups — welcomepickups.com

URLs visitadas (08/10/2026): `https://www.welcomepickups.com/`, `/lisbon/airport-transfer-to-city/`, `/lisbon/airport-taxi/`.

**Fatos observados**
1. **Menu:** Transfers · Sightseeing Rides · Guides · For Partners · For Drivers · Company · EN · Help · My Bookings.
2. **Primeira tela:** headline "Arrive. Discover. Experience. Personalised transportation designed for travel"; widget com abas One Way / Return, campos From, To, Date & Time, Passengers, Luggage pieces e botão Continue; contador social "22317 travelers in 353 destinations booked a ride today"; três notas (4.9/5, 4.93/5, 4.9/5 — TripAdvisor e outros); carrossel de motoristas com nome, carro e idiomas ("Each driver is carefully handpicked and vetted… One-on-one Interview, Identity and vehicle check, Safety protocol training").
3. **Página de rota (Lisboa aeroporto → cidade):** é um guia editorial com tabela comparativa (Welcome private transfer €26 · Táxi €21 · Metrô €4.30 · Ônibus €4.60), seletor "PRICE FOR 1–12 Passengers" que recalcula a tabela, autor e data do artigo. Página `/lisbon/airport-taxi/` mostra frota com preço **por veículo**: Sedan até 3 pax "From €28", Minivan até 8 "From €59"; explica passo a passo (reserva → recebe nome, telefone, foto e placa do motorista → motorista monitora voo → ponto de encontro no app).
4. **Fluxo de reserva:** widget na página pede From/To/Data/Pax/Bagagem → "Continue booking". O "My Bookings" aponta para `traveler.welcomepickups.com` (app do viajante). Não consegui avançar além do widget (o campo de data é um datepicker customizado); o fluxo real continua no app do viajante.
5. **Confiança:** selos de avaliação (4.9), contador de reservas do dia, perfil de motoristas, "Welcome Rewards" (até 8% de volta), "Refer & Earn"; seção B2B ("1500+ hotels", "800+ vacation rentals", widget de monitoramento de voo "Delta Airlines 202 On time").
6. **Idiomas:** hreflang ar, de, el, en, es, fr, it, pl, pt-pt, ru, sv, tr.
7. **WhatsApp/chat:** nenhum; "Help" leva a central Intercom (support.welcomepickups.com).

**Opinião**
- Melhor coisa: a página de rota é **conteúdo SEO + conversão** na mesma peça (compara táxi, metrô, ônibus e o produto deles com preço real) — exatamente o tipo de página que ranqueia para "como ir do aeroporto X ao destino Y".
- O "driver profile" (foto, carro, idiomas) humaniza o serviço — barato de copiar.

## 2. Suntransfers — suntransfers.com

URLs: `https://www.suntransfers.com/`, `/faro-airport`, `/faro-airport-to-albufeira`, `https://booking.suntransfers.com/booking?step=1…5`.

**Fatos observados**
1. **Menu:** Agencies · Help Centre · English · € EUR · My booking (menu enxuto; destinos ficam no corpo/rodapé).
2. **Primeira tela:** "Reliable, low cost airport transfers — Book a private transfer or shared shuttle at over 700 airports"; formulário Arrival airport / Going to / Flight arrival (data+hora) / Add a return / 2 adults / Search; abaixo: "Free cancellation · Flight monitoring · No hidden fees · 24/7 support"; stats 18+ anos, 4M+ viajantes/ano, 700+ locais; cards de veículo com "from €" (Express Shuttle from 3.34€, Private Transfer from 7.31€, Minivan, VIP, WAV, Coach); grade de aeroportos populares "pp from €".
3. **Página de rota (Faro → Albufeira):** título "Taxi and transfer from Faro Airport to Albufeira – journey approx. 45 min"; mesmo formulário já preenchido; cards por classe com preço **por veículo** (Private Transfer from 40.76€ up to 4 pax, Minivan 47.44€ up to 8, WAV 125.66€, Shuttle 11.08€/pessoa); "Other travellers also booked" com km/min/preço; passo a passo 1-4; "Anything we should plan around? Child seats on request · Room for extra luggage · Sports equipment · Wheelchair"; 4 selos de avaliação (4.3/45.000+, 4.5/39.000+ etc.); FAQ.
4. **Fluxo de reserva (subdomínio booking.):** stepper **VEHICLE → EXTRAS → PASSENGERS+TRANSFERS → CONFIRMATION → PAYMENT** (5 passos). Passo 1 lista veículos ("Private Transfer up to 3 passengers, 3 medium suitcases, 45 mins, Total one-way price 49.59€, FREE Cancellation, No hidden costs, Select this vehicle"). Passo 2 extras: "Golf Bag FREE", "5 min extra stop in same town 15.00€ each way" (cadeirinha aparece "on request"). Passo 3 pede Name, Surname, Email ("We'll send your booking voucher here" + "Save my quote and send me an email"), Mobile + país, Airline, Flight number, Flight origin, acomodação (autocomplete "Hotel name, street address…"). Passo 5 (pagamento) mostra "CANCELLATION PROTECTION only 3.09€", price breakdown (Vehicle 49.59 + Cancellation protection 3.09 + SMS confirmation 1.75 = 54.43€), "No charge to pay by credit or debit card… Transaction will be made in Euros", aceite de T&C. **Não cria conta.** Seletor de moeda inclui BRL; idiomas no checkout: EN, ES, DE, NL, FR, CA, IT, PT, HU, NO, PL, SV, FI, DA.
5. **Confiança:** "Travellers' Choice 2025 (30,900 reviews)", "FREE cancellation up to 48 hours", "No hidden fees", "Flight monitoring", "24/7 support", "Fixed price, no card fees".
6. **Idiomas:** 14 (hreflang ca, da, de, en, es, fi, fr, hu, it, nb, nl, pl, pt, sv).
7. **WhatsApp/chat:** nenhum; Help Centre (artigos) e telefone 24/7.

**Opinião**
- É o modelo mais completo de **checkout sem conta** com stepper visível e upsells discretos (proteção de cancelamento, SMS). O "Save my quote and send me an email" é um recurso de recuperação de carrinho simples e valioso.
- Página de rota com **preço por classe + km + minutos** é o padrão a copiar para REC→PDG, REC→Carneiros, REC→Maragogi.

## 3. hoppa — hoppa.com

URLs: `https://www.hoppa.com/en`, `/en/portugal/lisbon-portela-airport`, `/en/booking` (resultados).

**Fatos observados**
1. **Menu:** About us · FAQ · Affiliates · Countries & airports · Deals · Business; mega-lista de aeroportos e resorts de esqui; seletor English · £ GBP.
2. **Primeira tela:** "Search, Compare & Book — Cheap Airport Transfers, Private Holiday Transfers, Taxis, Hotel Pickups & Shuttle"; widget From location / To location / data / hora ("Now") / RETURN / 1 Passengers; abas Transfers e Taxis (pré-reserva vs. ride-hailing); "182+ countries, 2,600+ airports, 70,000+ trusted local partners, 40M+ travellers"; "Great · 82.528 reviews on Trustpilot"; cards de tipo de veículo com assentos/bagagem/"Best for"; destaque "Meet hoppa in ChatGPT".
3. **Página de rota (Lisboa):** texto editorial longo; tabela "Lisbon Airport to City Centre — Shared Shuttle (per person) From £12 / Private Car (per vehicle) £25–£45 / Cascais £40–£60 / Sintra £45–£65"; tipos de veículo com "1 suitcase + 1 hand luggage per person"; FAQ; explica SMS de lembrete 24h antes.
4. **Fluxo de reserva:** resultados em `/en/booking` com cards por categoria (STANDARD £31.43 "Estimated price", GREEN, COMFORT £41.39, LARGE 1-6 pax £54.20, BUSINESS £57.60), Driver ETA, filtro "Lowest price", mapa Google; ao clicar BOOK NOW apareceu o aviso "You have selected a non-specific pickup or drop off location… please edit your search with an exact address, point of interest or hotel name". Não cheguei ao pagamento. Moedas EUR/GBP/USD.
5. **Confiança:** Trustpilot (82.528 avaliações), "fixed-price", "100% Secure", "featured on".
6. **Idiomas:** hreflang da, de, en, es, fr, it, nl, no, sv.
7. **Chat:** widget Zoho SalesIQ ("We're Online! How may I help you today?"); WhatsApp citado só em textos.

**Opinião**
- Modelo de **marketplace/comparador** — pouco aplicável a um operador único. O que vale: exigir endereço exato (hotel) antes de fechar preço, e as tabelas de preço indicativo por rota na página SEO.

## 4. Transfeero — transfeero.com

URLs: `https://www.transfeero.com/en/`, `/en/lisbon-portela-airport-transfers-lis/`, `/en/lisbon-portela-airport-transfers-lis/transfer-from-lisbon-airport-to-cascais/`, `https://book.transfeero.com/reservation?ride=…&step=1` e `step=2`.

**Fatos observados**
1. **Menu:** Airport ride · City rides · Hourly Service · Help · Business · EN · Sign-in.
2. **Primeira tela:** "Your Reliable Worldwide Airport Transfers — Book Your Ride Anywhere in the World"; abas Transfer / By the Hour; From, To, Pickup date (pré-preenchida), Add return, Passengers 2, "See prices"; linha "100+ countries · Fixed price · Free cancellation"; "Excellent 4.8/5 · 40,705 reviews · Trustpilot"; mock animado "How it works" mostrando 3 classes com preço (Economy £56.62, Standard Sedan £80.89, Standard Van £93.08) e "Fixed price · Free cancellation up to 24h before"; grade de 8 classes de veículo com modelos e capacidade.
3. **Página de aeroporto e de rota:** "Key facts" em tabela (Starting price EUR 18.73; Flight monitoring; Waiting time 60 min free wait at arrivals, 15 min for other pickups); lista "Popular transfer routes" com From EUR, Duração, Distância; "Booking insights" com dados próprios (Average airport pickup time 45 min, Busiest months, Transfers completed 295,350); "What to know before your transfer" (pedágios inclusos, onde o motorista espera, licença exigida). Página de rota Lisboa→Cascais: Distância 38 km, 49 min, Starting price EUR 45.40, classes Economy €45.40 / Standard Sedan €69.84 / Standard Van €76.68 — preço **por veículo**.
4. **Fluxo (book.transfeero.com):** stepper **01 Vehicle → 02 Details → 03 Billing → 04 Payment**. Passo 1: resumo com mapa, data, pax, "~24 min · 26 km", "Total — All prices include VAT, taxes & tolls 44.80 EUR ~ USD 50.16", chips "Free cancellation · Door-to-door · Meet & Greet · Flight tracking · Licensed chauffeurs", 7 classes com rótulos "Best value / Most popular / Top class" e promoções "−10%". Passo 2: Flight number ("Your driver will track your flight"), "Need a child or booster seat?", "Add notes for the driver", Lead passenger (nome, sobrenome, e-mail, celular com DDI), campo Meet & Greet (texto da placa), Notifications: "Email & App notifications Free" / "SMS/Whatsapp notifications + EUR 1.49". **Sem obrigação de conta** (há "Sign in" opcional). Moeda selecionável (EUR/USD etc.).
5. **Confiança:** Trustpilot 4.8/40.7k em todas as páginas e dentro do checkout; "Fixed price"; "Free cancellation up to 24h"; "60-minute free wait"; dados de operação por aeroporto.
6. **Idiomas:** EN, DE, FR, IT, ES.
7. **WhatsApp/chat:** telefones 24/7 por país + "Intl. WhatsApp 24/7 +1 424-339-1886" no rodapé; chat Intercom.

**Opinião**
- Melhor **página de rota** do grupo: fatos objetivos (km, minutos, preço inicial, espera grátis, pedágios inclusos) + prova operacional ("295.350 transfers aqui"). Isso é diretamente replicável: "4.888 viagens" já existe no Supabase da Água Verde.
- Cobrar notificação por WhatsApp (€1,49) é uma ideia ruim para o Brasil — aqui WhatsApp precisa ser grátis e padrão.

## 5. Blacklane — blacklane.com

URLs: `https://www.blacklane.com/en/`, `/en/airport-transfer/`, `/en/countries/uk/london/airport-transfer/`, `/en/booking/`.

**Fatos observados**
1. **Menu:** Our services · For business · For chauffeurs · Help · English (US) · Sign in.
2. **Primeira tela:** "Your chauffeur awaits."; abas One way / By the hour; Pickup location, Drop-off location, Date, Pickup time (default 6:00 PM), "View options". Sem preço na home. Blocos de serviço (Airport transfers "1 hour of complimentary wait time", Hourly, City-to-city, Enterprise).
3. **Página de rota (Londres):** "700,000+ London Rides", "1 Hour Free Wait", "92% five stars"; classes Business Class (Mercedes E, 3 pax, 2 malas), First Class, Business Van/SUV (5 pax) com descrição de bagagem; texto longo; "update or cancel free of charge up to 1 hour before"; "all tolls, gratuities, and congestion charges are included".
4. **Fluxo (/en/booking/):** "Choose your experience": Business Class 3/2 € 102.10, Business Van 5/5 € 133.97, First Class 3/2 € 135.00 (preço **por veículo**); painel "What's included" (meet & greet, 60 min wait, cancel até 1h antes, carregadores, água); "Price breakdown: Base fare € 92.04 + Meet and greet € 4.28 + Estimated tax € 5.78"; abas Luggage/Seating; "Add flight no."; opções "Book for myself (Book with your account information)" / "Book for a guest" (Title, First/Last name, Email, Mobile). O "Book for myself" exige conta; "Book for a guest" permite seguir com dados do convidado.
5. **Confiança:** "92% five stars", "1 hour free wait", "All fees included", "Trained professionals", sustentabilidade. Sem Trustpilot/TripAdvisor na home.
6. **Idiomas:** de, en (+ variantes ae/au/ca/gb/sa), es, fr, ja, zh.
7. **Chat:** Intercom; sem WhatsApp.

**Opinião**
- Posicionamento premium: esconde preço até a busca e empurra conta. Para a Água Verde serve como referência de **"o que está incluído" e breakdown de preço**, não de funil.

## 6. Mozio — mozio.com

URLs: `https://www.mozio.com/en-us/`, `/airport-transfers/rio-de-janeiro-transfers`.

**Fatos observados**
1. **Menu:** For travelers · For travel agents · For partners · Transfer companies · About · Sign in.
2. **Primeira tela:** "Arrive with certainty — Airport and point-to-point transfers from 3,000+ trusted providers across 180+ countries"; abas Transfers / Hourly / Car Rental / Parking / eSIM; One-way / Roundtrip; Pick-up location, Drop-off location, Pick-up date & time, Passengers, "Find rides"; faixa "Flight tracked. Pickup guaranteed · Free cancellation up to 24 hours · Instant booking confirmation · 24/7 Customer support"; "Trusted by… over 30,000 travel agents".
3. **Página de rota (GIG):** formulário próprio (Pick Up, Drop Off, Pickup Date, Pickup Time, Number of Travelers, Roundtrip?); bullets "Free cancellations within 24 hours · 24/7 support · Licensed partners · Instantly guaranteed booking · Flight delayed? We wait."; "How Mozio works" (3 passos); lista de destinos e tipos de veículo (private cars, shared shuttles, luxury, taxis, vans, coaches, trains, accessible); "support team… in 17 languages". Sem preços na página.
4. **Fluxo:** o formulário exigiu data via datepicker ("Select a pick-up date and time") e não consegui avançar em duas tentativas; o rodapé tem "Resend booking", "Manage my ride", "Cancel my ride", "Can't find my driver" (Zendesk em mygroundbooking.com).
5. **Confiança:** Trustpilot (menção), parceiros B2B, "Instant booking confirmation".
6. **Idiomas:** ca, de, en-US, es, fr, id, it, ja, ko, nl, pl, pt-BR e outros (hreflang).
7. **Chat:** nenhum visível; help center Zendesk.

**Opinião**
- Marketplace B2B/B2C; o útil para a Água Verde é a **seção de autoatendimento pós-venda** ("Reenviar reserva", "Gerenciar", "Cancelar", "Não encontro meu motorista") — ótimo gancho para o `/acompanhar/[token]` que já existe.

## 7. Kiwitaxi — kiwitaxi.com

URLs: `https://kiwitaxi.com/`, `/en/portugal/humberto-delgado-airport`, `/en/portugal/humberto-delgado-airport-sete-rios-station-lisbon`, `/en/checkout?booking_token=…`.

**Fatos observados**
1. **Menu:** Customers · Business · Partners · FAQ · Contacts · Chauffeur Hire · USD (moeda).
2. **Primeira tela:** "Airport transfers. Simpler than ever."; "1 400 000+ Completed rides · 100+ Countries"; formulário From (airport, port, address) / To / Date / Passengers / Continue; grade de **14 classes de carro** (Micro, Economy, Comfort, Minivan 4PAX, Business, Premium, Premium Minibus, Minibus 7/10/13/16/19 PAX, SUV, Luxury SUV) com pax, malas e modelos; "Additional Services": Child Seats (Seat 9-18 kg, Booster 15-36 kg, Infant até 10 kg), Extra hour of Waiting, Box for Ski, Trip with Pets, Drinking Water, Extra Stop; avaliações 4.6 (7.500+, TripAdvisor + Reviews.io) com cidade e data.
3. **Página de aeroporto:** copy orientada à dor ("a wall of drivers you don't know… taxi queue"); 6 promessas (Fixed price, Meet and greet, Flight tracking, **90 minutes of free waiting time**, Child seats, Free cancellation até 24h); dados locais ("8,541+ transfers… since 2018", "300+ vetted local drivers", "235+ destinations", "Book at least 16 hours ahead"). **Página de rota** (aeroporto → estação Sete Rios) mostra "244 destinations · Secure payment · Pay in advance · no extra charges on arrival · Guaranteed meet & greet", data, "~15 min", pax, e cards por classe com preço **por veículo** em USD (Minibus 7PAX $63 "Best Choice", Comfort $52, Minivan $67, Premium Minibus $76, Business $88) e microcopy de benefício ("Fits 4 bags, not just 3").
4. **Fluxo (checkout):** página única "Checkout" com stepper Request → Checkout → Payment: Step 1 Book (Flight number, Date of arrival, Scheduled arrival time, Return trip); Step 2 Passengers (Name and Surname, E-mail "we will send a booking confirmation, voucher, and reminder", Phone "must be available on the day", Passengers incl. crianças, Child seats); Step 3 Additionally (Drinking water $3, pets, Comments, Promo code); "Order summary" lateral; "Continue" → Payment. **Sem conta.** Na 1ª tentativa o checkout devolveu "Error 500 Internal Server Error".
5. **Confiança:** notas com data e cidade, "Secure payment", "Pay in advance, no extra charges on arrival", motorista "licensed, insured, background-checked, and you receive their credentials before you arrive".
6. **Idiomas:** de, en, es, fr, hu, it, nl, pl, pt, ru, uk; moedas USD/EUR/GBP/BRL.
7. **WhatsApp/chat:** chat online (Intercom) no header; avaliações citam contato com o motorista por WhatsApp.

**Opinião**
- Melhor **catálogo de extras** (cadeirinha por faixa de peso, parada extra, espera extra, pet, água). O "Best Choice" por tamanho de grupo e as microcopys "Fits 4 bags, not just 3" são boas práticas de escolha de veículo.

## 8. 4trip — 4trip.com.br (redireciona para vepway.com.br)

URLs: `https://www.4trip.com.br/` → `https://www.vepway.com.br/`, `/about/product?transporte-recife-porto-de-galinhas&x=23&y=1`.

**Fatos observados**
1. **Menu:** header com busca "Buscar Passeios..", destinos (Porto de Galinhas, Praia dos Carneiros, Maragogi, Recife Antigo, Ilha de Santo Aleixo), ícone de carrinho; "Mais buscados".
2. **Primeira tela:** carrossel de destinos e "Passeios que todo mundo escolhe — os 8 passeios mais procurados", cards com descrição longa, "a partir de R$50,00", "Detalhes >" e "Experiências vividas: 15702" (contador por produto). Transfer aparece como produto no meio dos passeios ("Transporte Ida e Volta Porto de Galinhas/Carneiros a partir de R$80,00").
3. **Página de produto (Transporte Recife/Porto de Galinhas):** lista de **~30 tarifas** com botão "Selecionar" cada: adicional parada até 1h R$40/viajante; compartilhado alta R$94 criança / baixa R$174 adulto; "Privativo de 2 a 4 Pessoas (alta…) R$203,00 até 4 Viajantes"; "Privativo 2 a 4 (baixa…) R$197,00"; "Privativo de 5 a 6 Pessoas R$333–337"; SUV R$683; SUV blindado R$1.023; vans 7-10 R$577–593, 11-15 R$663–677, 16-20 R$1.073–1.217, micro 21-26; e variantes "OFERTA ESPECIAL… Pagar R$ 120 um dia antes ao PIX que será informado" (sinal online + saldo por Pix). Preço **por veículo** nas privativas e **por pessoa** nas compartilhadas; sazonalidade (alta = janeiro + carnaval + eventos) embutida no nome da tarifa.
4. **Fluxo:** "Selecionar" vira contador +/−; o carrinho (ícone "1") não abriu no headless em 3 tentativas — não observei a tela de pagamento. Descrições indicam "Pagamento: além da reserva, pague via Pix ou dinheiro".
5. **Confiança:** contador "Experiências vividas", TripAdvisor no rodapé; sem selo de cancelamento/monitoramento de voo.
6. **Idiomas:** só PT (sem hreflang).
7. **WhatsApp:** link `wa.me/5581984204060?text=Quero uma informação`.

**Opinião**
- É o anti-exemplo de catálogo: 30 linhas de tarifa com regra de temporada no título confundem e empurram o cliente para o WhatsApp. A Água Verde deve resolver temporada e capacidade **no motor de preço**, não no nome do produto.
- O contador "Experiências vividas" é uma prova social barata e eficaz.

## 9. Enter Travel — enter.travel (+ app.enter.travel)

URLs: `https://enter.travel/`, `/portodegalinhas/en/`, `/portodegalinhas/en/porto-de-galinhas-transfer/`, `/portodegalinhas/en/transfer_service/transfer-recife-airport-porto-de-galinhas/`, `https://app.enter.travel/transfer-privado-aeropuerto-recife-porto-de-galinhas?lang=en`.

**Fatos observados**
1. **Menu (site):** Services · Destinations · 💬 WHATSAPP; bandeiras PT/ES/EN. **Menu (catálogo):** ENGLISH · Activities · Transfer · Accommodation · Food & Drinks · Places · Tides · Information.
2. **Primeira tela:** posicionamento B2B ("Your local operator in Northeast Brazil… net rates for your agency", "16+ years", "Cadastur", escritórios Recife e Buenos Aires); CTAs "REQUEST NET RATES" (WhatsApp). Sem widget de busca.
3. **Página de transfer:** lista de 16 produtos com preço fechado **por veículo** ("Transfer Recife airport ↔ Porto de Galinhas R$235", "Recife Airport ↔ Praia dos Carneiros R$355", "↔ Maragogi R$345", "Porto de Galinhas ↔ Maragogi R$450", "↔ Maceió R$900", etc.); bloco "All-inclusive rates… taxes, tolls, fees, and gratuities", "Trusted drivers", "Extra wait time: flight tracking", "All sizes". Página do produto: "Duration 1 hour (52km)", "Private vehicle", "What is included: Tolls included, Licensed private vehicle with passenger insurance", "What is not included: Additional stops"; texto explicando que até 24h antes o cliente recebe o WhatsApp do motorista, monitoramento de voo, cadeirinha grátis, **espera de 60 min após o pouso**, duas formas de encontro ("Meet & greet with name sign (optional)" / "Standard meeting point (included): exit B5, upper floor"), motorista chega 15 min antes na volta; "Vehicle options: até 4 (Sedan), até 6 (Spin), van 15, van 20"; "One-way, return, or round-trip"; "Card · Pix · up to 12 installments".
4. **Fluxo (app.enter.travel, plataforma "mymento"):** "I want to book | starting from R$ 235.00" → **calendário com preço em cada dia** (R$ 235 todos os dias) → seletor de quantidade por veículo ("0 vehicles | Up to 4 people", "Up to 6 people") → "Continue" (valida "The quantity cannot be zero") → carrinho `/cart`. Rodapé do app: "PAYMENTS & SECURITY: Pix, credit card". Não cheguei à tela de pagamento (botão de quantidade não respondeu ao clique headless).
5. **Confiança:** CNPJ/Cadastur em todo rodapé, depoimentos nominais (Argentina/Brasil), política de cancelamento em link próprio, "100% legitimate and registered companies".
6. **Idiomas:** EN, ES, PT (hreflang) — site e catálogo.
7. **WhatsApp:** onipresente (`wa.me/5581984892676` com mensagem pré-preenchida diferente por CTA).

**Opinião**
- É o concorrente local mais próximo do que a Água Verde quer ser: **preço fechado por rota, trilíngue, Pix + cartão em até 12x, WhatsApp em todo CTA**. O "calendário com preço por dia" resolve sazonalidade de forma elegante.
- Fraqueza: a reserva mora num subdomínio de terceiro (`app.enter.travel`, mymento) com visual diferente do site — quebra de contexto parecida com a do Paytour.

## 10. vivoportodegalinhas.com.br — inacessível / substitutos

**Fato observado:** `https://vivoportodegalinhas.com.br/` redireciona para `/lander`, página de domínio estacionado da GoDaddy ("está hospedado gratuitamente… Adquira este domínio"). Não há site.

**Substituto 10a — Luck Viagens (luckviagens.com.br, Recife)**: menu HOME · GRUPO LUCK · PACOTES DE VIAGEM · EVENTOS · POLÍTICAS · CORPORATIVO · RECEPTIVO · FALE CONOSCO; primeira tela é um cotador **aéreo** (ida/volta, origem, destino, datas, adultos/crianças/bebês); banner "PROMOÇÃO EXCLUSIVA TEMPORADA 25/26 — Consulte-nos"; sem preço de transfer, sem widget de rota; WhatsApp (81) 99323-1583; chat "Olá, em que posso ajudar?"; só PT. Opinião: mesmo sendo o maior receptivo local, não vende transfer online — oportunidade clara.

**Substituto 10b — Book Transfer (booktransfer.com.br, Rio/14 cidades, inclui Recife)**: menu Sobre nós · Loja · Blog · Faça login · Carrinho. Produto "Transfer Aeroporto Galeão para Copacabana — R$ 210,00 – R$ 550,00": selects "Seleção de origem" (GIG/SDU) e "Tipo de Transporte" (Carro até 04 / Van até 12 / Van até 16 → define o preço, **por veículo**), campos Data e hora ("Aceitamos reservas até 06 horas antes"), Ponto de embarque (Hotel/Aeroporto), Bagagem, adultos, crianças 6-12, 2-5, bebês; "Adicionar ao carrinho". Regras: "Desembarque Nacional: motorista chega 30 min após o voo; Internacional: 40 min"; "Avaliações (0)". **Checkout WooCommerce**: Nome, Sobrenome, Pessoa Física/Jurídica, CPF, país, CEP, endereço completo, telefone, e-mail; pagamento **Mercado Pago cartão** e **Mercado Pago Pix**; login opcional; só PT; WhatsApp via plugin Joinchat; menção a "centenas de avaliações no Tripadvisor".

## 11. CVC — cvc.com.br (seção transfer) — inacessível

**Fato observado:** `https://www.cvc.com.br/transfer` respondeu **403** com página Cloudflare "Um momento…" no Playwright; `curl` com UA de navegador também 403; WebFetch retornou EGRESS_BLOCKED. Duas tentativas, conforme instrução. Via busca (texto da própria CVC em `cvc.com.br/dicas-de-viagem/?p=44111`): a CVC vende "traslados avulsos" pelo site/app, usa os termos "traslado" e "transfer" e descreve o trajeto aeroporto-hotel como "in/out", com receptivo identificado na chegada. Não foi possível observar menu, widget ou checkout.

## 12. Transfer Águia RJ — transferaguiarj.com.br (Rio, posição orgânica para "transfer galeão copacabana")

URLs: `https://transferaguiarj.com.br/`, `/transfer-galeao-copacabana/`.

**Fatos observados**
1. **Menu:** página única longa com âncoras; "Nossos Serviços": Transfer Aeroporto Galeão, Santos Dumont, Zona Sul etc.; ~400 links internos de rota ("Transfer Galeão Copacabana/Ipanema/Leblon/Barra/Búzios/Arraial/Paraty…").
2. **Primeira tela:** "Transfer no Rio de Janeiro — Conforto, Segurança e Pontualidade Garantidos"; chips "Pontualidade Absoluta · Frota Premium · Preço Fixo"; CTA "Solicitar Orçamento" (WhatsApp). **Sem preço, sem widget.**
3. **Página de rota (Galeão → Copacabana):** "Preço fechado, receptivo com placa nominal e monitoramento de voo"; "Tempo médio: 45–70 min"; "Inclui: pedágios, taxa de estacionamento e 15 min de espera"; "Atendimento 24h · Motoristas bilíngues (mediante disponibilidade)"; frota por classe (Sedans até 3, SUVs até 6, Minivan de luxo até 7, Vans 15-20, Micro-ônibus 30) cada uma com "Solicitar Orçamento"; "💳 Aceitamos PIX, cartão (com taxas devido a impostos) e dinheiro"; "mais de 1000 clientes satisfeitos".
4. **Fluxo:** não há reserva online; todo CTA abre WhatsApp (21) 97431-7070.
5. **Confiança:** "Seguro Total", "Rastreamento GPS", "Veja o que os famosos dizem", TripAdvisor citado.
6. **Idiomas:** só PT. 7. **WhatsApp:** 31 ocorrências no HTML; é o único canal.

**Opinião:** SEO programático de rotas (centenas de páginas "Transfer X → Y") funciona para ranquear, mas sem preço e sem checkout o site é um folheto. Cobrar taxa de cartão explicitamente é um ponto negativo frente aos europeus ("no card fees").

## 13. Ever Transfer — evertransfer.com.br (SP, "transfer aeroporto guarulhos")

URL: `https://www.evertransfer.com.br/`.

**Fatos observados**
1. **Menu:** INÍCIO · A EVER TRANSFER · SERVIÇOS · DIFERENCIAL · FROTA · FALE CONOSCO.
2. **Primeira tela:** texto institucional denso ("Desde 2010… Transfer Aeroporto de Guarulhos, Congonhas e Viracopos… Aparecida, Campos do Jordão, Ilhabela, Porto de Santos"); cards "TRASLADO AEROPORTO / TRANSPORTE EXECUTIVO / ALUGUEL DE VAN / MICRO E ÔNIBUS / TRANSFER APARECIDA…" com "SAIBA MAIS". Sem preço, sem widget.
3. **Diferenciais:** "CADEIRINHA PARA CRIANÇA (até 7 anos, consulte)", "RECEPTIVO NO DESEMBARQUE (serviço adicional)", "MOTORISTA BILÍNGUE (inglês e espanhol, consulte)", "ATENDIMENTO 24H", "FORMA DE PAGAMENTO / PAGAMENTO FACILITADO", "CANCELAMENTO DE RESERVA: reembolsará* conforme cláusula contratual", "WHATSAPP 24 HORAS".
4. **Fluxo:** telefone, WhatsApp ou formulário de reserva; sem checkout.
5. **Idiomas:** só pt-br. **WhatsApp:** sim, 24h.

**13b. CHM Transportes (chmtransportes.com.br, SP):** menu Home · Tabela de Preços · Táxi · Transfer e Traslado · Van · Serviços · Cidades Atendidas · Empresa; cards de rota com **preço "Via Pix"** (Guarulhos→São Paulo R$ 215, Guarulhos→Congonhas R$ 215, Guarulhos→Viracopos R$ 375, "Preços por veículo sedan"); "Não agendamos serviços no mesmo dia"; "Monitoramento de voos"; WhatsApp e Telegram; só PT; sem checkout.

**Opinião:** os operadores de SP/Rio bem posicionados vendem por WhatsApp; os poucos que mostram preço (CHM, Águia, Book Transfer) ancoram em Pix e cobram taxa no cartão. A Água Verde pode se diferenciar com checkout real + "sem taxa de cartão".

---

## Padrões comuns (o que ~80% dos sites fazem igual)

Fatos consolidados (contagem sobre os 13 sites efetivamente observados):

1. **Widget Origem / Destino / Data-hora / Passageiros acima da dobra** — 7/7 europeus; no Brasil só Book Transfer (dentro do produto) e Enter (calendário). Luck, Águia, Ever, CHM e 4trip não têm busca por rota.
2. **Preço por veículo/classe, não por pessoa** — todos os europeus (shuttle compartilhado é a exceção "pp"); Enter, Book Transfer, CHM e 4trip (privativo) também. Capacidade expressa como "até N passageiros + N malas".
3. **Quatro promessas repetidas quase literalmente:** preço fixo/sem surpresas · cancelamento grátis (48h Suntransfers; 24h Transfeero, Kiwitaxi, Mozio; 1h Blacklane) · monitoramento de voo · espera gratuita (60 min Transfeero/Blacklane/Enter; 90 min Kiwitaxi; 15 min Águia).
4. **Pedágios, taxas e estacionamento inclusos** ditos explicitamente (Transfeero, Blacklane, Enter, Águia, Suntransfers "No hidden fees").
5. **Prova social com número:** Trustpilot/TripAdvisor com nota + volume (4.8/40.705; 4.3/45.000+; 82.528) e/ou contadores operacionais (1,4 M corridas; 295.350 transfers no aeroporto; 15.702 "experiências vividas").
6. **Checkout sem criar conta** (Suntransfers, Transfeero, Kiwitaxi, Book Transfer); conta é opcional ou só para "reservar para mim" (Blacklane).
7. **Dados pedidos no checkout:** nome, e-mail (para voucher), celular com DDI, número do voo, hotel/endereço exato, cadeirinha, observações; stepper visível de 3 a 5 passos.
8. **Extras monetizados ou gratuitos:** cadeirinha, parada extra, espera extra, pet, água, proteção de cancelamento, SMS/WhatsApp.
9. **Página de rota como landing SEO** com km, minutos, preço inicial, comparação com táxi/transporte público e FAQ (Welcome, Suntransfers, Transfeero, Kiwitaxi, hoppa; Águia faz versão sem preço).
10. **Multi-idioma e multi-moeda** nos europeus (5 a 14 idiomas; EUR/USD/GBP e BRL em Suntransfers e Kiwitaxi); no Brasil só Enter é trilíngue.
11. **Brasil: Pix é a forma de pagamento âncora** (Book Transfer, Enter, CHM, 4trip, Águia); cartão às vezes com taxa; parcelamento (Enter "até 12x").
12. **WhatsApp:** padrão absoluto nos brasileiros (6/6) e ausente ou secundário nos europeus (só Transfeero expõe número; Kiwitaxi/Blacklane/Transfeero usam Intercom; hoppa Zoho).

---

## Recomendações para a Água Verde (10 itens)

Opinião, derivada dos fatos acima e do estado atual do site (Next.js 15, Supabase com `viagens`/`token_cliente`, Paytour como loja):

1. **Widget de rota na primeira dobra da home**, com Origem (REC / hotel) → Destino (lista fechada: Porto de Galinhas, Muro Alto, Maracaípe, Carneiros, Maragogi, Recife/Boa Viagem, Olinda, João Pessoa) → data/hora → pax/malas → "Ver preços". Copiar Suntransfers/Transfeero. Hoje a home abre em Hero + formulário de orçamento, não em cotação instantânea.
2. **Preço por veículo, com classes fixas e capacidade visível** ("Sedan até 3 pax/3 malas · R$ 350", "Spin/SUV até 5 · R$ …", "Van até 14 · R$ …"), rótulos "Melhor custo" / "Mais escolhido" (Transfeero/Kiwitaxi) e microcopy de bagagem ("cabe 4 malas, não 3"). Temporada (janeiro, carnaval, eventos) deve ser regra no motor de preço, nunca no nome do produto como no 4trip.
3. **Faixa de 4 promessas em todas as páginas de produto e no checkout:** "Preço fixo com pedágios e estacionamento inclusos · Cancelamento grátis até 24 h · Monitoramos seu voo · 60 min de espera grátis no desembarque". É o denominador comum dos líderes; a Água Verde já opera isso (fluxo `a_caminho`/`aguardando_passageiro`), só não diz.
4. **Páginas de rota no modelo Transfeero + Welcome:** `/transfer-aeroporto-recife-porto-de-galinhas` com tabela de fatos (km, minutos, a partir de R$, espera, ponto de encontro "saída B5 piso superior" como a Enter descreve), comparativo com táxi/app/ônibus 195, FAQ (já existe FAQPage JSON-LD) e **prova operacional real** ("4.888 transfers realizados", "X viagens REC→PDG nos últimos 12 meses" calculados do Supabase). Gerar também as variantes de hotéis/destinos (SEO programático como Águia, mas com preço).
5. **Checkout próprio em 3 passos, sem conta:** (1) veículo + extras, (2) dados do passageiro líder + voo + hotel + cadeirinha + observações, (3) pagamento. Campos obrigatórios mínimos: nome, e-mail, celular com DDI (clientes ES/EN), nº do voo, endereço/hotel. Gerar `token_cliente` e devolver o link `/acompanhar/[token]` no voucher — nenhum concorrente observado liga a reserva a rastreamento em tempo real; é o diferencial exclusivo.
6. **Pagamento: Pix + cartão sem taxa + parcelamento**, exibidos já na página do produto ("Pix · cartão em até Nx") como faz a Enter; evitar a mensagem "cartão com taxas" (Águia) e o "pague o saldo por Pix um dia antes" (4trip). Para clientes estrangeiros, cartão internacional com preço mostrado em BRL e conversão indicativa para USD/EUR (Transfeero mostra "44.80 EUR ~ USD 50.16").
7. **Extras como catálogo simples:** cadeirinha por faixa (bebê conforto / cadeira / assento de elevação) **grátis** (Enter) ou com preço claro; parada extra (ex.: supermercado/parada até 1h) com valor; ida e volta com desconto; "meet & greet com placa" como opção. Modelo: Kiwitaxi e passo "EXTRAS" do Suntransfers.
8. **Prova social numérica e nominal:** nota + volume (TripAdvisor já existe no CLAUDE.md; adicionar Google Reviews), últimas avaliações com cidade e data (Kiwitaxi), e perfis de motoristas com foto/carro/idiomas (Welcome) — a tabela `motoristas`/`perfis` já tem os dados.
9. **Trilíngue PT/ES/EN de verdade (next-intl já configurado, middleware pendente)** com seletor visível no header e preço na mesma moeda. Entre os concorrentes locais só a Enter atende o argentino em ES; é o público que o próprio site da Enter diz ser o principal.
10. **WhatsApp como canal padrão, não como substituto do checkout:** botão flutuante já existe; adicionar (a) WhatsApp com mensagem pré-preenchida por rota/produto (Enter), (b) notificação de confirmação e contato do motorista via WhatsApp **grátis** (Transfeero cobra €1,49; aqui é higiene), (c) bloco de autoatendimento pós-venda "Reenviar voucher / Alterar / Cancelar / Não encontro meu motorista" (Mozio) apontando para `/acompanhar/[token]` e para o WhatsApp.

**Riscos/notas:** (i) Suntransfers e Kiwitaxi já vendem REC/GIG/GRU em BRL com preços agressivos — a página de rota da Água Verde precisa competir em clareza, não só em preço; (ii) a migração do Paytour para checkout próprio deve manter os redirects 301 e o gatilho da Fase 3 definido no CLAUDE.md (>20 orçamentos/mês × 2 meses) — a recomendação 5 só faz sentido se esse gatilho for atingido ou se o Paytour for mantido como fallback de pagamento.
