// import * as THREE from 'three'
// import { useState, useRef, useEffect, useMemo } from 'react'
// import { Canvas, useFrame } from '@react-three/fiber'
// import { useSpring, animated } from '@react-spring/three'
// import { 
//   Environment, 
//   Float, 
//   OrbitControls, 
//   Html,
//   PerspectiveCamera
// } from '@react-three/drei'
// import { motion } from 'framer-motion-3d'
// import { DynamicEnvironment } from './EnvironmentEffects'
// import { cn } from '@/lib/utils'
// import { useTheme } from 'next-themes'
// import { ThemeAwareScene } from './ThemeAwareScene'


// function ModernBuilding({ position, scale, rotation }: any) {
//     const [hovered, setHovered] = useState(false)
//     const meshRef = useRef<THREE.Group>(null)
    
//     const springs = useSpring({
//       scale: hovered ? 1.1 : 1,
//       intensity: hovered ? 0.5 : 0,
//       config: { mass: 1, tension: 280, friction: 60 }
//     })
  
//     useFrame(({ clock }) => {
//       if (meshRef.current) {
//         meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2
//       }
//     })
  
//     // Create meshes for different parts of the building
//     const parts = useMemo(() => {
//       return {
//         base: (
//           <mesh position={[0, 0, 0]} castShadow receiveShadow>
//             <boxGeometry args={[2, 0.2, 2]} />
//             <meshStandardMaterial 
//               color="#2D3142"
//               metalness={0.8}
//               roughness={0.2}
//               emissive="#2D3142"
//               emissiveIntensity={springs.intensity.get()}
//             />
//           </mesh>
//         ),
//         towers: [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]].map(([x, z], i) => (
//           <mesh key={`tower-${i}`} position={[x, 1.5, z]} castShadow>
//             <boxGeometry args={[0.4, 3, 0.4]} />
//             <meshStandardMaterial 
//               color="#2D3142"
//               metalness={0.8}
//               roughness={0.2}
//               emissive="#2D3142"
//               emissiveIntensity={springs.intensity.get()}
//             />
//           </mesh>
//         )),
//         bridges: [[0, 0.5], [0.5, 0], [-0.5, 0], [0, -0.5]].map(([x, z], i) => (
//           <mesh key={`bridge-${i}`} position={[x, 1.5, z]} castShadow>
//             <boxGeometry args={[0.8, 0.2, 0.2]} />
//             <meshStandardMaterial 
//               color="#D64045"
//               metalness={0.5}
//               roughness={0.3}
//               emissive="#D64045"
//               emissiveIntensity={springs.intensity.get()}
//             />
//           </mesh>
//         )),
//         glassPanels: Array.from({ length: 8 }).map((_, i) => {
//           const angle = (i / 8) * Math.PI * 2
//           return (
//             <mesh 
//               key={`glass-${i}`}
//               position={[
//                 Math.cos(angle) * 0.8,
//                 2,
//                 Math.sin(angle) * 0.8
//               ]}
//               rotation={[0, angle, 0]}
//               castShadow
//             >
//               <planeGeometry args={[0.3, 2]} />
//               <meshPhysicalMaterial 
//                 color="#E8E9EB"
//                 metalness={1}
//                 roughness={0}
//                 transmission={0.5}
//                 thickness={0.5}
//               />
//             </mesh>
//           )
//         })
//       }
//     }, [springs.intensity])
  
//     return (
//       <animated.group
//         ref={meshRef}
//         position={position}
//         scale={springs.scale.to(s => [s, s, s])}
//         rotation={rotation}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}
//       >
//         {parts.base}
//         {parts.towers}
//         {parts.bridges}
//         {parts.glassPanels}
//       </animated.group>
//     )
// }

// // Enhanced Token with interactivity
// function EnhancedToken({ position }: any) {
//   const [hovered, setHovered] = useState(false)
  
//   const { scale, rotation } = useSpring({
//     scale: hovered ? 1.2 : 1,
//     rotation: hovered ? Math.PI : 0,
//   })

