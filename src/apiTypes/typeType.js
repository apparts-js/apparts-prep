const description = { type: "string", optional: true };
const title = { type: "string", optional: true };

const rtype = {
  type: "oneOf",
};

const oneOf = {
  type: "object",
  keys: {
    type: { value: "oneOf" },
    description,
    title,
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
    description,
    title,
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
    description,
    title,
    values: rtype,
  },
};

const array = {
  type: "object",
  keys: {
    type: { value: "array" },
    items: rtype,
    description,
    title,
  },
};

const directType = {
  type: "object",
  keys: {
    description,
    title,
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
        { value: "bool" },
        { value: "boolean" },
        { value: "string" },
        { value: "email" },
        { value: "array_int" },
        { value: "array_id" },
        { value: "password" },
        { value: "time" },
        { value: "array_time" },
        { value: "null" },
      ],
    },
  },
};

const valuedType = {
  type: "object",
  keys: {
    description,
    title,
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
