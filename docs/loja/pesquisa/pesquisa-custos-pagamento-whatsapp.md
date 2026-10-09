# Pesquisa de custos — Pagamento online e mensageria WhatsApp para a loja Água Verde Transfers

**Data da pesquisa:** 8 de outubro de 2026
**Contexto:** site Next.js 15 na Vercel + Supabase Pro (já pago); ticket médio R$ 180–700; 40–150 vendas/mês; clientes brasileiros e estrangeiros (muitos hispanofalantes); teto de custo fixo R$ 250–300/mês.
**Método:** todos os números abaixo foram lidos diretamente das páginas oficiais em 08/10/2026 (curl ou navegador headless). Quando o número não existe publicamente, está marcado como **não publicado**. Conversões cambiais usam PTAX de venda do Banco Central: **USD = R$ 5,0119 (08/10/2026)**; **EUR ≈ R$ 5,60 (05/10/2026)** — fonte: API PTAX do BCB (`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/`).

---

## PARTE A — Gateways de pagamento no Brasil

### A.1 Tabela-resumo (taxas padrão publicadas, outubro/2026)

| Item | Mercado Pago (Checkout Pro / Bricks / Transparente) | Stripe Brasil | Pagar.me (Stone) — oferta Essencial | Asaas | PagBank (PagSeguro) — "Vendas pela internet" |
|:--|:--|:--|:--|:--|:--|
| **Mensalidade / adesão** | R$ 0 (não há item de mensalidade na tabela de custos) [1] | R$ 0 — "A Stripe não cobra tarifas de configuração nem mensalidades" [2] | R$ 0 — "Mensalidade grátis" [3] | R$ 0 — "não há mensalidade ou taxa de adesão" [4] | R$ 0 para vender online (página não lista mensalidade; conta PagBank cobra R$ 75/mês só se ficar 360 dias sem movimentar) [5] |
| **Pix** | **0,99%** (na hora) [1] | **1,19%** por Pix pago — **"somente por convite"** [2] | **0,99%** [3] | **R$ 1,99 fixo** por transação (R$ 0,99 nos 3 primeiros meses) [4] | **Não publicado** para vendas pela internet (a tabela online só lista cartão); "Pix 0% nos primeiros 30 dias" aparece só nas tabelas de maquininha [5] |
| **Cartão de crédito nacional à vista** | **4,98% (D0)** / **4,49% (D14)** / **3,98% (D30)** [1] | **3,99% + R$ 0,39** por transação [2] | **4,19%** (recebimento D+1) [3] | **2,99% + R$ 0,49** (1,99% + R$ 0,49 nos 3 primeiros meses) [4] | **4,99% + R$ 0,40** (14 dias) / **3,99% + R$ 0,40** (30 dias) [5] |
| **Cartão parcelado (custo p/ lojista se absorver)** | Acréscimo sobre a taxa base, ex.: 2x 2,03%, 6x 8,92%, 12x 14,80% (blog oficial, com 15% de desconto para loja online) [6]; tabela do Link: 2x 2,53% … 12x 17,28% [7] | **Não publicado para o Brasil** — a documentação de parcelas da Stripe cobre só México e Japão [8] | 6x **13,63%**, 12x **20,95%** (sobre o valor total); até 21x [3] | 2–6x **3,49% + R$ 0,49**; 7–12x **3,99% + R$ 0,49**; 13–21x **4,29% + R$ 0,49** (sobre o valor total) [4] | 4,59% + R$ 0,40 (14 d) / 3,79% + R$ 0,40 (30 d) na tabela "parcelado" das maquininhas; para internet, só a taxa à vista é publicada [5] |
| **Cartão internacional (emitido fora do BR)** | **Aceita** Visa, Mastercard e Amex emitidos no exterior no Checkout Pro; a conversão é feita pelo banco emissor e o lojista recebe em reais; sem taxa adicional publicada [9] | **Aceita** Visa e Mastercard crédito emitidos fora do Brasil (Amex, Elo, Hipercard **não**); débito internacional sim, débito nacional não [10]; **+2%** sobre a taxa base "para transações com cartões internacionais" [2] | **Aceita** cartões emitidos fora do Brasil "contanto que sejam de bandeiras já aceitas", mas **só via checkout transparente/API v3+ com documento estrangeiro (passaporte)**; **link de pagamento e checkout Pagar.me não aceitam** (exigem endereço brasileiro) [11][12] | **Só com liberação prévia** (análise de até 4 dias úteis); depois, apenas cobrança avulsa ou assinatura por cartão; **sem parcelado, sem Pix/boleto, sem link de pagamento** para estrangeiros [13] | **Não publicado** (nenhuma página oficial encontrada sobre aceitação de cartão emitido no exterior no checkout online) |
| **Prazo de recebimento** | Cartão: você escolhe D0, D14 ou D30 (taxa varia); Pix na hora; boleto até 3 dias [1][14] | Repasses **sempre automáticos e diários** no Brasil [15]; prazo de liquidação (T+X) para cartão no Brasil **não publicado** na página de repasses | **Dia seguinte (D+1)** — "para novos vendedores… em alguns casos pode ser retido por até 30 dias por questões de análise" [3] | Cartão: antecipação à vista grátis, "recebimento em até 2 dias úteis, sujeito a análise"; prazo padrão de cartão sem antecipação **não publicado** na página de preços; Pix na hora [4] | 14 ou 30 dias (você escolhe, muda a taxa) [5] |
| **Reembolso (cancelamento até 24 h antes)** | Reembolso total ou parcial via API até **180 dias** após aprovação; exige saldo na conta [16]. **Devolução da tarifa: não publicado** | "Não há tarifas para emissão de reembolsos… As tarifas de processamento… da transação original **não são devolvidas**" [2]; Pix reembolsável até 90 dias [17] | Estorno Pix/boleto até 90 dias; **MDR devolvida proporcionalmente**; taxa de gateway/antifraude/Pix/boleto **não devolvida** [18] | Estorno via API/painel; **estorno total devolve a taxa da transação; parcial não** (artigo oficial da central de ajuda) [19] | Site: até **180 dias**; API Web: até 350 dias; Pix: 90 dias; exige saldo [20]. **Devolução da tarifa: não publicado** |
| **Cobrança em USD/EUR** | **Só BRL** — "a plataforma opera exclusivamente em reais"; o emissor estrangeiro converte [9] | **Só BRL na prática**: "transações de pagamentos internacionais e atividades de câmbio são restritas para contas Stripe Brasil… conversões de moedas serão recusadas"; exceção apenas para cartões Visa/Master emitidos fora do BR cobrados em BRL [21]; Pix/boleto liquidam só em BRL [22] | **Só BRL** (não há documentação de cobrança em moeda estrangeira; o DCC existe só na maquininha Stone) [12] | **Só BRL** (cliente estrangeiro paga em cartão internacional, cobrança em reais) [13] | **Só BRL** (não publicado nada diferente) |
| **Antifraude incluso?** | **Sim** — "Segurança e proteção anti-fraude" e 3DS integrados no checkout [1][9] | **Sim** — Radar incluído no preço padrão ("Radar Lite" / "Prevenção contra fraudes integrada"); Radar for Fraud Teams é à parte [2] | **Sim** — "Processamento das vendas e Antifraude Stone sem custos" [3] | **Sim** — "Sistema antifraude" na lista de serviços gratuitos [4] | **Não publicado** na página de taxas (a API tem 3DS opcional) [23] |
| **Integração** | SDK Node.js oficial + `@mercadopago/sdk-js` no front [24]; webhooks [25]; Checkout Pro, Bricks e API; **contas de teste** (até 15) e cartões de teste [26]; link de pagamento sem código [7] | SDK Node oficial, Checkout hospedado, Payment Links sem código (incluso) [2], webhooks, modo de teste padrão da Stripe | API v5 (mesma URL para teste e produção; chaves `sk_test_`), conta de testes gratuita [27]; SDK Node.js oficial no GitHub [28]; webhooks [29]; link de pagamento | API REST com **sandbox** dedicado e webhooks documentados [30]; checkout transparente, link de pagamento, split | API Orders/Checkout PagBank com **sandbox** `https://sandbox.api.pagseguro.com/` [31]; Checkout hospedado + webhooks [23] |
| **Cadastro / restrições** | CPF ou CNPJ; termos exigem que a atividade declarada seja a praticada; **Programa de Proteção ao Vendedor cobre só bens tangíveis — serviços/intangíveis ficam fora** (chargeback é debitado do vendedor) [32] | CPF (Pessoa Física) ou CNPJ; representante legal com CPF residente no Brasil; conta bancária em BRL no mesmo CPF/CNPJ [33]. **"Hotéis, agências de viagem e serviços de transporte" estão na lista de atividades RESTRITAS no Brasil (R = exige aprovação prévia)** [34] | "é necessário ter um CNPJ ou MEI ativo" [35]; sem restrição publicada a turismo | CPF ou CNPJ (página de preços cita PF e PJ); sem restrição publicada a turismo | Conta tipo Vendedor com documentação validada para estornar [20]; sem restrição publicada a turismo |

