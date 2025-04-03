export default function Loading() {
  return (
    <div className="z-10 flex h-full min-h-[calc(100vh-8rem)] w-full flex-col items-center justify-center gap-8 pt-16 *:z-10">
      <div className="h-24 w-24 animate-spin rounded-full border-4 border-solid border-gray-200 border-t-gray-900" />
      <div className="text-2xl font-bold text-gray-900">loading...</div>
    </div>
  );
}
