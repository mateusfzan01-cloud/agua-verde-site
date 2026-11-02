# Plano de Visibilidade em Buscadores de IA — v1

> **Objetivo:** fazer o ChatGPT, o Perplexity, o Gemini e o modo IA do Google citarem a Água Verde Transfers quando alguém perguntar sobre transfer em Recife, Porto de Galinhas, Praia dos Carneiros e Maragogi.
> **Origem:** sessão de brainstorm de 31/10 a 02/11/2026.
> **Lançamento do site novo:** previsto para o fim de novembro de 2026.
> **Status:** v1. Itens de código da seção 5.1 implementados no PR #10. Itens fora do código dependem do dono. Pendências de confirmação na seção 6.

---

## 1. Resumo em cinco linhas

1. Modelos de IA não citam "sites". Citam empresas em que já confiam e páginas que respondem a pergunta do jeito que ela foi feita.
2. A confiança na empresa é construída fora do site: Google Meu Negócio, TripAdvisor, revendedores, fóruns, blogs. O site é uma parte menor.
3. Hoje a reputação está no nome antigo (Uluwatour) e o site está no nome novo (Água Verde). Para uma IA, são duas empresas. Unificar isso vem antes de qualquer código.
4. Nada deste plano funciona no site atual (Paytour). Tudo depende do site novo estar no ar.
5. Quase tudo aqui também melhora o Google comum. O risco de "trabalhar à toa" é baixo.

---

## 2. O que a linha de base mostrou (pesquisas feitas em 01/11/2026)

| Descoberta | O que significa |
|:--|:--|
| aguaverde.tur.br não aparece em nenhuma busca sobre transfer em Recife, nem em português nem em inglês | Hoje a IA não tem como citar vocês. Quem domina: blog Viaje na Viagem (português) e revendedores Pelago, Lokalee, Magpie, Viator, Booking (inglês) |
| Revendedores já escrevem "Agua Verde Viagens & Receptivos, formerly Uluwatour" | A ponte entre os nomes existe na internet, mas não no site de vocês |
| A marca nova aparece com três nomes: "Transfers", "Viagens & Receptivos", "Turismo" | Cada menção vai para um nome diferente. Precisa de um nome principal |
| O preço de referência citado para Porto de Galinhas é R$ 150 a 230 (pousada, táxi, Uber) | Os R$ 350 vão parecer caros se a página não disser o que está incluído |
| Ninguém publica preço em reais para Praia dos Carneiros | Página com preço na primeira frase tem chance real de virar a fonte citada |
| O site atual (Paytour, atrás da Cloudflare) bloqueou todo acesso automatizado nos testes | Robôs de IA vêm de servidores. Precisa confirmar no painel que não estão bloqueados |
| uluwatour.com continua no ar e sem redirecionar | Prioridade número um do diagnóstico de maio, ainda pendente |

---

## 3. Como cada motor de IA escolhe o que citar

Os números vêm de empresas de SEO e divergem entre si. Use como direção, não como fato.

| Motor | Como acha fontes | O que isso pede |
|:--|:--|:--|
| ChatGPT | Só busca na web em parte das perguntas. Quando busca, usa o índice da Bing | Cadastrar no Bing Webmaster Tools, não só no Google |
| Perplexity | Busca quase sempre e cita muito o top 10 do Google | SEO tradicional continua valendo |
| Google AI Mode / AI Overviews | Quebra a pergunta em sub-perguntas e cita páginas específicas, muitas fora do top 10 | Páginas de nicho bem focadas ganham |
| Todos | Preferem parágrafos que fazem sentido sozinhos, com número, data e fonte | Resposta na primeira frase, data de atualização visível |
| llms.txt | Um em dez sites tem. Logs mostram que quase nenhum robô lê | Fazer, porque é barato. Não apostar nisso |

---

## 4. Decisões tomadas nesta versão

