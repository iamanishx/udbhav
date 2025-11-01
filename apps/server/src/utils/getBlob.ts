import { db, medicalRecords } from '@udbhav/db';
import { eq } from 'drizzle-orm';

export async function getBlob(id: string): Promise<Uint8Array | null> {
  const result = await db
    .select()
    .from(medicalRecords)
    .where(eq(medicalRecords.id, id))
    .limit(1)
    .execute();

  if (result.length === 0) return null;

  const row = result[0] as any;
  return (row.data ?? null) as Uint8Array | null;
}