**Fontes (Parte A):**
[1] https://www.mercadopago.com.br/ferramentas-para-vender/check-out (tabela "Escolha como cobrar": Crédito na hora 4,98% / 14 dias 4,49% / 30 dias 3,98%; Pix 0,99%; Boleto R$ 3,49)
[2] https://stripe.com/br/pricing (3,99% + R$ 0,39 cartões nacionais; +2% internacionais; Pix 1,19% por convite; Boleto R$ 3,45; contestação R$ 55; FAQ reembolsos e mensalidade)
[3] https://pagar.me/ofertas (Essencial: Pix 0,99%, à vista 4,19%, 6x 13,63%, 12x 20,95%, D+1, mensalidade grátis, antifraude sem custo; Flex: taxas customizadas)
[4] https://www.asaas.com/precos-e-taxas
[5] https://pagseguro.uol.com.br/para-seu-negocio/taxas-e-tarifas (seção "Vender pela internet": 14 dias 4,99% + R$ 0,40; 30 dias 3,99% + R$ 0,40)
[6] https://www.mercadopago.com.br/blog/quanto-custa-vender-on-line-com-mercado-pago
[7] https://www.mercadopago.com.br/ferramentas-para-vender/link-de-pagamento (simulador: na hora 4,98%, 14 dias 4,48%, 30 dias 3,99%; Pix 0,99%; tabela de parcelas)
[8] https://docs.stripe.com/payments/installments (só Mastercard Installments, México e Japão)
[9] https://www.mercadopago.com.br/blog/aceitar-cartao-internacional-e-commerce
[10] https://support.stripe.com/questions/accepted-payment-methods-in-brazil
[11] https://pagarme.helpjuice.com/pt_BR/sobre-o-pagarme/o-pagarme-aceita-cart%C3%B5es-emitidos-no-exterior
[12] https://pagarme.helpjuice.com/pt_BR/p1-transa%C3%A7%C3%B5es-e-estornos/transa%C3%A7%C3%A3o-como-criar-transa%C3%A7%C3%B5es-internacionais
[13] https://central.ajuda.asaas.com/hc/pt-br/articles/31972902909851-Como-criar-cobran%C3%A7as-para-clientes-estrangeiros-ou-que-tenham-cart%C3%B5es-emitidos-no-exterior
[14] https://empreendedores.mercadopago.com.br/qual-e-o-prazo-de-recebimento-do-link-de-pagamento-mercado-pago
[15] https://docs.stripe.com/payouts ("Brasil e Índia: os repasses são sempre automáticos e diários")
[16] https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-settings/refunds-and-cancellations
[17] https://docs.stripe.com/payments/pix
[18] https://pagarme.helpjuice.com/pt_BR/estorno-de-vendas-como-funciona-prazos-e-principais-duvidas
[19] https://central.ajuda.asaas.com/hc/pt-br/articles/53120539626139-Como-estornar-um-pagamento-feito-por-cart%C3%A3o-de-cr%C3%A9dito
[20] https://faq.pagbank.com.br/duvida/quais-sao-as-regras-de-cancelamento-de-uma-venda/2256
[21] https://support.stripe.com/questions/transaction-declined-stripe-brazil-accounts
[22] https://support.stripe.com/questions/how-to-enable-pix-as-a-payment-method-in-brazil
[23] https://developer.pagbank.com.br/docs/introducao
[24] https://www.mercadopago.com.br/developers/pt/docs/sdks-library/landing
[25] https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
[26] https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/accounts
[27] https://docs.pagar.me/docs/quickstart-pagarme
[28] https://github.com/pagarme/pagarme-nodejs-sdk
[29] https://docs.pagar.me/reference/webhooks
[30] https://docs.asaas.com/docs/sandbox e https://docs.asaas.com/docs/webhooks
[31] https://developer.pagbank.com.br/docs/ambientes-disponiveis
[32] https://www.mercadopago.com.br/blog/como-funciona-protecao-vendedor-contestacao (e termos em https://www.mercadopago.com.br/ajuda/programa-protecao-vendedor_527)
[33] https://support.stripe.com/questions/brazil-specific-information-to-open-a-stripe-account
[34] https://stripe.com/br/legal/restricted-businesses (tabela "Atividades proibidas em jurisdições específicas": "Hotéis, agências de viagem e serviços de transporte — R")
[35] https://pagar.me/ (FAQ "O que eu preciso para vender online com a Stone?")

