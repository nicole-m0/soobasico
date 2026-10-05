import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("production order API rejects the development CPF before accessing the database", () => {
  const script = `
    const assert = require('node:assert/strict');
    const { POST } = require('./src/app/api/pedidos/route');
    const { NextRequest } = require('next/server');
    const { prisma } = require('./src/lib/prisma');
    (async () => {
      const response = await POST(new NextRequest('http://localhost:3000/api/pedidos', {
        method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
        body: JSON.stringify({ customer: { name: 'Cliente Teste CPF', whatsapp: '89999991234', cpf: '111.111.111-11',
          postalCode: '64500000', street: 'Rua de Teste', number: '10', complement: '', neighborhood: 'Centro',
          city: 'Oeiras', state: 'PI', reference: '', privacyAccepted: true },
          items: [{ productId: 'cpf-test', quantity: 1 }], idempotencyKey: crypto.randomUUID() })
      }));
      assert.equal(response.status, 400);
      const body = await response.json();
      assert.match(body.error, /CPF/);
      assert.equal(body.orderId, undefined);
      assert.equal(response.headers.get('set-cookie'), null);
      await prisma.$disconnect();
    })().catch(error => { console.error(error); process.exit(1); });
  `;
  const result = spawnSync(process.execPath, ["--import", "tsx", "--eval", script], {
    env: { ...process.env, NODE_ENV: "production", APP_ORIGIN: "http://localhost:3000",
      DATABASE_URL: "postgresql://test:test@127.0.0.1:1/unavailable?connect_timeout=1" },
    encoding: "utf8", timeout: 20_000,
  });
  assert.equal(result.status, 0, result.stderr);
});
