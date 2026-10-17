const createNextIntlPlugin = require('next-intl/plugin')
const { redirectsDaPaytour } = require('./config/redirects-paytour')
const produtosDaLoja = require('./docs/loja/conteudo/produtos.json')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return redirectsDaPaytour(produtosDaLoja)
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        // Fotos dos produtos, ainda hospedadas na Paytour. Trocar antes de cancelar a Paytour.
        protocol: 'https',
        hostname: 'cdn.paytour.com.br',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
