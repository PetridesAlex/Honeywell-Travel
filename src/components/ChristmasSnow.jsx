import { useLocation } from 'react-router-dom'
import './ChristmasSnow.css'

const FLAKE_COUNT = 56
const FLOATING_TREE_COUNT = 5

function ChristmasSnow() {
  const { pathname } = useLocation()

  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <div className="christmas-snow" aria-hidden="true">
      {Array.from({ length: FLOATING_TREE_COUNT }, (_, index) => (
        <span
          key={`christmas-tree-float-${index}`}
          className={`christmas-tree christmas-tree--float christmas-tree--float-${(index % 3) + 1}`}
          style={{ '--tree-i': index }}
        />
      ))}

      {Array.from({ length: FLAKE_COUNT }, (_, index) => {
        const depth = index % 3 === 0 ? 'near' : index % 3 === 1 ? 'far' : 'mid'
        const kind = index % 6 === 0 ? 'spark' : index % 3 === 0 ? 'crystal' : 'powder'
        const extra = index >= 36 ? ' christmas-flake--extra' : ''
        return (
          <span
            key={`christmas-flake-${index}`}
            className={`christmas-flake christmas-flake--${kind} christmas-flake--${depth}${extra}`}
            style={{ '--flake-i': index }}
          />
        )
      })}
    </div>
  )
}

export default ChristmasSnow
