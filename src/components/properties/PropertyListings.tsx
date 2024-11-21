'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building,
  Building2,
  ChevronLeft,
  ChevronRight,
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
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

import { PurchaseButton } from '../purchasing/PurchaseButton'

// Constants for filtering
const ITEMS_PER_PAGE = 10
const PROPERTY_TYPES = ['all', 'house', 'apartment', 'commercial']
const LOCATIONS = [
  'all',
  'New York, NY',
  'Miami, FL',
  'Chicago, IL',
  'San Francisco, CA',
  'Los Angeles, CA',
  'Austin, TX',
  'Boston, MA',
  'Seattle, WA',
]

export default function PropertyListings() {
  // State
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
    minPrice: 0,
    maxPrice: 5000000,
    fundingStatus: 'all',
  })

  // Fetch properties using React Query
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties')
      return response.json()
    },
  })

  // Filter properties
  const filteredProperties =
    propertiesData?.properties.filter(
      (property: {
        type: string
        location: string
        price: number
        funded: any
      }) => {
        if (filters.type !== 'all' && property.type !== filters.type)
          return false
        if (
          filters.location !== 'all' &&
          property.location !== filters.location
        )
          return false
        if (
          property.price < filters.minPrice ||
          property.price > filters.maxPrice
        )
          return false
        if (filters.fundingStatus !== 'all') {
          if (filters.fundingStatus === 'funded' && !property.funded)
            return false
          if (filters.fundingStatus === 'funding' && property.funded)
            return false
        }
        return true
      }
    ) || []

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  const currentProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const getPropertyIcon = (type: any) => {
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
    <div className="container mx-auto py-20">
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.location}
          onValueChange={(value) => setFilters({ ...filters, location: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.fundingStatus}
          onValueChange={(value) =>
            setFilters({ ...filters, fundingStatus: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Funding Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="funded">Funded</SelectItem>
            <SelectItem value="funding">In Progress</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-col gap-2">
          <span className="text-sm">Price Range</span>
          <Slider
            defaultValue={[filters.minPrice, filters.maxPrice]}
            max={5000000}
            step={100000}
            onValueChange={([min, max]) =>
              setFilters({ ...filters, minPrice: min, maxPrice: max })
            }
          />
        </div>
      </div>

      {/* Properties Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading ? (
          // Loading skeleton
          [...Array(6)].map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              variants={itemVariants}
              className="h-full"
            >
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <div className="relative aspect-video animate-pulse rounded-t-lg bg-muted" />
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-2 h-6 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <AnimatePresence mode="wait">
            {currentProperties.map(
              (property: {
                id: React.Key | null | undefined
                images: (string | undefined)[]
                title:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | Promise<React.AwaitedReactNode>
                  | null
                  | undefined
                funded: any
                type: any
                location:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | Promise<React.AwaitedReactNode>
                  | null
                  | undefined
                price: string | number | bigint
                currentFunding: number
                fundingGoal: number
                roi:
                  | string
                  | number
                  | bigint
                  | boolean
                  | React.ReactElement<
                      any,
                      string | React.JSXElementConstructor<any>
                    >
                  | Iterable<React.ReactNode>
                  | React.ReactPortal
                  | Promise<React.AwaitedReactNode>
                  | null
                  | undefined
              }) => (
                <motion.div
                  key={property.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  layout
                  className="h-full"
                >
                  <Card className="flex h-full flex-col transition-shadow duration-300 hover:shadow-lg">
                    <CardHeader className="p-0">
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <motion.img
                          src={property.images[0]}
                          alt={property.title?.toString()}
                          className="h-full w-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        <Badge
                          className={`absolute right-2 top-2 ${
                            property.funded ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                        >
                          {property.funded ? 'Funded' : 'Funding'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <CardTitle className="text-xl">
                          {property.title}
                        </CardTitle>
                        {getPropertyIcon(property.type)}
                      </div>

                      <div className="mb-2 flex items-center text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span className="text-sm">{property.location}</span>
                      </div>

                      <div className="mb-4 flex items-center text-xl font-bold">
                        <DollarSign className="h-5 w-5" />
                        {new Intl.NumberFormat('en-US').format(
                          Number(property.price)
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>Funding Progress</span>
                            <span>
                              {Math.round(
                                (property.currentFunding /
                                  property.fundingGoal) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (property.currentFunding / property.fundingGoal) *
                              100
                            }
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            <span>Expected ROI</span>
                          </div>
                          <span className="font-semibold text-green-500">
                            {property.roi}%
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2 pt-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="w-full"
                      >
                        <Button
                          className="w-full"
                          variant={property.funded ? 'secondary' : 'default'}
                        >
                          {property.funded
                            ? 'See what you missed!'
                            : 'View Details'}
                        </Button>
                      </Link>
                      {property && !property.funded && (
                        <PurchaseButton
                          property={{
                            ...property,
                            title: property.title?.toString() || '',
                            price: Number(property.price),
                          }}
                        />
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <motion.div
          className="mt-8 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? 'default' : 'outline'}
              size="icon"
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* No results message */}
      {!isLoading && filteredProperties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 text-center"
        >
          <h3 className="mb-2 text-xl font-semibold">No properties found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more results
          </p>
        </motion.div>
      )}
    </div>
  )
}
