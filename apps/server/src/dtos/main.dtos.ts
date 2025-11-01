import z, { email } from "zod";

export const createPatientDto = z.object({
  username: z.string().min(3).max(30),
  email: email(),
});

export const fileDto = z.object({
  file: z.instanceof(Uint8Array),
});

export const createMedicalRecordDto = z.object({
  patientId: z.string().min(1),
  recordDate: z.number().int().positive(),
  description: z.string().min(1),
  summary: z.string().optional().nullable(),
  mimeType: z.string().default('text/plain'),
});