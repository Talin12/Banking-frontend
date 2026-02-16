export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg bg-elite-card ${className}`}
      {...props}
    />
  );
}

export function SkeletonBalance() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-48" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-elite-border p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
