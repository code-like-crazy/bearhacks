import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar/index";

type Props = {
  children: React.ReactNode;
};

const MainLayout = (props: Props) => {
  return (
    <div className="flex min-h-svh bg-white">
      <Sidebar />
      <Navbar />

      {/* main content */}
      <main className="flex h-full min-h-svh flex-1 lg:ml-80">
        {props.children}
      </main>
    </div>
  );
};

export default MainLayout;
