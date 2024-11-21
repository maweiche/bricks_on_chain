import { Suspense, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Property } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="container mx-auto py-16">
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-96 rounded bg-secondary/20" />
        <div className="mx-auto h-4 w-64 rounded bg-secondary/20" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-0">
              <div className="h-48 animate-pulse bg-secondary/20" />
              <div className="space-y-4 p-6">
                <div className="h-6 w-3/4 animate-pulse rounded bg-secondary/20" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-secondary/20" />
                <div className="h-4 w-full animate-pulse rounded bg-secondary/20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
)

const PropertyCard = ({
  property,
  isHovered,
  onHover,
}: {
  property: Property
  isHovered: boolean
  onHover: (id: string | null) => void
}) => {
  const router = useRouter()
  const fundingProgress = (property.currentFunding / property.fundingGoal) * 100

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => onHover(property.id)}
      onHoverEnd={() => onHover(null)}
      className="w-full"
    >
      <Card className="group h-full cursor-pointer overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
              initial={false}
              animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            >
              <Button variant="secondary" className="gap-2" onClick={()=>router.push(`/properties/${property.id}`)}>
                View Details <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
            <Image
              src={property.images[0]}
              alt={property.title}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
              height={200}
              width={300}
            />
            <div className="absolute right-4 top-4 z-20">
              <Badge
                variant="secondary"
                className="bg-brand-accent bg-white/50 font-semibold text-secondary"
              >
                {fundingProgress >= 90 ? 'Closing Soon!' : 'Hot Deal 🔥'}
              </Badge>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <h3 className="line-clamp-1 text-lg font-semibold">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{property.location}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Funding Progress</span>
                <span className="font-medium">
                  {fundingProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={fundingProgress} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>{property.roi}% ROI</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span>{Math.floor(Math.random() * 50) + 20}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>14 days left</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-sm text-muted-foreground">Minimum</div>
                <div className="font-semibold">${(5000).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Target</div>
                <div className="font-semibold">
                  ${property.fundingGoal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Featured() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimationControls()

  const { data: properties = [] } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: async () => {
      const res = await fetch('/api/properties?limit=8&sort=fundingProgress')
      if (!res.ok) throw new Error('Failed to fetch properties')
      const data = await res.json()
      return data.properties || []
    },
  })

  const totalSlides = Math.ceil(properties.length / 3)

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 1
    const dragDistance = info.offset.x
    const containerWidth = containerRef.current?.offsetWidth || 0

    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (dragDistance < 0 && currentIndex < totalSlides - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }

    // Snap to nearest slide
    controls.start({
      x: -currentIndex * containerWidth,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    })
  }

  return (
    <div className="container mx-auto py-16">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Badge
            className="rounded-full bg-secondary px-4 py-2 text-3xl text-muted"
            style={{ transform: 'translateY(-50%)' }}
          >
            Featured Properties
          </Badge>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Don't miss out on these high-potential properties closing soon
          </p>
        </motion.div>

        <div className="relative">
          {/* Properties Container */}
          <div ref={containerRef} className="overflow-hidden">
            <motion.div
              drag="x"
              dragConstraints={{
                left: -(
                  (totalSlides - 1) *
                  (containerRef.current?.offsetWidth || 0)
                ),
                right: 0,
              }}
              dragElastic={0.1}
              dragMomentum={false}
              animate={controls}
              onDragEnd={handleDragEnd}
              style={{ touchAction: 'pan-y' }}
              className="flex cursor-grab active:cursor-grabbing"
            >
              <div className="flex">
                {properties.map((property: Property) => (
                  <div
                    key={property.id}
                    className="w-[calc(100vw/3.5)] flex-shrink-0 px-3"
                  >
                    <PropertyCard
                      property={property}
                      isHovered={hoveredId === property.id}
                      onHover={setHoveredId}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Progress Indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  controls.start({
                    x: -index * (containerRef.current?.offsetWidth || 0),
                    transition: { type: 'spring', stiffness: 300, damping: 30 },
                  })
                }}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-6 bg-primary' : 'bg-primary/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the wrapped component
export default function PropertiesFeatured() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Featured />
    </Suspense>
  )
}
