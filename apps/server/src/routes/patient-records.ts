import { Hono } from 'hono'
import { uploadMedicalRecordDto, createPatientDto } from '../dtos/main.dtos'
import { db, patients, medicalRecords } from '@udbhav/db'
import { v7 as uuidv7 } from 'uuid'
import { jwtMiddleware } from './auth'
import { generateMedicalSummary } from '../utils/ai'

const health = new Hono();

health.get('/patients', jwtMiddleware, async (c) => {
    try {
        const allPatients = await db.select().from(patients).execute();
        return c.json(allPatients);
    } catch (e) {
        console.error('Failed to fetch patients:', e);
        return c.json({ error: 'Failed to fetch patients' }, 500);
    }
});

health.get('/patients/:id/records', jwtMiddleware, async (c) => {
    try {
        const patientId = c.req.param('id');
        const allRecords = await db.select().from(medicalRecords).execute();
        const patientRecords = allRecords
            .filter((record: any) => (record.patientId === patientId || record.patient_id === patientId))
            .sort((a: any, b: any) => {
                const dateA = a.recordDate || a.record_date || 0;
                const dateB = b.recordDate || b.record_date || 0;
                return dateB - dateA;
            });
        
        return c.json(patientRecords);
    } catch (e) {
        console.error('Failed to fetch patient records:', e);
        return c.json({ error: 'Failed to fetch patient records' }, 500);
    }
});

health.post('/create/patient', jwtMiddleware, async (c) => {

    const { username, email } = await c.req.json();
    const parsed = createPatientDto.safeParse({ username, email });

    if (!parsed.success) {
        return c.json({ error: parsed.error }, 400);
    }
    try {
    await db.insert(patients).values({
        id: uuidv7(),
        username: parsed.data.username,
        email: parsed.data.email,
    }).returning();
    } catch (e) {
        return c.json({ error: 'Failed to create patient' }, 500);
    }

    return c.json({ success: true });
});

health.post('/upload-records', jwtMiddleware, async (c) => {
    try {
        const formData = await c.req.parseBody();
        
        const file = formData.file as File;
        if (!file) {
            return c.json({ error: 'No file provided' }, 400);
        }

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            return c.json({ 
                error: 'Invalid file type. Only PDF and image files are allowed.',
                allowedTypes 
            }, 400);
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return c.json({ 
                error: 'File too large. Maximum size is 10MB.',
                maxSize 
            }, 400);
        }

        const patientId = formData.patientId as string;
        const description = formData.description as string;
        const recordDateStr = formData.recordDate as string | undefined;
        const generateSummaryStr = formData.generateSummary as string | undefined;

        const dtoData = {
            patientId,
            description,
            recordDate: recordDateStr ? parseInt(recordDateStr) : Math.floor(Date.now() / 1000),
            generateSummary: generateSummaryStr !== 'false',
        };

        const parsed = uploadMedicalRecordDto.safeParse(dtoData);
        if (!parsed.success) {
            return c.json({ 
                error: 'Validation failed',
                details: parsed.error.issues 
            }, 400);
        }

        const allPatients = await db.select().from(patients).execute();
        const patient = allPatients.find((p: any) => p.id === parsed.data.patientId);

        if (!patient) {
            return c.json({ error: 'Patient not found' }, 404);
        }

        const fileBuffer = await file.arrayBuffer();
        const fileData = Buffer.from(fileBuffer);

        let summary: string | null = null;
        if (parsed.data.generateSummary) {
            try {
                console.log(`Generating AI summary for medical record...`);
                summary = await generateMedicalSummary(
                    new Uint8Array(fileBuffer),
                    file.type,
                    parsed.data.description
                );
                console.log(`AI summary generated successfully`);
            } catch (error) {
                console.error('Failed to generate summary:', error);
                summary = null;
            }
        }

        const recordId = uuidv7();
        const insertData = {
            id: recordId,
            patientId: parsed.data.patientId,
            recordDate: parsed.data.recordDate!,
            description: parsed.data.description,
            summary: summary,
            mimeType: file.type,
            data: fileData,
        };

        const record = await db.insert(medicalRecords).values(insertData).returning();

        console.log(`Medical record created: ${recordId}`);

        return c.json({ 
            success: true, 
            record: {
                id: record[0]?.id,
                patientId: record[0]?.patientId,
                description: record[0]?.description,
                summary: record[0]?.summary,
                mimeType: record[0]?.mimeType,
                recordDate: record[0]?.recordDate,
                createdAt: record[0]?.createdAt,
                fileSize: file.size,
            },
            message: summary ? 'Record uploaded and AI summary generated' : 'Record uploaded'
        });
    } catch (e) {
        console.error('Failed to upload record:', e);
        return c.json({ 
            error: 'Failed to upload medical record',
            details: e instanceof Error ? e.message : 'Unknown error'
        }, 500);
    }
});

export default health;