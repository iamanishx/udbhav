export * from './db';

export * as schema from './schema';

export { medicalRecords , users, patients, medicalRecordEmbeddings } from './schema';

export {
  generateEmbedding,
  generateEmbeddings,
  storeMedicalRecordEmbedding,
  generateAllMedicalRecordEmbeddings,
  semanticSearchMedicalRecords,
  findSimilarRecords,
} from './embeddings';
