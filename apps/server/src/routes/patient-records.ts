import { Hono } from 'hono'
import { createPatientDto, createMedicalRecordDto } from '../dtos/main.dtos'
import { db, patients, medicalRecords } from '@udbhav/db'
import { v7 as uuidv7 } from 'uuid'
import { jwtMiddleware } from './auth'

const health = new Hono();

// Get all patients
health.get('/patients', jwtMiddleware, async (c) => {
    try {
        const allPatients = await db.select().from(patients).execute();
        return c.json(allPatients);
    } catch (e) {
        console.error('Failed to fetch patients:', e);
        return c.json({ error: 'Failed to fetch patients' }, 500);
    }
});

// Get records for a specific patient
health.get('/patients/:id/records', jwtMiddleware, async (c) => {
    try {
        const patientId = c.req.param('id');
        const allRecords = await db.select().from(medicalRecords).execute();
        // Filter and sort in memory to avoid drizzle-orm type issues
        const patientRecords = allRecords
            .filter((record: any) => (record.patientId === patientId || record.patient_id === patientId))
            .sort((a: any, b: any) => {
                const dateA = a.recordDate || a.record_date || 0;
                const dateB = b.recordDate || b.record_date || 0;
                return dateB - dateA; // Descending order (newest first)
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

health.post('/create/record', jwtMiddleware, async (c) => {
    try {
        const body = await c.req.json();
        const parsed = createMedicalRecordDto.safeParse(body);

        if (!parsed.success) {
            return c.json({ error: parsed.error }, 400);
        }

        const record = await db.insert(medicalRecords).values({
            id: uuidv7(),
            patientId: parsed.data.patientId,
            recordDate: parsed.data.recordDate,
            description: parsed.data.description,
            summary: parsed.data.summary || null,
            mimeType: parsed.data.mimeType || 'text/plain',
            data: null, // No file data for manual text records
        }).returning();

        return c.json({ success: true, record: record[0] });
    } catch (e) {
        console.error('Failed to create record:', e);
        return c.json({ error: 'Failed to create medical record' }, 500);
    }
});

health.post('/upload-records', jwtMiddleware, async (c) => {
    try {
        const formData = await c.req.parseBody();
        const file = formData.file as File;
        const patientId = formData.patientId as string;
        const description = formData.description as string;
        const summary = formData.summary as string | undefined;
        const recordDate = parseInt(formData.recordDate as string);

        if (!file || !patientId || !description) {
            return c.json({ error: 'Missing required fields: file, patientId, description' }, 400);
        }

        const fileBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(fileBuffer);

        const record = await db.insert(medicalRecords).values({
            id: uuidv7(),
            patientId: patientId,
            recordDate: recordDate || Math.floor(Date.now() / 1000),
            description: description,
            summary: summary || null,
            mimeType: file.type || 'application/octet-stream',
            data: fileData,
        }).returning();

        return c.json({ success: true, record: record[0] });
    } catch (e) {
        console.error('Failed to upload record:', e);
        return c.json({ error: 'Failed to upload medical record' }, 500);
    }
});

export default health;