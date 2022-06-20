const {
  genApiDocs: { getApi },
} = require("../");
const { app } = require("../myTestEndpoint");
const { pathToOpenApiPath, apiToOpenApi } = require("./apiToOpenApi");

describe("Unittests - apiToOpenApi", () => {
  test("pathToOpenApiPath conversion", () => {
    expect(pathToOpenApiPath("/v/1/test/:id/blub/:dog")).toBe(
      "/v/1/test/{id}/blub/{dog}"
    );
  });
});

const OAPI = {
  openapi: "3.0.3",
  info: {
    title: "Apparts test API",
    version: "1",
  },
  components: {
    securitySchemes: {
      ApiToken: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      Password: {
        type: "http",
        scheme: "basic",
      },
      AuthToken: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  paths: {
    "/v/1/endpoint/{id}": {
      post: {
        summary: "Testendpoint for multiple purposes",
        description:
          "Behaves radically different, based on what\n the filter is.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            name: "filter",
            in: "query",
            required: false,
            allowEmptyValue: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "number",
            in: "query",
            required: false,
            allowEmptyValue: false,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                },
                required: [],
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      type: "string",
                    },
                    {
                      type: "object",
                      properties: {
                        foo: { type: "string" },
                        boo: {
                          type: "boolean",
                        },
                        kabaz: { type: "boolean" },
                        arr: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              a: { type: "integer" },
                              c: {
                                type: "object",
                                properties: {
                                  d: {
                                    type: "integer",
                                  },
                                },
                                required: ["d"],
                              },
                              e: {
                                type: "integer",
                              },
                            },
                            required: ["a"],
                          },
                        },
                        objectWithUnknownKeys: {
                          type: "object",
                          properties: {},
                        },
                        objectWithUnknownKeysAndUnknownTypes: {
                          type: "object",
                          properties: {},
                        },
                      },
                      required: [
                        "foo",
                        "boo",
                        "arr",
                        "objectWithUnknownKeys",
                        "objectWithUnknownKeysAndUnknownTypes",
                      ],
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/v/1/faultyendpoint/{id}": {
      post: {
        summary: "Faulty Testendpoint",
        description:
          "Ment to be found to be faulty. It's documentation\ndoes not match it's behavior.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
          {
            name: "filter",
            in: "query",
            required: false,
            allowEmptyValue: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                },
                required: [],
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      type: "string",
                    },
                    {
                      type: "object",
                      properties: {
                        boo: {
                          type: "boolean",
                        },
                        arr: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              a: { type: "integer" },
                            },
                            required: ["a"],
                          },
                        },
                      },
                      required: ["boo", "arr"],
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/v/1/typelessendpoint": {
      post: {
        summary: "Typeless endpoint",
        description: "This endpoint is typeless but not pointless.",
        parameters: [],
        responses: {
          400: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/v/1/cantdecide": {
      post: {
        summary: "OneOf endpoint",
        description: "This endpoint can't decide what it wants.",
        parameters: [],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  value: {
                    oneOf: [
                      {
                        type: "integer",
                      },
                      {
                        type: "object",
                        properties: {},
                      },
                    ],
                  },
                },
                required: ["value"],
              },
            },
          },
          required: true,
        },
        responses: {
          400: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/v/1/withpw": {
      delete: {
        summary: "Endpoint with Pw Authentication",
        description: "You shall not pass, unless you have a password.",
        parameters: [],
        security: [{ Password: [] }],
        responses: {
          401: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/v/1/withtoken": {
      patch: {
        summary: "Endpoint with Token Authentication",
        description: "You shall not pass, unless you have a token.",
        parameters: [],
        security: [{ AuthToken: [] }],
        responses: {
          401: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },

          400: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/v/1/withjwt": {
      put: {
        summary: "Endpoint with JWT Authentication",
        description: "You shall not pass, unless you have a JWT.",
        parameters: [],
        security: [{ ApiToken: [] }],
        responses: {
          401: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/v/1/error": {
      get: {
        summary: "Error checkpoint endpoint",
        description: "This endpoint is full of errors.",
        parameters: [
          {
            name: "error",
            in: "query",
            required: true,
            allowEmptyValue: false,
            schema: {
              type: "boolean",
            },
          },
        ],
        responses: {
          400: {
            description: "",
            content: {
              "application/json": {
                schema: {
                  anyOf: [
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        error: {
                          type: "string",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
};

describe("Full e2e test", () => {
  test("testApi as object", () => {
    const openApi = apiToOpenApi(getApi(app), "Apparts test API");
    expect(openApi).toMatchObject(OAPI);
  });
  test("testApi as JSON", () => {
    const openApi = apiToOpenApi(getApi(app), "Apparts test API");
    expect(JSON.stringify(openApi, undefined, 2)).toBe(
      JSON.stringify(OAPI, undefined, 2)
    );
  });
});
