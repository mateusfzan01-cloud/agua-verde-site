# Plano: do pagamento no site até a reserva no PWA e no app nativo

> Data: 2026-10-19 · Revisado e **aprovado pelo dono em 2026-10-21** depois de 4 rodadas de perguntas (decisões na §5) · Autor: Claude Code com Mateus Zanlorenzi
> Complementa o `PLANO_LOJA_PROPRIA_V1.md` (§4.1, §4.5, §4.7, decisões 22, 23, 25, 39 a 42 e 36). Tudo o que está em "O que já existe" foi conferido lendo o código dos três repositórios em 2026-10-19: `agua-verde-site` (branch `claude/loja-codigo-b`), `agua-verde-app` (PWA) e `appnativo-aguaverde` (app). Nada foi presumido.

---

## 0. Resumo em um minuto

O caminho "cliente paga → viagem aparece no PWA e no app" **já funciona no banco**: o webhook do gateway chama `confirmar_pedido`, que marca o pedido como pago e cria uma viagem por trecho com fornecedor "Agua Verde". Essa viagem aparece na lista de viagens do PWA e do app sem nenhuma mudança neles, porque é uma linha normal de `viagens`.

O que **falta** é o que acontece em volta disso:

1. **Ninguém da equipe é avisado** quando um pedido é pago (sem alerta, sem push, sem e-mail). Hoje o primeiro sinal seria o alerta "viagem sem motorista", que só roda a cada 2 horas e só para viagens de hoje e amanhã.
2. **A viagem nasce incompleta**: número de passageiros fica 1, o voo vai só para o campo de observações (então o lembrete do WhatsApp usa o modelo "sem voo"), e o idioma do cliente é deduzido pelo telefone em vez de usar o que ele escolheu no site.
3. **O passageiro não recebe nada** (voucher, link de acompanhamento): a função de envio existe, mas está vazia.
4. **Não existe tela "Pedidos do site"** no PWA nem no app (decisão 25), e **a equipe não tem como reembolsar** pelo PWA: a função de reembolso só pode ser chamada pelo servidor do site.
5. **Cancelar a viagem no PWA não cancela o pedido**: o cliente continuaria "pago".
6. **Os provedores de pagamento mudaram**: o código pronto é do Mercado Pago, mas a decisão é **Stripe (cartão) + Woovi (Pix)**; nunca existiu conta do Mercado Pago.

Este plano fecha essas lacunas em duas trilhas paralelas (§4), dentro das semanas 3 e 4 do cronograma original (27/10 a 07/11). Nenhuma etapa altera tabela, gatilho ou função que o PWA e o app já usam; o único toque em código compartilhado (idioma do lembrete) foi autorizado pelo dono e está marcado.

---

## 1. O que já existe (fatos verificados)

### 1.1 No site (`agua-verde-site`, branch `claude/loja-codigo-b`)

| Peça | Onde | O que faz |
|:--|:--|:--|
| Fluxo do pedido | `src/lib/loja/fluxo.ts` | `iniciarPagamento`, `processarWebhook`, `estadoDoPedido`, `cancelarPedido`, `reenviarVoucher`, `pedirLinkDaReserva` |
| Interface do gateway | `src/lib/loja/pagamento/gateway.ts` | `criarCobranca`, `consultarPagamento`, `reembolsar`, `validarWebhook` |
| Mercado Pago | `src/lib/loja/pagamento/mercadopago.ts` + `src/app/api/loja/webhook/mercadopago/route.ts` | implementado e testado; **nunca houve conta**; fica **dormente** (decisão 40) |
| Repositório | `src/lib/loja/repositorio-supabase.ts` | grava pedidos e chama as funções SQL com a chave de serviço |
| Ligação das peças | `src/lib/loja/servicos.ts` | escolhe memória ou Supabase, simulado ou Mercado Pago. `enviarLinkDaReserva` **só escreve no log** |
| Checkout | `src/components/loja/CheckoutEmPassos.tsx` | nome, WhatsApp com DDI, e-mail, voo, hotel/endereço, observações, CPF opcional. **Não pede número de passageiros nem malas** (a seleção do produto tem `pessoas` ou `veiculos`) |
| Catálogo | `tipos_veiculo.pax_max` | capacidade de cada veículo (serve para validar o número de passageiros) |

### 1.2 No banco (migrations da loja, aplicadas em 17/10/2026)

