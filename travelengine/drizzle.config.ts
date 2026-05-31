import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

// Dynamically load .env.local if not already defined (ensures Drizzle Kit works offline/in CLI)
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEqual = trimmed.indexOf("=");
          if (firstEqual !== -1) {
            const key = trimmed.substring(0, firstEqual).trim();
            const value = trimmed.substring(firstEqual + 1).trim();
            // Strip optional quotes around value
            const cleanValue = value.replace(/^['"]|['"]$/g, "");
            process.env[key] = cleanValue;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not parse .env.local natively:", err);
  }
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
