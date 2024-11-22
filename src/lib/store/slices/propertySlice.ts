import { StateCreator } from 'zustand'

import { Property } from '../types'

export enum Status {
  ACTIVE = 'ACTIVE',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  AVAILABLE = 'available',
  FUNDED = 'funded',
  ALL = 'all',
}

export interface PropertyFilters {
  minPrice?: number
  maxPrice?: number
  location?: string
  type?: string
  status?: Status
}

export interface PropertySlice {
  properties: Property[]
  selectedProperty: Property | null
  filters: PropertyFilters
  loading: boolean
  error: string | null

  setProperties: (properties: Property[]) => void
  setSelectedProperty: (property: Property | null) => void
  setFilters: (filters: PropertyFilters) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getFilteredProperties: () => Property[]
}

export const createPropertySlice: StateCreator<PropertySlice> = (set, get) => ({
  properties: [],
  selectedProperty: null,
  filters: {},
  loading: false,
  error: null,

  setProperties: (properties) => set({ properties }),
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getFilteredProperties: () => {
    const { properties, filters } = get()
    return properties.filter((property) => {
      if (filters.minPrice && property.price < filters.minPrice) return false
      if (filters.maxPrice && property.price > filters.maxPrice) return false
      if (filters.location && !property.location.includes(filters.location))
        return false
      if (filters.type && property.type !== filters.type) return false
      if (filters.status) {
        if (filters.status === 'available' && property.funded) return false
        if (filters.status === 'funded' && !property.funded) return false
      }
      return true
    })
  },
})
