import { getCurrentUser } from "@/auth";
import { Plus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import MinimalBoardGrid from "@/components/dashboard/MinimalBoardGrid";
import CreateBoardModal from "@/components/modals/CreateBoardModal";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-light">Welcome back, {user?.name}</h1>
      <MinimalBoardGrid />
      <CreateBoardModal>
        <Card className="w-full max-w-sm cursor-pointer border-0 bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 shadow-xl shadow-black/25 transition duration-300 hover:shadow-[0_0_35px_5px_rgba(139,92,246,0.45)]">
          <CardContent className="flex h-[72px] items-center justify-center gap-2 p-4">
            <Plus className="h-5 w-5 text-white" />
            <p className="font-medium text-white">Create Board</p>
          </CardContent>
        </Card>
      </CreateBoardModal>
    </div>
  );
}
