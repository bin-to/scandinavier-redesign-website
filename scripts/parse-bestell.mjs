import fs from "fs";
const h = fs.readFileSync("tmp-bestell.html", "utf8");
const chunks = ["kanzlei", "1.699", "1.199", "975", "785", "A355", "comfort", "Plustek", "Premium-Plus", "37,50", "5,00", "175,00", "99,00"];
for (const q of chunks) {
  const i = h.indexOf(q);
  if (i >= 0) console.log("\n===", q, "===\n", h.slice(Math.max(0, i - 80), i + 280).replace(/\s+/g, " "));
}
