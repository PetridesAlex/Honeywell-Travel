/**
 * Honeywell Travel — premium branded HTML + plain-text templates for form notifications.
 * Table-based layout with inline CSS for Gmail, Outlook, and Apple Mail.
 */

const BRAND = {
  red: '#c41230',
  redDeep: '#8f0e24',
  redSoft: '#fdf2f4',
  navy: '#0b1f38',
  navyDeep: '#071526',
  charcoal: '#1c1c1e',
  charcoalSoft: '#3f3f46',
  gold: '#c9a227',
  goldSoft: '#f8f1de',
  cream: '#faf8f6',
  white: '#ffffff',
  greyBg: '#eef1f4',
  greyLine: '#e4e4e7',
  greyMuted: '#71717a',
  greyLight: '#a1a1aa',
}

const LOGO_URL = 'https://www.honeywelltravel.com.cy/images/icons/honeywell-travel-logo-email.png'
const WEBSITE_URL = 'https://www.honeywelltravel.com.cy'
const OFFICE_PHONE = '+357 25828848'
const OFFICE_PHONE_TEL = '+35725828848'
const OFFICE_EMAIL = 'limassol@honeywelltravel.com.cy'

export const SUBJECT_BY_FORM_TYPE = {
  contact: 'New Website Contact Form Submission',
  our_world: 'New Website Contact Form Submission',
  newsletter: 'Newsletter Subscription',
  build_your_trip: 'New Travel Inquiry',
  honeymoon: 'New Travel Inquiry',
  flight_booking: 'New Travel Inquiry',
  cruise: 'New Travel Inquiry',
  black_friday_cruise: 'New Black Friday Cruise Enquiry',
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
  black_friday_cruise: 'A Black Friday MSC cruises enquiry is waiting for follow-up.',
  dmc: 'A DMC / group travel request is ready for review.',
  corporate: 'A corporate travel quote has been requested.',
  hotel_quote: 'A hotel quote request is waiting for your response.',
  package: 'A package reservation request has been submitted.',
  gift_voucher: 'A customer would like to purchase a gift voucher.',
}

const PRIORITY_FORMS = new Set(['black_friday_cruise', 'honeymoon', 'corporate', 'dmc', 'package'])

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

function formatPhoneHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : ''
}

function sectionHeading(title) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px;">
      <tr>
        <td width="3" style="width:3px;background:${BRAND.red};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
        <td style="padding-left:12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:400;color:${BRAND.navy};letter-spacing:0.01em;">
          ${escapeHtml(title)}
        </td>
      </tr>
    </table>`
}

function detailCell(label, valueHtml, options = {}) {
  const { width = '50%', padRight = false, padLeft = false } = options
  const padding = [
    'padding-top:0',
    'padding-bottom:10px',
    padRight ? 'padding-right:5px' : 'padding-right:0',
    padLeft ? 'padding-left:5px' : 'padding-left:0',
  ].join(';')

  return `
    <td class="detail-cell" width="${width}" valign="top" style="width:${width};${padding};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.cream};border:1px solid #efe9e4;border-radius:10px;">
        <tr>
          <td style="padding:12px 14px;">
            <p style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.greyMuted};">
              ${escapeHtml(label)}
            </p>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:${BRAND.charcoal};font-weight:600;word-break:break-word;">
              ${valueHtml}
            </div>
          </td>
        </tr>
      </table>
    </td>`
}

function renderFieldValue(label, value) {
  if (label === 'Email' && isPresent(value)) {
    return `<a href="mailto:${escapeHtml(value)}" style="color:${BRAND.red};text-decoration:none;font-weight:700;">${escapeHtml(value)}</a>`
  }
  if (label === 'Phone' && isPresent(value)) {
    const href = formatPhoneHref(value)
    return href
      ? `<a href="${escapeHtml(href)}" style="color:${BRAND.navy};text-decoration:none;font-weight:700;">${escapeHtml(value)}</a>`
      : escapeHtml(value)
  }
  if (label === 'Page URL' && /^https?:\/\//i.test(String(value))) {
    return `<a href="${escapeHtml(value)}" style="color:${BRAND.red};text-decoration:none;font-weight:700;">Open submission page &rarr;</a>`
  }
  return `<span style="color:${BRAND.charcoal};font-weight:600;">${escapeHtml(value)}</span>`
}

function buildDetailsGrid(fields) {
  const present = fields.filter(([, value]) => isPresent(value))
  let rows = ''

  for (let i = 0; i < present.length; i += 2) {
    const left = present[i]
    const right = present[i + 1]
    const leftHtml = detailCell(left[0], renderFieldValue(left[0], left[1]), {
      width: right ? '50%' : '100%',
      padRight: Boolean(right),
    })
    const rightHtml = right
      ? detailCell(right[0], renderFieldValue(right[0], right[1]), {
          width: '50%',
          padLeft: true,
        })
      : ''

    rows += `
      <tr>
        ${leftHtml}
        ${rightHtml}
      </tr>`
  }

  return `
    <table role="presentation" class="details-grid" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${rows}
    </table>`
}

function buildExtraFieldsSection(extraFields = {}) {
  const entries = Object.entries(extraFields).filter(([, value]) => isPresent(value))
  if (!entries.length) return { text: '', html: '' }

  const text = `\n\nCampaign / Additional Details:\n${entries.map(([k, v]) => `${k}: ${v}`).join('\n')}`

  const chips = entries
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:0 0 8px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.white};border:1px solid ${BRAND.greyLine};border-radius:10px;">
              <tr>
                <td width="4" style="width:4px;background:${BRAND.gold};border-radius:10px 0 0 10px;font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:12px 14px;">
                  <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.greyMuted};">
                    ${escapeHtml(key)}
                  </p>
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${BRAND.navy};font-weight:600;">
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
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px;">
      <tr>
        <td>
          ${sectionHeading('Campaign & Offer Details')}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${chips}
          </table>
        </td>
      </tr>
    </table>`

  return { text, html }
}