### A.2 Custo variável por venda (ticket de R$ 400, cartão à vista, prazo mais barato publicado)

| Gateway | Pix | Cartão nacional à vista | Cartão internacional | Média 50% Pix / 50% cartão nacional |
|:--|--:|--:|--:|--:|
| Mercado Pago (D30) | R$ 3,96 (0,99%) | R$ 15,92 (3,98%) | R$ 15,92 (sem adicional publicado) | **R$ 9,94** |
| Mercado Pago (D0) | R$ 3,96 | R$ 19,92 (4,98%) | R$ 19,92 | R$ 11,94 |
| Stripe | R$ 4,76 (1,19%, se convidado) | R$ 16,35 (3,99% + 0,39) | R$ 24,35 (5,99% + 0,39) | R$ 10,56 |
| Pagar.me Essencial | R$ 3,96 (0,99%) | R$ 16,76 (4,19%) | R$ 16,76 (só via API transparente) | R$ 10,36 |
| Asaas (após 3 meses) | R$ 1,99 | R$ 12,45 (2,99% + 0,49) | R$ 12,45 (com liberação prévia; sem Pix/link) | **R$ 7,22** |
| PagBank (30 dias) | não publicado | R$ 16,36 (3,99% + 0,40) | não publicado | — |

**Mercado Pago vs. Stripe para cartão internacional:** MP cobra a mesma taxa do nacional (nenhum adicional publicado) e aceita Amex; Stripe soma +2% e não aceita Amex/Elo/Hipercard nem débito nacional, e o segmento "agências de viagem e serviços de transporte" é restrito (aprovação prévia). **Pagar.me vs. Stripe:** Pagar.me aceita cartões estrangeiros apenas na integração transparente (passaporte como documento), sem adicional publicado; Stripe aceita no checkout hospedado, mas com +2% e Pix só por convite.

