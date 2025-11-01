import {
    sqliteTable,
    text,
    integer,
    blob,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';


export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
    summary: text('summary'),
});

export const patients = sqliteTable('patients', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
});

export const medicalRecords = sqliteTable('medical_records', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => patients.id, { onDelete: 'cascade' }),
    recordDate: integer('record_date').notNull(),
    description: text('description').notNull(),
    data: blob('data'),
    mimeType: text("mime_type").notNull(),
    summary: text('summary'),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
});

export const medicalRecordEmbeddings = sqliteTable('medical_record_embeddings', {
    id: text('id').primaryKey(),
    recordId: text('record_id')
        .notNull()
        .references(() => medicalRecords.id, { onDelete: 'cascade' })
        .unique(),
    embedding: blob('embedding', { mode: 'buffer' }).notNull(),
    dimension: integer('dimension').notNull(),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
});

export const userRelations = relations(users, ({ many }) => ({
    medicalRecords: many(medicalRecords),
}));