const {
  HttpCode,
  HttpError,
  prepare,
  prepauthToken,
  prepauthPW,
  prepauthTokenJWT,
  section,
} = require("./index");

const express = require("express");

const myEndpoint = prepare(
  {
    body: {
      name: { type: "string", default: "no name", description: "A name" },
    },
    query: {
      filter: { type: "string", optional: true },
      number: { type: "int", default: 0 },
    },
    params: {
      id: { type: "id" },
    },
  },
  async ({ body: { name }, query: { filter } /*, params: { id }*/ }) => {
    if (name.length > 100) {
      return new HttpError(400, "Name too long");
    }
    // filter might not be defined, as it is optional
    if (filter) {
      // Return values are JSONified automatically!
      const resp = {
        arr: [{ a: 1 }, { a: 2, c: null, e: null }],
        foo: "really!",
        boo: true,
        objectWithUnknownKeys: {
          baz: filter === "asstring" ? "77" : 77,
          boo: 99,
        },
        objectWithUnknownKeysAndUnknownTypes: {
          baz: 77,
          boo: false,
        },
      };
      if (filter === "kabazplz") {
        resp.kabaz = false;
      }
      return resp;
    }
    // This produces "ok" (literally, with the quotes)
    return "ok";
  },
  {
    title: "Testendpoint for multiple purposes",
    description: `Behaves radically different, based on what
 the filter is.`,
    returns: [
      { status: 200, value: "ok" },
      { status: 400, error: "Name too long" },
      {
        status: 200,
        type: "object",
        keys: {
          foo: { value: "really!", description: "Some text" },
          boo: { type: "bool" },
          kabaz: { type: "bool", optional: true },
          arr: {
            type: "array",
            description: "This is an array",
            items: {
              type: "object",
              description: "Some array item text",
              keys: {
                a: { type: "int" },
                c: {
                  type: "object",
                  optional: true,
                  keys: {
                    d: { type: "int" },
                  },
                },
                e: {
                  type: "int",
                  optional: true,
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
    ],
  }
);

const myFaultyEndpoint = prepare(
  {
    body: {
      name: { type: "string", default: "no name", description: "A name" },
    },
    query: {
      filter: { type: "string", optional: true },
    },
    params: {
      id: { type: "id" },
    },
  },
  async ({ body: { name }, query: { filter } /*, params: { id }*/ }) => {
    if (name.length > 100) {
      return new HttpError(400, "Name is too long");
    }
    if (filter === "wrongType") {
      return {
        arr: [{ a: true }, { a: 2 }],
        boo: true,
      };
    }
    if (filter === "tooMuch") {
      return {
        arr: [{ a: 2 }, { a: 2 }],
        boo: true,
        tooMuch: true,
      };
    }
    if (filter === "tooLittle") {
      return {
        arr: [{ a: 2 }, { a: 2 }],
      };
    }
    return "whut?";
  },
  {
    title: "Faulty Testendpoint",
    description: `Ment to be found to be faulty. It's documentation
does not match it's behavior.`,
    returns: [
      { status: 200, value: "ok" },
      { status: 400, error: "Name too long" },
      {
        status: 200,
        type: "object",
        keys: {
          boo: { type: "bool" },
          arr: {
            type: "array",
            items: {
              type: "object",
              keys: {
                a: { type: "int" },
              },
            },
          },
        },
      },
    ],
  }
);

const myOneOfEndpoint = prepare(
  {
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
  async () => {
    return "ok";
  },
  {
    title: "OneOf endpoint",
    description: `This endpoint can't decide what it wants.`,
  }
);

const myTypelessEndpoint = prepare(
  {},
  async () => {
    return "ok";
  },
  {
    title: "Typeless endpoint",
    description: `This endpoint is typeless but not pointless.`,
  }
);

const myPwAuthenticatedEndpoint = prepauthPW({})(
  {},
  async () => {
    return "ok";
  },
  {
    title: "Endpoint with Pw Authentication",
    description: "You shall not pass, unless you have a password.",
  }
);
const myTokenAuthenticatedEndpoint = prepauthToken({})(
  {},
  async () => {
    return "ok";
  },
  {
    title: "Endpoint with Token Authentication",
    description: "You shall not pass, unless you have a token.",
  }
);
const myJWTAuthenticatedEndpoint = prepauthTokenJWT("")(
  {},
  async () => {
    return "ok";
  },
  {
    title: "Endpoint with JWT Authentication",
    description: "You shall not pass, unless you have a JWT.",
  }
);

const myErrorCheckpoint = prepare(
  { query: { error: { type: "bool" } } },
  async ({ query: { error } }) => {
    if (error) {
      return new HttpCode(400, { error: "Text 1", description: "Text 2" });
    } else {
      return new HttpCode(400, { error: "Text 1", unknownField: "Text 2" });
    }
  },
  {
    title: "Error checkpoint endpoint",
    description: `This endpoint is full of errors.`,
    returns: [{ status: 400, error: "Text 1" }],
  }
);

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

section({
  app,
  title: "Introduction",
  description: `
This API is for demo and testing purposes. You should never use it.

But to brighten you up, here is a table:

| **asrt** | **1** | **2** | **3** | **4** |
|----------|-------|-------|-------|-------|
| no       | yes   | yes   | no    | no    |
| yes      | no    | no    | ye    | kanye |

  `,
});
section({
  app,
  title: "Some test endpoints",
  routes: (app) => {
    app.post("/v/1/endpoint/:id", myEndpoint);
    app.post("/v/1/faultyendpoint/:id", myFaultyEndpoint);
    app.post("/v/1/typelessendpoint", myTypelessEndpoint);

    section({
      app,
      title: "Undecided",
      description: `### Testing the *description*

Here is some inline \`Code\`. It should actually be inline.

~~~js
// Some not inline code:
console.log("Hollow orld");
~~~
      `,
      routes: (app) => {
        app.post("/v/1/cantdecide", myOneOfEndpoint);
      },
    });
    section({
      app,
      title: "Auth",
      routes: (app) => {
        app.delete("/v/1/withpw", myPwAuthenticatedEndpoint);
        app.patch("/v/1/withtoken", myTokenAuthenticatedEndpoint);
        app.put("/v/1/withjwt", myJWTAuthenticatedEndpoint);
      },
    });
  },
});

app.get("/v/1/error", myErrorCheckpoint);

module.exports = {
  myEndpoint,
  myFaultyEndpoint,
  myTypelessEndpoint,
  myErrorCheckpoint,
  app,
};
