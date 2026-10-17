# Migrations da loja: escritas, NÃO aplicadas

Estes arquivos criam as tabelas da loja própria (plano §4.2, decisões 31 a 38).
**Nenhum deles foi aplicado em nenhum banco.** Ficam aqui, e não em `supabase/migrations/`,
de propósito: se o Supabase estiver ligado ao GitHub (aplicação automática ao juntar no `main`),
colocá-los na pasta de migrations os aplicaria sem o "pode" do dono.

## Para aplicar (Prompt C, com o "pode" explícito do dono)

1. Fazer a análise de risco para o PWA e o app nativo (CLAUDE.md do app dos motoristas).
2. Conferir, no banco, as colunas obrigatórias de `public.viagens` e os gatilhos dela
   (a função `confirmar_pedido` insere nela; veja os avisos `[CONFERIR]` no arquivo 3).
3. Tirar um snapshot do banco.
4. Mover os 3 arquivos para `supabase/migrations/` (mesma ordem pelo nome) e aplicar.
5. Rodar os advisors de segurança e desempenho antes e depois.

## O que cada arquivo faz

| Arquivo | Conteúdo |
|:--|:--|
| `20261020000100_loja_catalogo.sql` | `produtos`, `tipos_veiculo`, `alta_temporada`, `cotacoes` (leitura pública; escrita só admin/gerente) |
| `20261020000200_loja_pedidos.sql` | `pedidos`, `pedido_itens`, `pedido_eventos`, `gateway_eventos` (sem acesso anônimo) |
| `20261020000300_loja_funcoes.sql` | `confirmar_pedido` (única porta de confirmação), `reserva_por_token`, `expirar_pedidos_pendentes` |

## Regras que o CLAUDE.md impõe

- Não altera `perfis.tipo` nem nenhuma tabela existente. Só **lê** `viagens`/`fornecedores` e **insere** em `viagens`
  (da mesma forma que o PWA).
- Não cria `carrinho_itens` (não há carrinho).
- Passeio é "pago" na hora (vaga garantida, decisão 36): não existe o estado "aguardando confirmação".

## Como foram testados

As três migrations rodam num Postgres de verdade (PGlite, em memória) com tabelas de apoio no lugar de
`viagens`, `fornecedores` e `is_admin_or_gerente()`. O script `testar.mjs` (nesta pasta) faz 17 verificações:
criação sem erro, RLS bloqueando acesso anônimo, `confirmar_pedido` criando uma viagem por perna, repetindo
sem duplicar e recusando sem evento aprovado, `reserva_por_token` sem vazar o segredo, expiração.

```bash
npm install --no-save @electric-sql/pglite
node supabase/pendentes/testar.mjs
```

Isso prova a lógica; **não** prova que as colunas de `viagens` batem com o banco real (por isso os avisos `[CONFERIR]`).
