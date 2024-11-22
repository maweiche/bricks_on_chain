// components/3d/EnvironmentEffects.tsx
import { useTheme } from 'next-themes'
import { Stars, Cloud, Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef } from 'react'

function Rain() {
  const rainCount = 1000
  const positions = new Float32Array(rainCount * 3)
  const velocities = new Float32Array(rainCount)

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50
    positions[i * 3 + 1] = Math.random() * 30
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50
    velocities[i] = 0.1 + Math.random() * 0.1
  }

  const rainRef = useRef<THREE.Points>(null)

  useFrame(() => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position
        .array as Float32Array
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= velocities[i]
        if (positions[i * 3 + 1] < -10) {
          positions[i * 3 + 1] = 20
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#aaa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export function DynamicEnvironment() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <>
      {isDark ? (
        <>
          <color attach="background" args={['#0a0a0a']} />
          <fog attach="fog" args={['#0a0a0a', 10, 50]} />
          <Stars fade speed={1} count={5000} />
          <Rain />
          <ambientLight intensity={0.1} />
          <pointLight position={[0, 10, 0]} intensity={0.1} />
          <directionalLight
            position={[-5, 5, -5]}
            intensity={0.1}
            color="#blue"
          />
        </>
      ) : (
        <>
          <color attach="background" args={['#87CEEB']} />
          <Sky sunPosition={[100, 10, 100]} />
          <Cloud opacity={0.5} speed={0.4} segments={20} />
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[100, 10, 100]}
            intensity={1}
            castShadow
          />
        </>
      )}
    </>
  )
}
