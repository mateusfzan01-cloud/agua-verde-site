# Gera docs/loja/conteudo/produtos.json a partir do CSV Paytour + textos revisados.
import csv, json, sys

REPO = "/home/user/agua-verde-site"
CSV = REPO + "/docs/loja/catalogo-paytour-2025-07.csv"
OUT = REPO + "/docs/loja/conteudo/produtos.json"

rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
assert len(rows) == 46

def preco(s):
    return float(s.replace(".", "").replace(",", "."))

L = ("pt", "es", "en")
BRAND = " | Água Verde"

def seo_title(t):
    out = {}
    for k in L:
        s = t[k] + BRAND
        if len(s) > 60:
            s = t[k]
        assert len(s) <= 60, (k, s, len(s))
        out[k] = s
    return out

SHORT_TAIL = {"pt": ". Voo monitorado, espera e cancelamento grátis.", "es": ". Vuelo monitoreado, espera y cancelación sin cargo.", "en": ". Flight tracking, free waiting and cancellation."}
def check_desc(d):
    for k in L:
        if len(d[k]) > 155 and ". " in d[k]:
            d[k] = d[k].split(". ")[0] + SHORT_TAIL[k]
        assert len(d[k]) <= 155, (k, d[k], len(d[k]))
    return d

NOTA_PAX = "pax_incluidos=3, adicional_por_pax=0 e pax_max=4 são provisórios (§4.3); confirmar regra do adicional por passageiro e capacidade do veículo"
NOTA_INCOMPLETA = "descrição completa não obtida (Wayback Machine inacessível pelo proxy em 09/10/2026: conexão TLS com web.archive.org reiniciada em todas as tentativas); texto montado só a partir da descrição curta do CSV, sem completar o trecho cortado"
NOTA_IMG = "imagens: não foi possível associar as URLs de imagens-paytour-2025-07.txt a este produto sem a página original; preencher com as fotos do Drive"
NOTA_IDA = "produto 'ida ou volta': sentido gravado como 'ida'; o cliente escolhe o sentido no checkout"
NOTA_ESPERA = "texto original não dizia o tempo de espera no aeroporto; aplicada a política nova (60 min no aeroporto / 15 min em endereço) e cancelamento grátis até 24 h"
NOTA_APT_FIX = "corrigido 'monitando' → 'monitorando', 'aguarando' → 'aguardando', 'boas vindas' → 'boas-vindas'"
NOTA_APT_INCL = "'placa com o nome' e 'estacionamento no aeroporto' vieram do levantamento dos transfers de aeroporto na Paytour (plano §1.2), não do texto deste produto; confirmar"

produtos = {}

# ---------------------------------------------------------------- transfers de aeroporto
def apt(ordem, slug, origem, destino, sentido, pedagio, short, origem_padrao, destino_padrao,
        notas=(), ativo=True, inclui_apt_extras=True, ida_label=True):
    o, d = origem, destino
    vt = {"ida": ("ida ou volta", "ida o vuelta", "one way"),
          "ida_volta": ("ida e volta", "ida y vuelta", "round trip")}[sentido]
    if ida_label:
        nome = {
            "pt": f"Transfer privativo {o['pt_n']} → {d['pt_n']} ({vt[0]})",
            "es": f"Traslado privado {o['es_n']} → {d['es_n']} ({vt[1]})",
            "en": f"Private transfer {o['en_n']} → {d['en_n']} ({vt[2]})",
        }
    else:
        nome = {
            "pt": f"Transfer privativo {o['pt_n']} → {d['pt_n']}",
            "es": f"Traslado privado {o['es_n']} → {d['es_n']}",
            "en": f"Private transfer {o['en_n']} → {d['en_n']}",
        }
    if sentido == "ida":
        s_pt = " Na reserva, você escolhe o sentido: saindo do aeroporto (chegada) ou indo para o aeroporto (retorno)."
        s_es = " Al reservar, elegís el sentido: desde el aeropuerto (llegada) o hacia el aeropuerto (regreso)."
        s_en = " When booking, you choose the direction: from the airport (arrival) or to the airport (departure)."
        if not ida_label:
            s_pt = s_es = s_en = ""
    else:
        s_pt = " O pacote inclui os dois trechos: a chegada, do aeroporto até a sua hospedagem, e o retorno, da hospedagem até o aeroporto."
        s_es = " El paquete incluye los dos tramos: la llegada, del aeropuerto a tu alojamiento, y el regreso, del alojamiento al aeropuerto."
        s_en = " The package includes both legs: arrival, from the airport to your accommodation, and return, from your accommodation to the airport."
    ped_pt, ped_es, ped_en = (", pedágio", ", peaje", ", tolls") if pedagio else ("", "", "")
    descricao = {
        "pt": f"Transfer privativo entre {o['pt_d']} e {d['pt_d']}.{s_pt}\n\n"
              f"Na chegada, nossa equipe monitora o seu voo e espera você no desembarque com uma placa com o seu nome. A espera é grátis por até 60 minutos no aeroporto. Quando o embarque é em um endereço (hotel, pousada ou residência), o motorista espera até 15 minutos sem custo.\n\n"
              f"Inclui veículo privativo, motorista{ped_pt} e kit de boas-vindas. Cancelamento grátis até 24 horas antes do horário reservado.",
        "es": f"Traslado privado entre {o['es_d']} y {d['es_d']}.{s_es}\n\n"
              f"A tu llegada, nuestro equipo monitorea tu vuelo y te espera en el hall de arribos con un cartel con tu nombre. La espera es sin cargo hasta 60 minutos en el aeropuerto. Cuando la salida es desde una dirección (hotel, posada o casa), el chofer espera hasta 15 minutos sin cargo.\n\n"
              f"Incluye vehículo privado, chofer{ped_es} y kit de bienvenida. Cancelación gratuita hasta 24 horas antes del horario reservado.",
        "en": f"Private transfer between {o['en_d']} and {d['en_d']}.{s_en}\n\n"
              f"On arrival, our team tracks your flight and meets you in the arrivals hall with a sign showing your name. Waiting time is free for up to 60 minutes at the airport. When pickup is at an address (hotel, guesthouse or home), the driver waits up to 15 minutes at no extra cost.\n\n"
              f"Includes private vehicle, driver{ped_en} and welcome kit. Free cancellation up to 24 hours before the booked time.",
    }
    inc = {"pt": ["Veículo privativo", "Motorista"], "es": ["Vehículo privado", "Chofer"], "en": ["Private vehicle", "Driver"]}
    if pedagio:
        inc["pt"].append("Pedágio"); inc["es"].append("Peajes"); inc["en"].append("Tolls")
    inc["pt"] += ["Kit de boas-vindas", "Monitoramento do voo"]
    inc["es"] += ["Kit de bienvenida", "Monitoreo del vuelo"]
    inc["en"] += ["Welcome kit", "Flight tracking"]
    if inclui_apt_extras:
        inc["pt"] += ["Recepção com placa com o seu nome", "Estacionamento no aeroporto"]
        inc["es"] += ["Recepción con cartel con tu nombre", "Estacionamiento en el aeropuerto"]
        inc["en"] += ["Meet & greet with name sign", "Airport parking"]
    inc["pt"].append("Espera grátis: 60 min no aeroporto / 15 min em endereço")
    inc["es"].append("Espera sin cargo: 60 min en el aeropuerto / 15 min en domicilio")
    inc["en"].append("Free waiting: 60 min at the airport / 15 min at an address")
    sd = {
        "pt": f"Transfer privativo {short['pt_seo']}{' (ida e volta)' if sentido=='ida_volta' else ''}. Monitoramento do voo, espera grátis e cancelamento grátis até 24 h.",
        "es": f"Traslado privado {short['es_seo']}{' (ida y vuelta)' if sentido=='ida_volta' else ''}. Monitoreo del vuelo, espera sin cargo y cancelación gratis hasta 24 h.",
        "en": f"Private transfer {short['en_seo']}{' (round trip)' if sentido=='ida_volta' else ''}. Flight tracking, free waiting time and free cancellation up to 24 h.",
    }
    seo = {"titulo": seo_title({"pt": "Transfer " + short["pt"], "es": "Traslado " + short["es"], "en": short["en"] + " transfer"}),
           "descricao": check_desc(sd)}
    n = [NOTA_INCOMPLETA, NOTA_APT_FIX, NOTA_ESPERA]
    if inclui_apt_extras:
        n.append(NOTA_APT_INCL)
    if sentido == "ida":
        n.append(NOTA_IDA)
    if not pedagio:
        n.append("texto original NÃO lista pedágio como incluso; mantido sem pedágio (não inventado). Confirmar com a operação")
    n += list(notas) + [NOTA_PAX, NOTA_IMG]
    produtos[ordem] = dict(slug=slug, tipo="transfer", nome=nome, descricao=descricao, inclusos=inc,
                           nao_inclusos={"pt": [], "es": [], "en": []},
                           origem_padrao=origem_padrao, destino_padrao=destino_padrao, sentido=sentido,
                           duracao_min=None, confirmacao="imediata", ativo=ativo, seo=seo, notas_revisao=n)

REC = {"pt_n": "Aeroporto do Recife", "es_n": "Aeropuerto de Recife", "en_n": "Recife Airport",
       "pt_d": "o Aeroporto Internacional do Recife", "es_d": "el Aeropuerto Internacional de Recife", "en_d": "Recife International Airport"}
REC_BV = {"pt_n": "Aeroporto do Recife ou Boa Viagem", "es_n": "Aeropuerto de Recife o Boa Viagem", "en_n": "Recife Airport or Boa Viagem",
          "pt_d": "o Aeroporto Internacional do Recife (ou um endereço em Boa Viagem)",
          "es_d": "el Aeropuerto Internacional de Recife (o una dirección en Boa Viagem)",
          "en_d": "Recife International Airport (or an address in Boa Viagem)"}

