"server only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export const getUserById = async (id: string) => {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return user[0];
  } catch (error) {
    console.error("Error fetching user in getUserById function: ", error);
    return null;
  }
};

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

export const getUserByEmailAndPassword = async (
  email: string,
  password: string,
) => {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, email),
          eq(usersTable.hashedPassword, password),
        ),
      );
    return user[0];
  } catch (error) {
    console.error(
      "Error fetching user in getUserByEmailAndPassword function: ",
      error,
    );
    return null;
  }
};
