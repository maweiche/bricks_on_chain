'use client'

import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  DollarSign,
  Edit,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'

import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export default function PropertyAdmin() {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProperty, setNewProperty] = useState({
    id: '',
    title: '',
    description: '',
    location: '',
    price: 0,
    type: 'house',
    images: ['https://loremflickr.com/200/200'],
    funded: false,
    fundingGoal: 0,
    currentFunding: 0,
    roi: 0,
  })

  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await fetch('/api/properties')
      return res.json()
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch('/api/properties/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error('Failed to delete properties')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast({
        title: 'Success',
        description: 'Properties deleted successfully',
      })
      setSelectedProperties([])
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete properties',
        variant: 'destructive',
      })
    },
  })

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (propertyData: typeof newProperty) => {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      })
      if (!res.ok) throw new Error('Failed to add property')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast({
        title: 'Success',
        description: 'Property added successfully',
      })
      setIsAddDialogOpen(false)
      setNewProperty({
        id: '',
        title: '',
        description: '',
        location: '',
        price: 0,
        type: 'house',
        images: ['https://loremflickr.com/200/200'],
        funded: false,
        fundingGoal: 0,
        currentFunding: 0,
        roi: 0,
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add property',
        variant: 'destructive',
      })
    },
  })

  const handleSelectProperty = (id: string) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleDeleteSelected = () => {
    if (
      window.confirm('Are you sure you want to delete the selected properties?')
    ) {
      deleteMutation.mutate(selectedProperties)
    }
  }

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault()
    addMutation.mutate(newProperty)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Property Management</h1>
        <div className="space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProperty} className="space-y-4">
                <Input
                  placeholder="Title"
                  value={newProperty.title}
                  onChange={(e) =>
                    setNewProperty((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <Textarea
                  placeholder="Description"
                  value={newProperty.description}
                  onChange={(e: { target: { value: any } }) =>
                    setNewProperty((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                {/* Add other fields as needed */}
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Add Property'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {selectedProperties.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Selected
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={
                    selectedProperties.length === properties?.properties.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProperties(
                        properties?.properties.map((p: any) => p.id) || []
                      )
                    } else {
                      setSelectedProperties([])
                    }
                  }}
                  className="rounded"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : properties?.properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <p className="text-muted-foreground">No properties found</p>
                  </TableCell>
                </TableRow>
              ) : (
                properties?.properties.map((property: any) => (
                  <motion.tr
                    key={property.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group"
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProperties.includes(property.id)}
                        onChange={() => handleSelectProperty(property.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {property.title}
                    </TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>${property.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          property.funded
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {property.funded ? 'Funded' : 'In Progress'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setNewProperty(property)
                            setIsAddDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleSelectProperty(property.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Property Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {newProperty.id ? 'Edit Property' : 'Add New Property'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProperty} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Property Title"
                    value={newProperty.title}
                    onChange={(e) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="Property Location"
                    value={newProperty.location}
                    onChange={(e) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newProperty.type}
                    onValueChange={(value) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    placeholder="Property Price"
                    value={newProperty.price}
                    onChange={(e) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Funding Goal</label>
                  <Input
                    type="number"
                    placeholder="Funding Goal"
                    value={newProperty.fundingGoal}
                    onChange={(e) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        fundingGoal: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Current Funding</label>
                  <Input
                    type="number"
                    placeholder="Current Funding"
                    value={newProperty.currentFunding}
                    onChange={(e) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        currentFunding: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">ROI (%)</label>
                  <Input
                    type="number"
                    placeholder="Expected ROI"
                    value={newProperty.roi}
                    onChange={(e) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        roi: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={newProperty.funded ? 'funded' : 'funding'}
                    onValueChange={(value) =>
                      setNewProperty((prev) => ({
                        ...prev,
                        funded: value === 'funded',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funding">In Progress</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Property Description"
                className="h-32"
                value={newProperty.description}
                onChange={(e: { target: { value: any } }) =>
                  setNewProperty((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>{newProperty.id ? 'Update' : 'Add'} Property</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
