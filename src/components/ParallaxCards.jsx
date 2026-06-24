import { useRef, useEffect, useCallback, useState } from 'react'
import gsap from 'gsap'
import './ParallaxCards.css'

function ParallaxCards({
  images,
  cardCount,
  perspective = 2500,
  mouseSensitivity = 3,
  cardWidth,
  cardHeight,
  animationDuration = 1.1,
  enableDepthFog = false,
  fogIntensity = 1.1,
  enableMagneticAttraction = true,
  magneticStrength = 48,
  onCardClick,
  className = ''
}) {
  const wrapperRef = useRef(null)
  const stageRef = useRef(null)
  const elementsRef = useRef([])
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [useStaticLayout, setUseStaticLayout] = useState(false)
  const [focusedCardIndex, setFocusedCardIndex] = useState(null)

  const totalCards = Math.min(cardCount || images.length, 12)
  const visibleImages = images.slice(0, totalCards)

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const coarseQuery = window.matchMedia('(pointer: coarse)')
    const updateLayout = () => {
      setUseStaticLayout(mobileQuery.matches || coarseQuery.matches)
    }

    updateLayout()
    mobileQuery.addEventListener('change', updateLayout)
    coarseQuery.addEventListener('change', updateLayout)
    return () => {
      mobileQuery.removeEventListener('change', updateLayout)
      coarseQuery.removeEventListener('change', updateLayout)
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches)
    }

    setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const currentWrapper = wrapperRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      { threshold: 0.12 }
    )

    if (currentWrapper) {
      observer.observe(currentWrapper)
    }

    return () => {
      if (currentWrapper) {
        observer.unobserve(currentWrapper)
      }
      observer.disconnect()
    }
  }, [])

  const calculateSpatialLayout = useCallback(() => {
    if (typeof window === 'undefined') return []

    const viewWidth = window.innerWidth
    const viewHeight = window.innerHeight

    const layouts = [
      { posX: -viewWidth * 0.27, posY: -viewHeight * 0.16, depth: -180, size: 0.92, tiltX: -4, tiltY: 5 },
      { posX: viewWidth * 0.26, posY: -viewHeight * 0.21, depth: -280, size: 0.87, tiltX: -3, tiltY: -4 },
      { posX: -viewWidth * 0.31, posY: viewHeight * 0.16, depth: -390, size: 0.82, tiltX: 4, tiltY: 6 },
      { posX: viewWidth * 0.3, posY: viewHeight * 0.23, depth: -500, size: 0.77, tiltX: 5, tiltY: -5 },
      { posX: 0, posY: -viewHeight * 0.27, depth: -650, size: 0.72, tiltX: -6, tiltY: 0 },
      { posX: -viewWidth * 0.36, posY: 0, depth: -790, size: 0.67, tiltX: 0, tiltY: 7 },
      { posX: viewWidth * 0.36, posY: 0, depth: -920, size: 0.61, tiltX: 0, tiltY: -7 },
      { posX: 0, posY: viewHeight * 0.31, depth: -1030, size: 0.56, tiltX: 6, tiltY: 0 },
      { posX: -viewWidth * 0.2, posY: -viewHeight * 0.13, depth: -1180, size: 0.5, tiltX: -3, tiltY: 3 },
      { posX: viewWidth * 0.2, posY: -viewHeight * 0.13, depth: -1300, size: 0.46, tiltX: -3, tiltY: -3 },
      { posX: -viewWidth * 0.19, posY: viewHeight * 0.15, depth: -1420, size: 0.42, tiltX: 3, tiltY: 3 },
      { posX: viewWidth * 0.19, posY: viewHeight * 0.15, depth: -1540, size: 0.38, tiltX: 3, tiltY: -3 }
    ]

    return layouts.slice(0, totalCards)
  }, [totalCards])

  const calculateDepthFog = useCallback(
    (depth) => {
      if (!enableDepthFog) return { opacity: 1, blur: 0 }

      const maxDepth = 1540
      const depthRatio = Math.abs(depth) / maxDepth
      const opacity = Math.max(0.72, 1 - depthRatio * 0.32 * fogIntensity)
      const blur = 0

      return { opacity, blur }
    },
    [enableDepthFog, fogIntensity]
  )

  const arrangeElements = useCallback(
    (focusIndex = null) => {
      const spatialConfigs = calculateSpatialLayout()

      elementsRef.current.forEach((element, idx) => {
        if (!element || !spatialConfigs[idx]) return

        const config = spatialConfigs[idx]
        const layerIndex = 2000 - Math.round(Math.abs(config.depth))
        const isFocused = focusIndex === idx
        const fogEffect = calculateDepthFog(config.depth)

        gsap.to(element, {
          x: isFocused ? 0 : config.posX,
          y: isFocused ? 0 : config.posY,
          z: isFocused ? 130 : config.depth,
          rotationX: isFocused ? 0 : config.tiltX,
          rotationY: isFocused ? 0 : config.tiltY,
          scale: isFocused ? 1.06 : config.size,
          zIndex: isFocused ? 3000 : layerIndex,
          opacity: isFocused ? 1 : fogEffect.opacity,
          filter: 'blur(0px)',
          duration: animationDuration,
          ease: 'power2.inOut'
        })
      })
    },
    [animationDuration, calculateDepthFog, calculateSpatialLayout]
  )

  const applyMagneticEffect = useCallback(() => {
    if (!enableMagneticAttraction || !isVisible || prefersReducedMotion) return

    const spatialConfigs = calculateSpatialLayout()

    elementsRef.current.forEach((element, idx) => {
      if (!element || !spatialConfigs[idx] || focusedCardIndex === idx) return

      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = mousePositionRef.current.x - centerX
      const deltaY = mousePositionRef.current.y - centerY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const maxDistance = 520
      const influence = Math.max(0, 1 - distance / maxDistance)

      if (distance === 0 || influence === 0) return

      const offsetX = (deltaX / distance) * influence * magneticStrength
      const offsetY = (deltaY / distance) * influence * magneticStrength
      const config = spatialConfigs[idx]

      gsap.to(element, {
        x: config.posX + offsetX,
        y: config.posY + offsetY,
        duration: 0.8,
        ease: 'power2.out'
      })
    })
  }, [
    calculateSpatialLayout,
    enableMagneticAttraction,
    focusedCardIndex,
    isVisible,
    magneticStrength,
    prefersReducedMotion
  ])

  const handlePointerMove = useCallback(
    (event) => {
      if (!wrapperRef.current || !stageRef.current || !isVisible || prefersReducedMotion) return

      mousePositionRef.current = { x: event.clientX, y: event.clientY }
      if (focusedCardIndex !== null) return

      const bounds = wrapperRef.current.getBoundingClientRect()
      const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5
      const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5

      gsap.to(stageRef.current, {
        rotationY: normalizedX * mouseSensitivity,
        rotationX: -normalizedY * mouseSensitivity,
        duration: 1.1,
        ease: 'power1.out'
      })

      applyMagneticEffect()
    },
    [applyMagneticEffect, focusedCardIndex, isVisible, mouseSensitivity, prefersReducedMotion]
  )

  const resetScene = useCallback(() => {
    if (!stageRef.current) return
    gsap.to(stageRef.current, {
      rotationY: 0,
      rotationX: 0,
      duration: animationDuration,
      ease: 'power2.inOut'
    })
  }, [animationDuration])

  const handleCardClick = useCallback(
    (index, imageUrl) => {
      const nextFocusedIndex = focusedCardIndex === index ? null : index
      setFocusedCardIndex(nextFocusedIndex)
      arrangeElements(nextFocusedIndex)
      resetScene()
      if (onCardClick) onCardClick(index, imageUrl)
    },
    [arrangeElements, focusedCardIndex, onCardClick, resetScene]
  )

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return

    arrangeElements(focusedCardIndex)
    const wrapper = wrapperRef.current

    if (wrapper) {
      wrapper.addEventListener('mousemove', handlePointerMove)
    }

    const handleWindowResize = () => {
      arrangeElements(focusedCardIndex)
    }

    window.addEventListener('resize', handleWindowResize)

    return () => {
      if (wrapper) {
        wrapper.removeEventListener('mousemove', handlePointerMove)
      }
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [arrangeElements, focusedCardIndex, handlePointerMove, isVisible, prefersReducedMotion])

  useEffect(() => {
    arrangeElements(focusedCardIndex)
  }, [arrangeElements, focusedCardIndex, images, cardCount])

  useEffect(() => {
    if (prefersReducedMotion && stageRef.current) {
      gsap.set(stageRef.current, { rotationY: 0, rotationX: 0 })
    }
  }, [prefersReducedMotion])

  if (useStaticLayout || prefersReducedMotion) {
    return (
      <div className={`parallax-cards parallax-cards--static ${className}`}>
        <div className="parallax-cards-static-track">
          {visibleImages.map((image, index) => (
            <button
              key={image.id || index}
              type="button"
              className="parallax-card parallax-card--static"
              style={{
                backgroundImage: `url(${image.src})`,
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (onCardClick) onCardClick(index, image.src)
              }}
              aria-label={image.title || `Destination ${index + 1}`}
            >
              <span className="parallax-card-label">{image.title}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      className={`parallax-cards ${className}`}
      style={{ perspective: `${perspective}px` }}
    >
      <div ref={stageRef} className="parallax-cards-stage">
        {visibleImages.map((image, index) => (
          <button
            key={image.id || index}
            ref={(element) => {
              elementsRef.current[index] = element
            }}
            onClick={(event) => {
              event.stopPropagation()
              handleCardClick(index, image.src)
            }}
            type="button"
            className={`parallax-card ${focusedCardIndex === index ? 'is-focused' : ''}`}
            style={{
              width: cardWidth || 'min(350px, 78vw)',
              height: cardHeight || 'min(480px, 110vw)',
              backgroundImage: `url(${image.src})`
            }}
            aria-label={image.title || `Destination ${index + 1}`}
          >
            <span className="parallax-card-label">{image.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ParallaxCards