---

## PARTE B — WhatsApp Cloud API (Meta) e alternativas, outubro/2026

### B.1 Preço por mensagem no Brasil (rate card oficial, vigente desde 1º/10/2026)

| Categoria | BRL (conta faturada em reais) | USD (conta em dólar) | Quando se aplica |
|:--|--:|--:|:--|
| **Marketing** | **R$ 0,3217** | US$ 0,0625 | Template promocional, a qualquer momento |
| **Utility (utilidade)** | **R$ 0,035** | US$ 0,0068 | Template transacional (confirmação de pedido, voucher, lembrete). **Desde 1º/10/2026 é cobrada também quando enviada dentro da janela de 24 h** (era grátis desde jul/2025) |
| **Authentication** | **R$ 0,035** | US$ 0,0068 | Template OTP; tarifa internacional "n/a" para o Brasil |
| **Service (serviço)** | **R$ 0,035** após a franquia | US$ 0,0068 | Mensagem livre (sem template) em resposta ao cliente na janela de 24 h. **1.000 mensagens de serviço grátis por mês por número**; cobra a partir da 1.001ª (regra desde 1º/10/2026) |
| Meta Business Agent | US$ 2,00 por 1 M tokens (~4–5 ¢/msg) | idem | Agente de IA da Meta (não necessário) |

