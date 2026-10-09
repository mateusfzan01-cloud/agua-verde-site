"""Aplica os preços por veículo (veiculos-paytour.json) ao produtos.json.

Rodar da raiz do repositório:  python3 docs/loja/conteudo/scripts/aplicar_veiculos.py
Troca a regra antiga de passageiros (pax_incluidos/adicional_por_pax/pax_max)
pelo modelo da Paytour: cada produto tem uma lista de veículos com preço próprio.
"""
import json
from pathlib import Path

base = Path("docs/loja/conteudo")
produtos = json.loads((base / "produtos.json").read_text(encoding="utf-8"))
dados = json.loads((base / "veiculos-paytour.json").read_text(encoding="utf-8"))

for p in produtos:
    for campo in ("pax_incluidos", "adicional_por_pax", "pax_max"):
        p.pop(campo, None)
    info = dados["produtos"].get(p["slug_paytour"])
    p["max_por_compra"] = 10
    notas = [n for n in p.get("notas_revisao", []) if not n.startswith("Preço por veículo")]
    if info:
        p["veiculos"] = info["veiculos"]
        p["preco_base"] = min(v["preco"] for v in info["veiculos"])
        notas.append(f"Preço por veículo copiado da Paytour ({info['fonte']}); preco_base = veículo mais barato.")
    else:
        p["veiculos"] = None
        if p["tipo"] == "transfer":
            notas.append("Preço por veículo pendente: copiar a lista de veículos e preços desta página na Paytour. preco_base ainda é o valor de jul/2025.")
    p["notas_revisao"] = notas

(base / "produtos.json").write_text(json.dumps(produtos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(sum(1 for p in produtos if p["veiculos"]), "produto(s) com veículos;", len(produtos), "no total")