- `confirmar_pedido(pedido, gateway_ref)`, `SECURITY DEFINER`, só `service_role`: exige evento aprovado em `gateway_eventos`, marca `pedidos.status = 'pago'`, cria **uma viagem por trecho** com: nome, telefone, e-mail, origem, destino, data e hora (08:00 se "a combinar"), `status 'pendente'`, valor rateado, `moeda 'BRL'`, `numero_reserva = AV-2026-000NNN`, `observacoes` = "Pedido AV-… (loja do site) | Endereço: … | Voo: … | observações do cliente", `fornecedor_id` do "Agua Verde". Grava `pedido_itens.viagem_id` e um `pedido_eventos` tipo `'pago'`.
- `reembolsar_pedido(pedido, motivo)`, só `service_role`: marca `reembolsado` e **cancela as viagens do pedido que ainda estão `pendente` ou `vinculada`**.
- `reserva_por_token`, `expirar_pedidos_pendentes` (cron **ainda não agendado**), `proximo_numero_pedido`.
- RLS: `pedidos`, `pedido_itens`, `pedido_eventos`, `gateway_eventos` têm **leitura para admin/gerente** (`is_admin_or_gerente()`); nenhuma escrita por usuário.
- `pedidos.status` aceita hoje: `pendente_pagamento`, `pago`, `cancelado`, `reembolsado`, `expirado`. O Pix manual (decisão 41) pede um status a mais, `reembolso_pendente`.
- `gateway_eventos.evento_id` é a chave primária **sozinha**. Com dois provedores ela vira `(gateway, evento_id)` (§4.7 do plano principal), na **primeira** migration deste plano.
- Decisão 36: passeios **não** passam mais por "aguardando confirmação"; pagou, está garantido.

### 1.3 Gatilhos de `viagens` que já reagem ao INSERT da loja

| Gatilho / rotina | Efeito para a viagem da loja |
|:--|:--|
| `gerar_token_cliente` | cria o `token_cliente` → link `app.aguaverde.tur.br/acompanhar/<token>` (a página da reserva já o usa) |
| normalização de telefone (E.164) | telefone fica com `+` e DDI, como o PWA espera |
| auditoria `viagens_alteracoes_auditoria` | registra a criação |
| `on_viagem_insert_notification` → `notify_motorista_nova_viagem` | **não faz nada** (só dispara se `motorista_id` vier preenchido) |
| cron `verificar_viagens_sem_motorista` (a cada 2 h, 6h–22h) | cria alerta `sem_motorista` se a viagem for de hoje ou amanhã |
| lembrete WhatsApp (`enviar-whatsapp-lembrete`) | manda o lembrete X horas antes; idioma **deduzido pelo telefone** (`detectarIdioma`); modelo "com voo" só se `viagens.voo_numero` estiver preenchido |
| lembrete de avaliação pós-viagem | funciona igual às outras viagens |

### 1.4 No PWA (`agua-verde-app`)

- `/viagens` e `/viagens/:id` mostram a viagem normalmente, com `numero_reserva`, fornecedor, observações, quantidade de passageiros. **Nada a fazer para ela aparecer.**
- Alertas: `Alertas.jsx` e `AlertasPanel.jsx` já sabem desenhar o tipo `nova_viagem` (ícone, cor), mas **nenhum gatilho ou função insere esse tipo hoje**. A automação de e-mails só cria alertas de `modificacao`.
- RLS de `alertas`: INSERT direto por usuário é negado; só funções `SECURITY DEFINER` inserem (regra do hardening de 19/04/2026). `confirmar_pedido` é `SECURITY DEFINER`, então pode inserir.
- Push para a equipe: existe o padrão em `supabase/functions/whatsapp-push-notify/index.ts` (busca `perfis` com `push_token` e preferência, manda pela API do Expo). É o molde.
- E-mail: o **Resend já está em produção** (`enviar-email-ocorrencia`, e `notificar-orcamento` no site), com `RESEND_API_KEY` nos segredos do Supabase e remetente `noreply@aguaverde.tur.br`.
- Não existe tela de pedidos nem rota `/pedidos-site`.

### 1.5 No app nativo (`appnativo-aguaverde`)