- Níveis de volume para utility/authentication no Brasil: faixa 0–250.000 msgs/mês = taxa de lista (R$ 0,035); não há desconto no volume da Água Verde.
- **Mensagens gratuitas:** (a) todas as categorias dentro da **janela de ponto de entrada gratuito (72 h)** aberta por anúncio "clique para WhatsApp" ou botão de CTA de Página do Facebook; (b) as **1.000 primeiras mensagens de serviço/mês por número**. Mensagens do usuário para a empresa nunca são cobradas.
- **Janela de 24 h:** aberta/renovada a cada mensagem do cliente; só dentro dela a empresa pode mandar texto livre; fora dela, só templates aprovados.
- **Templates para confirmação de pedido e voucher:** categoria **utility** ("mensagens de modelo para objetivos informativos ou de transação", acionadas por ação do usuário como fazer um pedido ou pagamento). Precisam de aprovação prévia da Meta e devem existir em cada idioma (pt_BR, es, en). Voucher pode ir como template utility com cabeçalho de documento (PDF).
- **Faturamento local em BRL:** desde 16/07/2026 qualquer empresa integrada diretamente pode criar conta de mensagens em BRL, faturada pela Facebook Brasil.
- A Meta só altera preços no 1º dia de cada trimestre.

**Fontes (B.1):**
- Rate cards oficiais (planilhas "Taxas da lista em BRL/USD" e "Níveis de volume em BRL/USD", efetivas 1º/10/2026), linkadas em https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing (seção "Tabelas de taxas e níveis de volume") — linha "Brazil | BRL | 0.3217 | 0.035 | 0.035 | n/a | 0.035".
- Regras de cobrança, janela de 24 h, FEP de 72 h, franquia de 1.000 serviços/mês, localização de cobrança no Brasil: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing (atualizada em 30/09/2026).
- Mudanças de 1º/10/2026 (cobrança de serviço e de utility dentro da janela): https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages (atualizada em 28/09/2026).
- Página comercial com seletor de mercado/moeda: https://business.whatsapp.com/products/platform-pricing

### B.2 Comparativo de provedores

| Provedor | Tipo | Mensalidade | Custo por mensagem | Observações | Fonte |
|:--|:--|--:|:--|:--|:--|
| **Meta Cloud API (direto)** | Oficial | R$ 0 | Tarifas da Meta acima (utility R$ 0,035) | A Água Verde **já tem** integração direta (Edge Functions `enviar-whatsapp-lembrete`, `whatsapp-webhook`, `responder-whatsapp`), templates aprovados e número em modo Coexistência. Custo marginal da loja é só o das mensagens. | https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing |
| **Twilio WhatsApp** | Oficial (BSP) | R$ 0 | **US$ 0,005/msg** (≈ R$ 0,025) de Twilio, entrada ou saída, **+ tarifas da Meta repassadas** sem markup; US$ 0,001 por mensagem com falha | Faturamento em USD; "Pricing current as of September 2026" | https://www.twilio.com/en-us/messaging/channels/whatsapp/pricing |
| **360dialog** | Oficial (BSP) | **€ 49/número/mês** (Regular, ≈ R$ 274) · € 99 (Premium) · € 500 (Scale) | Tarifas da Meta, sem markup ("+Meta WhatsApp Messaging Fees") | Plano Regular inclui suporte 24/7 e integrações n8n/Make; ultrapassa sozinho ~o teto de custo fixo | https://www.360dialog.com/pricing |
| **Z-API** | **Não oficial** (via WhatsApp Web) | **R$ 99,99/mês por instância** (Ultimate; 10% off no anual); Partner a partir de R$ 89,99 com 10+ instâncias | **R$ 0** por mensagem ("sem custo por mensagem") | O próprio site diz que é "alternativa de mercado" à API oficial, sem aprovação de templates; 2 dias de teste grátis. Risco de bloqueio do número por violar os termos do WhatsApp (não há garantia da Meta). | https://www.z-api.io/#planos |
| **Evolution API (self-host)** | Software open source; conecta via **Baileys (não oficial)** ou **Cloud API oficial** | **R$ 0 de licença** (Apache 2.0 + 2 condições: manter logo/copyright no front e exibir aviso de uso) + custo do seu servidor (VPS + Postgres + Redis — não levantado aqui) | Baileys: R$ 0; Cloud API: tarifas da Meta | Exige operar e manter servidor; útil se quiser inbox/CRM próprio (Chatwoot, Typebot). Para transacional, o modo Baileys tem o mesmo risco do Z-API. | https://github.com/evolution-foundation/evolution-api (README e LICENSE) |