def D(pt_n, es_n, en_n, pt_d=None, es_d=None, en_d=None):
    return {"pt_n": pt_n, "es_n": es_n, "en_n": en_n, "pt_d": pt_d or pt_n, "es_d": es_d or es_n, "en_d": en_d or en_n}

def S(pt, es, en, pt_seo=None, es_seo=None, en_seo=None):
    return {"pt": pt, "es": es, "en": en,
            "pt_seo": pt_seo or ("do Aeroporto do Recife para " + pt.split("→ ")[-1]),
            "es_seo": es_seo or ("del Aeropuerto de Recife a " + es.split("→ ")[-1]),
            "en_seo": en_seo or ("from Recife Airport to " + en.split("→ ")[-1])}

pdg = D("Porto de Galinhas / Muro Alto", "Porto de Galinhas / Muro Alto", "Porto de Galinhas / Muro Alto",
        "Porto de Galinhas ou Muro Alto", "Porto de Galinhas o Muro Alto", "Porto de Galinhas or Muro Alto")
pdg_s = S("Aeroporto Recife → Porto de Galinhas", "Aeropuerto Recife → Porto de Galinhas", "Recife Airport → Porto de Galinhas",
          "do Aeroporto do Recife para Porto de Galinhas e Muro Alto", "del Aeropuerto de Recife a Porto de Galinhas y Muro Alto",
          "from Recife Airport to Porto de Galinhas and Muro Alto")
apt(3, "aeroporto-recife-porto-de-galinhas-ida-e-volta", REC, pdg, "ida_volta", True, pdg_s,
    "Aeroporto Internacional do Recife", "Porto de Galinhas / Muro Alto",
    notas=["nome original '( ida e volta )' com espaços tortos nos parênteses; limpo"])
apt(5, "aeroporto-recife-porto-de-galinhas-ida", REC, pdg, "ida", True, pdg_s,
    "Aeroporto Internacional do Recife", "Porto de Galinhas / Muro Alto",
    notas=["3º mais vendido da loja Paytour (selo da loja, plano §1.2)"])
carn = D("Praia dos Carneiros", "Praia dos Carneiros", "Praia dos Carneiros", "a Praia dos Carneiros")
carn_s = S("Aeroporto Recife → Praia dos Carneiros", "Aeropuerto Recife → Praia dos Carneiros", "Recife Airport → Carneiros Beach",
           en_seo="from Recife Airport to Praia dos Carneiros")
apt(7, "aeroporto-recife-praia-dos-carneiros-ida", REC, carn, "ida", True, carn_s, "Aeroporto Internacional do Recife", "Praia dos Carneiros")
mgg = D("Maragogi", "Maragogi", "Maragogi", "Maragogi (Alagoas)", "Maragogi (Alagoas)", "Maragogi (Alagoas)")
mgg_s = S("Aeroporto Recife → Maragogi", "Aeropuerto Recife → Maragogi", "Recife Airport → Maragogi")
apt(12, "aeroporto-recife-maragogi-ida-e-volta", REC, mgg, "ida_volta", True, mgg_s, "Aeroporto Internacional do Recife", "Maragogi (AL)")
apt(14, "aeroporto-recife-serrambi-ida", REC, D("Serrambi", "Serrambi", "Serrambi", "Serrambi (Sirinhaém)", "Serrambi (Sirinhaém)", "Serrambi (Sirinhaém)"), "ida", True,
    S("Aeroporto Recife → Serrambi", "Aeropuerto Recife → Serrambi", "Recife Airport → Serrambi"),
    "Aeroporto Internacional do Recife", "Serrambi (Sirinhaém)",
    notas=["categoria corrigida: estava como 'Serviços' na Paytour, agora é transfer (§3)",
           "Serrambi fica em Sirinhaém; existe outro produto 'Aeroporto → Sirinhaém' (ordem 46) por R$ 300 com slug Paytour '...-para-serrambi'. Confirmar se são o mesmo serviço e qual preço vale"])
apt(15, "aeroporto-recife-hoteis-recife-ida", REC, D("Recife", "Recife", "Recife", "hotéis e endereços no Recife", "hoteles y direcciones en Recife", "hotels and addresses in Recife"), "ida", True,
    S("Aeroporto Recife → Recife", "Aeropuerto Recife → Recife", "Recife Airport → Recife city",
      "do Aeroporto do Recife para hotéis no Recife", "del Aeropuerto de Recife a hoteles en Recife", "from Recife Airport to hotels in Recife"),
    "Aeroporto Internacional do Recife", "Recife (hotéis e endereços)",
    notas=["nome original 'Aeroporto de Recife para Recife' é ambíguo; reescrito como hotéis/endereços no Recife. Confirmar quais bairros cabem nos R$ 80 (ex.: Boa Viagem, Pina, centro)"])
apt(17, "aeroporto-recife-olinda-ida", REC, D("Olinda", "Olinda", "Olinda"), "ida", True,
    S("Aeroporto Recife → Olinda", "Aeropuerto Recife → Olinda", "Recife Airport → Olinda"), "Aeroporto Internacional do Recife", "Olinda")
apt(19, "aeroporto-recife-maragogi-ida", REC, mgg, "ida", True, mgg_s, "Aeroporto Internacional do Recife", "Maragogi (AL)")
apt(20, "aeroporto-recife-boa-viagem-itamaraca-ida", REC_BV, D("Itamaracá", "Itamaracá", "Itamaracá", "a Ilha de Itamaracá", "la Isla de Itamaracá", "Itamaracá Island"), "ida", True,
    S("Recife/Boa Viagem → Itamaracá", "Recife/Boa Viagem → Itamaracá", "Recife/Boa Viagem → Itamaracá",
      "do Aeroporto do Recife ou Boa Viagem para Itamaracá", "del Aeropuerto de Recife o Boa Viagem a Itamaracá", "from Recife Airport or Boa Viagem to Itamaracá"),
    "Aeroporto Internacional do Recife ou Boa Viagem", "Ilha de Itamaracá",
    notas=["embarque pode ser no aeroporto ou em Boa Viagem pelo mesmo preço (conforme nome original)"])
apt(23, "aeroporto-recife-praia-dos-carneiros-ida-e-volta", REC, carn, "ida_volta", True, carn_s, "Aeroporto Internacional do Recife", "Praia dos Carneiros")
apt(28, "aeroporto-recife-sao-miguel-dos-milagres-ida", REC, D("São Miguel dos Milagres", "São Miguel dos Milagres", "São Miguel dos Milagres",
    "São Miguel dos Milagres (Alagoas)", "São Miguel dos Milagres (Alagoas)", "São Miguel dos Milagres (Alagoas)"), "ida", True,
    S("Aeroporto Recife → São Miguel dos Milagres", "Aeropuerto Recife → São Miguel dos Milagres", "Recife Airport → São Miguel dos Milagres"),
    "Aeroporto Internacional do Recife", "São Miguel dos Milagres (AL)")
apt(29, "aeroporto-recife-natal-ida", REC, D("Natal", "Natal", "Natal", "Natal (Rio Grande do Norte)", "Natal (Rio Grande do Norte)", "Natal (Rio Grande do Norte)"), "ida", True,
    S("Aeroporto Recife → Natal", "Aeropuerto Recife → Natal", "Recife Airport → Natal"), "Aeroporto Internacional do Recife", "Natal (RN)")
apt(31, "aeroporto-recife-joao-pessoa-cabedelo-ida", REC, D("João Pessoa e Cabedelo", "João Pessoa y Cabedelo", "João Pessoa and Cabedelo",
    "João Pessoa ou Cabedelo (Paraíba)", "João Pessoa o Cabedelo (Paraíba)", "João Pessoa or Cabedelo (Paraíba)"), "ida", True,
    S("Aeroporto Recife → João Pessoa", "Aeropuerto Recife → João Pessoa", "Recife Airport → João Pessoa",
      "do Aeroporto do Recife para João Pessoa e Cabedelo", "del Aeropuerto de Recife a João Pessoa y Cabedelo", "from Recife Airport to João Pessoa and Cabedelo"),
    "Aeroporto Internacional do Recife", "João Pessoa / Cabedelo (PB)",
    notas=["2º mais vendido da loja Paytour (selo da loja, plano §1.2)"])
apt(32, "aeroporto-noronha-pousadas-ida",
    {"pt_n": "Aeroporto de Fernando de Noronha", "es_n": "Aeropuerto de Fernando de Noronha", "en_n": "Fernando de Noronha Airport",
     "pt_d": "o Aeroporto de Fernando de Noronha", "es_d": "el Aeropuerto de Fernando de Noronha", "en_d": "Fernando de Noronha Airport"},
    D("pousadas na ilha", "posadas de la isla", "guesthouses on the island", "a sua pousada na ilha", "tu posada en la isla", "your guesthouse on the island"), "ida", False,
    S("Aeroporto Noronha → pousadas", "Aeropuerto Noronha → posadas", "Noronha Airport → guesthouses",
      "do Aeroporto de Noronha para a sua pousada", "del Aeropuerto de Noronha a tu posada", "from Noronha Airport to your guesthouse"),
    "Aeroporto de Fernando de Noronha", "Pousadas em Fernando de Noronha",
    notas=["operação em Fernando de Noronha: confirmar se a empresa ainda atende a ilha (veículo/parceiro local)",
           "'estacionamento no aeroporto' e 'placa' mantidos por padrão dos transfers de aeroporto; confirmar se valem em Noronha"])
apt(38, "aeroporto-recife-japaratinga-ida", REC, D("Japaratinga", "Japaratinga", "Japaratinga", "Japaratinga (Alagoas)", "Japaratinga (Alagoas)", "Japaratinga (Alagoas)"), "ida", True,
    S("Aeroporto Recife → Japaratinga", "Aeropuerto Recife → Japaratinga", "Recife Airport → Japaratinga"), "Aeroporto Internacional do Recife", "Japaratinga (AL)",
    notas=["1º mais vendido da loja Paytour (selo da loja, plano §1.2)"])
