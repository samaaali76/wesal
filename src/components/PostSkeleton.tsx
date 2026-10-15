export default function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-800" />
        <div className="grid gap-2">
          <div className="h-3 w-28 rounded bg-neutral-800" />
          <div className="h-2 w-20 rounded bg-neutral-800" />
        </div>
      </div>
      <div className="mb-2 h-3 w-full rounded bg-neutral-800" />
      <div className="h-3 w-2/3 rounded bg-neutral-800" />
    </div>
  );
}