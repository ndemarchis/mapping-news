export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-6rem)] w-full flex-col items-center justify-center pt-16">
      {children}
    </div>
  );
}
