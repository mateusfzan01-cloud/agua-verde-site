# Plano v1 — Loja própria aguaverde.tur.br (substituição da Paytour)

> Data: 2026-10-08 · Autor: Claude Code com Mateus Zanlorenzi · Status: **rascunho para aprovação do sócio**
>
> Este documento é o resultado de uma entrevista estruturada (2 rodadas, 30 perguntas) + levantamento de fatos no banco Supabase, na cópia arquivada do site Paytour (Wayback Machine, jul/2025), no site Next.js publicado e em três pesquisas de mercado (sites de referência, comunidade 2026, custos). Nada aqui foi presumido: cada decisão tem origem marcada como **[decisão do dono]**, **[fato verificado]** ou **[recomendação]**.

---

## 0. Resumo executivo (1 minuto)

A Água Verde vende hoje pelo site da plataforma **Paytour** (R$ 250/mês), que recebe no máximo ~10 reservas/mês, não aparece no Google e não conversa com o sistema operacional (Supabase + PWA + app dos motoristas + WhatsApp com IA). O plano é **trocar a Paytour por uma loja própria** dentro do site Next.js já existente (`agua-verde-site`, publicado na Vercel, ainda fora do domínio principal), com:

- cópia fiel do catálogo (46 produtos: 28 transfers e 18 passeios), preços e textos da Paytour como ponto de partida;
- preço na hora e **pagamento online** (Pix + cartão nacional e internacional) em um gateway só;
- cada venda cai **direto como viagem** no Supabase, com fornecedor "Agua Verde", e segue o fluxo que já existe (motorista, lembrete WhatsApp, acompanhamento por link, avaliação);
- site em **PT / ES / EN** (o espanhol é o idioma mais frequente nos lembretes enviados: 576 vs 176 em PT nos últimos 90 dias);
- custo fixo **≤ R$ 250/mês** (teto R$ 300 com chatbot de IA e reservas automatizadas, que já existem em parte);
- lançamento vendendo **até o início de dezembro de 2026**, dentro da alta temporada;
- Google Ads como frente separada, só depois do site no ar, sem ferramenta paga.

---

## 1. Situação atual (fatos verificados)

### 1.1 Operação (banco Supabase, consulta em 2026-10-08)

| Indicador | Valor |
|:--|:--|
| Viagens no sistema | 8.211 |
| Viagens nos últimos 90 dias | 2.050 (~680/mês) |
| Canal direto "Agua Verde" (90 d) | 122 viagens, ticket médio R$ 383 |
| FoxTransfer / iNeedTours / Mozio (90 d) | 816 / 794 / 210 viagens |
| Idioma dos lembretes WhatsApp (90 d) | ES 576 · PT 176 · EN 32 |
| WhatsApp Cloud API | ativa; IA de auto-resposta ativa; 752 lembretes em 90 d; 334 mensagens recebidas em 30 d |
| Formulário de orçamento do site Next.js | 1 lead em toda a vida, 0 nos últimos 90 d |
| Fornecedor "Agua Verde" | existe (`856b4497-674d-457c-b8c2-a7d3a60479b1`) |
| Status possíveis de viagem | `pendente`, `vinculada`, `a_caminho`, `aguardando_passageiro`, `em_andamento`, `concluida`, `cancelada`, `no_show` |

### 1.2 Loja Paytour em `aguaverde.tur.br` (cópia arquivada de 16/07/2025)

- Plataforma Paytour ("Tecnologia Pay tour"), catálogo de 46 produtos, PT/ES/EN, "Minhas reservas" por dados da compra (sem conta).
- Pagamento: Visa, Master, Elo, Amex, Diners, Hiper, Pix, PagSeguro, PayPal, depósito.
- Inclusos nos transfers de aeroporto: veículo privativo, motorista, pedágio, kit de boas-vindas, monitoramento do voo, placa com nome, estacionamento no aeroporto. Espera citada em um produto: 15 min.
- **Página "Termos de Uso" vazia**: hoje a loja vende sem política de cancelamento publicada.
- Mais vendidos (selo da loja): 1º Japaratinga, 2º João Pessoa, 3º Porto de Galinhas (ida ou volta).
- Contato: reservas@aguaverde.tur.br · (81) 99947-3200 · (81) 3033-0245 · CNPJ 17.427.292/0001-46 · Rua Jonathas de Vasconcelos, 788, Boa Viagem.
- O site atual bloqueia robôs (Cloudflare), por isso a cópia usada é a do Wayback Machine. Se algo mudou depois de julho/2025, revisar no §3.
- Custo: R$ 250/mês **[informado pelo dono]**. Volume: no máximo ~10 reservas/mês **[informado pelo dono]**.

### 1.3 Site Next.js (`agua-verde-site`, https://agua-verde-site.vercel.app)

