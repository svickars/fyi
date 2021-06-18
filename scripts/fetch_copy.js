// From https://github.com/the-pudding/starter

const fs = require("fs"),
  archieml = require("archieml"),
  request = require("request");

const CWD = process.cwd(),
  CONFIG_PATH = `${CWD}/config.json`,
  CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")),
  { doc } = CONFIG.google;

const makeRequest = (opt, cb) => {
  const url = `https://docs.google.com/document/d/${opt.id}/export?format=txt`;
  request(url, (error, response, body) => {
    if (error) console.log(error);
    else if (response) {
      const parsed = archieml.load(body);
      const str = JSON.stringify(parsed);
      const file = `${CWD}/${opt.filepath || "data/doc.json"}`;
      fs.writeFile(file, str, (err) => {
        if (err) console.error(err);
        cb();
      });
    }
  });
};

function init() {
  console.log("Fetching copy from Google Docs...");
  let i = 0;
  const next = () => {
    const d = doc[i];
    if (d.id)
      makeRequest(d, () => {
        i += 1;
        if (i < doc.length) next();
        else process.exit();
      });
  };

  next();
  console.log("Done!");
}

init();
