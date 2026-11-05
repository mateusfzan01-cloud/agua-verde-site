-- Loja própria, parte 4 (Prompt C): número do pedido pela função, reembolso que cancela as viagens
-- e pagamento aprovado depois do prazo (o cliente pagou: honramos; nenhuma vaga é segurada antes do pagamento).

-- 1. Número do pedido (AV-AAAA-NNNNNN), igual ao padrão da tabela, para o servidor saber o número antes de salvar.
CREATE OR REPLACE FUNCTION public.proximo_numero_pedido()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'AV-' || to_char(now() AT TIME ZONE 'America/Recife', 'YYYY') || '-' || lpad(nextval('public.pedidos_numero_seq')::text, 6, '0');
$$;

REVOKE ALL ON FUNCTION public.proximo_numero_pedido() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.proximo_numero_pedido() TO service_role;

-- 2. confirmar_pedido: aceita pedido pendente OU expirado (pagamento que caiu depois do prazo).
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

  IF NOT EXISTS (
    SELECT 1 FROM public.gateway_eventos
    WHERE gateway_ref = p_gateway_ref AND pedido_id = p_pedido_id AND status = 'aprovado'
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

-- 3. Reembolso: marca o pedido como reembolsado e cancela as viagens que ainda não começaram
--    (pendente ou vinculada). Viagem já em andamento não é tocada: a política de cancelamento já barra esse caso.
CREATE OR REPLACE FUNCTION public.reembolsar_pedido(p_pedido_id UUID, p_motivo TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_canceladas INT;
BEGIN
  SELECT status INTO v_status FROM public.pedidos WHERE id = p_pedido_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'pedido_inexistente');
  END IF;
  IF v_status = 'reembolsado' THEN
    RETURN jsonb_build_object('ok', true, 'ja_reembolsado', true);
  END IF;
  IF v_status <> 'pago' THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'nao_esta_pago');
  END IF;

  UPDATE public.pedidos
     SET status = 'reembolsado', cancelado_em = now(), gateway_status = 'reembolsado'
   WHERE id = p_pedido_id;

  WITH canceladas AS (
    UPDATE public.viagens v
       SET status = 'cancelada'
      FROM public.pedido_itens i
     WHERE i.pedido_id = p_pedido_id AND i.viagem_id = v.id AND v.status IN ('pendente', 'vinculada')
    RETURNING v.id
  )
  SELECT count(*) INTO v_canceladas FROM canceladas;

  INSERT INTO public.pedido_eventos (pedido_id, tipo, detalhes)
  VALUES (p_pedido_id, 'reembolsado', jsonb_build_object('motivo', p_motivo, 'viagens_canceladas', v_canceladas));

  RETURN jsonb_build_object('ok', true, 'ja_reembolsado', false, 'viagens_canceladas', v_canceladas);
END;
$$;

REVOKE ALL ON FUNCTION public.reembolsar_pedido(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reembolsar_pedido(UUID, TEXT) TO service_role;
