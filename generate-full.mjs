import fs from "fs";
import DescriptionMap from "./description-map.mjs";

function generate(path, geodata, ext) {
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
      description: DescriptionMap[name],
      type: geodata,
      count,
    };
  });
  return list;
}

function generateMeta() {
  const geosite = generate("./meta/geo/geosite/", "geosite", ".list");
  const geoip = generate("./meta/geo/geoip/", "geoip", ".list");
  const list = sortList("meta.json", geosite.concat(geoip));
  const content = JSON.stringify({
    geosite:
      "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/",
    geoip:
      "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/",
    list,
  });

  fs.writeFileSync("./meta-full.json", content, { encoding: "utf-8" });
}

function generateSing() {
  const geosite = generate("./sing/geo/geosite/", "geosite", ".json");
  const geoip = generate("./sing/geo/geoip/", "geoip", ".json");
  const list = sortList("sing.json", geosite.concat(geoip));
  const content = JSON.stringify({
    geosite:
      "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geosite/",
    geoip:
      "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geoip/",
    list,
  });

  fs.writeFileSync("./sing-full.json", content, { encoding: "utf-8" });
}

function sortList(file, list) {
  const liteContent = fs.readFileSync(file, { encoding: "utf-8" });
  const liteList = JSON.parse(liteContent).list;

  const indexMap = new Map();
  liteList.forEach((item, index) => {
    const key = `${item.name}__${item.type}`;
    indexMap.set(key, index);
  });

  return list.sort((a, b) => {
    const aKey = `${a.name}__${a.type}`;
    const bKey = `${b.name}__${b.type}`;

    const aIndex = indexMap.has(aKey) ? indexMap.get(aKey) : Infinity;
    const bIndex = indexMap.has(bKey) ? indexMap.get(bKey) : Infinity;

    return aIndex - bIndex;
  });
}

generateMeta();
generateSing();
