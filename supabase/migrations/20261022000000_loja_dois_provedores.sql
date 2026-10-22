-- Loja própria: dois provedores de pagamento (plano §4.7 item 3 e decisão 31: cartão na Stripe, Pix na Woovi;
-- detalhes em docs/loja/PLANO_PAGAMENTO_RESERVA_PWA_APP.md, etapa B1).
--
-- 1. gateway_eventos passa a identificar o provedor: os ids de evento da Stripe e da Woovi são independentes
--    e podem coincidir, então a duplicata é reconhecida pelo par (gateway, evento_id), não só pelo evento_id.
-- 2. Um pedido só pode estar pago (ou reembolsado) se souber quem o cobrou (pedidos.gateway), porque o
--    reembolso e a consulta voltam sempre a esse mesmo provedor.
--
-- Só tabelas da loja (vazias em produção); nada do PWA nem do app é tocado.

ALTER TABLE public.gateway_eventos ADD COLUMN IF NOT EXISTS gateway TEXT;
-- Único adaptador que existia antes desta migration; não há linhas em produção, é só por segurança.
UPDATE public.gateway_eventos SET gateway = 'mercadopago' WHERE gateway IS NULL;
ALTER TABLE public.gateway_eventos ALTER COLUMN gateway SET NOT NULL;

ALTER TABLE public.gateway_eventos DROP CONSTRAINT gateway_eventos_pkey;
ALTER TABLE public.gateway_eventos ADD CONSTRAINT gateway_eventos_pkey PRIMARY KEY (gateway, evento_id);

COMMENT ON COLUMN public.gateway_eventos.gateway IS
  'Provedor que mandou o aviso (simulado, mercadopago, stripe, woovi). Chave junto com evento_id.';

ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_pago_exige_gateway
  CHECK (status NOT IN ('pago', 'reembolsado') OR gateway IS NOT NULL);

COMMENT ON CONSTRAINT pedidos_pago_exige_gateway ON public.pedidos IS
  'Pedido pago ou reembolsado precisa saber quem o cobrou: reembolso e consulta usam esse provedor.';
