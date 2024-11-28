# Real Estate Crowdfunding Platform

A modern web application that enables users to invest in fractional ownership of real estate properties using blockchain technology. Built with Next.js, TypeScript, and Solana integration.

## 🚨 Live Demo Link
https://bricks-on-chain.vercel.app/

**Please note, since the demo utilizes mock JSON DB and the FileSystem to write the actions are not live on Vercel, but available locally **

### Mobile

![Mobile View](/public/readme/Mobile.gif)

### Desktop

![Mobile View](/public/readme/Desktop.gif)

## 👾 Solana Program Repo
https://github.com/maweiche/bricks_protocol

## 🌳 Branches

### Main/local

This is what is currently deployed via Vercel. It uses a local JSON mock db located in the /data directory.

### MongoDB

Integrates a live MongoDB used for the Property Listings and Details.

### Solana

Integrates Fractionalized Purchasing of a Property on-chain with a custom Solana Program designed specifically for this demo.

## 🌟 Features

### Core Functionality
- Property browsing and detailed viewing
- Fractional investment capabilities
- Portfolio tracking and management
- User authentication via Solana wallets
- Dark/light mode theming
- Responsive design for all devices
- Admin Panel to manage users/properties/governance proposals
- Governance page for creating/viewing/voting on proposals

### Technical Highlights
- Server-side rendering with Next.js
- Type-safe development with TypeScript
- Solana blockchain integration
- Real-time state management
- Performant animations with Framer Motion
- Accessible UI components

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: 
  - Zustand for client state
  - TanStack Query for server state
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Blockchain
- Solana Web3.js for blockchain interactions
- Phantom Wallet integration
- Anchor framework support

### Development Tools
- ESLint for code quality
- Prettier for code formatting
- TypeScript for type safety

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

(For solana branch)
- Solana wallet (e.g., Phantom Wallet)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/maweiche/bricks_on_chain.git
cd real-estate-crowdfunding
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file if working on mongodb or solana branch:
```
# Connects to your MongoDB instance
MONGODB_URI=
# This is the 'feeKey' used to pay for Gas on Solana txn
PRIVATE_KEY=
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## 🔒 Authentication

The platform uses Solana wallet-based authentication:

1. Users connect their Solana wallet (Phantom, Solflare, or Torus)
2. Wallet address is used as the unique identifier
3. User profiles are created/retrieved based on the wallet address
4. Role-based access control (user/admin) is implemented

## 🎨 Theming

The application supports:
- Light and dark mode
- System preference detection
- Smooth theme transitions
- Custom color palette
- Consistent styling through Tailwind CSS

## 🏗 Architecture

### State Management
- **Zustand Store Slices**:
  - `authSlice`: User authentication state
  - `propertySlice`: Property listing and filtering
  - `userSlice`: User data and investments
  - `settingsSlice`: User preferences

### Component Architecture
- Modular component design
- Separation of concerns
- Reusable UI components
- Error boundaries for resilience

## Mock API Setup for Local Development

### Overview
The application uses a mock API system for local development, combining Zustand for state management with JSON files acting as a mock database. This setup allows developers to work without requiring a backend server.

### Directory Structure
```
/data/
  ├── properties.json   # Property listings and details
  ├── proposals.json    # Governance proposals
  ├── settings.json     # Global application settings
  └── users.json        # User profiles and data
```

### API Routes Configuration
Our API routes are structured in the `/api` directory with the following endpoints:

```typescript
/api
  ├── admin/settings     // Admin configuration endpoints
  ├── checkout           // Investment transaction endpoints
  ├── graphql           // GraphQL endpoint for complex queries
  ├── properties        // Property management endpoints
  │   ├── [id]         // Single property operations
  │   └── bulk-delete   // Bulk property management
  ├── proposals         // Governance proposal endpoints
  │   ├── [id]         // Single proposal operations
  │   └── bulk-delete   // Bulk proposal management
  ├── protocol/buy      // Investment protocol endpoints
  └── users             // User management endpoints
      ├── [userId]      // Single user operations
      └── bulk-delete   // Bulk user management
```

### Usage Example

#### 1. Setting Up Mock Data
Create or modify JSON files in the `/data` directory:

```json
// data/properties.json
{
  "properties": [
    {
      "id": "prop_1",
      "title": "Downtown Apartment Complex",
      "price": 1500000,
      "location": "New York, NY",
      "type": "apartment",
      "fundingGoal": 2000000,
      "currentFunding": 750000,
      "roi": 12.5
    }
  ]
}
```

#### 2. API Route Implementation
Create corresponding API routes that interact with the mock data:

```typescript
// api/properties/route.ts
import { NextResponse } from 'next/server'
import propertiesData from '@/data/properties.json'

export async function GET() {
  return NextResponse.json(propertiesData)
}

export async function POST(request: Request) {
  const body = await request.json()
  // Implement create logic
  return NextResponse.json({ success: true })
}
```

#### 3. Zustand Store Integration
Connect the mock API with Zustand stores:

```typescript
import { create } from 'zustand'
import { Property } from '@/types'

interface PropertyState {
  properties: Property[]
  fetchProperties: () => Promise<void>
  addProperty: (property: Property) => Promise<void>
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  
  fetchProperties: async () => {
    const response = await fetch('/api/properties')
    const data = await response.json()
    set({ properties: data.properties })
  },
  
  addProperty: async (property) => {
    const response = await fetch('/api/properties', {
      method: 'POST',
      body: JSON.stringify(property)
    })
    if (response.ok) {
      set((state) => ({
        properties: [...state.properties, property]
      }))
    }
  }
}))
```

#### 4. Using in Components
Implement the store in your React components:

```typescript
import { usePropertyStore } from '@/lib/store'

export function PropertyList() {
  const { properties, fetchProperties } = usePropertyStore()
  
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])
  
  return (
    <div>
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
```

## Development Guidelines

1. **API Structure**: Follow REST conventions for consistency:
   - GET /api/properties - List all properties
   - GET /api/properties/[id] - Get single property
   - POST /api/properties - Create property
   - PUT /api/properties/[id] - Update property
   - DELETE /api/properties/[id] - Delete property

2. **Type Safety**: Maintain TypeScript interfaces for all data structures:

```typescript
interface Property {
  id: string
  title: string
  price: number
  location: string
  type: string
  fundingGoal: number
  currentFunding: number
  roi: number
}
```

## 🙏 Acknowledgments

- [Solana](https://solana.com/) - Blockchain platform
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TanStack Query](https://tanstack.com/query) - Server state management
- [Zustand](https://github.com/pmndrs/zustand) - Client state management
- [Framer Motion](https://www.framer.com/motion/) - Animation library