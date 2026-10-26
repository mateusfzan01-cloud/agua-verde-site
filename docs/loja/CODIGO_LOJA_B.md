# Código da loja (Prompt B): o que foi feito e como funciona

> Entregue em 17/10/2026, depois da aprovação das telas do protótipo.
> **O código do site ainda não grava no banco.** As tabelas da loja foram criadas em 17/10/2026 (Prompt C, ver `supabase/pendentes/LEIA-ME.md`) e estão vazias.

## Em uma frase

A loja inteira funciona de ponta a ponta no navegador (escolher veículo, dados, pagar, reserva, cancelar),
em português, espanhol e inglês, com **pagamento simulado** e pedidos **em memória**. O Prompt C troca a
simulação pelo Mercado Pago e pelo banco, sem mexer nas telas.

## Rotas novas

| Endereço | O que é |
|:--|:--|
| `/transfers`, `/passeios` | catálogo (44 produtos à venda: 28 transfers e 16 passeios) |
| `/transfers/[slug]`, `/passeios/[slug]` | produto: fotos, descrição, widget (data, hora, veículos ou pessoas), FAQ |
| `/checkout?...` | dados do passageiro (a escolha viaja na URL; o preço é recalculado no servidor) |
| `/checkout/[pedido]` | pagamento (Pix ou cartão) |
| `/reserva/[token]` | reserva, voucher e cancelamento |
| `/minha-reserva` | reenvio do link (número + e-mail; resposta sempre igual) |
| `/es/...`, `/en/...` | as mesmas rotas em espanhol e inglês (`/es`, `/en` também têm uma entrada da loja) |
| `/passeio/<slug-da-paytour>` | **301** para a página nova (46 endereços da Paytour, testados) |
| `/api/loja/webhook/simulado` | aviso do gateway simulado (corpo cru + assinatura, como o real) |

As páginas antigas (`/quem-somos`, landings de transfer etc.) continuam como estavam, só mudaram de pasta
(`src/app/(site)/`) para que a loja tenha o próprio layout com `lang` correto em es/en.

## Home (igual ao protótipo aprovado)

`/` (português), `/es` e `/en` mostram a home do protótipo: faixa de aviso, topo com foto e busca de rota (origem, destino,
data → preço na hora → página do produto), 4 promessas, carrossel "Em destaque", Tripadvisor, "Mais reservados"
(abas Transfers e Passeios), contador "8.211 viagens" e o celular de exemplo do link de acompanhamento (abre recolhido).

- **Em português, `/` só vira a home da loja onde a loja está habilitada** (mesma regra das outras rotas). Em produção,
  até `LOJA_HABILITADA=true`, `/` continua sendo a home atual do site.
- Diferenças deliberadas em relação ao protótipo (o protótipo tinha textos de exemplo):
  - o carrossel não tem o "10% de desconto" nem o slide "do blog (em breve)": são 4 produtos reais (City tour, Porto de Galinhas,
    Maragogi ida e volta, catamarã em Recife). Promoção entra quando existir preço promocional;
  - o contador mostra **8.211** fixo (decisão 37) e **não** mostra "Atualizado a cada hora" enquanto o número não vier do banco
    (`CONTADOR_ATUALIZA_SOZINHO` em `src/lib/loja/home.ts`);
  - os nomes dos lugares na busca vêm do catálogo (só em português);
  - o e-mail do rodapé é `contato@aguaverde.tur.br` (o do protótipo era `reservas@`; conferir qual existe).
- A foto do topo (`public/images/loja/hero.jpg`) é a miniatura de 370 px do protótipo: no computador fica borrada.
  Falta uma foto grande do mesmo tema.

## Telas (todas conferidas contra o protótipo aprovado)

- **Produto:** categoria, selo "Ida e volta", chips (★ 4,7 Tripadvisor e "Confirmação imediata" ou "Vaga garantida ao pagar"),
  números (tipos de veículo, pessoas no maior, 60 min de espera), rótulos "pouso" e "busca no hotel" nos transfers de aeroporto,
  cartão do Tripadvisor, "Como é a chegada" e barra de total presa no pé da tela no celular.
