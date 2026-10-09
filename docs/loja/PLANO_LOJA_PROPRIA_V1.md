# Plano v1 — Loja própria aguaverde.tur.br (substituição da Paytour)

> Data: 2026-10-08, ajustes 2026-10-09 (decisões 25–30) · Autor: Claude Code com Mateus Zanlorenzi · Status: **aprovado pelo dono em 2026-10-09, com as recomendações do documento** (gateway Mercado Pago principal e Stripe reserva; Vercel Pro se a conta for Hobby; Supabase Small no lançamento)
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
| 25 | App nativo ganha tela "Pedidos do site", além do push (ajuste de 2026-10-09) | dono |
| 26 | IA do WhatsApp migra de gpt-4o-mini (OpenAI) para Claude Sonnet 5.5 (ajuste de 2026-10-09) | dono |
| 27 | Verificar o Supabase; alta chance de precisar subir o porte de computação (ajuste de 2026-10-09) | dono |
| 28 | Supabase está em **Micro** (o dono reduziu o porte; o `CLAUDE.md` do PWA ficou desatualizado). Subida para Small **autorizada** para o lançamento (2026-10-09) | dono |
| 29 | Plano aprovado com as recomendações do documento (2026-10-09). CADASTUR e regra do adicional por passageiro ficam para depois; não travam a construção | dono |
| 30 | Google Ads: o irmão investe **R$ 2.000/mês em 3 campanhas que funcionam e ficam**. A frente de Ads passa a ser: auditar e otimizar as 3 existentes, apontá-las para a loja nova no lançamento e, se fizer sentido, criar **uma** campanha nova (2026-10-09) | dono |

Pendências de fato que **não travam** o plano: número CADASTUR e regra exata do adicional por passageiro (o dono envia depois; até lá, o site não exibe selo CADASTUR e usa a regra provisória "preço base até 3 passageiros" para revisão), plano atual da Vercel (Hobby ou Pro). Resolvidos em 2026-10-09: porte do Supabase (Micro, subida para Small autorizada), verba de Ads (R$ 2.000/mês já em uso), Drive de fotos e vídeos (recebido, ver §6).

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
  id uuid pk, numero text unique,            -- AV-2026-000123 (só para humanos: e-mail, atendimento)
  token_acesso text unique not null,         -- segredo aleatório (32+ caracteres) que dá acesso à página da reserva
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

RLS: `produtos` leitura pública; `pedidos`/`pedido_itens` sem acesso anon (checkout roda no servidor com service role); leitura no PWA para `is_admin_or_gerente()`. A página da reserva lê pelo `token_acesso` via RPC `SECURITY DEFINER` que devolve só o necessário; "minha reserva" (número + e-mail) não devolve dados, só dispara o reenvio do link.

### 4.3 Regras de preço

`total = preco_base + max(0, pax - pax_incluidos) × adicional_por_pax`, com `pax ≤ pax_max`. Produtos "ida e volta" têm 2 pernas e um preço só. Valores de `pax_incluidos`/`adicional_por_pax` a confirmar com a operação (pendência). Moeda sempre BRL; ES/EN mostram "≈ US$ X" com cotação diária e aviso "cobrado em reais".

### 4.4 Rotas do site (novas)

| Rota | Função |
|:--|:--|
| `/transfers`, `/passeios` | catálogo por categoria |
| `/transfers/[slug]`, `/passeios/[slug]` | página do produto com widget de reserva (data, hora, pax) |
| `/checkout/[pedido]` | dados do passageiro + pagamento |
| `/reserva/[token_acesso]` | confirmação, voucher, link de acompanhamento, botão "cancelar" (regra 24 h). O endereço usa o **segredo aleatório** do pedido, nunca o número sequencial, para que ninguém consiga abrir ou cancelar a reserva de outra pessoa tentando números |
| `/minha-reserva` | consulta por número + e-mail; se os dois baterem, o sistema **reenvia o link secreto** por e-mail/WhatsApp (não exibe dados na tela) |
| `/es/...`, `/en/...` | mesmas rotas com prefixo de idioma (next-intl) |
| `/passeio/[slug-paytour]` | redirect 301 para a rota nova (preserva links antigos) |

As 3 landing pages de rota já existentes ganham o **widget de reserva na primeira tela** (vira a página de produto correspondente ou aponta para ela), conforme o plano SEO v5.1.

