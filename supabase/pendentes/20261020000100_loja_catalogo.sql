-- Loja própria, parte 1: catálogo, tipos de veículo, alta temporada e cotações.
-- NÃO APLICADA. Ver LEIA-ME.md desta pasta.
-- Não altera nenhuma tabela existente.

-- ============================================================
-- 1. Tipos de veículo (iguais em todos os produtos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tipos_veiculo (
  chave TEXT PRIMARY KEY,                       -- sedan_economico, spin, mini_van...
  nome JSONB NOT NULL,                          -- {"pt":..., "es":..., "en":...}
  capacidade JSONB NOT NULL,                    -- idem, texto de pessoas e malas
  pax_max INT NOT NULL CHECK (pax_max > 0)
);

-- ============================================================
-- 2. Produtos (46 vindos da Paytour; 2 inativos)
--    Preço POR VEÍCULO (decisão do dono: copiar a Paytour). Só mergulho, catamarã de
--    Noronha e Trilha dos Escravos são por pessoa.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  slug_paytour TEXT UNIQUE,                     -- para o redirect 301 de /passeio/<slug>
  tipo TEXT NOT NULL CHECK (tipo IN ('transfer', 'passeio')),
  nome JSONB NOT NULL,
  descricao JSONB NOT NULL,                     -- markdown simples, por idioma
  inclusos JSONB NOT NULL DEFAULT '{}'::jsonb,  -- {"pt":[...], "es":[...], "en":[...]}
  nao_inclusos JSONB NOT NULL DEFAULT '{}'::jsonb,
  origem_padrao TEXT NOT NULL,
  destino_padrao TEXT NOT NULL,
  sentido TEXT NOT NULL DEFAULT 'n/a' CHECK (sentido IN ('ida', 'volta', 'ida_volta', 'n/a')),
  modelo_preco TEXT NOT NULL DEFAULT 'por_veiculo' CHECK (modelo_preco IN ('por_veiculo', 'por_pessoa')),
  preco_por_pessoa NUMERIC(10, 2) CHECK (preco_por_pessoa IS NULL OR preco_por_pessoa > 0),
  veiculos JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{"tipo":"sedan_economico","preco":740.00}, ...]
  max_por_compra INT NOT NULL DEFAULT 10 CHECK (max_por_compra > 0),   -- decisão 32
  duracao_min INT,
  imagens TEXT[] NOT NULL DEFAULT '{}',
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  ordem INT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT produtos_preco_coerente CHECK (
    (modelo_preco = 'por_pessoa' AND preco_por_pessoa IS NOT NULL)
    OR (modelo_preco = 'por_veiculo' AND jsonb_typeof(veiculos) = 'array' AND jsonb_array_length(veiculos) > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_produtos_tipo_ordem ON public.produtos (tipo, ordem) WHERE ativo;

-- ============================================================
-- 3. Alta temporada (define o prazo de cancelamento dos passeios: 48 h normal, 24 h em alta)
--    Começa vazia: as datas ainda serão definidas pelo dono.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alta_temporada (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  inicio DATE NOT NULL,
  fim DATE NOT NULL,
  descricao TEXT,
  CONSTRAINT alta_temporada_periodo CHECK (fim >= inicio)
);

-- ============================================================
-- 4. Cotações (só para o valor aproximado em outras moedas; a cobrança é sempre em BRL)
--    Uma rotina diária grava a cotação de uma fonte oficial; o site lê daqui.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cotacoes (
  moeda TEXT NOT NULL CHECK (moeda ~ '^[A-Z]{3}$'),
  data DATE NOT NULL,
  reais_por_unidade NUMERIC(18, 8) NOT NULL CHECK (reais_por_unidade > 0),
  fonte TEXT NOT NULL,
  PRIMARY KEY (moeda, data)
);

-- ============================================================
-- 5. RLS: leitura pública do catálogo; escrita só admin/gerente (service role ignora RLS)
-- ============================================================
ALTER TABLE public.tipos_veiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alta_temporada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tipos_veiculo_leitura_publica" ON public.tipos_veiculo FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "produtos_leitura_publica" ON public.produtos FOR SELECT TO anon, authenticated USING (ativo);
CREATE POLICY "alta_temporada_leitura_publica" ON public.alta_temporada FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cotacoes_leitura_publica" ON public.cotacoes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "tipos_veiculo_escrita_admin" ON public.tipos_veiculo FOR ALL TO authenticated
  USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE POLICY "produtos_escrita_admin" ON public.produtos FOR ALL TO authenticated
  USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE POLICY "alta_temporada_escrita_admin" ON public.alta_temporada FOR ALL TO authenticated
  USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());
CREATE POLICY "cotacoes_escrita_admin" ON public.cotacoes FOR ALL TO authenticated
  USING (public.is_admin_or_gerente()) WITH CHECK (public.is_admin_or_gerente());

-- Admin/gerente também lê os produtos inativos (a política pública só mostra os ativos).
CREATE POLICY "produtos_leitura_admin" ON public.produtos FOR SELECT TO authenticated
  USING (public.is_admin_or_gerente());
