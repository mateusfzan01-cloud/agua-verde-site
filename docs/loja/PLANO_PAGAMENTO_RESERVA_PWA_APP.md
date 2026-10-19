# Plano: do pagamento no site até a reserva no PWA e no app nativo

> Data: 2026-10-19 · Autor: Claude Code com Mateus Zanlorenzi · Status: **rascunho para aprovação do dono**
> Complementa o `PLANO_LOJA_PROPRIA_V1.md` (§4.1, §4.5, §4.7, decisões 22, 23, 25, 31 e 36). Tudo o que está em "O que já existe" foi conferido lendo o código dos três repositórios em 2026-10-19: `agua-verde-site` (branch `claude/loja-codigo-b`), `agua-verde-app` (PWA) e `appnativo-aguaverde` (app). Nada foi presumido.

---

## 0. Resumo em um minuto

O caminho "cliente paga → viagem aparece no PWA e no app" **já funciona no banco**: o webhook do gateway chama `confirmar_pedido`, que marca o pedido como pago e cria uma viagem por trecho com fornecedor "Agua Verde". Essa viagem aparece na lista de viagens do PWA e do app sem nenhuma mudança neles, porque é uma linha normal de `viagens`.

O que **falta** é o que acontece em volta disso:

1. **Ninguém da equipe é avisado** quando um pedido é pago (sem alerta, sem push, sem e-mail). Hoje o primeiro sinal seria o alerta "viagem sem motorista", que só roda a cada 2 horas e só para viagens de hoje e amanhã.
2. **A viagem nasce incompleta**: número de passageiros fica 1, o voo vai só para o campo de observações (então o lembrete do WhatsApp usa o modelo "sem voo"), e o idioma do cliente é deduzido pelo telefone em vez de usar o que ele escolheu no site.
3. **O passageiro não recebe nada** (voucher, link de acompanhamento): a função de envio existe, mas está vazia.
4. **Não existe tela "Pedidos do site"** no PWA nem no app (decisão 25), e **a equipe não tem como reembolsar** pelo PWA: a função de reembolso só pode ser chamada pelo servidor do site.
5. **Cancelar a viagem no PWA não cancela o pedido**: o cliente continuaria "pago".

Este plano fecha essas cinco lacunas em 6 etapas, dentro das semanas 3 e 4 do cronograma original (27/10 a 07/11). Nenhuma etapa altera tabela, gatilho ou função que o PWA e o app já usam; o único toque em código compartilhado é opcional e está marcado.

---

## 1. O que já existe (fatos verificados)

### 1.1 No site (`agua-verde-site`, branch `claude/loja-codigo-b`)

| Peça | Onde | O que faz |
|:--|:--|:--|
| Fluxo do pedido | `src/lib/loja/fluxo.ts` | `iniciarPagamento`, `processarWebhook`, `estadoDoPedido`, `cancelarPedido`, `reenviarVoucher`, `pedirLinkDaReserva` |
| Interface do gateway | `src/lib/loja/pagamento/gateway.ts` | `criarCobranca`, `consultarPagamento`, `reembolsar`, `validarWebhook` |
| Mercado Pago | `src/lib/loja/pagamento/mercadopago.ts` + `src/app/api/loja/webhook/mercadopago/route.ts` | implementado e testado; **desligado por padrão** (liga com `LOJA_GATEWAY=mercadopago`) |
| Repositório | `src/lib/loja/repositorio-supabase.ts` | grava pedidos e chama as funções SQL com a chave de serviço |
| Ligação das peças | `src/lib/loja/servicos.ts` | escolhe memória ou Supabase, simulado ou Mercado Pago. `enviarLinkDaReserva` **só escreve no log** |
| Checkout | `src/components/loja/CheckoutEmPassos.tsx` | nome, WhatsApp com DDI, e-mail, voo, hotel/endereço, observações, CPF opcional. **Não pede número de passageiros nem malas** (a seleção do produto tem `pessoas` ou `veiculos`) |

### 1.2 No banco (migrations da loja, aplicadas em 17/10/2026)

