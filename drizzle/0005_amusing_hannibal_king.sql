CREATE TABLE "course_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_blocks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "block_id" uuid;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_block_id_course_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."course_blocks"("id") ON DELETE set null ON UPDATE no action;