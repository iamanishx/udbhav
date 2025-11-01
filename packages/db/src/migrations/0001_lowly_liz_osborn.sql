CREATE TABLE `medical_record_embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`embedding` blob NOT NULL,
	`dimension` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `medical_records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `medical_record_embeddings_record_id_unique` ON `medical_record_embeddings` (`record_id`);--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patients_username_unique` ON `patients` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `patients_email_unique` ON `patients` (`email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_medical_records` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`record_date` integer NOT NULL,
	`description` text NOT NULL,
	`data` blob,
	`mime_type` text NOT NULL,
	`summary` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_medical_records`("id", "user_id", "record_date", "description", "data", "mime_type", "summary", "created_at") SELECT "id", "user_id", "record_date", "description", "data", "mime_type", "summary", "created_at" FROM `medical_records`;--> statement-breakpoint
DROP TABLE `medical_records`;--> statement-breakpoint
ALTER TABLE `__new_medical_records` RENAME TO `medical_records`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`summary` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "email", "created_at", "summary") SELECT "id", "username", "email", "created_at", "summary" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);