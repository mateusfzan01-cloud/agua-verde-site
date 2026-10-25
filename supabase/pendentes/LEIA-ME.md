# Migrations da loja: aplicadas em 17/10/2026 e 23/10/2026

As tabelas e funções da loja própria (plano §4.2, decisões 31 a 38) **já estão no banco** (projeto `yblywknncmrbtxyhwbzr`),
aplicadas no Prompt C com o "pode" do dono. Os arquivos ficam em `supabase/migrations/` com a mesma versão do banco.
Nenhuma tabela existente foi alterada; as novas estão **vazias** e o site ainda não grava nelas.

| Versão no banco | Arquivo | Conteúdo |
|:--|:--|:--|
| 20261017193120 | `loja_catalogo` | `produtos`, `tipos_veiculo`, `alta_temporada`, `cotacoes` (leitura pública; escrita só admin/gerente) |
| 20261017193226 | `loja_pedidos` | `pedidos`, `pedido_itens`, `pedido_eventos`, `gateway_eventos` (sem acesso anônimo) |
| 20261017193302 | `loja_funcoes` | `confirmar_pedido` (única porta de confirmação), `reserva_por_token`, `expirar_pedidos_pendentes` |
| 20261017194244 | `loja_endurecer_permissoes` | tira permissões de escrita de anon/authenticated (defesa em dobro com o RLS) |
| 20261017194355 | `loja_reserva_por_token_so_servidor` | a leitura da reserva só roda pelo servidor (chave de serviço) |
| 20261017200000 | `loja_numero_reembolso_pagamento_tardio` | `proximo_numero_pedido`; `reembolsar_pedido` (cancela as viagens não iniciadas); `confirmar_pedido` aceita pedido expirado pago depois do prazo |
| 20261023122627 | `loja_dois_provedores` (arquivo `20261022000000_…`, etapa B1) | `gateway_eventos` ganha a coluna `gateway` e a chave vira `(gateway, evento_id)`; `pedidos` ganha a restrição "pago ou reembolsado exige `gateway`"; `confirmar_pedido` só aceita evento aprovado do provedor do pedido. **Aplicada em 2026-10-23** com o "pode" do dono (tabelas vazias antes e depois; conferido: chave, restrição, função e permissões) |

## O que foi conferido no banco real (só leitura) antes de aplicar

- `fornecedores.id` e `viagens.fornecedor_id` são **UUID** (o SQL original usava número e daria erro; corrigido).
- Só `passageiro_nome`, `origem`, `destino` e `data_hora` são obrigatórias em `viagens`; `status 'pendente'` é válido.
- O gatilho `gerar_token_cliente` cria o `token_cliente` sozinho no INSERT (é o que forma o link de acompanhamento).
- Gatilhos no INSERT de `viagens` (normalizar telefone, auditoria, conciliação, push só com motorista) não bloqueiam a inserção.
- O fornecedor "Agua Verde" existe.

## Teste feito no banco real (desfeito no final)

Um bloco único criou um pedido de 2 pernas, recusou a confirmação sem evento, aceitou com evento aprovado, criou 2 viagens
(fornecedor Agua Verde, token de 24 caracteres) e leu a reserva; terminou com erro proposital para desfazer tudo.
Depois: 0 pedidos, 0 viagens de teste, 8.392 viagens (igual a antes).
Alertas de segurança (advisors): iguais aos de antes; o único novo (`reserva_por_token` aberta) foi fechado.
A parte 4 foi testada do mesmo jeito (confirmar pedido expirado, reembolsar e cancelar 2 viagens, repetir sem efeito) e desfeita; os números AV-2026-000001 e 000002 foram gastos nos testes.

## Teste local

As migrations também rodam num Postgres de verdade (PGlite) com tabelas de apoio no lugar de `viagens`, `fornecedores` e
`is_admin_or_gerente()`; `testar.mjs` faz 21 verificações.

```bash
npm install --no-save @electric-sql/pglite
node supabase/pendentes/testar.mjs
```

## Como desfazer (se precisar)

Tudo é novo e vazio: `DROP FUNCTION public.confirmar_pedido(uuid,text), public.reserva_por_token(text), public.expirar_pedidos_pendentes();`
e `DROP TABLE public.gateway_eventos, public.pedido_eventos, public.pedido_itens, public.pedidos, public.cotacoes, public.alta_temporada, public.produtos, public.tipos_veiculo; DROP SEQUENCE public.pedidos_numero_seq;`
(só enquanto estiverem vazias).

## Regras que o CLAUDE.md impõe

- Não altera `perfis.tipo` nem nenhuma tabela existente. Só **lê** `fornecedores` e **insere** em `viagens` (como o PWA).
- Não cria `carrinho_itens`.
