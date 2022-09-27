import { httpErrorSchema } from "../error";
import { v1 as uuidv1 } from "uuid";
import {
  types,
  checkType as recursiveCheck,
  explainCheck,
  Obj,
  Required,
  Schema,
  obj,
} from "@apparts/types";
import assertionType from "../apiTypes/preparatorAssertionType";
import returnType from "../apiTypes/preparatorReturnType";
import { get as getConfig } from "@apparts/config";
const config = getConfig("types-config");
import { NextFnType, OptionsType } from "./types";

export const prepare = <
  BodyType extends Obj<Required, any>,
  ParamsType extends Obj<Required, any>,
  QueryType extends Obj<Required, any>,
  ReturnTypes extends Schema<Required, any>[]
>(
  options: OptionsType<BodyType, ParamsType, QueryType, ReturnTypes>,
  next: NextFnType<BodyType, ParamsType, QueryType, ReturnTypes>
) => {
  const {
    body: bodySchema = obj({}),
    params: paramsSchema = obj({}),
    query: querySchema = obj({}),
    ...restAssertions
  } = options.receives;
  const fields = {
    body: bodySchema.getModelType(),
    params: paramsSchema.getModelType(),
    query: querySchema.getModelType(),
  };

  const assError = explainCheck(fields, assertionType);
  if (assError || Object.keys(restAssertions).length > 0) {
    throw new Error(
      "PREPARATOR: Nope, your assertions are not well defined!\nYour assertions: " +
        JSON.stringify(fields, undefined, 2) +
        "\nProblem: " +
        JSON.stringify(assError, undefined, 2) +
        "\nRoute: " +
        options?.title
    );
  }

  const returnTypes = (options.returns || []).map((r) => r.getType());
  const retError = explainCheck(returnTypes, returnType);
  if (retError) {
    throw new Error(
      "PREPARATOR: Nope, your return types are not well defined!\nYour returns: " +
        JSON.stringify(returnTypes, undefined, 2) +
        "\nProblem: " +
        JSON.stringify(retError, undefined, 2) +
        "\nRoute: " +
        options?.title
    );
  }

  const f = async function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    // iterate over the fields specified in the API's assertions

    if (options.strap) {
      for (const fieldName in fields) {
        for (const key in req[fieldName]) {
          if (!(key in fields[fieldName])) {
            delete req[fieldName][key];
          }
        }
      }
    }

    for (const fieldName in fields) {
      /* istanbul ignore next */
      if (!(fieldName in req)) {
        req[fieldName] = {};
      }
      let valid;
      try {
        valid = check(fields[fieldName], req[fieldName], fieldName);
      } catch (e) /* istanbul ignore next */ {
        catchError(res, req, e);
        return;
      }
      if (valid !== true) {
        const r = {};
        r[fieldName] = valid;
        res.status(400).send({
          error: "Fieldmissmatch",
          description:
            Object.keys(valid)
              .map((key) => valid[key] + ` for field "${key}"`)
              .join(", ") +
            " in " +
            fieldName,
        });
        return;
      }
    }
    try {
      const data = await next(req, res);
      if (typeof data === "object" && data !== null) {
        if (data.type === "HttpError") {
          catchError(res, req, data);
          return;
        } else if (data.type === "HttpCode") {
          res.status(data.code);
          res.send(JSON.stringify(data.message));
          return;
        } else if (data.type === "DontRespond") {
          return;
        }
      }
      res.send(JSON.stringify(data));
    } catch (e) {
      catchError(res, req, e);
    }
  };

  f.assertions = fields;
  f.options = {
    ...options,
    returns: [...returnTypes, httpErrorSchema(400, "Fieldmissmatch").getType()],
  };
  delete f.options.receives;
  return f;
};

const catchError = (res, req, e) => {
  if (typeof e === "object" && e !== null && e.type === "HttpError") {
    res.status(e.code);
    res.send(JSON.stringify(e.message));
    return;
  }
  const errorObj = constructErrorObj(req, e);
  console.log("SERVER ERROR", errorObj.ID, "\n", e);
  try {
    console.log(JSON.stringify(errorObj));
    console.log(errorObj.TRACE);
  } catch (e) /* istanbul ignore next */ {
    console.log(errorObj);
  }
  res.status(500);
  res.setHeader("Content-Type", "text/plain");
  res.send(
    `SERVER ERROR! ${errorObj.ID} Please consider sending` +
      ` this error-message along with a description of what` +
      ` happend and what you where doing to this email-address:` +
      ` ${config.bugreportEmail}.`
  );
};

/**
 * Performs the type-assertion-check and applies default values
 *
 * @param {Object} wanted
 * @param {Object} given
 * @param {string} field
 * @return {bool} 'true' if everything matched, Error Description if not
 */
const check = (wanted, given, field) => {
  const keys = Object.keys(wanted);
  for (let i = 0; i < keys.length; i++) {
    const param = keys[i];

    const exists = param in given && given[param] !== undefined;
    if (!exists) {
      if ("default" in wanted[param]) {
        given[param] = wanted[param]["default"];
        continue;
      }
      if (wanted[param]["optional"] !== true) {
        const res = {};
        res[param] = "missing " + wanted[param]["type"];
        return res;
      }
      continue;
    }

    if (!validateAndConvert(wanted, param, given, field)) {
      const res = {};
      res[param] = "expected " + wanted[param]["type"];
      return res;
    }
  }

  return true;
};

const validateAndConvert = (wanted, param, given, field) => {
  if (
    types[wanted[param]["type"]] &&
    types[wanted[param]["type"]].conv &&
    field !== "body"
  ) {
    try {
      given[param] = types[wanted[param]["type"]].conv(given[param]);
    } catch (e) {
      return false;
    }
  }

  return recursiveCheck(given[param], wanted[param]);
};

const constructErrorObj = (req, error) => {
  const errorObj = {
    ID: uuidv1(),
    USER: req.get("Authorization") || "",
    REQUEST: {
      body: null,
      params: null,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      ua: req.get("User-Agent") || /* istanbul ignore next */ "",
    },
    //    ERROR: error,
    TRACE: (error || /* istanbul ignore next */ {}).stack,
  };
  if (Object.keys(req.body || /* istanbul ignore next */ {}).length > 0) {
    errorObj.REQUEST.body = req.body;
  }
  if (Object.keys(req.params || /* istanbul ignore next */ {}).length > 0) {
    errorObj.REQUEST.params = req.params;
  }
  return errorObj;
};