apt(40, "aeroporto-recife-maceio-ida", REC, D("hotéis em Maceió", "hoteles en Maceió", "hotels in Maceió", "o seu hotel em Maceió (Alagoas)", "tu hotel en Maceió (Alagoas)", "your hotel in Maceió (Alagoas)"), "ida", False,
    S("Aeroporto Recife → Maceió", "Aeropuerto Recife → Maceió", "Recife Airport → Maceió",
      "do Aeroporto do Recife para hotéis em Maceió", "del Aeropuerto de Recife a hoteles en Maceió", "from Recife Airport to hotels in Maceió"),
    "Aeroporto Internacional do Recife", "Maceió (AL) — hotéis")
apt(41, "aeroporto-recife-boa-viagem-caruaru-ida", REC_BV, D("Caruaru", "Caruaru", "Caruaru"), "ida", True,
    S("Recife/Boa Viagem → Caruaru", "Recife/Boa Viagem → Caruaru", "Recife/Boa Viagem → Caruaru",
      "do Aeroporto do Recife ou Boa Viagem para Caruaru", "del Aeropuerto de Recife o Boa Viagem a Caruaru", "from Recife Airport or Boa Viagem to Caruaru"),
    "Aeroporto Internacional do Recife ou Boa Viagem", "Caruaru",
    notas=["embarque pode ser no aeroporto ou em Boa Viagem pelo mesmo preço (conforme nome original)"])
apt(42, "aeroporto-recife-cabo-de-santo-agostinho-ida", REC,
    D("Cabo de Santo Agostinho / Vila Galé Eco Resort", "Cabo de Santo Agostinho / Vila Galé Eco Resort", "Cabo de Santo Agostinho / Vila Galé Eco Resort",
      "hotéis no Cabo de Santo Agostinho, incluindo o Vila Galé Eco Resort", "hoteles en Cabo de Santo Agostinho, incluido el Vila Galé Eco Resort",
      "hotels in Cabo de Santo Agostinho, including Vila Galé Eco Resort"), "ida", True,
    S("Aeroporto Recife → Cabo Santo Agostinho", "Aeropuerto Recife → Cabo Santo Agostinho", "Recife Airport → Cabo Santo Agostinho",
      "do Aeroporto do Recife para hotéis no Cabo de Santo Agostinho", "del Aeropuerto de Recife a hoteles en Cabo de Santo Agostinho",
      "from Recife Airport to hotels in Cabo de Santo Agostinho"),
    "Aeroporto Internacional do Recife", "Cabo de Santo Agostinho (hotéis / Vila Galé Eco Resort)",
    notas=["'Ecoresort' grafado como 'Eco Resort' (nome comercial do hotel; conferir)",
           "slug Paytour não cita Vila Galé (o nome foi ampliado depois); redirect 301 continua valendo"])
apt(43, "aeroporto-recife-praia-da-pipa-ida", REC, D("Praia da Pipa", "Praia da Pipa", "Pipa Beach", "a Praia da Pipa (Rio Grande do Norte)", "Praia da Pipa (Rio Grande do Norte)", "Pipa Beach (Rio Grande do Norte)"), "ida", True,
    S("Aeroporto Recife → Praia da Pipa", "Aeropuerto Recife → Praia da Pipa", "Recife Airport → Pipa Beach"), "Aeroporto Internacional do Recife", "Praia da Pipa (RN)")
apt(44, "aeroporto-recife-jaboatao-dos-guararapes-ida", REC, D("Jaboatão dos Guararapes", "Jaboatão dos Guararapes", "Jaboatão dos Guararapes"), "ida", True,
    S("Aeroporto Recife → Jaboatão", "Aeropuerto Recife → Jaboatão", "Recife Airport → Jaboatão",
      "do Aeroporto do Recife para Jaboatão dos Guararapes", "del Aeropuerto de Recife a Jaboatão dos Guararapes", "from Recife Airport to Jaboatão dos Guararapes"),
    "Aeroporto Internacional do Recife", "Jaboatão dos Guararapes",
    notas=["Piedade e Candeias ficam em Jaboatão; confirmar se o preço de R$ 80 cobre todo o município"])
apt(45, "aeroporto-curitiba-cidade",
    {"pt_n": "Aeroporto de Curitiba (São José dos Pinhais)", "es_n": "Aeropuerto de Curitiba (São José dos Pinhais)", "en_n": "Curitiba Airport (São José dos Pinhais)",
     "pt_d": "o Aeroporto Internacional de Curitiba, em São José dos Pinhais,", "es_d": "el Aeropuerto Internacional de Curitiba, en São José dos Pinhais,",
     "en_d": "Curitiba International Airport, in São José dos Pinhais,"},
    D("Curitiba", "Curitiba", "Curitiba"), "ida", False,
    S("Aeroporto → Curitiba", "Aeropuerto → Curitiba", "Airport → Curitiba",
      "do Aeroporto de Curitiba para a cidade", "del Aeropuerto de Curitiba a la ciudad", "from Curitiba Airport to the city"),
    "Aeroporto Internacional de Curitiba (São José dos Pinhais)", "Curitiba",
    notas=["ATIVO=false: fora da área de atuação (Paraná); o §3 recomenda avaliar — parece produto de teste. Decidir se publica ou remove",
           "nome original não diz 'ida ou volta'; sentido gravado como 'ida'"],
    ativo=False, ida_label=False)
apt(46, "aeroporto-recife-sirinhaem-ida", REC, D("Sirinhaém", "Sirinhaém", "Sirinhaém"), "ida", True,
    S("Aeroporto Recife → Sirinhaém", "Aeropuerto Recife → Sirinhaém", "Recife Airport → Sirinhaém"), "Aeroporto Internacional do Recife", "Sirinhaém",
    notas=["corrigido 'Sirinhaem' → 'Sirinhaém'",
           "nome original não diz 'ida ou volta'; sentido gravado como 'ida' — confirmar",
           "slug Paytour é '...-para-serrambi' mas o nome é Sirinhaém e o preço (R$ 300) difere do produto Serrambi (ordem 14, R$ 250). Possível duplicata: decidir qual manter"],
    ida_label=False)

# ---------------------------------------------------------------- transfers entre endereços
def addr(ordem, slug, a, b, sentido, pedagio, short, origem_padrao, destino_padrao, p2=None, notas=(), ativo=True, ida_label=True, extra_fix=None):
    vt = {"ida": ("ida ou volta", "ida o vuelta", "one way"),
          "ida_volta": ("ida e volta", "ida y vuelta", "round trip")}[sentido]
    suf = (f" ({vt[0]})", f" ({vt[1]})", f" ({vt[2]})") if ida_label else ("", "", "")
    nome = {"pt": f"Transfer privativo {a['pt']} → {b['pt']}{suf[0]}",
            "es": f"Traslado privado {a['es']} → {b['es']}{suf[1]}",
            "en": f"Private transfer {a['en']} → {b['en']}{suf[2]}"}
    if sentido == "ida" and ida_label:
        s = (" Na reserva, você escolhe o sentido da viagem.", " Al reservar, elegís el sentido del viaje.", " When booking, you choose the direction of travel.")
    elif sentido == "ida_volta":
        s = (" Inclui os trechos de ida e de volta.", " Incluye los tramos de ida y de vuelta.", " Includes both the outbound and return legs.")
    else:
        s = ("", "", "")
    if p2 is None:
        p2 = {"pt": "O motorista chega ao endereço de embarque 5 minutos antes do horário marcado, para acomodar as bagagens e seguir viagem até o endereço de destino. A espera é grátis por até 15 minutos.",
              "es": "El chofer llega a la dirección de salida 5 minutos antes del horario acordado, para cargar el equipaje y seguir viaje hasta la dirección de destino. La espera es sin cargo hasta 15 minutos.",
              "en": "The driver arrives at the pickup address 5 minutes before the scheduled time to load your luggage and drive you to your destination address. Waiting time is free for up to 15 minutes."}
    ped = (", pedágio", ", peajes", ", tolls") if pedagio else ("", "", "")
    descricao = {
        "pt": f"Transfer privativo entre {a['pt_d']} e {b['pt_d']}.{s[0]}\n\n{p2['pt']}\n\nInclui veículo privativo, motorista{ped[0]}. Cancelamento grátis até 24 horas antes do horário reservado.".replace("motorista. ", "motorista. ") ,
        "es": f"Traslado privado entre {a['es_d']} y {b['es_d']}.{s[1]}\n\n{p2['es']}\n\nIncluye vehículo privado, chofer{ped[1]}. Cancelación gratuita hasta 24 horas antes del horario reservado.",
        "en": f"Private transfer between {a['en_d']} and {b['en_d']}.{s[2]}\n\n{p2['en']}\n\nIncludes private vehicle, driver{ped[2]}. Free cancellation up to 24 hours before the booked time.",
    }
    # "veículo privativo, motorista, pedágio." -> "veículo privativo, motorista e pedágio."
    for k, (x, y) in {"pt": (", pedágio.", " e pedágio."), "es": (", peajes.", " y peajes."), "en": (", tolls.", " and tolls.")}.items():
        descricao[k] = descricao[k].replace(x, y)
    for k, (x, y) in {"pt": ("veículo privativo, motorista.", "veículo privativo e motorista."), "es": ("vehículo privado, chofer.", "vehículo privado y chofer."), "en": ("private vehicle, driver.", "private vehicle and driver.")}.items():
        descricao[k] = descricao[k].replace(x, y)
    inc = {"pt": ["Veículo privativo", "Motorista"], "es": ["Vehículo privado", "Chofer"], "en": ["Private vehicle", "Driver"]}
    if pedagio:
        inc["pt"].append("Pedágio"); inc["es"].append("Peajes"); inc["en"].append("Tolls")
    inc["pt"].append("Espera grátis de 15 min no endereço"); inc["es"].append("Espera sin cargo de 15 min en la dirección"); inc["en"].append("Free 15-min wait at the address")
    sd = {"pt": f"Transfer privativo {short['pt_seo']}{' (ida e volta)' if sentido=='ida_volta' else ''}. Motorista pontual, espera grátis e cancelamento grátis até 24 h.",
          "es": f"Traslado privado {short['es_seo']}{' (ida y vuelta)' if sentido=='ida_volta' else ''}. Chofer puntual, espera sin cargo y cancelación gratis hasta 24 h.",
          "en": f"Private transfer {short['en_seo']}{' (round trip)' if sentido=='ida_volta' else ''}. Punctual driver, free waiting time and free cancellation up to 24 h."}
    seo = {"titulo": seo_title({"pt": "Transfer " + short["pt"], "es": "Traslado " + short["es"], "en": short["en"] + " transfer"}), "descricao": check_desc(sd)}
    n = [NOTA_INCOMPLETA]
    if extra_fix:
        n.append(extra_fix)
    n.append("espera alinhada à política nova: 15 min grátis em endereço; cancelamento grátis até 24 h")
    if sentido == "ida" and ida_label:
        n.append(NOTA_IDA)
    if not pedagio:
        n.append("texto original diz só 'veículo privativo e motorista' — pedágio NÃO incluído (não inventado). Confirmar se há pedágio no trajeto e quem paga")
    n += list(notas) + [NOTA_PAX, NOTA_IMG]
    produtos[ordem] = dict(slug=slug, tipo="transfer", nome=nome, descricao=descricao, inclusos=inc,
                           nao_inclusos={"pt": [], "es": [], "en": []},
                           origem_padrao=origem_padrao, destino_padrao=destino_padrao, sentido=sentido,
                           duracao_min=None, confirmacao="imediata", ativo=ativo, seo=seo, notas_revisao=n)

