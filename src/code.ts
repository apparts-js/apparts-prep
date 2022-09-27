import { Schema, Obj, Value, Required, InferType } from "@apparts/types";

type MessageType = InferType<Schema<any, Required>>;

export class HttpCode<Code extends number, Message extends MessageType> {
  public code: Code;
  public readonly type = "HttpCode" as const;
  public message: Message;

  constructor(code: Code, message: Message) {
    this.code = code;
    this.message = message;
  }
}

export const httpCodeSchema = <
  Code extends number,
  Message extends Schema<any, Required>
>(
  code: Code,
  message: Message
) => {
  const type = "HttpCode" as const;
  type A = Readonly<typeof code>;
  type B = Readonly<typeof type>;

  return new Obj<
    Required,
    {
      code: Value<Required, A>;
      message: Message;
      type: Value<Required, B>;
    }
  >({
    code: new Value(code),
    message,
    type: new Value(type),
  });
};

export class DontRespond {
  public readonly type = "DontRespond";
}
