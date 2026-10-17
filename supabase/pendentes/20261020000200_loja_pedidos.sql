-- Loja própria, parte 2: pedidos (a transação comercial) e auditoria do gateway.
-- NÃO APLICADA. Ver LEIA-ME.md desta pasta.
-- A viagem (operação) continua sendo a tabela `viagens`; aqui fica só o lado comercial.

CREATE SEQUENCE IF NOT EXISTS public.pedidos_numero_seq;

-- ============================================================
-- 1. Pedidos
--    pendente_pagamento -> pago -> (cancelado ->) reembolsado ; ou expirado.
--    Passeio também é "pago" na hora (vaga garantida, decisão 36).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Só para humanos (e-mail, atendimento): AV-2026-000123
  numero TEXT NOT NULL UNIQUE
    DEFAULT ('AV-' || to_char(now() AT TIME ZONE 'America/Recife', 'YYYY') || '-' || lpad(nextval('public.pedidos_numero_seq')::text, 6, '0')),
  -- Segredo que dá acesso à página da reserva (64 caracteres, sem relação com o número)
  token_acesso TEXT NOT NULL UNIQUE
    DEFAULT (replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')),
  produto_id UUID REFERENCES public.produtos (id),
  produto_slug TEXT NOT NULL,                                  -- cópia: o pedido não muda se o produto mudar
  tipo TEXT NOT NULL CHECK (tipo IN ('transfer', 'passeio')),
  idioma TEXT NOT NULL CHECK (idioma IN ('pt', 'es', 'en')),
  moeda TEXT NOT NULL DEFAULT 'BRL' CHECK (moeda = 'BRL'),     -- cobrança só em reais (decisão 24)
  selecao JSONB NOT NULL,                                      -- {"veiculos":{"sedan_economico":2}} ou {"pessoas":3}
  linhas JSONB NOT NULL,                                       -- cópia do cálculo: tipo, quantidade, preço unitário, subtotal
  valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total > 0),
  passageiro_nome TEXT NOT NULL,
  passageiro_telefone TEXT NOT NULL,                           -- E.164
  passageiro_email TEXT NOT NULL,
  passageiro_cpf TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente_pagamento'
    CHECK (status IN ('pendente_pagamento', 'pago', 'cancelado', 'reembolsado', 'expirado')),
  gateway TEXT,
  gateway_ref TEXT,
  gateway_status TEXT,
  gateway_payload JSONB,                                       -- resposta da cobrança (ex.: Pix copia e cola em {"pix": "..."})
  meio TEXT CHECK (meio IS NULL OR meio IN ('pix', 'cartao')),
  consent_lgpd_em TIMESTAMPTZ NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_origem INET,
  user_agent TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_em TIMESTAMPTZ NOT NULL,
  pago_em TIMESTAMPTZ,
  cancelado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pedidos_status_expira ON public.pedidos (status, expira_em);
CREATE INDEX IF NOT EXISTS idx_pedidos_email ON public.pedidos (lower(passageiro_email));
CREATE UNIQUE INDEX IF NOT EXISTS uq_pedidos_gateway_ref ON public.pedidos (gateway_ref) WHERE gateway_ref IS NOT NULL;

-- ============================================================
-- 2. Pernas do pedido (ida, volta). Cada perna vira uma viagem depois do pagamento.
--    Passeio: hora fica nula (horário combinado depois da reserva).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos (id) ON DELETE CASCADE,
  ordem INT NOT NULL CHECK (ordem > 0),
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME,
  endereco TEXT,
  voo_numero TEXT,
  voo_companhia TEXT,
  viagem_id INT REFERENCES public.viagens (id),
  UNIQUE (pedido_id, ordem)
);

CREATE INDEX IF NOT EXISTS idx_pedido_itens_viagem ON public.pedido_itens (viagem_id) WHERE viagem_id IS NOT NULL;

-- ============================================================
-- 3. Auditoria do pedido
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pedido_eventos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES public.pedidos (id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,                      -- criado, cobranca_criada, pago, reembolsado, expirado...
  detalhes JSONB,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pedido_eventos_pedido ON public.pedido_eventos (pedido_id, criado_em);

-- ============================================================
-- 4. Eventos do gateway (idempotência: duplicata falha no banco, nunca é reprocessada)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gateway_eventos (
  evento_id TEXT PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos (id),
  gateway_ref TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovado', 'recusado', 'cancelado', 'reembolsado')),
  payload JSONB,
  recebido_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gateway_eventos_ref ON public.gateway_eventos (gateway_ref, status);

-- ============================================================
-- 5. RLS: nenhum acesso anônimo. O checkout roda no servidor com a chave de serviço
--    (que ignora RLS). Admin/gerente leem no PWA; ninguém altera pelo cliente.
-- ============================================================
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateway_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pedidos_leitura_admin" ON public.pedidos FOR SELECT TO authenticated USING (public.is_admin_or_gerente());
CREATE POLICY "pedido_itens_leitura_admin" ON public.pedido_itens FOR SELECT TO authenticated USING (public.is_admin_or_gerente());
CREATE POLICY "pedido_eventos_leitura_admin" ON public.pedido_eventos FOR SELECT TO authenticated USING (public.is_admin_or_gerente());
CREATE POLICY "gateway_eventos_leitura_admin" ON public.gateway_eventos FOR SELECT TO authenticated USING (public.is_admin_or_gerente());

REVOKE ALL ON public.pedidos, public.pedido_itens, public.pedido_eventos, public.gateway_eventos FROM anon;