function buildActionButtons({ customerEmail, customerPhone, formTitle, pageUrl }) {
  const safeEmail = String(customerEmail || '').trim()
  const mailto = `mailto:${safeEmail}?subject=${encodeURIComponent(`Re: ${formTitle}`)}`
  const phoneHref = formatPhoneHref(customerPhone)
  const hasPage = isPresent(pageUrl) && /^https?:\/\//i.test(pageUrl)

  const callButton = phoneHref
    ? `
      <td align="center" class="cta-cell" style="padding:4px;">
        <a href="${escapeHtml(phoneHref)}" style="display:inline-block;padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${BRAND.navy};text-decoration:none;border-radius:9px;background:${BRAND.white};border:1.5px solid ${BRAND.greyLine};line-height:1.2;min-width:120px;">
          Call customer
        </a>
      </td>`
    : ''

  const pageButton = hasPage
    ? `
      <td align="center" class="cta-cell" style="padding:4px;">
        <a href="${escapeHtml(pageUrl)}" target="_blank" style="display:inline-block;padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${BRAND.navy};text-decoration:none;border-radius:9px;background:${BRAND.white};border:1.5px solid ${BRAND.greyLine};line-height:1.2;min-width:120px;">
          View page
        </a>
      </td>`
    : ''

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;background:linear-gradient(180deg, ${BRAND.goldSoft} 0%, ${BRAND.cream} 100%);border:1px solid #efe4c8;border-radius:14px;">
      <tr>
        <td style="padding:24px 20px;text-align:center;">
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.gold};">
            Next step
          </p>
          <p style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${BRAND.navy};">
            Respond to this enquiry
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
              <td align="center" class="cta-cell" style="padding:4px;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${mailto}" style="height:46px;v-text-anchor:middle;width:160px;" arcsize="12%" strokecolor="${BRAND.red}" fillcolor="${BRAND.red}">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">Reply by email</center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-->
                <a href="${mailto}" style="display:inline-block;padding:13px 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:9px;background:${BRAND.red};border:1px solid ${BRAND.redDeep};line-height:1.2;min-width:120px;box-shadow:0 8px 18px rgba(196,18,48,0.25);">
                  Reply by email
                </a>
                <!--<![endif]-->
              </td>
              ${callButton}
              ${pageButton}
            </tr>
          </table>
          <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:${BRAND.greyMuted};">
            Reply-to is set to
            <a href="mailto:${escapeHtml(safeEmail)}" style="color:${BRAND.red};text-decoration:none;font-weight:700;">${escapeHtml(safeEmail)}</a>
            ${
              isPresent(customerPhone)
                ? ` &nbsp;&bull;&nbsp; <a href="${escapeHtml(phoneHref || '#')}" style="color:${BRAND.navy};text-decoration:none;font-weight:700;">${escapeHtml(customerPhone)}</a>`
                : ''
            }
          </p>
        </td>
      </tr>
    </table>`
}

function buildPremiumHeader(formTitle, subtitle, customerName, formType) {
  const isPriority = PRIORITY_FORMS.has(formType)
  const badgeLabel = isPriority ? 'Priority follow-up' : 'Website notification'
  const badgeBg = isPriority ? 'rgba(201,162,39,0.22)' : 'rgba(255,255,255,0.14)'
  const badgeBorder = isPriority ? 'rgba(201,162,39,0.55)' : 'rgba(255,255,255,0.22)'
  const badgeColor = isPriority ? '#fde68a' : 'rgba(255,255,255,0.88)'

  return `
    <tr>
      <td bgcolor="${BRAND.navy}" style="background:${BRAND.navy};background-image:linear-gradient(145deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 55%, #5c0f1e 140%);padding:0;border-radius:16px 16px 0 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td height="4" bgcolor="${BRAND.gold}" style="background:${BRAND.gold};font-size:0;line-height:0;border-radius:16px 16px 0 0;">&nbsp;</td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td class="email-header" style="padding:28px 32px 22px;text-align:center;">
              <a href="${WEBSITE_URL}" target="_blank" style="text-decoration:none;">
                <img src="${LOGO_URL}" width="148" height="99" alt="Honeywell Travel" style="display:block;margin:0 auto 16px;max-width:148px;width:148px;height:auto;border:0;outline:none;" />
              </a>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 14px;">
                <tr>
                  <td style="padding:6px 12px;border-radius:999px;background:${badgeBg};border:1px solid ${badgeBorder};font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${badgeColor};">
                    ${escapeHtml(badgeLabel)}
                  </td>
                </tr>
              </table>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;line-height:1.28;color:#ffffff;letter-spacing:0.01em;">
                ${escapeHtml(formTitle)}
              </h1>
              <p style="margin:12px auto 0;max-width:440px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.86);">
                ${escapeHtml(subtitle)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td bgcolor="${BRAND.charcoal}" style="background:${BRAND.charcoal};padding:16px 28px;border-left:1px solid ${BRAND.greyLine};border-right:1px solid ${BRAND.greyLine};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="48" valign="middle" style="width:48px;padding-right:12px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="40" height="40" align="center" valign="middle" bgcolor="${BRAND.red}" style="width:40px;height:40px;background:${BRAND.red};border-radius:20px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#ffffff;text-align:center;line-height:40px;">
                    ${getInitial(customerName)}
                  </td>
                </tr>
              </table>
            </td>
            <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;line-height:1.3;">
                ${escapeHtml(customerName)}
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.62);">
                New customer submission &bull; ${escapeHtml(formatSubmittedAt())}
              </p>
            </td>
            <td align="right" valign="middle" class="status-pill" style="font-family:Arial,Helvetica,sans-serif;">
              <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(196,18,48,0.18);border:1px solid rgba(252,165,165,0.35);color:#fecaca;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">
                Action needed
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

