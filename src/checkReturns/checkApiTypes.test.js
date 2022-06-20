const { useChecks } = require("./checkApiTypes.js");
const myEndpoint = require("../myTestEndpoint");
const request = require("supertest");

const app = myEndpoint.app;
const { checkType, allChecked } = useChecks(myEndpoint);

describe("myTypelessEndpoint", () => {
  test("Detect missing type-definition", async () => {
    const response = await request(app).post("/v/1/typelessendpoint");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("ok");
    expect(() => checkType(response, "myTypelessEndpoint")).toThrow({
      message: `Returntype for ### myTypelessEndpoint ### does not match any given pattern!
MISSMATCH: Code: 200 Body: "ok"
EXPECTED TYPES: []`,
    });
  });
});

describe("myFaultyEndpoint", () => {
  test("Test with default name", async () => {
    const response = await request(app).post("/v/1/faultyendpoint/3");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("whut?");
    expect(() => checkType(response, "myFaultyEndpoint")).toThrow({
      message: `Returntype for ### myFaultyEndpoint ### does not match any given pattern!
MISSMATCH: Code: 200 Body: "whut?"
EXPECTED TYPES: [
  {
    "status": 200,
    "value": "ok"
  },
  {
    "status": 400,
    "error": "Name too long"
  },
  {
    "status": 200,
    "type": "object",
    "keys": {
      "boo": {
        "type": "bool"
      },
      "arr": {
        "type": "array",
        "items": {
          "type": "object",
          "keys": {
            "a": {
              "type": "int"
            }
          }
        }
      }
    }
  }
]`,
    });
  });
  test("Test with too long name", async () => {
    const response = await request(app)
      .post("/v/1/faultyendpoint/3")
      .send({
        name: "x".repeat(200),
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({ error: "Name is too long" });
    expect(() => checkType(response, "myFaultyEndpoint")).toThrow();
  });
  test("Test with filter", async () => {
    const response = await request(app).post(
      "/v/1/faultyendpoint/3?filter=wrongType"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      arr: [{ a: true }, { a: 2 }],
      boo: true,
    });
    expect(() => checkType(response, "myFaultyEndpoint")).toThrow();
  });
  test("Check, there is not too much", async () => {
    const response = await request(app).post(
      "/v/1/faultyendpoint/3?filter=tooMuch"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      arr: [{ a: 2 }, { a: 2 }],
      boo: true,
      tooMuch: true,
    });
    expect(() => checkType(response, "myFaultyEndpoint")).toThrow();
  });
  test("Check, there is not too little", async () => {
    const response = await request(app).post(
      "/v/1/faultyendpoint/3?filter=tooLittle"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      arr: [{ a: 2 }, { a: 2 }],
    });
    expect(() => checkType(response, "myFaultyEndpoint")).toThrow();
  });
});

describe("myEndpoint, incomplete test", () => {
  test("Test with default name", async () => {
    const response = await request(app).post("/v/1/endpoint/3");
    expect(checkType(response, "myEndpoint")).toBeTruthy();
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("ok");
  });
  test("Test with too long name", async () => {
    const response = await request(app)
      .post("/v/1/endpoint/3")
      .send({
        name: "x".repeat(200),
      });
    expect(checkType(response, "myEndpoint")).toBeTruthy();
    expect(response.statusCode).toBe(400);
  });
  test("Test with filter asstring", async () => {
    const response = await request(app).post("/v/1/endpoint/3?filter=asstring");
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      arr: [{ a: 1 }, { a: 2 }],
      foo: "really!",
      boo: true,
      objectWithUnknownKeys: {
        baz: "77",
        boo: 99,
      },
      objectWithUnknownKeysAndUnknownTypes: {
        baz: 77,
        boo: false,
      },
    });
    expect(() => checkType(response, "myEndpoint")).toThrow();
  });
});

