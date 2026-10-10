"""Refaz os textos dos 46 produtos a partir do texto completo da Paytour.

Rodar da raiz do repositório:
    python3 -I docs/loja/conteudo/scripts/textos_completos.py

Fonte: campo `descricao_paytour` de produtos.json (texto original completo,
coletado em 09/10/2026). Os textos abaixo foram redigidos à mão, produto a
produto, em português revisado, espanhol (rioplatense, com voseo) e inglês.

Altera SOMENTE: descricao, inclusos, nao_inclusos, duracao_min,
descricao_completa (true) e acrescenta itens em notas_revisao.
Pode ser rodado de novo: as notas que este script acrescenta (prefixo
NOTA_PREFIXO) são trocadas, não duplicadas.
"""
import json
from pathlib import Path

ARQ = Path("docs/loja/conteudo/produtos.json")
NOTA_PREFIXO = "Texto completo (09/10/2026): "

LINGUAS = ("pt", "es", "en")


def par(*blocos):
    return "\n\n".join(blocos)


# ---------------------------------------------------------------------------
# Trechos de política (decisões 13 e 20 do plano)
# ---------------------------------------------------------------------------
POL_PASSEIO = {
    "pt": "Confirmação em até 24 horas após o pagamento. Se não houver vaga, o reembolso é integral e automático. Cancelamento grátis até 24 horas antes.",
    "es": "Confirmación dentro de las 24 horas posteriores al pago. Si no hay lugar, el reembolso es total y automático. Cancelación gratuita hasta 24 horas antes.",
    "en": "Confirmation within 24 hours of payment. If there is no availability, you get a full automatic refund. Free cancellation up to 24 hours before.",
}
POL_ENDERECO = {
    "pt": "O motorista espera até 15 minutos sem custo no endereço de embarque. Cancelamento grátis até 24 horas antes do horário reservado.",
    "es": "El chofer espera hasta 15 minutos sin cargo en la dirección de salida. Cancelación gratuita hasta 24 horas antes del horario reservado.",
    "en": "The driver waits up to 15 minutes at no cost at the pickup address. Free cancellation up to 24 hours before the booked time.",
}
POL_AEROPORTO = {
    "pt": "A espera no aeroporto é grátis por até 60 minutos, contados a partir do pouso. Quando o embarque é num endereço (hotel, pousada ou casa), o motorista espera até 15 minutos sem custo. Cancelamento grátis até 24 horas antes do horário reservado.",
    "es": "La espera en el aeropuerto es sin cargo hasta 60 minutos, contados desde el aterrizaje. Cuando la salida es desde una dirección (hotel, posada o casa), el chofer espera hasta 15 minutos sin cargo. Cancelación gratuita hasta 24 horas antes del horario reservado.",
    "en": "Waiting at the airport is free for up to 60 minutes after landing. When pickup is at an address (hotel, guesthouse or home), the driver waits up to 15 minutes at no cost. Free cancellation up to 24 hours before the booked time.",
}
LEMA = {
    "pt": "Pontualidade, conforto e segurança.",
    "es": "Puntualidad, comodidad y seguridad.",
    "en": "Punctuality, comfort and safety.",
}

# Notas comuns
N_TRANSFER_ERROS = "corrigido 'monitando' → 'monitorando', 'aguarando' → 'aguardando', 'Pontualide' → 'Pontualidade', 'boas vindas' → 'boas-vindas'; 'papel em seu nome' virou 'placa com o seu nome'"
N_POL_AEROPORTO = "política aplicada: espera grátis de 60 min no aeroporto (a partir do pouso) e 15 min em endereço; cancelamento grátis até 24 h antes. O original não falava de espera nem de cancelamento"
N_SO_CHEGADA = "o original só descreve a chegada ao aeroporto; para o sentido hotel → aeroporto o texto diz só a regra de espera em endereço. Falta dizer com quanta antecedência do voo o motorista busca no retorno (só os produtos de ida e volta informam)"
N_POL_ENDERECO = "política aplicada: espera grátis de 15 min no endereço; cancelamento grátis até 24 h antes"
N_POL_PASSEIO = "política aplicada: confirmação em até 24 h com reembolso automático se não houver vaga; cancelamento grátis até 24 h antes"
N_SUPERA = "textos (descricao, inclusos, nao_inclusos, duracao_min) refeitos a partir do texto completo da Paytour (campo descricao_paytour). As notas anteriores que falam de 'texto cortado' ou 'descrição completa não obtida' ficam superadas; dúvidas que continuam abertas estão repetidas abaixo"
N_OLINDA_ERROS = "corrigido 'ímperdível' → 'imperdível', 'azuleijos' → 'azulejos', 'Alta da Sé' → 'Alto da Sé', 'Ladeira da Misericórida' → 'Misericórdia', 'À bordo' → 'A bordo', 'ultimo' → 'último', espaço antes de vírgula"


# ---------------------------------------------------------------------------
# Transfers a partir do Aeroporto do Recife (texto padrão da Paytour)
# ---------------------------------------------------------------------------
def inclusos_aeroporto(pedagio=True):
    itens = {
        "pt": ["Veículo privativo", "Motorista", "Pedágio", "Kit de boas-vindas", "Recepção no aeroporto com placa com o seu nome", "Monitoramento do voo"],
        "es": ["Vehículo privado", "Chofer", "Peajes", "Kit de bienvenida", "Recepción en el aeropuerto con cartel con tu nombre", "Monitoreo del vuelo"],
        "en": ["Private vehicle", "Driver", "Tolls", "Welcome kit", "Airport meet & greet with a name sign", "Flight tracking"],
    }
    if not pedagio:
        for l in LINGUAS:
            del itens[l][2]
    return itens


CHEGADA_RECIFE = {
    "pt": "Na chegada, nossa equipe monitora o seu voo e espera você em frente ao portão de desembarque com uma placa com o seu nome. Como o estacionamento fica dentro do aeroporto, em menos de 5 minutos você já está no veículo, a caminho do hotel.",
    "es": "A tu llegada, nuestro equipo monitorea tu vuelo y te espera frente a la puerta de arribos con un cartel con tu nombre. Como el estacionamiento está dentro del aeropuerto, en menos de 5 minutos ya estás en el vehículo, camino al hotel.",
    "en": "On arrival, our team tracks your flight and waits for you at the arrivals gate with a sign showing your name. Parking is inside the airport, so you are in the vehicle in under 5 minutes, on your way to the hotel.",
}


def transfer_aeroporto(dest, ida_volta=False, retorno=None, pedagio=True, boa_viagem=False, notas=()):
    """dest: {pt, es, en} com artigo quando precisa (ex.: 'a Praia dos Carneiros').
    retorno: {pt, es, en} com a regra de saída para o voo de volta (ida e volta)."""
    orig = {
        "pt": "o Aeroporto Internacional do Recife" + (" (ou um endereço em Boa Viagem)" if boa_viagem else ""),
        "es": "el Aeropuerto Internacional de Recife" + (" (o una dirección en Boa Viagem)" if boa_viagem else ""),
        "en": "Recife International Airport" + (" (or an address in Boa Viagem)" if boa_viagem else ""),
    }
    if ida_volta:
        intro = {
            "pt": f"Transfer privativo de ida e volta entre {orig['pt']} e {dest['pt']}: buscamos você na chegada e levamos você de volta ao aeroporto no dia do voo de retorno.",
            "es": f"Traslado privado de ida y vuelta entre {orig['es']} y {dest['es']}: te buscamos a tu llegada y te llevamos de vuelta al aeropuerto el día de tu vuelo de regreso.",
            "en": f"Private round-trip transfer between {orig['en']} and {dest['en']}: we pick you up on arrival and take you back to the airport on the day of your return flight.",
        }
    else:
        intro = {
            "pt": f"Transfer privativo entre {orig['pt']} e {dest['pt']}. Na reserva, você escolhe o sentido: saindo do aeroporto (chegada) ou indo para o aeroporto (retorno).",
            "es": f"Traslado privado entre {orig['es']} y {dest['es']}. Al reservar, elegís el sentido: desde el aeropuerto (llegada) o hacia el aeropuerto (regreso).",
            "en": f"Private transfer between {orig['en']} and {dest['en']}. When booking, you choose the direction: from the airport (arrival) or to the airport (departure).",
        }
    desc = {}
    for l in LINGUAS:
        blocos = [intro[l], CHEGADA_RECIFE[l]]
        if retorno:
            blocos.append(retorno[l])
        blocos += [POL_AEROPORTO[l], LEMA[l]]
        desc[l] = par(*blocos)
    n = [N_TRANSFER_ERROS, N_POL_AEROPORTO]
    if not ida_volta:
        n.append(N_SO_CHEGADA)
    if not pedagio:
        n.append("o original não cita pedágio neste trajeto; ficou fora dos inclusos")
    if boa_viagem:
        n.append("o nome fala em saída do Aeroporto OU de Boa Viagem, mas o texto original só descreve a recepção no aeroporto; na saída de Boa Viagem vale a espera de 15 min em endereço")
    n += list(notas)
    return {"descricao": desc, "inclusos": inclusos_aeroporto(pedagio), "nao_inclusos": vazio(), "duracao_min": None, "notas": n}


def retorno(h, ht, onde_pt="", onde_es="", onde_en="", aprox=False):
    a_pt = "aproximadamente" if aprox else "geralmente"
    a_es = "aproximadamente" if aprox else "en general"
    a_en = "about" if aprox else "usually"
    return {
        "pt": f"No retorno, a saída do hotel para o aeroporto é {a_pt} {h[0]} antes do voo. Se houver trânsito{onde_pt}, mudamos para {ht[0]} antes.",
        "es": f"Para el regreso, la salida del hotel hacia el aeropuerto es {a_es} {h[1]} antes del vuelo. Si hay tránsito{onde_es}, la adelantamos a {ht[1]} antes.",
        "en": f"For the return, we leave the hotel for the airport {a_en} {h[2]} before your flight. If there is traffic{onde_en}, we leave {ht[2]} before.",
    }


N_RETORNO = "mantido o horário operacional de saída para o voo de volta ({}). Possível conflito para o dono decidir: com a espera grátis de 15 min no hotel, o cliente atrasado ainda chega com folga? E o cliente pode pedir outro horário?"


def vazio():
    return {"pt": [], "es": [], "en": []}


def lista(pt, es, en):
    assert len(pt) == len(es) == len(en), (pt, es, en)
    return {"pt": pt, "es": es, "en": en}


