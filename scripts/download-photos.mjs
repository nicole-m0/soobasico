import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync("public/images", { recursive: true });
const photos = [
  ["hero", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85"],
  ["care", "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1000&q=85"],
];
for (const [name, url] of photos) {
  const response = await fetch(url);
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`Falha no download de ${name}: ${response.status}`);
  writeFileSync(`public/images/${name}.jpg`, Buffer.from(await response.arrayBuffer()));
  console.info(`Fotografia ${name} salva localmente.`);
}
