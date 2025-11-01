import z from "zod";

export const MainDTO = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  mail: z.string().email(),
  createdAt: z.date(),
  
});