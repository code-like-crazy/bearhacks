import { cn } from "@/lib/utils";

const Sidebar = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "fixed z-30 h-svh w-80 border-r bg-white max-lg:hidden",
        className,
      )}
    >
      Sidebar
    </div>
  );
};

export default Sidebar;
