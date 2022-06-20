const { defPrep, expectWrong, expectMiss, expectSuccess } = require("./common");
const testTypes = require("./types");

describe("Body", () => {
  const wrong = (path, val, tipe) =>
    expectWrong(path, { myField: val }, "body", "myField", tipe);
  const right = (path, val) => expectSuccess(path, { myField: val }, val);

  test("Should accept empty body assumptions", async () => {
    const path = defPrep("", { body: {} });
    await expectSuccess(path, { b: "blub" });
  });
  test("Should accept body assumptions, matching request", async () => {
    const path = defPrep("", {
      body: {
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
        object: { type: "object", values: { type: "/" } },
      },
    });
    await expectSuccess(path, {
      id: 3,
      uuidv4: "7ce767a4-ec6e-4ff5-b163-f501165eaf83",
      any: true,
      int: 5,
      float: 5.9,
      hex: "ABCDEF1234567890",
      base64: "dGVzdA==",
      bool: false,
      string: "test",
      email: "abc@egd.de",
      array: [1, "2", true],
      arrayInt: [1, 2, 3],
      arrayId: [1, 2, 3],
      password: "topSecret",
      time: 29029,
      arrayTime: [1, 2, 3],
      value: "Hi!",
      object: { a: { b: 3 } },
    });
  });
  test("Should reject with missing param in request", async () => {
    const path = defPrep("", {
      body: {
        myIdField: { type: "id" },
      },
    });
    await expectMiss(path, {}, "body", "myIdField", "id");
  });
  test("Should reject with missing params in request", async () => {
    const path = defPrep("", {
      body: {
        myIdField: { type: "id" },
        mySecondIdField: { type: "id" },
      },
    });
    await expectMiss(path, {}, "body", "myIdField", "id");
  });
  test("Should accept with missing optional param in request", async () => {
    const path = defPrep("", {
      body: {
        myIdField: { type: "id", optional: true },
      },
    });
    await expectSuccess(path, {});
  });
  test("Should accept with missing param with default in request", async () => {
    const path = defPrep("", {
      body: {
        myIdField: { type: "id", default: 3 },
      },
    });
    await expectSuccess(path, {});
  });
  test("Should accept with optional param in request", async () => {
    const path = defPrep("", {
      body: {
        myIdField: { type: "id", optional: true },
      },
    });
    await expectSuccess(path, { myIdField: 4 });
  });
  test("Should accept with param with default in request", async () => {
    const path = defPrep("", {
      body: {
        myIdField: { type: "id", default: 3 },
      },
    });
    await expectSuccess(path, { myIdField: 4 });
  });

  test("Should reject with wrong cased field name", async () => {
    const path = defPrep("/", { body: { myField: { type: "id" } } });
    await expectMiss(path, { myfield: 3 }, "body", "myField", "id");
  });

  test("Should accept anything", async () => {
    const tipe = "/";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated id", async () => {
    const tipe = "id";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated uuidv4", async () => {
    const tipe = "uuidv4";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated int", async () => {
    const tipe = "int";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated float", async () => {
    const tipe = "float";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated hex", async () => {
    const tipe = "hex";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated base64", async () => {
    const tipe = "base64";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated bool", async () => {
    const tipe = "bool";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated string", async () => {
    const tipe = "string";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated email", async () => {
    const tipe = "email";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated array_int", async () => {
    const tipe = "array_int";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated array_id", async () => {
    const tipe = "array_id";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated password", async () => {
    const tipe = "password";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated time", async () => {
    const tipe = "time";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated array_time", async () => {
    const tipe = "array_time";
    const path = defPrep("", { body: { myField: { type: tipe } } }, tipe);
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated array with emails", async () => {
    const tipe = "array";
    const path = defPrep(
      "",
      { body: { myField: { type: "array", items: { type: "email" } } } },
      "array"
    );
    await testTypes[tipe](tipe, path, right, wrong);
  });

  test("Should reject malformated object with keys", async () => {
    const tipe = "object";
    const path = defPrep(
      "",
      {
        body: {
          myField: {
            type: "object",
            keys: { firstKey: { type: "email" }, secondKey: { type: "int" } },
          },
        },
      },
      "object"
    );
    await testTypes[tipe](tipe, path, right, wrong);
  });
});
