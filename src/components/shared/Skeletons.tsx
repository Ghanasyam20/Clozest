import { cn } from "@/utils/cn";

function Bone({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function ClothingCardSkeleton() {
  return (
    <div className="space-y-3">
      <Bone className="aspect-[3/4] rounded-2xl" />
      <div className="px-1 space-y-2">
        <Bone className="h-4 w-3/4" />
        <Bone className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ClothingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ClothingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <Bone className="h-5 w-5 rounded-full" />
      <Bone className="h-8 w-12" />
      <Bone className="h-4 w-24" />
      <Bone className="h-3 w-16" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <Bone className="h-10 w-64" />
        <Bone className="h-4 w-48" />
      </div>
      <div className="grid md:grid-cols-[280px_1fr] gap-5">
        <Bone className="rounded-2xl h-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[1,2,3,4,5,6].map((i) => (
          <Bone key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
