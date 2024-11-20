import type { Meta, StoryObj } from '@storybook/react';
import PropertyListings from './PropertyListings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../theme/ThemeProvider';

// Create a QueryClient instance
const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries for stories
        retry: false,
        // Disable refetching
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  });

// Mock data
const mockProperties = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    type: 'apartment',
    location: 'New York, NY',
    price: 750000,
    funded: false,
    currentFunding: 500000,
    fundingGoal: 750000,
    roi: 12,
    images: ['/api/placeholder/800/600'],
  },
  {
    id: '2',
    title: 'Luxury Beach House',
    type: 'house',
    location: 'Miami, FL',
    price: 1200000,
    funded: true,
    currentFunding: 1200000,
    fundingGoal: 1200000,
    roi: 15,
    images: ['/api/placeholder/800/600'],
  },
  {
    id: '3',
    title: 'Commercial Office Space',
    type: 'commercial',
    location: 'Chicago, IL',
    price: 2500000,
    funded: false,
    currentFunding: 1500000,
    fundingGoal: 2500000,
    roi: 18,
    images: ['/api/placeholder/800/600'],
  },
  // Add more mock properties to test pagination...
];

const meta: Meta<typeof PropertyListings> = {
  title: 'Pages/PropertyListings',
  component: PropertyListings,
  parameters: {
    layout: 'fullscreen',
    // Add mock data handlers
    mockData: [
      {
        url: '/api/properties',
        method: 'GET',
        status: 200,
        response: { properties: mockProperties },
      },
    ],
  },
  // Add providers through decorators
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <Story />
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PropertyListings>;

// Default state
export const Default: Story = {};

// Loading state
export const Loading: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/properties',
        method: 'GET',
        status: 200,
        response: { properties: mockProperties },
        delay: 2000, // Add delay to show loading state
      },
    ],
  },
};

// Empty state
export const NoResults: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/properties',
        method: 'GET',
        status: 200,
        response: { properties: [] },
      },
    ],
  },
};

// Filtered results
export const FilteredByType: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/properties',
        method: 'GET',
        status: 200,
        response: {
          properties: mockProperties.filter(p => p.type === 'apartment'),
        },
      },
    ],
  },
};

// Error state
export const Error: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/properties',
        method: 'GET',
        status: 500,
        response: { error: 'Failed to fetch properties' },
      },
    ],
  },
};

// Add documentation
export const Documentation: Story = {
  parameters: {
    docs: {
      description: {
        component: `
# Property Listings Component

Displays a grid of property listings with filtering and pagination capabilities.

## Features
- Property type filtering
- Location filtering
- Price range filtering
- Funding status filtering
- Responsive grid layout
- Pagination
- Loading states
- Empty states
- Error handling

## Usage
\`\`\`tsx
import PropertyListings from '@/components/properties/PropertyListings';

export default function PropertiesPage() {
  return <PropertyListings />;
}
\`\`\`

## Technical Details
- Uses React Query for data fetching
- Implements Framer Motion for animations
- Uses shadcn/ui components
- Responsive design with Tailwind CSS
`,
      },
    },
  },
};