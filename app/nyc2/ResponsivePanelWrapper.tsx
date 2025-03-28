const ResponsivePanelWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="z-10 h-[80vh] w-full max-w-xl overflow-scroll bg-white md:h-[calc(100vh-12rem)] md:p-4">
      {children}
    </div>
  );
};

export default ResponsivePanelWrapper;