- `ViagensScreen` lista viagens por status (`pendente` incluída); `ViagemDetailScreen` mostra as seções da viagem. **Nada a fazer para ela aparecer.**
- `AlertasScreen` já desenha o tipo `nova_viagem`; `useAlertas` escuta a tabela `alertas` em tempo real.
- Push: `send-push-notification` manda para **um motorista** por vez e respeita `perfis.pref_notif_viagens`, `_lembretes`, `_cancelamentos`. **Não existe push de "viagem nova" para admin/gerente** em nenhum dos dois repositórios.
- Perfil que vai receber o push de pedido pago: **Caio Zanlorenzi, admin** (id `2c7574d6-…`), com push cadastrado e preferência "viagens" ligada. Existe também um perfil motorista com o mesmo nome, sem push; não é o alvo.

### 1.6 Provedores de pagamento (decisão 40)

| Provedor | Papel | Situação em 2026-10-21 |
|:--|:--|:--|
| **Stripe** | cartão (nacional e internacional Visa/Master) | conta criada pelo dono em **sandbox**; ativação de produção ainda não pedida; só o produto "Payments" (Invoicing fora) |
| **Woovi** | Pix | nenhuma conta ainda; sandbox separado em `app.woovi-sandbox.com`; tem API de reembolso (`POST /api/v1/charge/{id}/refund`, idempotente, valor opcional), mas o reembolso de Pix será **manual** (decisão 41) |
| Mercado Pago | nenhum | nunca houve conta; código dormente; **contingência do cartão** se a Stripe não aprovar até **15/11** |

---

## 2. Lacunas, numeradas

| # | Lacuna | Evidência |
|:--|:--|:--|
| L1 | Equipe não é avisada do pedido pago | nenhum INSERT de alerta `nova_viagem`; nenhum push para admin; `enviarLinkDaReserva` vazio |
| L2 | Viagem nasce incompleta: `quantidade_passageiros` = 1; `voo_numero`/`voo_companhia` vazios; `notificacao_idioma` vazio apesar de `pedidos.idioma` existir; endereço só em `observacoes`; bagagens não coletadas | `confirmar_pedido` (INSERT com 14 colunas); `CheckoutEmPassos.tsx` sem campos de passageiros/malas; decisão 23 previa "passageiros, malas" |
| L3 | Passageiro não recebe voucher nem link | `servicos.ts`: `enviarLinkDaReserva` só faz `console.info` |
| L4 | Sem tela "Pedidos do site" no PWA e no app; sem botão de reembolso para a equipe | decisão 25; `reembolsar_pedido` só `service_role`; `gateway.reembolsar` vive no site (Next.js) |
| L5 | Cancelar a viagem no PWA/app não reflete no pedido (continua `pago`, sem reembolso) | `reembolsar_pedido` só é chamado pelo site (`cancelarPedido`, pelo cliente) ou pelo webhook de reembolso |
| L6 | Cron `loja-expirar-pedidos` não agendado | comentário na migration `loja_funcoes` |
| L7 | Chave de `gateway_eventos` sem o nome do gateway; `servicos.ts` escolhe **um** provedor para tudo | migration `loja_pedidos`; `usaMercadoPago()` |
| L8 | Adaptadores Stripe e Woovi não existem; só o do Mercado Pago, sem conta | §1.6 |
| L9 | Pix manual precisa de um status e de um botão que não existem (`reembolso_pendente`, "Marcar como reembolsado") | decisão 41 |

---

## 3. Desenho proposto (ponta a ponta)

```
Cliente paga
   │  Pix  → Woovi (QR copia-e-cola, validade = expira_em do pedido)
   │  Cartão → Stripe Checkout hospedado (só cartão, idioma do pedido, botão "Reservar")
   ▼
Webhook do provedor → processarWebhook → confirmar_pedido (SQL, uma transação)
   │  1. pedidos.status = pago (pedidos.gateway = 'stripe' | 'woovi')
   │  2. INSERT viagens (1 por trecho) — AGORA com passageiros, malas, voo, idioma     [A1]
   │  3. INSERT alertas tipo 'nova_viagem' (1 por PEDIDO, apontando para a ida)      [A2]
   │  4. INSERT pedido_eventos tipo 'pago'
   ▼
Gatilho AFTER INSERT em pedido_eventos (tipo = 'pago') → Edge Function `loja-pedido-pago`   [A2+A3]
   │  push para o admin Caio (pref_notif_viagens) + e-mail para reservas@uluwatour.tur.br
   │  e-mail ao passageiro (pt/es/en, remetente noreply@aguaverde.tur.br, responder-para reservas@uluwatour.tur.br)
   │  WhatsApp ao passageiro por template utility (quando a Meta aprovar)
   │  idempotente: grava pedido_eventos 'equipe_avisada' e 'voucher_enviado'; o cron de 15 min reenvia o que faltou
   ▼
PWA e app: a viagem já está em /viagens (hoje). Novo: bloco "Pedido do site" no detalhe da viagem,
tela "Pedidos do site", botões da equipe → POST /api/loja/admin/... no site (JWT do Supabase)       [A4, A5]
   │  Cartão: "Cancelar e reembolsar" → gateway.reembolsar (Stripe) → reembolsar_pedido → viagens canceladas
   │  Pix:    "Cancelar e marcar reembolso pendente" → status reembolso_pendente → Caio devolve no painel da Woovi
   │          → "Marcar como reembolsado" (ou webhook de reembolso da Woovi, se existir)
   │  "Só cancelar" → viagem cancelada, pedido continua pago, alerta "reembolso não feito" para o Caio
```

