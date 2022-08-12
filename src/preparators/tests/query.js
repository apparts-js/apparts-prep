import {
  obj,
  oneOf,
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

const defPrep2 = (tipe) =>
  !("getType" in tipe)
    ? defPrep("", tipe, tipe.query.getModelType().myField.type)
    : defPrep("", { query: obj({ myField: tipe }) }, tipe.getType().type);

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
    const path = defPrep("", { query: obj({ a: array(int()) }) });
    await expectWrong(
      path + "?a=" + encodeURIComponent("[blubb"),
      {},
      "query",
      "a",
      "array"
    );
  });

  test("Should accept empty query assumptions", async () => {
    const path = defPrep("", { query: obj({}) });
    await expectSuccess(path + "?a=blubb", {});
  });
  test("Should accept query assumptions, matching request", async () => {
    const path = defPrep("", {
      query: obj({
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
        object: obj({
          test: string(),
        }),
        oneOfObj: oneOf([obj({ test: string() }), int()]),
        oneOfAtomic: oneOf([int(), string()]),
      }),
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
          "password=" + transformVal("topSecret"),
          "time=" + transformVal(29029),
          "value=" + transformVal("Hi!"),
          "object=" + transformVal({ test: "Hi!" }),
          "oneOfObj=" + transformVal({ test: "Hi!" }),
          "oneOfAtomic=" + transformVal("Hi!"),
        ].join("&")
    );
  });
  test("Should reject with missing param in request", async () => {
    const path = defPrep("", {
      query: obj({
        myIdField: int().semantic("id"),
      }),
    });
    await expectMiss(path, {}, "query", "myIdField", "id");
  });
  test("Should reject with missing params in request", async () => {
    const path = defPrep("", {
      query: obj({
        myIdField: int().semantic("id"),
        mySecondIdField: int().semantic("id"),
      }),
    });
    await expectMiss(path, {}, "query", "myIdField", "id");
  });
  test("Should accept with missing optional param in request", async () => {
    const path = defPrep("", {
      query: obj({
        myIdField: int().semantic("id").optional(),
      }),
    });
    await expectSuccess(path, {});
  });
  test("Should accept with missing param with default in request", async () => {
    const path = defPrep("", {
      query: obj({
        myIdField: int().semantic("id").default(3),
      }),
    });
    await expectSuccess(path, {});
  });
  test("Should accept with optional param in request", async () => {
    const path = defPrep("", {
      query: obj({
        myIdField: int().semantic("id").optional(),
      }),
    });
    await expectSuccess(path + "?myIdField=4");
  });
  test("Should accept with param with default in request", async () => {
    const path = defPrep("", {
      query: obj({
        myIdField: int().semantic("id").default(3),
      }),
    });
    await expectSuccess(path + "?myIdField=4");
  });

  test("Should reject with wrong cased field name", async () => {
    const path = defPrep("", {
      query: obj({ myField: int().semantic("id") }),
    });
    await expectMiss(path + "?myfield:3", {}, "query", "myField", "id");
  });

  test("Should accept anything", async () => {
    const tipe = "/";
    const path = defPrep("", { query: obj({ myField: any() }) }, "/");
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated id", async () => {
    const tipe = "id";
    const path = defPrep2(int().semantic("id"));
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated uuidv4", async () => {
    const tipe = "uuidv4";
    const path = defPrep2(uuidv4());
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated int", async () => {
    const tipe = "int";
    const path = defPrep2(int());
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated float", async () => {
    const tipe = "float";
    const path = defPrep2(float());
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated hex", async () => {
    const tipe = "hex";
    const path = defPrep2(hex());
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated base64", async () => {
    const tipe = "base64";
    const path = defPrep2(base64());
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated bool", async () => {
    const tipe = "boolean";
    const path = defPrep2(boolean());
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated string", async () => {
    const tipe = "string";
    const path = defPrep2(string());
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated email", async () => {
    const tipe = "email";
    const path = defPrep2(email());
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  /*  test("Should reject malformated array", async () => {
    const tipe = "array";
    const path = defPrep2(array(any()));
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });*/

  test("Should reject malformated password", async () => {
    const tipe = "password";
    const path = defPrep2(string().semantic("password"));
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated time", async () => {
    const tipe = "time";
    const path = defPrep2(int().semantic("time"));
    await testTypes[tipe](tipe, path, right, wrong, undefined, true);
  });

  test("Should reject malformated array with emails", async () => {
    const tipe = "array";
    const path = defPrep2({ query: obj({ myField: array(email()) }) }, "array");
    await testTypes[tipe](tipe, path, right, wrong, true);
  });

  test("Should reject malformated object with keys", async () => {
    const tipe = "object";
    const path = defPrep2(
      {
        query: obj({
          myField: obj({ firstKey: email(), secondKey: int() }),
        }),
      },
      "object"
    );
    await testTypes[tipe](tipe, path, right, wrong, true);
  });
});
