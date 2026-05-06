import React, { useMemo, useState } from 'react'

const TEMPLATES = {
  initial: ({ name, destination }) => ({
    subject: `Thanks for your interest in ${destination || 'your trip'}`,
    body: `Hello ${name || 'there'},\n\nThank you for your inquiry${destination ? ` about ${destination}` : ''}. Our team is preparing the best options for you and will send details shortly.\n\nBest regards,\nHoneywell Travel`
  }),
  offer: ({ name, destination }) => ({
    subject: `Your offer for ${destination || 'your trip'}`,
    body: `Hello ${name || 'there'},\n\nYour offer${destination ? ` for ${destination}` : ''} has been prepared and sent. Please review and let us know if you would like any adjustments.\n\nBest regards,\nHoneywell Travel`
  }),
  followup: ({ name, destination }) => ({
    subject: `Follow-up on your ${destination || 'travel'} inquiry`,
    body: `Hello ${name || 'there'},\n\nWe wanted to follow up regarding your request${destination ? ` for ${destination}` : ''}. We are here to help with any questions.\n\nBest regards,\nHoneywell Travel`
  })
}

function EmailTemplatePicker({ lead, onLog }) {
  const [template, setTemplate] = useState('initial')

  const mailto = useMemo(() => {
    const selected = TEMPLATES[template]({ name: lead.full_name, destination: lead.destination })
    return `mailto:${encodeURIComponent(lead.email || '')}?subject=${encodeURIComponent(selected.subject)}&body=${encodeURIComponent(selected.body)}`
  }, [template, lead])

  const handleSendEmail = () => {
    if (!lead.email) return
    window.location.href = mailto
    onLog?.(`${template}_mailto`)
  }

  return (
    <div className="crm-email-template">
      <select value={template} onChange={e => setTemplate(e.target.value)}>
        <option value="initial">Initial reply</option>
        <option value="offer">Offer sent</option>
        <option value="followup">Follow-up reminder</option>
      </select>
      <button
        type="button"
        className="crm-btn crm-btn-ghost"
        onClick={handleSendEmail}
        disabled={!lead.email}
      >
        Send via Outlook
      </button>
      <a className="crm-link-btn" href={lead.email ? mailto : undefined}>Open Email App</a>
    </div>
  )
}

export default EmailTemplatePicker
