import { Suspense, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  motion,
  useAnimationControls,
} from 'framer-motion'
import {
  ArrowRight,
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
import { cn } from '@/lib/utils'

const LoadingFallback = () => (
  <div className="container mx-auto py-8 md:py-16">
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-6 w-64 md:h-8 md:w-96 rounded bg-secondary/20" />
        <div className="mx-auto h-4 w-48 md:w-64 rounded bg-secondary/20" />
      </div>
      <div className="px-4 md:px-0">
        <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="relative w-[280px] md:w-full flex-shrink-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-40 md:h-48 animate-pulse bg-secondary/20" />
                <div className="space-y-4 p-4 md:p-6">
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
              className="absolute inset-0 z-10 hidden md:flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
              initial={false}
              animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            >
              <Button variant="secondary" className="gap-2" onClick={() => router.push(`/properties/${property.id}`)}>
                View Details <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
            <Image
              src={property.images[0]}
              alt={property.title}
              className="h-40 md:h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
              height={200}
              width={300}
            />
            <div className="absolute right-3 top-3 md:right-4 md:top-4 z-20">
              <Badge
                variant="secondary"
                className="bg-brand-accent bg-white/50 text-xs md:text-sm font-semibold text-secondary"
              >
                {fundingProgress >= 90 ? 'Closing Soon!' : 'Hot Deal 🔥'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4 p-4 md:p-6">
            <h3 className="line-clamp-1 text-base md:text-lg font-semibold">
              {property.title}
            </h3>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
              <span>{property.location}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Funding Progress</span>
                <span className="font-medium">
                  {fundingProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={fundingProgress} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span>{property.roi}% ROI</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                <span>{Math.floor(Math.random() * 50) + 20}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                <span>14d left</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 md:pt-4">
              <div>
                <div className="text-xs md:text-sm text-muted-foreground">Minimum</div>
                <div className="text-sm md:text-base font-semibold">${(5000).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs md:text-sm text-muted-foreground">Target</div>
                <div className="text-sm md:text-base font-semibold">
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
    // Only apply drag behavior on desktop
    if (window.innerWidth >= 768) {
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

      controls.start({
        x: -currentIndex * containerWidth,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      })
    }
  }

  return (
    <div className="container mx-auto py-8 md:py-16">
      <div className="space-y-6 md:space-y-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 mb-4"
          >
            <span className="text-lg font-medium text-secondary dark:text-primary">
              Featured Properties
            </span>
          </motion.div>
        </div>

        <div className="relative">
          {/* Mobile View */}
          <div className="md:hidden px-4">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {properties.map((property: Property) => (
                <div
                  key={property.id}
                  className="w-[280px] flex-shrink-0"
                >
                  <PropertyCard
                    property={property}
                    isHovered={hoveredId === property.id}
                    onHover={setHoveredId}
                  />
                </div>
              ))}
            </div>
            {/* Mobile Scroll Indicator */}
            {/* <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-1 w-16 rounded-full bg-secondary/20">
                <div className="h-full w-1/3 rounded-full bg-secondary" />
              </div>
            </div> */}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <div ref={containerRef} className="overflow-hidden">
              <motion.div
                drag="x"
                dragConstraints={{
                  left: -((totalSlides - 1) * (containerRef.current?.offsetWidth || 0)),
                  right: 0,
                }}
                dragElastic={0.1}
                dragMomentum={false}
                animate={controls}
                onDragEnd={handleDragEnd}
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

            {/* Desktop Progress Indicators */}
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
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentIndex ? "w-6 bg-primary" : "w-2 bg-primary/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesFeatured() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Featured />
    </Suspense>
  )
}