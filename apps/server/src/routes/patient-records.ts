import { Hono } from 'hono'
import { uploadMedicalRecordDto, createPatientDto } from '../dtos/main.dtos'
import { db, patients, medicalRecords, semanticSearchMedicalRecords, storeMedicalRecordEmbedding } from '@udbhav/db'
import { v7 as uuidv7 } from 'uuid'
import { jwtMiddleware } from './auth'
import { generateMedicalSummary, generateDifferentialDiagnosis } from '../utils/ai'

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

        if (summary) {
            try {
                await storeMedicalRecordEmbedding(recordId, summary);
                console.log(`Embedding generated for record: ${recordId}`);
            } catch (error) {
                console.error('Failed to generate embedding:', error);
            }
        }

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

health.post('/search/patient/:patientId', jwtMiddleware, async (c) => {
    try {
        const patientId = c.req.param('patientId');
        const { query, limit = 5 } = await c.req.json();

        if (!query || typeof query !== 'string') {
            return c.json({ error: 'Query is required' }, 400);
        }

        const results = await semanticSearchMedicalRecords(query, limit, patientId);
        console.log(`Patient ${patientId} search for query ${query} returned ${results} results`);
        return c.json({
            success: true,
            patientId,
            query,
            results: results.map(r => ({
                id: r.id,
                description: r.description,
                summary: r.summary,
                recordDate: r.recordDate,
                similarity: r.similarity,
            })),
        });
    } catch (e) {
        console.error('Patient search failed:', e);
        return c.json({ 
            error: 'Search failed',
            details: e instanceof Error ? e.message : 'Unknown error'
        }, 500);
    }
});

health.post('/search/global', jwtMiddleware, async (c) => {
    try {
        const { query, limit = 10 } = await c.req.json();

        if (!query || typeof query !== 'string') {
            return c.json({ error: 'Query is required' }, 400);
        }

        const results = await semanticSearchMedicalRecords(query, limit);
        console.log(`Global search for query ${query} returned ${results} results`);
        const allPatients = await db.select().from(patients).execute();
        const patientsMap = new Map(allPatients.map((p: any) => [p.id, p]));

        return c.json({
            success: true,
            query,
            results: results.map(r => {
                const patient = patientsMap.get(r.patientId);
                return {
                    id: r.id,
                    patientId: r.patientId,
                    patientName: patient?.username || 'Unknown',
                    patientEmail: patient?.email || '',
                    description: r.description,
                    summary: r.summary,
                    recordDate: r.recordDate,
                    similarity: r.similarity,
                };
            }),
        });
    } catch (e) {
        console.error('Global search failed:', e);
        return c.json({ 
            error: 'Search failed',
            details: e instanceof Error ? e.message : 'Unknown error'
        }, 500);
    }
});

health.post('/diagnose', jwtMiddleware, async (c) => {
    try {
        const { clinicalNotes, patientHistory } = await c.req.json();

        if (!clinicalNotes || typeof clinicalNotes !== 'string') {
            return c.json({ error: 'Clinical notes are required' }, 400);
        }

        const diagnosis = await generateDifferentialDiagnosis(clinicalNotes, patientHistory);

        return c.json({
            success: true,
            ...diagnosis,
        });
    } catch (e) {
        console.error('Diagnosis generation failed:', e);
        return c.json({ 
            error: 'Failed to generate diagnosis',
            details: e instanceof Error ? e.message : 'Unknown error'
        }, 500);
    }
});

export default health;