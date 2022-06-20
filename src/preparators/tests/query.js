const { defPrep, expectWrong, expectMiss, expectSuccess } = require("./common");
const testTypes = require("./types");

const defPrep2 = (tipe) =>
  typeof tipe === "object"
    ? defPrep("", tipe, tipe.query.myField.type)
    : defPrep("", { query: { myField: { type: tipe } } }, tipe);

describe("Query", () => {
  const transformVal = (val) =>
    encodeURIComponent(typeof val === "object" ? JSON.stringify(val) : val);
  const wrong = (path, val, tipe) =>
    expectWrong(
      path + "?myField=" + transformVal(val),
      {},
      "query",
      "myField",
      tipe
    );
  const right = (path, val, tipe, retVal) => {
    return expectSuccess(
      path + "?myField=" + transformVal(val),
      {},
      retVal !== undefined ? retVal : val
    );
  };

  test("Should reject malformated JSON", async () => {
    const path = defPrep("", { query: { a: { type: "array_int" } } });
    await expectWrong(
      path + "?a=" + encodeURIComponent("[blubb"),
      {},
      "query",
      "a",
      "array_int"
    );
  });

  test("Should accept empty query assumptions", async () => {
    const path = defPrep("", { query: {} });
    await expectSuccess(path + "?a=blubb", {});
  });
  test("Should accept query assumptions, matching request", async () => {
    const path = defPrep("", {
      query: {
        id: { type: "id" },
        uuidv4: { type: "uuidv4" },
        any: { type: "/" },
        int: { type: "int" },
        float: { type: "float" },
        hex: { type: "hex" },
        base64: { type: "base64" },
        bool: { type: "bool" },
        string: { type: "string" },
        email: { type: "email" },
        array: { type: "array", items: { type: "/" } },
        arrayInt: { type: "array_int" },
        arrayId: { type: "array_id" },
        password: { type: "password" },
        time: { type: "time" },
        arrayTime: { type: "array_time" },
        value: { value: "Hi!" },
        object: {
          type: "object",
          keys: {
            test: { type: "string" },
          },
        },
        oneOfObj: {
          type: "oneOf",
          alternatives: [
            {
              type: "object",
              keys: {
                test: { type: "string" },
              },
            },
            { type: "int" },
          ],
        },
        oneOfAtomic: {
          type: "oneOf",
          alternatives: [{ type: "int" }, { type: "string" }],
        },
      },
    });
    await expectSuccess(
      path +
        "?" +
        [
          "id=" + transformVal(3),
          "uuidv4=" + transformVal("7ce767a4-ec6e-4ff5-b163-f501165eaf83"),
          "any=" + transformVal(true),
          "int=" + transformVal(5),
          "float=" + transformVal(5.9),
          "hex=" + transformVal("ABCDEF1234567890"),
          "base64=" + transformVal("dGVzdA=="),
          "bool=" + transformVal(false),
          "string=" + transformVal("test"),
          "email=" + transformVal("abc@egd.de"),
          "array=" + transformVal([1, "2", true]),
          "arrayInt=" + transformVal([1, 2, 3]),
          "arrayId=" + transformVal([1, 2, 3]),
          "password=" + transformVal("topSecret"),
          "time=" + transformVal(29029),
          "arrayTime=" + transformVal([1, 2, 3]),
          "value=" + transformVal("Hi!"),
          "object=" + transformVal({ test: "Hi!" }),
          "oneOfObj=" + transformVal({ test: "Hi!" }),
          "oneOfAtomic=" + transformVal("Hi!"),
        ].join("&")
    );
  });
  test("Should reject with missing param in request", async () => {
    const path = defPrep("", {
      query: {
        myIdField: { type: "id" },
      },
    });
    await expectMiss(path, {}, "query", "myIdField", "id");
  });
  test("Should reject with missing params in request", async () => {
    const path = defPrep("", {
      query: {
        myIdField: { type: "id" },
        mySecondIdField: { type: "id" },
      },
    });
    await expectMiss(path, {}, "query", "myIdField", "id");
  });
  test("Should accept with missing optional param in request", async () => {
    const path = defPrep("", {
      query: {
        myIdField: { type: "id", optional: true },
      },
    });
    await expectSuccess(path, {});
  });
  test("Should accept with missing param with default in request", async () => {
    const path = defPrep("", {
      query: {
        myIdField: { type: "id", default: 3 },
      },
    });
    await expectSuccess(path, {});
  });
  test("Should accept with optional param in request", async () => {
    const path = defPrep("", {
      query: {
        myIdField: { type: "id", optional: true },
      },
    });
    await expectSuccess(path + "?myIdField=4");
  });
  test("Should accept with param with default in request", async () => {
    const path = defPrep("", {
      query: {
        myIdField: { type: "id", default: 3 },
      },
    });
    await expectSuccess(path + "?myIdField=4");
  });

  test("Should reject with wrong cased field name", async () => {
    const path = defPrep("", { query: { myField: { type: "id" } } });
    await expectMiss(path + "?myfield:3", {}, "query", "myField", "id");
  });

  test("Should accept anything", async () => {
    const tipe = "/";
    const path = defPrep("", { query: { myField: { type: tipe } } }, "/");
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated id", async () => {
    const tipe = "id";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated uuidv4", async () => {
    const tipe = "uuidv4";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated int", async () => {
    const tipe = "int";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated float", async () => {
    const tipe = "float";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated hex", async () => {
    const tipe = "hex";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated base64", async () => {
    const tipe = "base64";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated bool", async () => {
    const tipe = "bool";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated string", async () => {
    const tipe = "string";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated email", async () => {
    const tipe = "email";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  /*  test("Should reject malformated array", async () => {
    const tipe = "array";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });*/

  test("Should reject malformated array_int", async () => {
    const tipe = "array_int";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated array_id", async () => {
    const tipe = "array_id";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated password", async () => {
    const tipe = "password";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated time", async () => {
    const tipe = "time";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated array_time", async () => {
    const tipe = "array_time";
    const path = defPrep2(tipe);
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated array with emails", async () => {
    const tipe = "array";
    const path = defPrep2(
      { query: { myField: { type: "array", items: { type: "email" } } } },
      "array"
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated object with keys", async () => {
    const tipe = "object";
    const path = defPrep2(
      {
        query: {
          myField: {
            type: "object",
            keys: { firstKey: { type: "email" }, secondKey: { type: "int" } },
          },
        },
      },
      "object"
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });
});
