import {
    sqliteTable,
    text,
    integer,
    blob,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';


export const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
    summary: text('summary'),
});

export const medicalRecords = sqliteTable('medical_records', {
    id: integer('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    recordDate: integer('record_date').notNull(),
    description: text('description').notNull(),
    data: blob('data'),
    mimeType: text("mime_type").notNull(),
    summary: text('summary'),
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`),
});

export const userRelations = relations(users, ({ many }) => ({
    medicalRecords: many(medicalRecords),
}));