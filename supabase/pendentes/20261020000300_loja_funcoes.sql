-- Loja própria, parte 3: funções do banco.
-- NÃO APLICADA. Ver LEIA-ME.md desta pasta.

-- ============================================================
-- 1. confirmar_pedido: a ÚNICA porta de confirmação (plano §4.7, item 4)
--    Só confirma se existir evento APROVADO gravado em gateway_eventos para aquele
--    gateway_ref e aquele pedido. Marca pago, cria uma viagem por perna e grava os ids.
--    Repetir a chamada não cria viagem em dobro.
--
--    [CONFERIR antes de aplicar]
--    a) colunas obrigatórias de public.viagens e gatilhos dela (o PWA insere os mesmos campos);
--    b) o fornecedor "Agua Verde" (abaixo, procurado por nome; ajustar para o id real);
--    c) se o gatilho de avisos (push no app, alertas) dispara em INSERT com status 'pendente';
--    d) se `viagens.token_cliente` nasce sozinho no INSERT (valor padrão do banco). A página da reserva usa esse
--       token para o botão "Acompanhar minha viagem" (reserva_por_token devolve `viagem_token` de cada perna).
-- ============================================================
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
  v_fornecedor_id INT;
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

  IF v_pedido.status <> 'pendente_pagamento' THEN
    RETURN jsonb_build_object('ok', false, 'motivo', 'pedido_nao_pendente');
  END IF;

  UPDATE public.pedidos
     SET status = 'pago', pago_em = now(), gateway_ref = p_gateway_ref, gateway_status = 'aprovado'
   WHERE id = p_pedido_id;

  -- [CONFERIR] id do fornecedor "Agua Verde" em public.fornecedores
  SELECT id INTO v_fornecedor_id FROM public.fornecedores WHERE nome ILIKE 'agua verde%' ORDER BY id LIMIT 1;

  SELECT count(*) INTO v_pernas FROM public.pedido_itens WHERE pedido_id = p_pedido_id;
  v_valor_perna := round(v_pedido.valor_total / GREATEST(v_pernas, 1), 2);
  v_resto := v_pedido.valor_total - v_valor_perna * GREATEST(v_pernas, 1);   -- centavos que sobram vão na 1ª perna

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
  VALUES (p_pedido_id, 'pago', jsonb_build_object('gateway_ref', p_gateway_ref, 'viagens', v_pernas));

  RETURN jsonb_build_object('ok', true, 'ja_confirmado', false);
END;
$$;

REVOKE ALL ON FUNCTION public.confirmar_pedido(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirmar_pedido(UUID, TEXT) TO service_role;

-- ============================================================
-- 2. reserva_por_token: a página /reserva/[token] lê só o necessário, pelo segredo
--    (a tabela pedidos não tem acesso anônimo).
-- ============================================================
CREATE OR REPLACE FUNCTION public.reserva_por_token(p_token TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'numero', p.numero,
    'status', p.status,
    'produto_slug', p.produto_slug,
    'tipo', p.tipo,
    'idioma', p.idioma,
    'valor_total', p.valor_total,
    'linhas', p.linhas,
    'passageiro_nome', p.passageiro_nome,
    'passageiro_telefone', p.passageiro_telefone,
    'passageiro_email', p.passageiro_email,
    'pago_em', p.pago_em,
    'expira_em', p.expira_em,
    'itens', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('ordem', i.ordem, 'origem', i.origem, 'destino', i.destino, 'data', i.data, 'hora', i.hora,
                                          'viagem_token', v.token_cliente) ORDER BY i.ordem)
      FROM public.pedido_itens i
      LEFT JOIN public.viagens v ON v.id = i.viagem_id
      WHERE i.pedido_id = p.id
    ), '[]'::jsonb)
  )
  FROM public.pedidos p
  WHERE p.token_acesso = p_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.reserva_por_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserva_por_token(TEXT) TO anon, authenticated, service_role;

-- ============================================================
-- 3. expirar_pedidos_pendentes: roda a cada 15 min; expira pedidos pendentes com mais de
--    45 min e não segura vaga nenhuma (nenhuma vaga é reservada antes do pagamento).
-- ============================================================
CREATE OR REPLACE FUNCTION public.expirar_pedidos_pendentes()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_qtd INT;
BEGIN
  WITH expirados AS (
    UPDATE public.pedidos
       SET status = 'expirado'
     WHERE status = 'pendente_pagamento' AND expira_em < now() - interval '15 minutes'
    RETURNING id
  )
  INSERT INTO public.pedido_eventos (pedido_id, tipo)
  SELECT id, 'expirado' FROM expirados;
  GET DIAGNOSTICS v_qtd = ROW_COUNT;
  RETURN v_qtd;
END;
$$;

REVOKE ALL ON FUNCTION public.expirar_pedidos_pendentes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expirar_pedidos_pendentes() TO service_role;

-- Agendamento (pg_cron). Habilitar só quando a loja for lançada:
-- SELECT cron.schedule('loja-expirar-pedidos', '*/15 * * * *', $$SELECT public.expirar_pedidos_pendentes()$$);
