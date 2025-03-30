import { Cat } from "lucide-react";

import { cn } from "@/lib/utils";

import CreateBoardModal from "../modals/CreateBoardModal";
import JoinBoardModal from "../modals/JoinBoardModal";
import SidebarUser from "./SidebarUser";

const Sidebar = ({ className }: { className?: string }) => {
  return (
    <aside
      className={cn(
        "fixed z-30 h-svh w-72 border-r bg-white max-lg:hidden",
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Main content */}
        <div className="flex flex-col gap-12 p-6">
          {/* logo */}
          <div className="flex items-center gap-2 font-black tracking-wider">
            <Cat strokeWidth={3} />
            PiCK
          </div>

          {/* Modal buttons */}
          <div className="flex flex-col gap-2.5">
            <CreateBoardModal />
            <JoinBoardModal />
          </div>

          {/* List of boards */}
          <div className="text-muted-foreground space-y-2 text-sm font-semibold">
            <p>Recent boards</p>
            <div className="flex flex-col gap-2"></div>
          </div>
        </div>

        {/* User management */}
        <SidebarUser />
      </div>
    </aside>
  );
};

export default Sidebar;