def P(pt, es, en, pt_d=None, es_d=None, en_d=None):
    return {"pt": pt, "es": es, "en": en, "pt_d": pt_d or pt, "es_d": es_d or es, "en_d": en_d or en}

addr(13, "boa-viagem-piedade-porto-de-galinhas-ida",
     P("Boa Viagem / Piedade", "Boa Viagem / Piedade", "Boa Viagem / Piedade",
       "Boa Viagem, Pina ou Piedade", "Boa Viagem, Pina o Piedade", "Boa Viagem, Pina or Piedade"),
     P("Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas"), "ida", True,
     {"pt": "Boa Viagem → Porto de Galinhas", "es": "Boa Viagem → Porto de Galinhas", "en": "Boa Viagem → Porto de Galinhas",
      "pt_seo": "de Boa Viagem, Pina ou Piedade para Porto de Galinhas", "es_seo": "de Boa Viagem, Pina o Piedade a Porto de Galinhas",
      "en_seo": "from Boa Viagem, Pina or Piedade to Porto de Galinhas"},
     "Boa Viagem, Pina ou Piedade (Recife/Jaboatão)", "Porto de Galinhas",
     extra_fix="corrigido 'PIna' → 'Pina'",
     notas=["o texto original também aceita embarque no Pina (não aparece no nome); mantido na descrição"])
addr(18, "recife-suape-refinaria-estaleiro-porto",
     P("Recife", "Recife", "Recife", "o Recife", "Recife", "Recife"),
     P("Suape (refinaria, estaleiro ou porto)", "Suape (refinería, astillero o puerto)", "Suape (refinery, shipyard or port)",
       "o Complexo de Suape (refinaria, estaleiro ou porto)", "el Complejo de Suape (refinería, astillero o puerto)", "the Suape complex (refinery, shipyard or port)"),
     "ida", True,
     {"pt": "Recife → Suape", "es": "Recife → Suape", "en": "Recife → Suape",
      "pt_seo": "do Recife para Suape (refinaria, estaleiro ou porto)", "es_seo": "de Recife a Suape (refinería, astillero o puerto)",
      "en_seo": "from Recife to Suape (refinery, shipyard or port)"},
     "Recife", "Complexo de Suape (refinaria, estaleiro ou porto)",
     p2={"pt": "Nossa equipe espera você em frente ao endereço informado, com espera grátis de até 15 minutos. Pontualidade, conforto e segurança.",
         "es": "Nuestro equipo te espera frente a la dirección indicada, con espera sin cargo de hasta 15 minutos. Puntualidad, comodidad y seguridad.",
         "en": "Our team waits for you in front of the address you provide, with up to 15 minutes of free waiting time. Punctuality, comfort and safety."},
     extra_fix="corrigido 'Estalereiro' → 'Estaleiro', 'Pontualide' → 'Pontualidade' e espaço faltando após 'solicitado.'",
     notas=["texto original já dizia 15 min de espera — coincide com a política nova",
            "nome original não diz 'ida ou volta'; sentido gravado como 'ida' e o nome ficou sem '(ida ou volta)'. Confirmar se vale para a volta (Suape → Recife) e se é corporativo (faturamento p/ empresa?)"],
     ida_label=False)
addr(22, "olinda-maragogi-ida", P("Olinda", "Olinda", "Olinda"),
     P("Maragogi", "Maragogi", "Maragogi", "Maragogi (Alagoas)", "Maragogi (Alagoas)", "Maragogi (Alagoas)"), "ida", False,
     {"pt": "Olinda → Maragogi", "es": "Olinda → Maragogi", "en": "Olinda → Maragogi",
      "pt_seo": "de Olinda para Maragogi", "es_seo": "de Olinda a Maragogi", "en_seo": "from Olinda to Maragogi"},
     "Olinda", "Maragogi (AL)")
addr(27, "porto-de-galinhas-maragogi-ida",
     P("Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas ou Muro Alto", "Porto de Galinhas o Muro Alto", "Porto de Galinhas or Muro Alto"),
     P("Maragogi", "Maragogi", "Maragogi", "Maragogi (Alagoas)", "Maragogi (Alagoas)", "Maragogi (Alagoas)"), "ida", False,
     {"pt": "Porto de Galinhas → Maragogi", "es": "Porto de Galinhas → Maragogi", "en": "Porto de Galinhas → Maragogi",
      "pt_seo": "de Porto de Galinhas para Maragogi", "es_seo": "de Porto de Galinhas a Maragogi", "en_seo": "from Porto de Galinhas to Maragogi"},
     "Porto de Galinhas / Muro Alto", "Maragogi (AL)")
addr(37, "olinda-porto-de-galinhas-ida", P("Olinda", "Olinda", "Olinda"), P("Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas"), "ida", False,
     {"pt": "Olinda → Porto de Galinhas", "es": "Olinda → Porto de Galinhas", "en": "Olinda → Porto de Galinhas",
      "pt_seo": "de Olinda para Porto de Galinhas", "es_seo": "de Olinda a Porto de Galinhas", "en_seo": "from Olinda to Porto de Galinhas"},
     "Olinda", "Porto de Galinhas")
addr(39, "porto-de-galinhas-praia-dos-carneiros-ida",
     P("Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas ou Muro Alto", "Porto de Galinhas o Muro Alto", "Porto de Galinhas or Muro Alto"),
     P("Praia dos Carneiros", "Praia dos Carneiros", "Praia dos Carneiros", "a Praia dos Carneiros"), "ida", False,
     {"pt": "Porto de Galinhas → Carneiros", "es": "Porto de Galinhas → Carneiros", "en": "Porto de Galinhas → Carneiros",
      "pt_seo": "de Porto de Galinhas para a Praia dos Carneiros", "es_seo": "de Porto de Galinhas a Praia dos Carneiros", "en_seo": "from Porto de Galinhas to Praia dos Carneiros"},
     "Porto de Galinhas / Muro Alto", "Praia dos Carneiros",
     extra_fix="corrigido 'Murto Alto' → 'Muro Alto'")
addr(35, "recife-caruaru-sao-joao-ida-e-volta", P("Recife", "Recife", "Recife", "o Recife", "Recife", "Recife"),
     P("Caruaru (São João)", "Caruaru (San Juan)", "Caruaru (São João festival)", "Caruaru, durante o São João", "Caruaru, durante las fiestas de San Juan (São João)",
       "Caruaru during the São João festival"), "ida_volta", False,
     {"pt": "Recife → Caruaru (São João)", "es": "Recife → Caruaru (São João)", "en": "Recife → Caruaru (São João)",
      "pt_seo": "do Recife para o São João de Caruaru", "es_seo": "de Recife al São João de Caruaru", "en_seo": "from Recife to the São João festival in Caruaru"},
     "Recife", "Caruaru",
     p2={"pt": "O horário de ida e o de volta são combinados na reserva. A espera no endereço de embarque é grátis por até 15 minutos.",
         "es": "Los horarios de ida y de vuelta se acuerdan al reservar. La espera en la dirección de salida es sin cargo hasta 15 minutos.",
         "en": "Outbound and return times are agreed when booking. Waiting time at the pickup address is free for up to 15 minutes."},
     extra_fix="removido o ano '2024' do nome (produto sazonal datado); corrigido 'veiculo' → 'veículo'",
     notas=["ATIVO=false: produto sazonal datado (§3 recomenda retirar ou renomear). Reativar só no período do São João, com preço revisado",
            "slug Paytour cita 'sao-joao-2023' e o nome cita 2024 — usar o slug Paytour exato no redirect 301",
            "frase 'horários combinados na reserva' foi acrescentada para explicar o produto de ida e volta; texto original era só 'veículo privativo com motorista'"],
     ativo=False, ida_label=False)

# ---------------------------------------------------------------- passeios e serviços
POL_PASSEIO = {
    "pt": "Confirmação em até 24 horas após o pagamento; se não houver disponibilidade, o reembolso é integral e automático. Cancelamento grátis até 24 horas antes.",
    "es": "Confirmación dentro de las 24 horas posteriores al pago; si no hay disponibilidad, el reembolso es total y automático. Cancelación gratuita hasta 24 horas antes.",
    "en": "Confirmation within 24 hours of payment; if there is no availability, you get a full automatic refund. Free cancellation up to 24 hours before.",
}

