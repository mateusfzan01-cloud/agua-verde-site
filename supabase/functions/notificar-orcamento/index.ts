import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const ALERT_EMAIL_TO = Deno.env.get('ORCAMENTO_ALERT_EMAIL_TO') || 'caio@uluwatour.com'
const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://app.aguaverde.tur.br'

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

function escapeHtml(value: string | null | undefined) {
  return (value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatarDataBR(dataIso: string | null | undefined) {
  if (!dataIso) return '—'
  try {
    return new Date(dataIso).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return escapeHtml(String(dataIso))
  }
}

function soDigitos(s: string | null | undefined) {
  return (s || '').replace(/\D/g, '')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== SUPABASE_SERVICE_ROLE_KEY) {
      return new Response('Forbidden', { status: 403 })
    }

    if (!RESEND_API_KEY) {
      return jsonResponse({ error: 'RESEND_API_KEY ausente' }, 500)
    }

    const payload = await req.json()
    const orcamentoId = payload?.orcamento_id || null
    const nome = String(payload?.passageiro_nome || '').trim()
    const telefone = String(payload?.passageiro_telefone || '').trim()
    const email = String(payload?.passageiro_email || '').trim()
    const origem = String(payload?.origem || '').trim()
    const destino = String(payload?.destino || '').trim()
    const dataHora = payload?.data_hora || null
    const passageiros = payload?.quantidade_passageiros || 1
    const bagagens = payload?.quantidade_bagagens ?? 0
    const numeroVoo = String(payload?.numero_voo || '').trim()
    const observacoes = String(payload?.observacoes || '').trim()

    if (!nome) {
      return jsonResponse({ error: 'passageiro_nome obrigatorio' }, 400)
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const rota = origem || destino
      ? `${escapeHtml(origem || '—')} → ${escapeHtml(destino || '—')}`
      : '—'

    const telefoneLink = soDigitos(telefone)
    const waLink = telefoneLink
      ? `https://wa.me/${telefoneLink}?text=${encodeURIComponent(
          `Olá ${nome}, recebemos seu orçamento${origem || destino ? ` (${origem} → ${destino})` : ''} e vamos responder!`
        )}`
      : ''

    const linhasInfo: Array<{ label: string; valor: string }> = [
      { label: 'Telefone', valor: escapeHtml(telefone || '—') },
      { label: 'E-mail', valor: escapeHtml(email || '—') },
      { label: 'Rota', valor: rota },
      { label: 'Data/hora', valor: formatarDataBR(dataHora) },
      { label: 'Passageiros', valor: String(passageiros) },
      { label: 'Bagagens grandes', valor: String(bagagens) },
      { label: 'Voo', valor: escapeHtml(numeroVoo || '—') },
    ]

    const gridInfo = linhasInfo
      .map(
        (l) => `
        <div style="padding:12px; border:1px solid #e2e8f0; border-radius:10px;">
          <div style="font-size:12px; color:#64748b; text-transform:uppercase; margin-bottom:6px;">${l.label}</div>
          <div style="font-size:14px; font-weight:700; color:#0f172a;">${l.valor}</div>
        </div>`
      )
      .join('')

    const blocoObs = observacoes
      ? `
        <div style="margin-top:16px; padding:12px 14px; border-left:4px solid #1a5c38; background:#f8fafc; border-radius:10px;">
          <div style="font-size:12px; color:#64748b; text-transform:uppercase; margin-bottom:6px; font-weight:700;">Observações</div>
          <div style="font-size:15px; line-height:1.5; color:#0f172a;">${escapeHtml(observacoes)}</div>
        </div>`
      : ''

    const botaoWa = waLink
      ? `<a href="${waLink}" style="display:inline-block; padding:12px 18px; background:#25d366; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:700; margin-right:10px;">Responder no WhatsApp</a>`
      : ''

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <body style="margin:0; padding:24px; background:#f1f5f9; font-family:Arial,sans-serif; color:#0f172a;">
          <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08);">
            <div style="background:#1a5c38; color:#ffffff; padding:20px 24px;">
              <div style="font-size:12px; letter-spacing:0.08em; text-transform:uppercase; opacity:0.85;">Novo orçamento — site institucional</div>
              <h1 style="margin:8px 0 0; font-size:24px;">${escapeHtml(nome)}</h1>
            </div>
            <div style="padding:24px;">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                ${gridInfo}
              </div>

              ${blocoObs}

              <div style="margin-top:24px;">
                ${botaoWa}
                <a href="${APP_BASE_URL}" style="display:inline-block; padding:12px 18px; background:#0f172a; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:700;">Abrir backoffice</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const subject = `[NOVO ORÇAMENTO] ${nome}${origem || destino ? ` — ${origem} → ${destino}` : ''}`

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Agua Verde Turismo <noreply@aguaverde.tur.br>',
        to: [ALERT_EMAIL_TO],
        subject,
        html,
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      await supabase.from('logs_processamento').insert({
        tipo: 'notificar_orcamento',
        dados: {
          orcamento_id: orcamentoId,
          passageiro_nome: nome,
          destinatario: ALERT_EMAIL_TO,
        },
        erro: JSON.stringify(emailResult),
      })

      return jsonResponse({ error: 'Falha ao enviar e-mail' }, 500)
    }

    return jsonResponse({
      success: true,
      destinatario: ALERT_EMAIL_TO,
      email_id: emailResult?.id || null,
      orcamento_id: orcamentoId,
    })
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 500)
  }
})
