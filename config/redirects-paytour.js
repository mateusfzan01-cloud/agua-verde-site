/**
 * Redirects 301 dos endereços antigos da Paytour (/passeio/<slug>) para as páginas novas.
 * Recebe a lista de produtos de docs/loja/conteudo/produtos.json.
 * Produto que saiu do catálogo (ativo = false) manda para a lista da categoria.
 */
function redirectsDaPaytour(produtos) {
  return produtos.map((p) => {
    const pasta = p.tipo === 'transfer' ? 'transfers' : 'passeios'
    return {
      source: `/passeio/${p.slug_paytour}`,
      destination: p.ativo === false ? `/${pasta}` : `/${pasta}/${p.slug}`,
      statusCode: 301,
    }
  })
}

module.exports = { redirectsDaPaytour }