# ---------------------------------------------------------------------------
# Transfers entre endereços (sem aeroporto)
# ---------------------------------------------------------------------------
def transfer_endereco(orig, dest, embarque, chegada, pedagio, notas=()):
    """orig/dest: nomes nos 3 idiomas; embarque: onde a equipe espera (ida); chegada: onde termina."""
    desc = {}
    intro = {
        "pt": f"Transfer privativo entre {orig['pt']} e {dest['pt']}. Na reserva, você escolhe o sentido (ida ou volta).",
        "es": f"Traslado privado entre {orig['es']} y {dest['es']}. Al reservar, elegís el sentido (ida o vuelta).",
        "en": f"Private transfer between {orig['en']} and {dest['en']}. When booking, you choose the direction (one way or the other).",
    }
    corpo = {
        "pt": f"Nossa equipe chega em frente ao endereço de embarque em {embarque['pt']} 5 minutos antes do horário marcado, para colocar as bagagens no carro e seguir viagem até o seu endereço em {chegada['pt']}.",
        "es": f"Nuestro equipo llega frente a la dirección de salida en {embarque['es']} 5 minutos antes del horario acordado, para cargar el equipaje y seguir viaje hasta tu dirección en {chegada['es']}.",
        "en": f"Our team arrives at your pickup address in {embarque['en']} 5 minutes before the booked time, loads your luggage and drives you to your address in {chegada['en']}.",
    }
    for l in LINGUAS:
        desc[l] = par(intro[l], corpo[l], POL_ENDERECO[l], LEMA[l])
    inc = lista(["Veículo privativo", "Motorista"], ["Vehículo privado", "Chofer"], ["Private vehicle", "Driver"])
    if pedagio:
        inc = lista(inc["pt"] + ["Pedágio"], inc["es"] + ["Peajes"], inc["en"] + ["Tolls"])
    n = ["corrigido 'Pontualide' → 'Pontualidade'", N_POL_ENDERECO,
         "o original descreve só o sentido de ida; na volta o embarque é no endereço do destino"]
    if not pedagio:
        n.append("o original diz só 'veículo privativo e motorista inclusos'; pedágio ficou fora dos inclusos — confirmar")
    n += list(notas)
    return {"descricao": desc, "inclusos": inc, "nao_inclusos": vazio(), "duracao_min": None, "notas": n}


# ---------------------------------------------------------------------------
# Destinos (pt, es, en)
# ---------------------------------------------------------------------------
def d(pt, es, en):
    return {"pt": pt, "es": es, "en": en}


PDG = d("Porto de Galinhas / Muro Alto", "Porto de Galinhas / Muro Alto", "Porto de Galinhas / Muro Alto")
CARNEIROS = d("a Praia dos Carneiros", "la Praia dos Carneiros", "Carneiros Beach")
MARAGOGI = d("Maragogi (AL)", "Maragogi (Alagoas)", "Maragogi (Alagoas)")

T = {}

# ----- Transfers de aeroporto -----------------------------------------------
T["aeroporto-recife-porto-de-galinhas-ida-e-volta"] = transfer_aeroporto(
    PDG, ida_volta=True,
    retorno=retorno(("3 horas", "3 horas", "3 hours"), ("3 horas e meia", "3 horas y media", "3.5 hours")),
    notas=[N_RETORNO.format("3 h antes do voo; 3,5 h com trânsito"),
           "o original tinha a seção 'O que está incluso' com pedágio, receptivo no aeroporto e kit de boas-vindas; todos mantidos",
           "corrigido 'transito' → 'trânsito'"])
T["aeroporto-recife-porto-de-galinhas-ida"] = transfer_aeroporto(PDG)
T["aeroporto-recife-praia-dos-carneiros-ida"] = transfer_aeroporto(CARNEIROS)
T["aeroporto-recife-maragogi-ida-e-volta"] = transfer_aeroporto(
    MARAGOGI, ida_volta=True,
    retorno=retorno(("4 horas", "4 horas", "4 hours"), ("5 horas", "5 horas", "5 hours"),
                    " no Recife", " en Recife", " in Recife", aprox=True),
    notas=[N_RETORNO.format("cerca de 4 h antes do voo; 5 h com trânsito no Recife"),
           "corrigido 'transito' → 'trânsito' e espaço antes de vírgula"])
T["aeroporto-recife-serrambi-ida"] = transfer_aeroporto(d("Serrambi", "Serrambi", "Serrambi"))
T["aeroporto-recife-hoteis-recife-ida"] = transfer_aeroporto(
    d("hotéis e endereços no Recife", "hoteles y direcciones en Recife", "hotels and addresses in Recife"),
    notas=["o original diz 'pedágio incluso' também neste trajeto dentro do Recife; mantido — confirmar se há pedágio"])
T["aeroporto-recife-olinda-ida"] = transfer_aeroporto(d("Olinda", "Olinda", "Olinda"))
T["aeroporto-recife-maragogi-ida"] = transfer_aeroporto(MARAGOGI)
T["aeroporto-recife-boa-viagem-itamaraca-ida"] = transfer_aeroporto(
    d("a Ilha de Itamaracá", "la Isla de Itamaracá", "Itamaracá Island"), boa_viagem=True)
T["aeroporto-recife-praia-dos-carneiros-ida-e-volta"] = transfer_aeroporto(
    CARNEIROS, ida_volta=True,
    retorno=retorno(("4 horas", "4 horas", "4 hours"), ("4 horas e meia", "4 horas y media", "4.5 hours")),
    notas=[N_RETORNO.format("4 h antes do voo; 4,5 h com trânsito"), "corrigido 'transito' → 'trânsito'"])
T["aeroporto-recife-sao-miguel-dos-milagres-ida"] = transfer_aeroporto(
    d("São Miguel dos Milagres (AL)", "São Miguel dos Milagres (Alagoas)", "São Miguel dos Milagres (Alagoas)"))
T["aeroporto-recife-natal-ida"] = transfer_aeroporto(d("Natal (RN)", "Natal (Rio Grande do Norte)", "Natal (Rio Grande do Norte)"))
T["aeroporto-recife-joao-pessoa-cabedelo-ida"] = transfer_aeroporto(
    d("João Pessoa e Cabedelo (PB)", "João Pessoa y Cabedelo (Paraíba)", "João Pessoa and Cabedelo (Paraíba)"))
T["aeroporto-recife-japaratinga-ida"] = transfer_aeroporto(d("Japaratinga (AL)", "Japaratinga (Alagoas)", "Japaratinga (Alagoas)"))
T["aeroporto-recife-maceio-ida"] = transfer_aeroporto(
    d("hotéis em Maceió (AL)", "hoteles en Maceió (Alagoas)", "hotels in Maceió (Alagoas)"), pedagio=False)
T["aeroporto-recife-boa-viagem-caruaru-ida"] = transfer_aeroporto(d("Caruaru", "Caruaru", "Caruaru"), boa_viagem=True)
T["aeroporto-recife-cabo-de-santo-agostinho-ida"] = transfer_aeroporto(
    d("o Cabo de Santo Agostinho (hotéis e Vila Galé Eco Resort)", "Cabo de Santo Agostinho (hoteles y Vila Galé Eco Resort)",
      "Cabo de Santo Agostinho (hotels and Vila Galé Eco Resort)"))
T["aeroporto-recife-praia-da-pipa-ida"] = transfer_aeroporto(d("a Praia da Pipa (RN)", "Praia da Pipa (Rio Grande do Norte)", "Pipa Beach (Rio Grande do Norte)"))
T["aeroporto-recife-jaboatao-dos-guararapes-ida"] = transfer_aeroporto(d("Jaboatão dos Guararapes", "Jaboatão dos Guararapes", "Jaboatão dos Guararapes"))
T["aeroporto-recife-sirinhaem-ida"] = transfer_aeroporto(
    d("Sirinhaém", "Sirinhaém", "Sirinhaém"),
    notas=["texto idêntico ao de Serrambi (produto 14); continua a dúvida se são o mesmo trajeto"])

# Noronha
T["aeroporto-noronha-pousadas-ida"] = {
    "descricao": {
        "pt": par(
            "Transfer privativo entre o Aeroporto de Fernando de Noronha e a sua pousada. Na reserva, você escolhe o sentido: saindo do aeroporto (chegada) ou indo para o aeroporto (retorno).",
            "Na chegada, nossa equipe monitora o seu voo e espera você em frente ao portão de desembarque com uma placa com o seu nome. Como o estacionamento fica dentro do aeroporto, em menos de 5 minutos você já está no veículo, a caminho da pousada.",
            "No dia do voo de volta, a equipe informa o melhor horário de saída da pousada até o aeroporto.",
            POL_AEROPORTO["pt"], LEMA["pt"]),
        "es": par(
            "Traslado privado entre el Aeropuerto de Fernando de Noronha y tu posada. Al reservar, elegís el sentido: desde el aeropuerto (llegada) o hacia el aeropuerto (regreso).",
            "A tu llegada, nuestro equipo monitorea tu vuelo y te espera frente a la puerta de arribos con un cartel con tu nombre. Como el estacionamiento está dentro del aeropuerto, en menos de 5 minutos ya estás en el vehículo, camino a la posada.",
            "El día de tu vuelo de regreso, el equipo te avisa el mejor horario para salir de la posada hacia el aeropuerto.",
            POL_AEROPORTO["es"], LEMA["es"]),
        "en": par(
            "Private transfer between Fernando de Noronha Airport and your guesthouse. When booking, you choose the direction: from the airport (arrival) or to the airport (departure).",
            "On arrival, our team tracks your flight and waits for you at the arrivals gate with a sign showing your name. Parking is inside the airport, so you are in the vehicle in under 5 minutes, on your way to the guesthouse.",
            "On the day of your return flight, our team tells you the best time to leave the guesthouse for the airport.",
            POL_AEROPORTO["en"], LEMA["en"]),
    },
    "inclusos": inclusos_aeroporto(pedagio=False),
    "nao_inclusos": vazio(),
    "duracao_min": None,
    "notas": [N_TRANSFER_ERROS, "corrigido 'informara' → 'informará' e 'ate' → 'até'", N_POL_AEROPORTO,
              "o original não cita pedágio (correto para a ilha); ficou fora dos inclusos",
              "a empresa ainda atende Noronha? (dúvida que continua aberta)"],
}

