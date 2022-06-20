const { idType } = require("@apparts/config").get("types-config");

const pathToOpenApiPath = (path) => {
  return path.replace(/\/:([^/]+)(\/|$)/g, "/{$1}$2");
};

const getOpenApiSecurity = ({ options: { auth } = {} }) => {
  switch (auth) {
    case "Bearer jwt":
      return [{ ApiToken: [] }];
    case "Basic btoa(uname:token)":
      return [{ AuthToken: [] }];
    case "Basic btoa(uname:password)":
      return [{ Password: [] }];
    default:
      return undefined;
  }
};

const any = {
  anyOf: [{ type: "string" }, { type: "boolean" }, { type: "number" }],
};

const id = {
  string: { type: "string" },
  UUIDv4: { type: "string", format: "uuid" },
  int: { type: "integer" },
}[idType] || { type: "string" };

const typeToSchemaType = (type) =>
  ({
    "/": any,
    int: { type: "integer" },
    float: { type: "number", format: "double" },
    hex: { type: "string", format: "hex" },
    base64: { type: "string", format: "byte" },
    bool: { type: "boolean" },
    string: { type: "string" },
    email: { type: "string", format: "email" },
    array_int: { type: "array", items: { type: "integer" } },
    array_id: { type: "array", items: id },
    password: { type: "string", format: "" },
    time: { type: "string", format: "" },
    array_time: { type: "array", items: { type: "integer", format: "time" } },
    id: id,
    uuidv4: { type: "string", format: "uuid" },
  }[type]);

const bodyToSchema = (body) => {
  const properties = {};
  const required = [];
  for (const name in body) {
    const { default: def, optional } = body[name];
    properties[name] = recursiveReturnType(body[name]);
    if (def === undefined && !optional) {
      required.push(name);
    }
  }
  return {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties,
          required,
        },
      },
    },
    required: true,
  };
};

const getOpenApiRequestBody = ({ method, assertions: { body } = {} }) => {
  if (method === "get" || !body) {
    return undefined;
  }
  return bodyToSchema(body);
};

const getOpenApiParams = ({
  assertions: { query: queries = {}, params = {} } = {},
}) => {
  const result = [];
  for (const paramName in params) {
    const param = params[paramName];
    result.push({
      name: paramName,
      in: "path",
      required: true,
      schema: typeToSchemaType(param.type),
    });
  }
  for (const queryName in queries) {
    const query = queries[queryName];
    result.push({
      name: queryName,
      in: "query",
      required: !query.optional && query.default === undefined,
      allowEmptyValue: query.optional || query.type === "string" || false,
      schema: typeToSchemaType(query.type),
    });
  }
  return result;
};

const recursiveReturnType = ({ value, items, keys, type, alternatives }) => {
  if (type === "array") {
    return {
      type: "array",
      items: recursiveReturnType(items),
    };
  }
  if (type === "oneOf") {
    return {
      oneOf: alternatives.map((alt) => recursiveReturnType(alt)),
    };
  }
  if (type === "object") {
    let properties = {};
    let required = undefined;
    if (typeof keys === "object") {
      properties = { ...keys };
      required = [];
      Object.keys(properties).forEach((key) => {
        if (!properties[key].optional) {
          required.push(key);
        }
        properties[key] = recursiveReturnType(properties[key]);
      });
    }
    return {
      type: "object",
      properties,
      required,
    };
  }
  if (value && !type) {
    return {
      type: typeof value,
    };
  }
  return typeToSchemaType(type);
};

const returnTypeToSchemaType = ({ error, ...rest }) => {
  if (error) {
    return {
      type: "object",
      properties: {
        error: {
          type: "string",
        },
      },
    };
  }
  return recursiveReturnType(rest);
};

const getOpenApiResponses = ({ returns }) => {
  if (!returns) {
    return { 200: { description: "" } };
  }
  const responses = {};
  for (const response of returns) {
    const {
      content: {
        "application/json": { schema: { anyOf = [] } = {} } = {},
      } = {},
    } = responses[response.status] || {};
    responses[response.status] = {
      description: "",
      content: {
        "application/json": {
          schema: {
            anyOf: [...anyOf, returnTypeToSchemaType(response)],
          },
        },
      },
    };
  }
  for (const code in responses) {
    const content = responses[code].content["application/json"];
    if (content.schema.anyOf.length === 1) {
      content.schema = content.schema.anyOf[0];
    }
  }
  return responses;
};

const genOpenApiPaths = (api) => {
  const paths = {};
  for (const pathObj of api) {
    const path = pathToOpenApiPath(pathObj.path);
    paths[path] = {
      ...paths[path],
      [pathObj.method]: {
        summary: pathObj.title || "",
        description: pathObj.description || "",
        parameters: getOpenApiParams(pathObj),
        security: getOpenApiSecurity(pathObj),
        requestBody: getOpenApiRequestBody(pathObj),
        responses: getOpenApiResponses(pathObj),
      },
    };
  }
  return paths;
};

const apiToOpenApi = (api, apiName, commitHash) => {
  const paths = genOpenApiPaths(api.routes);

  return {
    openapi: "3.0.3",
    info: {
      title: apiName,
      version: "1",
      commit: commitHash,
    },
    components: {
      securitySchemes: {
        ApiToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        Password: {
          type: "http",
          scheme: "basic",
        },
        AuthToken: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
    paths,
  };
};

module.exports = { apiToOpenApi, pathToOpenApiPath };
