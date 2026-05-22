import { useEffect, useRef } from 'react'

/**
 * Animated particle grid background (adapted for Vite/React admin login).
 */
export function Flicker({
  spacing = 30,
  particleSize = 2,
  color = '#999999',
  glowColor = '#c79d33',
  alpha = 1,
  overlay = 0,
  overlayColor = '#ffffff',
  minFrequency = 0.2,
  maxFrequency = 1.2,
  rate = 0.5,
}) {
  const canvasRef = useRef(null)
  const frameRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = window.devicePixelRatio || 1
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cols = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1
      const particles = []
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          particles.push({
            x: col * spacing,
            y: row * spacing,
            phase: Math.random() * Math.PI * 2,
            frequency:
              minFrequency + Math.random() * (maxFrequency - minFrequency),
          })
        }
      }
      particlesRef.current = particles
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas.parentElement)

    let time = 0
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      if (overlay > 0) {
        ctx.fillStyle = overlayColor
        ctx.globalAlpha = overlay
        ctx.fillRect(0, 0, width, height)
        ctx.globalAlpha = 1
      }

      time += rate * 0.016
      particlesRef.current.forEach((particle) => {
        const pulse =
          0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * particle.frequency + particle.phase))
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = glowColor
        ctx.globalAlpha = alpha * pulse
        ctx.shadowBlur = 8
        ctx.shadowColor = glowColor
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = color
        ctx.globalAlpha = alpha * pulse * 0.85
        ctx.fill()
      })
      ctx.globalAlpha = 1

      frameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      observer.disconnect()
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [spacing, particleSize, color, glowColor, alpha, overlay, overlayColor, minFrequency, maxFrequency, rate])

  return <canvas ref={canvasRef} className="flicker-canvas" aria-hidden="true" />
}
