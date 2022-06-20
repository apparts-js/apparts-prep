const { rtype } = require("./typeType");

const assertionElement = {
  type: "oneOf",
  alternatives: [
    ...rtype.alternatives.map((t) => ({
      ...t,
      keys: {
        ...t.keys,
        optional: { type: "boolean", optional: true },
        default: { type: "/", optional: true },
      },
    })),
  ],
};

const assertionType = {
  type: "object",
  keys: {
    body: {
      optional: true,
      type: "object",
      values: assertionElement,
    },
    params: {
      optional: true,
      type: "object",
      values: assertionElement,
    },
    query: {
      optional: true,
      type: "object",
      values: assertionElement,
    },
  },
};

module.exports = assertionType;
