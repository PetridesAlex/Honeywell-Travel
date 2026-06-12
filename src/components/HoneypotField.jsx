/**
 * Hidden honeypot field for spam protection — visually hidden, not tabbable.
 */
function HoneypotField({ value = '', onChange }) {
  return (
    <input
      type="text"
      name="_hp"
      value={value}
      onChange={onChange}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

export default HoneypotField