# Curitiba (inativo)
T["aeroporto-curitiba-cidade"] = {
    "descricao": {
        "pt": par(
            "Transfer privativo entre o Aeroporto Internacional de Curitiba, em São José dos Pinhais, e o seu hotel em Curitiba.",
            "Na chegada, nossa equipe monitora o seu voo e espera você em frente ao portão de desembarque com uma placa com o seu nome. Como o estacionamento fica dentro do aeroporto, em menos de 5 minutos você já está no veículo, a caminho do hotel.",
            "No retorno, a saída para o aeroporto é aproximadamente 3 horas antes do voo. Se houver trânsito em Curitiba, mudamos para 4 horas antes.",
            POL_AEROPORTO["pt"], "Pontualidade, conforto e a segurança que você merece."),
        "es": par(
            "Traslado privado entre el Aeropuerto Internacional de Curitiba, en São José dos Pinhais, y tu hotel en Curitiba.",
            "A tu llegada, nuestro equipo monitorea tu vuelo y te espera frente a la puerta de arribos con un cartel con tu nombre. Como el estacionamiento está dentro del aeropuerto, en menos de 5 minutos ya estás en el vehículo, camino al hotel.",
            "Para el regreso, la salida hacia el aeropuerto es aproximadamente 3 horas antes del vuelo. Si hay tránsito en Curitiba, la adelantamos a 4 horas antes.",
            POL_AEROPORTO["es"], "Puntualidad, comodidad y la seguridad que merecés."),
        "en": par(
            "Private transfer between Curitiba International Airport, in São José dos Pinhais, and your hotel in Curitiba.",
            "On arrival, our team tracks your flight and waits for you at the arrivals gate with a sign showing your name. Parking is inside the airport, so you are in the vehicle in under 5 minutes, on your way to the hotel.",
            "For the return, we leave for the airport about 3 hours before your flight. If there is traffic in Curitiba, we leave 4 hours before.",
            POL_AEROPORTO["en"], "Punctuality, comfort and the safety you deserve."),
    },
    "inclusos": inclusos_aeroporto(pedagio=False),
    "nao_inclusos": vazio(),
    "duracao_min": None,
    "notas": [N_TRANSFER_ERROS, "corrigido 'transito' → 'trânsito'", N_POL_AEROPORTO,
              N_RETORNO.format("cerca de 3 h antes do voo; 4 h com trânsito em Curitiba"),
              "o texto fala do retorno, mas o nome não diz 'ida ou volta': o produto cobre os dois sentidos? (produto inativo)"],
}

# ----- Transfers entre endereços --------------------------------------------
T["boa-viagem-piedade-porto-de-galinhas-ida"] = transfer_endereco(
    d("Boa Viagem, Pina ou Piedade", "Boa Viagem, Pina o Piedade", "Boa Viagem, Pina or Piedade"),
    d("Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas"),
    d("Boa Viagem, Pina ou Piedade", "Boa Viagem, Pina o Piedade", "Boa Viagem, Pina or Piedade"),
    d("Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas"), pedagio=True,
    notas=["ERRO NO ORIGINAL corrigido: o texto dizia 'seguir viagem até endereço em Maragogi'; trocado por Porto de Galinhas (destino do produto). Confirmar",
           "corrigido 'PIna' → 'Pina'"])
T["olinda-maragogi-ida"] = transfer_endereco(
    d("Olinda", "Olinda", "Olinda"), MARAGOGI, d("Olinda", "Olinda", "Olinda"), d("Maragogi", "Maragogi", "Maragogi"), pedagio=False)
T["porto-de-galinhas-maragogi-ida"] = transfer_endereco(
    PDG, MARAGOGI, d("Porto de Galinhas ou Muro Alto", "Porto de Galinhas o Muro Alto", "Porto de Galinhas or Muro Alto"),
    d("Maragogi", "Maragogi", "Maragogi"), pedagio=False)
T["olinda-porto-de-galinhas-ida"] = transfer_endereco(
    d("Olinda", "Olinda", "Olinda"), d("Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas"),
    d("Olinda", "Olinda", "Olinda"), d("Porto de Galinhas", "Porto de Galinhas", "Porto de Galinhas"), pedagio=False,
    notas=["ERRO NO ORIGINAL corrigido: o texto dizia 'seguir viagem até endereço em Maragogi' (copiado de Olinda → Maragogi); trocado por Porto de Galinhas. Confirmar"])
T["porto-de-galinhas-praia-dos-carneiros-ida"] = transfer_endereco(
    PDG, CARNEIROS, d("Porto de Galinhas ou Muro Alto", "Porto de Galinhas o Muro Alto", "Porto de Galinhas or Muro Alto"),
    d("Tamandaré (Praia dos Carneiros)", "Tamandaré (Praia dos Carneiros)", "Tamandaré (Carneiros Beach)"), pedagio=False,
    notas=["corrigido 'Murto Alto' → 'Muro Alto'"])

T["recife-suape-refinaria-estaleiro-porto"] = {
    "descricao": {
        "pt": par("Transfer privativo do Recife ao Complexo de Suape: refinaria, estaleiro ou porto.",
                  "Nossa equipe espera você em frente ao endereço informado. A espera é grátis por até 15 minutos. Cancelamento grátis até 24 horas antes do horário reservado.",
                  LEMA["pt"]),
        "es": par("Traslado privado de Recife al Complejo de Suape: refinería, astillero o puerto.",
                  "Nuestro equipo te espera frente a la dirección indicada. La espera es sin cargo hasta 15 minutos. Cancelación gratuita hasta 24 horas antes del horario reservado.",
                  LEMA["es"]),
        "en": par("Private transfer from Recife to the Suape Complex: refinery, shipyard or port.",
                  "Our team waits for you in front of the address you give us. Waiting is free for up to 15 minutes. Free cancellation up to 24 hours before the booked time.",
                  LEMA["en"]),
    },
    "inclusos": lista(["Veículo privativo", "Motorista", "Pedágio"], ["Vehículo privado", "Chofer", "Peajes"], ["Private vehicle", "Driver", "Tolls"]),
    "nao_inclusos": vazio(),
    "duracao_min": None,
    "notas": ["corrigido 'Pontualide' → 'Pontualidade' e espaço que faltava depois do ponto ('solicitado.Temos')",
              "os '15 minutos de espera' do original batem com a política nova (15 min em endereço); acrescentado cancelamento grátis até 24 h",
              "vale também para a volta (Suape → Recife)? (dúvida que continua aberta)"],
}

T["recife-caruaru-sao-joao-ida-e-volta"] = {
    "descricao": {
        "pt": par("Transfer privativo de ida e volta do Recife ao Polo de São João de Caruaru.",
                  "O motorista busca você no endereço informado no Recife. A saída e a volta são no mesmo endereço. No caminho, há uma parada opcional no Rei das Coxinhas, em Gravatá.",
                  "O motorista espera o fim do evento e traz você de volta direto para o endereço de saída no Recife.",
                  POL_ENDERECO["pt"]),
        "es": par("Traslado privado de ida y vuelta de Recife al Polo de São João de Caruaru.",
                  "El chofer te busca en la dirección indicada en Recife. La salida y la vuelta son en la misma dirección. En el camino hay una parada opcional en Rei das Coxinhas, en Gravatá.",
                  "El chofer espera el final del evento y te trae de vuelta directo a la dirección de salida en Recife.",
                  POL_ENDERECO["es"]),
        "en": par("Private round-trip transfer from Recife to the São João festival grounds in Caruaru.",
                  "The driver picks you up at the address you give us in Recife. Pickup and drop-off are at the same address. On the way there is an optional stop at Rei das Coxinhas, in Gravatá.",
                  "The driver waits until the event ends and brings you straight back to your pickup address in Recife.",
                  POL_ENDERECO["en"]),
    },
    "inclusos": lista(["Veículo privativo", "Motorista"], ["Vehículo privado", "Chofer"], ["Private vehicle", "Driver"]),
    "nao_inclusos": lista(["Ingressos", "Alimentação e bebidas"], ["Entradas", "Comidas y bebidas"], ["Tickets", "Food and drinks"]),
    "duracao_min": None,
    "notas": ["corrigido 'busca-lo' → 'buscá-lo' (reescrito como 'busca você') e 'veiculo' → 'veículo'",
              N_POL_ENDERECO,
              "o motorista espera até o fim do evento: o preço cobre quantas horas de espera? Há limite de horário?",
              "pedágio não citado no original; ficou fora dos inclusos (produto inativo)"],
}

# ---------------------------------------------------------------------------
# Passeios
# ---------------------------------------------------------------------------
P_INC_VEIC = lista(["Veículo privativo", "Motorista"], ["Vehículo privado", "Chofer"], ["Private vehicle", "Driver"])
P_NAO_PADRAO = lista(["Alimentação", "Bebidas", "Demais ingressos"], ["Comidas", "Bebidas", "Otras entradas"], ["Food", "Drinks", "Other tickets"])


def passeio(pt, es, en, inclusos, nao_inclusos, duracao, notas):
    return {
        "descricao": {"pt": par(pt, POL_PASSEIO["pt"]), "es": par(es, POL_PASSEIO["es"]), "en": par(en, POL_PASSEIO["en"])},
        "inclusos": inclusos, "nao_inclusos": nao_inclusos, "duracao_min": duracao,
        "notas": list(notas) + [N_POL_PASSEIO],
    }


ROTEIRO_OLINDA = {
    "pt": "- Em Olinda, a primeira parada é o Convento de São Francisco, com o maior acervo de azulejos portugueses do estado. Lá, você encontra o guia local, que explica o lugar.\n- De carro até o Alto da Sé. Dali, o percurso é a pé: Catedral da Sé, Bonecos de Olinda, casas de artesanato, Igreja da Misericórdia, Ladeira da Misericórdia, Mercado da Ribeira e Mosteiro de São Bento.\n- Última parada: Igreja do Carmo.",
    "es": "- En Olinda, la primera parada es el Convento de São Francisco, con la mayor colección de azulejos portugueses del estado. Ahí te encontrás con el guía local, que te cuenta la historia del lugar.\n- En auto hasta el Alto da Sé. Desde ahí, el recorrido es a pie: Catedral da Sé, Muñecos de Olinda, casas de artesanías, Iglesia de la Misericordia, Ladeira da Misericórdia, Mercado da Ribeira y Monasterio de São Bento.\n- Última parada: Iglesia del Carmo.",
    "en": "- In Olinda, the first stop is the São Francisco Convent, home to the largest collection of Portuguese tiles in the state. There you meet the local guide, who explains the site.\n- By car up to Alto da Sé. From there, the tour is on foot: Sé Cathedral, the Olinda Giant Puppets, craft shops, Misericórdia Church, Ladeira da Misericórdia, Ribeira Market and São Bento Monastery.\n- Last stop: Carmo Church.",
}
VISTA_RECIFE = {
    "pt": "a Praça do Marco Zero, o Parque das Esculturas, a Assembleia Legislativa, o Teatro de Santa Isabel e o casario da Rua da Aurora",
    "es": "la Praça do Marco Zero, el Parque de las Esculturas, la Asamblea Legislativa, el Teatro de Santa Isabel y las casonas de la Rua da Aurora",
    "en": "Marco Zero Square, the Sculpture Park, the State Legislative Assembly, Santa Isabel Theater and the old houses of Rua da Aurora",
}

