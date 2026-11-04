# Log Técnico — Runner Dedicado (`dell-ci`) e Diretiva Híbrida de CI (Cloud × Local)

**Data:** 25/10/2026  
**Escopo:** Configuração do workflow `.github/workflows/ci.yml` no runner dedicado `dell-agua-verde-site` (`dell-ci`) e documentação da diretiva híbrida (Cloud vs. Local `dell-run`) em `AGENTS.md` e `CLAUDE.md`.

## Contexto e Motivação

Os agentes rodando em ambiente Cloud (Claude Web / Codex Cloud) no repositório `agua-verde-site` não tinham visibilidade da arquitetura do servidor local `dell-ci` porque as instruções estavam apenas nos outros repositórios (`medical-finance`, `agua-verde-app`, `agua-verde-transfers`) ou apenas no checkout local sem push para `origin/master`. Além disso, o repositório `mateusfzan01-cloud/agua-verde-site` ainda não possuía runner dedicado registrado no `dell-ci` nem workflow `.github/workflows/ci.yml`.

## Alterações Realizadas

1. **Runner Dedicado no `dell-ci`:**
   - Registrado e ativado o serviço `systemd` do runner `dell-agua-verde-site` (`~/runners/agua-verde-site`) no servidor `dell-ci` (Ubuntu Server 26.04.1 LTS) com as labels `self-hosted, linux, x64, dell`.
   - Provisionado o diretório `~/workspaces/agua-verde-site` no `dell-ci` para offload de builds locais via `dell-run`.
2. **Workflow `.github/workflows/ci.yml`:**
   - Configurado job `quality` em `runs-on: [self-hosted, linux, dell]` com Node 24 LTS executando `npm ci`, `npx tsc --noEmit` e `npm run build`.
   - Adicionada guarda de segurança (`if: github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository`) para impedir que PRs de forks externos executem no runner próprio.
3. **Documentação (`AGENTS.md` e `CLAUDE.md`):**
   - Documentada a diretiva híbrida: agentes em Cloud validam no próprio container e via GitHub Actions no PR (sem tentar `ssh dell-ci`), enquanto agentes locais no Windows utilizam `dell-run` (`node C:/Users/mzanl/Documents/scripts/run-on-dell.mjs <comando>`).