### 4.5 Fluxos especiais

- **Passeios (confirmação em 24 h)**: pedido pago entra como `aguardando_confirmacao`; admin confirma no PWA (vira viagem) ou recusa (reembolso pelo gateway). Cron diário: pedidos sem resposta em 24 h → reembolso automático + alerta.
- **Cancelamento pelo cliente**: botão em `/reserva/[token_acesso]` (só quem tem o link secreto); se faltar > 24 h, reembolso automático e viagem `cancelada`; senão, orienta a falar no WhatsApp.
- **Pedido não pago**: expira em 30 min (Pix) / imediato (cartão recusado); nada é criado em `viagens`.
- **Fora da tabela** (origem/destino não cadastrados): formulário de orçamento já existente, com os campos pré-preenchidos.

### 4.6 Reservas automatizadas pelo WhatsApp (diferencial que justifica o teto de R$ 300)

A IA que já responde no WhatsApp (`ia-responder-whatsapp`) passa a conhecer o catálogo e os preços (consulta a `produtos`) e, quando o cliente quer reservar, envia um **link de checkout pré-preenchido** (produto, data, pax). O pagamento continua no site; a IA não cobra nem confirma sozinha.

**Migração do modelo para Claude Sonnet 5.5 [decisão 26]**

| Item | Hoje | Depois |
|:--|:--|:--|
| Modelo | `gpt-4o-mini` (OpenAI), coluna `configuracoes_whatsapp.ia_modelo` | `claude-sonnet-5-5` (Anthropic) |
| Formato da resposta | `response_format: json_schema` (OpenAI) | saída estruturada nativa da API Anthropic (`output_config.format`) com o mesmo esquema; sem `tool_choice` forçado (o 5.5 rejeita) |
| Raciocínio | n/a | `thinking: between_tools` com esforço `low`, ou esforço `low` com raciocínio adaptativo; medir os dois |
| Preço de lista | ~US$ 0,15 / 0,60 por milhão de tokens | US$ 2 / US$ 10 por milhão (entrada / saída) |
| Custo estimado | ~R$ 1/mês | ~400 mensagens/mês × (~3 mil tokens de entrada + ~200 de saída) ≈ US$ 3,2 ≈ **R$ 16/mês** |

Fatos que orientam a implementação: a função de e-mails (`processar-reserva-email/ia.ts`) já chama a API da Anthropic por `fetch` e serve de base, mas usa `tool_choice: tool`, que o Sonnet 5.5 recusa (HTTP 400); a tentativa de migrar os e-mails para o 5.5 foi encerrada em 30/09/2026 por regressões na extração de PDFs, um caso bem mais sensível que o chat. Por isso a migração do chat segue o mesmo rito, em escala menor: adaptador por modelo, 50 conversas reais reprocessadas sem escrita comparando gpt-4o-mini × Sonnet 5.5 (tempo, custo, taxa de handoff, respostas fora do esquema), e troca só com ganho demonstrado. Os 6 guardrails e o handoff humano não mudam. Chave `ANTHROPIC_API_KEY` já existe nos segredos das Edge Functions.

### 4.7 Padrão técnico do checkout (anti-erros conhecidos)

1. O pedido é criado como `pendente_pagamento` **antes** de abrir o pagamento; o id do pedido é a chave de idempotência enviada ao gateway.
2. A página "pagamento aprovado" só mostra estado; quem confirma é o **webhook**, verificado pela assinatura no corpo cru da requisição.
3. Tabela `gateway_eventos (evento_id primary key, pedido_id, payload, recebido_em)`: duplicatas falham no banco (`on conflict do nothing`), nunca são reprocessadas.
4. **Uma única função** `confirmar_pedido(pedido_id, gateway_ref, evento_id)` (RPC `SECURITY DEFINER`, transacional): só executa se existir em `gateway_eventos` um evento **aprovado** para aquele `gateway_ref` (gravado após verificação de assinatura); marca `pago`, cria as viagens (uma por perna), grava `viagem_id` em `pedido_itens`, dispara avisos. É chamada pelo webhook. A **página de sucesso é somente leitura**: mostra o estado atual do pedido; se ainda estiver `pendente_pagamento`, o servidor consulta o gateway (`consultarPagamento`), e só se o gateway responder "aprovado" é que grava o evento em `gateway_eventos` e chama a mesma função. Um visitante que abrir ou recarregar a página de sucesso sem pagamento aprovado nunca gera viagem.
5. Responder 2xx ao gateway só depois de persistir; esperar eventos fora de ordem e repetidos.
6. Cron a cada 15 min expira pedidos pendentes com mais de 45 min e libera nada (nenhuma vaga é segurada antes do pagamento).
7. A integração com o gateway fica atrás de uma interface própria (`criarCobranca`, `consultarPagamento`, `reembolsar`, `validarWebhook`), para trocar Mercado Pago por Stripe ou Asaas sem mexer no checkout.

