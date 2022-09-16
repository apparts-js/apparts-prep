import {
  httpCodeSchema,
  HttpCode,
  httpErrorSchema,
  HttpError,
  prepare,
  prepauthTokenJWT,
  section,
} from "./index";
import {
  obj,
  objValues,
  oneOf,
  any,
  array,
  string,
  int,
  value,
  boolean,
} from "@apparts/types";
import express from "express";

const myEndpoint = prepare(
  {
    title: "Testendpoint for multiple purposes",
    description: `Behaves radically different, based on what
 the filter is.`,
    receives: {
      body: obj({
        name: string().default("no name").description("A name"),
      }),
      query: obj({
        filter: string().optional(),
        number: int().default(0),
      }),
      params: obj({
        id: int().semantic("id"),
      }),
    },
    returns: [
      value("ok"),
      httpErrorSchema(400, "Name too long"),
      obj({
        foo: value("really!").description("Some text"),
        boo: boolean(),
        kabaz: boolean().optional(),
        arr: array(
          obj({
            a: int(),
            c: obj({
              d: int(),
            }).optional(),
            e: int().optional(),
          }).description("Some array item text")
        ).description("This is an array"),
        objectWithUnknownKeys: objValues(int()).description(
          "Quod illo quos excepturi alias qui. Illo non laudantium commodi. Est quos consequatur debitis in. Iusto fugiat sunt sit. Dolorem quod eius sit non."
        ),
        objectWithUnknownKeysAndUnknownTypes: objValues(any()),
      }),
    ],
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
        foo: "really!" as const,
        boo: true,
        objectWithUnknownKeys: {
          baz: (filter === "asstring" ? "77" : 77) as number,
          boo: 99,
        },
        objectWithUnknownKeysAndUnknownTypes: {
          baz: 77,
          boo: false,
        },
        kabaz: false,
      };
      if (filter !== "kabazplz") {
        delete resp.kabaz;
      }
      return resp;
    }
    // This produces "ok" (literally, with the quotes)
    return "ok";
  }
);

const myFaultyEndpoint = prepare(
  {
    title: "Faulty Testendpoint",
    description: `Ment to be found to be faulty. It's documentation
does not match it's behavior.`,

    receives: {
      body: obj({
        name: string().default("no name").description("A name"),
      }),
      query: obj({
        filter: string().optional(),
      }),
      params: obj({
        id: int().semantic("id"),
      }),
    },
    returns: [
      value("ok"),
      httpErrorSchema(400, "Name too long"),
      obj({
        boo: boolean(),
        arr: array(
          obj({
            a: int(),
          })
        ),
      }),
    ],
  },
  // @ts-expect-error test type
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
  }
);

const myOneOfEndpoint = prepare(
  {
    title: "OneOf endpoint",
    description: `This endpoint can't decide what it wants.`,
    receives: {
      body: obj({
        value: oneOf([
          int().description("One option"),
          objValues(any()).description("Another option"),
        ]),
      }),
    },
    returns: [value("ok").title("ok")],
  },
  async () => {
    return "ok" as const;
  }
);

const myTypelessEndpoint = prepare(
  {
    title: "Typeless endpoint",
    description: `This endpoint is typeless but not pointless.`,
    receives: {},
    returns: [],
  },
  async () => {
    return "ok" as const;
  }
);

const myJWTAuthenticatedEndpoint = prepauthTokenJWT("")(
  {
    title: "Endpoint with JWT Authentication",
    description: "You shall not pass, unless you have a JWT.",
    receives: {},
    returns: [value("ok")],
  },
  async () => {
    return "ok" as const;
  }
);

const myErrorCheckpoint = prepare(
  {
    title: "Error checkpoint endpoint",
    description: `This endpoint is full of errors.`,
    receives: { query: obj({ error: boolean() }) },
    returns: [
      httpErrorSchema(400, "Text 1"),
      httpCodeSchema(
        400,
        obj({ error: value("Text 1"), unknownField: string() })
      ),
    ],
  },
  async ({ query: { error } }) => {
    if (error) {
      return new HttpError(400, "Text 1", "Text 2");
    } else {
      return new HttpCode(400, {
        error: "Text 1" as const,
        unknownField: "Some unknown text",
      });
    }
  }
);

const app = express();
app.use(express.json());
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
