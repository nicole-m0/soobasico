import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { productPrice } from "../../src/lib/types";
process.loadEnvFile(".env");
const db = new PrismaClient();
test.afterAll(() => db.$disconnect());

test("catalog pagination, search, every filter and sorting match database values", async ({ page }) => {
  const products = await db.product.findMany({ where: { active: true }, include: { category: true, brand: true }, orderBy: { createdAt: "desc" } });
  await page.goto("/produtos");
  await expect(page.locator(".results-count")).toContainText(`${products.length} produtos`);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/catalog-${width}.png`, fullPage: true });
  }
  const visited: string[] = [];
  for (let n = 1; n <= Math.ceil(products.length / 12); n++) {
    visited.push(...await page.locator(".product-name").allTextContents());
    if (n < Math.ceil(products.length / 12)) await page.getByRole("button", { name: "Próxima", exact: true }).click();
  }
  expect(new Set(visited)).toEqual(new Set(products.map(p => p.name)));
  const query = page.getByRole("textbox", { name: "Buscar no catálogo" });
  for (const search of ["BATOM", "UNHAS", "basica", "skincare"]) {
    await query.fill(search);
    const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const expected = products.filter(p => normalize(`${p.name} ${p.brand.name} ${p.category.name}`).includes(search.toLowerCase()));
    await expect(page.locator(".results-count")).toContainText(`${expected.length} ${expected.length === 1 ? "produto" : "produtos"}`);
    await expect(page.locator(".product-card")).toHaveCount(Math.min(12, expected.length));
  }
  await query.fill("");
  await page.getByLabel("Unhas", { exact: true }).check();
  await expect(page.locator(".product-card")).toHaveCount(products.filter(p => p.category.slug === "unhas").length);
  await page.getByLabel("Todos os produtos", { exact: true }).check();
  await page.getByLabel("Marca", { exact: true }).selectOption("Essência");
  await expect(page.locator(".product-card")).toHaveCount(products.filter(p => p.brand.name === "Essência").length);
  await page.getByLabel("Marca", { exact: true }).selectOption("");
  await page.getByLabel("Faixa de preço", { exact: true }).selectOption("15");
  await expect(page.locator(".results-count")).toContainText(`${products.filter(p => productPrice(p) <= 1500).length} produtos`);
  await page.getByLabel("Faixa de preço", { exact: true }).selectOption("");
  await page.getByLabel("Somente em estoque", { exact: true }).check();
  await expect(page.locator(".results-count")).toContainText(`${products.filter(p => p.stock > 0).length} produtos`);
  await page.getByLabel("Somente em estoque", { exact: true }).uncheck();
  await page.getByLabel("Somente ofertas", { exact: true }).check();
  await expect(page.locator(".old-price")).toHaveCount(products.filter(p => p.promotionalPriceCents !== null && p.promotionalPriceCents > 0 && p.promotionalPriceCents < p.priceCents).length);
  await page.getByLabel("Somente ofertas", { exact: true }).uncheck();
  for (const sort of ["low", "high", "az", "new"]) {
    await page.getByLabel("Ordenar produtos").selectOption(sort);
    const expected = [...products].sort((a, b) => sort === "low" ? productPrice(a) - productPrice(b) : sort === "high" ? productPrice(b) - productPrice(a) : sort === "az" ? a.name.localeCompare(b.name, "pt-BR") : b.createdAt.getTime() - a.createdAt.getTime());
    await expect(page.locator(".product-name")).toHaveText(expected.slice(0, 12).map(p => p.name));
  }
});

test("low stock cart limits, rapid additions, persistence and related products", async ({ page }) => {
  const product = await db.product.findUniqueOrThrow({ where: { slug: "blush-rose" } });
  await page.goto(`/produtos/${product.slug}`);
  const increase = page.getByRole("button", { name: /Aumentar quantidade/ });
  await increase.click(); await increase.click(); await expect(increase).toBeDisabled();
  await expect(page.locator(".detail-buy .quantity span")).toHaveText("3");
  const related = await page.locator(".related .product-name").allTextContents();
  expect(related).not.toContain(product.name); expect(related.length).toBeLessThanOrEqual(4);
  const expectedRelated = await db.product.findMany({ where: { active: true, categoryId: product.categoryId, id: { not: product.id } } });
  expect(related.every(name => expectedRelated.some(p => p.name === name))).toBe(true);
  await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).click();
  await expect(page.getByRole("button", { name: "Adicionar ao carrinho", exact: true })).toBeDisabled();
  await page.goto("/"); await page.goto("/carrinho"); await page.reload();
  await expect(page.locator(".quantity span")).toHaveText("3");
  await expect(page.getByRole("button", { name: /Aumentar quantidade/ })).toBeDisabled();
  await page.goto(`/produtos/${product.slug}`);
  await page.evaluate(id => localStorage.setItem("sob-cart-v1", JSON.stringify([{ productId: id, quantity: 90 }])), product.id);
  await page.reload(); await page.goto("/carrinho");
  await expect(page.locator(".quantity span")).toHaveText("3");
  await page.goto("/produtos/mascara-facial");
  await expect(page.getByRole("button", { name: "Indisponível", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Comprar agora", exact: true })).toBeDisabled();
  await page.goto("/produtos/gloss-crystal");
  // Dispatch repeated additions in one event loop tick, before React re-renders.
  await page.getByRole("button", { name: "Adicionar ao carrinho", exact: true }).evaluate(button => {
    for (let i = 0; i < 10; i++) (button as HTMLButtonElement).click();
  });
  await page.goto("/carrinho");
  await expect(page.locator(".cart-row").filter({ hasText: "Gloss Labial Crystal" }).locator(".quantity span")).toHaveText("1");
});

test("existing administrative data operations reflect in public catalog", async ({ page }) => {
  const base = await db.product.findFirstOrThrow();
  const fixture = await db.product.create({ data: { name: "Teste administrativo temporário", slug: `admin-check-${randomUUID()}`, description: "Somente teste", categoryId: base.categoryId, brandId: base.brandId, priceCents: 1290, stock: 8 } });
  try {
    await page.goto(`/produtos/${fixture.slug}`);
    await expect(page.locator(".detail-price strong")).toContainText("12,90");
    await db.product.update({ where: { id: fixture.id }, data: { name: "Produto Editado Temporário", priceCents: 1990, stock: 0 } });
    await page.reload();
    await expect(page.getByRole("heading", { name: "Produto Editado Temporário" })).toBeVisible();
    await expect(page.locator(".detail-price strong")).toContainText("19,90");
    await expect(page.getByRole("button", { name: "Indisponível", exact: true })).toBeDisabled();
    await db.product.update({ where: { id: fixture.id }, data: { active: false } });
    await page.goto("/produtos?busca=Produto%20Editado%20Temporário");
    await expect(page.locator(".product-card")).toHaveCount(0);
    await page.goto(`/produtos/${fixture.slug}`);
    await expect(page.getByRole("heading", { name: "Essa página não está disponível" })).toBeVisible();
  } finally { await db.product.delete({ where: { id: fixture.id } }); }
});