---

## 5. O que muda em cada sistema

| Sistema | Mudança | Risco para o que já roda |
|:--|:--|:--|
| Supabase | 4 tabelas novas, 1 RPC, 1 Edge Function de webhook, 1 cron | **Baixo**: nada existente é alterado; INSERT em `viagens` usa o mesmo contrato do PWA |
| Site Next.js | rotas novas, i18n com prefixo, redirects, widget, checkout | Zero para PWA e app |
| PWA | tela "Pedidos do site" (lista, confirmar, reembolsar) | Baixo: tela nova, sem mexer nas existentes |
| App nativo | tela nova **"Pedidos do site"** no stack de admin (lista com filtro por status, detalhe do pedido, confirmar passeio, acionar reembolso via Edge Function, abrir a viagem gerada), além do push já existente | Baixo: tela nova, sem mexer nas existentes nem em `perfis.tipo` |
| WhatsApp IA | prompt ganha catálogo + função "gerar link de checkout"; modelo migra para Claude Sonnet 5.5 (§4.6) | Médio: troca de provedor; mitigado por adaptador por modelo, teste em 50 conversas reais e kill switch `ia_ativa` já existente |

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

Relatório completo, com texto literal, URL e data de cada observação: `docs/loja/pesquisa/pesquisa-benchmark.md`. Observados de fato em 2026-10-08: Welcome Pickups, Suntransfers, Hoppa, Transfeero, Blacklane, Mozio, Kiwitaxi (Europa/global); 4Trip, Enter.travel, Luck Viagens, Book Transfer, Transfer Águia RJ, Ever Transfer, CHM (Brasil). Inacessíveis: CVC (bloqueio de robô) e Vivo Porto de Galinhas (domínio estacionado).

**O que 80 % deles fazem igual [fatos]**

1. Widget Origem → Destino → Data → Passageiros na primeira tela (7 de 7 europeus; no Brasil só Enter e Book Transfer).
2. Preço **por veículo**, com classe e capacidade ("até 3 pax + 3 malas"), nunca por pessoa no privativo. Confirma a decisão 6.
3. Quatro promessas repetidas quase literalmente: preço fixo sem surpresas · cancelamento grátis (24 h na maioria) · monitoramento de voo · espera grátis (60 min no desembarque). A Água Verde já opera todas, mas o site atual não diz.
4. Pedágios, taxas e estacionamento declarados como inclusos.
5. Prova social com número: nota + volume (Trustpilot 4,8 com 40.705 avaliações; TripAdvisor 4,3 com 45 mil) e contadores operacionais ("295.350 transfers neste aeroporto", "1,4 milhão de corridas").
6. Checkout **sem conta**, em 3 a 5 passos, pedindo: nome, e-mail, celular com DDI, nº do voo, hotel/endereço, cadeirinha, observações. Confirma as decisões 15 e 23.
7. Extras simples e visíveis: cadeirinha (por faixa de idade), parada extra, espera extra, pet, água; "ida e volta" com desconto.
8. Página de rota como landing de SEO: km, minutos, "a partir de", comparação com táxi/ônibus, FAQ.
9. Europeus: 5 a 14 idiomas e várias moedas; no Brasil só a Enter é trilíngue. Suntransfers e Kiwitaxi **já vendem REC, GIG e GRU em reais**.
10. Brasil: Pix é a forma de pagamento âncora (5 de 6); WhatsApp é canal em 6 de 6 operadores brasileiros e quase ausente nos europeus. 5 de 6 brasileiros vendem só pelo WhatsApp, sem checkout.

