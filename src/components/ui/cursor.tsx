'use client'
import { useEffect, useState } from 'react'

type Props = {
  className?: string
}

const Cursor = ({ className = '' }: Props) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    addEventListeners()
    return () => removeEventListeners()
  }, [])

  const addEventListeners = () => {
    document.addEventListener('mousemove', onMouseMove)
  }

  const removeEventListeners = () => {
    document.removeEventListener('mousemove', onMouseMove)
  }

  const onMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <div
      className={`pointer-events-none fixed z-30 h-[140%] w-[100%] -translate-x-1/2 -translate-y-1/2 bg-torch transition duration-300 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    ></div>
  )
}

export default Cursor
