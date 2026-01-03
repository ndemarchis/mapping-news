export default function Loading() {
  return (
    <div className="z-10 flex h-full min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-8 pt-16 *:z-10">
      <div
        className="h-24 w-24 animate-spin rounded-full border-4 border-solid border-[color:var(--color-border-strong)] border-t-[color:var(--color-accent)]"
        aria-label="Loading spinner"
      />
      <div className="text-2xl font-bold text-primary">loading...</div>
    </div>
  );
}
