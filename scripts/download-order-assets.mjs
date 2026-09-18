import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const base = "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d";
const outDir = "media/order";
fs.mkdirSync(outDir, { recursive: true });

const assets = [
  ["a450-product.jpg", `${base}/6478fd8e47d701e2ca6de346_551TE-00300-20-2-p-1600.jpg`],
  ["a650-product.jpg", `${base}/67f55a42a8cb70cddc0399d4_ED1020EC-00100-2-p-1600.jpg`],
  ["a280-product.png", `${base}/5bd99b25557fae2f964b5e9c_PlusttekFrontAnsicht-klein-p-1080.png`],
  ["datev-meine-steuern.svg", `${base}/67f6305031584498b007cdab_meine-steuern-svg.svg`],
  ["datev-unternehmen-online.svg", `${base}/67f6308243ac634659acb350_unternehmen-online-svg.svg`],
  ["demo-info.png", `${base}/5dc1da9780d7b3410f4de6ac_icons8-probeversion-64.png`],
];

for (const [file, url] of assets) {
  const dest = path.join(outDir, file);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(dest));
  console.log("ok", file);
}
