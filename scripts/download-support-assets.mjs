import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const outDir = "media/support";
fs.mkdirSync(`${outDir}/products`, { recursive: true });
fs.mkdirSync(`${outDir}/hero`, { recursive: true });

const assets = [
  ["products/einzug.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c1806bd61a530be81297a2a_Einzug.jpg"],
  ["products/netzteil.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c1806bdc934d07db55c902f_Netzteil.jpg"],
  ["products/rolle02.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c1806bd2f30f90e9d5c3bcc_Rolle02.jpg"],
  ["products/rolle01.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c1806bdbfa8befdfbde5116_Rolle01.jpg"],
  ["products/maintenance-a350.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c180b7c0dc594d09e631728_Maintance01.jpg"],
  ["products/maintenance-a280.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/6467a8dc97628a3a6dc2196d_Maintenance_A280.jpg"],
  ["products/bag.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c180dbdc934d098a95c9b67_Bag01.jpg"],
  ["products/usb.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c180d18c934d019b25c9ac3_USB.jpg"],
  ["hero/kuhn-support.jpg", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5bc2d8205b2ebf4173525091_KUHN%20Pic.jpg"],
  ["icons/teamviewer.png", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5d491948d6fdde8092562c08_icons8-teamviewer-100.png"],
  ["icons/wlan.png", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c0bae1e36137d6abddb9744_i-ons8-wi-fi-logo-90.png"],
  ["icons/scanner.png", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c0bae1da90b668b5c86cdc2_i-ons8-scanner-100.png"],
  ["icons/broom.png", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c8d445c50ed9d507d6dd1bd_icons8-broom-52.png"],
  ["icons/documents.png", "https://cdn.prod.website-files.com/5ac1ccc5d0f2645289fc530d/5c710e5a2d05ceba07968027_icons8-documents-50.png"],
];

fs.mkdirSync(`${outDir}/icons`, { recursive: true });

for (const [file, url] of assets) {
  const dest = path.join(outDir, file);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(dest));
  console.log("ok", file);
}
