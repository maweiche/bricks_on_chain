import { Suspense, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, useAnimationControls } from 'framer-motion'
import { ArrowRight, Clock, MapPin, TrendingUp, Users } from 'lucide-react'

import { Property } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  isHovered: boolean
  onHover: (id: string | null) => void
}

const LoadingFallback = () => (
  <div className="container mx-auto py-8 md:py-16">
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-6 w-64 rounded bg-secondary/20 md:h-8 md:w-96" />
        <div className="mx-auto h-4 w-48 rounded bg-secondary/20 md:w-64" />
      </div>
      <div className="px-4 md:px-0">
        <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:gap-6">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="relative w-[280px] flex-shrink-0 overflow-hidden md:w-full"
            >
              <CardContent className="p-0">
                <div className="h-40 animate-pulse bg-secondary/20 md:h-48" />
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

function PropertyCard({ property, isHovered, onHover }: PropertyCardProps) {
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
          {/* Image Container */}
          <div className="relative">
            {/* Hover Overlay with View Details Button */}
            <motion.div
              className="absolute inset-0 z-10 hidden items-center justify-center bg-black/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 md:flex"
              initial={false}
              animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            >
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => router.push(`/properties/${property.id}`)}
              >
                View Details <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Property Image */}
            <Image
              src={property.images[0]}
              alt={property.title}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-110 md:h-48"
              height={200}
              width={300}
            />

            {/* Status Badge */}
            <div className="absolute left-3 top-3 z-20 flex gap-2 md:left-4 md:top-4">
              {property.funded ? (
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-500"
                >
                  Fully Funded
                </Badge>
              ) : (
                <>
                  {fundingProgress >= 90 ? (
                    <Badge
                      variant="secondary"
                      className="bg-brand-accent/20 text-brand-accent"
                    >
                      Closing Soon!
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-brand-accent/20 text-brand-accent"
                    >
                      Hot Deal 🔥
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 p-4 md:space-y-4 md:p-6">
            {/* Title and Location */}
            <div className="space-y-2">
              <h3 className="line-clamp-1 text-base font-semibold md:text-lg">
                {property.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                <span>{property.location}</span>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Funding Progress</span>
                <span className="font-medium">
                  {fundingProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={fundingProgress} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 border-t pt-3 text-xs md:text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600 md:h-4 md:w-4" />
                <span>{property.roi}% ROI</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-600 md:h-4 md:w-4" />
                <span>{Math.floor(Math.random() * 50) + 20}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-600 md:h-4 md:w-4" />
                <span>14d left</span>
              </div>
            </div>

            {/* Investment Details */}
            <div className="flex items-center justify-between border-t pt-3 md:pt-4">
              <div>
                <div className="text-xs text-muted-foreground md:text-sm">
                  Minimum
                </div>
                <div className="text-sm font-semibold md:text-base">
                  ${(5000).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground md:text-sm">
                  Target
                </div>
                <div className="text-sm font-semibold md:text-base">
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
    <div className="container mx-auto py-8">
      <div className="space-y-6 md:space-y-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5"
          >
            <span className="text-lg font-medium text-secondary dark:text-primary">
              Featured Properties
            </span>
          </motion.div>
        </div>

        <div className="relative">
          {/* Mobile View */}
          <div className="px-4 md:hidden">
            <div className="flex w-full flex-col">
              <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
                {properties.map((property: Property) => (
                  <div key={property.id} className="w-[280px] flex-shrink-0">
                    <PropertyCard
                      property={property}
                      isHovered={hoveredId === property.id}
                      onHover={setHoveredId}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex w-full max-w-[640px] flex-col">
                <h1 className="mb-8 text-3xl font-bold tracking-tight">
                  <span className="text-secondary">Bricks on Chain</span>{' '}
                  democratizes real estate through blockchain for as little as{' '}
                  <span className="text-primary">$100</span>
                </h1>

                <p className="text-lg leading-relaxed text-muted-foreground">
                  Traditional real estate investing has been exclusive to the
                  wealthy elite. Through tokenization on Solana, anyone can now
                  own a piece of premium properties and earn passive income.
                  Join the future of property investment today.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="flex flex-col md:flex-row md:gap-12">
              <div className="flex w-full max-w-[640px] flex-col lg:w-1/2">
                <h1 className="mb-8 text-5xl font-bold tracking-tight md:text-5xl lg:text-5xl">
                  <span className="text-secondary">Bricks on Chain</span>{' '}
                  democratizes real estate through blockchain for as little as{' '}
                  <span className="text-primary">$100</span>
                </h1>

                <p className="text-xl leading-relaxed text-muted-foreground md:text-2xl">
                  Traditional real estate investing has been exclusive to the
                  wealthy elite. Through tokenization on Solana, anyone can now
                  own a piece of premium properties and earn passive income.
                  Join the future of property investment today.
                </p>
              </div>
              <div className="flex w-1/2 flex-col">
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
                          transition: {
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          },
                        })
                      }}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        index === currentIndex
                          ? 'w-6 bg-primary'
                          : 'w-2 bg-primary/20'
                      )}
                    />
                  ))}
                </div>
              </div>
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