def pas(ordem, slug, nome, paras, inc, nao, origem_padrao, destino_padrao, seo_t, seo_d, notas, duracao=None, ativo=True, sentido="n/a", tipo="passeio"):
    descricao = {k: "\n\n".join(paras[k] + [POL_PASSEIO[k]]) for k in L}
    n = [NOTA_INCOMPLETA] + notas + ["política aplicada: confirmação em até 24 h com reembolso automático se não houver vaga; cancelamento grátis até 24 h", NOTA_PAX, NOTA_IMG]
    produtos[ordem] = dict(slug=slug, tipo=tipo, nome=nome, descricao=descricao, inclusos=inc, nao_inclusos=nao,
                           origem_padrao=origem_padrao, destino_padrao=destino_padrao, sentido=sentido,
                           duracao_min=duracao, confirmacao="24h", ativo=ativo,
                           seo={"titulo": seo_title(seo_t), "descricao": check_desc(seo_d)}, notas_revisao=n)

VAZIO = {"pt": [], "es": [], "en": []}
VM = {"pt": ["Veículo privativo", "Motorista"], "es": ["Vehículo privado", "Chofer"], "en": ["Private vehicle", "Driver"]}
NAO_ABI = {"pt": ["Alimentação", "Bebidas", "Demais ingressos"], "es": ["Comidas", "Bebidas", "Otras entradas"], "en": ["Meals", "Drinks", "Other entrance fees"]}

pas(1, "passeio-porto-de-galinhas-piscinas-naturais",
    {"pt": "Passeio privativo do Recife a Porto de Galinhas, com jangada até as piscinas naturais",
     "es": "Excursión privada de Recife a Porto de Galinhas, con jangada a las piscinas naturales",
     "en": "Private day trip from Recife to Porto de Galinhas, with jangada ride to the natural pools"},
    {"pt": ["Um passeio inesquecível e imperdível para quem está no Recife: um dia em Porto de Galinhas, com o passeio de jangada até as piscinas naturais incluído.",
            "A saída é em veículo privativo, de Boa Viagem, Pina ou Piedade. O horário é definido na confirmação, porque depende da tábua das marés do dia."],
     "es": ["Una excursión inolvidable e imperdible si estás en Recife: un día en Porto de Galinhas, con el paseo en jangada (balsa típica de vela) a las piscinas naturales incluido.",
            "La salida es en vehículo privado, desde Boa Viagem, Pina o Piedade. El horario se define en la confirmación, porque depende de la tabla de mareas del día."],
     "en": ["An unforgettable, must-do trip if you are in Recife: a day in Porto de Galinhas, including a ride on a jangada (traditional sail raft) to the natural pools.",
            "You travel in a private vehicle from Boa Viagem, Pina or Piedade. The departure time is set when we confirm, because it depends on the day's tide table."]},
    {"pt": ["Veículo privativo", "Motorista", "Passeio de jangada até as piscinas naturais"],
     "es": ["Vehículo privado", "Chofer", "Paseo en jangada a las piscinas naturales"],
     "en": ["Private vehicle", "Driver", "Jangada ride to the natural pools"]}, VAZIO,
    "Boa Viagem, Pina ou Piedade (Recife)", "Porto de Galinhas",
    {"pt": "Passeio Porto de Galinhas saindo do Recife", "es": "Excursión a Porto de Galinhas desde Recife", "en": "Porto de Galinhas day trip from Recife"},
    {"pt": "Passeio privativo do Recife a Porto de Galinhas com jangada até as piscinas naturais incluída. Horário conforme a maré.",
     "es": "Excursión privada de Recife a Porto de Galinhas con jangada a las piscinas naturales incluida. Horario según la marea.",
     "en": "Private day trip from Recife to Porto de Galinhas, jangada ride to the natural pools included. Timing follows the tide."},
    ["corrigido 'definifir' → 'definir' e 'tabua de marés' → 'tábua das marés'",
     "'jangada para as piscinas naturais incluso' → 'incluído' (concordância)",
     "texto cortado após 'com destino a Pra...'; roteiro, tempo livre e horário de retorno desconhecidos — enviar texto completo",
     "não inclusos desconhecidos (alimentação? taxas locais?) — informar"])

pas(2, "passeio-praia-dos-carneiros",
    {"pt": "Passeio privativo do Recife à Praia dos Carneiros", "es": "Excursión privada de Recife a Praia dos Carneiros", "en": "Private day trip from Recife to Praia dos Carneiros"},
    {"pt": ["Um passeio inesquecível, daqueles para a lista de desejos de quem visita o Recife: um dia na Praia dos Carneiros.",
            "Saída às 7h45 de Boa Viagem, Pina ou Piedade, em veículo privativo, com destino à Praia dos Carneiros. O trajeto leva cerca de 1h30."],
     "es": ["Una excursión inolvidable, de esas que están en la lista de deseos de quien visita Recife: un día en Praia dos Carneiros.",
            "Salida a las 7:45 desde Boa Viagem, Pina o Piedade, en vehículo privado, con destino a Praia dos Carneiros. El trayecto dura alrededor de 1 h 30 min."],
     "en": ["An unforgettable bucket-list trip for anyone visiting Recife: a day at Praia dos Carneiros.",
            "Departure at 7:45 am from Boa Viagem, Pina or Piedade in a private vehicle, heading to Praia dos Carneiros. The drive takes about 1 hour 30 minutes."]},
    VM, VAZIO, "Boa Viagem, Pina ou Piedade (Recife)", "Praia dos Carneiros (Tamandaré)",
    {"pt": "Passeio Praia dos Carneiros saindo do Recife", "es": "Excursión a Praia dos Carneiros desde Recife", "en": "Praia dos Carneiros day trip from Recife"},
    {"pt": "Passeio privativo do Recife à Praia dos Carneiros, com saída às 7h45 de Boa Viagem, Pina ou Piedade.",
     "es": "Excursión privada de Recife a Praia dos Carneiros, con salida a las 7:45 desde Boa Viagem, Pina o Piedade.",
     "en": "Private day trip from Recife to Praia dos Carneiros, departing at 7:45 am from Boa Viagem, Pina or Piedade."},
    ["'bucket list' traduzido para 'lista de desejos' no PT",
     "horário de saída 07:45 consta no texto original",
     "texto cortado em 'com duração de 1,5 horas aproxim...': interpretado como duração do TRAJETO (Recife–Carneiros ~115 km). Confirmar; duracao_min do passeio ficou null",
     "inclusos além de veículo/motorista desconhecidos (catamarã? capela de São Benedito?) — enviar texto completo"])

pas(4, "city-tour-olinda-catamara",
    {"pt": "City tour em Olinda com passeio de catamarã no Recife", "es": "City tour por Olinda con paseo en catamarán en Recife", "en": "Olinda city tour with catamaran ride in Recife"},
    {"pt": ["Um passeio imperdível em Pernambuco: city tour por Olinda com guia local e passeio de catamarã no Recife.",
            "A saída é da sua hospedagem, em veículo privativo."],
     "es": ["Una excursión imperdible en Pernambuco: city tour por Olinda con guía local y paseo en catamarán en Recife.",
            "La salida es desde tu alojamiento, en vehículo privado."],
     "en": ["A must-do tour in Pernambuco: Olinda city tour with a local guide, plus a catamaran ride in Recife.",
            "Pickup is at your accommodation, in a private vehicle."]},
    {"pt": ["Veículo privativo", "Motorista", "Guia local", "Ingresso do catamarã"], "es": ["Vehículo privado", "Chofer", "Guía local", "Entrada del catamarán"],
     "en": ["Private vehicle", "Driver", "Local guide", "Catamaran ticket"]}, NAO_ABI,
    "Hospedagem do cliente (Recife)", "Olinda e Recife",
    {"pt": "City tour Olinda com catamarã no Recife", "es": "City tour Olinda con catamarán en Recife", "en": "Olinda city tour and Recife catamaran"},
    {"pt": "City tour privativo em Olinda com guia local e passeio de catamarã no Recife. Ingresso do catamarã incluído.",
     "es": "City tour privado por Olinda con guía local y paseo en catamarán en Recife. Entrada del catamarán incluida.",
     "en": "Private Olinda city tour with a local guide and a catamaran ride in Recife. Catamaran ticket included."},
    ["corrigido 'ímperdível' → 'imperdível'",
     "roteiro cortado em 'Saída do se...' (provavelmente 'seu hotel'); ordem das paradas, horários e duração desconhecidos"])

