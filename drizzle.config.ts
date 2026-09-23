import { defineConfig } from "drizzle-kit";
import type { Config } from "drizzle-kit";
import 'dotenv/config'; // Make sure your env variables are loaded

export default defineConfig({
  schema: [
  "./lib/db/schema.ts",
  "./lib/db/ownerSchema.ts",
],
  out: "./lib/db/migrations", // (Update this to your migration folder)
  dialect: "postgresql", // <--- ADD THIS LINE (or "mysql" / "sqlite")
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Exclude these tables from migration
  tablesFilter: ['!faqs', '!regions', '!wineries'],
} satisfies Config);

