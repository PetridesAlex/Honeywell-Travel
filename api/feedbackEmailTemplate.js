/**
 * Branded email template for corporate travel feedback submissions.
 */

const BRAND = {
  red: '#c41230',
  charcoal: '#1c1c1e',
  cream: '#faf8f6',
  greyMuted: '#71717a',
}

const LOGO_URL = 'https://www.honeywelltravel.com.cy/images/icons/honeywell-travel-logo.webp'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fieldRow(label, value) {
  if (value == null || String(value).trim() === '') return ''
  return `
    <tr>
      <td style="padding:0 0 10px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.cream};border:1px solid #f0ebe8;border-radius:10px;">
          <tr>
            <td style="padding:14px 18px;">
              <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.greyMuted};">${escapeHtml(label)}</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:${BRAND.charcoal};white-space:pre-wrap;">${escapeHtml(value)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

export function buildFeedbackEmailContent(payload) {
  const {
    companyName,
    tripName,
    destination,
    travelDates,
    travelerName,
    travelerEmail,
    overallScore,
    npsScore,
    answerRows = [],
  } = payload

  const subject = `Corporate Travel Feedback — ${companyName || 'Trip'} (${travelerName || 'Traveler'})`

  const textLines = [
    'New Corporate Travel Feedback',
    '',
    `Company: ${companyName || '—'}`,
    `Trip: ${tripName || '—'}`,
    `Destination: ${destination || '—'}`,
    `Travel dates: ${travelDates || '—'}`,
    `Traveler: ${travelerName || '—'}`,
    travelerEmail ? `Email: ${travelerEmail}` : null,
    overallScore != null ? `Overall score: ${overallScore}/5` : null,
    npsScore != null ? `NPS: ${npsScore}/10` : null,
    '',
    'Responses:',
    ...answerRows.map((r) => `${r.label}: ${r.value}`),
  ].filter(Boolean)

  const answerHtml = answerRows
    .map((r) => fieldRow(r.label, r.value))
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ececef;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ececef;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.red} 0%,#8f0e24 100%);padding:28px 32px;text-align:center;">
              <img src="${LOGO_URL}" alt="Honeywell Travel" width="160" style="display:block;margin:0 auto 12px;max-width:160px;height:auto;" />
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#fff;letter-spacing:0.02em;">Corporate Travel Feedback</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.charcoal};">A corporate traveler has submitted post-trip feedback.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${fieldRow('Company', companyName)}
                ${fieldRow('Trip', tripName)}
                ${fieldRow('Destination', destination)}
                ${fieldRow('Travel dates', travelDates)}
                ${fieldRow('Traveler name', travelerName)}
                ${fieldRow('Traveler email', travelerEmail)}
                ${fieldRow('Overall satisfaction', overallScore != null ? `${overallScore} / 5` : '')}
                ${fieldRow('NPS score', npsScore != null ? `${npsScore} / 10` : '')}
              </table>
              ${answerRows.length ? `<h2 style="margin:24px 0 14px;font-family:Georgia,serif;font-size:17px;color:${BRAND.charcoal};">Detailed responses</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${answerHtml}</table>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, text: textLines.join('\n'), html }
}