pas(6, "oficina-brennand-instituto-ricardo-brennand",
    {"pt": "Oficina Francisco Brennand e Instituto Ricardo Brennand, com transfer de ida e volta",
     "es": "Oficina Francisco Brennand e Instituto Ricardo Brennand, con traslado de ida y vuelta",
     "en": "Francisco Brennand Workshop and Ricardo Brennand Institute, with round-trip transfer"},
    {"pt": ["Imperdível para quem visita o Recife: os dois espaços da família Brennand em um só passeio, com transfer privativo de ida e volta.",
            "Saída às 10h de hotéis em Boa Viagem, Piedade ou Pina, em veículo privativo, com destino à Oficina Francisco Brennand, onde a parada é de aproximadamente 2 horas. Depois, visita ao Instituto Ricardo Brennand e retorno ao hotel."],
     "es": ["Imperdible para quien visita Recife: los dos espacios de la familia Brennand en una sola excursión, con traslado privado de ida y vuelta.",
            "Salida a las 10:00 desde hoteles en Boa Viagem, Piedade o Pina, en vehículo privado, con destino a la Oficina Francisco Brennand, donde la parada es de aproximadamente 2 horas. Después, visita al Instituto Ricardo Brennand y regreso al hotel."],
     "en": ["A must for anyone visiting Recife: both Brennand family venues in a single tour, with private round-trip transfer.",
            "Departure at 10 am from hotels in Boa Viagem, Piedade or Pina, in a private vehicle, to the Francisco Brennand Workshop, where you stay for about 2 hours. Then a visit to the Ricardo Brennand Institute and back to your hotel."]},
    {"pt": ["Veículo privativo", "Motorista", "Transfer de ida e volta"], "es": ["Vehículo privado", "Chofer", "Traslado de ida y vuelta"], "en": ["Private vehicle", "Driver", "Round-trip transfer"]},
    VAZIO, "Hotéis em Boa Viagem, Piedade ou Pina (Recife)", "Oficina Francisco Brennand e Instituto Ricardo Brennand",
    {"pt": "Oficina Brennand e Instituto Ricardo Brennand", "es": "Oficina Brennand e Instituto Ricardo Brennand", "en": "Brennand Workshop and Ricardo Brennand Institute"},
    {"pt": "Passeio privativo à Oficina Francisco Brennand e ao Instituto Ricardo Brennand, com saída às 10h e transfer de ida e volta.",
     "es": "Excursión privada a la Oficina Francisco Brennand y al Instituto Ricardo Brennand, con salida a las 10:00 y traslado ida y vuelta.",
     "en": "Private tour of the Francisco Brennand Workshop and Ricardo Brennand Institute, 10 am departure, round-trip transfer included."},
    ["corrigido 'hoteís' → 'hotéis' e espaço antes da vírgula em 'Brennand ,'",
     "horário de saída 10:00 consta no texto original",
     "texto cortado após 'parada de aproximadamente 2 horas n...'; a visita ao Instituto Ricardo Brennand e o retorno ao hotel foram deduzidos do NOME do produto — confirmar ordem e tempo no Instituto",
     "ingressos dos dois espaços: incluídos ou não? Não consta no trecho disponível"])

pas(8, "city-tour-olinda-instituto-ricardo-brennand",
    {"pt": "City tour em Olinda e Instituto Ricardo Brennand", "es": "City tour por Olinda e Instituto Ricardo Brennand", "en": "Olinda city tour and Ricardo Brennand Institute"},
    {"pt": ["Um passeio imperdível em Pernambuco: city tour por Olinda com guia e visita ao Instituto Ricardo Brennand, com ingresso incluído.",
            "A saída é da sua hospedagem, em veículo privativo."],
     "es": ["Una excursión imperdible en Pernambuco: city tour por Olinda con guía y visita al Instituto Ricardo Brennand, con entrada incluida.",
            "La salida es desde tu alojamiento, en vehículo privado."],
     "en": ["A must-do tour in Pernambuco: Olinda city tour with a guide and a visit to the Ricardo Brennand Institute, ticket included.",
            "Pickup is at your accommodation, in a private vehicle."]},
    {"pt": ["Veículo privativo", "Motorista", "Guia", "Ingresso do Instituto Ricardo Brennand"], "es": ["Vehículo privado", "Chofer", "Guía", "Entrada del Instituto Ricardo Brennand"],
     "en": ["Private vehicle", "Driver", "Guide", "Ricardo Brennand Institute ticket"]}, NAO_ABI,
    "Hospedagem do cliente (Recife)", "Olinda e Instituto Ricardo Brennand",
    {"pt": "City tour Olinda e Instituto Ricardo Brennand", "es": "City tour Olinda e Instituto R. Brennand", "en": "Olinda tour and Ricardo Brennand Institute"},
    {"pt": "City tour privativo em Olinda com guia e visita ao Instituto Ricardo Brennand, com ingresso incluído.",
     "es": "City tour privado por Olinda con guía y visita al Instituto Ricardo Brennand, con entrada incluida.",
     "en": "Private Olinda city tour with a guide plus a visit to the Ricardo Brennand Institute, entrance ticket included."},
    ["corrigido 'ímperdível' → 'imperdível'",
     "roteiro cortado em 'Roteiro: ...'; ordem das paradas, horários e duração desconhecidos"])

pas(9, "catamara-fernando-de-noronha",
    {"pt": "Passeio de catamarã em Fernando de Noronha", "es": "Paseo en catamarán en Fernando de Noronha", "en": "Catamaran tour in Fernando de Noronha"},
    {"pt": ["Passeio de catamarã pelo Mar de Dentro de Fernando de Noronha.",
            "Saída da Praia do Porto pela manhã, acompanhando a rota dos golfinhos. O roteiro começa com uma passagem pelas outras ilhas do arquipélago."],
     "es": ["Paseo en catamarán por el Mar de Dentro de Fernando de Noronha.",
            "Salida desde la Praia do Porto por la mañana, siguiendo la ruta de los delfines. El recorrido empieza pasando por las otras islas del archipiélago."],
     "en": ["Catamaran tour along the Mar de Dentro (inner sea) of Fernando de Noronha.",
            "Departure from Praia do Porto in the morning, following the dolphins' route. The tour starts by passing the other islands of the archipelago."]},
    VAZIO, VAZIO, "Praia do Porto (Fernando de Noronha)", "Mar de Dentro (Fernando de Noronha)",
    {"pt": "Passeio de catamarã em Fernando de Noronha", "es": "Catamarán en Fernando de Noronha", "en": "Fernando de Noronha catamaran tour"},
    {"pt": "Passeio de catamarã em Fernando de Noronha: saída da Praia do Porto pela manhã, na rota dos golfinhos pelo Mar de Dentro.",
     "es": "Paseo en catamarán en Fernando de Noronha: salida de la Praia do Porto por la mañana, por la ruta de los delfines.",
     "en": "Catamaran tour in Fernando de Noronha: morning departure from Praia do Porto along the dolphins' route in the inner sea."},
    ["texto cortado em '...e o famos[o]...'; resto do roteiro, duração e inclusos (snorkel? lanche? transfer da pousada?) desconhecidos",
     "inclusos/não inclusos vazios por falta de fonte — preencher",
     "serviço provavelmente operado por parceiro na ilha: confirmar se a empresa ainda revende",
     "taxa de preservação ambiental de Noronha não é citada; convém avisar que não está incluída"])

pas(10, "carro-para-noivas-recife-olinda",
    {"pt": "Carro com motorista para noivas (casamentos no Recife e em Olinda)", "es": "Auto con chofer para novias (bodas en Recife y Olinda)", "en": "Bridal car with driver (weddings in Recife and Olinda)"},
    {"pt": ["Veículo privativo com motorista para levar a noiva ao casamento no Recife ou em Olinda."],
     "es": ["Vehículo privado con chofer para llevar a la novia a la boda en Recife u Olinda."],
     "en": ["Private vehicle with driver to take the bride to her wedding in Recife or Olinda."]},
    VM, VAZIO, "Recife ou Olinda (endereço da noiva)", "Local da cerimônia (Recife ou Olinda)",
    {"pt": "Carro para noivas no Recife e em Olinda", "es": "Auto para novias en Recife y Olinda", "en": "Bridal car in Recife and Olinda"},
    {"pt": "Carro privativo com motorista para noivas em casamentos no Recife e em Olinda.",
     "es": "Auto privado con chofer para novias en bodas en Recife y Olinda.",
     "en": "Private car with driver for brides at weddings in Recife and Olinda."},
    ["texto original era só 'Motorista Agua veículo privativo' (truncado/sem sentido); reescrito com o mínimo que o nome garante",
     "faltam: modelo/cor do carro, horas incluídas, decoração, trajeto (casa → cerimônia → festa?). Sem isso, talvez melhor vender por orçamento no WhatsApp",
     "o nome Paytour usava 'Aluguel de veículo'; trocado por 'Carro com motorista' porque não é locação sem motorista"])

pas(11, "catamara-recife-com-transfer",
    {"pt": "Passeio de catamarã no Recife com transfer privativo", "es": "Paseo en catamarán en Recife con traslado privado", "en": "Recife catamaran tour with private transfer"},
    {"pt": ["Um passeio maravilhoso pelas águas do Rio Capibaribe, percorrendo as três ilhas do centro do Recife (Santo Antônio, Recife Antigo e Boa Vista) e passando por baixo da Ponte do Limoeiro, da Ponte Princesa Isabel e de outras pontes da cidade.",
            "Inclui transfer privativo da sua hospedagem até o embarque e de volta."],
     "es": ["Un paseo maravilloso por las aguas del río Capibaribe, recorriendo las tres islas del centro de Recife (Santo Antônio, Recife Antigo y Boa Vista) y pasando por debajo del Puente do Limoeiro, del Puente Princesa Isabel y de otros puentes de la ciudad.",
            "Incluye traslado privado desde tu alojamiento hasta el embarque y de regreso."],
     "en": ["A wonderful ride along the Capibaribe River, around the three islands of downtown Recife (Santo Antônio, Recife Antigo and Boa Vista), passing under the Limoeiro Bridge, the Princesa Isabel Bridge and other city bridges.",
            "Includes a private transfer from your accommodation to the boarding point and back."]},
    {"pt": ["Transfer privativo de ida e volta", "Passeio de catamarã"], "es": ["Traslado privado de ida y vuelta", "Paseo en catamarán"], "en": ["Private round-trip transfer", "Catamaran ride"]},
    VAZIO, "Hospedagem do cliente (Recife)", "Rio Capibaribe (centro do Recife)",
    {"pt": "Catamarã no Recife com transfer privativo", "es": "Catamarán en Recife con traslado privado", "en": "Recife catamaran tour with transfer"},
    {"pt": "Passeio de catamarã pelo Rio Capibaribe e as três ilhas do centro do Recife, com transfer privativo de ida e volta.",
     "es": "Paseo en catamarán por el río Capibaribe y las tres islas del centro de Recife, con traslado privado ida y vuelta.",
     "en": "Catamaran ride on the Capibaribe River around downtown Recife's three islands, with private round-trip transfer."},
    ["corrigido 'Ponte do Limeiro' → 'Ponte do Limoeiro' (nome real da ponte)",
     "texto cortado em 'Ponte Princesa...'; completado como 'Ponte Princesa Isabel' (única ponte com esse nome no Recife) — conferir",
     "'transfers privativo' → 'transfer privativo' (concordância)",
     "ingresso do catamarã listado como incluso porque o produto é o passeio; confirmar. Horários de saída e duração desconhecidos"])

