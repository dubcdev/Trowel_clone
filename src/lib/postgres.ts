export type QueryValue = string | number | boolean | null | Date | string[] | Record<string, unknown>;

export type QueryResult<Row> = {
  rows: Row[];
  rowCount: number;
};

export type DatabaseClient = {
  query<Row = Record<string, unknown>>(sql: string, values?: QueryValue[]): Promise<QueryResult<Row>>;
  transaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
};

export type PostgresConfig = {
  connectionString?: string;
  ssl: boolean;
  maxConnections: number;
  ready: boolean;
  missing: string[];
};

export function getPostgresConfig(): PostgresConfig {
  const connectionString = import.meta.env.VITE_TROWEL_DATABASE_URL;
  const missing = connectionString ? [] : ["VITE_TROWEL_DATABASE_URL"];

  return {
    connectionString,
    ssl: import.meta.env.VITE_TROWEL_DATABASE_SSL !== "false",
    maxConnections: Number(import.meta.env.VITE_TROWEL_DATABASE_POOL_SIZE ?? 5),
    ready: missing.length === 0,
    missing,
  };
}

export function createUnavailableDatabaseClient(): DatabaseClient {
  return {
    async query() {
      throw new Error("PostgreSQL client is not connected yet. Keep repository mode set to mock until database credentials are configured.");
    },
    async transaction(callback) {
      return callback(createUnavailableDatabaseClient());
    },
  };
}
