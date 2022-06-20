const { defPrep, expectWrong, expectMiss, expectSuccess } = require("./common");
const testTypes = require("./types");

describe("Params", () => {
  const wrong = (path, val, tipe) =>
    expectWrong(
      path +
        encodeURIComponent(typeof val === "object" ? JSON.stringify(val) : val),
      {},
      "params",
      "myField",
      tipe
    );
  const right = (path, val, tipe, retVal) =>
    expectSuccess(
      path +
        encodeURIComponent(typeof val === "object" ? JSON.stringify(val) : val),
      {},
      retVal !== undefined ? retVal : val
    );

  test("Should accept empty params assumptions", async () => {
    const path = defPrep("", { params: {} });
    await expectSuccess(path, { b: "blub" });
  });
  test("Should accept params assumptions, matching request", async () => {
    const pathParams =
      ":id/:uuidv4/:any/:int/:float/:hex/:base64/:bool/:string/:email/:array/:arrayInt/:arrayId/:password/:time/:arrayTime/:value";
    const path = defPrep(pathParams, {
      params: {
        id: { type: "id" },
        uuidv4: { type: "uuidv4" },
        any: { type: "/" },
        float: { type: "float" },
        int: { type: "int" },
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
      },
    });
    await expectSuccess(
      path +
        [
          3,
          "7ce767a4-ec6e-4ff5-b163-f501165eaf83",
          true,
          5,
          5.9,
          "ABCDEF1234567890",
          "dGVzdA==",
          false,
          "test",
          "abc@egd.de",
          JSON.stringify([1, "2", true]),
          JSON.stringify([1, 2, 3]),
          JSON.stringify([1, 2, 3]),
          "topSecret",
          29029,
          JSON.stringify([1, 2, 3]),
          "Hi!",
        ].join("/")
    );
  });
  test("Should reject with missing param in request", async () => {
    const path = defPrep("", {
      params: {
        myIdField: { type: "id" },
      },
    });
    await expectMiss(path, {}, "params", "myIdField", "id");
  });
  test("Should reject with missing params in request", async () => {
    const path = defPrep("", {
      params: {
        myIdField: { type: "id" },
        mySecondIdField: { type: "id" },
      },
    });
    await expectMiss(path, {}, "params", "myIdField", "id");
  });
  test("Should accept with missing optional param in request", async () => {
    const path = defPrep("", {
      params: {
        myIdField: { type: "id", optional: true },
      },
    });
    await expectSuccess(path, {});
  });
  test("Should accept with missing param with default in request", async () => {
    const path = defPrep("", {
      params: {
        myIdField: { type: "id", default: 3 },
      },
    });
    await expectSuccess(path, {});
  });
  test("Should accept with optional param in request", async () => {
    const path = defPrep(":myIdField", {
      params: {
        myIdField: { type: "id", optional: true },
      },
    });
    await expectSuccess(path + 4);
  });
  test("Should accept with param with default in request", async () => {
    const path = defPrep(":myIdField", {
      params: {
        myIdField: { type: "id", default: 3 },
      },
    });
    await expectSuccess(path + 4);
  });

  test("Should reject with wrong cased field name", async () => {
    const path = defPrep(":myfield", { params: { myField: { type: "id" } } });
    await expectMiss(path + 3, {}, "params", "myField", "id");
  });

  test("Should accept anything", async () => {
    const tipe = "/";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated id", async () => {
    const tipe = "id";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated uuidv4", async () => {
    const tipe = "uuidv4";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated int", async () => {
    const tipe = "int";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated float", async () => {
    const tipe = "float";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated hex", async () => {
    const tipe = "hex";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated base64", async () => {
    const tipe = "base64";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated bool", async () => {
    const tipe = "bool";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated string", async () => {
    const tipe = "string";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated email", async () => {
    const tipe = "email";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated array_int", async () => {
    const tipe = "array_int";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated array_id", async () => {
    const tipe = "array_id";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated password", async () => {
    const tipe = "password";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated time", async () => {
    const tipe = "time";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated array_time", async () => {
    const tipe = "array_time";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: tipe } } },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated array with emails", async () => {
    const tipe = "array";
    const path = defPrep(
      ":myField",
      { params: { myField: { type: "array", items: { type: "email" } } } },
      "array"
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated object with keys", async () => {
    const tipe = "object";
    const path = defPrep(
      ":myField",
      {
        params: {
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
