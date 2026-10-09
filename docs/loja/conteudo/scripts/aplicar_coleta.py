"""Aplica a coleta da Paytour (paytour-coleta-2026-10.json) ao catálogo.

Rodar da raiz do repositório:  python3 docs/loja/conteudo/scripts/aplicar_coleta.py

Gera docs/loja/conteudo/veiculos-paytour.json (tipos de veículo + lista por produto)
e atualiza em produtos.json: modelo de preço, veículos, preco_base, max_por_compra,
preco_por_pessoa, imagens e o texto original da Paytour (descricao_paytour).
Não mexe nos textos traduzidos (nome, descricao, inclusos, seo).
"""
import json
import re
from pathlib import Path

base = Path("docs/loja/conteudo")
coleta = json.loads((base / "paytour-coleta-2026-10.json").read_text(encoding="utf-8"))
produtos = json.loads((base / "produtos.json").read_text(encoding="utf-8"))

TIPOS = {
    "Carro Sedan Ecônomico": "sedan_economico",
    "Carro Sedan Econômico": "sedan_economico",
    "Carro Sedan Executivo": "sedan_executivo",
    "Carro Spin": "spin",
    "Mini Van": "mini_van",
    "Van Sprinter Mercedes Benz": "sprinter",
    "Micro-Ônibus": "micro_onibus",
    "BMW X1": "bmw_x1",
}
TIPOS_INFO = {
    "sedan_economico": {"pt": "Carro Sedan Econômico", "es": "Auto sedán económico", "en": "Economy sedan", "pax_max": 3,
        "capacidade": {"pt": "Até 3 pessoas com 1 mala de 23 kg e 2 de mão", "es": "Hasta 3 personas con 1 valija de 23 kg y 2 de mano", "en": "Up to 3 people with 1 checked bag (23 kg) and 2 carry-ons"}},
    "sedan_executivo": {"pt": "Carro Sedan Executivo", "es": "Auto sedán ejecutivo", "en": "Executive sedan", "pax_max": 2,
        "capacidade": {"pt": "Até 2 pessoas com 1 mala de 23 kg e 2 de mão", "es": "Hasta 2 personas con 1 valija de 23 kg y 2 de mano", "en": "Up to 2 people with 1 checked bag (23 kg) and 2 carry-ons"}},
    "spin": {"pt": "Carro Spin", "es": "Auto Spin (monovolumen)", "en": "Chevrolet Spin (MPV)", "pax_max": 4,
        "capacidade": {"pt": "Até 4 pessoas com no máximo 4 malas de 23 kg", "es": "Hasta 4 personas con máximo 4 valijas de 23 kg", "en": "Up to 4 people with up to 4 checked bags (23 kg)"}},
    "mini_van": {"pt": "Mini Van", "es": "Minivan", "en": "Minivan", "pax_max": 8,
        "capacidade": {"pt": "Até 8 pessoas com no máximo 6 malas de 23 kg", "es": "Hasta 8 personas con máximo 6 valijas de 23 kg", "en": "Up to 8 people with up to 6 checked bags (23 kg)"}},
    "sprinter": {"pt": "Van Sprinter Mercedes-Benz", "es": "Van Sprinter Mercedes-Benz", "en": "Mercedes-Benz Sprinter van", "pax_max": 17,
        "capacidade": {"pt": "Até 17 pessoas com até 17 malas de mão", "es": "Hasta 17 personas con hasta 17 valijas de mano", "en": "Up to 17 people with up to 17 carry-ons"}},
    "micro_onibus": {"pt": "Micro-ônibus", "es": "Minibús", "en": "Minibus", "pax_max": 26,
        "capacidade": {"pt": "Até 26 pessoas com no máximo 26 malas de 10 kg", "es": "Hasta 26 personas con máximo 26 valijas de 10 kg", "en": "Up to 26 people with up to 26 bags (10 kg)"}},
    "bmw_x1": {"pt": "BMW X1", "es": "BMW X1", "en": "BMW X1", "pax_max": 3,
        "capacidade": {"pt": "Até 3 pessoas com 1 mala de 23 kg e 2 de mão", "es": "Hasta 3 personas con 1 valija de 23 kg y 2 de mano", "en": "Up to 3 people with 1 checked bag (23 kg) and 2 carry-ons"}},
}


def slug_da_url(url):
    return url.rstrip("/").split("/passeio/")[-1].strip("-")


def preco_por_pessoa(texto):
    m = re.search(r"R\$\s*([\d.]+,\d{2})", texto or "")
    return float(m.group(1).replace(".", "").replace(",", ".")) if m else None


por_slug = {slug_da_url(c["url"]): c for c in coleta["produtos"]}
lista_veiculos = {}

for p in produtos:
    c = por_slug[p["slug_paytour"].strip("-")]
    for campo in ("pax_incluidos", "adicional_por_pax", "pax_max"):
        p.pop(campo, None)
    notas = [n for n in p.get("notas_revisao", []) if not n.startswith(("Preço por veículo", "Preço por pessoa", "Coleta Paytour"))]

    if c["veiculos"]:
        veiculos = [{"tipo": TIPOS[v["nome"]], "preco": float(v["preco"])} for v in c["veiculos"]]
        p["modelo_preco"] = "por_veiculo"
        p["veiculos"] = veiculos
        p["preco_por_pessoa"] = None
        p["preco_base"] = min(v["preco"] for v in veiculos)
        lista_veiculos[p["slug_paytour"]] = veiculos
        notas.append(f"Preço por veículo da coleta Paytour de {coleta['coletado_em']} ({len(veiculos)} veículos); preco_base = veículo mais barato.")
    else:
        valor = preco_por_pessoa(c["preco_outro_formato"])
        p["modelo_preco"] = "por_pessoa"
        p["veiculos"] = None
        p["preco_por_pessoa"] = valor
        p["preco_base"] = valor
        notas.append(f"Preço por pessoa (R$ {valor:.2f}) na coleta Paytour de {coleta['coletado_em']}; produto sem lista de veículos.")

    p["max_por_compra"] = c["max_por_compra"] or None
    p["imagens"] = c["fotos"]
    p["descricao_paytour"] = c["descricao_completa"]
    p["nome_paytour"] = c["nome"]
    p["categoria_paytour"] = c["categoria"]
    p["notas_revisao"] = notas

(base / "produtos.json").write_text(json.dumps(produtos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(base / "veiculos-paytour.json").write_text(json.dumps({
    "_sobre": f"Gerado por scripts/aplicar_coleta.py a partir de paytour-coleta-2026-10.json (coleta de {coleta['coletado_em']}, preços do dia {coleta['data_usada_no_calendario']}). Cada produto da Paytour tem a sua própria lista de veículos. Chave dos produtos = slug_paytour.",
    "tipos": TIPOS_INFO,
    "produtos": lista_veiculos,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(len(produtos), "produtos;", len(lista_veiculos), "por veículo;", len(produtos) - len(lista_veiculos), "por pessoa")
