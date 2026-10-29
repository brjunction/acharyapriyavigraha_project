import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
/** Tagged-template SQL client. Use sql`select ...` or sql.query(text, params). */
export const sql = neon(url || "postgresql://invalid:invalid@localhost/invalid");
export const hasDb = () => Boolean(url);
