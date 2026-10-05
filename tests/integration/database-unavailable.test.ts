import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("order API returns 503 when PostgreSQL is unreachable, without claiming success", () => {
  // A separate process isolates Prisma's connection configuration from the store database.
  const script = `
    const { POST } = require('./src/app/api/pedidos/route');
    const { NextRequest } = require('next/server');
    const { prisma } = require('./src/lib/prisma');
    (async () => {
      const request = new NextRequest('http://localhost:3000/api/pedidos', {
        method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
        body: JSON.stringify({
          customer: { name: 'Cliente Teste Indisponibilidade', whatsapp: '89999991234', cpf: '52998224725',
            postalCode: '64500000', street: 'Rua de Teste', number: '1', complement: '', neighborhood: 'Centro',
            city: 'Oeiras', state: 'PI', reference: '', privacyAccepted: true },
          items: [{ productId: 'unavailable-test', quantity: 1 }], idempotencyKey: crypto.randomUUID()
        })
      });
      const response = await POST(request);
      console.log(JSON.stringify({ status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie') }));
      await prisma.$disconnect();
    })().catch(() => process.exit(1));
  `;
  const result = spawnSync(process.execPath, ["--import", "tsx", "--eval", script], {
    env: { ...process.env, DATABASE_URL: "postgresql://test:test@127.0.0.1:1/unavailable?connect_timeout=1", APP_ORIGIN: "http://localhost:3000" },
    encoding: "utf8", timeout: 20_000,
  });
  assert.equal(result.status, 0, "Isolated API check must finish successfully");
  const response = JSON.parse(result.stdout.trim());
  assert.equal(response.status, 503);
  assert.match(response.body.error, /produtos continuam no carrinho/);
  assert.equal(response.body.orderId, undefined);
  assert.equal(response.cookie, null);
});
