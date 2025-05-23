"server only";

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

const avatars = [
  "bear.jpg",
  "bear2.jpg",
  "bee.jpg",
  "cat.jpg",
  "cat2.jpg",
  "dog.jpg",
  "dog2.jpg",
  "dragon.jpg",
  "pink-panther.jpg",
  "porcupine.jpg",
  "unicorn.jpg",
];

const getRandomAvatar = () => {
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  return `/avatars/${randomAvatar}`;
};

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

export const createUser = async (
  email: string,
  password: string,
  name: string,
) => {
  try {
    await db.insert(usersTable).values({
      id: nanoid(),
      email,
      name,
      hashedPassword: password,
      createdAt: Date.now(),
      imageUrl: getRandomAvatar(),
    });
  } catch (error) {
    console.error("Error creating user in createUser function: ", error);
    return null;
  }
};
