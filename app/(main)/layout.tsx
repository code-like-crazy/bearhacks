type Props = {
  children: React.ReactNode;
};

const MainLayout = (props: Props) => {
  return (
    <div className="flex min-h-svh bg-gray-50">
      {/* sidebar */}
      <aside className="fixed z-30 h-svh w-80 bg-gray-50 max-lg:hidden"></aside>

      {/* main content */}
      <main className="mt-4 flex h-full min-h-[calc(100svh-1rem)] flex-1 rounded-tl-2xl border bg-white lg:ml-80">
        {props.children}
      </main>
    </div>
  );
};

export default MainLayout;