**Concorrente local mais próximo: Enter.travel.** Preço fechado por rota (REC↔PdG R$ 235, ↔Carneiros R$ 355, ↔Maragogi R$ 345, contra R$ 180 / 320 / 360 da Paytour), PT/ES/EN, Pix e cartão em até 12×, espera de 60 min, ponto de encontro descrito ("saída B5"), mas reserva em subdomínio de terceiro. A Luck Viagens, maior receptivo local, não vende transfer online.

**O que a Água Verde tem que nenhum concorrente observado tem [fato]**: acompanhamento da viagem em tempo real pelo link `/acompanhar/:token`, app próprio de motoristas e 8.211 viagens registradas para usar como prova operacional ("X viagens REC→PdG nos últimos 12 meses", calculado do banco).

**O que copiar (10 recomendações do relatório, já absorvidas no §4)**: widget de rota na home; preço por veículo com classes e capacidade; faixa das 4 promessas em toda página de produto e no checkout; páginas de rota com fatos e prova operacional real; checkout próprio em 3 passos sem conta, ligado ao `/acompanhar/:token`; Pix + cartão sem taxa com parcelamento visível; catálogo de extras simples (cadeirinha grátis, parada extra); prova social numérica e perfis de motoristas (foto, carro, idiomas, já em `motoristas`/`perfis`); trilíngue de verdade com seletor no header; WhatsApp como canal padrão com mensagem pré-preenchida por produto e autoatendimento pós-venda (reenviar voucher, alterar, cancelar, "não encontro meu motorista").

**Nota sobre a regra antiga de e-commerce**: o `CLAUDE.md` e o `AGENTS.md` do site diziam que e-commerce só com ">20 orçamentos/mês por 2 meses". Essa regra foi escrita em maio, quando a loja seria uma novidade sem demanda comprovada. Aqui a loja **substitui uma loja paga que já existe** (Paytour, R$ 250/mês, ~10 reservas/mês), com aprovação explícita do dono em 2026-10-09. Os dois arquivos foram **atualizados neste mesmo PR** para registrar a exceção e a nova regra (ver §2, decisão 2).

### 7.2 O que a comunidade recomenda em 2026 (Reddit e fontes técnicas)

Relatório completo com ~70 discussões de 2025–2026 (r/Tourguide, r/brdev, r/empreendedorismo, r/stripe, r/Supabase, r/whatsapp, r/n8n, r/PPC, r/googleads, Hacker News, TabNews) e citações com link e data: `docs/loja/pesquisa/pesquisa-comunidade-2026.md`.

**Motor próprio vs. plataforma (Paytour, Bókun, FareHarbor, Rezdy)** [fatos citados]: em 2026 a queixa dominante é pagar comissão ou mensalidade sobre a **venda direta**; o checkout em si é considerado pequeno. Regra técnica unânime: **uma única fonte de verdade** para reservas (dois casos de overbooking em 2026 por sistemas paralelos). Paytour: ~R$ 249/mês, críticas de lentidão e de remanejamento de datas. Confirma a decisão 2.

**Checkout em Next.js + Supabase** [padrão convergente em r/stripe, r/Supabase e equipe da Stripe, jul–set/2026]:
- a página "pagamento aprovado" **não** confirma nada; o **webhook** do gateway é a fonte de verdade;
- **uma única função** de confirmação, idempotente, chamada pelo webhook; a página de sucesso só a aciona depois de o servidor consultar o gateway e receber "aprovado";
- tabela de eventos recebidos com restrição `unique` no id do evento (duplicata falha no banco, não no código);
- assinatura verificada no corpo cru; responder ao gateway só depois de gravar;
- pedido criado como pendente **antes** de abrir o pagamento, com expiração por cron; nada entra em `viagens` antes de `pago`.
Tudo isso está incorporado no §4.7.

