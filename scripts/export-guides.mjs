import fs from "fs";

const h = fs.readFileSync("support-page.html", "utf8");
const cats = ["Inbetriebnahme", "Handhabung", "Wartung", "Fragen zum Scanner", "Schnittstellen/SCANZIELE"];
let current = "inbetriebnahme";
const slugMap = {
  Inbetriebnahme: "inbetriebnahme",
  Handhabung: "handhabung",
  Wartung: "wartung",
  "Fragen zum Scanner": "scanner",
  "Schnittstellen/SCANZIELE": "schnittstellen",
};

const chunk = h.slice(h.indexOf("Inbetriebnahme"), h.indexOf("sectionersatzteile"));
const re = /href="(\/supports\/[^"]+)"[^>]*>([^<]+)</g;
const out = [];
let m;
while ((m = re.exec(chunk))) {
  const label = m[2].replace(/\s+/g, " ").trim();
  if (!label || label.length < 4) continue;
  out.push({ href: `https://www.scandinavier.de${m[1]}`, label, category: current });
}

// Re-parse with category headers
const parts = chunk.split(/<div class="text-block-26">/);
const items = [];
for (const part of parts) {
  const catName = part.match(/^([^<]+)</)?.[1]?.trim();
  if (catName && slugMap[catName]) current = slugMap[catName];
  const links = [...part.matchAll(/href="(\/supports\/[^"]+)"[^>]*>([^<]+)</g)];
  links.forEach((lm) => {
    items.push({
      href: `https://www.scandinavier.de${lm[1]}`,
      label: lm[2].replace(/\s+/g, " ").trim(),
      category: current,
    });
  });
}

console.log(JSON.stringify(items.slice(0, 40), null, 2));
console.error("total", items.length);
