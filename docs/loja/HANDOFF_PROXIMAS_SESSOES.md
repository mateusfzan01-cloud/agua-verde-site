# Handoff — próximas sessões da loja própria

> Escrito em 09/10/2026, ao fim da sessão de planejamento (log em `LOG_SESSAO_2026-10-08_PLANO_LOJA_PROPRIA.md`).
> Cada bloco abaixo é um prompt pronto para abrir uma sessão nova no repositório `agua-verde-site`.
> Ordem recomendada: A agora; B depois que o dono aprovar as telas de A; C e D quando os bloqueios indicados forem resolvidos.

## O que está liberado e o que está bloqueado

| Frente | Depende de | Estado |
|:--|:--|:--|
| A. Protótipos das 4 telas + conteúdo (traduções, termos, templates WhatsApp, pedido TripAdvisor) | nada | **liberada** |
| B. Código do site sem efeito em produção (rotas, i18n, catálogo, widget, camada de pagamento simulada, migrations escritas e não aplicadas) | aprovação das telas de A | aguardando A |
| C. Checkout real, tabelas no banco, Edge Functions, telas no PWA e no app | conta Mercado Pago; "pode" do dono para o banco; Supabase em Small | bloqueada |
| D. Auditoria do Google Ads | acesso de leitura à conta | bloqueada |
| E. Manutenção do Supabase (pg_net, índices) | "pode" explícito do dono | bloqueada |

---

## Prompt A — protótipos e conteúdo

```
Leia docs/loja/PLANO_LOJA_PROPRIA_V1.md, docs/loja/LOG_SESSAO_2026-10-08_PLANO_LOJA_PROPRIA.md,
docs/loja/catalogo-paytour-2025-07.csv e docs/loja/pesquisa/pesquisa-benchmark.md.
O plano está aprovado. Tarefa: adiantar o que não depende de banco, pagamento nem contas do dono.

1. Protótipos navegáveis das 4 telas-chave (home, página de produto/rota, checkout, confirmação/minha reserva),
   mobile-first, em PT, com seletor ES/EN funcionando, usando dados reais do catálogo (preços da Paytour),
   as 4 promessas (preço fixo com pedágio, cancelamento grátis até 24 h, monitoramento de voo, 60 min de espera),
   o selo/nota do TripAdvisor Uluwatour e os tokens de design do CLAUDE.md. Publicar como página (Artifact)
   para o dono ver no celular. Depois, tentar levar as 4 telas ao Figma (skill figma-generate-design);
   se o assento do Figma for só de visualização ou o conector pedir autorização, avisar e seguir só com o HTML.
2. Conteúdo: revisão ortográfica e tradução ES/EN dos 46 produtos (gravar em docs/loja/conteudo/ como JSON
   pronto para a futura tabela produtos); rascunho dos Termos de Uso com política de cancelamento 24 h e espera
   60/15 min (o dono é advogado e revisa); textos dos templates WhatsApp utility (confirmação, voucher, lembrete)
   em pt_BR/es/en; texto do pedido ao TripAdvisor para "Uluwatour Viagens & Receptivos (Água Verde Viagens e Receptivos)".
3. Não criar tabelas, não aplicar migrations, não alterar Edge Functions, não mexer no PWA nem no app.
Trabalhe em branch própria, abra PR em rascunho e pare para o dono aprovar as telas.
```

## Prompt B — código sem efeito em produção (depois da aprovação das telas)

```
Leia docs/loja/PLANO_LOJA_PROPRIA_V1.md (§4) e o PR de protótipos aprovado.
Implementar no Next.js, sem tocar no banco de produção:
middleware next-intl com /es e /en; rotas /transfers, /passeios, /transfers/[slug], /passeios/[slug] lendo o JSON
de docs/loja/conteudo/; widget de reserva com cálculo de preço (§4.3) e testes; páginas de checkout e confirmação
com a camada de pagamento atrás da interface do §4.7 (criarCobranca, consultarPagamento, reembolsar, validarWebhook)
em implementação simulada; redirects 301 dos slugs da Paytour; migrations SQL das tabelas da loja escritas em
supabase/migrations/ mas NÃO aplicadas. npm run build tem de passar. PR em rascunho.
```

## Prompt C — checkout real e integrações (quando desbloqueado)

```
Pré-requisitos confirmados pelo dono: conta Mercado Pago ativa (credenciais nos segredos), Supabase em Small,
"pode" explícito para aplicar as migrations da loja. Antes de qualquer alteração compartilhada, fazer a análise
de risco para o PWA exigida no CLAUDE.md do appnativo-aguaverde. Implementar §4.2, §4.5, §4.7 do plano:
aplicar migrations, Edge Function do webhook com gateway_eventos, confirmar_pedido transacional, cron de
expiração, avisos (push no app, e-mail, WhatsApp), telas "Pedidos do site" no PWA e no app nativo.
Homologar em staging com compras de R$ 1 e estorno.
```

## Prompt D — auditoria do Google Ads (quando houver acesso)

```
Leia o §12 do docs/loja/PLANO_LOJA_PROPRIA_V1.md e o tema 6 de docs/loja/pesquisa/pesquisa-comunidade-2026.md.
Auditar, só lendo, as 3 campanhas existentes (R$ 2.000/mês): termos de pesquisa, correspondências, lances,
destino, conversões, migração automática para AI Max. Entregar relatório e lista de otimizações para o irmão
do dono aprovar uma a uma. Nada é alterado na conta.
```

## Prompt E — manutenção do Supabase (com "pode" do dono)

```
Leia a seção "Supabase, estado verificado em 2026-10-09" do §8 do plano. Com o "pode" explícito do dono:
limpar net._http_response, remover o índice duplicado de driver_locations, criar índices nas chaves estrangeiras
mais consultadas, corrigir o porte no CLAUDE.md do agua-verde-app. Snapshot antes, migration versionada,
advisors antes e depois. Mover anexos de e-mail para o Storage é pacote separado.
```
