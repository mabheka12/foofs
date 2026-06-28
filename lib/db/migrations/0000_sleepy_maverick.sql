CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"featured_image" text,
	"author" varchar(100),
	"state_id" integer,
	"city_id" integer,
	"tags" jsonb,
	"meta_title" varchar(160),
	"meta_description" text,
	"published" boolean DEFAULT true,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"state_id" integer NOT NULL,
	"county" varchar(100),
	"population" integer,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"description" text,
	"meta_title" varchar(160),
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractor_services" (
	"contractor_id" integer NOT NULL,
	"service_type_id" integer NOT NULL,
	CONSTRAINT "contractor_services_contractor_id_service_type_id_pk" PRIMARY KEY("contractor_id","service_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"business_name" varchar(200),
	"description" text,
	"address" text,
	"city_id" integer NOT NULL,
	"state_id" integer NOT NULL,
	"zip_code" varchar(10),
	"phone" varchar(20),
	"email" varchar(100),
	"website" varchar(200),
	"google_maps_url" text,
	"google_place_id" varchar(100),
	"rating" numeric(3, 1),
	"review_count" integer DEFAULT 0,
	"license_number" varchar(50),
	"insurance_verified" boolean DEFAULT false,
	"years_in_business" integer,
	"services_offered" jsonb,
	"service_areas" jsonb,
	"emergency_service" boolean DEFAULT false,
	"free_estimates" boolean DEFAULT false,
	"financing_available" boolean DEFAULT false,
	"warranty_offered" boolean DEFAULT false,
	"meta_title" varchar(160),
	"meta_description" text,
	"featured" boolean DEFAULT false,
	"verified" boolean DEFAULT false,
	"published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"contractor_id" integer NOT NULL,
	"author_name" varchar(100),
	"rating" integer NOT NULL,
	"content" text,
	"google_review_id" varchar(100),
	"published_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"meta_title" varchar(160),
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"abbreviation" varchar(2) NOT NULL,
	"description" text,
	"meta_title" varchar(160),
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "states_slug_unique" UNIQUE("slug"),
	CONSTRAINT "states_abbreviation_unique" UNIQUE("abbreviation")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_state_city" ON "cities" ("state_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_state_city_slug" ON "contractors" ("state_id","city_id","slug");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_services" ADD CONSTRAINT "contractor_services_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractor_services" ADD CONSTRAINT "contractor_services_service_type_id_service_types_id_fk" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractors" ADD CONSTRAINT "contractors_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contractors" ADD CONSTRAINT "contractors_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
