# Conteúdo dos produtos da loja (`produtos.json`)

Gerado em 09/10/2026. Este arquivo é o **rascunho do catálogo da loja própria**: os 46 produtos que a Paytour vendia em julho de 2025, com o texto corrigido e traduzido para **português, espanhol e inglês**. Ele já está no formato da futura tabela `produtos` (plano §4.2), então pode ser importado direto quando a tabela existir.

Nada aqui está publicado. É material para o dono e o sócio revisarem.

## Como ler o arquivo

Cada produto é um bloco com os campos abaixo. Os campos em três idiomas têm sempre `pt`, `es` e `en`.

| Campo | O que é | De onde veio |
|:--|:--|:--|
| `ordem` | Posição na lista (1 a 46) | Ordem do CSV da Paytour |
| `slug` | Endereço novo da página (ex.: `aeroporto-recife-olinda-ida`) | Criado agora, curto e sem "privativo" |
| `slug_paytour` | Endereço antigo na Paytour | Copiado do CSV, sem mudança (serve para o redirecionamento 301) |
| `nome_paytour` | Nome antigo, como estava na Paytour | Copiado do CSV (só para conferência) |
| `tipo` | `transfer` ou `passeio` | Categoria da Paytour ("Serviços" virou passeio), com uma correção: Serrambi é transfer |
| `nome`, `descricao` | Nome e texto da página, nos 3 idiomas | Descrição curta do CSV, corrigida e reescrita; traduções feitas agora |
| `inclusos`, `nao_inclusos` | Listas do que está e do que não está incluído | Só o que aparece no texto da Paytour ou no levantamento do plano (§1.2). Ficou vazio quando a fonte não dizia |
| `origem_padrao`, `destino_padrao`, `sentido` | Trajeto e sentido | Nome do produto. "Ida ou volta" ficou como `ida`; o cliente escolhe o sentido na compra |
| `preco_base` | Preço em reais | **Exatamente** o do CSV (julho/2025) |
| `veiculos`, `max_por_compra` | Preço por veículo, igual à Paytour | Só Maragogi ida e volta preenchido (print de 09/10/2026); os outros estão `null`. Gerado por `scripts/aplicar_veiculos.py` a partir de `veiculos-paytour.json` |
| `duracao_min` | Duração em minutos | Ficou vazio (`null`) em todos: a fonte não trazia a duração com segurança |
| `confirmacao` | `imediata` (transfer) ou `24h` (passeio) | Regra do plano (decisão 20) |
| `imagens` | Fotos do produto | Vazio em todos. Ver "Fotos" abaixo |
| `ativo` | Se aparece na loja | `false` só para Caruaru São João e Curitiba (plano §3) |
| `seo` | Título (até 60 caracteres) e descrição (até 155) para o Google | Escritos agora |
| `descricao_completa` | Se o texto veio da página completa | `false` em todos (ver abaixo) |
| `notas_revisao` | O que foi corrigido e o que falta decidir, produto a produto | Escrito agora |

## Texto completo ou texto curto?

- **Com texto completo: 0 produtos.**
- **Com texto curto (do CSV): 46 produtos.**

O plano era buscar o texto inteiro de cada produto na cópia da loja Paytour guardada no Wayback Machine (julho/2025). Em 09/10/2026, todas as tentativas falharam: a conexão com `web.archive.org` era cortada pela rede antes de responder (5 tentativas por página, com espera crescente). O site atual da loja também bloqueia acesso automático. Por isso o texto de cada produto foi montado só com o trecho curto do CSV, que vinha cortado no meio (com "..."). **Nada foi inventado para completar o trecho cortado**; onde faltou informação, isso está escrito nas `notas_revisao`.

Se alguém conseguir abrir as páginas antigas (ou tiver os textos guardados), basta mandar que o arquivo é atualizado.

## O que foi padronizado em todos os produtos

- Erros corrigidos: definifir, aguarando, monitando, Estalereiro, Murto Alto, ímperdível, imperdivel, hoteís, tabua de marés, Pontualide, PIna, Ponte do Limeiro (→ Limoeiro), catamara, veiculo, Sirinhaem, "boas vindas" (→ boas-vindas), espaços antes de vírgulas e parênteses tortos nos nomes.
- Políticas novas aplicadas em todos os textos: **espera grátis de 60 min no aeroporto e 15 min em endereço**, **cancelamento grátis até 24 h antes**, **monitoramento do voo** nos transfers de aeroporto, e nos passeios **confirmação em até 24 h com reembolso automático se não houver vaga**.
- **Pedágio** só aparece como incluso onde o texto original dizia. Ficaram **sem pedágio**: Maceió, Noronha, Curitiba e os transfers que diziam só "veículo e motorista" (Olinda → Maragogi, Porto de Galinhas → Maragogi, Olinda → Porto de Galinhas, Porto de Galinhas → Carneiros, Caruaru São João).
- Mergulho: retirado o "tarifas 2023" do texto (o preço é o do CSV).
- Espanhol escrito para o público argentino ("vos": *elegís*, *reservás*; "chofer", "hall de arribos"), sem gírias.

## Fotos

As 69 URLs de `imagens-paytour-2025-07.txt` não dizem a que produto pertencem, e sem as páginas antigas não deu para ligar foto a produto. Para não arriscar foto errada, o campo `imagens` ficou vazio. A sugestão é usar as fotos originais do Drive.

## Pendências para o dono decidir

1. **Textos completos**: os 46 produtos estão com texto curto. Faltam roteiro, horários, duração e o que não está incluído, principalmente nos passeios. Vale mandar os textos (ou revisar produto a produto).
2. **Preço por veículo** (decidido em 09/10: copiar a Paytour): falta a lista de veículos e preços atuais de 45 produtos. Os preços de jul/2025 estão desatualizados (Maragogi ida e volta passou de R$ 700 para R$ 740).
3. **Serrambi × Sirinhaém** (produtos 14 e 46): parecem o mesmo trajeto com preços diferentes (R$ 250 e R$ 300). Qual fica?
4. **Mergulhos e carro para noivas**: o preço é por pessoa ou por grupo? A regra de passageiros dos transfers não serve para eles. O carro de noivas não tem descrição (o texto original era só "Motorista Agua veículo privativo"); talvez seja melhor vender por orçamento no WhatsApp.
5. **Pedágio**: confirmar os trajetos que ficaram sem pedágio (lista acima). Se a empresa paga o pedágio também nesses, é só avisar.
6. **Placa com nome e estacionamento no aeroporto**: foram colocados em todos os transfers de aeroporto com base no levantamento do plano (§1.2). Confirmar, inclusive em Noronha.
7. **Produtos desativados**: Caruaru São João (sazonal, com ano no nome) e Curitiba (fora da área, parece teste). Remover de vez ou manter guardados?
8. **Noronha** (transfer e catamarã): a empresa ainda atende a ilha?
9. **Passeio Carneiros**: o texto dizia "duração de 1,5 hora"; foi entendido como o tempo de viagem até a praia. Confirmar.
10. **4 praias do Cabo**: quais são as quatro praias? Isso melhora o texto e o Google.
11. **Trilha dos Escravos** (R$ 200 × R$ 700 com saída do Recife): o que muda entre os dois além do transporte?
12. **Suape**: vale também para a volta (Suape → Recife)? É um serviço para empresas?
13. **Preços**: são os de julho/2025. Revisar antes de publicar.