T["passeio-porto-de-galinhas-piscinas-naturais"] = passeio(
    par("Um passeio inesquecível e imperdível para quem está no Recife: um dia em Porto de Galinhas, a praia eleita 10 vezes seguidas a mais bonita do Brasil.",
        "A saída é em veículo privativo, de Boa Viagem, Pina ou Piedade. O horário é combinado depois da reserva, porque depende da tábua das marés do dia. A ida até Porto de Galinhas leva cerca de 45 minutos.",
        "**Como é o dia**\n- Base no Restaurante Peixe na Telha, em frente às piscinas naturais: belas paisagens, bebidas refrescantes e comida regional.\n- Embarque na jangada na maré seca, quase em frente ao restaurante.\n- Passeio de jangada até as piscinas naturais, de cerca de 60 minutos. A bordo, um guia local conta histórias e curiosidades da região.\n- Tempo livre para aproveitar a vila, fazer compras e comer.\n- Retorno ao hotel às 15h."),
    par("Una excursión inolvidable e imperdible si estás en Recife: un día en Porto de Galinhas, la playa elegida 10 veces seguidas como la más linda de Brasil.",
        "La salida es en vehículo privado, desde Boa Viagem, Pina o Piedade. El horario se acuerda después de la reserva, porque depende de la tabla de mareas del día. El viaje de ida a Porto de Galinhas lleva unos 45 minutos.",
        "**Cómo es el día**\n- Base en el Restaurante Peixe na Telha, frente a las piscinas naturales: paisajes hermosos, bebidas frescas y comida regional.\n- Embarque en la jangada (balsa típica de vela) con la marea baja, casi enfrente del restaurante.\n- Paseo en jangada hasta las piscinas naturales, de unos 60 minutos. A bordo, un guía local cuenta historias y curiosidades de la zona.\n- Tiempo libre para recorrer el pueblo, hacer compras y comer.\n- Regreso al hotel a las 15 h."),
    par("An unforgettable, must-do trip if you are in Recife: a day in Porto de Galinhas, voted Brazil's most beautiful beach 10 times in a row.",
        "You leave in a private vehicle from Boa Viagem, Pina or Piedade. The departure time is set after booking, because it depends on the day's tide table. The drive to Porto de Galinhas takes about 45 minutes.",
        "**How the day goes**\n- Your base is Peixe na Telha restaurant, facing the natural pools: great views, cold drinks and local food.\n- You board the jangada (traditional sail raft) at low tide, almost in front of the restaurant.\n- Jangada ride to the natural pools, about 60 minutes. On board, a local guide shares stories and fun facts about the area.\n- Free time to enjoy the village, shop and eat.\n- Back at the hotel at 3 pm."),
    lista(["Veículo privativo", "Motorista", "Passeio de jangada até as piscinas naturais (cerca de 60 min)", "Guia local a bordo da jangada"],
          ["Vehículo privado", "Chofer", "Paseo en jangada a las piscinas naturales (unos 60 min)", "Guía local a bordo de la jangada"],
          ["Private vehicle", "Driver", "Jangada ride to the natural pools (about 60 min)", "Local guide on the jangada"]),
    vazio(), None,
    [N_SUPERA,
     "corrigido 'definifir' → 'definir', 'tabua de marés' → 'tábua das marés', 'jnagada' → 'jangada', 'duraçao' → 'duração', 'infra estrutura' → 'infraestrutura', 'À bordo' → 'A bordo', 'em frente as' → 'em frente às'",
     "'10x consecutivas' → '10 vezes seguidas'; confirmar se o título ainda vale antes de publicar",
     "a ida 'de 45 min aproximadamente' parece curta para Boa Viagem → Porto de Galinhas (~60 km); confirmar",
     "duracao_min = null: a saída depende da maré e só o retorno (15h) é fixo",
     "o original não diz o que NÃO está incluído; alimentação e bebidas no Peixe na Telha são pagas à parte? Se sim, acrescentar"])

T["passeio-praia-dos-carneiros"] = passeio(
    par("Um passeio inesquecível, daqueles para a lista de desejos de quem está no Recife: um dia na Praia dos Carneiros, uma das praias mais bonitas do Brasil.",
        "A saída é às 7h45, em veículo privativo, de Boa Viagem, Pina ou Piedade. A ida até Carneiros leva cerca de 1 hora e 30 minutos.",
        "**Como é o dia**\n- Base no Restaurante Bora Bora, em Carneiros: belas paisagens, bebidas refrescantes e comida regional.\n- Embarque no catamarã entre 10h30 e 11h, em frente ao restaurante.\n- A bordo, um guia conta histórias e curiosidades da região, com música e muita alegria.\n- Paradas na bancada de areia, no banho de argila e na igrejinha."),
    par("Una excursión inolvidable, de esas para la lista de deseos si estás en Recife: un día en la Praia dos Carneiros, una de las playas más lindas de Brasil.",
        "La salida es a las 7:45, en vehículo privado, desde Boa Viagem, Pina o Piedade. El viaje de ida a Carneiros lleva alrededor de 1 hora y 30 minutos.",
        "**Cómo es el día**\n- Base en el Restaurante Bora Bora, en Carneiros: paisajes hermosos, bebidas frescas y comida regional.\n- Embarque en el catamarán entre las 10:30 y las 11, frente al restaurante.\n- A bordo, un guía cuenta historias y curiosidades de la zona, con música y mucha alegría.\n- Paradas en el banco de arena, en el baño de arcilla y en la iglesita."),
    par("An unforgettable, bucket-list trip if you are in Recife: a day at Carneiros Beach, one of the most beautiful beaches in Brazil.",
        "You leave at 7:45 am in a private vehicle from Boa Viagem, Pina or Piedade. The drive to Carneiros takes about 1 hour 30 minutes.",
        "**How the day goes**\n- Your base is Bora Bora restaurant in Carneiros: great views, cold drinks and local food.\n- You board the catamaran between 10:30 and 11 am, in front of the restaurant.\n- On board, a guide shares stories and fun facts about the area, with music and lots of fun.\n- Stops at the sandbank, the clay bath and the little chapel."),
    P_INC_VEIC, vazio(), None,
    [N_SUPERA,
     "corrigido 'infra estrutura' → 'infraestrutura', 'À bordo' → 'A bordo'; 'bucket list' → 'lista de desejos'",
     "confirmado pelo texto completo: '1,5 hora' é o tempo da ida até Carneiros, não a duração do passeio",
     "o catamarã está incluído no preço? O texto descreve o embarque mas não diz. Se estiver, acrescentar aos inclusos",
     "horário de retorno ao hotel não informado; duracao_min = null",
     "o original não diz o que NÃO está incluído (alimentação? bebidas? catamarã?)"])

T["city-tour-olinda-catamara"] = passeio(
    par("Um passeio imperdível em Pernambuco: o Recife visto do rio, de catamarã, e depois o centro histórico de Olinda.",
        "**Roteiro**\n- Saída do seu hotel por volta das 10h, rumo ao catamarã.\n- Passeio de catamarã com vista para pontos turísticos como " + VISTA_RECIFE["pt"] + ". A bordo, um guia conta histórias e curiosidades do Recife.\n- Opção de almoçar no restaurante do catamarã, com vista para a Bacia do Pina.\n- Depois do almoço, seguimos para Olinda.\n" + ROTEIRO_OLINDA["pt"] + "\n- Retorno ao hotel por volta das 16h30."),
    par("Una excursión imperdible en Pernambuco: Recife visto desde el río, en catamarán, y después el centro histórico de Olinda.",
        "**Recorrido**\n- Salida de tu hotel alrededor de las 10, rumbo al catamarán.\n- Paseo en catamarán con vista a puntos turísticos como " + VISTA_RECIFE["es"] + ". A bordo, un guía cuenta historias y curiosidades de Recife.\n- Opción de almorzar en el restaurante del catamarán, con vista a la Bacia do Pina.\n- Después del almuerzo, vamos a Olinda.\n" + ROTEIRO_OLINDA["es"] + "\n- Regreso al hotel alrededor de las 16:30."),
    par("A must-do tour in Pernambuco: Recife seen from the river by catamaran, then the historic center of Olinda.",
        "**Itinerary**\n- Pickup at your hotel around 10 am, heading to the catamaran.\n- Catamaran ride with views of sights such as " + VISTA_RECIFE["en"] + ". On board, a guide shares stories and fun facts about Recife.\n- Option to have lunch at the catamaran's restaurant, overlooking the Pina basin.\n- After lunch, we drive to Olinda.\n" + ROTEIRO_OLINDA["en"] + "\n- Back at the hotel around 4:30 pm."),
    lista(["Veículo privativo", "Motorista", "Guia local", "Ingresso do catamarã"],
          ["Vehículo privado", "Chofer", "Guía local", "Entrada del catamarán"],
          ["Private vehicle", "Driver", "Local guide", "Catamaran ticket"]),
    P_NAO_PADRAO, 390,
    [N_SUPERA, N_OLINDA_ERROS,
     "duracao_min = 390: calculado da saída (~10h) ao retorno (~16h30), horários aproximados do original"])

