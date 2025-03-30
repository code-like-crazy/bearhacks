"use client";

import { Cat } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

import CreateBoardModal from "../modals/CreateBoardModal";
import JoinBoardModal from "../modals/JoinBoardModal";
import RecentBoards from "./RecentBoards";
import SidebarUser from "./SidebarUser";

const Sidebar = ({ className }: { className?: string }) => {
  return (
    <motion.aside
      initial={{ x: -288 }} // width of sidebar (72*4)
      animate={{ x: 0 }}
      transition={{ type: "spring", duration: 0.5 }}
      className={cn(
        "fixed z-30 h-svh w-72 border-r bg-white max-lg:hidden",
        className,
      )}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Main content */}
        <div className="flex flex-col gap-12 p-6">
          {/* logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 font-black tracking-wider"
          >
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", duration: 0.5, delay: 0.3 }}
            >
              <Cat strokeWidth={3} />
            </motion.div>
            PiCK
          </motion.div>

          {/* Modal buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-2.5"
          >
            <CreateBoardModal />
            <JoinBoardModal />
          </motion.div>

          {/* List of boards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground space-y-2 text-sm font-semibold"
          >
            <p>Recent boards</p>
            <RecentBoards />
          </motion.div>
        </div>

        {/* User management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SidebarUser />
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
