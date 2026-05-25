import { Link } from 'react-router-dom'

function PipelineFunnel({ funnel = [] }) {
  const max = Math.max(...funnel.map((item) => item.count), 1)
  const total = funnel.reduce((sum, item) => sum + item.count, 0) || 1

  return (
    <div className="crm-funnel crm-funnel--premium">
      {funnel.map((item, index) => {
        const width = Math.max((item.count / max) * 100, item.count > 0 ? 12 : 6)
        const share = ((item.count / total) * 100).toFixed(0)
        return (
          <Link
            key={item.status}
            to="/admin/pipeline"
            className={`crm-funnel-step crm-funnel-step--${item.status.toLowerCase()} crm-funnel-step--premium`}
            style={{ '--funnel-width': `${width}%`, '--funnel-delay': `${index * 60}ms` }}
          >
            <span className="crm-funnel-step__top">
              <span className="crm-funnel-step__label">{item.status}</span>
              <strong className="crm-funnel-step__count">{item.count}</strong>
            </span>
            <span className="crm-funnel-step__track">
              <span className="crm-funnel-step__bar" />
            </span>
            <span className="crm-funnel-step__share">{share}% of pipeline</span>
          </Link>
        )
      })}
    </div>
  )
}

export default PipelineFunnel
