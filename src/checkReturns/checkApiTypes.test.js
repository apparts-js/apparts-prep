import { obj } from "@apparts/types";
const { useChecks, isNotFieldmissmatch } = require("./checkApiTypes");
const myEndpoint = require("../myTestEndpoint");
const request = require("supertest");
import { httpErrorSchema } from "../error";
import { sign } from "jsonwebtoken";

const app = myEndpoint.app;
const { checkType, allChecked } = useChecks(myEndpoint);

describe("isNotFieldMissmatch", () => {
  it("should detect field missmatch", async () => {
    expect(
      isNotFieldmissmatch(httpErrorSchema(400, "Fieldmissmatch").getType())
    ).toBe(false);
  });
  it("should not detect non-field missmatch", async () => {
    expect(isNotFieldmissmatch(obj({}))).toBe(true);
    expect(isNotFieldmissmatch(httpErrorSchema(400, "Other error"))).toBe(true);
  });
});

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
    "value": "ok"
  },
  {
    "type": "object",
    "keys": {
      "error": {
        "value": "Name too long"
      },
      "description": {
        "type": "string",
        "optional": true
      }
    }
  },
  {
    "type": "object",
    "keys": {
      "boo": {
        "type": "boolean"
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
    "value": "ok"
  },
  {
    "type": "object",
    "keys": {
      "error": {
        "value": "Name too long"
      },
      "description": {
        "type": "string",
        "optional": true
      }
    }
  }
]`,
    });
  });
});

describe("myEndpoint, the missing tests", () => {
  test("Test with too long name", async () => {
    const response = await request(app)
      .post("/v/1/endpoint/3")
      .send({
        name: "x".repeat(200),
      });
    expect(checkType(response, "myEndpoint")).toBeTruthy();
    expect(response.statusCode).toBe(400);
  });
  test("Test with default name", async () => {
    const response = await request(app).post("/v/1/endpoint/3");
    expect(checkType(response, "myEndpoint")).toBeTruthy();
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("ok");
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
    expect(response2.statusCode).toBe(400);
    expect(response2.body).toMatchObject({
      error: "Text 1",
      unknownField: "Some unknown text",
    });
    expect(() => checkType(response2, "myErrorCheckpoint")).toBeTruthy();
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
❌ Value wrong: Value should be 'ok', but got 'whut?'

2: Status should be 400 and is 200
Error should be:
❌ Type missmatch: Value is "whut?" but should be of type '{
  "type": "object",
  "keys": {
    "error": {
      "value": "Name too long"
    },
    "description": {
      "type": "string",
      "optional": true
    }
  }
}'

3: Status should be 200 and is 200
Type check yields:
❌ Type missmatch: Value is "whut?" but should be of type '{
  "type": "object",
  "keys": {
    "boo": {
      "type": "boolean"
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
}'

4: Status should be 400 and is 200
Error should be:
❌ Type missmatch: Value is "whut?" but should be of type '{
  "type": "object",
  "keys": {
    "error": {
      "value": "Fieldmissmatch"
    },
    "description": {
      "type": "string",
      "optional": true
    }
  }
}'`);
    consoleMock.mockRestore();
  });
});

describe("myJWTAuthenticatedEndpoint, additional return types from auth", () => {
  test("Success access", async () => {
    const response = await request(app)
      .put("/v/1/withjwt")
      .set("Authorization", "Bearer " + sign({}, "secret"));
    expect(checkType(response, "myJWTAuthenticatedEndpoint")).toBeTruthy();
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("ok");
  });

  it("should notice, that 401 is missing", async () => {
    expect(() => allChecked("myJWTAuthenticatedEndpoint")).toThrow({
      message: `Not all possible return combinations for ### myJWTAuthenticatedEndpoint ### have been tested!
MISSING: [
  {
    "type": "object",
    "keys": {
      "error": {
        "value": "Unauthorized"
      },
      "description": {
        "type": "string",
        "optional": true
      }
    }
  }
]`,
    });
  });

  it("should get 401", async () => {
    const response = await request(app).put("/v/1/withjwt");
    expect(checkType(response, "myJWTAuthenticatedEndpoint")).toBeTruthy();
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchObject({
      error: "Unauthorized",
    });
  });

  it("should have all tested", async () => {
    expect(allChecked("myJWTAuthenticatedEndpoint")).toBeTruthy();
  });
});
