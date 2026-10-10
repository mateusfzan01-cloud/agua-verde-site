# Templates WhatsApp (Cloud API) — loja própria

> **Status:** rascunho para revisão e submissão à Meta. Nada foi submetido.
> **Data:** 2026-10-09 · **Base:** `docs/loja/PLANO_LOJA_PROPRIA_V1.md` (decisão 22, §4.1, §4.5, §7.3) e `docs/loja/pesquisa/pesquisa-custos-pagamento-whatsapp.md` (Parte B).
> **Categoria de todos:** `UTILITY` (R$ 0,035 por mensagem, tarifa BRL vigente desde 1º/10/2026).
> Itens marcados **[CONFERIR: ...]** precisam de decisão ou verificação antes de submeter.

## 0. Antes de submeter: o lembrete que já existe

**[CONFERIR: risco de duplicar o lembrete.]** O sistema já envia lembretes por WhatsApp: **752 lembretes em 90 dias** (ES 576, PT 176, EN 32), pela Edge Function `enviar-whatsapp-lembrete`, com templates já aprovados (plano §1.1 e pesquisa B.2). O plano (§4.1) diz que toda venda da loja vira uma linha em `viagens`, e que os gatilhos que já existem (incluindo o lembrete) passam a valer para ela.

Ou seja: **é provável que o lembrete atual já seja disparado para as vendas da loja.** Se for, o template (c) `loja_lembrete_vespera` abaixo duplica a mensagem, e o passageiro recebe dois lembretes.

Verificar antes de submeter (c):
1. Qual template o lembrete atual usa, em quais idiomas, e quanto tempo antes da viagem ele sai.
2. Se ele filtra por fornecedor ou origem (ex.: só OTAs) ou se pega qualquer viagem com telefone.
3. Se o texto dele serve para o passageiro da loja (link de acompanhamento, regras de espera).

Caminhos possíveis: (i) não criar o (c) e usar o lembrete atual; (ii) criar o (c) e excluir as viagens da loja do lembrete atual; (iii) usar o (c) só para passeios. A recomendação é (i), se o texto atual já tiver o link de acompanhamento.

Também a conferir: os **códigos de idioma** dos templates atuais (`es` ou `es_AR`; `en` ou `en_US`). Os novos devem seguir o mesmo padrão. [CONFERIR]

---

## 1. Regras da Meta seguidas aqui (resumo)

| Regra | Como foi aplicada |
|:--|:--|
| Utility = mensagem transacional, ligada a uma ação do cliente (compra, pagamento, reserva) | Os 3 textos só falam da reserva. Nada de oferta, desconto, "conheça nossos passeios", pedido de avaliação ou convite para comprar de novo. Conteúdo promocional faz a Meta reclassificar o template como **marketing** (R$ 0,3217 por mensagem). |
| Nome em letras minúsculas, números e `_` (snake_case) | `loja_confirmacao_reserva`, `loja_voucher_reserva`, `loja_lembrete_vespera` |
| Mesmo nome para os três idiomas | Cada template é submetido 3 vezes, uma por idioma (`pt_BR`, `es`, `en`) |
| Variáveis numeradas `{{1}}`, `{{2}}`... em sequência, sem pular número | Sim, em todos |
| Variável **não pode** abrir nem fechar o corpo | Todo corpo começa com "Olá" / "¡Hola" / "Hi" e termina com uma frase fixa |
| Duas variáveis **não podem** ficar coladas (`{{1}}{{2}}`) | Toda variável tem um rótulo fixo antes ("Serviço:", "Data e hora:") |
| Exemplo obrigatório para cada variável na submissão | Tabela + exemplo preenchido em cada template |
| Poucas variáveis em texto curto pode ser rejeitado | Os corpos têm texto fixo suficiente em volta das variáveis |
| Corpo: máximo **1024 caracteres** | Todos ficam entre 218 e 363 caracteres (contagem na §6), com folga para os valores das variáveis |
| Cabeçalho de texto: máx. 60 caracteres e no máximo 1 variável | Cabeçalhos fixos, sem variável |
| Rodapé: máx. 60 caracteres, sem variável | "Água Verde Viagens e Receptivos" (31) |
| Botões: texto até 25 caracteres; até 2 botões de URL; até 10 botões no total | Respeitado |
| URL dinâmica: a variável só pode ficar **no fim** da URL; o domínio é fixo | `https://aguaverde.tur.br/reserva/{{1}}` e `https://aguaverde.tur.br/acompanhar/{{1}}` |
| No envio, o valor de uma variável não pode ter quebra de linha, tabulação nem mais de 4 espaços seguidos | O código de envio deve limpar os valores (ex.: endereço com quebra de linha) |

