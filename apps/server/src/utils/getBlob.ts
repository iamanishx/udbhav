import { db, schema } from '@udbhav/db';
import { eq } from 'drizzle-orm';

export async function getBlob(id: number): Promise<Uint8Array | null> {
  const result = await db
    .select()
    .from(schema.medicalRecords)
.where(eq(schema.medicalRecords.id, id))
    .limit(1)
    .execute();

  if (result.length === 0) return null;

  const row = result[0] as any;
  return (row.data ?? null) as Uint8Array | null;
}