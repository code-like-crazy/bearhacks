import { createClient, LiveMap } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  throttle: 16,
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  cursor: { x: number; y: number } | null;
  selection: string[] | null;
};

// Storage represents the shared document that persists in the Room
type Storage = {
  canvasObjects: LiveMap<string, any>;
};

// UserMeta represents static/readonly metadata on each user
type UserMeta = {
  id?: string;
  info?: {
    name?: string;
    avatar?: string;
  };
};

// RoomEvent for custom events broadcast in this room
type RoomEvent =
  | {
      type: "CURSOR_POSITION";
      x: number;
      y: number;
      connectionId: number;
    }
  | {
      type: "SELECTION_CHANGE";
      objectIds: string[];
      connectionId: number;
    };

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);
