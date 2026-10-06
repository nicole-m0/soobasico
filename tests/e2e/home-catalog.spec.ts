import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { isOnSale, productPrice } from "../../src/lib/types";
process.loadEnvFile(".env");
const db = new PrismaClient();
test.afterAll(() => db.$disconnect());
async function checkImages(page: Page) {
  for (const img of await page.locator(".product-visual img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
}

test("home reveals every active database product in place, with illustrations at all widths", async ({ page }) => {
  const products = await db.product.findMany({ where: { active: true } });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Todos os produtos", exact: true })).toBeVisible();
  await expect(page.locator(".product-card")).toHaveCount(12);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await checkImages(page);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const columns = await page.locator(".home-product-grid").first().evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(width < 768 ? 2 : width < 1024 ? 3 : 4);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `test-results/home-full-catalog-${width}.png`, fullPage: true });
  }
  for (const count of [24, 36, products.length]) {
    await page.getByRole("button", { name: "Ver mais produtos", exact: true }).click();
    await expect(page.locator(".product-card")).toHaveCount(count);
    expect(new URL(page.url()).pathname).toBe("/");
  }
  expect(new Set(await page.locator(".product-name").allTextContents())).toEqual(new Set(products.map(p => p.name)));
  await expect(page.getByRole("button", { name: "Ver mais produtos", exact: true })).toHaveCount(0);
  await expect(page.locator(".product-placeholder")).toHaveCount(0);
  await checkImages(page);
  await page.screenshot({ path: "test-results/home-all-40.png", fullPage: true });
});

test("header categories, offers, search and clearing operate on the home catalog", async ({ page }) => {
  const products = await db.product.findMany({ where: { active: true }, include: { category: true, brand: true } });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Categorias", exact: true });
  const categories = [...new Map(products.map(p => [p.category.slug, p.category])).values()];
  for (const c of categories) {
    await nav.getByRole("link", { name: c.name, exact: true }).click();
    await expect(page.locator(".product-card")).toHaveCount(products.filter(p => p.category.slug === c.slug).length);
    expect(new URL(page.url()).pathname).toBe("/");
  }
  await nav.getByRole("link", { name: "Ofertas", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(products.filter(isOnSale).length);
  await expect(page.locator(".product-card .old-price")).toHaveCount(products.filter(isOnSale).length);
  await nav.getByRole("link", { name: "Todos os produtos", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(12);
  const search = page.getByRole("textbox", { name: "Buscar por produto, marca ou categoria" });
  for (const [query, count] of [["GLOSS", 1], ["esmalte", 4], ["skincare", 6]] as const) {
    await search.fill(query); await search.press("Enter");
    await expect(page.locator(".product-card")).toHaveCount(count);
    expect(new URL(page.url()).pathname).toBe("/");
  }
  await page.getByRole("button", { name: "Limpar busca", exact: true }).click();
  await expect(page.locator(".results-count")).toHaveText(`${products.length} produtos`);
  await expect(page.locator(".product-card")).toHaveCount(12);
});

test("home filters, ordering, quick add and sold out controls work on mobile", async ({ page }) => {
  const products = await db.product.findMany({ where: { active: true }, include: { brand: true }, orderBy: { createdAt: "desc" } });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Filtrar", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Marca", { exact: true }).selectOption("Essência");
  await dialog.getByLabel("Faixa de preço", { exact: true }).selectOption("50");
  await dialog.getByLabel("Somente em estoque", { exact: true }).check();
  const selected = products.filter(p => p.brand.name === "Essência" && productPrice(p) <= 5000 && p.stock > 0);
  await dialog.getByRole("button", { name: `Ver ${selected.length} produtos`, exact: true }).click();
  await expect(page.locator(".product-name")).toHaveText(selected.map(p => p.name));
  await page.getByRole("button", { name: /Filtrar/ }).click();
  await dialog.getByRole("button", { name: "Limpar filtros" }).click();
  await dialog.getByRole("button", { name: `Ver ${products.length} produtos`, exact: true }).click();
  for (const sort of ["low", "high", "az", "new"]) {
    await page.getByLabel("Ordenar produtos").selectOption(sort);
    const expected = [...products].sort((a, b) => sort === "low" ? productPrice(a) - productPrice(b) : sort === "high" ? productPrice(b) - productPrice(a) : sort === "az" ? a.name.localeCompare(b.name, "pt-BR") : b.createdAt.getTime() - a.createdAt.getTime());
    await expect(page.locator(".product-name")).toHaveText(expected.slice(0, 12).map(p => p.name));
  }
  const query = page.getByRole("textbox", { name: "Buscar no catálogo" });
  await query.fill("Gloss Labial Crystal");
  const add = page.getByRole("button", { name: "Adicionar Gloss Labial Crystal ao carrinho" });
  await add.click(); await expect(add).toBeDisabled();
  await query.fill("Máscara Facial de Cuidado");
  await expect(page.getByRole("button", { name: "Adicionar Máscara Facial de Cuidado ao carrinho" })).toBeDisabled();
  await expect(page.locator(".product-badge.unavailable")).toHaveText("Esgotado");
  await page.goto("/carrinho"); await page.reload();
  await expect(page.locator(".cart-row")).toHaveCount(1);
  await expect(page.locator(".quantity span")).toHaveText("1");
});

test("a new admin product and subsequent edits are reflected on home without a demo list", async ({ page }) => {
  const base = await db.product.findFirstOrThrow();
  const fixture = await db.product.create({ data: { name: "Cadastro temporário da home", slug: `home-check-${randomUUID()}`, description: "Fixture temporária", categoryId: base.categoryId, brandId: base.brandId, priceCents: 1200, stock: 2, images: { create: { url: "/products/demo/gloss-crystal.svg", alt: "Imagem inicial de teste" } } } });
  try {
    await page.goto("/?busca=Cadastro%20temporário%20da%20home#catalogo");
    await expect(page.locator(".product-name")).toHaveText(fixture.name);
    await expect(page.locator(".product-card-bottom strong")).toContainText("12,00");
    await db.product.update({ where: { id: fixture.id }, data: { priceCents: 1800, stock: 0, images: { updateMany: { where: {}, data: { url: "/products/demo/esmalte-vermelho.svg", alt: "Imagem editada de teste" } } } } });
    await page.reload();
    await expect(page.locator(".product-card-bottom strong")).toContainText("18,00");
    await expect(page.locator(".product-visual img")).toHaveAttribute("alt", "Imagem editada de teste");
    await expect(page.locator(".add-button")).toBeDisabled();
    await db.product.update({ where: { id: fixture.id }, data: { active: false } });
    await page.reload(); await expect(page.locator(".product-card")).toHaveCount(0);
  } finally { await db.product.delete({ where: { id: fixture.id } }); }
});