- `confirmar_pedido(pedido, gateway_ref)`, `SECURITY DEFINER`, só `service_role`: exige evento aprovado em `gateway_eventos`, marca `pedidos.status = 'pago'`, cria **uma viagem por trecho** com: nome, telefone, e-mail, origem, destino, data e hora (08:00 se "a combinar"), `status 'pendente'`, valor rateado, `moeda 'BRL'`, `numero_reserva = AV-2026-000NNN`, `observacoes` = "Pedido AV-… (loja do site) | Endereço: … | Voo: … | observações do cliente", `fornecedor_id` do "Agua Verde". Grava `pedido_itens.viagem_id` e um `pedido_eventos` tipo `'pago'`.
- `reembolsar_pedido(pedido, motivo)`, só `service_role`: marca `reembolsado` e **cancela as viagens do pedido que ainda estão `pendente` ou `vinculada`**.
- `reserva_por_token`, `expirar_pedidos_pendentes` (cron **ainda não agendado**), `proximo_numero_pedido`.
- RLS: `pedidos`, `pedido_itens`, `pedido_eventos`, `gateway_eventos` têm **leitura para admin/gerente** (`is_admin_or_gerente()`); nenhuma escrita por usuário.
- `gateway_eventos.evento_id` é a chave primária **sozinha** (sem o nome do gateway). Com um provedor só, basta; a decisão 31 (Stripe + Woovi) pede a chave `(gateway, evento_id)` (§4.7 do plano principal), o que vira uma migration pequena antes de ligar o segundo provedor.
- Decisão 36: passeios **não** passam mais por "aguardando confirmação"; pagou, está garantido. Isso simplifica este plano.

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
- Push para a equipe: existe o padrão em `supabase/functions/whatsapp-push-notify/index.ts`: busca `perfis` com `tipo in ('admin','gerente')`, `push_token` preenchido e a preferência `pref_notif_whatsapp`, e manda pela API do Expo. É o molde para o aviso de pedido pago.
- Não existe tela de pedidos nem rota `/pedidos-site`.

### 1.5 No app nativo (`appnativo-aguaverde`)

- `ViagensScreen` lista viagens por status (`pendente` incluída); `ViagemDetailScreen` mostra as seções da viagem. **Nada a fazer para ela aparecer.**
- `AlertasScreen` já desenha o tipo `nova_viagem`; `useAlertas` escuta a tabela `alertas` em tempo real.
- Push: `send-push-notification` manda para **um motorista** por vez (`motorista_id`) e respeita `perfis.pref_notif_viagens`, `_lembretes`, `_cancelamentos`. Aceita chamada com `service_role` (gatilhos) ou com JWT de admin/gerente. **Não existe push de "viagem nova" para admin/gerente** em nenhum dos dois repositórios.
- Preferências de notificação (`NotificationsSettingsScreen`): `viagens`, `lembretes`, `alertas`, `cancelamentos`, `whatsapp`.

---

## 2. Lacunas, numeradas

| # | Lacuna | Evidência |
|:--|:--|:--|
| L1 | Equipe não é avisada do pedido pago | nenhum INSERT de alerta `nova_viagem`; nenhum push para admin/gerente; `enviarLinkDaReserva` vazio |
| L2 | Viagem nasce incompleta: `quantidade_passageiros` = 1; `voo_numero`/`voo_companhia` vazios (voo só em `observacoes`); `notificacao_idioma` vazio apesar de `pedidos.idioma` existir; endereço do hotel só em `observacoes`; bagagens não coletadas | `confirmar_pedido` (INSERT com 14 colunas); `CheckoutEmPassos.tsx` sem campos de passageiros/malas; decisão 23 previa "passageiros, malas" |
| L3 | Passageiro não recebe voucher nem link | `servicos.ts`: `enviarLinkDaReserva` só faz `console.info` |
| L4 | Sem tela "Pedidos do site" no PWA e no app; sem botão de reembolso para a equipe | decisão 25; `reembolsar_pedido` só `service_role`; `gateway.reembolsar` vive no site (Next.js) |
| L5 | Cancelar a viagem no PWA/app não reflete no pedido (continua `pago`, sem reembolso) | `reembolsar_pedido` só é chamado pelo site (`cancelarPedido`, pelo cliente) ou pelo webhook de reembolso |
| L6 | Cron `loja-expirar-pedidos` não agendado | comentário na migration `loja_funcoes` |
| L7 | Chave de `gateway_eventos` sem o nome do gateway | migration `loja_pedidos`; exigido pela decisão 31 antes do 2º provedor |

---

## 3. Desenho proposto (ponta a ponta)

