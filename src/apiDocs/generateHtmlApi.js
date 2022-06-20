const {
  genApiDocs: { getApi },
} = require("../");
const { app } = require("../myTestEndpoint");
const { apiToHtml } = require("./apiToHtml");

const html = apiToHtml(getApi(app), "testcommithash");
const fs = require("fs");
fs.writeFileSync("./src/apiDocs/api.html", html);
