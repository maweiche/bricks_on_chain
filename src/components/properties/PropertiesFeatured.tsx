import { useState, useRef, Suspense } from 'react';
import { motion, useMotionValue, useTransform, useAnimationControls } from 'framer-motion'
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Property } from '@/lib/store';
import {
  Clock,
  Users,
  TrendingUp,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="container mx-auto py-16">
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="h-8 w-96 bg-secondary/20 rounded mx-auto" />
        <div className="h-4 w-64 bg-secondary/20 rounded mx-auto" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-0">
              <div className="h-48 bg-secondary/20 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-secondary/20 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-secondary/20 rounded animate-pulse" />
                <div className="h-4 w-full bg-secondary/20 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const PropertyCard = ({ property, isHovered, onHover }: { 
  property: Property; 
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) => {
  const router = useRouter();
  const fundingProgress = (property.currentFunding / property.fundingGoal) * 100;

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
      <Card 
        className="group overflow-hidden cursor-pointer h-full"
      >
        <CardContent className="p-0">
          <div className="relative">
            <motion.div 
              className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            >
              <Button variant="secondary" className="gap-2">
                View Details <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
            <Image
              src={property.images[0]} 
              alt={property.title}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
              height={200}
              width={300}
            />
            <div className="absolute top-4 right-4 z-20">
              <Badge 
                variant="secondary" 
                className="bg-brand-accent text-secondary font-semibold bg-white/50"
              >
                {fundingProgress >= 90 ? 'Closing Soon!' : 'Hot Deal 🔥'}
              </Badge>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Funding Progress</span>
                <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
              </div>
              <Progress value={fundingProgress} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>{property.roi}% ROI</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{Math.floor(Math.random() * 50) + 20}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-600" />
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
                <div className="font-semibold">${property.fundingGoal.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
      }
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
        transition: { type: "spring", stiffness: 300, damping: 30 }
      })
    }
  
    return (
      <div className="container mx-auto py-16">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center "
          >
            <Badge
                className="text-muted bg-secondary text-3xl px-4 py-2 rounded-full"
                style={{ transform: 'translateY(-50%)' }}
            >
                Featured Properties
            </Badge>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Don't miss out on these high-potential properties closing soon
            </p>  
          </motion.div>
  
          <div className="relative">
            {/* Properties Container */}
            <div 
              ref={containerRef}
              className="overflow-hidden"
            >
              <motion.div
                drag="x"
                dragConstraints={{
                  left: -((totalSlides - 1) * (containerRef.current?.offsetWidth || 0)),
                  right: 0
                }}
                dragElastic={0.1}
                dragMomentum={false}
                animate={controls}
                onDragEnd={handleDragEnd}
                style={{ touchAction: "pan-y" }}
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
            <div className="flex justify-center items-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    controls.start({
                      x: -index * (containerRef.current?.offsetWidth || 0),
                      transition: { type: "spring", stiffness: 300, damping: 30 }
                    })
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-primary w-6' 
                      : 'bg-primary/20'
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
  );
}