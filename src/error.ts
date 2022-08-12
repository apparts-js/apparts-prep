import { Obj, Value, Required, Optional, Strring } from "@apparts/types";

export class HttpError<Code extends number, Message extends string> {
  public code: Code;
  public readonly type = "HttpError" as const;
  public message: { error: Message; description?: string };
  constructor(code: Code, message: Message, description?: string) {
    this.code = code;
    this.message = { error: message, description };
  }

  static notFound(element: string) {
    throw new HttpError(404, `${element} not found`);
  }
}

export const httpErrorSchema = <Code extends number, Message extends string>(
  code: Code,
  message: Message
) => {
  const errorType = "HttpError" as const;
  type A = Readonly<typeof code>;
  type B = Readonly<typeof message>;
  type C = Readonly<typeof errorType>;
  return new Obj<
    {
      code: Value<A, Required>;
      message: Obj<
        {
          error: Value<B, Required>;
          description: Strring<Optional>;
        },
        Required
      >;
      type: Value<C, Required>;
    },
    Required
  >({
    code: new Value(code),
    message: new Obj({
      error: new Value(message),
      description: new Strring({
        type: "string",
        optional: true,
      }),
    }),
    type: new Value(errorType),
  });
};
