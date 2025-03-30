import { notFound } from "next/navigation";
import { getBoardById } from "@/services/board";

import Whiteboard from "@/components/whiteboard";

interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;
  const board = await getBoardById(id);

  if (!board) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <Whiteboard boardData={board} />
    </div>
  );
}
