-- Defesa em dobro: além do RLS, tira as permissões de escrita que o Supabase entrega por padrão.
-- Pedidos: ninguém escreve pelo cliente (o servidor usa a chave de serviço); admin/gerente só leem.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.pedidos, public.pedido_itens, public.pedido_eventos, public.gateway_eventos FROM anon, authenticated;
-- Catálogo: o público só lê; a escrita de admin/gerente continua pela política (authenticated).
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.tipos_veiculo, public.produtos, public.alta_temporada, public.cotacoes FROM anon;
REVOKE USAGE, SELECT, UPDATE ON SEQUENCE public.pedidos_numero_seq FROM anon, authenticated;
