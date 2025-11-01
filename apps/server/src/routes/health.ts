import {Hono} from 'hono'

const health = new Hono();

health.post('/healthz', async (c) => {
 const result = await c.req.json();

});