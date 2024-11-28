import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Building,
  Building2,
  DollarSign,
  Home,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProgramPurchaseButton } from './ProgramPurchaseButton'


interface PropertyCardProps {
  property: any
  index: number
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index }) => {
  console.log('PropertyCard -> property', property)
  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'house':
        return <Home className="h-5 w-5" />
      case 'apartment':
        return <Building2 className="h-5 w-5" />
      case 'commercial':
        return <Building className="h-5 w-5" />
      default:
        return <Home className="h-5 w-5" />
    }
  }

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={{
        initial: {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.4,
            delay: index * 0.1,
            ease: [0.43, 0.13, 0.23, 0.96],
          },
        },
      }}
      className="h-full"
    >
      <Card className="group relative flex h-full flex-col overflow-hidden bg-card transition-all duration-500 hover:shadow-xl dark:hover:shadow-primary/5">
        <CardHeader className="p-0">
          <div className="relative aspect-video overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <Image
                src={'/samplehouse.svg'}
                alt={property.name?.toString()}
                className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:brightness-100"
                width={200}
                height={200}
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Badge
              className={`absolute right-3 top-3 ${
                property.funded
                  ? 'bg-green-500/90 backdrop-blur-sm'
                  : 'bg-blue-500/90 backdrop-blur-sm'
              } px-3 py-1 text-sm font-medium tracking-wide shadow-lg transition-transform duration-300 group-hover:scale-105`}
            >
              {property.funded ? 'Funded' : 'Funding'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-xl font-bold tracking-tight">
                {property.title}
              </CardTitle>
            </motion.div>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="rounded-full bg-primary/10 p-2 text-primary"
            >
              {getPropertyIcon(property.type)}
            </motion.div>
          </div>

          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            <span className="text-sm">{property.location}</span>
          </div>

          <div className="flex items-center text-2xl font-bold text-primary">
            <DollarSign className="h-6 w-6" />
            {new Intl.NumberFormat('en-US').format(Number(property.price))}
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Funding Progress</span>
                <motion.span
                  key={property.currentFunding}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-medium text-primary"
                >
                  {Math.round(
                    (property.currentFunding / property.fundingGoal) * 100
                  )}
                  %
                </motion.span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${(property.currentFunding / property.fundingGoal) * 100}%`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span>Expected ROI</span>
              </div>
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="font-semibold text-green-500"
              >
                {property.roi}%
              </motion.span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="grid gap-3 p-6 pt-0">
          <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.98 }}>
            <Link href={`/properties/${property._id}`} className="w-full">
              <Button
                className="w-full border-primary bg-transparent text-primary transition-all duration-300 hover:border-secondary hover:bg-secondary/90 hover:text-white"
                variant="outline"
              >
                {property.funded ? 'See what you missed!' : 'View Details'}
              </Button>
            </Link>
          </motion.div>

          {property && !property.funded && (
            <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.98 }}>
              <ProgramPurchaseButton
                property={property}
              />
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default PropertyCard