| Decisão | Escolha | Por quê | Custo se estiver errada |
|:--|:--|:--|:--|
| Nome principal | **Água Verde Transfers** | É o nome do logo e o que o site já usa em todas as páginas | Trocar uma constante e alguns textos |
| Nomes alternativos nos dados estruturados | "Água Verde Viagens & Receptivos", "Uluwatour", "Uluwatour Viagens & Receptivos" | É assim que a IA aprende que são a mesma empresa | Nenhum |
| Nota e quantidade de avaliações | **4,7 com 112 avaliações** (TripAdvisor, diagnóstico de 27/05/2026) | Era 4,9 com 47 no site. Número público e verificável vale mais que número interno | Editar um lugar só (`src/lib/json-ld.ts`) |
| Faixa de preço nos dados estruturados | **R$ 350 a R$ 580** | Era "R$ 320 a 580". Nenhuma página mostra R$ 320 | Editar a mesma constante |
| Preço de R$ 350 para Porto de Galinhas | **Mantido**, com explicação do que está incluído | O dono não pediu mudança. A página passa a dizer o que o táxi não tem | Mudar o número nas páginas |
| Preços de terceiros (táxi, Uber) no site | **Não publicar** | Ficam velhos rápido e viram passivo. O comparativo usa critérios, não valores | Nenhum |
| Ano de fundação e ano da troca de nome | **Não afirmar** | Não há fonte confiável no repositório. Melhor omitir que inventar | Nenhum |

---

## 5. Checklist em três janelas

### 5.1 Antes do lançamento — no código (este PR)

- [x] Uma fonte única para nota, avaliações, faixa de preço e data de atualização (`src/lib/json-ld.ts`), usada por todas as páginas.
- [x] Nomes alternativos (`alternateName`) nos dados estruturados da empresa.
- [x] Página Quem Somos com a ponte em texto corrido: "nasceu como Uluwatour Viagens & Receptivos e hoje opera como Água Verde Transfers".
- [x] Nas três landing pages (Porto de Galinhas, Praia dos Carneiros, Maragogi): primeira frase abaixo do título responde preço, distância e tempo.
- [x] Nas três landing pages: linha visível "Preços atualizados em novembro de 2026".
- [x] Nas três landing pages: comparativo "transfer privado × táxi × Uber" por critérios, sem preços de terceiros.
- [x] Nota "4,9" nas barras de números das landings trocada pela nota pública.
- [x] `robots.txt` liberando os robôs de IA pelo nome (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended e outros).
- [x] `llms.txt` com resumo da empresa, fatos principais e links das páginas.
- [x] Quem Somos com metadata própria (título, descrição com "antes Uluwatour Viagens & Receptivos", canonical). A página herdava a descrição do layout raiz.
- [ ] Praia de Carneiros: revisar se a página responde "quanto custa" melhor que qualquer concorrente (ninguém publica preço em reais).

### 5.2 No dia do lançamento — fora do código (dono)

- [ ] Redirecionar `uluwatour.com` para `aguaverde.tur.br`, página por página (contato → /contato, pacotes/transfers → landing correspondente, resto → início).
- [ ] Confirmar que a proteção contra robôs da Vercel não bloqueia os robôs de IA. A Vercel tem regras próprias ("Bot Protection" e regras de firewall para AI bots). Testar com `curl -A GPTBot https://aguaverde.tur.br/` e esperar resposta 200.
- [ ] Cadastrar o site no Google Search Console e enviar o sitemap.
- [ ] Cadastrar o site no **Bing Webmaster Tools** e enviar o sitemap. É o índice que o ChatGPT usa.
- [ ] Google Meu Negócio: nome "Água Verde Transfers", site novo, telefone e endereço iguais aos do site.
- [ ] Trocar o e-mail do nome antigo em qualquer lugar que ainda apareça.

### 5.3 Depois do lançamento — dezembro em diante