Por que a confirmação continua **só** em `confirmar_pedido`: é a regra do §4.7 (uma única porta), e tanto o webhook quanto a página da reserva (`estadoDoPedido`) passam por ela. Por isso os avisos nascem de um gatilho **em uma tabela nova da loja** (`pedido_eventos`), e não de um gatilho em `viagens` (compartilhada com o PWA e o app).

Por que **uma** Edge Function manda todos os avisos (equipe e passageiro): o Resend já está configurado no Supabase, o reenvio fica no cron do banco, e há um lugar só para manter. Os textos do voucher (pt/es/en) ficam na Edge Function; o site deixa de enviar e-mail, e o botão "Reenviar voucher" chama a mesma função.

Por que o reembolso do cartão fica **no site** e não numa Edge Function: a chamada ao gateway (`gateway.reembolsar`) já está implementada e testada lá, atrás da interface que serve para Stripe (e Mercado Pago, se a contingência for acionada). O PWA e o app chamam uma rota do site com o JWT do Supabase; o site valida o usuário (`supabase.auth.getUser(jwt)`) e confere `is_admin_or_gerente()` por RPC antes de agir.

Por que o Pix é **manual**: decisão do dono (41). O Caio devolve pelo painel da Woovi; o sistema só registra e cobra o fechamento. A API de reembolso da Woovi existe e fica como opção futura sem mudar o desenho.

---

## 4. Etapas, em duas trilhas paralelas

Tudo o que vem depois de `confirmar_pedido` não depende do provedor: a **Trilha A** é construída e testada com o gateway simulado; a **Trilha B** entrega os adaptadores reais. As duas se encontram na homologação (A6).

Cada etapa diz o que entrega, onde mexe, o risco para o PWA/app (regra do `CLAUDE.md` do app nativo) e o critério de pronto.

### Trilha A: depois do pagamento

#### A1 · Viagem completa (banco + checkout) — risco PWA **baixo**

- **SQL** (`CREATE OR REPLACE` de `confirmar_pedido`, migration `loja_viagem_completa`): preencher também `quantidade_passageiros`, `bagagens_grandes`, `bagagens_pequenas`, `voo_numero`, `voo_companhia`, `notificacao_idioma` (de `pedidos.idioma`: `pt`/`es`/`en`). Só colunas que já existem em `viagens`; nenhum gatilho novo nessa tabela.
- **Checkout**: campo "Quantos passageiros?" **obrigatório** (máximo = `tipos_veiculo.pax_max` do veículo escolhido; nos produtos por pessoa, vem de `selecao.pessoas`) e "Malas grandes / pequenas" **opcional**, padrão 0. Gravados em `pedidos.selecao`.
- **Lembrete WhatsApp** (código compartilhado, risco **médio**, **autorizado pelo dono**): `enviar-whatsapp-lembrete` passa a usar `viagens.notificacao_idioma` quando já estiver preenchido; senão, deduz pelo telefone como hoje. Backup do `index.ts` antes; teste com `telefone_teste` antes do deploy.
- **Pronto quando**: compra de teste gera viagem com passageiros, malas, voo nas colunas certas e idioma; `DetalheViagem` no PWA mostra os dados; `testar.mjs` atualizado.

#### A2 · Avisos para a equipe (alerta + push + e-mail) — risco PWA **baixo**