---

## PARTE C — Infraestrutura adicional da loja

### C.1 Vercel — Hobby vs. Pro (preços em USD, sem impostos)

| Item | Hobby (US$ 0) | Pro (US$ 20/mês por seat ≈ R$ 100) |
|:--|:--|:--|
| **Uso comercial** | **Proibido**: "Our Hobby plan is for personal, non-commercial use" (FAQ) e docs: "restricts users to non-commercial, personal use only" → uma loja que cobra **precisa de Pro** | Permitido; inclui **US$ 20 de crédito de uso/mês**, Flat Rate CDN, spend management, domínio custom grátis |
| Fast Data Transfer | 100 GB/mês | 1 TB/mês incluído (acima: US$ 0,15/GB) |
| CDN Requests | 1 M/mês | 10 M/mês incluído |
| Function Invocations | 1 M/mês | 1 M/mês incluído, depois US$ 0,60/M |
| Active CPU / Provisioned Memory | 4 CPU-h / 360 GB-h | 5 CPU-h / 420 GB-h incluído (overage US$ 0,128/h e US$ 0,0212/GB-h) |
| Image Transformations | 5.000/mês | 5.000/mês incl., depois US$ 0,05/1k |
| Duração máxima de função | 300 s | 300 s padrão, até 800 s |
| Tamanho de função | 250 MB descompactado (até 5 GB "large functions", beta) | idem |
| Excedente | Sem overage: recurso pausa até 30 dias | Pay-as-you-go, com orçamento padrão de US$ 200 e pausa automática opcional |

Fontes: https://vercel.com/pricing · https://vercel.com/docs/plans/hobby · https://vercel.com/docs/functions/limitations

Para 50–150 vendas/mês o consumo (algumas centenas de chamadas de função, poucos GB de transferência) fica muito abaixo dos limites do Pro; o custo prático é o fixo de US$ 20.

### C.2 Supabase Pro (já pago — US$ 25/mês) — o que a loja consome a mais

| Recurso | Incluído no Pro | Consumo estimado da loja (150 vendas/mês) | Custo adicional |
|:--|:--|:--|--:|
| Edge Function invocations | 2 M/mês (depois US$ 2/M) | < 5.000 (webhooks de pagamento, envio de WhatsApp/e-mail, geração de voucher) | R$ 0 |
| Egress | 250 GB (+ 250 GB cached); depois US$ 0,09/GB | poucos GB (PDFs de ~100–300 KB × 150) | R$ 0 |
| File storage | 100 GB (depois US$ 0,0213/GB) | < 1 GB/ano de vouchers | R$ 0 |
| Database disk | 8 GB (depois US$ 0,125/GB) | tabelas `pedidos`/`orcamentos_site` com milhares de linhas = MB | R$ 0 |
| MAU (auth) | 100.000 | passageiros não autenticados (token) | R$ 0 |
| Realtime | 500 conexões / 5 M msgs | irrelevante | R$ 0 |
| Compute | crédito de US$ 10 cobre Micro (1 GB) | o mesmo projeto | R$ 0 |

Fonte: https://supabase.com/pricing. O spend cap vem ligado por padrão no Pro.

### C.3 Resend (e-mail transacional)

| Plano | Preço | Inclui | Limites |
|:--|--:|:--|:--|
| **Free** | US$ 0 | **3.000 e-mails/mês**, **100/dia**, 3 domínios, retenção 30 dias, webhooks, React Email | Sem overage (precisa migrar de plano) |
| Pro | US$ 20/mês (≈ R$ 100) | 50.000 e-mails/mês, 10 domínios, sem limite diário | Excedente US$ 0,90 por 1.000 |
| Scale | US$ 90/mês | 100.000 e-mails/mês, 1.000 domínios | idem |

