import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const databaseDir = resolve(".local-postgres/data");
const pg = new EmbeddedPostgres({ databaseDir, user: "soobasico", password: "soobasico_local", port: 54329, persistent: true, authMethod: "scram-sha-256", postgresFlags: ["-h", "127.0.0.1"], onLog: () => {}, onError: () => {} });
try {
  if (!existsSync(resolve(databaseDir, "PG_VERSION"))) await pg.initialise();
  await pg.start();
  const client = pg.getPgClient(); await client.connect();
  const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", ["soobasico"]);
  await client.end();
  if (!existing.rowCount) await pg.createDatabase("soobasico");
  console.info("PostgreSQL local pronto em 127.0.0.1:54329. Dados em .local-postgres/data. Mantenha este terminal aberto.");
  let stopping = false;
  const stop = async () => { if (stopping) return; stopping = true; await pg.stop(); process.exit(0); };
  process.on("SIGINT", stop); process.on("SIGTERM", stop);
  setInterval(() => {}, 60_000);
} catch {
  console.error("Não foi possível iniciar PostgreSQL. Verifique a porta 54329 e se o banco já está aberto.");
  process.exitCode = 1;
}