Limites de caracteres conforme a documentação da Meta que conheço; **não reli a página oficial nesta sessão** [CONFERIR na documentação "Message templates" antes de submeter].

### Domínio dos links de acompanhamento

O site tem a rota `/acompanhar/[token]` (aguaverde.tur.br) e o PWA também tem uma página pública em `https://app.aguaverde.tur.br/acompanhar/:token` (`CLAUDE.md`). [CONFERIR: qual domínio usar no botão; o lembrete atual provavelmente usa o do PWA.] Os exemplos abaixo usam `aguaverde.tur.br`.

O token de `/acompanhar/` é o `token_cliente` de **cada viagem** (uma por trecho). Uma reserva de ida e volta tem 2 viagens, logo 2 tokens. [CONFERIR: enviar um voucher por trecho, ou um só com o botão apontando para o primeiro trecho e a página `/reserva/` mostrando os dois.]

Nas versões ES/EN, os links de `/reserva/` levam o prefixo de idioma (`/es/reserva/`, `/en/reserva/`), conforme §4.4 do plano. O `/acompanhar/` fica sem prefixo [CONFERIR].

---

## 2. Template (a) — confirmação de reserva

**Nome:** `loja_confirmacao_reserva` · **Categoria:** UTILITY
**Quando enviar:** logo depois que o webhook do Mercado Pago confirma o pagamento de um **transfer**, ou quando o admin confirma um **passeio** (§4.5). Um envio por pedido.

### Variáveis

| Variável | Conteúdo | Origem no banco | Exemplo |
|:--|:--|:--|:--|
| `{{1}}` | Primeiro nome do passageiro | `pedidos.passageiro_nome` (só o primeiro nome) | Martina |
| `{{2}}` | Número da reserva | `pedidos.numero` | AV-2026-000123 |
| `{{3}}` | Nome do produto (curto, no idioma) | `produtos.nome->>idioma` | Transfer Aeroporto do Recife → Porto de Galinhas |
| `{{4}}` | Data e hora de busca do 1º trecho, no formato do idioma | `pedido_itens.data_hora` (fuso America/Recife) | 15/12/2026 às 14:30 |
| `{{5}}` | Local de embarque | `pedido_itens.origem` + voo, se houver | Aeroporto do Recife, voo G3 1234 |
| `{{6}}` | Número de passageiros | `pedidos.pax` | 3 |
| `{{7}}` | Total pago, sempre em reais | `pedidos.valor_total` | R$ 180,00 |
| Botão URL `{{1}}` | Token secreto da reserva | `pedidos.token_acesso` | q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU |

### pt_BR

**Cabeçalho (texto):** `Reserva confirmada`

**Corpo:**
```text
Olá, {{1}}! Sua reserva {{2}} está confirmada.

Serviço: {{3}}
Data e hora: {{4}}
Embarque: {{5}}
Passageiros: {{6}}
Total pago: {{7}}

O link para acompanhar o motorista chega antes da viagem. Para ver os detalhes ou cancelar, use o botão abaixo. O cancelamento é grátis até 24 h antes do horário marcado.
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — texto `Ver reserva` — `https://aguaverde.tur.br/reserva/{{1}}`
2. Resposta rápida — `Falar com a equipe`

