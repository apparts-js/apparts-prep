const rest = {
  description: { type: "string", optional: true },
  title: { type: "string", optional: true },
  semantic: { type: "string", optional: true },
};
const rtype = {
  type: "oneOf",
};

const oneOf = {
  type: "object",
  keys: {
    type: { value: "oneOf" },
    ...rest,
    alternatives: {
      type: "array",
      items: rtype,
    },
  },
};

const objectKeys = {
  type: "object",
  keys: {
    type: { value: "object" },
    ...rest,
    keys: {
      type: "object",
      values: {
        type: "oneOf",
      },
    },
  },
};
const objectValues = {
  type: "object",
  keys: {
    type: { value: "object" },
    ...rest,
    values: rtype,
  },
};

const array = {
  type: "object",
  keys: {
    type: { value: "array" },
    items: rtype,
    ...rest,
  },
};

const directType = {
  type: "object",
  keys: {
    ...rest,
    type: {
      type: "oneOf",
      alternatives: [
        { value: "id" },
        { value: "uuidv4" },
        { value: "/" },
        { value: "int" },
        { value: "float" },
        { value: "hex" },
        { value: "base64" },
        { value: "boolean" },
        { value: "string" },
        { value: "email" },
        { value: "null" },
      ],
    },
  },
};

const valuedType = {
  type: "object",
  keys: {
    ...rest,
    value: { type: "/" },
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
    ...t.keys,
    optional: { type: "boolean", optional: true },
  },
}));

module.exports = {
  rtype,
  oneOf,
  objectKeys,
  objectValues,
  array,
  directType,
  valuedType,
};
