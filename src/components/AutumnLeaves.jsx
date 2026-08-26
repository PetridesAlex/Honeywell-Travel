import { useLocation } from 'react-router-dom'
import './AutumnLeaves.css'

const LEAF_COUNT = 26

function AutumnLeaves() {
  const { pathname } = useLocation()

  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <div className="autumn-leaves" aria-hidden="true">
      {Array.from({ length: LEAF_COUNT }, (_, index) => {
        const depth = index % 3 === 0 ? 'near' : index % 3 === 1 ? 'far' : ''
        const extra = index >= 16 ? ' autumn-leaf--extra' : ''
        return (
          <span
            key={`autumn-leaf-${index}`}
            className={`autumn-leaf autumn-leaf--${(index % 5) + 1}${depth ? ` autumn-leaf--${depth}` : ''}${extra}`}
            style={{ '--leaf-i': index }}
          />
        )
      })}
    </div>
  )
}

export default AutumnLeaves
