import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'
import { ehHostDeTestes, lojaHabilitadaParaHost } from '@/lib/loja/ambiente'

const intl = createMiddleware(routing)

/** Caminhos da loja (com ou sem prefixo de idioma). O resto do site fica como está. */
const CAMINHOS_DA_LOJA =
  /^\/(?:(?:pt|es|en)(?:\/.*)?|(?:transfers|passeios|checkout|reserva|minha-reserva)(?:\/.*)?)$/

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get('host')

  let res: NextResponse
  // A home em português ("/") só vira a home da loja onde a loja está habilitada; senão continua a home atual.
  if (pathname === '/' && lojaHabilitadaParaHost(host)) {
    res = intl(req)
  } else if (CAMINHOS_DA_LOJA.test(pathname)) {
    if (!lojaHabilitadaParaHost(host)) {
      // Loja ainda não lançada neste domínio: responde como página inexistente.
      res = NextResponse.rewrite(new URL('/__loja-desabilitada', req.url))
    } else {
      res = intl(req)
    }
  } else {
    res = NextResponse.next()
  }

  if (ehHostDeTestes(host)) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return res
}

export const config = {
  // Tudo, menos API, arquivos internos do Next e arquivos com extensão (imagens, robots.txt...).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
