const fs = require("fs"),
  path = require("path");

const CWD = process.cwd(),
  templatePath = path.resolve(CWD, "src/template.html"),
  indexPath = path.resolve(CWD, "public/index.html");

const template = fs.readFileSync(templatePath, "utf8");

fs.writeFileSync(indexPath, template);
