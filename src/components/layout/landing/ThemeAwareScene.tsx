// components/3d/ThemeAwareScene.tsx
import { useTheme } from 'next-themes'
import * as THREE from 'three'
import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Cloud, Sky, useHelper } from '@react-three/drei'

function LightMode() {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null)
  // Helper for debugging light position
  // useHelper(directionalLightRef, THREE.DirectionalLightHelper, 1)

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0.5}
        azimuth={0.25}
      />

      {/* Bright, daytime lighting */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Animated clouds */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Cloud
          key={i}
          position={[
            (Math.random() - 0.5) * 30,
            10 + Math.random() * 5,
            (Math.random() - 0.5) * 30,
          ]}
          opacity={0.5}
          speed={0.2}
        />
      ))}

      {/* Background color */}
      <color attach="background" args={['#87CEEB']} />
    </>
  )
}

function DarkMode() {
  const [raindrops] = useState(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = Math.random() * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      velocities[i] = 0.1 + Math.random() * 0.1
    }

    return { positions, velocities, count }
  })

  const rainRef = useRef<THREE.Points>(null)

  useFrame(() => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position
        .array as Float32Array
      for (let i = 0; i < raindrops.count; i++) {
        positions[i * 3 + 1] -= raindrops.velocities[i]
        if (positions[i * 3 + 1] < -10) {
          positions[i * 3 + 1] = 20
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      {/* Dark sky with stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

      {/* Rain effect */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={raindrops.count}
            array={raindrops.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#aaaaaa"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Nighttime lighting */}
      <ambientLight intensity={0.1} color="#2596be" />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.2}
        color="#2596be"
      />
      <pointLight position={[0, 10, 0]} intensity={0.1} color="#2596be" />

      {/* Background color */}
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#0a0a0a', 10, 50]} />
    </>
  )
}

export function ThemeAwareScene() {
  const { theme } = useTheme()

  return <>{theme === 'dark' ? <DarkMode /> : <LightMode />}</>
}
