import process from 'node:process';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    'DATABASE_URL is required. Copy .env.example to .env and start the local db service.'
  );
  process.exitCode = 1;
} else {
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 5_000
  });

  try {
    await client.connect();
    const result = await client.query('SELECT 1 AS ready');
    if (result.rows[0]?.ready !== 1) {
      throw new Error(
        'PostgreSQL readiness query returned an unexpected value.'
      );
    }
    console.log('PostgreSQL smoke test passed.');
  } catch (error) {
    console.error(
      'PostgreSQL smoke test failed:',
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}
