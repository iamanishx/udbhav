import z, { email } from "zod";

export const createPatientDto = z.object({
  username: z.string().min(3).max(30),
  email: email(),
});

export const fileDto = z.object({
  file: z.instanceof(Uint8Array),
});