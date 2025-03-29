import { z } from "zod";

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Board name is required")
    .max(50, "Board name must be less than 50 characters"),
  inviteCode: z
    .string()
    .trim()
    .toUpperCase()
    .max(20, "Invite code must be less than 20 characters")
    .optional()
    .transform((e) => (e === "" ? undefined : e)),
  selectedImage: z.string().min(1, "Board image is required"),
});

export type CreateBoardRequest = z.infer<typeof createBoardSchema>;
