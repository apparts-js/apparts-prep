const { getApi } = require("./");
const { app } = require("../myTestEndpoint");

describe("getApi", () => {
  test("Should return API JSON", () => {
    const api = getApi(app);
    expect(api).toStrictEqual({
      routes: [
        {
          method: "post",
          path: "/v/1/endpoint/:id",
          assertions: {
            body: {
              name: {
                type: "string",
                default: "no name",
                description: "A name",
              },
            },
            query: {
              filter: { type: "string", optional: true },
              number: { type: "int", default: 0 },
            },
            params: { id: { type: "id" } },
          },
          returns: [
            { status: 200, value: "ok" },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Name too long" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 200,
              type: "object",
              keys: {
                foo: { value: "really!", description: "Some text" },
                boo: { type: "boolean" },
                kabaz: { type: "boolean", optional: true },
                arr: {
                  type: "array",
                  description: "This is an array",
                  items: {
                    type: "object",
                    description: "Some array item text",
                    keys: {
                      a: { type: "int" },
                      c: {
                        keys: {
                          d: { type: "int" },
                        },
                        optional: true,
                        type: "object",
                      },
                      e: {
                        optional: true,
                        type: "int",
                      },
                    },
                  },
                },
                objectWithUnknownKeys: {
                  type: "object",
                  values: { type: "int" },
                  description:
                    "Quod illo quos excepturi alias qui. Illo non laudantium commodi. Est quos consequatur debitis in. Iusto fugiat sunt sit. Dolorem quod eius sit non.",
                },
                objectWithUnknownKeysAndUnknownTypes: {
                  type: "object",
                  values: { type: "/" },
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Testendpoint for multiple purposes",
          description:
            "Behaves radically different, based on what\n the filter is.",
          options: {
            section: "1",
          },
        },
        {
          method: "post",
          path: "/v/1/faultyendpoint/:id",
          assertions: {
            body: {
              name: {
                type: "string",
                default: "no name",
                description: "A name",
              },
            },
            query: { filter: { type: "string", optional: true } },
            params: { id: { type: "id" } },
          },
          returns: [
            { status: 200, value: "ok" },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Name too long" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 200,
              type: "object",
              keys: {
                boo: { type: "boolean" },
                arr: {
                  type: "array",
                  items: { type: "object", keys: { a: { type: "int" } } },
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Faulty Testendpoint",
          description:
            "Ment to be found to be faulty. It's documentation\ndoes not match it's behavior.",
          options: { section: "1" },
        },
        {
          method: "post",
          path: "/v/1/typelessendpoint",
          assertions: { body: {}, params: {}, query: {} },
          returns: [
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Typeless endpoint",
          description: "This endpoint is typeless but not pointless.",
          options: { section: "1" },
        },
        {
          method: "post",
          path: "/v/1/cantdecide",
          assertions: {
            params: {},
            query: {},
            body: {
              value: {
                type: "oneOf",
                alternatives: [
                  { type: "int", description: "One option" },
                  {
                    type: "object",
                    values: { type: "/" },
                    description: "Another option",
                  },
                ],
              },
            },
          },
          returns: [
            { status: 200, value: "ok", title: "ok" },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "OneOf endpoint",
          description: "This endpoint can't decide what it wants.",
          options: { section: "1.0" },
        },
        {
          method: "put",
          path: "/v/1/withjwt",
          assertions: { body: {}, params: {}, query: {} },
          returns: [
            { status: 200, value: "ok" },
            {
              status: 401,
              type: "object",
              keys: {
                error: { value: "Unauthorized" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 401,
              type: "object",
              keys: {
                error: { value: "Token invalid" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Endpoint with JWT Authentication",
          description: "You shall not pass, unless you have a JWT.",
          options: { auth: "Bearer jwt", section: "1.1" },
        },
        {
          method: "get",
          path: "/v/1/error",
          assertions: {
            body: {},
            params: {},
            query: {
              error: { type: "boolean" },
            },
          },
          returns: [
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Text 1" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Text 1" },
                unknownField: { type: "string" },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Error checkpoint endpoint",
          description: "This endpoint is full of errors.",
          options: { section: undefined },
        },
      ],
      sections: [
        {
          id: undefined,
          title: "Introduction",
          description: `
This API is for demo and testing purposes. You should never use it.

But to brighten you up, here is a table:

| **asrt** | **1** | **2** | **3** | **4** |
|----------|-------|-------|-------|-------|
| no       | yes   | yes   | no    | no    |
| yes      | no    | no    | ye    | kanye |

`,
          subsections: [],
        },
        {
          id: undefined,
          title: "Some test endpoints",
          description: undefined,
          subsections: [
            {
              id: undefined,
              title: "Undecided",
              description: `### Testing the *description*

Here is some inline \`Code\`. It should actually be inline.

~~~js
// Some not inline code:
console.log("Hollow orld");
~~~
`,
              subsections: [],
            },
            {
              id: undefined,
              title: "Auth",
              description: undefined,
              subsections: [],
            },
          ],
        },
      ],
    });
  });

  test("Should return API JSON filtered", () => {
    const api = getApi(app, {
      routesFilter: (route) =>
        route.path === "/v/1/typelessendpoint" ||
        route.title === "Endpoint with JWT Authentication",
      sectionFilter: (section) => section.title === "Some test endpoints",
    });
    expect(api).toStrictEqual({
      routes: [
        {
          method: "post",
          path: "/v/1/typelessendpoint",
          assertions: { body: {}, params: {}, query: {} },
          returns: [
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Typeless endpoint",
          description: "This endpoint is typeless but not pointless.",
          options: { section: "0" },
        },
        {
          method: "put",
          path: "/v/1/withjwt",
          assertions: { body: {}, params: {}, query: {} },
          returns: [
            { status: 200, value: "ok" },
            {
              status: 401,
              type: "object",
              keys: {
                error: { value: "Unauthorized" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 401,
              type: "object",
              keys: {
                error: { value: "Token invalid" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Endpoint with JWT Authentication",
          description: "You shall not pass, unless you have a JWT.",
          options: { auth: "Bearer jwt", section: "0.1" },
        },
      ],
      sections: [
        {
          id: undefined,
          title: "Some test endpoints",
          description: undefined,
          subsections: [
            {
              id: undefined,
              title: "Undecided",
              description: `### Testing the *description*

Here is some inline \`Code\`. It should actually be inline.

~~~js
// Some not inline code:
console.log("Hollow orld");
~~~
`,
              subsections: [],
            },
            {
              id: undefined,
              title: "Auth",
              description: undefined,
              subsections: [],
            },
          ],
        },
      ],
    });
  });

  test("Should return API JSON filtered by sections", () => {
    const api = getApi(app, {
      sectionFilter: (section) => section.title === "Auth",
    });
    expect(api).toStrictEqual({
      routes: [
        {
          method: "post",
          path: "/v/1/endpoint/:id",
          assertions: {
            body: {
              name: {
                type: "string",
                default: "no name",
                description: "A name",
              },
            },
            query: {
              filter: { type: "string", optional: true },
              number: { type: "int", default: 0 },
            },
            params: { id: { type: "id" } },
          },
          returns: [
            { status: 200, value: "ok" },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Name too long" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 200,
              type: "object",
              keys: {
                foo: { value: "really!", description: "Some text" },
                boo: { type: "boolean" },
                kabaz: { type: "boolean", optional: true },
                arr: {
                  type: "array",
                  description: "This is an array",
                  items: {
                    type: "object",
                    description: "Some array item text",
                    keys: {
                      a: { type: "int" },
                      c: {
                        keys: {
                          d: { type: "int" },
                        },
                        optional: true,
                        type: "object",
                      },
                      e: {
                        optional: true,
                        type: "int",
                      },
                    },
                  },
                },
                objectWithUnknownKeys: {
                  type: "object",
                  values: { type: "int" },
                  description:
                    "Quod illo quos excepturi alias qui. Illo non laudantium commodi. Est quos consequatur debitis in. Iusto fugiat sunt sit. Dolorem quod eius sit non.",
                },
                objectWithUnknownKeysAndUnknownTypes: {
                  type: "object",
                  values: { type: "/" },
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Testendpoint for multiple purposes",
          description:
            "Behaves radically different, based on what\n the filter is.",
          options: {
            section: "0",
          },
        },
        {
          method: "post",
          path: "/v/1/faultyendpoint/:id",
          assertions: {
            body: {
              name: {
                type: "string",
                default: "no name",
                description: "A name",
              },
            },
            query: { filter: { type: "string", optional: true } },
            params: { id: { type: "id" } },
          },
          returns: [
            { status: 200, value: "ok" },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Name too long" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 200,
              type: "object",
              keys: {
                boo: { type: "boolean" },
                arr: {
                  type: "array",
                  items: { type: "object", keys: { a: { type: "int" } } },
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Faulty Testendpoint",
          description:
            "Ment to be found to be faulty. It's documentation\ndoes not match it's behavior.",
          options: { section: "0" },
        },
        {
          method: "post",
          path: "/v/1/typelessendpoint",
          assertions: { body: {}, params: {}, query: {} },
          returns: [
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Typeless endpoint",
          description: "This endpoint is typeless but not pointless.",
          options: { section: "0" },
        },
        {
          method: "put",
          path: "/v/1/withjwt",
          assertions: { body: {}, params: {}, query: {} },
          returns: [
            { status: 200, value: "ok" },
            {
              status: 401,
              type: "object",
              keys: {
                error: { value: "Unauthorized" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 401,
              type: "object",
              keys: {
                error: { value: "Token invalid" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Endpoint with JWT Authentication",
          description: "You shall not pass, unless you have a JWT.",
          options: { auth: "Bearer jwt", section: "0.0" },
        },
        {
          method: "get",
          path: "/v/1/error",
          assertions: {
            body: {},
            params: {},
            query: {
              error: { type: "boolean" },
            },
          },
          returns: [
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Text 1" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Text 1" },
                unknownField: { type: "string" },
              },
            },
            {
              status: 400,
              type: "object",
              keys: {
                error: { value: "Fieldmissmatch" },
                description: {
                  optional: true,
                  type: "string",
                },
              },
            },
          ],
          title: "Error checkpoint endpoint",
          description: "This endpoint is full of errors.",
          options: { section: undefined },
        },
      ],
      sections: [
        {
          id: undefined,
          title: "Some test endpoints",
          description: undefined,
          subsections: [
            {
              id: undefined,
              title: "Auth",
              description: undefined,
              subsections: [],
            },
          ],
        },
      ],
    });
  });
});