- **SQL**: `confirmar_pedido` insere em `alertas` **um** registro por pedido: `tipo 'nova_viagem'`, `viagem_id` da ida, `numero_reserva`, `mensagem` ("Pedido AV-2026-000123 pago pelo site: Maria, Aeroporto → Porto de Galinhas, 02/12 às 14:00, ida e volta"; se a hora não foi escolhida, "horário a combinar"). Passa pela RLS porque a função é `SECURITY DEFINER`. O PWA e o app **já desenham** esse tipo.
- **Gatilho novo** `AFTER INSERT ON public.pedido_eventos` com `WHEN (NEW.tipo = 'pago')`, `SECURITY DEFINER`, chamando `net.http_post` para a Edge Function `loja-pedido-pago` (molde: `notify_motorista_nova_viagem`, já com `app.settings.service_role_key`). Tabela nova, zero efeito no PWA.
- **Edge Function nova** `loja-pedido-pago` (repositório do PWA, ao lado de `whatsapp-push-notify`): lê o pedido e os itens; manda **um** push para os perfis listados no segredo `LOJA_AVISO_PUSH_PERFIS` (hoje só o admin Caio), respeitando `pref_notif_viagens` e com `viagem_id` para o deep link já existente (`navigateToViagem`, abre a viagem); manda e-mail para `reservas@uluwatour.tur.br` (Resend); grava `pedido_eventos` tipo `equipe_avisada` (se já existir, não repete).
- **Pronto quando**: compra de teste gera alerta visível no PWA e no app, push chega no celular do Caio e abre a viagem, e-mail chega em `reservas@`; repetir o evento não duplica.

#### A3 · Avisos para o passageiro (mesma Edge Function) — risco PWA **zero**

- `loja-pedido-pago` também manda ao passageiro: e-mail (pt/es/en, remetente `noreply@aguaverde.tur.br`, responder-para `reservas@uluwatour.tur.br`, com voucher em texto e botões "Ver minha reserva" e "Acompanhar viagem") e WhatsApp por template utility `loja_voucher_{pt_BR,es,en_US}` (3 templates a submeter à Meta **na semana 1**; até aprovar, só e-mail; o lançamento não espera a aprovação).
- Grava `pedido_eventos` tipo `voucher_enviado`; o cron de 15 min (`expirar_pedidos_pendentes`) ganha um segundo passo: reenviar para pedidos `pago` sem `voucher_enviado` há mais de 5 min.
- O site: `enviarLinkDaReserva` passa a chamar a Edge Function (chave de serviço) em vez de enviar; "Reenviar voucher" e "Minha reserva" usam o mesmo caminho.
- O link de acompanhamento vem de `reserva_por_token` (`viagem_token`), que já devolve o token de cada trecho.
- **Pronto quando**: o cliente de teste recebe e-mail (e WhatsApp, se aprovado) com os links certos nos 3 idiomas; "Reenviar voucher" funciona; rodapé do site segue `contato@aguaverde.tur.br`.

#### A4 · Reembolso e cancelamento pela equipe (PWA) — risco PWA **zero** (só frontend) a **baixo**

