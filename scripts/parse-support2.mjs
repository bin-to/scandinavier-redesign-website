import fs from "fs";

const h = fs.readFileSync("support-page.html", "utf8");
const links = [...h.matchAll(/href="(\/supports\/[^"]+)"[^>]*>([^<]+)</g)]
  .slice(0, 30)
  .map((m) => ({ href: m[1], label: m[2].replace(/\s+/g, " ").trim() }));
console.log(JSON.stringify(links, null, 2));
