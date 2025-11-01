import z from "zod";

export const MainDTO = z.object({
  file: z.instanceof(Uint8Array),
});