```
Cliente paga (Pix ou cartão)
   │
   ▼
Webhook do gateway → processarWebhook → confirmar_pedido (SQL, uma transação)
   │  1. pedidos.status = pago
   │  2. INSERT viagens (1 por trecho) — AGORA com passageiros, voo, idioma, hotel      [E1]
   │  3. INSERT alertas tipo 'nova_viagem' (1 por viagem, com viagem_id e numero_reserva) [E2]
   │  4. INSERT pedido_eventos tipo 'pago'
   ▼
Gatilho AFTER INSERT em pedido_eventos (tipo = 'pago') → Edge Function `loja-pedido-pago`    [E2]
   │  push para admin/gerente (pref_notif_viagens) + e-mail para a empresa
   │  (idempotente: grava pedido_eventos tipo 'equipe_avisada')
   ▼
Site, logo depois de confirmarPedido → enviarLinkDaReserva                                  [E3]
   │  e-mail (Resend, pt/es/en) + WhatsApp (template utility) com voucher e link /acompanhar
   │  (grava pedido_eventos 'voucher_enviado'; o cron de 15 min reenvia o que ficou sem)
   ▼
PWA e app: a viagem já está em /viagens (hoje). Novo: badge "Loja", tela "Pedidos do site",
botão "Reembolsar" → POST /api/loja/admin/reembolsar no site (JWT do Supabase)              [E4, E5]
   │  → gateway.reembolsar → reembolsar_pedido → viagens canceladas → push de cancelamento já existente
```

Por que a confirmação continua **só** em `confirmar_pedido`: é a regra do §4.7 (uma única porta), e tanto o webhook quanto a página da reserva (`estadoDoPedido`) passam por ela. Por isso os avisos à equipe nascem de um gatilho **em uma tabela nova da loja** (`pedido_eventos`), e não de um gatilho em `viagens` (compartilhada com o PWA e o app).

Por que o reembolso fica **no site** e não numa Edge Function: a chamada ao gateway (`gateway.reembolsar`) já está implementada e testada lá, atrás da interface que vai servir para Mercado Pago, Stripe e Woovi. Duplicar isso em Deno seria uma segunda implementação para manter. O PWA e o app chamam uma rota do site com o JWT do Supabase; o site valida o usuário (`supabase.auth.getUser(jwt)`) e confere `is_admin_or_gerente()` por RPC antes de agir.

---

## 4. Etapas

Cada etapa diz o que entrega, onde mexe, o risco para o PWA/app (regra do `CLAUDE.md` do app nativo) e o critério de pronto.

### E1 · Viagem completa (banco + checkout) — risco PWA **baixo**

- **SQL** (`CREATE OR REPLACE` de `confirmar_pedido`, nova migration `loja_viagem_completa`): preencher também `quantidade_passageiros`, `voo_numero`, `voo_companhia`, `notificacao_idioma` (de `pedidos.idioma`: `pt`/`es`/`en`), e `bagagens_grandes`/`bagagens_pequenas` quando o checkout coletar. Só colunas que já existem em `viagens`; nenhum gatilho novo nessa tabela.
  - `quantidade_passageiros`: se o produto é por pessoa, `selecao.pessoas`; se é por veículo, **o checkout passa a perguntar** "quantos passageiros" (guardado em `pedidos.selecao`), porque hoje não há como saber.
- **Checkout**: campo "passageiros" (obrigatório) e "malas" (decisão 23). Dois campos no passo 1, com validação (máximo = capacidade do veículo escolhido).
- **Lembrete WhatsApp** (opcional, código compartilhado, risco **médio**): hoje `enviar-whatsapp-lembrete` deduz o idioma pelo telefone. Para um argentino que comprou em espanhol com telefone brasileiro, ele receberia em português. Mudança de 3 linhas: usar `viagens.notificacao_idioma` quando já estiver preenchido, senão deduzir. **Só com o "pode" do dono**, por ser Edge Function de produção.
- **Pronto quando**: compra de teste gera viagem com passageiros, voo nas colunas certas e idioma; `DetalheViagem` no PWA mostra os dados; teste `testar.mjs` atualizado.

### E2 · Avisos para a equipe (alerta + push + e-mail) — risco PWA **baixo**

