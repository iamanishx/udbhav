import {Hono} from 'hono'

const app = new Hono();

app.post('/healthz', async (c) => {
 const result = await c.req.json();

});