- Next.js 15, Tailwind 4, Supabase, next-intl configurado (PT/EN/ES) sem middleware ativo.
- 12 páginas: home, 3 landing pages de rota (Porto de Galinhas, Carneiros, Maragogi), quem somos, contato, privacidade, termos, acompanhar/[token], robots, sitemap.
- Formulário de orçamento conectado ao Supabase (`orcamentos_site`) com Edge Function `notificar-orcamento` (e-mail via Resend).
- Preços exibidos ("a partir de R$ 350" para REC→PdG) **divergem** da Paytour (R$ 180). Decisão: preços da Paytour como base (§3).

### 1.4 Marca

- `uluwatour.com` fora do ar (sem DNS para www; apex sem resposta) **[fato verificado]**.
- O ativo vivo da marca antiga é o **perfil Uluwatour no TripAdvisor** (4,7★, 112 avaliações, Travellers' Choice), que gera contatos por WhatsApp **[informado pelo dono]**.
- A Expedia já exibe o operador como "Agua Verde Viagens & Receptivos ( Antiga Uluwatour)" **[fato verificado na página]**.

---

## 2. Decisões tomadas (entrevista de 2026-10-08)

| # | Decisão | Origem |
|:--|:--|:--|
| 1 | Plano escrito e aprovado antes de código | dono |
| 2 | A loja nova substitui a Paytour por completo e é construída no repositório `agua-verde-site` | dono |
| 3 | Cópia fiel do catálogo Paytour: todos os 46 produtos, transfers e passeios | dono |
| 4 | Venda cai direto em `viagens` (fornecedor Agua Verde), sem sistema intermediário | dono |
| 5 | Preço na hora + pagamento online nas rotas de tabela; orçamento WhatsApp fora da tabela | dono |
| 6 | Preços da Paytour como base, com adicional por passageiro extra; valores a revisar | dono |
| 7 | PT / ES / EN desde o lançamento, ES em pé de igualdade com PT | dono |
| 8 | Um site, um domínio; marca Água Verde; TripAdvisor mantém "Uluwatour" com "(Água Verde Viagens e Receptivos)" entre parênteses, via pedido ao Management Center | dono |
| 9 | Teto de custo fixo: R$ 250/mês; até R$ 300 se incluir chatbot de IA e reservas automatizadas | dono |
| 10 | Uma pessoa atende em horário comercial + IA fora dele; o site fecha a venda sozinho | dono |
| 11 | Lançar vendendo até o início de dezembro de 2026 | dono |
| 12 | Google Ads: conta já existe; campanha nova em frente separada (subagente), só após o site no ar, sem ferramenta paga | dono |
| 13 | Cancelamento grátis até 24 h antes; espera de 60 min no aeroporto e 15 min em endereço; CADASTUR existe (número a enviar) | dono |
| 14 | Referências: Welcome Pickups, Suntransfers, Hoppa, Transfeero, Blacklane, Mozio; 4Trip, Enter.Travel, Vivo PdG, CVC, operadores SP/RJ | dono |
| 15 | Sem login de cliente; voucher e acompanhamento pelo `/acompanhar/:token` que já existe + "minha reserva" por número e e-mail | dono |
| 16 | Eu construo, dono e sócio revisam | dono |
| 17 | Figma só para aprovar 4 telas (home, rota, checkout, confirmação); o resto vai direto a código | dono |
| 18 | Um gateway só (Pix + cartão nacional + internacional, sem mensalidade); PayPal fora da v1 | dono |
| 19 | Textos e fotos da Paytour reaproveitados (corrigidos e traduzidos); fotos originais virão de um Drive | dono |
| 20 | Passeios: paga na hora, confirmação em até 24 h, reembolso automático se não houver vaga | dono |
| 21 | Transição: Paytour para de vender no dia da troca; conta mantida 60 dias para vouchers antigos; reservas futuras migradas à mão | dono |
| 22 | Avisos: empresa recebe push no app nativo + e-mail; passageiro recebe página de confirmação + e-mail + WhatsApp (voucher e link de acompanhamento); PDF só sob demanda | dono |
| 23 | Checkout pede: nome, WhatsApp, e-mail, voo, hotel/endereço, passageiros, malas, observações; CPF opcional | dono |
| 24 | Cobrança sempre em BRL; versões ES/EN mostram valor aproximado em USD/EUR com aviso | dono |

Pendências de fato que **não travam** o plano: número CADASTUR, regra exata do adicional por passageiro, verba mensal de Ads, plano atual da Vercel (Hobby ou Pro). Drive de fotos e vídeos: recebido em 2026-10-08 (ver §6).

---

## 3. Catálogo a migrar (46 produtos, preços de jul/2025)

Fonte: `docs/loja/catalogo-paytour-2025-07.csv` (nome, categoria, preço, descrição curta, slug original). Imagens: `docs/loja/imagens-paytour-2025-07.txt` (69 URLs no CDN da Paytour, ainda acessíveis em 2026-10-08; baixar antes da troca).

| Categoria | Produto | Preço | Slug Paytour (para redirect 301) |
|:--|:--|:--|:--|
| Serviços | Passeio privativo de Recife para Porto de Galinhas com jangada para as piscinas naturais incluso | R$ 550,00 | `passeio-privativo-de-recife-para-porto-de-galinhas` |
| Serviços | Passeio privativo de Recife para Praia dos Carneiros | R$ 620,00 | `passeio-privativo-de-recife-para-praia-dos-carneiros` |
| Transfer | Transfer Privativo Aeroporto de Recife para Porto de Galinhas / Muro Alto ( ida e volta ) | R$ 340,00 | `transfer-privativo-aeroporto-de-recife-para-porto-de-galinhas-muro-alto-ida-e-volta-` |
| Serviços | City Tour Olinda com Catamarã em Recife | R$ 540,00 | `city-tour-olinda-com-catamara-em-recife` |
| Transfer | Transfer Privativo Aeroporto de Recife para Porto de Galinhas / Muro Alto ( ida ou volta ) | R$ 180,00 | `transfer-privativo-aeroporto-de-recife-para-porto-de-galinhas-muro-alto-ida-ou-volta-` |
| Serviços | Oficina Francisco Brennand e Instituto Ricardo Brennand com transfers ida e volta | R$ 460,00 | `oficina-francisco-brennand-e-instituto-ricardo-brennand-com-transfers-ida-e-volta` |
| Transfer | Transfer Privativo Aeroporto de Recife para Praia dos Carneiros ( ida ou volta ) | R$ 320,00 | `transfer-privativo-aeroporto-de-recife-para-praia-dos-carneiros-ida-ou-volta-` |
| Serviços | City Tour Olinda e Instituto Ricardo Brennand | R$ 540,00 | `city-tour-olinda-e-instituto-ricardo-brennand` |
| Serviços | Passeio de Catamarã em Fernando de Noronha | R$ 550,00 | `passeio-de-catamara-em-fernando-de-noronha` |
| Serviços | Aluguel de veículo para noivas ( Casamentos em Recife e Olinda ) | R$ 600,00 | `aluguel-de-veiculo-para-noivas-casamentos-em-recife-e-olinda-` |
| Serviços | Passeio de Catamarã em Recife com transfers privativo | R$ 300,00 | `passeio-de-catamara-em-recife-com-transfers-privativo` |
| Transfer | Transfer Privativo Aeroporto de Recife para Maragogi ( ida e volta ) | R$ 700,00 | `transfer-privativo-aeroporto-de-recife-para-maragogi-ida-e-volta-` |
| Transfer | Transfer Privativo de Boa Viagem ou Piedade para Porto de Galinhas ( ida ou volta ) | R$ 180,00 | `transfer-privativo-de-boa-viagem-ou-piedade-para-porto-de-galinhas-ida-ou-volta-` |
| Serviços | Transfer Privativo Aeroporto de Recife para Serrambi ( ida ou volta ) | R$ 250,00 | `transfer-privativo-aeroporto-de-recife-para-serrambi-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Recife ( ida ou volta ) | R$ 80,00 | `transfer-privativo-aeroporto-de-recife-para-recife-ida-ou-volta-` |
| Serviços | Mergulho com cilindro em Recife ( Batismo ) | R$ 1.020,00 | `mergulho-com-cilindro-em-recife-batismo-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Olinda ( ida ou volta ) | R$ 120,00 | `transfer-privativo-aeroporto-de-recife-para-olinda-ida-ou-volta-` |
| Transfer | Transfer privativo de Recife para Suape ( Refinaria, Estalereiro ou Porto ) | R$ 170,00 | `transfer-privativo-de-recife-para-suape-refinaria-estalereiro-ou-porto-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Maragogi ( ida ou volta ) | R$ 360,00 | `transfer-privativo-aeroporto-de-recife-para-maragogi-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife ou Boa Viagem para Itamaracá ( ida ou volta ) | R$ 200,00 | `transfer-privativo-aeroporto-de-recife-ou-boa-viagem-para-itamaraca-ida-ou-volta-` |
| Serviços | City Tour Recife e Olinda | R$ 450,00 | `city-tour-recife-e-olinda` |
| Transfer | Transfer Privativo de Olinda para Maragogi ( ida ou volta ) | R$ 500,00 | `transfer-privativo-de-olinda-para-maragogi-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Praia dos Carneiros ( ida e volta ) | R$ 600,00 | `transfer-privativo-aeroporto-de-recife-para-praia-dos-carneiros-ida-e-volta-` |
| Serviços | Passeio privativo de Recife para 4 praias de Cabo de Santo Agostinho | R$ 450,00 | `passeio-privativo-de-recife-para-4-praias-de-cabo-de-santo-agostinho` |
| Serviços | Passeio privativo para as piscinas naturais da Praia do Paiva ( snorkel e/ou surfe ) | R$ 400,00 | `passeio-privativo-para-as-piscinas-naturais-da-praia-do-paiva-snorkel-eou-surfe-` |
| Serviços | Trilha dos Escravos em Maracaípe | R$ 200,00 | `trilha-dos-escravos-em-maracaipe` |
| Transfer | Transfer Privativo de Porto de Galinhas para Maragogi ( ida ou volta ) | R$ 400,00 | `transfer-privativo-de-porto-de-galinhas-para-maragogi-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para São Miguel dos Milagres ( ida ou volta ) | R$ 550,00 | `transfer-privativo-aeroporto-de-recife-para-sao-miguel-dos-milagres-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Natal ( ida ou volta ) | R$ 800,00 | `transfer-privativo-aeroporto-de-recife-para-natal-ida-ou-volta-` |
| Serviços | Mergulho com cilindro em Recife ( Credenciados ) | R$ 780,00 | `mergulho-com-cilindro-em-recife-credenciados-` |
| Transfer | Transfer Privativo Aeroporto de Recife para João Pessoa e Cabedelo ( ida ou volta ) | R$ 380,00 | `transfer-privativo-aeroporto-de-recife-para-joao-pessoa-e-cabedelo-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Fernando de Noronha para Pousadas na Ilha (ida ou volta) | R$ 200,00 | `transfer-privativo-aeroporto-de-fernando-de-noronha-para-pousadas-na-ilha-ida-ou-volta-` |
| Serviços | Trilha dos Escravos em Maracaípe com saída de Recife | R$ 700,00 | `trilha-dos-escravos-em-maracaipe-com-saida-de-recife` |
| Serviços | Passeio privativo para Maragogi ( caminho de Moisés ) com saída de Recife | R$ 550,00 | `passeio-privativo-para-maragogi-caminho-de-moises-com-saida-de-recife` |
| Transfer | Transfer privativo de Recife para Caruaru ida e volta ( São João 2024 ) | R$ 550,00 | `transfer-privativo-de-recife-para-caruaru-ida-e-volta-sao-joao-2023-` |
| Serviços | City Tour Recife com Catamarã | R$ 520,00 | `city-tour-recife-com-catamara` |
| Transfer | Transfer Privativo de Olinda para Porto de Galinhas ( ida ou volta ) | R$ 250,00 | `transfer-privativo-de-olinda-para-porto-de-galinhas-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Japaratinga ( ida ou volta ) | R$ 400,00 | `transfer-privativo-aeroporto-de-recife-para-japaratinga-ida-ou-volta-` |
| Transfer | Transfer Privativo de Porto de Galinhas para Praia dos Carneiros ( ida ou volta ) | R$ 350,00 | `transfer-privativo-de-porto-de-galinhas-para-praia-dos-carneiros-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Hotéis em Maceió ( ida ou volta ) | R$ 800,00 | `transfer-privativo-aeroporto-de-recife-para-hoteis-em-maceio-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife ou Boa Viagem para Caruaru ( ida ou volta ) | R$ 380,00 | `transfer-privativo-aeroporto-de-recife-ou-boa-viagem-para-caruaru-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Hotéis no Cabo de Santo Agostinho e Vila Galé Ecoresort ( ida ou volta ) | R$ 180,00 | `transfer-privativo-aeroporto-de-recife-para-hoteis-no-cabo-de-santo-agostinho-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Praia da Pipa ( ida ou volta ) | R$ 750,00 | `transfer-privativo-aeroporto-de-recife-para-praia-da-pipa-ida-ou-volta-` |
| Transfer | Transfer Privativo Aeroporto de Recife para Jaboatão dos Guararapes ( ida ou volta ) | R$ 80,00 | `transfer-privativo-aeroporto-de-recife-para-jaboatao-dos-guararapes-ida-ou-volta-` |
| Transfer | Transfer privativo Aeroporto de São José dos Pinhais para Curitiba | R$ 200,00 | `transfer-privativo-aeroporto-de-sao-jose-dos-pinhais-para-curitiba` |
| Transfer | Transfer Privativo Aeroporto de Recife para Sirinhaem | R$ 300,00 | `transfer-privativo-aeroporto-de-recife-para-serrambi` |

**Ajustes de catálogo recomendados antes de publicar** [recomendação]:
- Retirar ou renomear itens datados: "Caruaru ida e volta (São João 2024)", "Mergulho (tarifas 2023)".
- Avaliar o transfer "Aeroporto de São José dos Pinhais para Curitiba" (fora da área; parece teste).
- Corrigir erros de digitação herdados ("definifir", "aguarando", "Estalereiro", "Murto Alto", "ímperdível").
- Classificar "Transfer Aeroporto → Serrambi" como Transfer (está como Serviços).

---

## 4. Arquitetura proposta

### 4.1 Princípio

Um site, um domínio, um banco. A loja é um conjunto de páginas e tabelas novas **dentro** do que já existe. Nada do PWA, do app nativo ou da automação de e-mails é alterado; a loja **insere** em `viagens` exatamente como o PWA insere (mesmos campos de `NovaViagem.jsx`).

```
Visitante (PT/ES/EN)
   │  página da rota / produto  →  escolhe data, hora, pax  →  preço calculado
   ▼
Checkout (Next.js, server action)
   │  INSERT pedidos (status: pendente_pagamento)
   │  cria cobrança no gateway (Pix / cartão)  →  cliente paga
   ▼
Webhook do gateway → Edge Function `loja-pagamento-webhook`
   │  valida assinatura, idempotência por pedido
   │  UPDATE pedidos (pago)  →  INSERT viagens (1 por perna; fornecedor Agua Verde; status pendente)
   │  → gatilhos já existentes: push app nativo (admin), alertas, lembrete WhatsApp, avaliação pós-viagem
   │  → novo: e-mail + WhatsApp (template) ao passageiro com voucher e /acompanhar/:token
   ▼
PWA: tela "Pedidos do site" (listar, confirmar passeio, reembolsar, ver pagamento)
```

### 4.2 Modelo de dados (novas tabelas, sem tocar nas existentes)

```sql
-- Catálogo
produtos (
  id uuid pk, slug text unique, slug_paytour text,            -- redirect 301
  tipo text check (tipo in ('transfer','passeio')),
  nome jsonb,            -- {"pt":..., "es":..., "en":...}
  descricao jsonb,       -- idem, markdown
  inclusos jsonb, nao_inclusos jsonb,
  origem_padrao text, destino_padrao text, sentido text check (sentido in ('ida','volta','ida_volta','n/a')),
  preco_base numeric not null,       -- BRL, cobre até pax_incluidos
  pax_incluidos int not null default 3,
  adicional_por_pax numeric not null default 0,
  pax_max int not null default 4,
  duracao_min int, confirmacao text check (confirmacao in ('imediata','24h')) default 'imediata',
  imagens text[], ordem int, ativo boolean default true,
  seo jsonb, criado_em timestamptz default now(), atualizado_em timestamptz default now()
);

-- Pedidos (a transação comercial; a viagem é a operação)
pedidos (
  id uuid pk, numero text unique,            -- AV-2026-000123
  produto_id uuid references produtos,
  idioma text, moeda text default 'BRL',
  passageiro_nome text, passageiro_telefone text (E.164), passageiro_email text, passageiro_cpf text,
  pax int, bagagens_grandes int, bagagens_pequenas int, observacoes text,
  valor_total numeric, valor_base numeric, valor_adicionais numeric,
  status text check (status in ('pendente_pagamento','pago','aguardando_confirmacao','confirmado',
                                 'cancelado','reembolsado','expirado')),
  gateway text, gateway_ref text, gateway_status text, gateway_payload jsonb,
  consent_lgpd_em timestamptz, utm_source text, utm_medium text, utm_campaign text, ip_origem inet, user_agent text,
  criado_em timestamptz, pago_em timestamptz, expira_em timestamptz
);

-- Pernas do pedido (ida, volta): cada perna vira uma viagem
pedido_itens (
  id uuid pk, pedido_id uuid references pedidos, ordem int,
  origem text, destino text, data_hora timestamptz, voo_numero text, voo_companhia text,
  endereco_hotel text, viagem_id int references viagens(id)
);

pedido_eventos (id, pedido_id, tipo, detalhes jsonb, criado_em)   -- auditoria
```

RLS: `produtos` leitura pública; `pedidos`/`pedido_itens` sem acesso anon (checkout roda no servidor com service role); leitura no PWA para `is_admin_or_gerente()`. "Minha reserva" consulta por `numero + e-mail` via RPC `SECURITY DEFINER` que devolve só o necessário.

### 4.3 Regras de preço

`total = preco_base + max(0, pax - pax_incluidos) × adicional_por_pax`, com `pax ≤ pax_max`. Produtos "ida e volta" têm 2 pernas e um preço só. Valores de `pax_incluidos`/`adicional_por_pax` a confirmar com a operação (pendência). Moeda sempre BRL; ES/EN mostram "≈ US$ X" com cotação diária e aviso "cobrado em reais".

### 4.4 Rotas do site (novas)

| Rota | Função |
|:--|:--|
| `/transfers`, `/passeios` | catálogo por categoria |
| `/transfers/[slug]`, `/passeios/[slug]` | página do produto com widget de reserva (data, hora, pax) |
| `/checkout/[pedido]` | dados do passageiro + pagamento |
| `/reserva/[numero]` | confirmação, voucher, link de acompanhamento, botão "cancelar" (regra 24 h) |
| `/minha-reserva` | consulta por número + e-mail |
| `/es/...`, `/en/...` | mesmas rotas com prefixo de idioma (next-intl) |
| `/passeio/[slug-paytour]` | redirect 301 para a rota nova (preserva links antigos) |

As 3 landing pages de rota já existentes ganham o **widget de reserva na primeira tela** (vira a página de produto correspondente ou aponta para ela), conforme o plano SEO v5.1.

### 4.5 Fluxos especiais

- **Passeios (confirmação em 24 h)**: pedido pago entra como `aguardando_confirmacao`; admin confirma no PWA (vira viagem) ou recusa (reembolso pelo gateway). Cron diário: pedidos sem resposta em 24 h → reembolso automático + alerta.
- **Cancelamento pelo cliente**: botão em `/reserva/[numero]`; se faltar > 24 h, reembolso automático e viagem `cancelada`; senão, orienta a falar no WhatsApp.
- **Pedido não pago**: expira em 30 min (Pix) / imediato (cartão recusado); nada é criado em `viagens`.
- **Fora da tabela** (origem/destino não cadastrados): formulário de orçamento já existente, com os campos pré-preenchidos.

### 4.6 Reservas automatizadas pelo WhatsApp (diferencial que justifica o teto de R$ 300)

A IA que já responde no WhatsApp (`ia-responder-whatsapp`) passa a conhecer o catálogo e os preços (consulta a `produtos`) e, quando o cliente quer reservar, envia um **link de checkout pré-preenchido** (produto, data, pax). O pagamento continua no site; a IA não cobra nem confirma sozinha. Custo adicional: só tokens da OpenAI, já pagos hoje.

---

## 5. O que muda em cada sistema

| Sistema | Mudança | Risco para o que já roda |
|:--|:--|:--|
| Supabase | 4 tabelas novas, 1 RPC, 1 Edge Function de webhook, 1 cron | **Baixo**: nada existente é alterado; INSERT em `viagens` usa o mesmo contrato do PWA |
| Site Next.js | rotas novas, i18n com prefixo, redirects, widget, checkout | Zero para PWA e app |
| PWA | tela "Pedidos do site" (lista, confirmar, reembolsar) | Baixo: tela nova, sem mexer nas existentes |
| App nativo | nada; recebe push pelo gatilho já existente | Zero |
| WhatsApp IA | prompt ganha catálogo + função "gerar link de checkout" | Baixo: comportamento atual preservado quando não é pedido de reserva |

---

## 6. Transição Paytour → loja própria

1. Baixar as 69 imagens do CDN da Paytour e os textos (já extraídos) → Supabase Storage.
2. Fotos e vídeos do Drive (links enviados em 2026-10-08, pastas da conta aguaverdeviagens@gmail.com):
   - "Agua Verde Fotos para o Site" (criada em 2019): 26 fotos JPG, a maioria de 2015–2016 (nomes `IMG_2015...`). **[fato verificado pela página pública da pasta]**
   - "Vídeos de Marketing VDV Agua Verde Viagens" (2023): pelo menos 31 imagens JPG na primeira tela; os vídeos não apareceram na primeira carga da página e serão conferidos no download completo (semana 1). O conector do Drive não lista o conteúdo dessas pastas compartilhadas; o download será feito pelo link público.
   - [recomendação] As fotos de 2015–2016 estão com 10 anos. O plano SEO v5.1 já pedia foto atual de motorista uniformizado + veículo com placa de nome (padrão Welcome Pickups). Sugestão: uma sessão de fotos com celular na semana 1 (aeroporto, frota, embarque), com termo de cessão de imagem dos motoristas fotografados.
3. Homologação em `staging.aguaverde.tur.br` (subdomínio na Vercel) com 3 compras reais de R$ 1 (Pix e cartão) e estorno.
4. Dia D: DNS de `aguaverde.tur.br` → Vercel; Paytour deixa de vender; redirects 301 ativos; sitemap novo no Search Console.
5. Paytour mantida 60 dias só para consulta de vouchers antigos; dono exporta reservas futuras → eu cadastro em `viagens`.
6. Após 60 dias: cancelar Paytour (economia de R$ 250/mês).

---

## 7. Pesquisa de mercado

> Seções 7.1 a 7.3 preenchidas a partir dos relatórios em `docs/loja/pesquisa/` (gerados em 2026-10-08).

### 7.1 Como os grandes vendem (sites de referência)

[PESQUISA EM ANDAMENTO]

### 7.2 O que a comunidade recomenda em 2026 (Reddit e fontes técnicas)

[PESQUISA EM ANDAMENTO]

### 7.3 Gateways de pagamento e WhatsApp: números verificados

Relatório completo com fontes oficiais linha a linha: `docs/loja/pesquisa/pesquisa-custos-pagamento-whatsapp.md` (todos os números lidos em páginas oficiais em 2026-10-08).

**Gateways (taxas publicadas, out/2026)**

| Gateway | Mensalidade | Pix | Cartão nacional à vista | Cartão estrangeiro | Observação decisiva |
|:--|:--|:--|:--|:--|:--|
| **Mercado Pago** | R$ 0 | 0,99 % | 3,98 % (D30) · 4,49 % (D14) · 4,98 % (D0) | aceita Visa/Master/Amex do exterior no checkout pronto, sem adicional publicado | antifraude + 3DS inclusos; reembolso por API até 180 dias; Proteção ao Vendedor não cobre serviços |
| Stripe Brasil | R$ 0 | 1,19 % só por convite | 3,99 % + R$ 0,39 | +2 %, sem Amex/Elo | "agências de viagem e serviços de transporte" é atividade **restrita** (aprovação prévia); não devolve tarifa no reembolso |
| Pagar.me (Stone) | R$ 0 | 0,99 % | 4,19 % | só via API transparente com passaporte | link/checkout pronto não aceita estrangeiro; D+1, pode reter 30 dias para novos |
| Asaas | R$ 0 | R$ 1,99 fixo | 2,99 % + R$ 0,49 | só com liberação prévia (até 4 dias úteis), sem Pix/parcelado/link | o mais barato por venda, mas falha no público estrangeiro |
| PagBank | R$ 0 | não publicado (online) | 3,99 % + R$ 0,40 (30 d) | não publicado | menos transparente |

Custo por venda (ticket R$ 400, metade Pix, metade cartão): Asaas R$ 7,22 · Mercado Pago D30 R$ 9,94 · Pagar.me R$ 10,36 · Stripe R$ 10,56 (R$ 14,56 com cartão estrangeiro). Nenhum gateway brasileiro cobra em USD/EUR para CNPJ brasileiro: a cobrança é sempre em reais e o banco do cliente converte (confirma a decisão 24).

**Escolha [recomendação]: Mercado Pago**, Checkout Pro no lançamento (pagamento em página do Mercado Pago, mais rápido de integrar) e migração para Checkout Bricks (pagamento dentro do site) depois. Motivo: único com cartão estrangeiro, inclusive Amex, no checkout pronto sem adicional e sem cadastro prévio; custo fixo zero; antifraude e 3DS inclusos; SDK Node e contas de teste. Plano B para clientes brasileiros: Asaas.

**WhatsApp Cloud API (Meta), tabela oficial em BRL vigente desde 1º/10/2026**

| Categoria | Preço por mensagem | Uso na loja |
|:--|:--|:--|
| Utility (confirmação, voucher, lembrete) | R$ 0,035 | 3 por venda → R$ 0,105/venda |
| Service (resposta livre na janela de 24 h) | R$ 0,035 após 1.000 grátis/mês | atendimento e IA, dentro da franquia |
| Marketing | R$ 0,3217 | só campanhas com opt-in (fora da v1) |

Regras que importam: templates utility precisam de aprovação da Meta por idioma (pt_BR, es, en); fora da janela de 24 h só template; faturamento em BRL pela Facebook Brasil desde jul/2026. Alternativas descartadas: Z-API (R$ 99,99/mês, API não oficial, risco de bloqueio do número), 360dialog (€ 49/mês, só revende a Meta), Twilio (+US$ 0,005 por mensagem, cobrado em dólar). Decisão: manter a integração direta que o PWA já tem.

---

## 8. Custos mensais estimados

Premissas: ticket médio R$ 400; metade Pix, metade cartão à vista; 3 mensagens WhatsApp e 3 e-mails por venda; câmbio PTAX de 2026-10-08 (US$ 1 = R$ 5,01). Fontes no relatório de custos.

| Linha | 50 vendas/mês | 100 vendas/mês | 150 vendas/mês |
|:--|--:|--:|--:|
| **Fixo** Vercel Pro (uso comercial exige; Hobby proíbe) | R$ 100 | R$ 100 | R$ 100 |
| Fixo Supabase Pro (já pago; a loja não adiciona) | R$ 0 | R$ 0 | R$ 0 |
| Fixo Resend Free (3.000 e-mails/mês; a loja usa ~450) | R$ 0 | R$ 0 | R$ 0 |
| Fixo gateway, WhatsApp API, PDF (bibliotecas MIT) | R$ 0 | R$ 0 | R$ 0 |
| **Subtotal fixo** | **R$ 100** | **R$ 100** | **R$ 100** |
| Variável WhatsApp (utility) | R$ 5 | R$ 11 | R$ 16 |
| Variável Mercado Pago D30 (descontado da venda, não é desembolso) | R$ 497 | R$ 994 | R$ 1.491 |
| **Total** | ≈ R$ 602 (2,5 % de R$ 20 mil) | ≈ R$ 1.105 (2,8 % de R$ 40 mil) | ≈ R$ 1.607 (2,7 % de R$ 60 mil) |

Leitura: o custo **fixo** cai de R$ 250 (Paytour) para **R$ 100** (Vercel Pro), bem abaixo do teto de R$ 250–300, e isso já inclui o chatbot de IA (OpenAI já pago hoje) e as reservas automatizadas. O custo variável é taxa de pagamento, que a Paytour também cobrava por fora via PagSeguro/PayPal. Se a conta Vercel já for Pro, o fixo adicional é zero.

---

## 9. Fases e cronograma (meta: vendendo até 5 de dezembro de 2026)

| Semana | Período | Entrega | Critério de pronto |
|:--|:--|:--|:--|
| 1 | 13–17 out | Aprovação deste plano; Figma das 4 telas (home, produto, checkout, confirmação); tabelas no Supabase; importação dos 46 produtos e imagens | sócio aprovou as 4 telas; `produtos` populada |
| 2 | 20–24 out | Páginas de catálogo e produto em PT/ES/EN; widget de reserva com preço; redirects dos slugs Paytour | todas as páginas abrem nos 3 idiomas no staging |
| 3 | 27–31 out | Checkout + gateway (Pix e cartão) + webhook + criação de viagem + e-mail e WhatsApp ao passageiro + push/e-mail à empresa | compra de teste de R$ 1 vira viagem e dispara os avisos |
| 4 | 3–7 nov | "Minha reserva", voucher, cancelamento 24 h com reembolso; tela "Pedidos do site" no PWA; fluxo de confirmação de passeios + cron | reembolso de teste concluído; passeio confirmado pelo PWA |
| 5 | 10–14 nov | Landing pages de rota com widget (plano SEO v5.1), consent LGPD, GA4 + Clarity, eventos de conversão, termos e política de cancelamento publicados | Lighthouse mobile ≥ 90; eventos chegam no GA4 |
| 6 | 17–21 nov | IA do WhatsApp com catálogo e link de checkout; testes de ponta a ponta nos 3 idiomas; correções | 10 cenários de teste passam |
| 7 | 24–28 nov | Homologação com o sócio e o irmão; migração das reservas futuras da Paytour; troca de DNS; Search Console | site no domínio; Paytour em modo consulta |
| 8 | 1–5 dez | Folga para ajustes; início da frente de Google Ads (sessão separada) | primeira venda real registrada |

Esforço estimado: ~6 semanas de construção + 2 de folga. Se o Drive de fotos ou os preços revisados atrasarem, o lançamento sai com fotos e preços da Paytour e troca depois (não bloqueia).

---

## 10. Riscos e como tratar

| Risco | Impacto | Tratamento |
|:--|:--|:--|
| Gateway recusar cartão estrangeiro ou exigir cadastro longo | Alto (público ES/EN) | escolher gateway com cartão internacional confirmado (§7.3); abrir cadastro na semana 1 |
| Plano Vercel Hobby (uso comercial proibido pelos termos) | Médio | confirmar plano; se Hobby, migrar para Pro (US$ 20/mês ≈ R$ 100, já contado no §8) |
| Template de WhatsApp não aprovado a tempo pela Meta | Médio | submeter templates na semana 1; e-mail cobre enquanto isso |
| Preços da Paytour desatualizados | Médio | dono revisa a tabela no §3 antes da semana 2 |
| Perda de posições no Google na troca de domínio | Médio | redirects 301 slug a slug; sitemap; monitorar Search Console por 30 dias |
| Passeio vendido sem vaga | Médio | fluxo de confirmação 24 h + reembolso automático (§4.5) |
| Tocar em `viagens` quebrar PWA/app | Alto | só INSERT com o contrato do PWA; nenhuma coluna ou trigger existente alterada; teste em staging |
| Sobrecarga do atendimento com vendas automáticas | Baixo | push + e-mail por venda; IA responde dúvidas; painel no PWA |

---

## 11. Métricas de sucesso (90 dias após o lançamento)

| KPI | Meta |
|:--|:--|
| Reservas pagas pelo site | > 40/mês (4× a Paytour) |
| Taxa de conversão (visita → compra) | > 2 % |
| Taxa de pagamento concluído (checkout iniciado → pago) | > 60 % |
| Custo fixo mensal | ≤ R$ 300 |
| Reembolsos por falha operacional | < 2 % das vendas |
| Tempo até a confirmação do passeio | < 12 h em média |

---

## 12. Frente separada: Google Ads

Escopo (sessão/subagente própria, após o site no ar): auditoria da conta existente; campanha de Busca por rota (PT/ES/EN) com variantes de página por anúncio (plano SEO v5.1 §10); textos e peças (imagens/vídeos) geradas por IA com os conectores disponíveis; entrega em arquivo de importação do **Google Ads Editor** (gratuito) para o irmão importar; medição de conversão pelo evento `compra_concluida` do site. Sem ferramenta paga: o Adspirer Free (15 tarefas/mês, dados puxados uma vez) serve só para a auditoria inicial, se quiserem conectar a conta.

---

## 13. Próximos passos imediatos

1. Sócio aprova este plano (ou aponta ajustes).
2. Dono envia: número CADASTUR, link do Drive de fotos, regra do adicional por passageiro, plano atual da Vercel.
3. Eu abro o cadastro no gateway escolhido (precisa de CNPJ e conta bancária da empresa: o dono faz, eu guio passo a passo).
4. Semana 1 começa.