//   return (
//     <Float
//       speed={1.5}
//       rotationIntensity={1.5}
//       floatIntensity={1.5}
//     >
//       <animated.mesh
//         position={position}
//         scale={scale}
//         rotation-y={rotation}
//         onPointerOver={() => setHovered(true)}
//         onPointerOut={() => setHovered(false)}
//       >
//         <cylinderGeometry args={[1, 1, 0.2, 32]} />
//         <meshStandardMaterial 
//           color="#FFC857"
//           metalness={0.8}
//           roughness={0.2}
//           emissive="#FFC857"
//           emissiveIntensity={hovered ? 0.5 : 0}
//         />
//         {/* Token Details */}
//         <mesh position={[0, 0.11, 0]}>
//           <ringGeometry args={[0.5, 0.7, 32]} />
//           <meshStandardMaterial 
//             color="#2D3142"
//             metalness={0.8}
//             roughness={0.2}
//           />
//         </mesh>
//       </animated.mesh>
//     </Float>
//   )
// }

// function TokenizationFlow() {
//   return (
//     <group>
//       {/* Building */}
//       <ModernBuilding 
//         position={[0, -2, 0]} 
//         scale={2}
//         rotation={[0, Math.PI * 0.25, 0]}
//       />

//       {/* Tokens */}
//       <group position={[0, 2, 0]}>
//         {Array.from({ length: 8 }).map((_, i) => {
//           const angle = (i / 8) * Math.PI * 2
//           const radius = 4
//           return (
//             <EnhancedToken 
//               key={i}
//               position={[
//                 Math.cos(angle) * radius,
//                 Math.sin(i) * 0.5,
//                 Math.sin(angle) * radius
//               ]}
//             />
//           )
//         })}
//       </group>

//       {/* Info Points */}
//       {featurePoints.map((point, index) => (
//         <Html
//           key={index}
//           position={point.position}
//           center
//           distanceFactor={15}
//         >
//           <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg shadow-lg w-48">
//             <h3 className="font-bold text-sm mb-1">{point.title}</h3>
//             <p className="text-xs text-muted-foreground">{point.description}</p>
//           </div>
//         </Html>
//       ))}
//     </group>
//   )
// }

// // Feature points data
// type FeaturePoint = {
//   title: string;
//   description: string;
//   position: [number, number, number];
// };

// const featurePoints: FeaturePoint[] = [
//   {
//     title: "Property Tokenization",
//     description: "Real estate assets are converted into digital tokens on the blockchain",
//     position: [-3, 0, 3]
//   },
//   {
//     title: "Fractional Ownership",
//     description: "Invest in properties with minimal capital through token ownership",
//     position: [3, 0, 3]
//   },
//   {
//     title: "Governance Rights",
//     description: "Token holders participate in property decisions through voting",
//     position: [0, 3, 3]
//   },
//   {
//     title: "Liquidity",
//     description: "Trade property tokens easily on our platform",
//     position: [0, -2, 4]
//   }
// ]

// // Add responsive handling
// function useResponsiveScene() {
//   const [isMobile, setIsMobile] = useState(false)

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768)
//     }
    
//     checkMobile()
//     window.addEventListener('resize', checkMobile)
//     return () => window.removeEventListener('resize', checkMobile)
//   }, [])

//   return { isMobile }
// }

// export function FeaturesSection() {
//     const { isMobile } = useResponsiveScene()
//     const { theme } = useTheme()
    
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="min-h-screen w-full"
//       >
//         <div className="relative">
//           <div className="h-[800px] w-full">
//             <Canvas shadows>
//               <PerspectiveCamera 
//                 makeDefault 
//                 position={isMobile ? [0, 0, 16] : [0, 0, 12]} 
//                 fov={isMobile ? 60 : 50}
//               />
              
//               <ThemeAwareScene />
              
//               <TokenizationFlow />
              
//               <OrbitControls
//                 enableZoom={false}
//                 enablePan={false}
//                 minPolarAngle={Math.PI / 3}
//                 maxPolarAngle={Math.PI / 2}
//               />
//             </Canvas>
//           </div>
  
//           {/* Info Cards with theme-aware styling */}
//           {featurePoints.map((point, index) => (
//             <Html
//               key={index}
//               position={point.position}
//               center
//               distanceFactor={15}
//             >
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.2 }}
//                 className={cn(
//                   "p-4 rounded-lg shadow-lg w-48 backdrop-blur-sm",
//                   theme === 'dark' 
//                     ? "bg-black/80 text-white" 
//                     : "bg-white/80 text-black"
//                 )}
//               >
//                 <h3 className="font-bold text-sm mb-1">{point.title}</h3>
//                 <p className={cn(
//                   "text-xs",
//                   theme === 'dark' 
//                     ? "text-gray-300" 
//                     : "text-gray-600"
//                 )}>
//                   {point.description}
//                 </p>
//               </motion.div>
//             </Html>
//           ))}
//         </div>
//       </motion.div>
//     )
//   }