Fonte: https://resend.com/pricing. Com 150 vendas × ~3 e-mails (confirmação, voucher, lembrete) = ~450/mês e no máximo ~15/dia → **plano Free basta**.

### C.4 Geração de PDF do voucher (opções gratuitas)

| Opção | Licença/custo | Como roda | Observação |
|:--|:--|:--|:--|
| **`@react-pdf/renderer`** | MIT (gratuito) | Node (Route Handler/Edge Function); renderiza JSX → PDF sem navegador | Melhor para layout de voucher com logo/QR; bundle pequeno |
| **`pdf-lib`** | MIT (gratuito) | Node/Edge; cria/edita PDFs a partir de template | Ideal para preencher um PDF-modelo já desenhado |
| **Puppeteer + `@sparticuz/chromium-min`** | Open source (gratuito) | Função Vercel (Node) com HTML → PDF | Precisa caber nos 250 MB; guia oficial da Vercel recomenda `puppeteer-core` + `chromium-min` |
| Armazenamento | Supabase Storage (incluído no Pro) | bucket privado + URL assinada no WhatsApp/e-mail | custo zero no volume previsto |

Fontes: https://github.com/diegomura/react-pdf (LICENSE MIT) · https://github.com/Hopding/pdf-lib (LICENSE MIT) · https://vercel.com/kb/guide/deploying-puppeteer-with-nextjs-on-vercel · https://vercel.com/docs/functions/limitations

### C.5 Tabela "custo mensal estimado" — 50, 100 e 150 vendas/mês

Premissas: ticket médio R$ 400; mix 50% Pix / 50% cartão à vista; por venda, **3 mensagens utility** no WhatsApp (confirmação, voucher, lembrete D-1) + respostas de serviço dentro da franquia gratuita; 3 e-mails por venda; câmbio PTAX de 08/10/2026 (US$ 1 = R$ 5,01).

| Linha de custo | 50 vendas | 100 vendas | 150 vendas | Fonte |
|:--|--:|--:|--:|:--|
| **CUSTOS FIXOS** | | | | |
| Vercel Pro (obrigatório p/ uso comercial) | R$ 100 | R$ 100 | R$ 100 | vercel.com/pricing |
| Supabase Pro (já pago; adicional da loja) | R$ 0 | R$ 0 | R$ 0 | supabase.com/pricing |
| Resend Free | R$ 0 | R$ 0 | R$ 0 | resend.com/pricing |
| Gateway (mensalidade, qualquer um dos 5) | R$ 0 | R$ 0 | R$ 0 | tabela A.1 |
| WhatsApp Cloud API direto (mensalidade) | R$ 0 | R$ 0 | R$ 0 | Meta |
| PDF (libs MIT) | R$ 0 | R$ 0 | R$ 0 | GitHub |
| **Subtotal fixo** | **R$ 100** | **R$ 100** | **R$ 100** | dentro do teto de R$ 250–300 |
| *(alternativas fixas, se escolhidas)* Z-API | +R$ 100 | +R$ 100 | +R$ 100 | z-api.io |
| *(alternativa)* 360dialog Regular | +R$ 274 | +R$ 274 | +R$ 274 | 360dialog.com/pricing |
| *(alternativa)* Resend Pro | +R$ 100 | +R$ 100 | +R$ 100 | resend.com/pricing |
| **CUSTOS VARIÁVEIS** | | | | |
| WhatsApp — 3 utility/venda × R$ 0,035 | R$ 5,25 | R$ 10,50 | R$ 15,75 | rate card BRL |
| WhatsApp via Twilio (adicional US$ 0,005/msg) | +R$ 3,76 | +R$ 7,52 | +R$ 11,28 | twilio.com |
| Gateway — Mercado Pago D30 (R$ 9,94/venda) | R$ 497 | R$ 994 | R$ 1.491 | mercadopago.com.br |
| Gateway — Mercado Pago D0 (R$ 11,94/venda) | R$ 597 | R$ 1.194 | R$ 1.791 | idem |
| Gateway — Stripe (R$ 10,56/venda; +R$ 8/venda se cartão internacional) | R$ 528 | R$ 1.056 | R$ 1.584 | stripe.com/br/pricing |
| Gateway — Pagar.me Essencial (R$ 10,36/venda) | R$ 518 | R$ 1.036 | R$ 1.554 | pagar.me/ofertas |
| Gateway — Asaas (R$ 7,22/venda) | R$ 361 | R$ 722 | R$ 1.083 | asaas.com/precos-e-taxas |
| **TOTAL (Vercel Pro + MP D30 + Meta direto + Resend Free)** | **≈ R$ 602** (R$ 100 fixo + R$ 502 variável sobre R$ 20.000 de GMV = 2,5%) | **≈ R$ 1.105** (sobre R$ 40.000 = 2,8%) | **≈ R$ 1.607** (sobre R$ 60.000 = 2,7%) | — |

