import { Type } from "@apparts/types";
import { rtype } from "./typeType";

export const returnType = {
  type: "array" as const,
  items: {
    type: "oneOf" as const,
    alternatives: [
      // error
      {
        type: "object" as const,
        keys: {
          code: { type: "int" as const },
          message: rtype,
          type: { value: "HttpError" as const },
        },
      },
      {
        type: "object",
        keys: {
          code: { type: "int" as const },
          message: rtype,
          type: { value: "HttpCode" as const },
        },
      },
      ...rtype.alternatives,
    ],
  },
} as Type;
