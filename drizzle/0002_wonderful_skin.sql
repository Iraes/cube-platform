ALTER TABLE "lessons" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "module_tasks" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;