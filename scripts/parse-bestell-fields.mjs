import fs from "fs";
const h = fs.readFileSync("tmp-bestell.html", "utf8");
const start = h.indexOf("Rechnungsadresse");
const end = h.indexOf("bestellformular_neu");
console.log(h.slice(start, start + 8000).replace(/<[^>]+>/g, "\n").replace(/\n+/g, "\n").trim());
