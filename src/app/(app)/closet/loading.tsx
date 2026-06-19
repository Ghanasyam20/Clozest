import { SkeletonGrid } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 skeleton rounded-lg" />
      <SkeletonGrid count={10} />
    </div>
  );
}
