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
          code: { type: "int" },
          message: rtype,
          type: { value: "HttpError" },
        },
      },
      {
        type: "object",
        keys: {
          code: { type: "int" },
          message: rtype,
          type: { value: "HttpCode" },
        },
      },
      ...rtype.alternatives,
    ],
  },
};

module.exports = returnType;
