-- Migration: cria tabela orcamentos_site + RLS + trigger de notificacao
-- Objetivo: capturar leads do site institucional e notificar admin por e-mail
-- Padrao seguido: replica o trigger fn_whatsapp_notify_email do PWA (pg_net + vault secrets)

-- ============================================================
-- 1. Tabela orcamentos_site
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orcamentos_site (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passageiro_nome TEXT NOT NULL,
  passageiro_telefone TEXT,
  passageiro_email TEXT,
  origem TEXT,
  destino TEXT,
  data_hora TIMESTAMPTZ,
  quantidade_passageiros INT NOT NULL DEFAULT 1,
  quantidade_bagagens INT NOT NULL DEFAULT 0,
  numero_voo TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  viagem_id INT REFERENCES public.viagens(id),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_origem INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_status
  ON public.orcamentos_site(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_created_at
  ON public.orcamentos_site(created_at DESC);

-- ============================================================
-- 2. RLS — INSERT anonimo (site sem auth); leitura/escrita só admin/gerente
-- ============================================================
ALTER TABLE public.orcamentos_site ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orcamentos_site_insert_anon"
  ON public.orcamentos_site FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "orcamentos_site_select_admin"
  ON public.orcamentos_site FOR SELECT
  TO authenticated USING (public.is_admin_or_gerente());

CREATE POLICY "orcamentos_site_update_admin"
  ON public.orcamentos_site FOR UPDATE
  TO authenticated USING (public.is_admin_or_gerente())
  WITH CHECK (public.is_admin_or_gerente());

CREATE POLICY "orcamentos_site_delete_admin"
  ON public.orcamentos_site FOR DELETE
  TO authenticated USING (public.is_admin_or_gerente());

-- ============================================================
-- 3. Trigger — dispara Edge Function notificar-orcamento via pg_net
--    Padrao: fn_whatsapp_notify_email (sprint3 hardening)
--    Le secrets do vault.decrypted_secrets (project_url, service_role_key)
--    com fallback para current_setting('app.settings.*')
--    NUNCA falha o INSERT do orçamento (EXCEPTION -> RAISE WARNING)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_notificar_orcamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_url TEXT;
  v_service_key TEXT;
BEGIN
  IF NEW.status <> 'novo' THEN
    RETURN NEW;
  END IF;

  BEGIN
    SELECT decrypted_secret INTO v_project_url
      FROM vault.decrypted_secrets WHERE name = 'project_url';
    SELECT decrypted_secret INTO v_service_key
      FROM vault.decrypted_secrets WHERE name = 'service_role_key';
  EXCEPTION WHEN OTHERS THEN
    v_project_url := NULL;
    v_service_key := NULL;
  END;

  IF v_project_url IS NULL THEN
    v_project_url := current_setting('app.settings.project_url', true);
  END IF;
  IF v_service_key IS NULL THEN
    v_service_key := current_setting('app.settings.service_role_key', true);
  END IF;

  IF v_project_url IS NULL OR v_service_key IS NULL THEN
    RAISE WARNING 'notificar_orcamento: secrets nao encontrados, email pulado';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := v_project_url || '/functions/v1/notificar-orcamento',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := jsonb_build_object(
      'orcamento_id', NEW.id,
      'passageiro_nome', NEW.passageiro_nome,
      'passageiro_telefone', NEW.passageiro_telefone,
      'passageiro_email', NEW.passageiro_email,
      'origem', NEW.origem,
      'destino', NEW.destino,
      'data_hora', NEW.data_hora,
      'quantidade_passageiros', NEW.quantidade_passageiros,
      'quantidade_bagagens', NEW.quantidade_bagagens,
      'numero_voo', NEW.numero_voo,
      'observacoes', NEW.observacoes
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notificar_orcamento: erro - %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fn_notificar_orcamento() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_notificar_orcamento ON public.orcamentos_site;
CREATE TRIGGER trg_notificar_orcamento
  AFTER INSERT ON public.orcamentos_site
  FOR EACH ROW EXECUTE FUNCTION public.fn_notificar_orcamento();
