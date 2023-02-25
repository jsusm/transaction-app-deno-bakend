import { zod } from "../deps.ts";

const { z } = zod;

export const createUserSchema = z.object({
  name: z.string().max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateUserSchema = createUserSchema.omit({
  password: true,
}).partial();

export const updateUserPasswordSchema = createUserSchema.pick({
  password: true,
});
