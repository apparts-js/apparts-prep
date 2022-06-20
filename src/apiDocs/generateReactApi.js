const {
  genApiDocs: { getApi },
} = require("../");
const { app } = require("../myTestEndpoint");
const { apiToReact } = require("./apiToReact");

const html = apiToReact(getApi(app), "testcommithash");
const fs = require("fs");
fs.writeFileSync("./src/apiDocs/api-react.html", html);
