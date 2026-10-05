import { test, expect } from "@playwright/test";
const widths = [360, 390, 430, 768, 1024, 1440];
test("responsive home and catalog render without horizontal overflow at all requested widths", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/"); await expect(page.getByRole("heading", { name: /Um toque de beleza/ })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect.poll(() => page.evaluate(() => [...document.images].every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
    await page.goto("/produtos"); await expect(page.locator(".product-card")).toHaveCount(12);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width < 768) { await page.getByRole("button", { name: "Filtrar", exact: true }).click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.getByRole("button", { name: /Ver 12 produtos/ }).click(); }
  }
  expect(errors).toEqual([]);
});
test("search matches brand/category, filters availability and supports no-results state", async ({ page }) => {
  await page.goto("/produtos?busca=Básica"); await expect(page.locator(".product-card")).toHaveCount(5);
  await page.getByRole("textbox", { name: "Buscar no catálogo" }).fill("skincare"); await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByLabel("Somente em estoque", { exact: true }).check(); await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Buscar no catálogo" }).fill("não-existe"); await expect(page.getByText("Nenhum básico por aqui ainda")).toBeVisible();
  await page.getByRole("button", { name: "Ver todos os produtos", exact: true }).click(); await expect(page.locator(".product-card")).toHaveCount(12);
});
test("mobile purchase: persist cart, validate checkout, create real order, protect receipt and generate WhatsApp", async ({ page, browser }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/produtos/batom-rosa-cha");
  await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("adicionado");
  await page.getByRole("link", { name: "Carrinho com 1 produtos" }).click();
  await expect(page.locator(".cart-row")).toHaveCount(1); await page.reload(); await expect(page.locator(".cart-row")).toHaveCount(1);
  await page.getByRole("button", { name: /Aumentar quantidade/ }).click(); await expect(page.locator(".quantity span")).toHaveText("2");
  await page.getByRole("link", { name: "Continuar para finalizar pedido" }).click();
  await page.getByLabel("Nome completo", { exact: true }).fill("Cliente Teste Browser");
  await page.getByLabel("WhatsApp com DDD", { exact: true }).fill("89999991234");
  await page.getByLabel("CPF", { exact: true }).fill("11111111111");
  await page.getByLabel("CEP", { exact: true }).fill("64500000");
  await page.getByLabel("Rua", { exact: true }).fill("Rua de Teste");
  await page.getByLabel("Número", { exact: true }).fill("10");
  await page.getByLabel("Bairro", { exact: true }).fill("Centro");
  await page.getByLabel("Cidade", { exact: true }).fill("Oeiras");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Revisar e confirmar pedido" }).click(); await expect(page.locator(".form-error")).toContainText("CPF");
  await page.getByLabel("CPF", { exact: true }).fill("52998224725");
  await page.getByRole("button", { name: "Revisar e confirmar pedido" }).click(); await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar e criar pedido" }).click();
  await expect(page.getByRole("heading", { name: "Seu pedido foi criado!" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Carrinho com 0 produtos" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const url = new URL((await page.getByRole("link", { name: "Enviar pedido pelo WhatsApp" }).getAttribute("href"))!);
  expect(url.pathname).toBe("/5589994549682"); const message = url.searchParams.get("text")!;
  expect(message).toContain("Cliente Teste Browser"); expect(message).toContain("2x Batom"); expect(message).toContain("44,80"); expect(message).not.toMatch(/CPF|52998224725|pago/i);
  const receiptUrl = page.url(); await page.reload(); await expect(page.getByRole("heading", { name: "Seu pedido foi criado!" })).toBeVisible();
  await page.screenshot({ path: "test-results/confirmation-mobile.png", fullPage: true });
  const other = await browser.newContext(); const unauthorized = await other.newPage(); await unauthorized.goto(receiptUrl);
  await expect(unauthorized.getByRole("heading", { name: "Essa página não está disponível" })).toBeVisible(); await other.close();
  // Revisiting an old receipt must preserve any newly started cart.
  await page.goto("/produtos/batom-rosa-cha"); await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
  await page.goto(receiptUrl); await expect(page.getByRole("link", { name: "Carrinho com 1 produtos" })).toBeVisible();
});
test("order endpoint rejects cross-origin requests without writing personal data", async ({ request }) => {
  const response = await request.post("/api/pedidos", { headers: { origin: "https://example.invalid" }, data: {} });
  expect(response.status()).toBe(403);
});
