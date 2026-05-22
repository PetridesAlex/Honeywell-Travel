import { useMemo } from 'react'
import { Mail } from 'lucide-react'
import { CRM_SENDER_EMAIL } from '../constants'
import { getComposeLinks, openMailtoCompose, openOutlookWebCompose } from '../utils/composeEmail'

/**
 * Quick reply: opens Outlook (default mail app) or Outlook on the web with To + subject set.
 */
function ComposeEmailActions({
  to,
  recipientName,
  destination,
  companyName,
  subject,
  body,
  variant = 'inline',
  onCompose
}) {
  const links = useMemo(
    () =>
      getComposeLinks({
        to,
        recipientName,
        destination,
        companyName,
        subject,
        body
      }),
    [to, recipientName, destination, companyName, subject, body]
  )

  if (!links.to) {
    if (variant === 'compact') return null
    if (variant === 'header') {
      return (
        <p className="crm-compose-email crm-compose-email--header-disabled">No email on file for this client.</p>
      )
    }
    return (
      <span className="crm-compose-email crm-compose-email--disabled" title="No email on file">
        No email
      </span>
    )
  }

  const handleMailto = (event) => {
    event.preventDefault()
    openMailtoCompose({ to: links.to, subject: links.subject, body })
    onCompose?.('mailto')
  }

  const handleOutlookWeb = (event) => {
    event.preventDefault()
    openOutlookWebCompose({ to: links.to, subject: links.subject, body })
    onCompose?.('outlook_web')
  }

  const fromHint = `Send from ${CRM_SENDER_EMAIL}`

  if (variant === 'compact') {
    return (
      <span className="crm-compose-email crm-compose-email--compact">
        <a
          className="crm-compose-email__btn crm-compose-email__btn--primary"
          href={links.mailto}
          onClick={handleMailto}
          title={`${fromHint} → ${links.to}`}
        >
          <Mail size={14} aria-hidden />
          Email
        </a>
      </span>
    )
  }

  if (variant === 'header') {
    return (
      <div className="crm-compose-email crm-compose-email--header">
        <div className="crm-compose-email__header-actions">
          <a
            className="crm-compose-email__header-btn crm-compose-email__header-btn--primary"
            href={links.mailto}
            onClick={handleMailto}
            title={fromHint}
          >
            <Mail size={17} aria-hidden />
            Send email
          </a>
          <a
            className="crm-compose-email__header-btn crm-compose-email__header-btn--secondary"
            href={links.outlookWeb}
            onClick={handleOutlookWeb}
            target="_blank"
            rel="noreferrer"
            title={`${fromHint} (Outlook Web)`}
          >
            Outlook Web
          </a>
        </div>
      </div>
    )
  }

  if (variant === 'bar') {
    return (
      <div className="crm-compose-email crm-compose-email--bar">
        <a
          className="crm-drawer-action crm-drawer-action--email"
          href={links.mailto}
          onClick={handleMailto}
          title={fromHint}
        >
          <Mail size={15} aria-hidden />
          Email
        </a>
        <a
          className="crm-drawer-action crm-drawer-action--email-web"
          href={links.outlookWeb}
          onClick={handleOutlookWeb}
          target="_blank"
          rel="noreferrer"
          title={`${fromHint} (Outlook Web)`}
        >
          Outlook Web
        </a>
      </div>
    )
  }

  return (
    <div className="crm-compose-email crm-compose-email--inline">
      <p className="crm-compose-email__from" title={fromHint}>
        From <strong>{CRM_SENDER_EMAIL}</strong>
      </p>
      <div className="crm-compose-email__actions">
        <a
          className="crm-btn crm-btn-ghost crm-btn--email"
          href={links.mailto}
          onClick={handleMailto}
          title={fromHint}
        >
          <Mail size={16} aria-hidden />
          Send email
        </a>
        <a
          className="crm-link-btn crm-link-btn--email-web"
          href={links.outlookWeb}
          onClick={handleOutlookWeb}
          target="_blank"
          rel="noreferrer"
          title={`${fromHint} (Outlook Web)`}
        >
          Outlook Web
        </a>
      </div>
    </div>
  )
}

export default ComposeEmailActions