Observação: o custo variável do gateway é descontado do valor recebido, não é desembolso. Se o mix pender para Pix (clientes brasileiros), o custo cai para ~1% do GMV; se pender para cartão internacional (estrangeiros), fica em ~4% (MP) ou ~6% (Stripe).

---

## Recomendação final — Gateway

**Mercado Pago (Checkout Pro para lançar; migrar para Checkout Bricks quando quiser o pagamento dentro do site), com recebimento em 30 dias para cartão (3,98%) e Pix (0,99%).**

1. É o único dos cinco que, em página oficial, **aceita Visa, Mastercard e Amex emitidos no exterior no checkout pronto, sem adicional publicado e sem cadastro prévio do cliente** — decisivo para os passageiros hispanofalantes; Stripe cobra +2%, exclui Amex e trata "agências de viagem e serviços de transporte" como atividade restrita; Pagar.me só aceita estrangeiro via API transparente com passaporte; Asaas exige liberação prévia e perde Pix/parcelado/link.
2. **Custo fixo zero** e variável competitivo (R$ 9,94/venda no ticket de R$ 400, mix 50/50), com Pix a 0,99% para incentivar o cliente brasileiro e parcelamento em até 12x com custo publicado se a loja quiser absorver.
3. **Antifraude + 3DS inclusos**, SDK Node.js oficial, webhooks, contas/cartões de teste e link de pagamento sem código — compatível com Next.js 15 + Edge Functions já usadas no ecossistema.
4. Reembolso total/parcial por API em até 180 dias cobre a regra de cancelamento até 24 h antes; o ponto fraco (devolução da tarifa não publicada e Programa de Proteção ao Vendedor não cobrir serviços) se mitiga com 3DS e preferência por Pix.
5. Asaas é o mais barato por venda (R$ 7,22) e vale como **plano B para clientes brasileiros**, mas falha justamente no público estrangeiro; Stripe fica como opção futura caso a empresa abra entidade fora do Brasil para cobrar em USD/EUR — nenhum gateway brasileiro pesquisado cobra em moeda estrangeira.

## Recomendação final — Mensageria

**Continuar na WhatsApp Cloud API da Meta, integrada diretamente (como já está no PWA), com conta de mensagens faturada em BRL.** Custo marginal da loja: ~R$ 0,105 por venda (3 templates utility a R$ 0,035) — R$ 5 a R$ 16/mês no volume previsto — mais zero de mensalidade. Criar templates **utility** multilíngues (pt_BR / es / en) para "pedido confirmado", "voucher" (com PDF anexo) e "lembrete D-1", reaproveitando o webhook e a janela de 24 h já implementados; manter marketing (R$ 0,32/msg) só para campanhas opt-in. Desde 1º/10/2026 as utility dentro da janela e as mensagens de serviço acima de 1.000/mês passaram a ser cobradas — ainda assim irrelevante nesse volume. **Não** adotar Z-API/Evolution-Baileys para confirmação de pedido (risco de bloqueio do número, sem garantia da Meta); 360dialog (€ 49/mês) e Twilio (+US$ 0,005/msg em dólar) só agregariam custo a uma integração que a empresa já possui.
