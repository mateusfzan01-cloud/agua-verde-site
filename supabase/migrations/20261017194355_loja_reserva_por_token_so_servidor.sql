-- A página da reserva lê pelo servidor (chave de serviço); não precisa de acesso público direto à função.
REVOKE ALL ON FUNCTION public.reserva_por_token(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserva_por_token(TEXT) TO service_role;
