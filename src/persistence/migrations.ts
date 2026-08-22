import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import type { PostgresClient } from "./index.js";

function checksumSql(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

/**
 * Early Windows deployments recorded CRLF bytes while the committed migration
 * blobs use LF. Treat only that byte-for-byte line-ending variant as the same
 * immutable migration; any semantic/content edit still fails closed.
 */
function equivalentLineEndingChecksums(sql: string): readonly string[] {
  const canonical = sql.replace(/\r\n/g, "\n");
  return Object.freeze([
    checksumSql(sql),
    checksumSql(canonical),
    checksumSql(canonical.replace(/\n/g, "\r\n")),
  ]);
}

/** Applies immutable SQL migrations exactly once, in lexical order. */
export async function runMigrations(client: PostgresClient, directory = "migrations"): Promise<readonly string[]> {
  const names = (await readdir(directory)).filter((name) => /^\d+_.+\.sql$/u.test(name)).sort();
  return client.transaction(async (tx) => {
    await tx.query("CREATE TABLE IF NOT EXISTS schema_migrations (migration_name TEXT PRIMARY KEY, checksum_sha256 TEXT, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
    // Existing installations are adopted once. Every migration applied after
    // this runner version is subsequently immutable by checksum.
    await tx.query("ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT");
    const applied: string[] = [];
    for (const name of names) {
      const sql = await readFile(join(directory, name), "utf8");
      const checksum = checksumSql(sql);
      const present = await tx.query<{ migration_name: string; checksum_sha256: string | null }>("SELECT migration_name,checksum_sha256 FROM schema_migrations WHERE migration_name = $1 FOR UPDATE", [name]);
      if (present.rows[0]) {
        const recorded = present.rows[0].checksum_sha256;
        if (recorded && !equivalentLineEndingChecksums(sql).includes(recorded)) throw new Error(`Migration checksum mismatch for ${name}; applied migrations are immutable.`);
        if (!recorded) await tx.query("UPDATE schema_migrations SET checksum_sha256 = $2 WHERE migration_name = $1 AND checksum_sha256 IS NULL", [name, checksum]);
        continue;
      }
      await tx.query(sql);
      await tx.query("INSERT INTO schema_migrations (migration_name,checksum_sha256) VALUES ($1,$2)", [name, checksum]);
      applied.push(name);
    }
    return Object.freeze(applied);
  });
}