**Gateway: onde as duas pesquisas divergem.** A pesquisa de comunidade prefere **Stripe** (melhor experiência de desenvolvedor, checkout localizado, cartão estrangeiro) e registra em r/brdev relatos de **bugs no Checkout do Mercado Pago** (botão "pagar" cinza sem erro, dez/2025), documentação confusa e suporte lento. A pesquisa de custos (§7.3), lendo as páginas oficiais, recomenda **Mercado Pago**, porque a Stripe: (a) lista "hotéis, agências de viagem e serviços de transporte" como atividade **restrita** no Brasil, sujeita a aprovação prévia; (b) cobra +2 % no cartão estrangeiro e não aceita Amex; (c) oferece Pix "somente por convite". Os dois relatórios concordam que a diferença de custo é pequena. **Decisão proposta [recomendação]**: Mercado Pago como gateway principal, pelo fato objetivo de aceitar cartão estrangeiro (inclusive Amex) no checkout pronto sem aprovação prévia; com três mitigações para o risco apontado pela comunidade: (1) usar o Checkout Pro hospedado, a modalidade mais estável, e não o Transparente; (2) isolar a integração atrás de uma camada própria no código, para trocar de gateway sem reescrever o checkout; (3) abrir a conta Stripe em paralelo na semana 1 e passar pela aprovação de atividade restrita, para ter um reserva pronto se o Mercado Pago falhar nos testes de homologação. O dono decide se prefere inverter a ordem.

**WhatsApp** [fatos]: desde 1º/10/2026 as mensagens de serviço na janela de 24 h são cobradas após 1.000 por mês (R$ 0,035 cada); a reação da comunidade brasileira foi forte, mas quem calculou operação pequena viu impacto de dezenas de reais. Consenso dos desenvolvedores com produto sério: **API oficial**; a não oficial (Z-API, Evolution/Baileys) "é perfeita até o primeiro banimento". A Meta baniu bots de IA de propósito geral desde jan/2026; **bots de reserva e suporte com passagem para humano continuam permitidos**. A Água Verde já está no desenho recomendado (Cloud API direta, coexistência, IA com guardrails e handoff). Ajustes: consolidar a resposta do bot em uma mensagem só; monitorar a franquia de 1.000; a IA **nunca** confirma reserva por conta própria (grava, relê, só então confirma), o que bate com o §4.6.

**IA em pequenas agências** [fatos]: donos de negócio relatam que funciona um caso de uso de alto volume e baixo risco (responder rápido, não perder a primeira resposta) com passagem real para humano; exagero: agentes de voz, "90 % de automação", CRMs caros sem uso. Para a Água Verde, a automação de maior retorno é a que já existe (resposta imediata no WhatsApp) mais o link de checkout pré-preenchido.

**Conversão mobile** [fatos e benchmarks 2026]: 84 % das reservas de transfer em celular; páginas de transporte bem feitas convertem ~14,8 %; 62 % abandonam quando o preço aparece tarde (caso real de transfer de Paris em r/PPC, mar/2026). Remédio: preço fixo no anúncio e na primeira tela, "o que está incluído" comparado a Uber/táxi, avaliação ao lado do preço, WhatsApp como segunda via medida à parte. Não há evidência independente de ganho com "reserve agora, pague depois" em transfer; fica fora da v1.

**Google Ads** [fatos de r/PPC e r/googleads 2026]: **só campanhas de Busca** no início, por rota e idioma, correspondência exata e de frase; Performance Max perde para Busca em 84 % dos casos de geração de leads e precisa de ~30 conversões/mês para funcionar; "AI Max" tem relatos de 72 % do gasto fora do tema e **migração automática desde 1º/09/2026** (conferir se a conta existente foi migrada); conversão primária = reserva paga; lances manuais até o rastreamento estar validado. Entra no §12.

**10 decisões sugeridas pelo relatório e como ficaram**: 1 substituir Paytour por checkout próprio (aceita); 2 Stripe (ver divergência acima: Mercado Pago principal, Stripe reserva); 3 webhook idempotente com função única (aceita, §4.7); 4 Supabase como única fonte de verdade, viagem só após pago (aceita); 5 Cloud API oficial sem intermediário (aceita); 6 bot nunca promete reserva (aceita); 7 formulário de orçamento com aviso imediato (já existe); 8 preço na primeira tela com "o que está incluído" e avaliação ao lado (aceita, §4.4); 9 Ads só Busca, PMax e AI Max desligados (aceita, §12); 10 "pague depois", agente de voz e marketplaces de IA como testes futuros (aceita).

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
| **Fixo** Supabase: subir o porte de Micro para Small (US$ 15; decisão 27) | R$ 75 | R$ 75 | R$ 75 |
| Variável Claude Sonnet 5.5 na IA do WhatsApp (decisão 26) | R$ 16 | R$ 16 | R$ 16 |
| Fixo Resend Free (3.000 e-mails/mês; a loja usa ~450) | R$ 0 | R$ 0 | R$ 0 |
| Fixo gateway, WhatsApp API, PDF (bibliotecas MIT) | R$ 0 | R$ 0 | R$ 0 |
| **Subtotal fixo** | **R$ 175** | **R$ 175** | **R$ 175** |
| Variável WhatsApp (utility) | R$ 5 | R$ 11 | R$ 16 |
| Variável Mercado Pago D30 (descontado da venda, não é desembolso) | R$ 497 | R$ 994 | R$ 1.491 |
| **Total** | ≈ R$ 693 | ≈ R$ 1.196 | ≈ R$ 1.698 |

