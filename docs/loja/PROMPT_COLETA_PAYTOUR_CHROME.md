# Prompt — coleta da loja Paytour pelo Chrome (Claude no computador do dono)

> Para colar no Claude Desktop com a extensão Claude in Chrome ligada.
> Motivo: a Paytour bloqueia o servidor da nuvem (erro 403 da Cloudflare); no navegador do dono ela abre normalmente.
> O resultado volta para a sessão da nuvem, que atualiza `docs/loja/conteudo/produtos.json` e o protótipo.

---

```
Use o Chrome (extensão Claude in Chrome) para coletar dados da minha loja na Paytour. É só leitura.

REGRAS
- Não faça login, não adicione ao carrinho, não clique em "Comprar"/"Reservar"/"Finalizar", não preencha dados pessoais.
- Pode escolher uma data no calendário só para os preços aparecerem (use 24/11/2026; se não houver vaga, tente o dia seguinte).
- Abra uma aba nova; não mexa nas abas que já estão abertas.
- Se a página pedir captcha ou algo estranho, pare e me avise.

ONDE
- Loja: https://aguaverde.tur.br (plataforma Paytour). Encontre a lista completa de produtos (transfers e passeios).
  Na cópia de jul/2025 eram 46 produtos (28 transfers e 18 passeios). Se o número for diferente, me diga quais entraram ou saíram.

O QUE ANOTAR EM CADA PRODUTO
1. Nome exato e endereço (URL) da página.
2. Categoria (Transfer ou Serviço/Passeio) e o preço "A partir de".
3. Lista de veículos (bloco "Quantidade de transfers..."): para cada um, nome, texto da capacidade entre parênteses e preço.
   Exemplo de Maragogi ida e volta: "Carro Sedan Econômico | Até 3 pessoas c/ 1 bagagem 23kg e 2 mão | R$ 740,00".
   Anote também o aviso de máximo por compra (ex.: "máximo ... é: 10").
   Se o produto não tiver lista de veículos (passeios costumam ter preço por pessoa), anote como o preço aparece: por pessoa, por grupo, faixas etc.
4. Texto completo de "Ler descrição": roteiro, horários, duração, o que inclui, o que não inclui, políticas. Copie o texto como está, sem corrigir.
5. Endereços (URLs) das fotos do produto, na ordem da galeria.

COMO ENTREGAR
- Monte um único arquivo JSON chamado paytour-coleta-2026-10.json e salve na pasta Downloads, neste formato:
  {
    "coletado_em": "AAAA-MM-DD",
    "data_usada_no_calendario": "2026-11-24",
    "total_produtos": 0,
    "produtos": [
      {
        "nome": "...",
        "url": "...",
        "categoria": "Transfer",
        "a_partir_de": 740.00,
        "veiculos": [ {"nome": "Carro Sedan Econômico", "capacidade": "Até 3 pessoas c/ 1 bagagem 23kg e 2 mão", "preco": 740.00} ],
        "max_por_compra": 10,
        "preco_outro_formato": null,
        "descricao_completa": "...",
        "fotos": ["https://..."],
        "observacoes": "algo que chamou atenção ou não deu para ler"
      }
    ]
  }
- Preços como número (740.00), sem "R$".
- No fim, me mostre um resumo: quantos produtos, quantos com lista de veículos, quais deram problema.
```

---

**Depois:** mande o arquivo `paytour-coleta-2026-10.json` aqui na sessão da nuvem (anexo ou colando o texto). Eu confiro, atualizo o catálogo e o protótipo, e salvo no PR #3.