function buildPremiumFooter() {
  return `
    <tr>
      <td bgcolor="${BRAND.navyDeep}" style="background:${BRAND.navyDeep};padding:28px 28px;border-radius:0 0 16px 16px;border:1px solid ${BRAND.navyDeep};border-top:1px solid #16304d;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding-bottom:14px;">
              <img src="${LOGO_URL}" width="108" alt="Honeywell Travel" style="display:block;margin:0 auto;max-width:108px;height:auto;border:0;opacity:0.95;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#ffffff;padding-bottom:6px;">
              Honeywell Travel
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.55);padding-bottom:14px;">
              9 Anastasi Shioukri Street, Limassol 3035, Cyprus<br />
              Your trusted travel partner
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <a href="tel:${OFFICE_PHONE_TEL}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.82);text-decoration:none;margin:0 8px;">${OFFICE_PHONE}</a>
              <span style="color:rgba(255,255,255,0.28);">|</span>
              <a href="mailto:${OFFICE_EMAIL}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.82);text-decoration:none;margin:0 8px;">${OFFICE_EMAIL}</a>
              <span style="color:rgba(255,255,255,0.28);">|</span>
              <a href="${WEBSITE_URL}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND.gold};text-decoration:none;margin:0 8px;font-weight:700;">honeywelltravel.com.cy</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="border-top:1px solid #16304d;padding-top:14px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:rgba(255,255,255,0.35);">
                Internal website form notification for the Honeywell Travel team.<br />
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
    isPresent(payload.phone) ? `Call customer: ${payload.phone}` : '',
  ].filter(Boolean)

  const detailsHtml = buildDetailsGrid(fields)
  const actionsHtml = buildActionButtons({
    customerEmail: payload.email,
    customerPhone: payload.phone,
    formTitle,
    pageUrl: payload.pageUrl,
  })
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
      .email-header { padding: 24px 18px 18px !important; }
      .email-body { padding: 22px 16px !important; }
      .detail-cell { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .cta-cell { display: block !important; width: 100% !important; }
      .cta-cell a { display: block !important; width: 100% !important; box-sizing: border-box !important; margin: 0 0 8px !important; }
      .status-pill { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.greyBg};width:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(formTitle)} from ${escapeHtml(payload.name)} &mdash; ${escapeHtml(payload.email)}
    ${isPresent(payload.phone) ? ` &mdash; ${escapeHtml(payload.phone)}` : ''}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.greyBg};">
    <tr>
      <td align="center" style="padding:36px 14px;">
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(7,21,38,0.14);">
          ${buildPremiumHeader(formTitle, subtitle, payload.name, payload.formType)}
          <tr>
            <td class="email-body" bgcolor="${BRAND.white}" style="background:${BRAND.white};padding:28px 28px 30px;border-left:1px solid ${BRAND.greyLine};border-right:1px solid ${BRAND.greyLine};">
              ${sectionHeading('Customer Details')}
              ${detailsHtml}

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
                <tr>
                  <td>
                    ${sectionHeading('Message / Notes')}
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background:${BRAND.redSoft};border:1px solid #f3d4da;border-left:4px solid ${BRAND.red};border-radius:12px;padding:18px 18px 18px 20px;">
                          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:${BRAND.charcoalSoft};">
                            ${messageHtml}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${extra.html}
              ${actionsHtml}
            </td>
          </tr>
          ${buildPremiumFooter()}
        </table>
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:18px 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${BRAND.greyLight};letter-spacing:0.04em;">
              Honeywell Travel &bull; Limassol, Cyprus &bull; Internal sales notification
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
