import z, { email } from "zod";

export const createPatientDto = z.object({
  username: z.string().min(3).max(30),
  email: email(),
});

export const uploadMedicalRecordDto = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  recordDate: z.number().int().positive().optional(),
  generateSummary: z.boolean().default(true),
});

export const createMedicalRecordDto = z.object({
  patientId: z.string().min(1),
  recordDate: z.number().int().positive(),
  description: z.string().min(1),
  summary: z.string().optional().nullable(),
  mimeType: z.string().default('text/plain'),
});
