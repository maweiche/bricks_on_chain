import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProposalCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-6 w-[80px]" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-[120px]" />
          <Skeleton className="h-6 w-[160px]" />
          <Skeleton className="h-6 w-[100px]" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[50px]" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[40px]" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[40px]" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[112px]" />
          <Skeleton className="h-10 w-[112px]" />
        </div>
        <Skeleton className="h-4 w-[120px]" />
      </CardFooter>
    </Card>
  )
}
