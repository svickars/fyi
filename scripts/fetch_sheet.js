// From https://github.com/the-pudding/starter

import fs from "fs";
import request from "request";

const CWD = process.cwd(),
  CONFIG_PATH = `${CWD}/config.json`,
  CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")),
  { sheet } = CONFIG.google;

const makeRequest = (opt, cb) => {
  const base = "https://docs.google.com/spreadsheets/u/1/d";
  const url = `${base}/${opt.id}/export?format=csv&id=${opt.id}&gid=${opt.gid}`;
  request(url, (error, response, body) => {
    if (error) console.log(error);
    else if (response) {
      const file = `${CWD}/${opt.filepath || "src/assets/data/sheet.csv"}`;
      fs.writeFile(file, body, (err) => {
        if (err) console.error(err);
        cb();
      });
    }
  });
};

function init() {
  let i = 0;
  const next = () => {
    const d = sheet[i];
    if (d && d.id)
      makeRequest(d, () => {
        i += 1;
        if (i < sheet.length) next();
        else process.exit();
      });
  };

  next();
}

init();
