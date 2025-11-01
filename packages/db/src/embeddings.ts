import { db } from './db';
import { medicalRecords, medicalRecordEmbeddings } from './schema';
import { eq, sql } from 'drizzle-orm';
import { embed, embedMany } from 'ai';
import { google } from '@ai-sdk/google';

const embeddingModel = google.textEmbeddingModel('text-embedding-004');

export async function generateEmbedding(text: string): Promise<Float32Array> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  
  return new Float32Array(embedding);
}

export async function generateEmbeddings(texts: string[]): Promise<Float32Array[]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  });
  
  return embeddings.map(e => new Float32Array(e));
}

/**
 * Store embedding for a medical record summary
 */
export async function storeMedicalRecordEmbedding(
  recordId: string,
  summary: string
): Promise<void> {
  const embedding = await generateEmbedding(summary);
  const buffer = Buffer.from(embedding.buffer);
  
  await db.insert(medicalRecordEmbeddings).values({
    id: `emb_${recordId}`,
    recordId,
    embedding: buffer,
    dimension: embedding.length,
  }).onConflictDoUpdate({
    target: medicalRecordEmbeddings.recordId,
    set: {
      embedding: buffer,
      dimension: embedding.length,
    },
  });
}

/**
 * Batch process: Generate and store embeddings for all medical records that have summaries
 */
export async function generateAllMedicalRecordEmbeddings(): Promise<number> {
  const records = await db
    .select({
      id: medicalRecords.id,
      summary: medicalRecords.summary,
    })
    .from(medicalRecords)
    .where(sql`${medicalRecords.summary} IS NOT NULL AND ${medicalRecords.summary} != ''`);

  if (records.length === 0) {
    console.log('No records with summaries found');
    return 0;
  }

  console.log(`Generating embeddings for ${records.length} records...`);
  
  const summaries = records.map(r => r.summary!);
  const embeddings = await generateEmbeddings(summaries);

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!;
    const embedding = embeddings[i]!;
    const buffer = Buffer.from(embedding.buffer);
    
    await db.insert(medicalRecordEmbeddings).values({
      id: `emb_${record.id}`,
      recordId: record.id,
      embedding: buffer,
      dimension: embedding.length,
    }).onConflictDoUpdate({
      target: medicalRecordEmbeddings.recordId,
      set: {
        embedding: buffer,
        dimension: embedding.length,
      },
    });
  }

  console.log(`Generated embeddings for ${records.length} records`);
  return records.length;
}

/**
 * Semantic search: Find medical records similar to a query of a specified patient
 */
export async function semanticSearchMedicalRecords(
  query: string,
  limit: number = 5,
  userId?: string
): Promise<Array<{
  id: string;
  userId: string;
  description: string;
  summary: string | null;
  recordDate: number;
  similarity: number;
}>> {
  const queryEmbedding = await generateEmbedding(query);
  const queryBuffer = Buffer.from(queryEmbedding.buffer);

  const results = await db.$client.prepare(`
    SELECT 
      mr.id,
      mr.user_id as userId,
      mr.description,
      mr.summary,
      mr.record_date as recordDate,
      (1.0 / (1.0 + vec_distance_L2(mre.embedding, ?))) as similarity
    FROM medical_records mr
    INNER JOIN medical_record_embeddings mre ON mr.id = mre.record_id
    WHERE 1=1 ${userId ? 'AND mr.user_id = ?' : ''}
    ORDER BY similarity DESC
    LIMIT ?
  `).all(
    ...(userId ? [queryBuffer, userId, limit] : [queryBuffer, limit])
  );

  return results as any[];
}

/**
 * Find similar medical records to a given record (e.g., for finding related cases)
 */
export async function findSimilarRecords(
  recordId: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  userId: string;
  description: string;
  summary: string | null;
  similarity: number;
}>> {
  const embeddingRecord = await db
    .select()
    .from(medicalRecordEmbeddings)
    .where(eq(medicalRecordEmbeddings.recordId, recordId))
    .limit(1);

  if (embeddingRecord.length === 0) {
    throw new Error(`No embedding found for record ${recordId}`);
  }

  const targetEmbedding = embeddingRecord[0]!.embedding;

  const results = await db.$client.prepare(`
    SELECT 
      mr.id,
      mr.user_id as userId,
      mr.description,
      mr.summary,
      (1.0 / (1.0 + vec_distance_L2(mre.embedding, ?))) as similarity
    FROM medical_records mr
    INNER JOIN medical_record_embeddings mre ON mr.id = mre.record_id
    WHERE mr.id != ?
    ORDER BY similarity DESC
    LIMIT ?
  `).all(targetEmbedding, recordId, limit);

  return results as any[];
}
