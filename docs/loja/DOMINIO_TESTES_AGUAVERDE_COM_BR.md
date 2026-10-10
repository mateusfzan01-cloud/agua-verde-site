# Domínio de testes: aguaverde.com.br

> Decisão 35 do plano (10/10/2026), a pedido do irmão do dono.
> `aguaverde.com.br` já é da empresa (Registro.br), mas ainda não aponta para a Vercel.
> O domínio oficial do site continua sendo `aguaverde.tur.br`.

## Para que serve

- Testar a loja nova antes do lançamento: navegação, pagamento com compras de R$ 1 e estorno, e-mails e WhatsApp.
- Mostrar o site para o sócio e o irmão em um endereço fácil de lembrar.

## Regras

1. **Fora do Google.** Enquanto for teste, o domínio responde com `noindex` e o `robots.txt` bloqueia tudo. Assim ele não compete com `aguaverde.tur.br` nas buscas. Isso será feito no código da loja (Prompt B).
2. **Sem clientes reais.** Só compras de teste de R$ 1, feitas pela equipe.
3. **Depois do lançamento**, decidir: redirecionar `aguaverde.com.br` → `aguaverde.tur.br` (recomendado) ou manter como ambiente de testes.

## Passo a passo para ligar o domínio (quem tem acesso à Vercel e ao Registro.br)

Não foi feito por esta sessão: precisa de acesso às contas.

1. **Vercel** → projeto `agua-verde-site` → *Settings* → *Domains* → *Add* → digite `aguaverde.com.br`.
   Adicione também `www.aguaverde.com.br`, apontando para o primeiro.
   Para testar a loja antes de ela ir para o site principal, ligue o domínio à branch de testes, e não à branch principal (`master`).
2. A Vercel mostra os registros de DNS a criar: normalmente um registro **A** para `aguaverde.com.br` e um **CNAME** para `www`. Use exatamente os valores que a Vercel mostrar.
3. **Registro.br** → domínio `aguaverde.com.br` → *DNS* → *Editar zona* → crie os registros do passo 2 e salve.
4. Espere a propagação (de minutos a algumas horas). A Vercel mostra "Valid Configuration" e emite o certificado (cadeado) sozinha.
5. Abra `https://aguaverde.com.br` e confira.

## Pendências

- Confirmar quem faz os passos 1 a 3 (irmão do dono?).
- Confirmar se o e-mail do domínio `.com.br` existe ou será criado (hoje os e-mails usam `@aguaverde.tur.br`).