// components/features/FeaturesScene.tsx
import * as THREE from 'three'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import { 
  Environment, 
  Float, 
  OrbitControls, 
  Html,
  PerspectiveCamera,
  Stars,
  Cloud,
  Sky
} from '@react-three/drei'
import { motion } from 'framer-motion-3d'
import { useTheme } from 'next-themes'

function ModernBuilding({ position, scale, rotation }: any) {
    const [hovered, setHovered] = useState(false)
    const meshRef = useRef<THREE.Group>(null)
    
    const springs = useSpring({
      scale: hovered ? 1.1 : 1,
      intensity: hovered ? 0.5 : 0,
      config: { mass: 1, tension: 280, friction: 60 }
    })
  
    useFrame(({ clock }) => {
      if (meshRef.current) {
        meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2
      }
    })
  
    // Create meshes for different parts of the building
    const parts = useMemo(() => {
      return {
        base: (
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 0.2, 2]} />
            <meshStandardMaterial 
              color="#2D3142"
              metalness={0.8}
              roughness={0.2}
              emissive="#2D3142"
              emissiveIntensity={springs.intensity.get()}
            />
          </mesh>
        ),
        towers: [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]].map(([x, z], i) => (
          <mesh key={`tower-${i}`} position={[x, 1.5, z]} castShadow>
            <boxGeometry args={[0.4, 3, 0.4]} />
            <meshStandardMaterial 
              color="#2D3142"
              metalness={0.8}
              roughness={0.2}
              emissive="#2D3142"
              emissiveIntensity={springs.intensity.get()}
            />
          </mesh>
        )),
        bridges: [[0, 0.5], [0.5, 0], [-0.5, 0], [0, -0.5]].map(([x, z], i) => (
          <mesh key={`bridge-${i}`} position={[x, 1.5, z]} castShadow>
            <boxGeometry args={[0.8, 0.2, 0.2]} />
            <meshStandardMaterial 
              color="#D64045"
              metalness={0.5}
              roughness={0.3}
              emissive="#D64045"
              emissiveIntensity={springs.intensity.get()}
            />
          </mesh>
        )),
        glassPanels: Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh 
              key={`glass-${i}`}
              position={[
                Math.cos(angle) * 0.8,
                2,
                Math.sin(angle) * 0.8
              ]}
              rotation={[0, angle, 0]}
              castShadow
            >
              <planeGeometry args={[0.3, 2]} />
              <meshPhysicalMaterial 
                color="#E8E9EB"
                metalness={1}
                roughness={0}
                transmission={0.5}
                thickness={0.5}
              />
            </mesh>
          )
        })
      }
    }, [springs.intensity])
  
    return (
      <animated.group
        ref={meshRef}
        position={position}
        scale={springs.scale.to(s => [s, s, s])}
        rotation={rotation}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {parts.base}
        {parts.towers}
        {parts.bridges}
        {parts.glassPanels}
      </animated.group>
    )
}

// Enhanced Token with interactivity
function EnhancedToken({ position }: any) {
  const [hovered, setHovered] = useState(false)
  
  const { scale, rotation } = useSpring({
    scale: hovered ? 1.2 : 1,
    rotation: hovered ? Math.PI : 0,
  })

  return (
    <Float
      speed={1.5}
      rotationIntensity={1.5}
      floatIntensity={1.5}
    >
      <animated.mesh
        position={position}
        scale={scale}
        rotation-y={rotation}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <meshStandardMaterial 
          color="#FFC857"
          metalness={0.8}
          roughness={0.2}
          emissive="#FFC857"
          emissiveIntensity={hovered ? 0.5 : 0}
        />
        {/* Token Details */}
        <mesh position={[0, 0.11, 0]}>
          <ringGeometry args={[0.5, 0.7, 32]} />
          <meshStandardMaterial 
            color="#2D3142"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </animated.mesh>
    </Float>
  )
}

