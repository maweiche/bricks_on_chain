'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GET_PROPERTIES } from '@/lib/apollo/graphql'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import PropertyCard from './PropertyCard'
import { useBricksProgram } from '../blockchain/protocolAccess'
import { fetchCollectionV1 } from '@metaplex-foundation/mpl-core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey } from '@metaplex-foundation/umi';
import { set } from 'nprogress'
import ProgramPropertyCard from '../blockchain/components/ProgramPropertyCard'

// Constants
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

interface PropertyFilters {
  type: string
  location: string
  minPrice: number
  maxPrice: number
  fundingStatus: string
}

export default function PropertyListings() {
  const { listings } = useBricksProgram();
  const [currentPage, setCurrentPage] = useState(1)
  const [blockchainProducts, setBlockchainProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>({
    type: 'all',
    location: 'all',
    minPrice: 0,
    maxPrice: 5000000,
    fundingStatus: 'all',
  })
  
  const umi = useMemo(() => 
    createUmi('https://soft-cold-energy.solana-devnet.quiknode.pro/ad0dda04b536ff45a76465f9ceee5eea6a048a8f'),
    []
  );

  const getGraphQLFilters = () => {
    const graphqlFilters: any = {}

    if (filters.type !== 'all') graphqlFilters.type = filters.type.toUpperCase()
    if (filters.location !== 'all') graphqlFilters.location = filters.location
    if (filters.minPrice > 0) graphqlFilters.minPrice = filters.minPrice
    if (filters.maxPrice < 5000000) graphqlFilters.maxPrice = filters.maxPrice
    if (filters.fundingStatus !== 'all') {
      graphqlFilters.funded = filters.fundingStatus === 'funded'
    }

    return Object.keys(graphqlFilters).length > 0 ? graphqlFilters : undefined
  }
  console.log('PropertyListings component rendering')

  const { data, loading } = useQuery(GET_PROPERTIES, {
    variables: {
      filter: getGraphQLFilters(),
      first: ITEMS_PER_PAGE,
      after: currentPage > 1 ? (currentPage - 1) * ITEMS_PER_PAGE : undefined,
    },
  })
  console.log('GraphQL Response:', data)

  // Update how we access the properties
  const properties = data?.properties || []
  const totalPages = properties.length
    ? Math.ceil(properties.length / ITEMS_PER_PAGE)
    : 0

  // Animation variants remain the same
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

  useEffect(() => {
    if (!loading && data) {
      console.log('data from useQuery:', data)
    }
  }, [loading, data])

  // Solana Program UseEffect
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!listings.data) return;
      
      try {
        const productPromises = listings.data.map(async (listing: any) => {
          const productDetails = await fetchCollectionV1(
            umi, 
            publicKey(listing.account.object.toString())
          );
          
          return {
            ...listing,
            details: productDetails,
            type: listing.account.objectType
          };
        });

        const productsWithDetails = await Promise.all(productPromises);
        console.log('Products with details:', productsWithDetails);
        setBlockchainProducts(productsWithDetails);
        // setProducts(productsWithDetails);
        // setLoading(false);
      } catch (error) {
        console.error('Error fetching product details:', error);
        // setLoading(false);
      }
    };

    fetchProductDetails();
  }, [listings.data, umi]);

  return (
    <div className="container mx-auto py-20">
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-black">Property Type</span>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all'
                    ? 'All Types'
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Location
          </span>
          <Select
            value={filters.location}
            onValueChange={(value) =>
              setFilters({ ...filters, location: value })
            }
          >
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Funding Status
          </span>
          <Select
            value={filters.fundingStatus}
            onValueChange={(value) =>
              setFilters({ ...filters, fundingStatus: value })
            }
          >
            <SelectTrigger className="bg-white text-black">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="funding">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Price Range
          </span>
          <div className="flex flex-col gap-1">
            <Slider
              defaultValue={[filters.minPrice, filters.maxPrice]}
              max={5000000}
              step={100000}
              onValueChange={([min, max]) =>
                setFilters({ ...filters, minPrice: min, maxPrice: max })
              }
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                ${new Intl.NumberFormat('en-US').format(filters.minPrice)}
              </span>
              <span>
                ${new Intl.NumberFormat('en-US').format(filters.maxPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {!loading && blockchainProducts.length > 0 && blockchainProducts.map((property: any, index: number) => (
          <ProgramPropertyCard
            key={property.id}
            property={property}
            index={index}
          />
        ))}
        {loading ? (
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
            {properties.map((property: any, index: number) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
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
      {!loading && properties.length === 0 && (
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
