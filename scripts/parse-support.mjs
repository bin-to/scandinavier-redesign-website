import fs from "fs";

const h = fs.readFileSync("support-page.html", "utf8");
const start = h.indexOf("sectionersatzteile");
const end = h.indexOf("formularersatzteile");
const chunk = h.slice(start, end);

const blocks = chunk.split(/class="ersatzteil w-node-/);
blocks.slice(1).forEach((block, i) => {
  const title = block.match(/ersatzteilheading[^>]*>([^<]+)/)?.[1]?.replace(/\s+/g, " ").trim();
  const price = block.match(/(\d+,\d+)\s*EUR/)?.[1];
  const sku = block.match(/Artikelnummer[^:]*:\s*([^<]+)/)?.[1]?.trim();
  const img = block.match(/src="([^"]+\.(jpg|jpeg|png))"/)?.[1];
  console.log(JSON.stringify({ id: i + 1, title, price, sku, img }));
});
