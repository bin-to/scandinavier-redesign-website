import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const base = "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d";
const outDir = "media/einrichtung";
fs.mkdirSync(outDir, { recursive: true });

const assets = [
  ["step-03-duo-bestand.jpg", `${base}/663f6108a4b14d35525be68d_Bild1.JPG`],
  ["step-04-smartlogin-qr.png", `${base}/663f602948062add2ceb8bd5_Bild2.png`],
  ["step-05-datev-hinweis.jpg", `${base}/663f6223d85cd43ed14d6d46_Bild3.JPG`],
  ["step-05-datev-hinweis-2.png", `${base}/663f602ab97411d256f113e4_Bild4.png`],
  ["step-06-ok.png", `${base}/663f602b52891a0ca1e2647b_Bild5.png`],
  ["step-07-fabrik-symbol.jpg", `${base}/663f62f153275a78f27253af_Bild5.JPG`],
  ["step-07-unternehmen.jpg", `${base}/663f637228994c3d49e99085_Bild8.JPG`],
  ["step-07-ok.jpg", `${base}/663f63e2cd5e95538db89789_Bild9.JPG`],
  ["step-08-upload.png", `${base}/663f648f72a87455f94fcd4b_Bild10.png`],
  ["hero-scanner.png", `${base}/5ac25062de609ec55eaf910c_PlustekA250-Tansparent.png`],
];

for (const [file, url] of assets) {
  const dest = path.join(outDir, file);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(dest));
  console.log("ok", file);
}
