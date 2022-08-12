import {
  obj,
  any,
  array,
  string,
  email,
  int,
  value,
  boolean,
  hex,
  base64,
  uuidv4,
  float,
} from "@apparts/types";

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
    const path = defPrep("", { params: obj({}) });
    await expectSuccess(path, { b: "blub" });
  });
  test("Should accept params assumptions, matching request", async () => {
    const pathParams =
      ":id/:uuidv4/:any/:int/:float/:hex/:base64/:bool/:string/:email/:array/:password/:time/:value";
    const path = defPrep(pathParams, {
      params: obj({
        id: int().semantic("id"),
        uuidv4: uuidv4(),
        any: any(),
        int: int(),
        float: float(),
        hex: hex(),
        base64: base64(),
        bool: boolean(),
        string: string(),
        email: email(),
        array: array(any()),
        password: string().semantic("password"),
        time: int().semantic("time"),
        value: value("Hi!"),
      }),
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
          "topSecret",
          29029,
          "Hi!",
        ].join("/")
    );
  });
  test("Should reject with missing param in request", async () => {
    const path = defPrep("", {
      params: obj({
        myIdField: int().semantic("id"),
      }),
    });
    await expectMiss(path, {}, "params", "myIdField", "id");
  });
  test("Should reject with missing params in request", async () => {
    const path = defPrep("", {
      params: obj({
        myIdField: int().semantic("id"),
        mySecondIdField: int().semantic("id"),
      }),
    });
    await expectMiss(path, {}, "params", "myIdField", "id");
  });
  test("Should accept with missing optional param in request", async () => {
    const path = defPrep("", {
      params: obj({
        myIdField: int().semantic("id").optional(),
      }),
    });
    await expectSuccess(path, {});
  });
  test("Should accept with missing param with default in request", async () => {
    const path = defPrep("", {
      params: obj({ myIdField: int().semantic("id").default(3) }),
    });
    await expectSuccess(path, {});
  });
  test("Should accept with optional param in request", async () => {
    const path = defPrep(":myIdField", {
      params: obj({
        myIdField: int().semantic("id").optional(),
      }),
    });
    await expectSuccess(path + 4);
  });
  test("Should accept with param with default in request", async () => {
    const path = defPrep(":myIdField", {
      params: obj({
        myIdField: int().semantic("id").default(3),
      }),
    });
    await expectSuccess(path + 4);
  });

  test("Should reject with wrong cased field name", async () => {
    const path = defPrep(":myfield", {
      params: obj({ myField: int().semantic("id") }),
    });
    await expectMiss(path + 3, {}, "params", "myField", "id");
  });

  test("Should accept anything", async () => {
    const tipe = "/";
    const path = defPrep(":myField", { params: obj({ myField: any() }) }, tipe);
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated id", async () => {
    const tipe = "id";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: int().semantic("id") }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated uuidv4", async () => {
    const tipe = "uuidv4";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: uuidv4() }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated int", async () => {
    const tipe = "int";
    const path = defPrep(":myField", { params: obj({ myField: int() }) }, tipe);
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated float", async () => {
    const tipe = "float";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: float() }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated hex", async () => {
    const tipe = "hex";
    const path = defPrep(":myField", { params: obj({ myField: hex() }) }, tipe);
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated base64", async () => {
    const tipe = "base64";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: base64() }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated bool", async () => {
    const tipe = "boolean";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: boolean() }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated string", async () => {
    const tipe = "string";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: string() }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated email", async () => {
    const tipe = "email";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: email() }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated password", async () => {
    const tipe = "password";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: string().semantic("password") }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated time", async () => {
    const tipe = "time";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: int().semantic("time") }) },
      tipe
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated array with emails", async () => {
    const tipe = "array";
    const path = defPrep(
      ":myField",
      { params: obj({ myField: array(email()) }) },
      "array"
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated object with keys", async () => {
    const tipe = "object";
    const path = defPrep(
      ":myField",
      {
        params: obj({
          myField: obj({ firstKey: email(), secondKey: int() }),
        }),
      },
      "object"
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });
});
