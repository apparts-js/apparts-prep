import { Obj, Value, Required, BaseType, _Optional } from "@apparts/types";

export class HttpError<Code extends number, Message extends string> {
  public code: Code;
  public readonly type = "HttpError" as const;
  public message: { error: Message; description?: string };
  constructor(code: Code, message: Message, description?: string) {
    this.code = code;
    this.message = { error: message, description };
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
    Required,
    {
      code: Value<Required, A>;
      message: Obj<
        Required,
        {
          error: Value<Required, B>;
          description: BaseType<_Optional, string>;
        }
      >;
      type: Value<Required, C>;
    }
  >({
    code: new Value(code),
    message: new Obj({
      error: new Value(message),
      description: new BaseType({
        type: "string",
        optional: true,
      }),
    }),
    type: new Value(errorType),
  });
};