// function TokenizationFlow() {
//   return (
//     <group>
//       {/* Building */}
//       <ModernBuilding 
//         position={[0, -2, 0]} 
//         scale={2}
//         rotation={[0, Math.PI * 0.25, 0]}
//       />

//       {/* Tokens */}
//       <group position={[0, 2, 0]}>
//         {Array.from({ length: 8 }).map((_, i) => {
//           const angle = (i / 8) * Math.PI * 2
//           const radius = 4
//           return (
//             <EnhancedToken 
//               key={i}
//               position={[
//                 Math.cos(angle) * radius,
//                 Math.sin(i) * 0.5,
//                 Math.sin(angle) * radius
//               ]}
//             />
//           )
//         })}
//       </group>

//       {/* Info Points */}
//       {featurePoints.map((point, index) => (
//         <Html
//           key={index}
//           position={point.position}
//           center
//           distanceFactor={15}
//         >
//           <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg shadow-lg w-48">
//             <h3 className="font-bold text-sm mb-1">{point.title}</h3>
//             <p className="text-xs text-muted-foreground">{point.description}</p>
//           </div>
//         </Html>
//       ))}
//     </group>
//   )
// }

// Feature points data
type FeaturePoint = {
  title: string;
  description: string;
  position: [number, number, number];
};

const featurePoints: FeaturePoint[] = [
  {
    title: "Property Tokenization",
    description: "Real estate assets are converted into digital tokens on the blockchain",
    position: [-3, 0, 3]
  },
  {
    title: "Fractional Ownership",
    description: "Invest in properties with minimal capital through token ownership",
    position: [3, 0, 3]
  },
  {
    title: "Governance Rights",
    description: "Token holders participate in property decisions through voting",
    position: [0, 3, 3]
  },
  {
    title: "Liquidity",
    description: "Trade property tokens easily on our platform",
    position: [0, -2, 4]
  }
]

// Add responsive handling
function useResponsiveScene() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile }
}

// Wrap the environment-dependent components in a component inside Canvas
function ThemeAwareEnvironment() {
    // Add mounted state to handle hydration
    const [mounted, setMounted] = useState(false)
    const { theme, systemTheme } = useTheme()
  
    // Handle hydration mismatch
    useEffect(() => {
      setMounted(true)
    }, [])
  
    if (!mounted) {
      return <LightEnvironment /> // Default fallback during SSR
    }
  
    // Determine the actual theme
    const currentTheme = theme === 'system' ? systemTheme : theme
    const isDark = currentTheme === 'dark'
  
    return isDark ? (
      <>
        <DarkEnvironment />
      </>
    ) : (
      <>
        <LightEnvironment />
      </>
    )
  }
  