- **Checkout em 3 passos na mesma tela** (1. Seus dados, 2. Voo e hotel, 3. Pagamento), com **WhatsApp com bandeira e código do país**
  (países mais prováveis primeiro, busca, padrão por idioma: Brasil, Argentina, Estados Unidos). O resumo fica abaixo, sem repetir o
  trecho nem o valor, e diz "Total" (nunca "pago" antes de pagar).
- **Pix:** QR Code de verdade do "copia e cola" (no gateway simulado o código é de mentira) e botão de simulação só em modo de teste.
- **Reserva:** voucher, ponto de encontro, "Acompanhar minha viagem" (link real, montado com `viagens.token_cliente` por `src/lib/loja/acompanhar.ts`; no modo simulado, sem viagem de verdade, o botão aparece apagado com um aviso de teste; ida e volta têm um botão cada),
  Reenviar voucher, Alterar (abre o WhatsApp com o número da reserva), Não encontro o motorista, Cancelar (mostra valor e prazo antes),
  Próximos passos e Minha reserva.

## Quando a loja aparece (variáveis na Vercel)

| Variável | Efeito |
|:--|:--|
| `LOJA_HABILITADA=true` | abre a loja em qualquer domínio e coloca os produtos no sitemap (**lançamento**) |
| (nada) | prévias da Vercel e testes locais mostram a loja; **produção em `aguaverde.tur.br` responde 404** |
| `HOSTS_NOINDEX` | domínios fora do Google (padrão: `aguaverdeviagens.com.br` e `www.`): mandam `X-Robots-Tag: noindex, nofollow` e `robots.txt` com `Disallow: /`. Esse domínio sempre mostra a loja (decisão 35) |
| `LOJA_PERMITE_SIMULACAO=false` | desliga o botão "simular pagamento" |
| `LOJA_SEGREDO_WEBHOOK_SIMULADO` | segredo da assinatura do webhook simulado |

## Regras que os testes garantem (`npm test`, 125 testes)

- Preço por veículo (soma quantidade × preço do produto), por pessoa nos 4 produtos que são assim, máximo de 10 por compra,
  ida e volta com um preço só. Todos os 44 produtos à venda calculam preço.
- Data mínima: amanhã, no horário de Recife. Volta não pode ser antes da ida.
- Cancelamento: transfer 24 h; passeio 48 h; passeio em alta temporada 24 h; arrependimento de 48 h depois da compra
  (se o serviço não começou). **A lista de datas da alta temporada está vazia: falta o dono definir** (`ALTA_TEMPORADA` em
  `src/lib/loja/politicas.ts`).
- Pagamento (plano §4.7): só o webhook assinado ou a consulta direta ao gateway confirmam; evento repetido é ignorado;
  recarregar a página de sucesso não gera viagem; confirmar duas vezes não duplica; pedido sem pagar expira em 30 minutos.
- Moeda: cobrança sempre em reais; "≈ valor" na moeda escolhida (padrão: pt reais, es euro, en dólar). Cotações **ilustrativas**.
- Os 3 idiomas têm exatamente as mesmas mensagens (teste de chaves).

## Onde está cada coisa

| Pasta | Conteúdo |
|:--|:--|
| `src/lib/loja/` | regras puras: catálogo (lê `docs/loja/conteudo/*.json`), preços, moeda, datas, políticas, pedidos, fluxo |
| `src/lib/loja/pagamento/` | interface do gateway (`criarCobranca`, `consultarPagamento`, `reembolsar`, `validarWebhook`) e a implementação simulada |
| `src/lib/loja/servicos.ts` | **único** lugar que liga repositório + gateway; no Prompt C é o que muda |
| `src/app/[locale]/` | páginas e ações do servidor da loja |
| `src/components/loja/` | componentes (widget, seletor de idioma e moeda, resumo, painel de pagamento...) |
| `src/middleware.ts` | roteamento de idioma só nas rotas da loja, flag de lançamento e noindex |
| `supabase/migrations/*_loja_*` e `supabase/pendentes/testar.mjs` | migrations da loja (aplicadas em 17/10/2026) e o teste num Postgres de verdade |