T["oficina-brennand-instituto-ricardo-brennand"] = passeio(
    par("Imperdível para quem está visitando o Recife: dois dos espaços de arte mais importantes do país no mesmo dia.",
        "**Roteiro**\n- Saída às 10h, em veículo privativo, de hotéis em Boa Viagem, Piedade ou Pina.\n- Cerca de 2 horas na Oficina Francisco Brennand.\n- Mais cerca de 2 horas no Instituto Ricardo Brennand.\n- Retorno ao hotel por volta das 15h.",
        "**Oficina Francisco Brennand**\nUm lugar único na arte do Brasil e do mundo. O conjunto arquitetônico monumental reúne a obra de Francisco Brennand e a produção da Cerâmica Brennand. Em 1971, o artista ocupou as ruínas da antiga Cerâmica São João, fábrica de telhas e tijolos fundada pelo pai dele e desativada na década de 1940. Em quase cinco décadas, os galpões e fornos da fábrica viraram o seu espaço de pesquisa e criação: um universo onírico próprio.",
        "**Instituto Ricardo Brennand**\nEspaço cultural sem fins lucrativos, inaugurado em 2002. Guarda um valioso acervo artístico e histórico, vindo da coleção particular do industrial pernambucano Ricardo Coimbra de Almeida Brennand. Fica nas terras do antigo engenho São João, na Várzea, numa área de 77.603 m² cercada por mata atlântica preservada. Reúne o Museu Castelo São João (armas brancas), a Pinacoteca, a Biblioteca, o Auditório, o Jardim das Esculturas e uma galeria para exposições temporárias e eventos. Foi eleito um dos melhores museus da América do Sul."),
    par("Imperdible si estás visitando Recife: dos de los espacios de arte más importantes del país en un mismo día.",
        "**Recorrido**\n- Salida a las 10, en vehículo privado, desde hoteles en Boa Viagem, Piedade o Pina.\n- Unas 2 horas en la Oficina Francisco Brennand.\n- Otras 2 horas, más o menos, en el Instituto Ricardo Brennand.\n- Regreso al hotel alrededor de las 15.",
        "**Oficina Francisco Brennand**\nUn lugar único en el arte de Brasil y del mundo. Su conjunto arquitectónico monumental reúne la obra de Francisco Brennand y la producción de Cerámica Brennand. En 1971 el artista ocupó las ruinas de la antigua Cerámica São João, una fábrica de tejas y ladrillos fundada por su padre y cerrada en la década de 1940. En casi cinco décadas, los galpones y hornos de la fábrica se convirtieron en su espacio de investigación y creación: un universo onírico propio.",
        "**Instituto Ricardo Brennand**\nEspacio cultural sin fines de lucro, inaugurado en 2002. Guarda un valioso acervo artístico e histórico que viene de la colección privada del industrial pernambucano Ricardo Coimbra de Almeida Brennand. Está en las tierras del antiguo ingenio São João, en el barrio de Várzea, en un predio de 77.603 m² rodeado de mata atlántica preservada. Reúne el Museo Castillo São João (armas blancas), la Pinacoteca, la Biblioteca, el Auditorio, el Jardín de las Esculturas y una galería para muestras temporarias y eventos. Fue elegido uno de los mejores museos de América del Sur."),
    par("A must for anyone visiting Recife: two of Brazil's most important art spaces in one day.",
        "**Itinerary**\n- Pickup at 10 am, in a private vehicle, from hotels in Boa Viagem, Piedade or Pina.\n- About 2 hours at Oficina Francisco Brennand.\n- About 2 more hours at Instituto Ricardo Brennand.\n- Back at the hotel around 3 pm.",
        "**Oficina Francisco Brennand**\nA unique place in Brazilian and world art. Its monumental buildings hold the work of Francisco Brennand and the production of Cerâmica Brennand. In 1971 the artist moved into the ruins of the old São João ceramics factory, which made roof tiles and bricks. His father had founded it, and it closed in the 1940s. Over almost five decades, its sheds and kilns became his place to research and create: a dreamlike world of his own.",
        "**Instituto Ricardo Brennand**\nA non-profit cultural center opened in 2002. It keeps a valuable art and history collection that came from the private collection of Pernambuco industrialist Ricardo Coimbra de Almeida Brennand. It stands on the land of the old São João sugar mill, in the Várzea district, on 77,603 m² surrounded by preserved Atlantic Forest. It includes the São João Castle Museum (edged weapons), the Art Gallery, the Library, the Auditorium, the Sculpture Garden and a gallery for temporary exhibitions and events. It has been voted one of the best museums in South America."),
    lista(["Veículo privativo", "Motorista", "Ingressos da Oficina Francisco Brennand e do Instituto Ricardo Brennand"],
          ["Vehículo privado", "Chofer", "Entradas a la Oficina Francisco Brennand y al Instituto Ricardo Brennand"],
          ["Private vehicle", "Driver", "Tickets to Oficina Francisco Brennand and Instituto Ricardo Brennand"]),
    vazio(), 300,
    [N_SUPERA,
     "corrigido 'hoteís' → 'hotéis', 'aonde' → 'onde', espaço antes de vírgula",
     "o original diz só 'ingressos'; entendido como os ingressos dos dois lugares visitados. Confirmar",
     "resumido o parágrafo de 'missão' do Instituto (preservação e difusão da cultura), que era texto institucional; nenhum fato foi acrescentado",
     "duracao_min = 300: calculado da saída (10h) ao retorno (~15h)",
     "o original não diz o que NÃO está incluído (alimentação?)"])

T["city-tour-olinda-instituto-ricardo-brennand"] = passeio(
    par("Um passeio imperdível em Pernambuco: o centro histórico de Olinda e o Instituto Ricardo Brennand no mesmo dia.",
        "**Roteiro**\n- Saída do seu hotel às 8h, passando pelo Recife Antigo até Olinda.\n" + ROTEIRO_OLINDA["pt"] + "\n- Volta ao Alto da Sé, com 1 hora livre para almoço ou compras.\n- Visita de 2 horas ao Instituto Ricardo Brennand.\n- Retorno ao hotel por volta das 15h30."),
    par("Una excursión imperdible en Pernambuco: el centro histórico de Olinda y el Instituto Ricardo Brennand en un mismo día.",
        "**Recorrido**\n- Salida de tu hotel a las 8, pasando por Recife Antiguo hasta Olinda.\n" + ROTEIRO_OLINDA["es"] + "\n- Vuelta al Alto da Sé, con 1 hora libre para almorzar o hacer compras.\n- Visita de 2 horas al Instituto Ricardo Brennand.\n- Regreso al hotel alrededor de las 15:30."),
    par("A must-do tour in Pernambuco: Olinda's historic center and Instituto Ricardo Brennand in one day.",
        "**Itinerary**\n- Pickup at your hotel at 8 am, driving through Old Recife to Olinda.\n" + ROTEIRO_OLINDA["en"] + "\n- Back up to Alto da Sé, with 1 free hour for lunch or shopping.\n- 2-hour visit to Instituto Ricardo Brennand.\n- Back at the hotel around 3:30 pm."),
    lista(["Veículo privativo", "Motorista", "Guia", "Ingresso do Instituto Ricardo Brennand"],
          ["Vehículo privado", "Chofer", "Guía", "Entrada al Instituto Ricardo Brennand"],
          ["Private vehicle", "Driver", "Guide", "Instituto Ricardo Brennand ticket"]),
    P_NAO_PADRAO, 450,
    [N_SUPERA, N_OLINDA_ERROS,
     "o original manda 'subir ao Alto da Sé' para o almoço depois de já ter passado por lá a pé; mantida a ordem ('volta ao Alto da Sé'). Confirmar",
     "duracao_min = 450: calculado da saída (8h) ao retorno (~15h30)"])

T["catamara-fernando-de-noronha"] = passeio(
    par("Um dia de catamarã pelo mar de dentro de Fernando de Noronha, das 8h30 às 14h30.",
        "**Roteiro**\n- Saída da Praia do Porto pela manhã, acompanhando toda a rota dos golfinhos pelo mar de dentro.\n- Passagem pelas outras ilhas do arquipélago e pelo famoso \"rugido do leão\": o som das ondas ecoando numa caverna natural de rocha vulcânica.\n- Longa parada para mergulho na Baía do Sancho, considerada a praia mais bonita do mundo.\n- Retorno à Praia do Porto para o desembarque.",
        "**O diferencial**\nNa parada na Baía do Sancho, depois do mergulho, é servido a bordo um bufê com peixe fresco da ilha, preparado de várias formas. O cardápio pode ir do sashimi às postas de filé, com qualidade excepcional e várias guarnições."),
    par("Un día en catamarán por el mar de dentro de Fernando de Noronha, de 8:30 a 14:30.",
        "**Recorrido**\n- Salida de la Praia do Porto a la mañana, siguiendo toda la ruta de los delfines por el mar de dentro.\n- Paso por las otras islas del archipiélago y por el famoso \"rugido del león\": el sonido de las olas que retumba en una cueva natural de roca volcánica.\n- Parada larga para bucear en la Baía do Sancho, considerada la playa más linda del mundo.\n- Regreso a la Praia do Porto para el desembarque.",
        "**El diferencial**\nEn la parada en la Baía do Sancho, después del buceo, se sirve a bordo un bufé con pescado fresco de la isla, preparado de distintas formas. El menú puede ir del sashimi a las postas de filet, con una calidad excepcional y varias guarniciones."),
    par("A day on a catamaran along the inner sea of Fernando de Noronha, from 8:30 am to 2:30 pm.",
        "**Itinerary**\n- Leaves Praia do Porto in the morning and follows the whole dolphin route along the inner sea.\n- Passes the other islands of the archipelago and the famous \"lion's roar\": waves echoing inside a natural cave of volcanic rock.\n- Long stop for snorkeling at Baía do Sancho, often called the most beautiful beach in the world.\n- Back to Praia do Porto to go ashore.",
        "**What makes it special**\nDuring the stop at Baía do Sancho, after the swim, a buffet with fresh local fish is served on board, prepared in several ways. The menu can range from sashimi to fish steaks, of excellent quality, with a variety of side dishes."),
    lista(["Passeio de catamarã (8h30 às 14h30)", "Parada para mergulho na Baía do Sancho", "Bufê a bordo com peixe fresco da ilha"],
          ["Paseo en catamarán (8:30 a 14:30)", "Parada para bucear en la Baía do Sancho", "Bufé a bordo con pescado fresco de la isla"],
          ["Catamaran trip (8:30 am to 2:30 pm)", "Snorkeling stop at Baía do Sancho", "On-board buffet with fresh local fish"]),
    vazio(), 360,
    [N_SUPERA,
     "corrigido 'Considerara' → 'considerada', 'abordo' → 'a bordo', 'Buffet' → 'bufê'; 'Baía de Sancho' padronizado como 'Baía do Sancho'",
     "duracao_min = 360: horário do original (8h30 às 14h30)",
     "o bufê aparece como 'diferencial'; entendido como incluído. Confirmar",
     "o original não fala de transfer da pousada até a Praia do Porto, nem de equipamento de mergulho, nem das taxas da ilha (TPA, parque nacional). Informar o que está e o que não está incluído",
     "a empresa ainda vende este passeio? (dúvida que continua aberta sobre Noronha)"])

T["carro-para-noivas-recife-olinda"] = passeio(
    par("Uma data especial merece um transporte à altura da noiva. Oferecemos veículo privativo para deixar o seu dia mais confortável e exclusivo.",
        "Motorista uniformizado e serviço de bordo com água gelada."),
    par("Una fecha especial merece un traslado a la altura de la novia. Te ofrecemos un vehículo privado para que tu día sea más cómodo y exclusivo.",
        "Chofer uniformado y servicio a bordo con agua bien fría."),
    par("A special day deserves a ride worthy of the bride. We offer a private vehicle to make your day more comfortable and exclusive.",
        "Uniformed driver and on-board service with chilled water."),
    lista(["Veículo privativo", "Motorista uniformizado", "Água gelada a bordo"],
          ["Vehículo privado", "Chofer uniformado", "Agua fría a bordo"],
          ["Private vehicle", "Uniformed driver", "Chilled water on board"]),
    vazio(), None,
    [N_SUPERA,
     "corrigido 'Agua' → 'Água', 'confortavel' → 'confortável', espaço antes do ponto; 'de acordo com a noiva' → 'à altura da noiva'",
     "o texto completo é curto: falta dizer quantas horas de serviço o preço cobre, o trajeto (casa → cerimônia → festa?), o modelo do carro e se há decoração. Vender por orçamento no WhatsApp continua sendo uma opção"])

