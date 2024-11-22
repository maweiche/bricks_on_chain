import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Status } from '@/lib/store/slices/proposalSlice'

interface ProposalsFiltersProps {
  filters: {
    search: string
    status: string
    type: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  onFilterChange: (key: string, value: string) => void
}

export function ProposalsFilters({
  filters,
  onFilterChange,
}: ProposalsFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <Input
        placeholder="Search proposals..."
        value={filters.search}
        onChange={(e) => onFilterChange('search', e.target.value)}
        className="max-w-xs"
      />

      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange('status', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value={Status.ACTIVE}>Active</SelectItem>
          <SelectItem value={Status.PASSED}>Passed</SelectItem>
          <SelectItem value={Status.REJECTED}>Rejected</SelectItem>
          <SelectItem value={Status.EXPIRED}>Expired</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.type}
        onValueChange={(value) => onFilterChange('type', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="PROPERTY_IMPROVEMENT">
            Property Improvement
          </SelectItem>
          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          <SelectItem value="POLICY_CHANGE">Policy Change</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy}
        onValueChange={(value) => onFilterChange('sortBy', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created Date</SelectItem>
          <SelectItem value="endDate">End Date</SelectItem>
          <SelectItem value="votingPower">Voting Power</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sortOrder}
        onValueChange={(value: 'asc' | 'desc') =>
          onFilterChange('sortOrder', value)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