Leitura: o custo **fixo** cai de R$ 250 (Paytour) para **R$ 175** (Vercel Pro + Supabase Small), abaixo do teto de R$ 250–300, já com o chatbot em Claude Sonnet 5.5 e as reservas automatizadas. O custo variável é taxa de pagamento, que a Paytour também cobrava por fora via PagSeguro/PayPal. Se a conta Vercel já for Pro, o fixo adicional cai para R$ 75.

**Supabase, estado verificado em 2026-10-09 [fatos]**

| Item | Valor |
|:--|:--|
| Plano | Pro (US$ 25/mês, já pago), Postgres 17, região us-east-2 |
| Porte de computação | **Micro** (confirmado pelo dono em 2026-10-09: o porte foi reduzido e o `CLAUDE.md` do PWA não foi atualizado; corrigir esse documento no pacote de manutenção da semana 1). Subida para Small autorizada |
| Banco | 1,76 GB de 8 GB inclusos |
| Maiores tabelas | `net._http_response` 379 MB com só 1.221 linhas (inchaço de respostas do pg_net); `automacao_email_fila` 354 MB e `automacao_email_arquivos` 353 MB (anexos de e-mail guardados no banco, 4.829 linhas); `viagens` 9,6 MB |
| Avisos de desempenho | 24 chaves estrangeiras sem índice (quase todas da automação de e-mails), 32 índices nunca usados, índice duplicado em `driver_locations`, 2 políticas RLS redundantes em `perfis`, inchaço em `net._http_response` |
| Histórico | esgotamento do orçamento de Disk IO em jun/2026 (mitigado com limpeza de `driver_locations` e GPS a 300 m/120 s) |

Leitura [recomendação]: a loja em si pesa pouco (tabelas de pedidos na casa dos megabytes). O que consome o banco é a automação de e-mails e o inchaço do pg_net. Plano em duas partes: (1) **manutenção sem custo na semana 1**: limpar `net._http_response` (recupera ~370 MB e reduz IO), remover o índice duplicado, criar índices nas chaves estrangeiras mais usadas, mover anexos de e-mail para o Storage em pacote próprio; (2) **subir para Small (+US$ 15/mês ≈ R$ 75) no lançamento**, que dobra RAM e conexões e dá folga de IO para a alta temporada. Medium (+US$ 60 ≈ R$ 300) só se o painel mostrar IO esgotando de novo depois da limpeza; estouraria o teto e precisa de decisão sua.

---

## 9. Fases e cronograma (meta: vendendo até 5 de dezembro de 2026)

| Semana | Período | Entrega | Critério de pronto |
|:--|:--|:--|:--|
| 1 | 13–17 out | Aprovação deste plano; Figma das 4 telas (home, produto, checkout, confirmação); tabelas no Supabase; importação dos 46 produtos e imagens; **manutenção do Supabase** (limpeza do pg_net, índice duplicado, índices em FKs) e subida para Small | sócio aprovou as 4 telas; `produtos` populada; painel do Supabase sem aviso de IO |
| 2 | 20–24 out | Páginas de catálogo e produto em PT/ES/EN; widget de reserva com preço; redirects dos slugs Paytour | todas as páginas abrem nos 3 idiomas no staging |
| 3 | 27–31 out | Checkout + gateway (Pix e cartão) + webhook + criação de viagem + e-mail e WhatsApp ao passageiro + push/e-mail à empresa | compra de teste de R$ 1 vira viagem e dispara os avisos |
| 4 | 3–7 nov | "Minha reserva", voucher, cancelamento 24 h com reembolso; tela "Pedidos do site" no PWA **e no app nativo**; fluxo de confirmação de passeios + cron | reembolso de teste concluído; passeio confirmado pelo PWA e pelo app |
| 5 | 10–14 nov | Landing pages de rota com widget (plano SEO v5.1), consent LGPD, GA4 + Clarity, eventos de conversão, termos e política de cancelamento publicados | Lighthouse mobile ≥ 90; eventos chegam no GA4 |
| 6 | 17–21 nov | IA do WhatsApp migrada para Claude Sonnet 5.5 (teste em 50 conversas reais) + catálogo e link de checkout; testes de ponta a ponta nos 3 idiomas; correções | comparação 4o-mini × 5.5 sem regressão; 10 cenários de teste passam |
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

