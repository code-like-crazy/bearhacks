"use client";

import { useMyPresence } from "@liveblocks/react";

import { CursorOverlayProps } from "./types";

const COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

export function CursorOverlay({ others }: CursorOverlayProps) {
  const [{ cursor }, updateMyPresence] = useMyPresence();

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-0"
      onPointerMove={(event) => {
        event.preventDefault();
        // Update the cursor position on every pointer move
        updateMyPresence({
          cursor: {
            x: Math.round(event.clientX),
            y: Math.round(event.clientY),
          },
        });
      }}
      onPointerLeave={() => {
        // When the pointer leaves, set cursor to null
        updateMyPresence({
          cursor: null,
        });
      }}
    >
      {/* Show other users' cursors */}
      {others.map((user) => {
        if (!user.presence?.cursor) return null;

        // Extract user info from selection field if available
        let userName = `User ${user.connectionId}`;
        if (user.presence.selection && user.presence.selection.length > 0) {
          const userInfoString = user.presence.selection[0];
          if (
            userInfoString &&
            typeof userInfoString === "string" &&
            userInfoString.startsWith("user:")
          ) {
            const parts = userInfoString.split(":");
            if (parts.length >= 3) {
              userName = parts[2];
            }
          }
        }

        return (
          <div
            key={user.connectionId}
            className="pointer-events-none absolute z-50"
            style={{
              left: user.presence.cursor.x,
              top: user.presence.cursor.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Cursor dot */}
            <svg
              width="24"
              height="36"
              viewBox="0 0 24 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                color: COLORS[user.connectionId % COLORS.length],
              }}
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.0402832 17.2976L0.0402832 0.55127L5.65376 12.3673Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="2"
              />
            </svg>

            {/* User label */}
            <div
              className="absolute top-5 left-5 rounded-md px-2 py-1 text-xs whitespace-nowrap text-white"
              style={{
                backgroundColor: COLORS[user.connectionId % COLORS.length],
              }}
            >
              {userName}
            </div>
          </div>
        );
      })}
    </div>
  );
}