describe("Notice, that not everything was tested", () => {
  test("", () => {
    expect(() => allChecked("myEndpoint")).toThrow({
      message: `Not all possible return combinations for ### myEndpoint ### have been tested!
MISSING: [
  {
    "status": 200,
    "type": "object",
    "keys": {
      "foo": {
        "value": "really!",
        "description": "Some text"
      },
      "boo": {
        "type": "bool"
      },
      "kabaz": {
        "type": "bool",
        "optional": true
      },
      "arr": {
        "type": "array",
        "description": "This is an array",
        "items": {
          "type": "object",
          "description": "Some array item text",
          "keys": {
            "a": {
              "type": "int"
            },
            "c": {
              "type": "object",
              "optional": true,
              "keys": {
                "d": {
                  "type": "int"
                }
              }
            },
            "e": {
              "type": "int",
              "optional": true
            }
          }
        }
      },
      "objectWithUnknownKeys": {
        "type": "object",
        "values": {
          "type": "int"
        },
        "description": "Quod illo quos excepturi alias qui. Illo non laudantium commodi. Est quos consequatur debitis in. Iusto fugiat sunt sit. Dolorem quod eius sit non."
      },
      "objectWithUnknownKeysAndUnknownTypes": {
        "type": "object",
        "values": {
          "type": "/"
        }
      }
    }
  }
]`,
    });
  });
});

describe("myEndpoint, the missing test", () => {
  test("Test with non-kabaz filter", async () => {
    const response = await request(app).post("/v/1/endpoint/3?filter=4");
    expect(checkType(response, "myEndpoint")).toBeTruthy();
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      arr: [{ a: 1 }, { a: 2 }],
      boo: true,
      objectWithUnknownKeys: {
        baz: 77,
        boo: 99,
      },
      objectWithUnknownKeysAndUnknownTypes: {
        baz: 77,
        boo: false,
      },
    });
  });
});

describe("myEndpoint, the optional value", () => {
  test("Test with filter", async () => {
    const response = await request(app).post("/v/1/endpoint/3?filter=kabazplz");
    expect(checkType(response, "myEndpoint")).toBeTruthy();
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      arr: [{ a: 1 }, { a: 2 }],
      boo: true,
      kabaz: false,
      objectWithUnknownKeys: {
        baz: 77,
        boo: 99,
      },
      objectWithUnknownKeysAndUnknownTypes: {
        baz: 77,
        boo: false,
      },
    });
  });
});

describe("myErrorCheckpoint, endpoint with error and description", () => {
  test("", async () => {
    const response = await request(app).get("/v/1/error?error=true");
    expect(checkType(response, "myErrorCheckpoint")).toBeTruthy();
    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({
      error: "Text 1",
      description: "Text 2",
    });

    const response2 = await request(app).get("/v/1/error?error=false");
    expect(() => checkType(response2, "myErrorCheckpoint")).toThrow({
      message: `Returntype for ### myErrorCheckpoint ### does not match any given pattern!
MISSMATCH: Code: 400 Body: {"error":"Text 1","unknownField":"Text 2"}
EXPECTED TYPES: [
  {
    "status": 400,
    "error": "Text 1"
  }
]`,
    });
    expect(response2.statusCode).toBe(400);
    expect(response2.body).toMatchObject({
      error: "Text 1",
      unknownField: "Text 2",
    });
  });
});

describe("All possible responses tested", () => {
  test("", () => {
    expect(allChecked("myEndpoint")).toBeTruthy();
  });
});

describe("Describe error", () => {
  it("should explain error", async () => {
    const response = await request(app).post("/v/1/faultyendpoint/3");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("whut?");
    const consoleMock = jest.spyOn(console, "log").mockImplementation(() => {});
    expect(() =>
      checkType(response, "myFaultyEndpoint", {
        explainError: true,
      })
    ).toThrow();
    const explanations = consoleMock.mock.calls;
    expect(explanations.map(([p]) => p).join("\n"))
      .toBe(`## Explanation for ## myFaultyEndpoint

1: Status should be 200 and is 200
Type check yields:
❌ Value wrong: Expected 'ok',          got 'whut?'

2: Status should be 400 and is 200
Error should be:
❌ Expected Object

3: Status should be 200 and is 200
Type check yields:
❌ Expected Object

4: Status should be 400 and is 200
Error should be:
❌ Expected Object`);
    consoleMock.mockRestore();
  });
});
