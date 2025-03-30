"use client";

import { useEffect, useState } from "react";

import { useOthers } from "@/lib/liveblocks.config";

import { CursorOverlayProps } from "./types";

export function CursorOverlay({ others }: CursorOverlayProps) {
  // Add a state to force re-renders
  const [, setForceUpdate] = useState(0);

  // Force re-render every 100ms to ensure cursors are updated
  useEffect(() => {
    const intervalId = setInterval(() => {
      setForceUpdate((prev) => prev + 1);
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {others.map((user) => {
        if (!user.presence.cursor) return null;

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
              userName = parts[2]; // Get the name part
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
                color: `hsl(${user.connectionId * 40}, 100%, 50%)`,
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
                backgroundColor: `hsl(${user.connectionId * 40}, 100%, 50%)`,
              }}
            >
              {userName}
            </div>
          </div>
        );
      })}
    </>
  );
}