**Situação real [informada pelo dono em 2026-10-09]**: o irmão já investe **R$ 2.000/mês em 3 campanhas** que estão funcionando e vão continuar. Não se trata de criar uma campanha do zero.

Escopo da frente (sessão/subagente própria, sem ferramenta paga):

1. **Auditoria das 3 campanhas existentes** (leitura, sem alterar nada): estrutura, palavras-chave e termos de pesquisa, correspondências, lances, páginas de destino, acompanhamento de conversão, e se a conta foi migrada automaticamente para "AI Max" em set/2026 (§7.2). Entrega: relatório com o que está gerando reserva e o que está gastando sem retorno.
2. **Otimizações propostas, só com o irmão aprovando cada uma**: negativação de termos, correspondência exata/frase onde estiver ampla, preço fixo no título, extensões; nada de Performance Max; lances manuais até o rastreamento de conversão estar validado.
3. **Troca das páginas de destino no lançamento**: as campanhas passam a apontar para as páginas de rota da loja nova (com variantes por anúncio do plano SEO v5.1 §10), e a conversão primária passa a ser **reserva paga** (`compra_concluida`), medida no site. Hoje a conversão medida é o que a Paytour permite; isso é um dos maiores ganhos da loja própria.
4. **Uma campanha nova, se a auditoria mostrar espaço**: a candidata natural é Busca em espanhol para o público argentino/chileno (o maior nos lembretes), por rota. Só com verba remanejada ou adicional que o irmão decidir.
5. Textos rascunhados por IA e revisados; peças (imagens/vídeos) geradas por IA com os conectores disponíveis; entrega em arquivo de importação do **Google Ads Editor** (gratuito). O Adspirer Free (15 tarefas/mês, dados puxados uma vez) serve só para a auditoria inicial, se quiserem conectar a conta; senão, a auditoria é feita com acesso de leitura à conta (o irmão exporta os relatórios ou dá acesso de visualização).

Quando começa: a auditoria (item 1) pode começar **antes** do site novo, porque é só leitura; os itens 3 e 4 esperam o lançamento.

---

## 13. Próximos passos imediatos (atualizado em 2026-10-09)

**Você (dono) faz**
1. Compartilha a página do plano com o sócio (menu Share da página).
2. Confere o plano da Vercel (Hobby ou Pro) e, se Hobby, faz a troca para Pro no painel (US$ 20/mês).
3. Abre o cadastro no Mercado Pago com o CNPJ 17.427.292/0001-46 e conta bancária da empresa; eu guio passo a passo. Em paralelo, cadastro na Stripe (reserva), que pede aprovação prévia para "serviços de transporte".
4. Sobe o porte do Supabase para Small no painel (Settings → Compute), de preferência fora do horário comercial; leva alguns minutos de indisponibilidade.
5. Pede ao irmão acesso de leitura à conta do Google Ads (ou exportação das 3 campanhas) para a auditoria.
6. Envia quando tiver: número CADASTUR, regra do adicional por passageiro.

**Eu faço (semana 1)**
7. Figma das 4 telas (home, produto, checkout, confirmação) e página HTML das mesmas telas para ver no celular.
8. Tabelas da loja no Supabase (`produtos`, `pedidos`, `pedido_itens`, `pedido_eventos`, `gateway_eventos`) com RLS, em migration versionada.
9. Importação dos 46 produtos e das imagens para `produtos` e Storage.
10. Pacote de manutenção do Supabase (limpeza do pg_net, índice duplicado, índices nas chaves estrangeiras usadas, correção do `CLAUDE.md`), **só depois do seu "pode" explícito**, porque mexe no banco de produção compartilhado com o PWA e o app.
