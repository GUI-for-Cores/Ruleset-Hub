import fs from "fs";
import { meta, sing } from "./description-map.mjs";

function generate(client, path, geodata, ext) {
  const dirs = fs.readdirSync(path, { encoding: "utf-8" });
  const files = dirs.filter((file) => file.endsWith(ext));
  const list = files.map((item) => {
    const name = item.substring(0, item.length - ext.length);
    const content = fs.readFileSync(path + item, { encoding: "utf-8" });
    let count = 0;

    if (ext === ".list") {
      count = content.split("\n").length;
    } else if (ext === ".json") {
      count = JSON.parse(content).rules.reduce(
        (p, c) =>
          Object.values(c).reduce(
            (p, c) => (Array.isArray(c) ? p + c.length : p + 1),
            0
          ) + p,
        0
      );
    }

    return {
      name,
      description: { meta, sing }[client][name],
      type: geodata,
      count,
    };
  });
  return list;
}

function generateMeta() {
  const geosite = generate("meta", "./meta/geo/geosite/", "geosite", ".list");
  const geoip = generate("meta", "./meta/geo/geoip/", "geoip", ".list");
  const content = JSON.stringify({
    geosite:
      "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/",
    geoip:
      "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/",
    list: geosite.concat(geoip),
  });

  fs.writeFileSync("./meta.json", content, { encoding: "utf-8" });
}

function generateSing() {
  const geosite = generate("sing", "./sing/geo/geosite/", "geosite", ".json");
  const geoip = generate("sing", "./sing/geo/geoip/", "geoip", ".json");
  const content = JSON.stringify({
    geosite:
      "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geosite/",
    geoip:
      "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geoip/",
    list: geosite.concat(geoip),
  });

  fs.writeFileSync("./sing.json", content, { encoding: "utf-8" });
}

generateMeta();
generateSing();