T["catamara-recife-com-transfer"] = passeio(
    par("Um passeio maravilhoso pelas águas do Rio Capibaribe. Venha conhecer a Veneza Brasileira no tradicional passeio de catamarã.",
        "O catamarã percorre as três ilhas do centro do Recife (Santo Antônio, Recife Antigo e Boa Vista) e passa por baixo das pontes do Limoeiro, Princesa Isabel e Duarte Coelho. No caminho, você vê pontos turísticos como " + VISTA_RECIFE["pt"] + ". A bordo, um guia conta histórias e curiosidades do Recife.",
        "**Horários**\nO passeio acontece todos os dias do ano, às 11h, 16h e 20h. Confira os horários disponíveis na data escolhida. A saída do hotel é 1 hora antes, rumo ao catamarã.",
        "Também temos a versão noturna deste roteiro, pelo Recife iluminado."),
    par("Un paseo maravilloso por las aguas del río Capibaribe. Vení a conocer la Venecia brasileña en el tradicional paseo en catamarán.",
        "El catamarán recorre las tres islas del centro de Recife (Santo Antônio, Recife Antiguo y Boa Vista) y pasa por debajo de los puentes Limoeiro, Princesa Isabel y Duarte Coelho. En el camino vas a ver puntos turísticos como " + VISTA_RECIFE["es"] + ". A bordo, un guía cuenta historias y curiosidades de Recife.",
        "**Horarios**\nEl paseo sale todos los días del año, a las 11, 16 y 20 h. Fijate qué horarios hay disponibles en la fecha que elegís. La salida del hotel es 1 hora antes, rumbo al catamarán.",
        "También tenemos la versión nocturna de este recorrido, por Recife iluminado."),
    par("A wonderful trip on the Capibaribe River. Come and see the \"Brazilian Venice\" on the traditional catamaran ride.",
        "The catamaran goes around the three islands of downtown Recife (Santo Antônio, Old Recife and Boa Vista) and passes under the Limoeiro, Princesa Isabel and Duarte Coelho bridges. Along the way you see sights such as " + VISTA_RECIFE["en"] + ". On board, a guide shares stories and fun facts about Recife.",
        "**Times**\nThe ride runs every day of the year, at 11 am, 4 pm and 8 pm. Check the times available on your chosen date. We leave your hotel 1 hour before, heading to the catamaran.",
        "There is also a night version of this tour, through Recife lit up."),
    lista(["Transfer privativo saindo do hotel", "Guia a bordo do catamarã"],
          ["Traslado privado desde el hotel", "Guía a bordo del catamarán"],
          ["Private transfer from your hotel", "Guide on board the catamaran"]),
    vazio(), None,
    [N_SUPERA,
     "corrigido 'Ponte do Limeiro' → 'Ponte do Limoeiro', 'À bordo' → 'A bordo'; caixa-alta 'ROTEIRO REALIZADO TODOS OS DIAS DO ANO' passada para texto normal",
     "o original não diz se o ingresso do catamarã e a volta ao hotel estão incluídos (o nome diz só 'com transfer privativo'). Nos outros produtos com catamarã o ingresso está incluído. Confirmar e ajustar os inclusos",
     "a 'versão noturna pelo Recife iluminado' é a saída das 20h ou outro produto? Confirmar",
     "duração do passeio de barco não informada; duracao_min = null"])

T["mergulho-batismo-recife"] = passeio(
    par("Para quem nunca mergulhou ou nunca fez um curso: o mergulho de batismo é um primeiro contato seguro e divertido com o mergulho.",
        "**Como funciona**\n- No dia escolhido, buscamos você no endereço informado no Recife, por volta das 6h20.\n- Às 7h, aula prática na piscina: o instrutor explica o básico do mergulho, os procedimentos e os equipamentos.\n- Às 8h, embarque para o mergulho de batismo em naufrágio, em mar aberto, guiado e acompanhado de perto por um instrutor.",
        "**Importante**\nO mergulho de batismo não é um curso e não dá credencial. É um *Discovery*: uma experiência para quem não é mergulhador autônomo credenciado."),
    par("Para quien nunca buceó o nunca hizo un curso: el bautismo de buceo es un primer contacto seguro y divertido con el buceo.",
        "**Cómo funciona**\n- El día que elegís, te buscamos en la dirección que nos indiques en Recife, alrededor de las 6:20.\n- A las 7, clase práctica en la pileta: el instructor te explica lo básico del buceo, los procedimientos y los equipos.\n- A las 8, embarque para el bautismo en un naufragio, en mar abierto, guiado y acompañado de cerca por un instructor.",
        "**Importante**\nEl bautismo no es un curso y no da credencial. Es un *Discovery*: una experiencia para quien no es buzo autónomo certificado."),
    par("For anyone who has never dived or taken a course: the discovery dive is a safe and fun first contact with scuba diving.",
        "**How it works**\n- On your chosen day, we pick you up at your address in Recife at about 6:20 am.\n- At 7 am, a practice class in the pool: the instructor explains the basics of diving, the procedures and the gear.\n- At 8 am, you board the boat for your discovery dive on a shipwreck in the open sea, guided and closely watched by an instructor.",
        "**Good to know**\nA discovery dive is not a course and does not give you a certification. It is a *Discovery* experience for people who are not certified divers."),
    lista(["Busca no seu endereço no Recife", "Aula prática na piscina", "2 mergulhos em naufrágio", "Instrutor exclusivo", "Todo o equipamento necessário", "Lanche a bordo"],
          ["Te buscamos en tu dirección en Recife", "Clase práctica en pileta", "2 inmersiones en naufragio", "Instructor exclusivo", "Todo el equipo necesario", "Snack a bordo"],
          ["Pickup at your address in Recife", "Practice class in the pool", "2 shipwreck dives", "Private instructor", "All necessary gear", "Snack on board"]),
    vazio(), None,
    [N_SUPERA,
     "corrigido 'aula pratica' → 'aula prática', 'um aula' → 'uma aula'; asteriscos de WhatsApp (*BATISMO*) retirados",
     "o original diz 'iremos buscar', mas não diz se o cliente é levado de volta ao endereço. Confirmar e, se sim, trocar o item por 'Transfer de ida e volta'",
     "horário de término não informado; duracao_min = null",
     "preço por pessoa: confirmar se o valor é por mergulhador"])

T["city-tour-recife-olinda"] = passeio(
    par("Com certeza, é o passeio que todo turista deve fazer quando visita o Recife: o centro histórico do Recife e de Olinda no mesmo dia.",
        "**Roteiro**\n- Saída do seu hotel por volta das 8h, rumo ao Recife Antigo.\n- Vista de pontos turísticos como " + VISTA_RECIFE["pt"] + ", com paradas na Casa da Cultura (artesanato), na Capela Dourada, no Teatro de Santa Isabel e na Rua do Bom Jesus.\n- Em Olinda, almoço no Alto da Sé.\n" + ROTEIRO_OLINDA["pt"].replace("- Em Olinda, a primeira parada", "- Depois do almoço, a primeira parada", 1) + "\n- Retorno ao hotel por volta das 16h30."),
    par("Sin duda, es la excursión que todo turista tiene que hacer cuando visita Recife: el centro histórico de Recife y de Olinda en un mismo día.",
        "**Recorrido**\n- Salida de tu hotel alrededor de las 8, rumbo a Recife Antiguo.\n- Vista de puntos turísticos como " + VISTA_RECIFE["es"] + ", con paradas en la Casa da Cultura (artesanías), la Capilla Dorada, el Teatro de Santa Isabel y la Rua do Bom Jesus.\n- En Olinda, almuerzo en el Alto da Sé.\n" + ROTEIRO_OLINDA["es"].replace("- En Olinda, la primera parada", "- Después del almuerzo, la primera parada", 1) + "\n- Regreso al hotel alrededor de las 16:30."),
    par("This is the tour every visitor to Recife should take: the historic centers of Recife and Olinda in one day.",
        "**Itinerary**\n- Pickup at your hotel around 8 am, heading to Old Recife.\n- Views of sights such as " + VISTA_RECIFE["en"] + ", with stops at Casa da Cultura (crafts), the Golden Chapel, Santa Isabel Theater and Rua do Bom Jesus.\n- In Olinda, lunch at Alto da Sé.\n" + ROTEIRO_OLINDA["en"].replace("- In Olinda, the first stop", "- After lunch, the first stop", 1) + "\n- Back at the hotel around 4:30 pm."),
    lista(["Veículo privativo", "Motorista", "Guia local"], ["Vehículo privado", "Chofer", "Guía local"], ["Private vehicle", "Driver", "Local guide"]),
    lista(["Alimentação", "Bebidas", "Ingressos"], ["Comidas", "Bebidas", "Entradas"], ["Food", "Drinks", "Tickets"]),
    510,
    [N_SUPERA, N_OLINDA_ERROS,
     "corrigido 'Teatro Santa Izabel' → 'Teatro de Santa Isabel' e espaço dentro do parêntese '( Artesanatos)'",
     "o original põe o almoço no Alto da Sé e depois manda 'seguir de carro até o Alto da Sé' de novo; mantida a ordem. Confirmar",
     "duracao_min = 510: calculado da saída (~8h) ao retorno (~16h30)"])

T["passeio-4-praias-cabo-de-santo-agostinho"] = passeio(
    par("Um passeio inesquecível e imperdível para quem está no Recife: as praias do Cabo de Santo Agostinho num só dia.",
        "A saída é em veículo privativo, de Boa Viagem, Pina ou Piedade. O horário é combinado depois da reserva, porque depende da tábua das marés do dia.",
        "**Roteiro**\n- Praia do Paiva, a cerca de 30 minutos: piscinas naturais e belas paisagens, com parada de 45 minutos.\n- Calhetas: do mirante, dá para ver Gaibu. Você pode descer a trilha ou seguir para o Bar & Restaurante do Arthur. No caminho, há a opção de descer de tirolesa.\n- No restaurante: praia, bebidas refrescantes, comida regional e tempo livre.\n- Depois do almoço, Mirante do Paraíso e Praia de Suape.\n- Retorno ao hotel às 15h.",
        "Venha conhecer esse destino maravilhoso."),
    par("Una excursión inolvidable e imperdible si estás en Recife: las playas de Cabo de Santo Agostinho en un solo día.",
        "La salida es en vehículo privado, desde Boa Viagem, Pina o Piedade. El horario se acuerda después de la reserva, porque depende de la tabla de mareas del día.",
        "**Recorrido**\n- Praia do Paiva, a unos 30 minutos: piscinas naturales y paisajes hermosos, con una parada de 45 minutos.\n- Calhetas: desde el mirador se ve Gaibu. Podés bajar por el sendero o seguir hasta el Bar & Restaurante do Arthur. En el camino tenés la opción de bajar en tirolesa.\n- En el restaurante: playa, bebidas frescas, comida regional y tiempo libre.\n- Después del almuerzo, Mirante do Paraíso y Praia de Suape.\n- Regreso al hotel a las 15 h.",
        "Vení a conocer este destino maravilloso."),
    par("An unforgettable, must-do trip if you are in Recife: the beaches of Cabo de Santo Agostinho in one day.",
        "You leave in a private vehicle from Boa Viagem, Pina or Piedade. The departure time is set after booking, because it depends on the day's tide table.",
        "**Itinerary**\n- Paiva Beach, about 30 minutes away: natural pools and great views, with a 45-minute stop.\n- Calhetas: from the lookout you can see Gaibu. You can walk down the trail or go on to Bar & Restaurante do Arthur. On the way there is the option of a zip line ride down.\n- At the restaurant: beach, cold drinks, local food and free time.\n- After lunch, Paraíso Lookout and Suape Beach.\n- Back at the hotel at 3 pm.",
        "Come and discover this wonderful place."),
    P_INC_VEIC, vazio(), None,
    [N_SUPERA,
     "corrigido 'definifir' → 'definir', 'tabua de marés' → 'tábua das marés'; 'Parada com 45 min de espera' → 'parada de 45 minutos'",
     "as praias citadas no texto são Paiva, Calhetas, Gaibu (só vista do mirante) e Suape. São essas as 4? Confirmar",
     "a tirolesa é paga à parte? Alimentação e bebidas no restaurante do Arthur são pagas à parte? O original não tem 'não incluso'",
     "duracao_min = null: a saída depende da maré e só o retorno (15h) é fixo"])

