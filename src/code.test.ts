import { value } from "@apparts/types";
import {
  DontRespond,
  HttpCode,
  httpCodeSchema,
  httpDontRespondSchema,
} from "./code";
import { HttpError, httpErrorSchema } from "./error";
import { prepare } from "./preparators/preparator";
import { app } from "./preparators/tests/common";

let counter = 0;
const getNextUrl = () => "/b" + ++counter + "/";

describe("DontRespond", () => {
  it("should accept httpDontRespondSchema", async () => {
    app.post(
      getNextUrl(),
      prepare(
        {
          title: "",
          hasAccess: async () => true,
          receives: {},
          returns: [httpDontRespondSchema()],
        },
        async (_, res) => {
          res.send('"ok123"');
          return new DontRespond();
        }
      )
    );
  });
});

describe("HttpError", () => {
  it("should accept httpErrorSchema", async () => {
    app.post(
      getNextUrl(),
      prepare(
        {
          title: "",
          hasAccess: async () => true,
          receives: {},
          returns: [httpErrorSchema(400, "Test")],
        },
        async () => {
          return new HttpError(400, "Test");
        }
      )
    );
  });
});

describe("HttpCode", () => {
  it("should accept httpCodeSchema", async () => {
    app.post(
      getNextUrl(),
      prepare(
        {
          title: "",
          hasAccess: async () => true,
          receives: {},
          returns: [httpCodeSchema(300, value("Test"))],
        },
        async () => {
          return new HttpCode(300, "Test" as const);
        }
      )
    );
  });
});
