# Código da loja (Prompt B): o que foi feito e como funciona

> Entregue em 17/10/2026, depois da aprovação das telas do protótipo.
> **Nada disto altera o banco de produção.** Tabelas ficam só escritas em `supabase/pendentes/` (não aplicadas).

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

## Regras que os testes garantem (`npm test`, 86 testes)

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
| `supabase/pendentes/` | migrations SQL escritas e testadas num Postgres de verdade, **não aplicadas** |

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

1. Colunas obrigatórias e gatilhos de `public.viagens` contra o banco real (avisos `[CONFERIR]` em `supabase/pendentes/`).
2. Id do fornecedor "Agua Verde".
3. Datas da alta temporada e controle de vagas dos passeios com parceiros (catamarã, mergulho, jangada).
4. Texto "(ida ou volta)" dos transfers só de ida: veio do nome na Paytour; vale revisar com o dono.
