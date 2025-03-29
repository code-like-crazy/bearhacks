"server only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return user[0];
  } catch (error) {
    console.error("Error fetching user in getUserByEmail function: ", error);
    return null;
  }
};
