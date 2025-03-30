import { notFound } from "next/navigation";
import { getBoardById } from "@/services/board";

import Whiteboard from "@/components/whiteboard";

interface BoardPageProps {
  params: {
    id: string;
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const board = await getBoardById(params.id);

  if (!board) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <Whiteboard boardData={board} />
    </div>
  );
}
