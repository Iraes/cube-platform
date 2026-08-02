CREATE TABLE "bug_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"context_kind" text DEFAULT 'other' NOT NULL,
	"context_id" text,
	"context_title" text DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bug_reports_created_idx" ON "bug_reports" USING btree ("created_at");