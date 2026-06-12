/**
 * Honeywell Travel — premium branded HTML + plain-text templates for form notifications.
 * Table-based layout with inline CSS for Gmail, Outlook, and Apple Mail.
 */

const BRAND = {
  red: '#c41230',
  redDeep: '#8f0e24',
  redSoft: '#fdf2f4',
  charcoal: '#1c1c1e',
  charcoalSoft: '#3f3f46',
  gold: '#c9a227',
  cream: '#faf8f6',
  white: '#ffffff',
  greyBg: '#ececef',
  greyLine: '#e4e4e7',
  greyMuted: '#71717a',
  greyLight: '#a1a1aa',
}

const LOGO_URL = 'https://www.honeywelltravel.com.cy/images/icons/honeywell-travel-logo.webp'
const WEBSITE_URL = 'https://www.honeywelltravel.com.cy'
const OFFICE_PHONE = '+357 25828848'
const OFFICE_EMAIL = 'limassol@honeywelltravel.com.cy'

export const SUBJECT_BY_FORM_TYPE = {
  contact: 'New Website Contact Form Submission',
  our_world: 'New Website Contact Form Submission',
  newsletter: 'Newsletter Subscription',
  build_your_trip: 'New Travel Inquiry',
  honeymoon: 'New Travel Inquiry',
  flight_booking: 'New Travel Inquiry',
  cruise: 'New Travel Inquiry',
  dmc: 'New Group Request',
  corporate: 'New Quote Request',
  hotel_quote: 'New Quote Request',
  package: 'New Quote Request',
  gift_voucher: 'New Gift Voucher Request',
}

const FORM_SUBTITLE = {
  contact: 'A visitor has sent a message through your contact page.',
  our_world: 'A new enquiry arrived from the Our World page.',
  newsletter: 'Someone has subscribed to your newsletter.',
  build_your_trip: 'A tailor-made trip request is waiting for your attention.',
  honeymoon: 'A romantic getaway enquiry has been submitted.',
  flight_booking: 'A flight booking request needs your follow-up.',
  cruise: 'A cruise enquiry has been received.',
  dmc: 'A DMC / group travel request is ready for review.',
  corporate: 'A corporate travel quote has been requested.',
  hotel_quote: 'A hotel quote request is waiting for your response.',
  package: 'A package reservation request has been submitted.',
  gift_voucher: 'A customer would like to purchase a gift voucher.',
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatSubmittedAt() {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Asia/Nicosia',
  }).format(new Date())
}

function isPresent(value) {
  return value != null && String(value).trim() !== ''
}

function getInitial(name) {
  const letter = String(name || '?').trim().charAt(0).toUpperCase()
  return escapeHtml(/[A-Z]/i.test(letter) ? letter : '?')
}

function sectionHeading(title) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 14px;">
      <tr>
        <td width="4" style="width:4px;background:${BRAND.red};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding-left:12px;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:400;color:${BRAND.charcoal};letter-spacing:0.01em;">
          ${escapeHtml(title)}
        </td>
      </tr>
    </table>`
}

function buildFieldRows(fields) {
  return fields
    .filter(([, value]) => isPresent(value))
    .map(([label, value]) => {
      const isUrl = label === 'Page URL' && /^https?:\/\//i.test(String(value))
      const cellValue = isUrl
        ? `<a href="${escapeHtml(value)}" style="color:${BRAND.red};text-decoration:none;font-weight:600;word-break:break-all;">View page &rarr;</a>`
        : `<span style="color:${BRAND.charcoal};font-weight:500;">${escapeHtml(value)}</span>`

      return `
        <tr>
          <td style="padding:0 0 10px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.cream};border:1px solid #f0ebe8;border-radius:10px;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.greyMuted};">
                    ${escapeHtml(label)}
                  </p>
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;">
                    ${cellValue}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    })
    .join('')
}

function buildExtraFieldsSection(extraFields = {}) {
  const entries = Object.entries(extraFields).filter(([, value]) => isPresent(value))
  if (!entries.length) return { text: '', html: '' }

  const text = `\n\nAdditional Details:\n${entries.map(([k, v]) => `${k}: ${v}`).join('\n')}`
  const rows = entries
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:0 0 10px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border:1px solid ${BRAND.greyLine};border-radius:10px;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.greyMuted};">
                    ${escapeHtml(key)}
                  </p>
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:${BRAND.charcoal};font-weight:500;">
                    ${escapeHtml(value)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join('')

  const html = `
    ${sectionHeading('Additional Details')}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${rows}
    </table>`

  return { text, html }
}

