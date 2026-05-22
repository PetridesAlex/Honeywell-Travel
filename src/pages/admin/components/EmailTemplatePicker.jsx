import { useMemo, useState } from 'react'
import {
  getComposeLinks,
  openMailtoCompose,
  openOutlookWebCompose,
  withEmailSignature
} from '../utils/composeEmail'

const TEMPLATES = {
  initial: ({ name, destination }) => ({
    subject: `Thanks for your interest in ${destination || 'your trip'}`,
    body: `Hello ${name || 'there'},\n\nThank you for your inquiry${destination ? ` about ${destination}` : ''}. Our team is preparing the best options for you and will send details shortly.\n\nBest regards,`
  }),
  offer: ({ name, destination }) => ({
    subject: `Your offer for ${destination || 'your trip'}`,
    body: `Hello ${name || 'there'},\n\nYour offer${destination ? ` for ${destination}` : ''} has been prepared and sent. Please review and let us know if you would like any adjustments.\n\nBest regards,`
  }),
  followup: ({ name, destination }) => ({
    subject: `Follow-up on your ${destination || 'travel'} inquiry`,
    body: `Hello ${name || 'there'},\n\nWe wanted to follow up regarding your request${destination ? ` for ${destination}` : ''}. We are here to help with any questions.\n\nBest regards,`
  })
}

function EmailTemplatePicker({ lead, onLog }) {
  const [template, setTemplate] = useState('initial')
  const safeLead = lead && typeof lead === 'object' ? lead : null
  const name = safeLead
    ? safeLead.full_name || [safeLead.first_name, safeLead.last_name].filter(Boolean).join(' ')
    : ''

  const selected = useMemo(
    () =>
      safeLead
        ? TEMPLATES[template]({ name, destination: safeLead.destination })
        : { subject: '', body: '' },
    [template, name, safeLead]
  )

  const links = useMemo(
    () =>
      safeLead
        ? getComposeLinks({
            to: safeLead.email,
            recipientName: name,
            destination: safeLead.destination,
            subject: selected.subject,
            body: selected.body
          })
        : { to: '', mailto: null, outlookWeb: null, subject: '' },
    [safeLead, name, selected.subject, selected.body]
  )

  if (!safeLead) return null

  const handleQuickReply = () => {
    if (!links.to) return
    openMailtoCompose({ to: links.to, subject: links.subject })
    onLog?.('quick_reply')
  }

  const templatedBody = useMemo(() => withEmailSignature(selected.body), [selected.body])

  const handleTemplateMailto = () => {
    if (!links.to) return
    openMailtoCompose({ to: links.to, subject: links.subject, body: templatedBody })
    onLog?.(`${template}_mailto`)
  }

  const handleOutlookWeb = () => {
    if (!links.to) return
    openOutlookWebCompose({ to: links.to, subject: links.subject, body: templatedBody })
    onLog?.(`${template}_outlook_web`)
  }

  return (
    <div className="crm-email-template">
      <select value={template} onChange={(e) => setTemplate(e.target.value)} aria-label="Email template">
        <option value="initial">Initial reply</option>
        <option value="offer">Offer sent</option>
        <option value="followup">Follow-up reminder</option>
      </select>
      <button
        type="button"
        className="crm-btn crm-btn-ghost crm-btn--email-quick"
        onClick={handleQuickReply}
        disabled={!links.to}
        title="Opens your mail app with recipient and subject — write the message yourself"
      >
        Quick reply
      </button>
      <button
        type="button"
        className="crm-btn crm-btn-ghost"
        onClick={handleTemplateMailto}
        disabled={!links.to}
      >
        With template
      </button>
      <button
        type="button"
        className="crm-btn crm-btn-ghost crm-btn--email-web"
        onClick={handleOutlookWeb}
        disabled={!links.to}
      >
        Outlook Web
      </button>
    </div>
  )
}

export default EmailTemplatePicker
