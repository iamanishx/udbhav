import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';
import path from 'path';

const dbPath = path.resolve(__dirname, '../memory.db');
const sqlite = new Database(dbPath);
export const db = drizzle({
  client: sqlite,
  schema
});

export type DrizzleDB = typeof db;
export default db;