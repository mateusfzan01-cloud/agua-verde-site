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

-- 3. confirmar_pedido só aceita evento aprovado DO PROVEDOR QUE COBROU o pedido (pedidos.gateway).
--    Sem isto, um aviso de um provedor (por exemplo, o simulado) poderia pagar um pedido do outro.
--    Mesmo corpo da versão de 20261017200000; só o predicado do evento ganha `gateway = v_pedido.gateway`.
CREATE OR REPLACE FUNCTION public.confirmar_pedido(p_pedido_id UUID, p_gateway_ref TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pedido public.pedidos%ROWTYPE;
  v_item public.pedido_itens%ROWTYPE;
  v_viagem_id INT;
  v_fornecedor_id UUID;
  v_pernas INT;
  v_valor_perna NUMERIC(10, 2);
  v_resto NUMERIC(10, 2);
  v_obs TEXT;
BEGIN
  SELECT * INTO v_pedido FROM public.pedidos WHERE id = p_pedido_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'pedido_inexistente');
  END IF;

  IF v_pedido.status = 'pago' THEN
    RETURN jsonb_build_object('ok', true, 'ja_confirmado', true);
  END IF;

  -- Só evento aprovado do mesmo provedor do pedido (pedido sem provedor não tem evento que sirva).
  IF v_pedido.gateway IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.gateway_eventos
    WHERE gateway = v_pedido.gateway AND gateway_ref = p_gateway_ref AND pedido_id = p_pedido_id AND status = 'aprovado'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'sem_evento_aprovado');
  END IF;

  IF v_pedido.status NOT IN ('pendente_pagamento', 'expirado') THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'pedido_nao_pendente');
  END IF;

  UPDATE public.pedidos
     SET status = 'pago', pago_em = now(), gateway_ref = p_gateway_ref, gateway_status = 'aprovado'
   WHERE id = p_pedido_id;

  SELECT id INTO v_fornecedor_id FROM public.fornecedores WHERE nome ILIKE 'agua verde%' ORDER BY id LIMIT 1;

  SELECT count(*) INTO v_pernas FROM public.pedido_itens WHERE pedido_id = p_pedido_id;
  v_valor_perna := round(v_pedido.valor_total / GREATEST(v_pernas, 1), 2);
  v_resto := v_pedido.valor_total - v_valor_perna * GREATEST(v_pernas, 1);

  FOR v_item IN SELECT * FROM public.pedido_itens WHERE pedido_id = p_pedido_id ORDER BY ordem LOOP
    v_obs := concat_ws(' | ',
      'Pedido ' || v_pedido.numero || ' (loja do site)',
      CASE WHEN v_item.hora IS NULL THEN 'Horário a combinar com o cliente' END,
      CASE WHEN v_item.endereco IS NOT NULL THEN 'Endereço: ' || v_item.endereco END,
      CASE WHEN v_item.voo_numero IS NOT NULL THEN 'Voo: ' || concat_ws(' ', v_item.voo_companhia, v_item.voo_numero) END,
      v_pedido.observacoes
    );

    INSERT INTO public.viagens (
      passageiro_nome, passageiro_telefone, passageiro_email,
      origem, destino, data_hora, status, valor, moeda, numero_reserva, observacoes, fornecedor_id
    ) VALUES (
      v_pedido.passageiro_nome, v_pedido.passageiro_telefone, v_pedido.passageiro_email,
      v_item.origem, v_item.destino,
      ((v_item.data + COALESCE(v_item.hora, TIME '08:00')) AT TIME ZONE 'America/Recife'),
      'pendente',
      v_valor_perna + CASE WHEN v_item.ordem = 1 THEN v_resto ELSE 0 END,
      'BRL', v_pedido.numero, v_obs, v_fornecedor_id
    ) RETURNING id INTO v_viagem_id;

    UPDATE public.pedido_itens SET viagem_id = v_viagem_id WHERE id = v_item.id;
  END LOOP;

  INSERT INTO public.pedido_eventos (pedido_id, tipo, detalhes)
  VALUES (p_pedido_id, 'pago', jsonb_build_object('gateway_ref', p_gateway_ref, 'viagens', v_pernas, 'estava_expirado', v_pedido.status = 'expirado'));

  RETURN jsonb_build_object('ok', true, 'ja_confirmado', false);
END;
$$;

REVOKE ALL ON FUNCTION public.confirmar_pedido(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirmar_pedido(UUID, TEXT) TO service_role;
