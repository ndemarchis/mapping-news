const ResponsivePanelWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="z-10 w-full max-w-xl bg-white md:h-[calc(100vh-12rem)] md:p-4">
      {children}
    </div>
  );
};

export default ResponsivePanelWrapper;
