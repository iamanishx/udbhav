import { Hono } from 'hono'
import { createPatientDto, fileDto } from '../dtos/main.dtos'
import { db, patients } from '@udbhav/db'
import { v7 as uuidv7 } from 'uuid'

const health = new Hono();

health.post('/create/patient', async (c) => {
    
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

health.post('/upload-records', async (c) => {
    const result = await c.req.json();
    const parsed = fileDto.safeParse(result);

    if (!parsed.success) {
        return c.json({ error: parsed.error }, 400);
    }
});