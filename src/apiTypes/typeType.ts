import { ObjType, OneOfType, Type } from "@apparts/types";

const rest = {
  description: { type: "string" as const, optional: true as const },
  title: { type: "string" as const, optional: true as const },
  semantic: { type: "string" as const, optional: true as const },
};
const rtype = {
  type: "oneOf" as const,
  alternatives: [] as any[],
} as OneOfType;

const oneOf = {
  type: "object" as const,
  keys: {
    type: { value: "oneOf" as const },
    ...rest,
    alternatives: {
      type: "array" as const,
      items: rtype,
    },
  },
};

const objectKeys = {
  type: "object" as const,
  keys: {
    type: { value: "object" as const },
    ...rest,
    keys: {
      type: "object" as const,
      values: {
        type: "oneOf" as const,
        alternatives: [] as any[],
      },
    },
  },
};
const objectValues = {
  type: "object" as const,
  keys: {
    type: { value: "object" as const },
    ...rest,
    values: rtype,
  },
};

const array = {
  type: "object" as const,
  keys: {
    type: { value: "array" as const },
    items: rtype,
    ...rest,
  },
};

const directType = {
  type: "object" as const,
  keys: {
    ...rest,
    type: {
      type: "oneOf" as const,
      alternatives: [
        { value: "id" as const },
        { value: "uuidv4" as const },
        { value: "/" as const },
        { value: "int" as const },
        { value: "float" as const },
        { value: "hex" as const },
        { value: "base64" as const },
        { value: "boolean" as const },
        { value: "string" as const },
        { value: "email" as const },
        { value: "null" as const },
      ],
    },
  },
};

const valuedType = {
  type: "object" as const,
  keys: {
    ...rest,
    value: { type: "/" as const },
  },
};

rtype.alternatives = [
  oneOf,
  objectKeys,
  objectValues,
  array,
  directType,
  valuedType,
];

objectKeys.keys.keys.values.alternatives = rtype.alternatives.map((t) => ({
  ...t,
  keys: {
    ...(t as ObjType).keys,
    optional: { type: "boolean" as const, optional: true as const },
    default: { type: "/" as const, optional: true as const },
  },
}));

export {
  rtype,
  oneOf,
  objectKeys,
  objectValues,
  array,
  directType,
  valuedType,
};
