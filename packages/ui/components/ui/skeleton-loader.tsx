import { Skeleton } from './skeleton'
import { Card, CardContent, CardHeader } from './card'

export type SkeletonViewType = 'table' | 'dashboard' | 'form' | 'details'

interface SkeletonLoaderProps {
  viewType: SkeletonViewType
}

export function SkeletonLoader({ viewType }: SkeletonLoaderProps) {
  return (
    <div className="h-full p-6 space-y-6">
      {/* Header area */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      {viewType === 'dashboard' && (
        <>
          {/* Metrics area */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-[100px] mb-2" />
                  <Skeleton className="h-8 w-[80px]" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity and Deadlines area */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-[100px] mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
              </CardHeader>
              <CardContent>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-[100px] mt-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {viewType === 'table' && (
        <>
          {/* Search and filters area */}
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>

          {/* Table area */}
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Table header */}
                <div className="grid grid-cols-6 gap-4 border-b pb-2">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
                
                {/* Table rows */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4 py-3 border-b">
                    <Skeleton className="h-6 w-[90%]" />
                    <Skeleton className="h-6 w-[70%]" />
                    <Skeleton className="h-6 w-[60%]" />
                    <Skeleton className="h-6 w-[50%]" />
                    <Skeleton className="h-6 w-[80%]" />
                    <Skeleton className="h-6 w-[40%]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination area */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-[100px]" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </>
      )}

      {viewType === 'form' && (
        <>
          {/* Form area */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <div className="pt-4">
                  <Skeleton className="h-10 w-[120px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {viewType === 'details' && (
        <>
          {/* Details area */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-6 w-[90%]" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-[100px]" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 