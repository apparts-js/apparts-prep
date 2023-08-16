import { v1 as uuidv1 } from "uuid";
import {
  types,
  checkType as recursiveCheck,
  explainCheck,
  Obj,
  Required,
  Schema,
  obj,
  fillInDefaultsStrict,
} from "@apparts/types";
import { assertionType } from "../apiTypes/preparatorAssertionType";
import { returnType } from "../apiTypes/preparatorReturnType";
import { get as getConfig } from "@apparts/config";
const config = getConfig("types-config");
import {
  AuthResponse,
  LogErrorFn,
  LogResponseFn,
  NextFnType,
  OptionsType,
} from "./types";
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { httpErrorSchema } from "../error";
import { HttpCode } from "../code";

enum DataType {
  HttpError,
  HttpCode,
  DontRespond,
  Data,
}

export const prepare = <
  BodyType extends Obj<Required, any>,
  ParamsType extends Obj<Required, any>,
  QueryType extends Obj<Required, any>,
  ReturnTypes extends Schema<Required, any>[],
  AuthType extends AuthResponse
>(
  options: OptionsType<BodyType, ParamsType, QueryType, ReturnTypes, AuthType>,
  next: NextFnType<BodyType, ParamsType, QueryType, ReturnTypes, AuthType>
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

  const f = async function (req: ExpressRequest, res: ExpressResponse) {
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
        catchError(req, res, e, options.logError, options.logResponse);
        return;
      }
      if (valid !== true) {
        const r = {};
        r[fieldName] = valid;

        send(
          req,
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
      const accessResult = await options.hasAccess(req, res);
      switch (detectTypeOfData(accessResult)) {
        case DataType.HttpError:
          throw accessResult;
        case DataType.HttpCode:
          sendHttpCode(
            accessResult as HttpCode<any, any>,
            req,
            res,
            options.logResponse
          );
          return;
        case DataType.DontRespond:
          return;
      }

      const data = await next(req, res, accessResult);
      switch (detectTypeOfData(data)) {
        case DataType.HttpError:
          throw data;
        case DataType.HttpCode:
          sendHttpCode(data, req, res, options.logResponse);
          return;
        case DataType.DontRespond:
          return;
        default:
          send(req, res, JSON.stringify(data), options.logResponse);
      }
    } catch (e) {
      catchError(req, res, e, options.logError, options.logResponse);
    }
  };

  f.assertions = fields;
  f.options = {
    ...options,
    ...(options.hasAccess.description
      ? { auth: options.hasAccess.description }
      : {}),
    returns: [
      ...returnTypes,
      httpErrorSchema(400, "Fieldmissmatch").getType(),
      ...(options.hasAccess.returns || []).map((r) => r.getType()),
    ],
  };
  delete f.options.receives;
  delete f.options.hasAccess;
  return f;
};

const send = (
  req: ExpressRequest,
  res: ExpressResponse,
  body: string,
  logResponse?: LogResponseFn,
  status?: number
) => {
  if (status) {
    res.status(status);
  }
  res.send(body);
  if (logResponse) {
    logResponse(body, req, res);
  }
};

const detectTypeOfData = (data: unknown) => {
  if (typeof data === "object" && data !== null) {
    if ((data as { type: unknown }).type === "HttpError") {
      return DataType.HttpError;
    } else if ((data as { type: unknown }).type === "HttpCode") {
      return DataType.HttpCode;
    } else if ((data as { type: unknown }).type === "DontRespond") {
      return DataType.DontRespond;
    }
  }
  return DataType.Data;
};

const sendHttpCode = (
  data: HttpCode<any, any>,
  req: ExpressRequest,
  res: ExpressResponse,
  logResponse?: LogResponseFn
) => {
  send(req, res, JSON.stringify(data.message), logResponse, data.code);
};

const catchError = (
  req: ExpressRequest,
  res: ExpressResponse,
  e,
  logError?: LogErrorFn,
  logResponse?: LogResponseFn
) => {
  if (typeof e === "object" && e !== null && e.type === "HttpError") {
    send(req, res, JSON.stringify(e.message), logResponse, e.code);
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
    logError(errorMsg, req, res);
  } else {
    console.log(errorMsg);
  }
  res.setHeader("Content-Type", "text/plain");
  send(
    req,
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
  /*
   * TODO: Clean this mess up by using recursiveCheck on the whole
   * object. Take a look at the branch feature/deep-defaults.
   */

  const keys = Object.keys(wanted);
  for (let i = 0; i < keys.length; i++) {
    const param = keys[i];

    const exists = param in given && given[param] !== undefined;
    if (!exists) {
      if ("default" in wanted[param]) {
        continue;
      }
      if (wanted[param]["optional"] !== true) {
        const res = {};
        res[param] = "missing " + wanted[param]["type"];
        return res;
      }
      continue;
    }

    if (!convertIfNeeded(wanted, param, given, field)) {
      const res = {};
      res[param] = "expected " + wanted[param]["type"];
      return res;
    }
  }

  const newRequest = fillInDefaultsStrict(
    {
      type: "object",
      keys: wanted,
    },
    given
  );

  for (let i = 0; i < keys.length; i++) {
    const param = keys[i];
    if (!(param in newRequest) && wanted[param].optional) {
      continue;
    }
    given[param] = newRequest[param];

    if (!recursiveCheck(given[param], wanted[param])) {
      const res = {};
      res[param] = "expected " + wanted[param]["type"];
      return res;
    }
  }

  return true;
};

const convertIfNeeded = (wanted, param, given, field) => {
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
  return true;
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
