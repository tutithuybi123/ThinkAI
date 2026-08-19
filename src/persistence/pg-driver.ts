import { Pool, type PoolClient } from "pg";
import type { PostgresClient, PostgresQueryResult, PostgresTransaction } from "./index.js";

class PgTransaction implements PostgresTransaction {
  public constructor(private readonly client: PoolClient) {}
  public async query<Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, values: readonly unknown[] = []): Promise<PostgresQueryResult<Row>> {
    const result = await this.client.query<Row>(sql, [...values]);
    return { rows: result.rows };
  }
}

/** Real node-postgres adapter; transactions are always pinned to one checked-out client. */
export class NodePostgresClient implements PostgresClient {
  public constructor(private readonly pool: Pool) {}
  public static fromConnectionString(connectionString: string): NodePostgresClient { return new NodePostgresClient(new Pool({ connectionString })); }
  public static fromConnectionStringInSchema(connectionString: string, schema: string): NodePostgresClient {
    if (!/^[a-z_][a-z0-9_]*$/u.test(schema)) throw new Error("PostgreSQL schema name is invalid.");
    return new NodePostgresClient(new Pool({ connectionString, onConnect: async (client) => { await client.query(`SET search_path TO ${schema}`); } }));
  }
  public async query<Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, values: readonly unknown[] = []): Promise<PostgresQueryResult<Row>> {
    const result = await this.pool.query<Row>(sql, [...values]); return { rows: result.rows };
  }
  public async transaction<T>(work: (transaction: PostgresTransaction) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try { await client.query("BEGIN"); const result = await work(new PgTransaction(client)); await client.query("COMMIT"); return result; }
    catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  }
  public async close(): Promise<void> { await this.pool.end(); }
}
