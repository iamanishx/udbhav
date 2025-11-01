import { db } from './db';
import { patients, medicalRecords } from './schema';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    console.log('Clearing existing data...');
    await db.delete(medicalRecords);
    await db.delete(patients);
    console.log('Existing data cleared');

    console.log('Inserting patients...');
    const insertedPatients = await db.insert(patients).values([
      {
        id: 'abc123',
        username: 'john_doe',
        email: 'john@example.com',
      },
      {
        id: 'def456',
        username: 'jane_smith',
        email: 'jane@example.com',
      },
      {
        id: 'ghi789',
        username: 'bob_wilson',
        email: 'bob@example.com',
      },
    ]).returning();

    console.log(`Inserted ${insertedPatients.length} patients`);

    if (insertedPatients.length < 3) {
      throw new Error('Failed to insert all patients');
    }

    const pdfPath = path.resolve(__dirname, '../../../apps/server/src/assets/udbhav.pdf');
    let pdfData: Buffer | null = null;

    if (fs.existsSync(pdfPath)) {
      console.log(`Reading PDF from ${pdfPath}...`);
      pdfData = await fs.promises.readFile(pdfPath);
      console.log(`PDF loaded (${pdfData.length} bytes)`);
    } else {
      console.warn(`PDF file not found at ${pdfPath}, will create records without file data`);
    }

    console.log('Inserting medical records...');
    
    const recordsToInsert = [
      {
        id: 'record1',
        patientId: insertedPatients[0]!.id,
        recordDate: Math.floor(new Date('2024-01-15').getTime() / 1000),
        description: 'Annual physical examination - All vitals normal',
        data: pdfData,
        mimeType: 'application/pdf',
        summary: 'Routine checkup showing good overall health. Blood pressure: 120/80, Heart rate: 72 bpm.',
      },
      {
        id: 'record2',
        patientId: insertedPatients[0]!.id,
        recordDate: Math.floor(new Date('2024-06-20').getTime() / 1000),
        description: 'Blood test results',
        data: pdfData,
        mimeType: 'application/pdf',
        summary: 'Complete blood count within normal ranges. Cholesterol levels slightly elevated.',
      },
      {
        id: 'record3',
        patientId: insertedPatients[1]!.id,
        recordDate: Math.floor(new Date('2024-03-10').getTime() / 1000),
        description: 'Dental checkup and cleaning',
        data: pdfData,
        mimeType: 'application/pdf',
        summary: 'No cavities detected. Gums healthy. Recommended flossing more regularly.',
      },
      {
        id: 'record4',
        patientId: insertedPatients[1]!.id,
        recordDate: Math.floor(new Date('2024-08-05').getTime() / 1000),
        description: 'Eye examination',
        data: pdfData,
        mimeType: 'application/pdf',
        summary: 'Vision test shows slight myopia progression. Updated prescription provided.',
      },
      {
        id: 'record5',
        patientId: insertedPatients[2]!.id,
        recordDate: Math.floor(new Date('2024-02-28').getTime() / 1000),
        description: 'Cardiology consultation',
        data: pdfData,
        mimeType: 'application/pdf',
        summary: 'EKG normal. Blood pressure management improving with current medication regimen.',
      },
      {
        id: 'record6',
        patientId: insertedPatients[2]!.id,
        recordDate: Math.floor(new Date('2024-07-12').getTime() / 1000),
        description: 'Medication review and refill',
        data: pdfData,
        mimeType: 'application/pdf',
        summary: 'Current medications effective. No adverse reactions reported. Refilled for 3 months.',
      },
    ];

    const insertedRecords = await db.insert(medicalRecords).values(recordsToInsert).returning();
    
    console.log(`Inserted ${insertedRecords.length} medical records`);
    console.log('\n Database seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Patients: ${insertedPatients.length}`);
    console.log(`- Medical Records: ${insertedRecords.length}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
seed()
  .then(() => {
    console.log('Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