- [ ] Pedir ao TripAdvisor a troca do nome do perfil para "Água Verde Transfers (antes Uluwatour)". Pedido documental: comprovar mesmo CNPJ e a mudança de marca. Não depender disso para o resto.
- [ ] Responder perguntas antigas e novas no fórum do TripAdvisor e no Reddit ("how to get from Recife airport to Porto de Galinhas") com o nome certo e link.
- [ ] Publicar um artigo com dados reais das viagens (tempo médio por horário, quantos voos atrasados foram esperados). Nenhum concorrente consegue copiar.
- [ ] Versões em inglês e espanhol das landing pages (a base de idiomas já está no projeto, só adiada).
- [ ] Repetir a linha de base da seção 7 todo mês.

---

## 6. Perguntas em aberto para o dono

1. **Razão social e CNPJ completo.** O CNPJ nos dados estruturados está como `17.427.292/0001-4`, que parece incompleto (faltam dígitos). Confirmar e corrigir em `src/lib/json-ld.ts`.
2. **Nota e avaliações.** Confirmar que 4,7 e 112 batem com o TripAdvisor hoje. Se mudou, editar só `AVALIACAO_PUBLICA` em `src/lib/json-ld.ts`.
3. **Quem controla a Cloudflare/DNS de aguaverde.tur.br.** Ver no Registro.br quais são os servidores de nome. Se forem da Paytour, o problema some no lançamento. Se forem de vocês, revisar as regras de robôs.
4. **Preço de R$ 350.** Mantido nesta versão. Se a estratégia for competir com os R$ 150 das pousadas, o texto das páginas muda, não o plano.
5. **Dois números de avaliação na mesma home.** O bloco `SocialProof.tsx` ainda diz "4,9 com 47 avaliações no Google", com o logo do Google. O resto do site agora diz "4,7 com 112 no TripAdvisor". Não mexemos porque é uma afirmação sobre outra fonte, que não dá para verificar daqui. Decidir: trocar o bloco para o TripAdvisor, atualizar com os números reais do Google, ou remover.
6. **Duas afirmações no texto de Quem Somos.** "mesmo CNPJ" e "selo Travellers' Choice" vieram do diagnóstico de maio. Confirmar que continuam verdadeiras. O "mais de 110 avaliações" do mesmo parágrafo é número escrito à mão; revisar junto com a constante quando a contagem mudar.
7. **Teste dos robôs no dia do lançamento.** O preview da Vercel exige login, então o teste `curl -A GPTBot` só vale no domínio de produção. Fazer no dia.

---

## 7. Como medir (linha de base mensal, 30 minutos)

Fazer as mesmas perguntas em quatro motores (ChatGPT com busca, Perplexity, Gemini, Google AI Mode), em português e inglês, e anotar numa planilha quem foi citado:

1. Transfer do aeroporto de Recife para Porto de Galinhas, quanto custa?
2. Empresa confiável de transfer em Recife.
3. Como ir do aeroporto de Recife para a Praia dos Carneiros?
4. Transfer Recife para Maragogi, preço.
5. Private transfer Recife airport to Porto de Galinhas.
6. Is Uluwatour the same as Água Verde Transfers?

Registrar: data, motor, pergunta, empresas citadas, se aguaverde.tur.br apareceu. Meta para março de 2027: aparecer em pelo menos metade das perguntas em pelo menos dois motores.

---

## 8. Fontes consultadas

- Como o ChatGPT escolhe fontes: https://launchcodex.com/blog/seo-geo-ai/how-chatgpt-picks-sources/
- Diferenças de citação entre motores: https://www.pravinkumar.co/blog/perplexity-chatgpt-google-ai-mode-citation-differences-2026
- Como os motores de IA escolhem fontes em 2026: https://aeohunt.com/blog/how-ai-engines-choose-sources-2026
- llms.txt, adoção e uso real: https://dev.to/mrtd/llmstxt-reality-check-10-of-sites-have-it-ai-search-engines-almost-never-read-it-2281
- Cloudflare e robôs de IA: https://suganthan.com/notes/cloudflare-ai-crawler-defaults/
- Preços de referência para Porto de Galinhas: https://www.viajenaviagem.com/destino/porto-de-galinhas/como-chegar/
- Diagnóstico de marcas de 27/05/2026: `docs/diagnostico-marcas-uluwatour-agua-verde.md`
