# Perguntas para o suporte dos provedores de pagamento

**Data:** 19 de outubro de 2026
**Para quê:** fechar a decisão 31 do plano da loja (`docs/loja/PLANO_LOJA_PROPRIA_V1.md`, §7.3-B): cartão na Stripe, Pix na Woovi, Mercado Pago como plano B.
**Como usar:** copie o bloco de cada empresa e envie pelo chat ou e-mail do suporte, ou pelo gerente de conta, se houver. Guarde as respostas por escrito (print ou e-mail) e anote a data ao lado de cada uma. Preço e regra mudam, e o que vale é o que eles responderem.

**Quem somos (use no começo de todas as mensagens):**
Água Verde Transfers, CNPJ 17.427.292/0001-46, Recife/PE. Fazemos **transfer privado ponto a ponto** (aeroporto, hotel, praia), com motorista, e também vendemos **passeios** (18 dos 46 produtos do catálogo). Não somos agência de pacotes. Descreva sempre a atividade completa, sem omitir os passeios: informação inexata sobre a natureza do negócio pode levar à recusa ou ao bloqueio da conta. Venda pelo nosso site, com ticket médio de R$ 180 a R$ 700, entre 40 e 150 vendas por mês. Muitos clientes são turistas estrangeiros (principalmente hispanofalantes).

---

## 1. Stripe Brasil (cartão) — a mais importante

Na lista oficial de negócios restritos da Stripe, a seção do Brasil não tem restrição de viagem (a linha "hotéis, agências de viagem e serviços de transporte" é da Tailândia). Valem as regras globais: "serviços e clubes de reservas de viagem" é restrita e "serviços de uso compartilhado" é proibida. Por isso, a primeira pergunta é sobre o enquadramento e decide tudo.

> Olá. Somos a Água Verde Transfers (CNPJ 17.427.292/0001-46), em Recife. Fazemos **transfer privado ponto a ponto**, com motorista, entre aeroporto, hotel e praia, e também vendemos **passeios** (18 dos 46 produtos do catálogo). Não somos agência de pacotes. Queremos vender pelo nosso site, com ticket médio de R$ 180 a R$ 700, e cobrar o cliente na hora.
>
> 1. Como a Stripe enquadra esse tipo de negócio no Brasil? O site, que vende transfers privados agendados e passeios, cai em "serviços e clubes de reservas de viagem" (atividade restrita)? Um transfer privado agendado conta como "serviços de uso compartilhado"? Que informações ou documentos vocês pedem para a análise (CADASTUR, contrato, site no ar)? Qual o prazo da resposta?
> 2. Se a atividade for aprovada, há algum limite de valor por transação ou por mês, ou alguma reserva (retenção) sobre os repasses nos primeiros meses?
> 3. Quais bandeiras aceitam cartão **emitido no exterior** (Visa, Mastercard, Amex, Elo)? Confirmam que Amex e Elo não funcionam? A cobrança de +2% para cartão internacional vale para todos os casos?
> 4. Quando o cliente paga com cartão estrangeiro, o valor é sempre cobrado em reais, e o banco dele faz a conversão? Existe alguma taxa de câmbio nossa?
> 5. Em quantos dias o dinheiro de uma venda no cartão cai na nossa conta (liquidação) no Brasil?
> 6. Em reembolso total, a tarifa da transação é devolvida? E em reembolso parcial?
> 7. Em contestação (chargeback): o valor é descontado de nós na hora? Qual o prazo para enviar a defesa? A tarifa de R$ 55 é cobrada mesmo se ganharmos?
> 8. O Radar (antifraude) está incluído no preço padrão para a nossa conta?
> 9. Vocês aceitam parcelamento no cartão de crédito no Brasil (ex.: 3x, 6x, 12x)? Qual o custo para o lojista?
> 10. Posso usar a Stripe só para cartão, e receber Pix por outro provedor (Woovi), sem problema contratual?

---

## 2. Woovi (Pix)

A página pública da Woovi não diz o prazo de recebimento nem se há restrição de atividade. Também não detalha a disputa de Pix.