T["passeio-praia-do-paiva-piscinas-naturais"] = passeio(
    par("Um passeio imperdível em Pernambuco: um dia nas piscinas naturais da Praia do Paiva, com snorkel.",
        "**Roteiro**\n- Saída do seu hotel no início da maré seca. Depois da reserva, a equipe avisa o horário de saída.\n- A Praia do Paiva era uma antiga fazenda de coco. Hoje uma reserva protege a faixa de 7 km de coqueiros da praia.\n- Parada em frente às piscinas naturais. O motorista monta a cadeira de praia e o guarda-sol.\n- Tempo livre de 4 horas para aproveitar as piscinas naturais e fazer snorkel.",
        "**Opcionais:** aluguel de prancha de surfe e parada para almoço."),
    par("Una excursión imperdible en Pernambuco: un día en las piscinas naturales de la Praia do Paiva, con snorkel.",
        "**Recorrido**\n- Salida de tu hotel al comienzo de la marea baja. Después de la reserva, el equipo te avisa el horario de salida.\n- La Praia do Paiva era una antigua plantación de cocos. Hoy una reserva protege la franja de 7 km de cocoteros de la playa.\n- Parada frente a las piscinas naturales. El chofer arma la silla de playa y la sombrilla.\n- 4 horas de tiempo libre para disfrutar las piscinas naturales y hacer snorkel.",
        "**Opcionales:** alquiler de tabla de surf y parada para almorzar."),
    par("A must-do trip in Pernambuco: a day at the natural pools of Paiva Beach, with snorkeling.",
        "**Itinerary**\n- Pickup at your hotel when low tide begins. After booking, our team tells you the departure time.\n- Paiva Beach used to be a coconut farm. Today a reserve protects its 7 km line of coconut palms.\n- Stop in front of the natural pools. The driver sets up a beach chair and umbrella.\n- 4 hours of free time to enjoy the natural pools and snorkel.",
        "**Optional extras:** surfboard rental and a lunch stop."),
    lista(["Veículo privativo", "Motorista", "Equipamento de snorkel", "Cadeira de praia e guarda-sol"],
          ["Vehículo privado", "Chofer", "Equipo de snorkel", "Silla de playa y sombrilla"],
          ["Private vehicle", "Driver", "Snorkel gear", "Beach chair and umbrella"]),
    lista(["Alimentação", "Bebidas", "Demais ingressos", "Aluguel de prancha de surfe (opcional)"],
          ["Comidas", "Bebidas", "Otras entradas", "Alquiler de tabla de surf (opcional)"],
          ["Food", "Drinks", "Other tickets", "Surfboard rental (optional)"]),
    None,
    [N_SUPERA,
     "corrigido 'ímperdível' → 'imperdível', 'inicio' → 'início', 'aonde' → 'onde', 'em frente as' → 'em frente às', espaços dentro dos parênteses; 'snorkelling' → 'snorkel'",
     "'equipamento de praia' detalhado como cadeira e guarda-sol, que é o que o próprio texto diz que o motorista monta",
     "duracao_min = null: a saída depende da maré; o texto só fixa as 4 horas livres na praia"])

TRILHA_PT = par(
    "Um passeio imperdível para quem está visitando a região. Atravessamos o Rio Maracaípe até a estrada secreta da Trilha do Aratu, numa imersão no manguezal, por caminhos usados pelos povos indígenas da região e, depois, por colonizadores e escravizados.",
    "A volta é pelo rio: você flutua com boia e colete salva-vidas enquanto a maré, subindo, leva o grupo até o ponto de chegada.",
    "- **Duração da trilha:** de 4 a 5 horas\n- **Dificuldade física:** leve\n- **Percurso:** 7,5 km ida e volta, já com a trilha flutuante",
    "**Roteiro**\n- Visita ao Studio Maracaípe\n- Apresentação de Nilo Baj\n- Apresentação de Beto Guedes, idealizador da Gaitero Ecoturismo\n- Apresentação de Romero Marques, artista plástico\n- Travessia do Rio Maracaípe\n- Início da Trilha dos Gaiteros (escravizados)\n- Trilha do Aterro dos Padres\n- Trilha na mata do Oitero\n- Subida ao Monte do Oitero\n- No alto do monte: vista do mar e da Ilha de Santo Aleixo, com explicação sobre a história da igreja e dos africanos escravizados na região\n- Visita à casa de farinha da Dilma\n- Rota dos Escravizados\n- Flutuação no Rio Maracaípe")
TRILHA_ES = par(
    "Una excursión imperdible si estás visitando la zona. Cruzamos el río Maracaípe hasta el camino secreto del Sendero de Aratu, para meternos en el manglar por caminos que usaron los pueblos indígenas de la región y, después, los colonizadores y los esclavizados.",
    "La vuelta es por el río: flotás con boya y chaleco salvavidas mientras la marea, que va subiendo, lleva al grupo hasta el punto de llegada.",
    "- **Duración del sendero:** de 4 a 5 horas\n- **Dificultad física:** baja\n- **Recorrido:** 7,5 km ida y vuelta, incluido el tramo flotando",
    "**Recorrido**\n- Visita al Studio Maracaípe\n- Presentación de Nilo Baj\n- Presentación de Beto Guedes, creador de Gaitero Ecoturismo\n- Presentación de Romero Marques, artista plástico\n- Cruce del río Maracaípe\n- Inicio del Sendero de los Gaiteros (esclavizados)\n- Sendero del Aterro dos Padres\n- Sendero en el monte de Oitero\n- Subida al Monte do Oitero\n- En la cima: vista al mar y a la Isla de Santo Aleixo, con explicación sobre la historia de la iglesia y de los africanos esclavizados en la región\n- Visita a la casa de harina de Dilma\n- Ruta de los Esclavizados\n- Flotación en el río Maracaípe")
TRILHA_EN = par(
    "A must-do trip for anyone visiting the area. We cross the Maracaípe River to the secret path of the Aratu Trail and walk deep into the mangrove, on routes used by the region's Indigenous peoples and later by colonizers and enslaved people.",
    "The way back is by river: you float with a buoy and life jacket while the rising tide carries the group to the finish point.",
    "- **Trail duration:** 4 to 5 hours\n- **Physical difficulty:** easy\n- **Distance:** 7.5 km round trip, including the floating section",
    "**Itinerary**\n- Visit to Studio Maracaípe\n- Talk by Nilo Baj\n- Talk by Beto Guedes, founder of Gaitero Ecoturismo\n- Talk by Romero Marques, visual artist\n- Crossing the Maracaípe River\n- Start of the Gaiteros Trail (enslaved people)\n- Aterro dos Padres Trail\n- Trail through the Oitero woods\n- Climb up Oitero Hill\n- At the top: view of the sea and Santo Aleixo Island, with the story of the church and of the enslaved Africans in the region\n- Visit to Dilma's cassava flour house\n- Route of the Enslaved\n- Floating down the Maracaípe River")
N_TRILHA = [
    "corrigido 'imperdivel' → 'imperdível', 'indigenas' → 'indígenas', 'boas' → 'boias', 'coletes salva vida' → 'coletes salva-vidas', 'Escravisados' → 'escravizados', 'artista plastico' → 'artista plástico', 'sto Alexo' → 'Santo Aleixo', 'Maracaipe' → 'Maracaípe', 'Inicio' → 'Início', espaços antes de vírgula e dentro de parênteses",
    "conferir a grafia de nomes próprios: 'Nilo Baj', 'Gaitero Ecoturismo', 'Trilha dos Gaiteros', 'mata/Monte do Oitero' (seria 'Oiteiro'?)",
    "duracao_min = null: o texto dá de 4 a 5 horas só de trilha, sem contar visitas e deslocamento",
    "o original não diz quem conduz a trilha (guia/condutor incluído?) nem o ponto de encontro",
]

T["trilha-dos-escravos-maracaipe"] = passeio(
    TRILHA_PT, TRILHA_ES, TRILHA_EN,
    lista(["Boia e colete salva-vidas para a flutuação"], ["Boya y chaleco salvavidas para la flotación"], ["Buoy and life jacket for the floating section"]),
    vazio(), None,
    [N_SUPERA] + N_TRILHA + ["preço por pessoa e sem transporte: o que muda em relação ao produto 33 (com saída do Recife) é só o transporte? (dúvida que continua aberta)"])

T["trilha-dos-escravos-maracaipe-saindo-de-recife"] = passeio(
    par("Trilha dos Escravos em Maracaípe, com saída do Recife em veículo privativo.", TRILHA_PT),
    par("Sendero de los Esclavos en Maracaípe, con salida desde Recife en vehículo privado.", TRILHA_ES),
    par("Slave Trail in Maracaípe, with departure from Recife in a private vehicle.", TRILHA_EN),
    lista(["Transporte privativo com saída do Recife", "Boia e colete salva-vidas para a flutuação"],
          ["Traslado privado con salida desde Recife", "Boya y chaleco salvavidas para la flotación"],
          ["Private transport from Recife", "Buoy and life jacket for the floating section"]),
    vazio(), None,
    [N_SUPERA] + N_TRILHA + [
        "o texto da Paytour é idêntico ao do produto 26 e não fala do transporte; a primeira frase e o item 'Transporte privativo com saída do Recife' vêm do nome do produto. Confirmar horário de saída, se inclui a volta ao Recife e se o ingresso da trilha está incluído"])