// Add this new component for lightning
function Lightning() {
    const [isFlashing, setIsFlashing] = useState(false)
    const lightningRef = useRef<THREE.PointLight>(null)
  
    useEffect(() => {
      const interval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance of lightning every interval
          setIsFlashing(true)
          setTimeout(() => setIsFlashing(false), 150)
        }
      }, 2000)
  
      return () => clearInterval(interval)
    }, [])
  
    return (
      <>
        <pointLight
          ref={lightningRef}
          position={[0, 50, 0]}
          intensity={isFlashing ? 20 : 0}
          color="#b8f4ff"
          distance={100}
          decay={2}
        />
        {isFlashing && (
          <mesh position={[0, 25, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#b8f4ff" />
          </mesh>
        )}
      </>
    )
  }
  
  // Enhanced clouds with better visibility
  function EnhancedClouds() {
    const groupRef = useRef<THREE.Group>(null)
  
    useFrame(({ clock }) => {
      if (groupRef.current) {
        groupRef.current.rotation.y = clock.getElapsedTime() * 0.02
      }
    })
  
    return (
      <group ref={groupRef}>
        {Array.from({ length: 20 }).map((_, i) => {
          const radius = 15 + Math.random() * 15
          const angle = (i / 20) * Math.PI * 2
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          return (
            <group key={i} position={[x, 10 + Math.random() * 10, z]}>
              <Cloud
                opacity={0.8}
                speed={0.1}
                segments={20}
                color="#ffffff"
              />
            </group>
          )
        })}
      </group>
    )
  }
  
  // Update the environment components
  function LightEnvironment() {
    return (
      <>
        <Sky 
          distance={450000} 
          sunPosition={[0, 1, 0]} 
          inclination={0.5} 
          azimuth={0.25} 
        />
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1.5}
          castShadow
        />
        <EnhancedClouds />
        <fog attach="fog" args={['#87CEEB', 20, 100]} />
        <color attach="background" args={['#87CEEB']} />
      </>
    )
  }
  
  function DarkEnvironment() {
    return (
      <>
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          fade 
          speed={1} 
        />
        <RainEffect />
        <Lightning />
        <ambientLight intensity={0.05} color="#2596be" />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.1} 
          color="#2596be" 
        />
        <pointLight 
          position={[0, 10, 0]} 
          intensity={0.1} 
          color="#2596be" 
        />
        <fog attach="fog" args={['#0a0a0a', 5, 30]} />
        <color attach="background" args={['#0a0a0a']} />
      </>
    )
  }
  
  // Enhanced rain effect with more density and better visibility
  function RainEffect() {
    const rainRef = useRef<THREE.Points>(null)
    const [raindrops] = useState(() => {
      const count = 1000 // Increased count
      const positions = new Float32Array(count * 3)
      const velocities = new Float32Array(count)
      const sizes = new Float32Array(count)
      
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50
        positions[i * 3 + 1] = Math.random() * 30
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50
        velocities[i] = 0.2 + Math.random() * 0.3 // Faster rain
        sizes[i] = 0.1 + Math.random() * 0.2 // Varied sizes
      }
      
      return { positions, velocities, sizes, count }
    })
    
    useFrame(() => {
      if (rainRef.current) {
        const positions = rainRef.current.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < raindrops.count; i++) {
          positions[i * 3 + 1] -= raindrops.velocities[i]
          if (positions[i * 3 + 1] < -10) {
            positions[i * 3 + 1] = 20
            // Randomize X and Z when resetting to create more natural rain pattern
            positions[i * 3] = (Math.random() - 0.5) * 50
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50
          }
        }
        rainRef.current.geometry.attributes.position.needsUpdate = true
        // Rotate slightly for wind effect
        rainRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.1
      }
    })
  
    return (
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={raindrops.count}
            array={raindrops.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={raindrops.count}
            array={raindrops.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color="#aaaaff"
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    )
  }

// Clouds component
function Clouds() {
  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => (
        <Cloud
          key={i}
          position={[
            (Math.random() - 0.5) * 30,
            10 + Math.random() * 5,
            (Math.random() - 0.5) * 30
          ]}
          opacity={0.5}
          speed={0.2}
        />
      ))}
    </group>
  )
}

function TokenizationFlow({ theme = 'light' }) {
    const isDark = theme === 'dark'

    return (
      <group>
        {isDark ? <DarkEnvironment /> : <LightEnvironment />}
        
        <ModernBuilding 
          position={[0, -2, 0]} 
          scale={2}
          rotation={[0, Math.PI * 0.25, 0]}
        />

      <group position={[0, 2, 0]}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 4
          return (
            <EnhancedToken 
              key={i}
              position={[
                Math.cos(angle) * radius,
                Math.sin(i) * 0.5,
                Math.sin(angle) * radius
              ]}
            />
          )
        })}
      </group>

      {/* Info Points */}
      {featurePoints.map((point, index) => (
        <Html
          key={index}
          position={point.position}
          center
          distanceFactor={15}
        >
          <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg shadow-lg w-48">
            <h3 className="font-bold text-sm mb-1">{point.title}</h3>
            <p className="text-xs text-muted-foreground">{point.description}</p>
          </div>
        </Html>
      ))}
    </group>
  )
}

// Main FeaturesSection component stays largely the same
export function FeaturesSection() {
  const { isMobile } = useResponsiveScene()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full"
    >
      <div className="relative">
        <div className="h-[800px] w-full">
          <Canvas shadows>
            <PerspectiveCamera 
              makeDefault 
              position={isMobile ? [0, 0, 16] : [0, 0, 12]} 
              fov={isMobile ? 60 : 50}
            />
            
            {mounted && <TokenizationFlow theme={theme === 'system' ? systemTheme : theme} />}
            
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>
      </div>
    </motion.div>
  )
}