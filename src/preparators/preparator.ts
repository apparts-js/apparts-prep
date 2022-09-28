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
  BodyType extends Obj<any, Required>,
  ParamsType extends Obj<any, Required>,
  QueryType extends Obj<any, Required>,
  ReturnTypes extends Schema<any, Required>[]
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
        catchError(res, req, e, options.logError, options.logResponse);
        return;
      }
      if (valid !== true) {
        const r = {};
        r[fieldName] = valid;

        send(
          res,
          JSON.stringify({
            error: "Fieldmissmatch",
            description:
              Object.keys(valid)
                .map((key) => valid[key] + ` for field "${key}"`)
                .join(", ") +
              " in " +
              fieldName,
          }),
          options.logResponse,
          400
        );
        return;
      }
    }
    try {
      const data = await next(req, res);
      if (typeof data === "object" && data !== null) {
        if (data.type === "HttpError") {
          catchError(res, req, data, options.logError, options.logResponse);
          return;
        } else if (data.type === "HttpCode") {
          send(
            res,
            JSON.stringify(data.message),
            options.logResponse,
            data.code
          );
          return;
        } else if (data.type === "DontRespond") {
          return;
        }
      }
      send(res, JSON.stringify(data), options.logResponse);
    } catch (e) {
      catchError(res, req, e, options.logError, options.logResponse);
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

const send = (
  res,
  body: string,
  logResponse?: (msg: string) => void,
  status?: number
) => {
  if (status) {
    res.status(status);
  }
  res.send(body);
  if (logResponse) {
    logResponse(body);
  }
};

const catchError = (
  res,
  req,
  e,
  logError?: (msg: string) => void,
  logResponse?: (msg: string) => void
) => {
  if (typeof e === "object" && e !== null && e.type === "HttpError") {
    send(res, JSON.stringify(e.message), logResponse, e.code);
    return;
  }
  const errorObj = constructErrorObj(req, e);
  let errorMsg = "SERVER ERROR " + errorObj.ID + "\n";
  try {
    errorMsg += JSON.stringify(errorObj) + "\n" + errorObj.TRACE;
  } catch (e) /* istanbul ignore next */ {
    errorMsg += errorObj + "\n" + e;
  }
  if (logError) {
    logError(errorMsg);
  } else {
    console.log(errorMsg);
  }
  res.setHeader("Content-Type", "text/plain");
  send(
    res,
    `SERVER ERROR! ${errorObj.ID} Please consider sending` +
      ` this error-message along with a description of what` +
      ` happend and what you where doing to this email-address:` +
      ` ${config.bugreportEmail}.`,
    logResponse,
    500
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
