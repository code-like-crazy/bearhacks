"use client";

import { CursorOverlayProps } from "./types";

export function CursorOverlay({ others }: CursorOverlayProps) {
  return (
    <>
      {others.map((user) => {
        if (!user.presence?.cursor) return null;

        return (
          <div
            key={user.connectionId}
            className="pointer-events-none absolute"
            style={{
              left: user.presence.cursor.x,
              top: user.presence.cursor.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor: `hsl(${user.connectionId * 40}, 100%, 50%)`,
              }}
            />
            <div
              className="absolute top-0 left-5 rounded px-2 py-1 text-xs whitespace-nowrap"
              style={{
                backgroundColor: `hsl(${user.connectionId * 40}, 100%, 50%)`,
              }}
            >
              {user.presence.user?.name || `User ${user.connectionId}`}
            </div>
          </div>
        );
      })}
    </>
  );
}