## Ligar o banco e o Mercado Pago (Prompt C)

Tudo vem **desligado**: sem nenhuma variável, a loja segue com pedidos em memória e pagamento simulado.

| Variável (Vercel) | Para quê |
|:--|:--|
| `LOJA_REPOSITORIO=supabase` | grava os pedidos no Supabase (tabelas `pedidos`, `pedido_itens`, `pedido_eventos`, `gateway_eventos`) |
| `SUPABASE_SERVICE_ROLE_KEY` | chave de serviço, **só no servidor** (nunca `NEXT_PUBLIC_`). Preferir só no ambiente "Preview" até a loja abrir |
| `LOJA_GATEWAY_PIX=<provedor>` | quem cobra o **Pix**: `woovi` (decisão 31), `simulado` ou `mercadopago`. Provedor real exige `LOJA_REPOSITORIO=supabase`, senão a loja nem sobe |
| `WOOVI_APP_ID` | AppID da aplicação no painel da Woovi (de sandbox ou de produção). Obrigatório com `LOJA_GATEWAY_PIX=woovi` |
| `WOOVI_API_URL` | endereço da API da Woovi. **Sem ela, vai para o sandbox** (`https://api.woovi-sandbox.com`); em produção, `https://api.woovi.com`. O AppID tem de ser do mesmo ambiente |
| `LOJA_GATEWAY_CARTAO=<provedor>` | quem cobra o **cartão** (decisão 31: `stripe`, etapa B3; hoje aceita `simulado` ou `mercadopago`). Cada pedido lembra quem o cobrou (`pedidos.gateway`); reembolso e consulta voltam a esse provedor. `LOJA_GATEWAY=<provedor>` (forma antiga) vale para os dois quando as novas não existem |
| `MERCADOPAGO_ACCESS_TOKEN` | credencial do Mercado Pago (de teste `TEST-...` ou de produção). **Nunca houve conta** (decisão 32): o adaptador fica dormente, só para a contingência de 15/11 |
| `MERCADOPAGO_WEBHOOK_SECRET` | "chave secreta" do webhook, do painel do Mercado Pago |
| `LOJA_URL_BASE` | endereço público do site, ex.: `https://aguaverdeviagens.com.br` (usado no aviso e no retorno do cartão) |
| `LOJA_PERMITE_VIAGEM_REAL_EM_TESTE=true` | só se quiser banco real **com gateway simulado**: o "Simular pagamento" passa a criar viagens de verdade (aparecem para a equipe). Sem isso, volta para a memória |

No painel da **Woovi** (sandbox em `app.woovi-sandbox.com`, produção em `app.woovi.com`): criar a aplicação de API, copiar o
AppID para `WOOVI_APP_ID` e cadastrar o webhook `<LOJA_URL_BASE>/api/loja/webhook/woovi` com os eventos
**OPENPIX:CHARGE_COMPLETED** e **OPENPIX:CHARGE_EXPIRED**. A assinatura (`x-webhook-signature`) é conferida com a chave pública
da Woovi, buscada pela própria API: não há segredo de webhook a copiar. O que o adaptador garante (testes em
`src/lib/loja/pagamento/woovi.test.ts`): idempotência pelo id do pedido (`correlationID` + `return_existing`), valor em centavos,
validade de no mínimo 5 minutos, aviso só vale com assinatura RSA-SHA256 do corpo cru (qualquer chave publicada; guardadas por
1 hora; troca de chave busca a lista de novo no máximo a cada 5 minutos) **e depois de conferir a cobrança na API com o AppID da
loja** (a assinatura é a mesma para todas as contas da Woovi: sem essa consulta, outra conta poderia pagar a si mesma uma cobrança
com o id de um pedido nosso; o estado e o valor vêm da consulta, não do aviso), cobrança de fora da loja é ignorada, e **o reembolso de Pix
não é chamado pela API** (decisão 33: o Caio devolve pelo painel). Até a etapa A4 (status `reembolso_pendente`), o cancelamento
pelo cliente de um pedido Pix responde "falha no reembolso" e a equipe resolve pelo painel.

