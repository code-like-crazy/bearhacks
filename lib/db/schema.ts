import {
  int,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  imageUrl: text("image_url").notNull(),

  createdAt: integer("createdAt"),
  updatedAt: integer("updatedAt"),
});

export const boards = sqliteTable("boards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  inviteCode: text("invite_code").notNull(),
  createdAt: integer("createdAt"),
  lockedAt: integer("locked_at"),

  creatorId: text("creator_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const boardElements = sqliteTable("board_elements", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // type of element— sticky, emoji,, drawing, image, etc.
  data: text("data"), // Flexible JSON data as needed

  x: integer("x").notNull(), // Position on the board
  y: integer("y").notNull(), // Position on the board

  createdAt: integer("createdAt"),
  updatedAt: integer("updatedAt"),

  boardId: text("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const boardMembers = sqliteTable(
  "board_members",
  {
    boardId: text("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    isLocked: int("is_locked").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.boardId, table.userId] })],
);

export const aiOutputs = sqliteTable("ai_outputs", {
  id: text("id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),

  destination: text("destination").notNull(), // "Tokyo, Japan"
  destinationImageUrl: text("destination_image_url").notNull(), // AI-Generated image of the destination
  destinationSummary: text("destination_summary").notNull(), // JSON - { place: "Bali", reason: "Matches 4/5 beach preferences" }

  vendorOptions: text("vendor_options", { mode: "json" }).notNull().$type<{
    flights: Array<{
      id: string;
      airline: string;
      price: number;
      departure: string; // ISO date
    }>;
    hotels: Array<{
      id: string;
      name: string;
      pricePerNight: number;
      rating?: number;
    }>;
    // Can extend with restaurants/tours later
  }>(),

  itinerary: text("itinerary", { mode: "json" }).notNull().$type<{
    days: Array<{
      day: number;
      theme: string;
      activities: Array<{
        id: string;
        name: string;
        durationHours: number;
        cost?: number;
      }>;
    }>;
  }>(),

  createdAt: integer("createdAt"),
});

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),

  // Polymorphic Voting
  targetType: text("target_type", {
    enum: ["activity", "flight", "hotel", "restaurant"],
  }).notNull(),
  targetId: text("target_id").notNull(), // References IDs in aiOutputs

  // Vote Value (-1, 0, 1)
  value: integer("value", { mode: "number" })
    .notNull()
    .default(0)
    .$type<-1 | 0 | 1>(),

  // References
  boardId: text("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Metadata
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertBoard = typeof boards.$inferInsert;
export type SelectBoard = typeof boards.$inferSelect;

export type InsertBoardElement = typeof boardElements.$inferInsert;
export type SelectBoardElement = typeof boardElements.$inferSelect;

export type InsertBoardMember = typeof boardMembers.$inferInsert;
export type SelectBoardMember = typeof boardMembers.$inferSelect;

export type InsertAiOutput = typeof aiOutputs.$inferInsert;
export type SelectAiOutput = typeof aiOutputs.$inferSelect;

export type InsertVote = typeof votes.$inferInsert;
export type SelectVote = typeof votes.$inferSelect;
