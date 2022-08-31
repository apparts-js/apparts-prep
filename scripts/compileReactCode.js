const fs = require("fs");

const reactDocs = fs.readFileSync("./src/apiDocs/reactDocs.js");

fs.writeFileSync(
  "./src/apiDocs/reactDocs_compiled.js",
  `

module.exports = ${JSON.stringify(reactDocs.toString())};

`
);
