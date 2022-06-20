const { getApi } = require("./");
const { app } = require("../myTestEndpoint");
const { apiToHtml } = require("./apiToHtml");
const fs = require("fs");

describe("Full e2e test", () => {
  test("testApi as HTML", () => {
    const html = apiToHtml(getApi(app), "testcommithash");
    expect(html).toBe(fs.readFileSync("./src/apiDocs/api.html").toString());
  });
});