**Exemplo preenchido (para a submissão):**
> **Reserva confirmada**
> Olá, Martina! Sua reserva AV-2026-000123 está confirmada.
>
> Serviço: Transfer Aeroporto do Recife → Porto de Galinhas
> Data e hora: 15/12/2026 às 14:30
> Embarque: Aeroporto do Recife, voo G3 1234
> Passageiros: 3
> Total pago: R$ 180,00
>
> O link para acompanhar o motorista chega antes da viagem. Para ver os detalhes ou cancelar, use o botão abaixo. O cancelamento é grátis até 24 h antes do horário marcado.
> *Água Verde Viagens e Receptivos*
> [Ver reserva → https://aguaverde.tur.br/reserva/q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU] [Falar com a equipe]

### es

**Cabeçalho:** `Reserva confirmada`

**Corpo:**
```text
¡Hola, {{1}}! Tu reserva {{2}} está confirmada.

Servicio: {{3}}
Fecha y hora: {{4}}
Recogida: {{5}}
Pasajeros: {{6}}
Total pagado: {{7}}

El enlace para seguir al conductor llega antes del viaje. Para ver los detalles o cancelar, usa el botón de abajo. La cancelación es gratis hasta 24 h antes del horario reservado.
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — `Ver reserva` — `https://aguaverde.tur.br/es/reserva/{{1}}`
2. Resposta rápida — `Hablar con el equipo`

**Exemplo preenchido:**
> **Reserva confirmada**
> ¡Hola, Martina! Tu reserva AV-2026-000123 está confirmada.
>
> Servicio: Traslado Aeropuerto de Recife → Porto de Galinhas
> Fecha y hora: 15/12/2026, 14:30
> Recogida: Aeropuerto de Recife, vuelo G3 1234
> Pasajeros: 3
> Total pagado: R$ 180,00 (reales)
>
> El enlace para seguir al conductor llega antes del viaje. Para ver los detalles o cancelar, usa el botón de abajo. La cancelación es gratis hasta 24 h antes del horario reservado.
> *Água Verde Viagens e Receptivos*
> [Ver reserva → https://aguaverde.tur.br/es/reserva/q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU] [Hablar con el equipo]

### en

**Cabeçalho:** `Booking confirmed`

**Corpo:**
```text
Hi {{1}}, your booking {{2}} is confirmed.

Service: {{3}}
Date and time: {{4}}
Pickup: {{5}}
Passengers: {{6}}
Total paid: {{7}}

You will get a link to track your driver before the trip. To see the details or cancel, use the button below. Cancellation is free up to 24 h before your booked time.
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — `View booking` — `https://aguaverde.tur.br/en/reserva/{{1}}`
2. Resposta rápida — `Talk to our team`

**Exemplo preenchido:**
> **Booking confirmed**
> Hi Emma, your booking AV-2026-000124 is confirmed.
>
> Service: Transfer Recife Airport → Porto de Galinhas
> Date and time: Dec 15, 2026, 2:30 PM
> Pickup: Recife Airport, flight G3 1234
> Passengers: 2
> Total paid: R$ 180.00 (BRL)
>
> You will get a link to track your driver before the trip. To see the details or cancel, use the button below. Cancellation is free up to 24 h before your booked time.
> *Água Verde Viagens e Receptivos*
> [View booking → https://aguaverde.tur.br/en/reserva/q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU] [Talk to our team]

---

## 3. Template (b) — voucher com link

**Nome:** `loja_voucher_reserva` · **Categoria:** UTILITY
**Quando enviar:** [CONFERIR: momento.] Opções: logo depois da confirmação (a), ou quando o motorista for vinculado (status `vinculada`). Se for logo depois de (a), avaliar **juntar (a) e (b) em uma mensagem só** (economiza R$ 0,035 por venda e evita duas mensagens seguidas). A decisão 22 pede "voucher e link de acompanhamento" por WhatsApp; PDF só sob demanda, por isso este template **não** tem cabeçalho de documento.

### Variáveis

| Variável | Conteúdo | Origem | Exemplo |
|:--|:--|:--|:--|
| `{{1}}` | Primeiro nome | `pedidos.passageiro_nome` | Martina |
| `{{2}}` | Número da reserva | `pedidos.numero` | AV-2026-000123 |
| `{{3}}` | Nome do produto | `produtos.nome->>idioma` | Transfer Aeroporto do Recife → Porto de Galinhas |
| `{{4}}` | Data e hora de busca | `pedido_itens.data_hora` | 15/12/2026 às 14:30 |
| `{{5}}` | Ponto de encontro (texto curto, sem quebra de linha) | regra por tipo de origem [CONFERIR texto do aeroporto] | Saída do desembarque, motorista com placa com seu nome |
| Botão 1 URL `{{1}}` | Token secreto da reserva | `pedidos.token_acesso` | q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU |
| Botão 2 URL `{{1}}` | Token de acompanhamento da viagem | `viagens.token_cliente` | 7f3c9a1e5b2d4c8f |

Cada botão de URL tem a sua própria variável `{{1}}` (a numeração dos botões é separada da do corpo).

### pt_BR

**Cabeçalho:** `Seu voucher`

**Corpo:**
```text
Olá, {{1}}. Aqui está o voucher da sua reserva {{2}}.

Serviço: {{3}}
Data e hora: {{4}}
Ponto de encontro: {{5}}

Mostre este voucher ao motorista, se ele pedir. No dia da viagem, toque em "Acompanhar viagem" para ver o motorista chegando em tempo real. Guarde esta mensagem.
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — `Ver voucher` — `https://aguaverde.tur.br/reserva/{{1}}`
2. URL dinâmica — `Acompanhar viagem` — `https://aguaverde.tur.br/acompanhar/{{1}}`

**Exemplo preenchido:**
> **Seu voucher**
> Olá, Martina. Aqui está o voucher da sua reserva AV-2026-000123.
>
> Serviço: Transfer Aeroporto do Recife → Porto de Galinhas
> Data e hora: 15/12/2026 às 14:30
> Ponto de encontro: Saída do desembarque, motorista com placa com seu nome
>
> Mostre este voucher ao motorista, se ele pedir. No dia da viagem, toque em "Acompanhar viagem" para ver o motorista chegando em tempo real. Guarde esta mensagem.
> *Água Verde Viagens e Receptivos*
> [Ver voucher → https://aguaverde.tur.br/reserva/q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU] [Acompanhar viagem → https://aguaverde.tur.br/acompanhar/7f3c9a1e5b2d4c8f]

### es

**Cabeçalho:** `Tu voucher`

**Corpo:**
```text
¡Hola, {{1}}! Aquí está el voucher de tu reserva {{2}}.

Servicio: {{3}}
Fecha y hora: {{4}}
Punto de encuentro: {{5}}

Muestra este voucher al conductor si te lo pide. El día del viaje, toca "Seguir mi viaje" para ver al conductor llegar en tiempo real. Guarda este mensaje.
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — `Ver voucher` — `https://aguaverde.tur.br/es/reserva/{{1}}`
2. URL dinâmica — `Seguir mi viaje` — `https://aguaverde.tur.br/acompanhar/{{1}}`

**Exemplo preenchido:**
> **Tu voucher**
> ¡Hola, Martina! Aquí está el voucher de tu reserva AV-2026-000123.
>
> Servicio: Traslado Aeropuerto de Recife → Porto de Galinhas
> Fecha y hora: 15/12/2026, 14:30
> Punto de encuentro: Salida de llegadas, conductor con cartel con tu nombre
>
> Muestra este voucher al conductor si te lo pide. El día del viaje, toca "Seguir mi viaje" para ver al conductor llegar en tiempo real. Guarda este mensaje.
> *Água Verde Viagens e Receptivos*
> [Ver voucher → https://aguaverde.tur.br/es/reserva/q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU] [Seguir mi viaje → https://aguaverde.tur.br/acompanhar/7f3c9a1e5b2d4c8f]

### en

**Cabeçalho:** `Your voucher`

**Corpo:**
```text
Hi {{1}}, here is the voucher for your booking {{2}}.

Service: {{3}}
Date and time: {{4}}
Meeting point: {{5}}

Show this voucher to the driver if asked. On the day of your trip, tap "Track my trip" to see your driver arrive in real time. Please keep this message.
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — `View voucher` — `https://aguaverde.tur.br/en/reserva/{{1}}`
2. URL dinâmica — `Track my trip` — `https://aguaverde.tur.br/acompanhar/{{1}}`

**Exemplo preenchido:**
> **Your voucher**
> Hi Emma, here is the voucher for your booking AV-2026-000124.
>
> Service: Transfer Recife Airport → Porto de Galinhas
> Date and time: Dec 15, 2026, 2:30 PM
> Meeting point: Arrivals exit, driver holding a sign with your name
>
> Show this voucher to the driver if asked. On the day of your trip, tap "Track my trip" to see your driver arrive in real time. Please keep this message.
> *Água Verde Viagens e Receptivos*
> [View voucher → https://aguaverde.tur.br/en/reserva/q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU] [Track my trip → https://aguaverde.tur.br/acompanhar/7f3c9a1e5b2d4c8f]

---

## 4. Template (c) — lembrete na véspera

**Nome:** `loja_lembrete_vespera` · **Categoria:** UTILITY
**Quando enviar:** [CONFERIR: ver §0 — pode duplicar o lembrete atual.] Se for criado: um dia antes, em horário comercial do fuso do passageiro [CONFERIR horário], um envio por trecho.

### Variáveis

| Variável | Conteúdo | Origem | Exemplo |
|:--|:--|:--|:--|
| `{{1}}` | Primeiro nome | `pedidos.passageiro_nome` | Martina |
| `{{2}}` | Nome do produto ou do trecho | `produtos.nome` / `pedido_itens` | Transfer Aeroporto do Recife → Porto de Galinhas |
| `{{3}}` | Data e hora de busca | `pedido_itens.data_hora` | 15/12/2026 às 14:30 |
| `{{4}}` | Local de embarque | `pedido_itens.origem` + voo | Aeroporto do Recife, voo G3 1234 |
| Botão URL `{{1}}` | Token de acompanhamento | `viagens.token_cliente` | 7f3c9a1e5b2d4c8f |

### pt_BR

**Cabeçalho:** `Sua viagem é amanhã`

**Corpo:**
```text
Olá, {{1}}. Este é um lembrete da sua viagem de amanhã.

Serviço: {{2}}
Data e hora: {{3}}
Embarque: {{4}}

No aeroporto, o motorista espera até 60 min depois do pouso, com uma placa com seu nome. Em hotel ou endereço, a espera é de 15 min. Os dados do motorista aparecem no link de acompanhamento. Algum dado mudou? Toque em "Preciso alterar".
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — `Acompanhar viagem` — `https://aguaverde.tur.br/acompanhar/{{1}}`
2. Resposta rápida — `Está tudo certo`
3. Resposta rápida — `Preciso alterar`

**Exemplo preenchido:**
> **Sua viagem é amanhã**
> Olá, Martina. Este é um lembrete da sua viagem de amanhã.
>
> Serviço: Transfer Aeroporto do Recife → Porto de Galinhas
> Data e hora: 15/12/2026 às 14:30
> Embarque: Aeroporto do Recife, voo G3 1234
>
> No aeroporto, o motorista espera até 60 min depois do pouso, com uma placa com seu nome. Em hotel ou endereço, a espera é de 15 min. Os dados do motorista aparecem no link de acompanhamento. Algum dado mudou? Toque em "Preciso alterar".
> *Água Verde Viagens e Receptivos*
> [Acompanhar viagem → https://aguaverde.tur.br/acompanhar/7f3c9a1e5b2d4c8f] [Está tudo certo] [Preciso alterar]

### es

**Cabeçalho:** `Tu viaje es mañana`

**Corpo:**
```text
¡Hola, {{1}}! Te recordamos tu viaje de mañana.

Servicio: {{2}}
Fecha y hora: {{3}}
Recogida: {{4}}

En el aeropuerto, el conductor espera hasta 60 min después del aterrizaje, con un cartel con tu nombre. En hotel o dirección, la espera es de 15 min. Los datos del conductor aparecen en el enlace de seguimiento. ¿Cambió algún dato? Toca "Necesito cambiar algo".
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — `Seguir mi viaje` — `https://aguaverde.tur.br/acompanhar/{{1}}`
2. Resposta rápida — `Todo en orden`
3. Resposta rápida — `Necesito cambiar algo`

**Exemplo preenchido:**
> **Tu viaje es mañana**
> ¡Hola, Martina! Te recordamos tu viaje de mañana.
>
> Servicio: Traslado Aeropuerto de Recife → Porto de Galinhas
> Fecha y hora: 15/12/2026, 14:30
> Recogida: Aeropuerto de Recife, vuelo G3 1234
>
> En el aeropuerto, el conductor espera hasta 60 min después del aterrizaje, con un cartel con tu nombre. En hotel o dirección, la espera es de 15 min. Los datos del conductor aparecen en el enlace de seguimiento. ¿Cambió algún dato? Toca "Necesito cambiar algo".
> *Água Verde Viagens e Receptivos*
> [Seguir mi viaje → https://aguaverde.tur.br/acompanhar/7f3c9a1e5b2d4c8f] [Todo en orden] [Necesito cambiar algo]

### en

**Cabeçalho:** `Your trip is tomorrow`

**Corpo:**
```text
Hi {{1}}, this is a reminder about your trip tomorrow.

Service: {{2}}
Date and time: {{3}}
Pickup: {{4}}

At the airport, your driver waits up to 60 min after landing, holding a sign with your name. At a hotel or address, the wait is 15 min. Your driver's details are on the tracking link. Has anything changed? Tap "I need to change".
```

**Rodapé:** `Água Verde Viagens e Receptivos`

**Botões:**
1. URL dinâmica — `Track my trip` — `https://aguaverde.tur.br/acompanhar/{{1}}`
2. Resposta rápida — `All good`
3. Resposta rápida — `I need to change`

**Exemplo preenchido:**
> **Your trip is tomorrow**
> Hi Emma, this is a reminder about your trip tomorrow.
>
> Service: Transfer Recife Airport → Porto de Galinhas
> Date and time: Dec 15, 2026, 2:30 PM
> Pickup: Recife Airport, flight G3 1234
>
> At the airport, your driver waits up to 60 min after landing, holding a sign with your name. At a hotel or address, the wait is 15 min. Your driver's details are on the tracking link. Has anything changed? Tap "I need to change".
> *Água Verde Viagens e Receptivos*
> [Track my trip → https://aguaverde.tur.br/acompanhar/7f3c9a1e5b2d4c8f] [All good] [I need to change]

---

## 5. Sugestão extra (opcional) — passeio pago, aguardando confirmação

A decisão 20 diz que o passeio é pago na hora e confirmado em até 24 h. O template (a) só deve sair **depois** da confirmação. Entre o pagamento e a confirmação, o passageiro recebe a página e o e-mail; se o dono quiser também um WhatsApp nesse momento, segue um quarto template [CONFERIR: criar ou não].

**Nome:** `loja_passeio_pagamento_recebido` · **Categoria:** UTILITY
Variáveis: `{{1}}` primeiro nome · `{{2}}` número do pedido · `{{3}}` nome do passeio · `{{4}}` data. Botão URL `{{1}}` = `pedidos.token_acesso`.

pt_BR:
```text
Olá, {{1}}. Recebemos o pagamento do pedido {{2}}.

Passeio: {{3}}
Data: {{4}}

Vamos confirmar a vaga em até 24 h. Se não houver vaga, devolvemos todo o valor automaticamente. Você pode ver o pedido pelo botão abaixo.
```
es:
```text
¡Hola, {{1}}! Recibimos el pago del pedido {{2}}.

Paseo: {{3}}
Fecha: {{4}}

Confirmaremos el cupo en hasta 24 h. Si no hay cupo, te devolvemos todo el importe automáticamente. Puedes ver el pedido con el botón de abajo.
```
en:
```text
Hi {{1}}, we have received payment for order {{2}}.

Tour: {{3}}
Date: {{4}}

We will confirm availability within 24 h. If there is no availability, we will refund the full amount automatically. You can see your order using the button below.
```
Botão: URL dinâmica `Ver pedido` / `Ver pedido` / `View order` → `/reserva/{{1}}` (com prefixo de idioma). Exemplo: Martina · AV-2026-000125 · Passeio privativo de Recife para Praia dos Carneiros · 16/12/2026.

---

## 6. Tamanho dos corpos (sem cabeçalho, rodapé e botões)

Contagem dos textos com as variáveis ainda como `{{n}}`. O limite da Meta é 1024 caracteres **depois** de preenchidas as variáveis; o nome de produto mais longo do catálogo tem ~120 caracteres, então todos ficam com folga.

| Template | pt_BR | es | en |
|:--|--:|--:|--:|
| `loja_confirmacao_reserva` | 306 | 318 | 297 |
| `loja_voucher_reserva` | 276 | 275 | 265 |
| `loja_lembrete_vespera` | 344 | 363 | 336 |
| `loja_passeio_pagamento_recebido` (opcional) | 218 | 221 | 241 |

---

## 7. Exemplo de submissão pela API (template (a), pt_BR)

`POST https://graph.facebook.com/<versão>/<WABA_ID>/message_templates` [CONFERIR: versão da Graph API usada pelas Edge Functions atuais]

```json
{
  "name": "loja_confirmacao_reserva",
  "language": "pt_BR",
  "category": "UTILITY",
  "components": [
    { "type": "HEADER", "format": "TEXT", "text": "Reserva confirmada" },
    {
      "type": "BODY",
      "text": "Olá, {{1}}! Sua reserva {{2}} está confirmada.\n\nServiço: {{3}}\nData e hora: {{4}}\nEmbarque: {{5}}\nPassageiros: {{6}}\nTotal pago: {{7}}\n\nO link para acompanhar o motorista chega antes da viagem. Para ver os detalhes ou cancelar, use o botão abaixo. O cancelamento é grátis até 24 h antes do horário marcado.",
      "example": {
        "body_text": [[
          "Martina", "AV-2026-000123", "Transfer Aeroporto do Recife → Porto de Galinhas",
          "15/12/2026 às 14:30", "Aeroporto do Recife, voo G3 1234", "3", "R$ 180,00"
        ]]
      }
    },
    { "type": "FOOTER", "text": "Água Verde Viagens e Receptivos" },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "URL", "text": "Ver reserva",
          "url": "https://aguaverde.tur.br/reserva/{{1}}",
          "example": ["https://aguaverde.tur.br/reserva/q8Zk2nVt4LxR7wPa9cHs3JdF6mYb1EgU"]
        },
        { "type": "QUICK_REPLY", "text": "Falar com a equipe" }
      ]
    }
  ]
}
```

No envio, o botão de URL recebe só o final da URL (o token), com `"sub_type": "url"` e o `index` do botão (0, 1...).

## 8. Notas de operação

- **Respostas rápidas** ("Falar com a equipe", "Preciso alterar", "Está tudo certo") chegam ao `whatsapp-webhook` como mensagem do cliente e abrem a janela de 24 h. A IA (`ia-responder-whatsapp`) precisa saber tratar esses textos: "Preciso alterar" e "Falar com a equipe" devem passar para um humano. [CONFERIR]
- **Idioma do envio:** usar `pedidos.idioma` (idioma em que a compra foi feita).
- **Aprovação:** a Meta pode levar de minutos a dias. O plano (§10) já prevê submeter na semana 1; o e-mail cobre enquanto isso.
- **Custo:** 3 templates por venda × R$ 0,035 = R$ 0,105 por venda. Se (a) e (b) forem unidos, ou se (c) não for criado, cai para R$ 0,07.

## 9. Lista de [CONFERIR] deste arquivo

1. Se o lembrete atual (`enviar-whatsapp-lembrete`, 752 em 90 dias) já dispara para viagens da loja; criar ou não o (c).
2. Códigos de idioma usados nos templates atuais (`es`/`es_AR`, `en`/`en_US`).
3. Limites de caracteres e regras: reler a documentação oficial "Message templates" da Meta antes de submeter.
4. Domínio do link de acompanhamento: `aguaverde.tur.br/acompanhar` ou `app.aguaverde.tur.br/acompanhar`.
5. Prefixo de idioma em `/acompanhar/` (ES/EN).
6. Ida e volta: um voucher por trecho ou um só.
7. Momento de envio do voucher (junto com a confirmação ou quando o motorista for vinculado); unir (a) e (b).
8. Texto do ponto de encontro no Aeroporto do Recife.
9. Horário de envio do lembrete.
10. Criar ou não o template opcional de passeio aguardando confirmação.
11. Versão da Graph API usada hoje.
12. Tratamento das respostas rápidas pela IA (passagem para humano).
