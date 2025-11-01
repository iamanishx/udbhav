import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';
import path from 'path';
import * as sqliteVec from 'sqlite-vec';

const dbPath = path.resolve(__dirname, '../memory.db');
const sqlite = new Database(dbPath);

sqliteVec.load(sqlite);

export const db = drizzle({
  client: sqlite,
  schema
});

export type DrizzleDB = typeof db;
export default db;