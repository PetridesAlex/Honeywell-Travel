import { Link } from 'react-router-dom'

function PipelineFunnel({ funnel = [] }) {
  const max = Math.max(...funnel.map((item) => item.count), 1)

  return (
    <div className="crm-funnel">
      {funnel.map((item) => (
        <Link
          key={item.status}
          to="/admin/pipeline"
          className={`crm-funnel-step crm-funnel-step--${item.status.toLowerCase()}`}
        >
          <span className="crm-funnel-step__label">{item.status}</span>
          <span className="crm-funnel-step__bar" style={{ width: `${Math.max((item.count / max) * 100, 8)}%` }} />
          <strong className="crm-funnel-step__count">{item.count}</strong>
        </Link>
      ))}
    </div>
  )
}

export default PipelineFunnel
