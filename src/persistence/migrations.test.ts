import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import type { PostgresClient, PostgresQueryResult, PostgresTransaction } from "./index.js";
import { runMigrations } from "./migrations.js";
import { NodePostgresClient } from "./pg-driver.js";

class MigrationTestClient implements PostgresClient {
  private readonly applied = new Map<string, string | null>();
  public async transaction<T>(work: (transaction: PostgresTransaction) => Promise<T>): Promise<T> { return work(this); }
  public async query<Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, values: readonly unknown[] = []): Promise<PostgresQueryResult<Row>> {
    if (sql.startsWith("SELECT migration_name")) {
      const name = String(values[0]); const checksum = this.applied.get(name);
      return { rows: checksum === undefined ? [] : [{ migration_name: name, checksum_sha256: checksum } as unknown as Row] };
    }
    if (sql.startsWith("INSERT INTO schema_migrations")) { this.applied.set(String(values[0]), String(values[1])); return { rows: [] }; }
    if (sql.startsWith("UPDATE schema_migrations")) { this.applied.set(String(values[0]), String(values[1])); return { rows: [] }; }
    return { rows: [] };
  }
}

test("migration runner refuses an edited migration that was already applied", async () => {
  const directory = await mkdtemp(join(tmpdir(), "thinkai-migrations-"));
  try {
    const file = join(directory, "0001_example.sql");
    await writeFile(file, "CREATE TABLE example (id TEXT);", "utf8");
    const client = new MigrationTestClient();
    assert.deepEqual(await runMigrations(client, directory), ["0001_example.sql"]);
    assert.deepEqual(await runMigrations(client, directory), []);
    await writeFile(file, "CREATE TABLE example (id TEXT, changed BOOLEAN);", "utf8");
    await assert.rejects(() => runMigrations(client, directory), /checksum mismatch/i);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("migration runner accepts a legacy CRLF checksum without accepting a content edit", async () => {
  const directory = await mkdtemp(join(tmpdir(), "thinkai-migrations-crlf-"));
  try {
    const file = join(directory, "0001_example.sql");
    const client = new MigrationTestClient();
    await writeFile(file, "CREATE TABLE example (id TEXT);\r\n", "utf8");
    assert.deepEqual(await runMigrations(client, directory), ["0001_example.sql"]);
    await writeFile(file, "CREATE TABLE example (id TEXT);\n", "utf8");
    assert.deepEqual(await runMigrations(client, directory), []);
    await writeFile(file, "CREATE TABLE example (id TEXT, changed BOOLEAN);\n", "utf8");
    await assert.rejects(() => runMigrations(client, directory), /checksum mismatch/i);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

const databaseUrl = process.env.THINKAI_TEST_DATABASE_URL;
const integration = databaseUrl ? test : test.skip;
integration("PostgreSQL migration metadata rejects a modified applied SQL file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "thinkai-pg-migrations-"));
  const schema = "thinkai_pg_migration_checksum";
  const admin = NodePostgresClient.fromConnectionString(databaseUrl!);
  await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema}`); await admin.close();
  const client = NodePostgresClient.fromConnectionStringInSchema(databaseUrl!, schema);
  try {
    const file = join(directory, "0001_example.sql");
    await writeFile(file, "CREATE TABLE example_checksum (id TEXT);", "utf8");
    await runMigrations(client, directory);
    await writeFile(file, "CREATE TABLE example_checksum (id TEXT, changed BOOLEAN);", "utf8");
    await assert.rejects(() => runMigrations(client, directory), /checksum mismatch/i);
  } finally { await client.close(); await rm(directory, { recursive: true, force: true }); }
});