function buildReplyButton(customerEmail, formTitle, pageUrl) {
  const safeEmail = String(customerEmail || '').trim()
  const mailto = `mailto:${safeEmail}?subject=${encodeURIComponent(`Re: ${formTitle}`)}`
  const pageLink = isPresent(pageUrl) && /^https?:\/\//i.test(pageUrl)
    ? `
      <td align="center" style="padding:0 6px;">
        <a href="${escapeHtml(pageUrl)}" target="_blank" style="display:inline-block;padding:14px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${BRAND.charcoal};text-decoration:none;border-radius:8px;background:#ffffff;border:2px solid ${BRAND.greyLine};line-height:1.2;">
          View Submission Page
        </a>
      </td>`
    : ''

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:36px 0 0;background:${BRAND.cream};border:1px solid #f0ebe8;border-radius:12px;">
      <tr>
        <td style="padding:28px 24px;text-align:center;">
          <p style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:${BRAND.charcoal};">
            Ready to respond?
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
              <td align="center" style="padding:0 6px;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${mailto}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="12%" strokecolor="${BRAND.red}" fillcolor="${BRAND.red}">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Reply to Customer</center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-->
                <a href="${mailto}" target="_blank" class="cta-button" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;background:${BRAND.red};border:1px solid ${BRAND.redDeep};line-height:1.2;box-shadow:0 4px 14px rgba(196,18,48,0.28);">
                  Reply to Customer
                </a>
                <!--<![endif]-->
              </td>
              ${pageLink}
            </tr>
          </table>
          <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:${BRAND.greyMuted};">
            Or reply directly to
            <a href="mailto:${escapeHtml(safeEmail)}" style="color:${BRAND.red};text-decoration:none;font-weight:600;">${escapeHtml(safeEmail)}</a>
          </p>
        </td>
      </tr>
    </table>`
}

function buildPremiumHeader(formTitle, subtitle, customerName) {
  return `
    <tr>
      <td bgcolor="${BRAND.red}" style="background:${BRAND.red};background-image:linear-gradient(135deg, ${BRAND.red} 0%, ${BRAND.redDeep} 100%);padding:0;border-radius:16px 16px 0 0;">
        <!-- Gold accent bar -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td height="4" bgcolor="${BRAND.gold}" style="background:${BRAND.gold};font-size:0;line-height:0;border-radius:16px 16px 0 0;">&nbsp;</td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td class="email-header" style="padding:28px 36px 24px;text-align:center;">
              <a href="${WEBSITE_URL}" target="_blank" style="text-decoration:none;">
                <img src="${LOGO_URL}" width="160" alt="Honeywell Travel" style="display:block;margin:0 auto 20px;max-width:160px;height:auto;border:0;" />
              </a>
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);">
                Website Notification
              </p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;line-height:1.3;color:#ffffff;letter-spacing:0.01em;">
                ${escapeHtml(formTitle)}
              </h1>
              <p style="margin:12px auto 0;max-width:420px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);">
                ${escapeHtml(subtitle)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Customer highlight strip -->
    <tr>
      <td bgcolor="${BRAND.charcoal}" style="background:${BRAND.charcoal};padding:18px 36px;border-left:1px solid ${BRAND.greyLine};border-right:1px solid ${BRAND.greyLine};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="52" valign="middle" style="width:52px;padding-right:14px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="44" height="44" align="center" valign="middle" bgcolor="${BRAND.red}" style="width:44px;height:44px;background:${BRAND.red};border-radius:22px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#ffffff;text-align:center;">
                    ${getInitial(customerName)}
                  </td>
                </tr>
              </table>
            </td>
            <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;line-height:1.3;">
                ${escapeHtml(customerName)}
              </p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">
                New customer submission &bull; ${escapeHtml(formatSubmittedAt())}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

function buildPremiumFooter() {
  return `
    <tr>
      <td bgcolor="${BRAND.charcoal}" style="background:${BRAND.charcoal};padding:32px 36px;border-radius:0 0 16px 16px;border:1px solid ${BRAND.charcoal};border-top:1px solid #2d2d30;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="${LOGO_URL}" width="120" alt="Honeywell Travel" style="display:block;margin:0 auto;max-width:120px;height:auto;opacity:0.92;border:0;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#ffffff;padding-bottom:6px;">
              Honeywell Travel
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.55);padding-bottom:16px;">
              9 Anastasi Shioukri Street, Limassol 3035, Cyprus<br />
              Your trusted travel partner
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <a href="tel:+35725828848" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.8);text-decoration:none;margin:0 10px;">${OFFICE_PHONE}</a>
              <span style="color:rgba(255,255,255,0.3);">|</span>
              <a href="mailto:${OFFICE_EMAIL}" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.8);text-decoration:none;margin:0 10px;">${OFFICE_EMAIL}</a>
              <span style="color:rgba(255,255,255,0.3);">|</span>
              <a href="${WEBSITE_URL}" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.gold};text-decoration:none;margin:0 10px;font-weight:600;">honeywelltravel.com.cy</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="border-top:1px solid #2d2d30;padding-top:16px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:rgba(255,255,255,0.35);">
                This is an internal notification from your website forms.<br />
                &copy; ${new Date().getFullYear()} Honeywell Travel. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

export function getEmailSubject(payload) {
  const amount =
    payload.extraFields?.amount ||
    payload.extraFields?.Amount ||
    payload.extraFields?.['Amount']

  if (payload.formType === 'gift_voucher' && amount) {
    return `New Gift Voucher Request - ${amount}`
  }
  return SUBJECT_BY_FORM_TYPE[payload.formType] || 'New Website Contact Form Submission'
}

export function buildFormEmailContent(payload) {
  const formTitle = SUBJECT_BY_FORM_TYPE[payload.formType] || 'Website Form Submission'
  const subtitle = FORM_SUBTITLE[payload.formType] || 'A new submission was received on your website.'
  const submittedAt = formatSubmittedAt()
  const extra = buildExtraFieldsSection(payload.extraFields)

  const fields = [
    ['Name', payload.name],
    ['Email', payload.email],
    ['Phone', payload.phone],
    ['Destination / Service', payload.destination],
    ['Travel Dates', payload.travelDates],
    ['Number of Passengers', payload.passengers],
    ['Page URL', payload.pageUrl],
    ['Submitted', submittedAt],
  ]

  const textLines = [
    `Honeywell Travel — ${formTitle}`,
    '',
    subtitle,
    '',
    ...fields.filter(([, v]) => isPresent(v)).map(([label, value]) => `${label}: ${value}`),
    '',
    'Message / Notes:',
    payload.message || '—',
    extra.text,
    '',
    `Reply to customer: ${payload.email}`,
  ]

  const fieldRowsHtml = buildFieldRows(fields)
  const replyButton = buildReplyButton(payload.email, formTitle, payload.pageUrl)
  const messageHtml = escapeHtml(payload.message || '—').replace(/\n/g, '<br />')

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${escapeHtml(formTitle)} — Honeywell Travel</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${BRAND.greyBg}; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-header { padding: 24px 20px 20px !important; }
      .email-body { padding: 24px 18px !important; }
      .cta-button { display: block !important; width: 100% !important; box-sizing: border-box !important; margin-bottom: 10px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.greyBg};width:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(formTitle)} from ${escapeHtml(payload.name)} &mdash; ${escapeHtml(payload.email)}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.greyBg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <!-- Outer shadow card -->
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(28,28,30,0.12);">
          ${buildPremiumHeader(formTitle, subtitle, payload.name)}
          <!-- Body -->
          <tr>
            <td class="email-body" bgcolor="${BRAND.white}" style="background:${BRAND.white};padding:32px 36px;border-left:1px solid ${BRAND.greyLine};border-right:1px solid ${BRAND.greyLine};">
              ${sectionHeading('Submission Details')}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${fieldRowsHtml}
              </table>
              <!-- Message -->
              ${sectionHeading('Message / Notes')}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background:${BRAND.redSoft};border:1px solid #f5d0d6;border-left:4px solid ${BRAND.red};border-radius:12px;padding:22px 24px;">
                    <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1;color:${BRAND.red};opacity:0.35;">&ldquo;</p>
                    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${BRAND.charcoalSoft};">
                      ${messageHtml}
                    </div>
                  </td>
                </tr>
              </table>
              ${extra.html}
              ${replyButton}
            </td>
          </tr>
          ${buildPremiumFooter()}
        </table>
        <!-- Below-card tagline -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:20px 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${BRAND.greyLight};letter-spacing:0.05em;">
              Crafted with care by Honeywell Travel &bull; Limassol, Cyprus
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { text: textLines.join('\n').trim(), html }
}
