# Log: Fluxo de orçamento do site conectado ao Supabase

**Data:** 2026-06-26
**Fase:** Fase 2 — Webhook orçamentos
**Status:** Código implementado e deployado; pendente aplicação manual da migration + deploy da Edge Function

---

## Contexto e sintoma

O formulário de orçamento na home (`/#orcamento`) era uma **simulação pura**: `handleSubmit` fazia apenas `await setTimeout(1500ms)` e mostrava "Orçamento enviado!" — nenhum dado era salvo ou enviado à Água Verde. O mesmo problema existia no `ContactForm` da página `/contato`.

O usuário reportou após testar em produção: `https://agua-verde-site.vercel.app/#orcamento`.

## Causa raiz

O `FormOrcamento.tsx` (Fase 1) foi entregue como mock — a Fase 2 do `implementation_plan.md` previa a conexão com Supabase mas ainda não havia sido iniciada. Não existia:
- Tabela `orcamentos_site` no banco
- Edge Function de notificação
- INSERT real no formulário

## Solução implementada

Replicado o padrão de notificação já usado pelo PWA (`agua-verde-app`): **trigger PostgreSQL via `pg_net`** dispara **Edge Function Deno** que envia **e-mail via Resend** ao admin.

### Arquitetura do fluxo

```
Passageiro preenche formulário no site
        ↓
FormOrcamento (client) → INSERT em orcamentos_site (Supabase, RLS anon INSERT)
        ↓
Trigger trg_notificar_orcamento (AFTER INSERT)
        ↓
fn_notificar_orcamento() → net.http_post → Edge Function notificar-orcamento
        ↓
Edge Function → Resend API → e-mail ao admin (caio@uluwatour.com)
        ↓
E-mail contem botão "Responder no WhatsApp" (wa.me link pré-preenchido)
        ↓
Admin responde → converte em viagem no PWA → status = 'convertido'
```

### Arquivos criados/alterados

| Arquivo | Ação | Descrição |
|:--------|:-----|:----------|
| `supabase/migrations/20260626000000_create_orcamentos_site.sql` | Criado | Tabela `orcamentos_site` + RLS + indexes + trigger `fn_notificar_orcamento` |
| `supabase/functions/notificar-orcamento/index.ts` | Criado | Edge Function Deno: e-mail ao admin via Resend + botão WhatsApp |
| `src/components/home/FormOrcamento.tsx` | Alterado | `handleSubmit` faz INSERT real via `@/lib/supabase`; adicionados `name` aos inputs; tela de erro com retry |
| `tsconfig.json` | Alterado | `exclude: supabase/functions/**` (Deno não compila no typecheck do Next.js) |

### Schema da tabela `orcamentos_site`

Conforme `implementation_plan.md` §4:
- `id` UUID PK, `passageiro_nome/telefone/email`, `origem/destino`, `data_hora`
- `quantidade_passageiros/bagagens`, `numero_voo`, `observacoes`
- `status` (novo/respondido/convertido/descartado), `viagem_id` FK
- `utm_source/medium/campaign`, `ip_origem`, `user_agent`
- `created_at/updated_at`

### RLS

- **INSERT:** `anon` + `authenticated` (site sem auth pode criar orçamento)
- **SELECT/UPDATE/DELETE:** apenas `is_admin_or_gerente()` (admin do PWA gerencia leads)

### Trigger

`fn_notificar_orcamento()` — `SECURITY DEFINER`, lê `project_url` + `service_role_key` do `vault.decrypted_secrets` (com fallback `current_setting`), `net.http_post` fire-and-forget, `EXCEPTION → RAISE WARNING` (nunca falha o INSERT do cliente).

### Edge Function

`notificar-orcamento/index.ts` — espelha `whatsapp-email-notify` do PWA:
- Autentica `Bearer === SUPABASE_SERVICE_ROLE_KEY`
- `escapeHtml()` em todos os campos (XSS defense)
- HTML com grid de dados + botão "Responder no WhatsApp" (`wa.me` com mensagem pré-preenchida)
- Falhas logadas em `logs_processamento` (`tipo: 'notificar_orcamento'`)
- Variáveis: `RESEND_API_KEY`, `ORCAMENTO_ALERT_EMAIL_TO` (fallback `caio@uluwatour.com`), `APP_BASE_URL`

## Validação realizada

- ✅ `npm run build` passa limpo (12 rotas, sem erros de tipo)
- ✅ `.env.local` não commitado (confirmado via `git check-ignore`)
- ✅ Código pushado para GitHub → Vercel redeploy automático
- ⏳ **Migration NÃO aplicada** (MCP Supabase em modo read-only — pendente aplicação manual)
- ⏳ **Edge Function NÃO deployada** (pendente `supabase functions deploy`)

## Pendências manuais (bloqueantes)

1. **Aplicar migration** — colar `supabase/migrations/20260626000000_create_orcamentos_site.sql` no SQL Editor do dashboard Supabase
2. **Deployar Edge Function** — `supabase functions deploy notificar-orcamento --project-ref yblywknncmrbtxyhwbzr`
3. **Confirmar secrets** — `RESEND_API_KEY` (provavelmente já existe, usado pelo PWA); opcional `ORCAMENTO_ALERT_EMAIL_TO` se quiser mudar o destinatário

## Riscos residuais

- Sem a migration aplicada, o INSERT do formulário vai falhar → tela de erro aparece (com retry + fallback WhatsApp) — experiência controlada, não crash
- `ORCAMENTO_ALERT_EMAIL_TO` default é `caio@uluwatour.com` (mesmo admin do PWA); se a Água Verde quer outro destinatário (`contato@aguaverde.tur.br` ou `diretoria@`), configurar via `supabase secrets set`
- `ContactForm` da página `/contato` ainda é simulação (não abordado neste change — escopo era o formulário de orçamento testado pelo usuário)

## Follow-up

- Conectar `ContactForm.tsx` ao Supabase (tabela `contatos_site` ou reusar `orcamentos_site` com campo `assunto`)
- Adicionar captura de UTMs no `FormOrcamento` (campos `utm_source/medium/campaign` já existem na tabela)
- Redirects 301 das URLs do Starter (`vercel.json`)
