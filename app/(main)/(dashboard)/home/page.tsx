import { Suspense } from "react";
import { getCurrentUser } from "@/auth";

import { BoardCardSkeleton } from "@/components/dashboard/BoardCardSkeleton";
import BoardGrid from "@/components/dashboard/BoardGrid";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import CreateBoardModal from "@/components/modals/CreateBoardModal";

const BoardGridSkeleton = () => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <BoardCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default async function HomePage() {
  const user = await getCurrentUser();
  // Fetching boards will happen inside BoardGrid using Suspense

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <WelcomeBanner userName={user?.name} />
      <div className="mt-6">
        <CreateBoardModal />
      </div>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        Your Boards
      </h2>
      <Suspense fallback={<BoardGridSkeleton />}>
        <BoardGrid />
      </Suspense>

      {/* C. Activity Preview (Placeholder/Future) */}
      {/*
      <div className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
        <p className="text-muted-foreground">Activity feed coming soon...</p>
        {/* <RecentActivitySection /> */}
      {/*</div>
       */}
    </div>
  );
}