- **Site**: rotas `POST /api/loja/admin/reembolsar` (cartão: `gateway.reembolsar` + `reembolsar_pedido`), `POST /api/loja/admin/marcar-reembolso-pendente` (Pix: status `reembolso_pendente` + cancela viagens + alerta e push ao Caio + e-mail ao cliente "reembolso em até 2 dias úteis"), `POST /api/loja/admin/marcar-reembolsado` (Pix: `reembolso_pendente` → `reembolsado`) e `POST /api/loja/admin/cancelar-sem-reembolso` (viagens canceladas, pedido segue `pago`, `pedido_eventos` "cancelado sem reembolso", alerta "Pedido AV-… cancelado pela equipe; reembolso não feito"). Todas com `Authorization: Bearer <jwt do Supabase>`, validação do JWT, `is_admin_or_gerente()` por RPC, e `ator_id` em `pedido_eventos`. Só reembolso **total** na v1; parcial fica pelo painel da Stripe ou da Woovi.
- **SQL**: migration `loja_reembolso_pendente`: `pedidos.status` ganha `reembolso_pendente`; `reembolsar_pedido` aceita sair de `pago` ou de `reembolso_pendente`; nova função `marcar_reembolso_pendente` (cancela viagens `pendente`/`vinculada` igual à de reembolso). Tabela da loja, risco zero.
- **Cliente** (`cancelarPedido` no site): pedido de cartão → reembolso automático pela Stripe (como hoje); pedido de Pix → `marcar_reembolso_pendente` e a página da reserva diz "reembolso em até 2 dias úteis".
- **PWA**: em `DetalheViagem`, quando `numero_reserva` começa com `AV-`, buscar o pedido (`pedidos` por `numero`, RLS já permite) e mostrar o bloco "Pedido do site": valor, meio, provedor, status, botões conforme o meio. Ao clicar em **Cancelar viagem** (botão existente) numa viagem da loja, aviso: "Esta viagem foi paga pelo site (pedido AV-…). Cancelar aqui **não** devolve o dinheiro." com "Só cancelar" e "Cancelar e reembolsar" (cartão) ou "Cancelar e marcar reembolso pendente" (Pix). **Reembolso nunca é automático pela equipe.**
- **PWA**: nova rota `/pedidos-site` (link no Sidebar e no BottomNav "Mais"), gated por `temPermissao('viagens.ver')` na v1: lista `pedidos` com número, cliente, produto, data, valor, meio, provedor, status, viagens ligadas; filtro por status (com `reembolso_pendente` em destaque); detalhe com `pedido_eventos` e `gateway_eventos` e o botão "Marcar como reembolsado".
- **Pronto quando**: reembolso de teste de cartão pelo PWA devolve na Stripe, pedido vira `reembolsado`, viagens viram `cancelada`, push de cancelamento (já existe) chega ao motorista se houver; pedido Pix passa por `reembolso_pendente` → `reembolsado` pelo botão; "Só cancelar" gera o alerta.

#### A5 · App nativo: tela "Pedidos do site" (decisão 25) — risco PWA **zero**

- Push e alerta já chegam pela A2. Nova tela `PedidosSiteScreen` (stack do `AdminNavigator`, link no Dashboard e no Perfil): mesma lista do PWA, lendo `pedidos` com o cliente do Supabase (RLS cobre), detalhe com itens e eventos, os mesmos botões chamando as rotas do site com o JWT da sessão. Banner em `ViagemDetailScreen` quando `numero_reserva` começa com `AV-`.
- Preferência: reutiliza `pref_notif_viagens` (sem coluna nova em `perfis`).
- **Pronto quando**: push abre a viagem; tela lista o pedido; botões funcionam no Android e no iOS.

### Trilha B: provedores reais

#### B1 · Dois provedores atrás da interface — risco PWA **zero**

- Migration (a **primeira** deste plano): `gateway_eventos` passa a ter chave `(gateway, evento_id)` (tabela vazia, `ALTER` simples); `pedidos.gateway` obrigatório ao marcar `pago`.
- `servicos.ts`: `LOJA_GATEWAY_PIX=woovi` e `LOJA_GATEWAY_CARTAO=stripe` substituem `LOJA_GATEWAY`; `gateway(meio)` escolhe pelo meio; o reembolso usa `pedidos.gateway`. O adaptador do Mercado Pago continua compilando, sem variável que o ligue.
- **Pronto quando**: testes de `fluxo.ts` cobrem Pix e cartão com provedores diferentes no mesmo pedido-exemplo; duplicata de evento com o mesmo id em provedores diferentes não colide.

#### B2 · Woovi (Pix) — risco PWA **zero**

- Adaptador `src/lib/loja/pagamento/woovi.ts`: `criarCobranca` (QR copia-e-cola, validade = `expiraEm`), `consultarPagamento`, `validarWebhook` (assinatura conferida no corpo cru; detalhes na documentação de segurança do webhook da Woovi, a ler na implementação), `reembolsar` **não usado** na v1 (lança erro claro "reembolso de Pix é manual"). Rota `src/app/api/loja/webhook/woovi/route.ts`. Perguntar ao suporte se existe evento de webhook de reembolso, para fechar `reembolso_pendente` sozinho (`pesquisa/perguntas-suporte-gateways.md`).
- Credenciais: `WOOVI_APP_ID` (sandbox `app.woovi-sandbox.com`) na Vercel, ambiente Preview, cadastrada pelo dono.
- **Pronto quando**: cobrança de teste paga no sandbox confirma o pedido pelo webhook e pela consulta; evento repetido é ignorado.

#### B3 · Stripe (cartão) — risco PWA **zero**