No painel do Mercado Pago: criar a aplicação, copiar as credenciais, e cadastrar o webhook
`<LOJA_URL_BASE>/api/loja/webhook/mercadopago` com o evento **Pagamentos** (copiar a chave secreta).

O que o código garante (testes em `src/lib/loja/pagamento/mercadopago.test.ts`, `repositorio-supabase.test.ts`, `fluxo.test.ts`
e `supabase/pendentes/testar.mjs`):

- o aviso do Mercado Pago só vale com a assinatura certa (`x-signature`), e o estado do pagamento vem de uma **consulta à API**, nunca do corpo do aviso;
- pagamento de outra origem (sem referência de pedido nosso) é ignorado;
- pagamento aprovado com **valor diferente** do pedido não confirma e deixa auditoria;
- evento repetido é ignorado; erro de rede/banco devolve 500 para o Mercado Pago tentar de novo;
- pagamento que cai **depois do prazo** (pedido expirado) é honrado (nenhuma vaga é segurada antes do pagamento);
- reembolso (pelo botão ou direto no painel do Mercado Pago) **cancela as viagens que ainda não começaram** (`reembolsar_pedido`);
- objeto desatualizado nunca desfaz um pagamento: `pago` só nasce em `confirmar_pedido` e `reembolsado` só em `reembolsar_pedido`.

**Homologação (domínio de testes, com o "pode" do dono):** compra de R$ 1 no Pix e no cartão, conferir o pedido no banco e a viagem no PWA,
estorno pelo botão "Cancelar", conferir que a viagem foi cancelada. Antes de abrir a loja: agendar o cron de expiração
(`cron.schedule('loja-expirar-pedidos', '*/15 * * * *', ...)`, comentado em `loja_funcoes`) e implementar o envio de e-mail/WhatsApp.

## Limites conhecidos (por serem simulação)

- Pedidos ficam em memória: somem se o servidor reiniciar e podem não ser vistos por outra instância na Vercel.
  Serve para ver o fluxo; o banco resolve no Prompt C.
- Nenhum e-mail ou WhatsApp é enviado (o reenvio do link só registra no log do servidor).
- O link de acompanhamento (`app.aguaverde.tur.br/acompanhar/<token>`, configurável em `NEXT_PUBLIC_URL_ACOMPANHAR`) nasce da viagem, que só existe no banco. Na etapa C, `reserva_por_token` já devolve o `viagem_token` de cada perna; o repositório do Supabase só precisa copiá-lo para `ItemDoPedido.viagemToken`. Conferir se `viagens.token_cliente` nasce sozinho no INSERT.
- O resumo da compra (checkout e pagamento) abre retraído, como o das companhias aéreas.
- Fotos dos produtos (decisão do dono em 17/10/2026): o site mostra só paisagens e carros, sem pessoas, nas capas e na galeria. A lista `imagens` de `docs/loja/conteudo/produtos.json` traz só essas (a primeira é a capa); as demais ficam em `imagens_ocultas` (clientes, motoristas, banners e fotos de bancos), sem aparecer no site, para uso futuro só com autorização. Escolha feita a olho; 193 de 408 fotos aparecem.
- O topo da loja usa `public/images/loja/logo-recortado.png` (o logo oficial sem as margens brancas, para aparecer maior); o arquivo original não foi alterado.
- As fotos ainda vêm da CDN da Paytour (`cdn.paytour.com.br`). **Copiar para o Storage antes de cancelar a Paytour.**
- Não há `favicon.ico` no site (404 no navegador, já era assim antes).
- Espanhol/inglês: só a loja está traduzida; as páginas institucionais continuam em português.

## Conferências pedidas ao Prompt C

1. (Feito em 17/10/2026) Colunas e gatilhos de `public.viagens` conferidos no banco real.
2. (Feito em 17/10/2026) Fornecedor "Agua Verde" existe no banco (uuid), procurado por nome.
3. Datas da alta temporada e controle de vagas dos passeios com parceiros (catamarã, mergulho, jangada).
4. Texto "(ida ou volta)" dos transfers só de ida: veio do nome na Paytour; vale revisar com o dono.
