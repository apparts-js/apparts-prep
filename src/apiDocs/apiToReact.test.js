const { getApi } = require("./");
const { app } = require("../myTestEndpoint");
const { apiToReact } = require("./apiToReact");
const fs = require("fs");

describe("Full e2e test", () => {
  test("testApi as REACT", () => {
    const react = apiToReact(getApi(app), "testcommithash");
    expect(react).toBe(
      fs.readFileSync("./src/apiDocs/api-react.html").toString()
    );
  });
});