- Adaptador `src/lib/loja/pagamento/stripe.ts` (biblioteca oficial `stripe` para Node): `criarCobranca` cria uma **Checkout Session hospedada** (`mode=payment`, só `card`, `locale` = `pt-BR`/`es`/`en`, `submit_type=book`, `client_reference_id` = id do pedido, chave de idempotência = id do pedido, `expires_at` = maior entre `expiraEm` e agora + 30 min, valor em **centavos** com arredondamento); `consultarPagamento` lê `payment_status`; `reembolsar` cria `refund` pelo `payment_intent`; `validarWebhook` usa `constructEvent` com o corpo cru e `STRIPE_WEBHOOK_SECRET` (tolerância padrão de 5 min). Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`. Rota `src/app/api/loja/webhook/stripe/route.ts`. Pagamento que cai depois do prazo continua honrado.
- Credenciais: a chave publicável pode ir no código; `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` na Vercel, ambiente Preview, cadastradas pelo dono (**nunca pelo chat**). Usar a sandbox **da conta do dono**, para ele ver os pagamentos de teste no painel.
- Conta: só "Payments"; descrição do negócio no painel trocada para "Private airport, hotel and beach transfers with driver, and day tours, in Recife, Brazil. Customers book and pay on our own website."; pedir a ativação de produção esta semana com as perguntas prontas.
- **Pronto quando**: cartão de teste `4242…` confirma o pedido pelo webhook; reembolso de teste volta; `stripe listen` local reproduz o fluxo.

#### B4 · Contingência do cartão (só se precisar)

- **Data de corte: 15/11.** Se a Stripe não tiver aprovado a produção até lá, o dono abre a conta do Mercado Pago e `LOJA_GATEWAY_CARTAO=mercadopago` liga o adaptador existente; troca para a Stripe quando aprovar. Nada mais muda.

### A6 · Ligar e homologar — risco **baixo**

1. Agendar `cron.schedule('loja-expirar-pedidos', '*/15 * * * *', …)` com os reenvios da A2/A3.
2. Variáveis na Vercel (Preview, domínio de testes `aguaverdeviagens.com.br`): `LOJA_REPOSITORIO=supabase`, `LOJA_GATEWAY_PIX=woovi`, `LOJA_GATEWAY_CARTAO=stripe`, chaves dos dois, `LOJA_URL_BASE`. Segredos do Supabase: `LOJA_AVISO_PUSH_PERFIS`, `RESEND_API_KEY` (já existe), `WHATSAPP_*` (já existem).
3. Homologação (com o "pode" do dono): 1 compra Pix e 1 cartão de R$ 1 → viagem no PWA e no app com todos os campos → alerta + push ao Caio + e-mail em `reservas@` → e-mail (e WhatsApp) ao cliente → cartão: reembolso pelo PWA → viagem cancelada; Pix: "marcar reembolso pendente" → Caio devolve no painel → "marcar reembolsado" → repetir os webhooks e confirmar que nada duplica.
4. Checklist de lançamento no `HANDOFF_PROXIMAS_SESSOES.md`.

---

## 5. Decisões tomadas pelo dono (2026-10-21)

| # | Decisão |
|:--|:--|
| D1 | Checkout pergunta **passageiros** (obrigatório, máximo = capacidade do veículo) e **malas grandes/pequenas** (opcional, padrão 0) |
| D2 | Aviso de pedido pago: **push só para o admin Caio** (lista no segredo `LOJA_AVISO_PUSH_PERFIS`, respeitando a preferência "viagens" do app) e **e-mail para `reservas@uluwatour.tur.br`** |
| D3 | **Uma Edge Function** (`loja-pedido-pago`) manda todos os avisos; o site não envia e-mail; e-mail do passageiro sai de `noreply@aguaverde.tur.br` com responder-para `reservas@uluwatour.tur.br`; rodapé do site segue `contato@aguaverde.tur.br` |
| D4 | WhatsApp ao passageiro por template utility, submetido na semana 1; e-mail é o canal garantido; o lançamento não espera a Meta |
| D5 | Reembolso **parcial fora da v1** (fica pelo painel da Stripe ou da Woovi) |
| D6 | Cancelamento pela equipe **nunca reembolsa sozinho**: aviso + botões separados; "Só cancelar" gera alerta "reembolso não feito" |
| D7 | Autorizada a mudança no lembrete do WhatsApp (usar `notificacao_idioma` quando preenchido) |
| D8 | Tela "Pedidos do site": rota `/pedidos-site` no PWA e tela no app, liberadas por `viagens.ver` na v1 |
| D9 | O push abre a **viagem** (deep link existente) |
| D10 | **Um** alerta e **um** push por pedido (não por trecho); "horário a combinar" quando sem hora |
| D11 | Provedores: **Stripe (cartão) + Woovi (Pix)**; Mercado Pago nunca teve conta, código fica **dormente**; **contingência 15/11**: se a Stripe não aprovar, abrir Mercado Pago para o cartão |
| D12 | Ordem: Woovi primeiro; Stripe em sandbox; cartão só vai ao ar após a aprovação; Pix pode ir antes |
| D13 | `LOJA_GATEWAY_PIX` / `LOJA_GATEWAY_CARTAO`; `pedidos.gateway`; chave `(gateway, evento_id)` na primeira migration |
| D14 | Cartão pela **página hospedada da Stripe** (só cartão, idioma do pedido, botão "Reservar") |
| D15 | Duas trilhas em paralelo (A: depois do pagamento com simulado; B: provedores), encontro na homologação |
| D16 | **Reembolso de Pix é manual** pelo Caio no painel da Woovi: status `reembolso_pendente`, alerta e push ao Caio, e-mail ao cliente "em até **2 dias úteis**", botão "Marcar como reembolsado" (e webhook da Woovi, se existir). Cartão continua automático pela Stripe |
| D17 | Stripe: só "Payments" (Invoicing fora); trocar a descrição do negócio no painel antes de pedir a ativação; chave secreta e segredo do webhook só na Vercel (Preview), nunca no chat; usar a sandbox da conta do dono |
| D18 | Plugin da Stripe para o Claude: o dono ativa e autentica quando puder; não trava nada |

---

## 6. Riscos

| Risco | Impacto | Tratamento |
|:--|:--|:--|
| Stripe não aprovar a atividade a tempo | Alto (estrangeiros sem cartão) | pedido de ativação esta semana com descrição exata; contingência Mercado Pago em 15/11 (B4) |
| Gatilho em `pedido_eventos` falhar (rede, `pg_net`) e a equipe não ser avisada | Médio | o alerta `nova_viagem` é inserido **dentro** de `confirmar_pedido` (transacional), então aparece no painel mesmo sem push; o cron de 15 min reenvia avisos sem `equipe_avisada` |
| Push ou e-mail duplicado | Baixo | `pedido_eventos` `equipe_avisada` / `voucher_enviado` por pedido; a Edge Function só manda se não existir |
| Rotas de admin do site serem chamadas por quem não deve | Alto | JWT validado no servidor + `is_admin_or_gerente()`; funções SQL continuam só `service_role`; `ator_id` em `pedido_eventos` |
| Pix em `reembolso_pendente` esquecido | Médio | alerta e push ao Caio na hora; filtro em destaque em `/pedidos-site`; cron de 15 min reenvia o alerta a cada 24 h enquanto pendente |
| Viagem cancelada no PWA sem reembolso e cliente cobrando | Médio | aviso no botão Cancelar + alerta "reembolso não feito" + bloco "Pedido do site" com status visível |
| Mexer em `enviar-whatsapp-lembrete` (compartilhada) quebrar lembretes das OTAs | Médio | mudança mínima com fallback para o comportamento atual; backup do `index.ts`; teste com `telefone_teste` antes do deploy |
| Templates do WhatsApp não aprovados a tempo | Médio | e-mail cobre; submeter na semana 1 |
| Valor em centavos errado na Stripe | Alto | conversão com arredondamento e teste unitário com valores quebrados (R$ 350,00; R$ 212,35) |

---

## 7. Onde isso entra no cronograma do plano principal

| Semana | Etapas deste plano |
|:--|:--|
| 2 (20–24 out) | Dono: sandbox da Woovi; descrição e pedido de ativação na Stripe; chaves na Vercel (Preview); templates WhatsApp à Meta. Eu: B1 |
| 3 (27–31 out) | A1, A2, A3 ‖ B2, B3 |
| 4 (3–7 nov) | A4, A5 ‖ ajustes de B2/B3; A6 (homologação) no fim da semana |
| 15/11 | corte da contingência do cartão (B4) |
| 7 (24–28 nov) | homologação final com sócio e irmão |

Esforço estimado: A1 1 dia · A2 1 dia · A3 1,5 dia · A4 2,5 dias · A5 1,5 dia · B1 0,5 dia · B2 1 dia · B3 1,5 dia · A6 1 dia.
