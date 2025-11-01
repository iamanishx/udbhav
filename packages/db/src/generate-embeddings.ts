/**
 * Script to generate embeddings for all medical records
 * Run this after seeding or when adding new records
 */
import { generateAllMedicalRecordEmbeddings } from './embeddings';

async function main() {
  console.log('Generating embeddings for medical records...\n');
  
  try {
    const count = await generateAllMedicalRecordEmbeddings();
    console.log(`\n Successfully generated embeddings for ${count} medical records!`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
