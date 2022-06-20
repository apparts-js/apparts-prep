const { rtype } = require("./typeType");

const returnType = {
  type: "array",
  items: {
    type: "oneOf",
    alternatives: [
      // error
      {
        type: "object",
        keys: {
          status: { type: "int" },
          error: { type: "string" },
        },
      },
      ...rtype.alternatives.map((t) => ({
        ...t,
        keys: {
          ...t.keys,
          status: { type: "int" },
        },
      })),
    ],
  },
};

module.exports = returnType;