pas(16, "mergulho-batismo-recife",
    {"pt": "Mergulho com cilindro no Recife (batismo)", "es": "Buceo con tanque en Recife (bautismo)", "en": "Scuba diving in Recife (discover scuba)"},
    {"pt": ["Para quem não tem experiência com mergulho ou nunca fez um curso: o mergulho de batismo.",
            "No dia escolhido, buscamos você no endereço informado no Recife."],
     "es": ["Para quien no tiene experiencia en buceo o nunca hizo un curso: el buceo de bautismo.",
            "El día elegido, te buscamos en la dirección indicada en Recife."],
     "en": ["For those with no diving experience or who have never taken a course: a discover scuba (try dive).",
            "On the chosen day, we pick you up at the address you provide in Recife."]},
    {"pt": ["Busca no endereço informado"], "es": ["Búsqueda en la dirección indicada"], "en": ["Pickup at your address"]}, VAZIO,
    "Endereço do cliente (Recife)", "Ponto de mergulho (Recife)",
    {"pt": "Mergulho de batismo no Recife", "es": "Buceo de bautismo en Recife", "en": "Discover scuba diving in Recife"},
    {"pt": "Mergulho de batismo com cilindro no Recife, para quem nunca mergulhou. Busca no endereço informado.",
     "es": "Buceo de bautismo con tanque en Recife, para quien nunca buceó. Te buscamos en la dirección indicada.",
     "en": "Discover scuba diving in Recife for first-timers. Pickup at your address included."},
    ["marcação '*BATISMO*' removida",
     "texto cortado após 'buscar no endereço solic[itado]...'; horário, local, profundidade, instrutor, equipamento e duração desconhecidos",
     "R$ 1.020 é por pessoa ou por grupo? Regra de pax (3 incluídos) provavelmente não se aplica a mergulho — definir",
     "atividade de risco: avaliar termo de responsabilidade/declaração médica no checkout"])

pas(21, "city-tour-recife-olinda",
    {"pt": "City tour Recife e Olinda", "es": "City tour por Recife y Olinda", "en": "Recife and Olinda city tour"},
    {"pt": ["Com certeza, o passeio que todo turista deve fazer ao visitar o Recife: city tour pelo Recife e por Olinda com guia local.",
            "A saída é da sua hospedagem, em veículo privativo."],
     "es": ["Sin duda, la excursión que todo turista tiene que hacer al visitar Recife: city tour por Recife y Olinda con guía local.",
            "La salida es desde tu alojamiento, en vehículo privado."],
     "en": ["The tour every visitor to Recife should take: a city tour of Recife and Olinda with a local guide.",
            "Pickup is at your accommodation, in a private vehicle."]},
    {"pt": ["Veículo privativo", "Motorista", "Guia local"], "es": ["Vehículo privado", "Chofer", "Guía local"], "en": ["Private vehicle", "Driver", "Local guide"]},
    {"pt": ["Alimentação", "Bebidas", "Ingressos"], "es": ["Comidas", "Bebidas", "Entradas"], "en": ["Meals", "Drinks", "Entrance fees"]},
    "Hospedagem do cliente (Recife)", "Recife e Olinda",
    {"pt": "City tour Recife e Olinda", "es": "City tour Recife y Olinda", "en": "Recife and Olinda city tour"},
    {"pt": "City tour privativo pelo Recife e por Olinda com guia local. Saída da sua hospedagem em veículo privativo.",
     "es": "City tour privado por Recife y Olinda con guía local. Salida desde tu alojamiento en vehículo privado.",
     "en": "Private city tour of Recife and Olinda with a local guide. Pickup at your accommodation in a private vehicle."},
    ["roteiro cortado em 'Saída do se...'; paradas, horários e duração desconhecidos"])

pas(24, "passeio-4-praias-cabo-de-santo-agostinho",
    {"pt": "Passeio privativo do Recife a 4 praias do Cabo de Santo Agostinho", "es": "Excursión privada de Recife a 4 playas de Cabo de Santo Agostinho", "en": "Private trip from Recife to 4 beaches of Cabo de Santo Agostinho"},
    {"pt": ["Um passeio inesquecível e imperdível para quem está no Recife: quatro praias do Cabo de Santo Agostinho em um só dia.",
            "A saída é em veículo privativo, de Boa Viagem, Pina ou Piedade. O horário é definido na confirmação, porque depende da tábua das marés do dia."],
     "es": ["Una excursión inolvidable e imperdible si estás en Recife: cuatro playas de Cabo de Santo Agostinho en un solo día.",
            "La salida es en vehículo privado, desde Boa Viagem, Pina o Piedade. El horario se define en la confirmación, porque depende de la tabla de mareas del día."],
     "en": ["An unforgettable, must-do trip if you are in Recife: four beaches of Cabo de Santo Agostinho in a single day.",
            "You travel in a private vehicle from Boa Viagem, Pina or Piedade. The departure time is set when we confirm, because it depends on the day's tide table."]},
    VM, VAZIO, "Boa Viagem, Pina ou Piedade (Recife)", "Praias do Cabo de Santo Agostinho",
    {"pt": "Passeio 4 praias do Cabo de Santo Agostinho", "es": "Excursión 4 playas de Cabo de Santo Agostinho", "en": "4 beaches of Cabo de Santo Agostinho tour"},
    {"pt": "Passeio privativo do Recife a quatro praias do Cabo de Santo Agostinho. Saída de Boa Viagem, Pina ou Piedade; horário conforme a maré.",
     "es": "Excursión privada de Recife a cuatro playas de Cabo de Santo Agostinho. Salida de Boa Viagem, Pina o Piedade; horario según la marea.",
     "en": "Private trip from Recife to four beaches of Cabo de Santo Agostinho. Pickup in Boa Viagem, Pina or Piedade; timing follows the tide."},
    ["corrigido 'definifir' → 'definir' e 'tabua de marés' → 'tábua das marés'",
     "texto cortado em 'com destino a Pra...'; QUAIS são as 4 praias (ex.: Gaibu, Calhetas, Paraíso, Suape?) não consta — informar para o texto e o SEO"])

pas(25, "passeio-praia-do-paiva-piscinas-naturais",
    {"pt": "Passeio privativo às piscinas naturais da Praia do Paiva (snorkel e/ou surfe)", "es": "Excursión privada a las piscinas naturales de Praia do Paiva (snorkel y/o surf)",
     "en": "Private trip to the natural pools of Praia do Paiva (snorkeling and/or surfing)"},
    {"pt": ["Um passeio imperdível em Pernambuco: as piscinas naturais da Praia do Paiva, para fazer snorkel e/ou surfe.",
            "A saída é da sua hospedagem, em veículo privativo, com equipamento de snorkel e de praia incluído."],
     "es": ["Una excursión imperdible en Pernambuco: las piscinas naturales de Praia do Paiva, para hacer snorkel y/o surf.",
            "La salida es desde tu alojamiento, en vehículo privado, con equipo de snorkel y de playa incluido."],
     "en": ["A must-do trip in Pernambuco: the natural pools of Praia do Paiva, for snorkeling and/or surfing.",
            "Pickup is at your accommodation in a private vehicle, with snorkeling and beach gear included."]},
    {"pt": ["Veículo privativo", "Motorista", "Equipamento de snorkel", "Equipamento de praia"], "es": ["Vehículo privado", "Chofer", "Equipo de snorkel", "Equipo de playa"],
     "en": ["Private vehicle", "Driver", "Snorkeling gear", "Beach gear"]}, NAO_ABI,
    "Hospedagem do cliente (Recife)", "Praia do Paiva (Cabo de Santo Agostinho)",
    {"pt": "Piscinas naturais da Praia do Paiva", "es": "Piscinas naturales de Praia do Paiva", "en": "Praia do Paiva natural pools trip"},
    {"pt": "Passeio privativo às piscinas naturais da Praia do Paiva para snorkel e/ou surfe, com equipamento de snorkel e de praia.",
     "es": "Excursión privada a las piscinas naturales de Praia do Paiva para snorkel y/o surf, con equipo de snorkel y de playa.",
     "en": "Private trip to the Praia do Paiva natural pools for snorkeling and/or surfing, with snorkeling and beach gear."},
    ["corrigido 'ímperdível' → 'imperdível' e 'snorkelling' → 'snorkel'",
     "roteiro cortado em 'Roteiro: Saída...'; horário (depende da maré?) e duração desconhecidos",
     "prancha/aula de surfe inclusa? O texto só cita equipamento de snorkel e de praia — confirmar"])

trilha_paras = {
    "pt": ["Trilha dos Escravos em Maracaípe: um passeio imperdível para quem visita a região de Porto de Galinhas.",
           "Atravessamos o Rio Maracaípe até a estrada secreta da Trilha do Aratu, numa imersão na natureza e na história do lugar."],
    "es": ["Trilha dos Escravos (Sendero de los Esclavos) en Maracaípe: una excursión imperdible para quien visita la región de Porto de Galinhas.",
           "Cruzamos el río Maracaípe hasta el camino secreto de la Trilha do Aratu, en una inmersión en la naturaleza y la historia del lugar."],
    "en": ["Trilha dos Escravos (Slaves' Trail) in Maracaípe: a must-do for anyone visiting the Porto de Galinhas area.",
           "We cross the Maracaípe River to the hidden path of the Aratu Trail, immersing ourselves in the nature and history of the place."]}
