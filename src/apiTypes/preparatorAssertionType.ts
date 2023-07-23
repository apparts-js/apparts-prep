import { ObjType, Type } from "@apparts/types";
import { rtype } from "./typeType";

const assertionElement = {
  type: "oneOf" as const,
  alternatives: [
    ...rtype.alternatives.map((t) => ({
      ...t,
      keys: {
        ...(t as ObjType).keys,
        optional: { type: "boolean" as const, optional: true as const },
        default: { type: "/", optional: true as const },
      },
    })),
  ],
};

export const assertionType = {
  type: "object" as const,
  keys: {
    body: {
      optional: true,
      type: "object" as const,
      values: assertionElement,
    },
    params: {
      optional: true,
      type: "object" as const,
      values: assertionElement,
    },
    query: {
      optional: true,
      type: "object" as const,
      values: assertionElement,
    },
  },
} as Type;