T["mergulho-credenciados-recife"] = passeio(
    par("Saída de mergulho dupla, de dia, para mergulhadores credenciados.",
        "**Como funciona**\n- No dia escolhido, buscamos você no endereço informado no Recife, por volta das 6h20.\n- Às 7h, aula prática na piscina: o instrutor passa as informações básicas sobre o mergulho, os procedimentos e os equipamentos.\n- Às 8h, embarque para o mergulho em naufrágio, em mar aberto.",
        "Para credenciados de nível básico, recomendamos pontos com menos de 30 m de profundidade, como Pirapama, Vapor de Baixo, Servemar e Taurus/Virgo, entre outros.",
        "Consulte-nos sobre mergulhos noturnos."),
    par("Salida doble de buceo, de día, para buzos certificados.",
        "**Cómo funciona**\n- El día que elegís, te buscamos en la dirección que nos indiques en Recife, alrededor de las 6:20.\n- A las 7, clase práctica en la pileta: el instructor repasa lo básico del buceo, los procedimientos y los equipos.\n- A las 8, embarque para bucear en un naufragio, en mar abierto.",
        "Para buzos con certificación básica recomendamos puntos de menos de 30 m de profundidad, como Pirapama, Vapor de Baixo, Servemar y Taurus/Virgo, entre otros.",
        "Consultanos por buceos nocturnos."),
    par("Two-dive daytime trip for certified divers.",
        "**How it works**\n- On your chosen day, we pick you up at your address in Recife at about 6:20 am.\n- At 7 am, a practice session in the pool: the instructor goes over the basics, the procedures and the gear.\n- At 8 am, you board the boat for a shipwreck dive in the open sea.",
        "For entry-level certified divers, we recommend sites shallower than 30 m, such as Pirapama, Vapor de Baixo, Servemar and Taurus/Virgo, among others.",
        "Ask us about night dives."),
    lista(["Transfer de ida e volta", "2 cilindros", "Lastro", "Barco", "Guia"],
          ["Traslado de ida y vuelta", "2 tanques", "Lastre", "Barco", "Guía"],
          ["Round-trip transfer", "2 tanks", "Weights", "Boat", "Guide"]),
    lista(["Aluguel de colete (BCD)", "Aluguel de regulador", "Aluguel de roupa de mergulho", "Aluguel de máscara", "Aluguel de nadadeira", "Nitrox"],
          ["Alquiler de chaleco (BCD)", "Alquiler de regulador", "Alquiler de traje de buceo", "Alquiler de máscara", "Alquiler de aletas", "Nitrox"],
          ["BCD rental", "Regulator rental", "Wetsuit rental", "Mask rental", "Fin rental", "Nitrox"]),
    None,
    [N_SUPERA,
     "retirado o título '- Tarifas de saídas credenciadas 2023' (ano e preço)",
     "retirados os preços dos itens não incluídos: colete R$ 60/saída, regulador R$ 60/saída, roupa R$ 50/saída, máscara R$ 30/saída, nadadeira R$ 30/saída, Nitrox R$ 50/cilindro (valores de 2023). Decidir se esses aluguéis serão vendidos no checkout, cobrados no local ou mostrados com preço atualizado",
     "corrigido 'aula pratica' → 'aula prática', 'um aula' → 'uma aula', 'nível básicos' → 'nível básico', espaço dentro dos parênteses",
     "o texto do original repete a 'aula prática na piscina' do batismo; credenciados fazem mesmo essa aula? Pode ter sido copiado do produto 16",
     "horário de término não informado; duracao_min = null",
     "preço por pessoa: confirmar se o valor é por mergulhador"])

T["passeio-maragogi-caminho-de-moises"] = passeio(
    par("Um dia na Praia de Barra Grande, em Maragogi, em frente ao Caminho de Moisés.",
        "A saída é de hotéis em Boa Viagem, Piedade ou Pina, em veículo privativo. O horário depende da maré seca no dia do passeio.",
        "Lá, você usa a estrutura do restaurante Caminho da Barra ou do Barramares e tem tempo livre para aproveitar a praia, as bebidas e as refeições. Também dá para fazer um passeio de catamarã ou de lancha até as piscinas naturais de Maragogi."),
    par("Un día en la Praia de Barra Grande, en Maragogi, frente al Camino de Moisés.",
        "La salida es desde hoteles en Boa Viagem, Piedade o Pina, en vehículo privado. El horario depende de la marea baja del día de la excursión.",
        "Allá usás la estructura del restaurante Caminho da Barra o Barramares y tenés tiempo libre para disfrutar la playa, las bebidas y las comidas. También podés hacer un paseo en catamarán o en lancha hasta las piscinas naturales de Maragogi."),
    par("A day at Barra Grande Beach in Maragogi, right by the Path of Moses (Caminho de Moisés).",
        "Pickup is at hotels in Boa Viagem, Piedade or Pina, in a private vehicle. The departure time depends on low tide on the day of the trip.",
        "There you use the facilities of Caminho da Barra or Barramares restaurant and have free time to enjoy the beach, drinks and meals. You can also take a catamaran or speedboat ride to the natural pools of Maragogi."),
    P_INC_VEIC,
    lista(["Ingressos", "Bebidas", "Alimentação"], ["Entradas", "Bebidas", "Comidas"], ["Tickets", "Drinks", "Food"]),
    None,
    [N_SUPERA,
     "corrigido 'Hoteís' → 'hotéis', 'catamara' → 'catamarã', 'aonde' → 'onde', 'infra estrutura' → 'estrutura', espaço antes de vírgula",
     "o passeio de catamarã ou lancha até as piscinas naturais está incluído ou é pago à parte (seria um dos 'ingressos' não incluídos)? Confirmar",
     "horário de retorno não informado; duracao_min = null"])

T["city-tour-recife-catamara"] = passeio(
    par("Um passeio imperdível em Pernambuco: o centro histórico do Recife por terra e pelo rio, de catamarã.",
        "**Roteiro**\n- Saída do seu hotel por volta das 8h, rumo ao Recife Antigo.\n- Vista de pontos turísticos como o Parque das Esculturas, a Assembleia Legislativa, o Teatro de Santa Isabel e o casario da Rua da Aurora.\n- Paradas na Casa da Cultura, na Capela Dourada, na Rua do Bom Jesus e na Praça do Marco Zero, onde embarcamos no catamarã.\n- A bordo, um guia conta histórias e curiosidades do Recife, passando pelo Rio Capibaribe e suas pontes.\n- Opção de almoçar no restaurante do catamarã, com vista para a Bacia do Pina.\n- Retorno ao hotel por volta das 14h."),
    par("Una excursión imperdible en Pernambuco: el centro histórico de Recife por tierra y por el río, en catamarán.",
        "**Recorrido**\n- Salida de tu hotel alrededor de las 8, rumbo a Recife Antiguo.\n- Vista de puntos turísticos como el Parque de las Esculturas, la Asamblea Legislativa, el Teatro de Santa Isabel y las casonas de la Rua da Aurora.\n- Paradas en la Casa da Cultura, la Capilla Dorada, la Rua do Bom Jesus y la Praça do Marco Zero, donde subimos al catamarán.\n- A bordo, un guía cuenta historias y curiosidades de Recife, por el río Capibaribe y sus puentes.\n- Opción de almorzar en el restaurante del catamarán, con vista a la Bacia do Pina.\n- Regreso al hotel alrededor de las 14."),
    par("A must-do tour in Pernambuco: Recife's historic center by land and by river, on a catamaran.",
        "**Itinerary**\n- Pickup at your hotel around 8 am, heading to Old Recife.\n- Views of sights such as the Sculpture Park, the State Legislative Assembly, Santa Isabel Theater and the old houses of Rua da Aurora.\n- Stops at Casa da Cultura, the Golden Chapel, Rua do Bom Jesus and Marco Zero Square, where we board the catamaran.\n- On board, a guide shares stories and fun facts about Recife as you sail the Capibaribe River and its bridges.\n- Option to have lunch at the catamaran's restaurant, overlooking the Pina basin.\n- Back at the hotel around 2 pm."),
    lista(["Veículo privativo", "Motorista-guia", "Ingresso do catamarã"],
          ["Vehículo privado", "Chofer-guía", "Entrada del catamarán"],
          ["Private vehicle", "Driver-guide", "Catamaran ticket"]),
    P_NAO_PADRAO, 360,
    [N_SUPERA,
     "corrigido 'ímperdível' → 'imperdível', 'Capeberibe' → 'Capibaribe', 'sua pontes' → 'suas pontes', 'aonde' → 'onde', 'À bordo' → 'A bordo'",
     "a seção 'O que está incluso' do original listava só 'ingresso catamara', mas o 'Sobre a atividade' diz 'veículo privativo, motorista/guia e ingresso do catamarã'; usada a lista mais completa",
     "'motorista/ guia' entendido como motorista que também é guia (motorista-guia). Confirmar",
     "duracao_min = 360: calculado da saída (~8h) ao retorno (~14h)"])


# ---------------------------------------------------------------------------
# Aplicação
# ---------------------------------------------------------------------------
def validar(slug, t):
    for campo in ("descricao", "inclusos", "nao_inclusos"):
        assert set(t[campo]) == set(LINGUAS), (slug, campo)
    for campo in ("inclusos", "nao_inclusos"):
        n = {len(t[campo][l]) for l in LINGUAS}
        assert len(n) == 1, (slug, campo, n)
    assert t["duracao_min"] is None or isinstance(t["duracao_min"], int), slug
    for l in LINGUAS:
        texto = t["descricao"][l]
        for proibido in ("R$", "2023", "2024", "por pessoa", "por persona", "per person"):
            assert proibido not in texto, (slug, l, proibido)


def main():
    produtos = json.loads(ARQ.read_text(encoding="utf-8"))
    slugs = {p["slug"] for p in produtos}
    faltando = slugs - set(T)
    sobrando = set(T) - slugs
    assert not faltando and not sobrando, (faltando, sobrando)

    for p in produtos:
        t = T[p["slug"]]
        validar(p["slug"], t)
        p["descricao"] = t["descricao"]
        p["inclusos"] = t["inclusos"]
        p["nao_inclusos"] = t["nao_inclusos"]
        p["duracao_min"] = t["duracao_min"]
        p["descricao_completa"] = True
        notas = [n for n in p.get("notas_revisao", []) if not n.startswith(NOTA_PREFIXO)]
        novas = t["notas"] if N_SUPERA in t["notas"] else [N_SUPERA] + t["notas"]
        notas += [NOTA_PREFIXO + n for n in novas]
        p["notas_revisao"] = notas

    ARQ.write_text(json.dumps(produtos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(produtos)} produtos atualizados em {ARQ}")


if __name__ == "__main__":
    main()