pas(26, "trilha-dos-escravos-maracaipe",
    {"pt": "Trilha dos Escravos em Maracaípe", "es": "Trilha dos Escravos en Maracaípe", "en": "Trilha dos Escravos (Slaves' Trail) in Maracaípe"},
    trilha_paras, VAZIO, VAZIO, "Maracaípe (Ipojuca)", "Trilha do Aratu (Maracaípe)",
    {"pt": "Trilha dos Escravos em Maracaípe", "es": "Trilha dos Escravos en Maracaípe", "en": "Slaves' Trail in Maracaípe"},
    {"pt": "Trilha dos Escravos em Maracaípe: travessia do Rio Maracaípe e caminhada pela Trilha do Aratu, perto de Porto de Galinhas.",
     "es": "Trilha dos Escravos en Maracaípe: cruce del río Maracaípe y caminata por la Trilha do Aratu, cerca de Porto de Galinhas.",
     "en": "Slaves' Trail in Maracaípe: cross the Maracaípe River and walk the Aratu Trail, near Porto de Galinhas."},
    ["corrigido 'imperdivel' → 'imperdível' e espaço antes da vírgula em 'Maracaípe ,'",
     "texto cortado em 'fazendo assim uma imersã[o]...'; o complemento 'na natureza e na história do lugar' é genérico — conferir com o texto real",
     "ponto de encontro, transporte (incluso ou não), guia, duração e horário desconhecidos; inclusos vazios por falta de fonte"])
pas(33, "trilha-dos-escravos-maracaipe-saindo-de-recife",
    {"pt": "Trilha dos Escravos em Maracaípe, com saída do Recife", "es": "Trilha dos Escravos en Maracaípe, con salida desde Recife", "en": "Trilha dos Escravos (Slaves' Trail) in Maracaípe, from Recife"},
    {k: trilha_paras[k] + [{"pt": "Nesta versão, a saída é do Recife.", "es": "En esta versión, la salida es desde Recife.", "en": "In this version, the tour departs from Recife."}[k]] for k in L},
    VAZIO, VAZIO, "Recife", "Trilha do Aratu (Maracaípe)",
    {"pt": "Trilha dos Escravos saindo do Recife", "es": "Trilha dos Escravos desde Recife", "en": "Slaves' Trail Maracaípe from Recife"},
    {"pt": "Trilha dos Escravos em Maracaípe com saída do Recife: travessia do Rio Maracaípe e caminhada pela Trilha do Aratu.",
     "es": "Trilha dos Escravos en Maracaípe con salida desde Recife: cruce del río Maracaípe y caminata por la Trilha do Aratu.",
     "en": "Slaves' Trail in Maracaípe departing from Recife: cross the Maracaípe River and walk the Aratu Trail."},
    ["corrigido 'imperdivel' → 'imperdível' e espaço antes da vírgula",
     "texto curto idêntico ao produto 26; a diferença (saída do Recife, R$ 700 × R$ 200) vem só do nome. Confirmar o que muda: veículo privativo de ida e volta?",
     "inclusos vazios por falta de fonte"])

pas(30, "mergulho-credenciados-recife",
    {"pt": "Mergulho com cilindro no Recife (para credenciados)", "es": "Buceo con tanque en Recife (para buzos certificados)", "en": "Scuba diving in Recife (certified divers)"},
    {"pt": ["Saída de mergulho dupla, diurna, para mergulhadores credenciados.",
            "No dia escolhido, buscamos você no endereço informado no Recife, no início da manhã."],
     "es": ["Salida de buceo doble, diurna, para buzos certificados.",
            "El día elegido, te buscamos en la dirección indicada en Recife, temprano por la mañana."],
     "en": ["Two-tank daytime dive trip for certified divers.",
            "On the chosen day, we pick you up at the address you provide in Recife, early in the morning."]},
    {"pt": ["Busca no endereço informado", "Dois mergulhos (saída dupla diurna)"], "es": ["Búsqueda en la dirección indicada", "Dos inmersiones (salida doble diurna)"],
     "en": ["Pickup at your address", "Two dives (daytime two-tank trip)"]}, VAZIO,
    "Endereço do cliente (Recife)", "Pontos de mergulho (Recife)",
    {"pt": "Mergulho para credenciados no Recife", "es": "Buceo para certificados en Recife", "en": "Certified scuba diving in Recife"},
    {"pt": "Saída de mergulho dupla diurna no Recife para mergulhadores credenciados, com busca no endereço informado.",
     "es": "Salida de buceo doble diurna en Recife para buzos certificados, con búsqueda en la dirección indicada.",
     "en": "Two-tank daytime dive trip in Recife for certified divers, with pickup at your address."},
    ["removido '*- Tarifas de saídas credenciadas 2023*' (ano datado, §3); preço mantido o do CSV (R$ 780) — confirmar se ainda vale",
     "texto original dizia busca 'às 06:...' (minutos cortados); escrito 'no início da manhã' — informar horário exato",
     "naufrágios/pontos, equipamento, certificação exigida e duração desconhecidos",
     "R$ 780 é por pessoa ou por grupo? Regra de pax provavelmente não se aplica — definir"])

pas(34, "passeio-maragogi-caminho-de-moises",
    {"pt": "Passeio privativo a Maragogi (Caminho de Moisés), com saída do Recife", "es": "Excursión privada a Maragogi (Caminho de Moisés), con salida desde Recife",
     "en": "Private trip to Maragogi (Caminho de Moisés), from Recife"},
    {"pt": ["Saída de hotéis em Boa Viagem, Piedade ou Pina, em veículo privativo, com destino à Praia de Barra Grande, em Maragogi.",
            "Em frente ao Caminho de Moisés, vocês usam a estrutura de um restaurante para aproveitar o dia."],
     "es": ["Salida desde hoteles en Boa Viagem, Piedade o Pina, en vehículo privado, con destino a la Praia de Barra Grande, en Maragogi.",
            "Frente al Caminho de Moisés, usan la estructura de un restaurante para disfrutar el día."],
     "en": ["Departure from hotels in Boa Viagem, Piedade or Pina in a private vehicle, heading to Barra Grande Beach in Maragogi.",
            "Facing the Caminho de Moisés (Moses' Path), you use a restaurant's facilities to enjoy the day."]},
    VM, VAZIO, "Hotéis em Boa Viagem, Piedade ou Pina (Recife)", "Praia de Barra Grande — Caminho de Moisés (Maragogi, AL)",
    {"pt": "Passeio Maragogi Caminho de Moisés", "es": "Excursión a Maragogi: Caminho de Moisés", "en": "Maragogi Moses' Path day trip"},
    {"pt": "Passeio privativo do Recife a Maragogi, na Praia de Barra Grande, em frente ao Caminho de Moisés.",
     "es": "Excursión privada de Recife a Maragogi, en la Praia de Barra Grande, frente al Caminho de Moisés.",
     "en": "Private day trip from Recife to Maragogi's Barra Grande Beach, facing the Caminho de Moisés (Moses' Path)."},
    ["corrigido 'Hoteís' → 'hotéis', 'aonde' → 'onde' (reescrito), 'infra estrutura' → 'estrutura' e espaço antes da vírgula",
     "texto cortado em 'infraestrutura do restauran[te]...'; nome do restaurante, consumo mínimo, horário e duração desconhecidos",
     "Caminho de Moisés depende da maré baixa? Se sim, informar regra de horário como nos outros passeios de maré"])

pas(36, "city-tour-recife-catamara",
    {"pt": "City tour Recife com catamarã", "es": "City tour por Recife con catamarán", "en": "Recife city tour with catamaran ride"},
    {"pt": ["City tour pelo Recife com passeio de catamarã, com ingresso do catamarã incluído."],
     "es": ["City tour por Recife con paseo en catamarán, con la entrada del catamarán incluida."],
     "en": ["Recife city tour with a catamaran ride, catamaran ticket included."]},
    {"pt": ["Ingresso do catamarã"], "es": ["Entrada del catamarán"], "en": ["Catamaran ticket"]}, VAZIO,
    "Hospedagem do cliente (Recife)", "Recife",
    {"pt": "City tour Recife com catamarã", "es": "City tour Recife con catamarán", "en": "Recife city tour and catamaran"},
    {"pt": "City tour pelo Recife com passeio de catamarã. Ingresso do catamarã incluído.",
     "es": "City tour por Recife con paseo en catamarán. Entrada del catamarán incluida.",
     "en": "Recife city tour with a catamaran ride. Catamaran ticket included."},
    ["texto original era só 'ingresso catamara' (corrigido 'catamara' → 'catamarã'); descrição mínima",
     "veículo, motorista e guia provavelmente inclusos (como nos outros city tours), mas NÃO constam — confirmar antes de listar",
     "R$ 520 vs 'City Tour Olinda com Catamarã' R$ 540 e 'Catamarã com transfer' R$ 300: conferir se não há sobreposição"])

# ---------------------------------------------------------------- montagem
out = []
for i, r in enumerate(rows, 1):
    p = produtos[i]
    item = {
        "ordem": i,
        "slug": p["slug"],
        "slug_paytour": r["slug_paytour"],
        "tipo": p["tipo"],
        "nome": p["nome"],
        "descricao": p["descricao"],
        "inclusos": p["inclusos"],
        "nao_inclusos": p["nao_inclusos"],
        "origem_padrao": p["origem_padrao"],
        "destino_padrao": p["destino_padrao"],
        "sentido": p["sentido"],
        "preco_base": preco(r["preco_brl"]),
        "pax_incluidos": 3,
        "adicional_por_pax": 0,
        "pax_max": 4,
        "duracao_min": p["duracao_min"],
        "confirmacao": p["confirmacao"],
        "imagens": [],
        "ativo": p["ativo"],
        "seo": p["seo"],
        "descricao_completa": False,
        "nome_paytour": r["nome"],
        "notas_revisao": p["notas_revisao"],
    }
    out.append(item)

assert len(out) == 46
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(OUT, "a").write("\n")
print("ok", len(out))
