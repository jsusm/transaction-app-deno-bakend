import { createUserSchema } from "./user.schema.ts";

export const signupSchema = createUserSchema;
export const signinSchema = createUserSchema.omit({ name: true });