- **SQL** (mesma migration ou outra): `confirmar_pedido` insere em `alertas` um registro por viagem: `tipo 'nova_viagem'`, `viagem_id`, `numero_reserva`, `mensagem` ("Pedido AV-2026-000123 pago pelo site: Maria, Aeroporto → Porto de Galinhas, 02/12 às 14:00"). Passa pela RLS porque a função é `SECURITY DEFINER` (mesma regra dos outros gatilhos que escrevem em `alertas`). O PWA e o app **já desenham** esse tipo.
- **Gatilho novo** `AFTER INSERT ON public.pedido_eventos` com `WHEN (NEW.tipo = 'pago')`, `SECURITY DEFINER`, chamando `net.http_post` para a Edge Function `loja-pedido-pago` (molde: `notify_motorista_nova_viagem`, já com `app.settings.service_role_key`). Tabela nova, zero efeito no PWA.
- **Edge Function nova** `loja-pedido-pago` (repositório do PWA, ao lado de `whatsapp-push-notify`): lê o pedido e os itens, manda push para todos os `perfis` admin/gerente com `push_token` e `pref_notif_viagens` ≠ false (payload igual ao de `send-push-notification`, com `viagem_id` para o deep link já existente `navigateToViagem`), manda e-mail para a empresa (Resend, já previsto no §8), e grava `pedido_eventos` tipo `equipe_avisada` (se já existir, não repete).
- **Pronto quando**: compra de teste gera alerta visível no PWA e no app, push chega no celular do admin, e-mail chega; repetir o evento não duplica.

### E3 · Avisos para o passageiro (site) — risco PWA **zero**

- Implementar `enviarLinkDaReserva` em `servicos.ts`: e-mail via Resend (pt/es/en, com voucher em texto e botões "Ver minha reserva" e "Acompanhar viagem") e WhatsApp via Cloud API com template utility `loja_voucher_{pt_BR,es,en_US}` (3 templates a submeter à Meta **na semana 1**, como o plano já previa; enquanto não aprovados, só e-mail).
- Gravar `pedido_eventos` tipo `voucher_enviado`; o cron de 15 min (`expirar_pedidos_pendentes`, já existe) ganha um segundo passo: reenviar para pedidos `pago` sem `voucher_enviado` há mais de 5 min (retry sem fila nova).
- O link de acompanhamento vem de `reserva_por_token` (`viagem_token`), que já devolve o token de cada trecho.
- **Pronto quando**: o cliente de teste recebe e-mail e WhatsApp com os links certos nos 3 idiomas; "Reenviar voucher" funciona.

### E4 · Reembolso pela equipe + regra de cancelamento — risco PWA **zero** (só frontend) a **baixo**

- **Site**: rota `POST /api/loja/admin/reembolsar` (`{ pedidoId, motivo }`), com `Authorization: Bearer <jwt do Supabase>`. Valida o JWT com o cliente do Supabase (chave anônima), confere `is_admin_or_gerente()` por RPC, chama `gateway.reembolsar` e `reembolsar_pedido`. Registra `pedido_eventos` com `ator_id`. Só reembolso **total** na v1 (é o que `reembolsar_pedido` e `cancelarPedido` fazem hoje).
- **PWA**: em `DetalheViagem`, quando a viagem tem `numero_reserva` começando com `AV-`, buscar o pedido (`pedidos` por `numero`, RLS já permite) e mostrar um bloco "Pedido do site": valor pago, meio, status, botão **Reembolsar e cancelar** (chama a rota acima). Se a equipe clicar em **Cancelar viagem** (botão existente) numa viagem da loja, o PWA mostra um aviso: "Esta viagem foi paga pelo site (pedido AV-…). Cancelar aqui **não** devolve o dinheiro. Quer reembolsar também?" com os dois caminhos. Regra: **reembolso nunca é automático** pela equipe; sempre um clique consciente.
- **PWA**: nova rota `/pedidos-site` (link no Sidebar e no BottomNav "Mais"), gated por `temPermissao('viagens.ver')` na v1 (sem permissão nova no catálogo para não mexer no RBAC agora): lista `pedidos` com número, cliente, produto, data, valor, meio, status, viagens ligadas; filtro por status; detalhe com `pedido_eventos` e `gateway_eventos`.
- **Pronto quando**: reembolso de teste pelo PWA devolve no gateway, pedido vira `reembolsado`, viagens viram `cancelada` e o push de cancelamento (já existe) chega ao motorista se houver.

### E5 · App nativo: tela "Pedidos do site" (decisão 25) — risco PWA **zero**

- Push e alerta já chegam pela E2. Nova tela `PedidosSiteScreen` (stack do `AdminNavigator`, link no Dashboard e no Perfil): mesma lista do PWA, lendo `pedidos` com o cliente do Supabase (RLS cobre), detalhe com itens e eventos, botão "Reembolsar e cancelar" chamando a mesma rota do site com o JWT da sessão. Banner em `ViagemDetailScreen` quando `numero_reserva` começa com `AV-`.
- Preferência: reutilizar `pref_notif_viagens` para o push de pedido pago (sem coluna nova em `perfis`).
- **Pronto quando**: push abre a viagem; tela lista o pedido; reembolso funciona no Android e no iOS.

