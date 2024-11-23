'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Building,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  MapPin,
  Share2,
  Users,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useCopy } from '@/hooks/use-copy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WalletButton } from '@/components/providers'

import { PurchaseDialog } from '../purchasing/PurchaseDialog'
import ROISimulationChart from './PropertyRoiSimChart'

// Mock data for the property value history
const valueHistory = [
  { month: 'Jan', value: 750000 },
  { month: 'Feb', value: 765000 },
  { month: 'Mar', value: 780000 },
  { month: 'Apr', value: 785000 },
  { month: 'May', value: 795000 },
  { month: 'Jun', value: 810000 },
]

// Mock data for investor distribution
const investorDistribution = [
  { type: 'Individual Investors', percentage: 45 },
  { type: 'Institutional', percentage: 35 },
  { type: 'Property Manager', percentage: 20 },
]

export default function PropertyDetails({ id }: { id: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { copyToClipboard } = useCopy(`${window.location.origin}/properties/${id}`)
  // Fetch property details
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) throw new Error('Failed to fetch property');
      return res.json();
    },
  });

  const handleInvest = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to invest",
        variant: "destructive",
      });
      return;
    }
  
    if (!user) {
      toast({
        title: "Wallet Error",
        description: "No wallet connected",
        variant: "destructive",
      });
      return;
    }
  
    if (!property) {
      toast({
        title: "Error",
        description: "Property data not available",
        variant: "destructive",
      });
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      // Set default fraction count and calculate amounts
      const fractionCount = 1; // Default to 1 fraction
      const pricePerFraction = Math.floor(property.price / 100); // Assuming 100 fractions per property, ensure it's a number
      const totalAmount = pricePerFraction * fractionCount;
  
      // Log the values to verify them
      console.log('Purchase Data:', {
        propertyId: property.id,
        propertyTitle: property.title,
        fractionCount,
        pricePerFraction,
        totalAmount,
        wallet: user.address
      });
  
      // Prepare purchase data matching the Zod schema
      const purchaseData = {
        propertyId: property.id,
        propertyTitle: property.title,
        fractionCount: fractionCount,
        pricePerFraction: pricePerFraction,
        totalAmount: totalAmount,
        wallet: user.address,
      };
  
      const response = await fetch(`/api/properties/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete purchase');
      }
  
      const result = await response.json();
      console.log('Purchase Result:', result);
  
      toast({
        title: "Purchase Successful",
        description: `Successfully invested ${fractionCount} fraction(s) in ${property.title}`,
      });
  
      // Refetch property data to update UI
      refetch();
  
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : 'Failed to complete purchase',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPropertyIcon = (type?: string) => {
    switch (type) {
      case 'house':
        return <Home className="h-6 w-6" />
      case 'apartment':
        return <Building2 className="h-6 w-6" />
      case 'commercial':
        return <Building className="h-6 w-6" />
      default:
        return <Home className="h-6 w-6" />
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-8 py-8">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    )
  }

  const property = data?.property;

  return (
    <div className="container mx-auto py-20">
      {/* Image Gallery */}
      <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={property.images[currentImageIndex]}
            alt={property?.title}
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
        </motion.div>

        {/* Image Navigation */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-4">
          {property?.images.map((_: any, index: number) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
          onClick={() =>
            setCurrentImageIndex((i) =>
              i > 0 ? i - 1 : property?.images.length - 1
            )
          }
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40"
          onClick={() =>
            setCurrentImageIndex((i) =>
              i < property?.images.length - 1 ? i + 1 : 0
            )
          }
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">
                {property?.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{property?.location}</span>
                </div>
                <Badge variant="secondary">
                  {getPropertyIcon(property?.type)}
                  <span className="ml-1 capitalize">{property?.type}</span>
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={()=> copyToClipboard()}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="investors">Investors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">
                    {property?.description}
                  </p>
                </CardContent>
              </Card>
              <ROISimulationChart expectedROI={property?.roi} />
            </TabsContent>

            <TabsContent value="financials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-secondary/10 p-4">
                      <div className="mb-1 text-sm text-muted-foreground">
                        Purchase Price
                      </div>
                      <div className="text-2xl font-bold">
                        ${property?.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg bg-secondary/10 p-4">
                      <div className="mb-1 text-sm text-muted-foreground">
                        Expected ROI
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {property?.roi}%
                      </div>
                    </div>
                    <div className="rounded-lg bg-secondary/10 p-4">
                      <div className="mb-1 text-sm text-muted-foreground">
                        Minimum Investment
                      </div>
                      <div className="text-2xl font-bold">$5,000</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Property Value History</CardTitle>
                  <CardDescription>
                    Historical property valuation over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={valueHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2D3142"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Property Appraisal Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Financial Projections
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Legal Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Investor Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investorDistribution.map((item) => (
                      <div key={item.type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.type}</span>
                          <span className="font-medium">
                            {item.percentage}%
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Investment Card */}
<div className="lg:row-start-1">
  <Card className="sticky top-8">
    <CardHeader>
      <CardTitle>Investment Overview</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Funding Progress</div>
        <Progress 
          value={(property?.currentFunding / property?.fundingGoal) * 100} 
          className="h-2" 
        />
        <div className="flex justify-between text-sm">
          <span>${property?.currentFunding.toLocaleString()} raised</span>
          <span>${property?.fundingGoal.toLocaleString()} goal</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Min. Investment</span>
          <span className="font-medium">$5,000</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Expected ROI</span>
          <span className="font-medium text-green-600">{property?.roi}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Investment Term</span>
          <span className="font-medium">36 months</span>
        </div>
      </div>

      {!isAuthenticated ? (
        <WalletButton className="w-full" />
      ) : (
        <div className="space-y-3">
          {/* Instant Purchase Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleInvest}
            disabled={property?.funded || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : property?.funded ? 'Fully Funded' : 'Instant Purchase'}
          </Button>

          {/* Advanced Purchase Button */}
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => setIsPurchaseDialogOpen(true)}
            disabled={property?.funded}
          >
            More Options
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>{Math.floor(Math.random() * 50) + 20} investors</span>
        <span>•</span>
        <Calendar className="w-4 h-4" />
        <span>{Math.floor(Math.random() * 20) + 5} days left</span>
      </div>
    </CardContent>
  </Card>

  {/* Purchase Dialog */}
  <PurchaseDialog
    isOpen={isPurchaseDialogOpen}
    onClose={() => setIsPurchaseDialogOpen(false)}
    property={property}
  />
</div>
      </div>
    </div>
  )
}