> Olá. Somos a Água Verde Transfers (CNPJ 17.427.292/0001-46), em Recife. Fazemos **transfer privado ponto a ponto** (aeroporto, hotel, praia). Queremos cobrar por Pix pelo nosso site, via API, com ticket médio de R$ 180 a R$ 700.
>
> 1. A atividade de transporte e turismo é aceita? Há restrição ou documentação extra (CADASTUR)?
> 2. O Pix cai na conta Woovi na hora? Em quanto tempo posso sacar para o meu banco, e a partir de que valor o saque é grátis?
> 3. Entre os planos "percentual" (0,80%, mínimo R$ 0,50, máximo R$ 5,00) e "fixo" (R$ 0,85), posso escolher e trocar depois? O plano vale para cobranças via API?
> 4. Como funciona o reembolso de Pix via API: é total e parcial, por quanto tempo depois do pagamento, e precisa de saldo na conta?
> 5. Como funciona a "disputa de compra" ou o MED (Mecanismo Especial de Devolução)? Em quais casos o valor pode ser retirado da nossa conta depois de recebido?
> 6. Os webhooks têm assinatura para validar a origem? Eles podem chegar duplicados ou fora de ordem? Há tentativas de reenvio, e por quanto tempo?
> 7. Qual o tempo de validade padrão de um QR Code Pix dinâmico, e posso definir o meu (ex.: 30 minutos)?
> 8. Existe algum limite de valor por Pix ou por dia para a nossa conta?
> 9. Há integração oficial com a Stripe ou com checkout próprio? Se não houver, a API serve para um site Next.js com Supabase?

---

## 3. Mercado Pago (plano B do cartão e ponto de partida)

A conta já está ativa. As dúvidas abaixo são as que a página não responde.

> Olá. Somos a Água Verde Transfers (CNPJ 17.427.292/0001-46) e vendemos **transfer privado** pelo nosso site, via Checkout Pro / API.
>
> 1. Em reembolso total, as tarifas da transação são devolvidas? E em reembolso parcial?
> 2. O Programa de Proteção ao Vendedor não cobre serviços. Em contestação de cartão (chargeback) de transfer, qual é o procedimento, o prazo de defesa e o que é descontado de nós?
> 3. Cartão emitido no exterior: aceitam Visa, Mastercard e Amex no Checkout Pro e no Checkout Bricks? Há taxa adicional ou aprovação extra?
> 4. Posso escolher o prazo de recebimento (na hora, 14 dias, 30 dias) por venda ou só na conta toda? Dá para mudar a qualquer momento?
> 5. Parcelamento: posso oferecer em até 12x sem juros para o cliente? Qual o custo para mim por prazo de recebimento?

---

## 4. AbacatePay (só se quisermos reavaliar depois)

Fora da v1. Perguntas para guardar caso a taxa do cartão (3,5% + R$ 0,60 no à vista, D+30) faça sentido depois.

> Olá. Somos a Água Verde Transfers (CNPJ 17.427.292/0001-46), com **transfer privado** vendido pelo site.
>
> 1. Aceitam cartão emitido no exterior (Visa, Mastercard, Amex)? Em reais, com o banco do cliente fazendo a conversão?
> 2. A "análise do nosso time" no cartão é feita só no cadastro ou em cada venda? Quanto tempo leva?
> 3. Como funciona reembolso e chargeback no cartão? A tarifa é devolvida?
> 4. Atividade de transporte e turismo tem alguma restrição?
> 5. Há quanto tempo a empresa opera e quantos lojistas usam o checkout de cartão hoje?
> 6. O liquidante é sempre D+30 ou existe antecipação?

---

## Como ler as respostas

| Resposta | O que fazer |
|:--|:--|
| Stripe **aprova** a atividade | Seguir a estratégia da decisão 31 (cartão Stripe, Pix Woovi). |
| Stripe **nega** ou pede muita coisa | Cartão no Mercado Pago (conta ativa) e Pix na Woovi ou no próprio Mercado Pago. |
| Woovi diz que transporte é restrito ou o Pix só cai em muitos dias | Pix no Mercado Pago (0,99%) até esclarecer. |
| Stripe diz que não aceita Amex | Anotar na tela de pagamento do site e deixar Amex para o Mercado Pago, se a decisão passar a ser híbrida. |
