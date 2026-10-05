import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

for (const environment of ["development", "test", "production"] as const) {
  test(`checkout CPF exception is restricted to non-production: ${environment}`, () => {
    // Isolate NODE_ENV so production assertions cannot change other tests' environment.
    const script = `
      const assert = require('node:assert/strict');
      const { isValidCpf, validateCustomer } = require('./src/lib/validation');
      const customer = { name: 'Cliente Teste CPF', whatsapp: '89999991234', cpf: '111.111.111-11',
        postalCode: '64500000', street: 'Rua de Teste', number: '10', complement: '',
        neighborhood: 'Centro', city: 'Oeiras', state: 'PI', reference: '', privacyAccepted: true };
      assert.equal(isValidCpf(customer.cpf), false);
      for (const cpf of ['111.111.111-11', '11111111111']) {
        if (process.env.NODE_ENV === 'production') {
          assert.throws(() => validateCustomer({ ...customer, cpf }), /CPF/);
        } else {
          assert.equal(validateCustomer({ ...customer, cpf }).cpf, '11111111111');
        }
      }
      for (const cpf of ['22222222222', '00000000000', '52998224724', '1111111111']) {
        assert.throws(() => validateCustomer({ ...customer, cpf }), /CPF/);
      }
      assert.equal(validateCustomer({ ...customer, cpf: '52998224725' }).cpf, '52998224725');
      const valid = { ...customer, cpf: '52998224725' };
      for (const patch of [{ whatsapp: '00000000000' }, { postalCode: '00000000' },
        { state: 'ZZ' }, { name: 'Cliente' }, { privacyAccepted: false }]) {
        assert.throws(() => validateCustomer({ ...valid, ...patch }));
      }
    `;
    const result = spawnSync(process.execPath, ["--import", "tsx", "--eval", script], {
      env: { ...process.env, NODE_ENV: environment }, encoding: "utf8", timeout: 20_000,
    });
    assert.equal(result.status, 0, result.stderr);
  });
}