### E6 · Ligar e homologar — risco **baixo**

1. Migration L7: `gateway_eventos` passa a ter chave `(gateway, evento_id)` (tabela vazia, `ALTER` simples) e `pedidos.gateway` passa a ser obrigatório ao marcar `pago`.
2. Agendar `cron.schedule('loja-expirar-pedidos', '*/15 * * * *', …)` com o passo de reenvio da E3.
3. Variáveis na Vercel (ambiente de testes `aguaverdeviagens.com.br`): `LOJA_REPOSITORIO=supabase`, `LOJA_GATEWAY=mercadopago`, credenciais de teste, `RESEND_API_KEY`, `WHATSAPP_*`.
4. Homologação (com o "pode" do dono, como o plano já exige): 1 compra Pix e 1 cartão de R$ 1 → viagem no PWA e no app com todos os campos → alerta + push + e-mail à equipe → e-mail + WhatsApp ao cliente → reembolso pelo PWA → viagem cancelada → repetir o webhook e confirmar que nada duplica.
5. Checklist de lançamento no `HANDOFF_PROXIMAS_SESSOES.md`.

### E7 · Depois: Stripe + Woovi (decisão 31)

Nada deste plano muda: os dois provedores entram atrás da mesma interface e desembocam em `confirmar_pedido`. Pré-requisito: E6 item 1 (chave composta) e as respostas do suporte (`pesquisa/perguntas-suporte-gateways.md`).

---

## 5. Decisões que precisam de você

1. **Passageiros e malas no checkout** (E1): a decisão 23 dizia que o checkout pede "passageiros, malas"; o código não pede. Confirma que entram? (Recomendo sim: sem o número de passageiros a viagem fica errada para o motorista.)
2. **Quem recebe o aviso de pedido pago** (E2): todos os admin e gerentes com push ligado, e o e-mail `contato@aguaverde.tur.br`? Ou só o irmão?
3. **Reembolso parcial** (E4): fica fora da v1? (Recomendo fora; hoje o cancelamento do cliente também é total.)
4. **Cancelamento pela equipe** (E4): confirma que reembolso **nunca** é automático, sempre um clique separado?
5. **Idioma do lembrete** (E1, opcional): autoriza a mudança de 3 linhas na Edge Function `enviar-whatsapp-lembrete` (compartilhada) para respeitar o idioma escolhido no site?
6. **Permissão nova no RBAC** (E4): a tela "Pedidos do site" pode usar `viagens.ver` na v1, ou você quer um código próprio (`loja.pedidos.ver`) no catálogo desde já?

---

## 6. Riscos

| Risco | Impacto | Tratamento |
|:--|:--|:--|
| Gatilho em `pedido_eventos` falhar (rede, `pg_net`) e a equipe não ser avisada | Médio | o alerta `nova_viagem` é inserido **dentro** de `confirmar_pedido` (transacional), então aparece no painel mesmo sem push; o cron de 15 min reenvia avisos sem `equipe_avisada` |
| Push duplicado | Baixo | `pedido_eventos` `equipe_avisada` por pedido; `send-push`/`loja-pedido-pago` só manda se não existir |
| Rota de reembolso do site ser chamada por quem não deve | Alto | JWT validado no servidor + `is_admin_or_gerente()`; `reembolsar_pedido` continua só `service_role`; registro com `ator_id` em `pedido_eventos` |
| Viagem cancelada no PWA sem reembolso e cliente cobrando | Médio | aviso no botão Cancelar + bloco "Pedido do site" com status visível; alerta `nova_viagem` guarda o `numero_reserva` |
| Mexer em `enviar-whatsapp-lembrete` (compartilhada) quebrar lembretes das OTAs | Médio | mudança mínima com fallback para o comportamento atual; backup do `index.ts`; teste com `telefone_teste` antes do deploy |
| Templates do WhatsApp não aprovados a tempo | Médio | e-mail cobre; submeter na semana 1 |

---

## 7. Onde isso entra no cronograma do plano principal

| Semana | Etapas deste plano |
|:--|:--|
| 3 (27–31 out) | E1, E2, E3 (o plano já previa "checkout + webhook + criação de viagem + avisos") |
| 4 (3–7 nov) | E4, E5, E6 (o plano já previa "reembolso, tela Pedidos do site no PWA e no app") |
| 7 (24–28 nov) | homologação final com sócio e irmão |

Esforço estimado: E1 1 dia · E2 1,5 dia · E3 1,5 dia · E4 2 dias · E5 1,5 dia · E6 1 dia.
