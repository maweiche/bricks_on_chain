import { StateCreator } from 'zustand'

export interface CartItem {
  propertyId: string
  propertyTitle: string
  fractionCount: number
  pricePerFraction: number
  totalAmount: number
}

export interface CartSlice {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'totalAmount'>) => void
  removeItem: (propertyId: string) => void
  updateItemCount: (propertyId: string, fractionCount: number) => void
  clearCart: () => void
  setIsOpen: (isOpen: boolean) => void
  getTotalAmount: () => number
  getTotalFractions: () => number
}

export const createCartSlice: StateCreator<CartSlice> = (set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.propertyId === item.propertyId
      )

      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.propertyId === item.propertyId
              ? {
                  ...i,
                  fractionCount: i.fractionCount + item.fractionCount,
                  totalAmount:
                    (i.fractionCount + item.fractionCount) *
                    item.pricePerFraction,
                }
              : i
          ),
        }
      }

      return {
        items: [
          ...state.items,
          {
            ...item,
            totalAmount: item.fractionCount * item.pricePerFraction,
          },
        ],
      }
    }),

  removeItem: (propertyId) =>
    set((state) => ({
      items: state.items.filter((item) => item.propertyId !== propertyId),
    })),

  updateItemCount: (propertyId, fractionCount) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.propertyId === propertyId
          ? {
              ...item,
              fractionCount,
              totalAmount: fractionCount * item.pricePerFraction,
            }
          : item
      ),
    })),

  clearCart: () => set({ items: [] }),

  setIsOpen: (isOpen) => set({ isOpen }),

  getTotalAmount: () => {
    const { items } = get()
    return items.reduce((total, item) => total + item.totalAmount, 0)
  },

  getTotalFractions: () => {
    const { items } = get()
    return items.reduce((total, item) => total + item.fractionCount, 0)
  },
})
