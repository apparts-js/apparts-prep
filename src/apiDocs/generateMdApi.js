const {
  genApiDocs: { getApi },
} = require("../");
const { app } = require("../myTestEndpoint");
const { apiToMd } = require("./apiToMd");

const html = apiToMd(getApi(app), "testcommithash");
const fs = require("fs");
fs.writeFileSync("./src/apiDocs/api.md", html);
