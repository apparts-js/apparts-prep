import { Schema, Required, Obj } from "@apparts/types";

import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import {
  OptionsType,
  RequestType,
  AssertionsType,
  OneOfReturnTypes,
  NextFnType,
} from "./types";

import { HttpError, httpErrorSchema } from "../error";

import { prepare } from "./preparator";
import { bearerAuth } from "./authorizationHeader";
import { verify as verifyJWT } from "jsonwebtoken";

export const prepauthTokenJWT =
  <JWTType extends { action: string }>(webtokenkey: string) =>
  <
    BodyType extends Obj<any, Required>,
    ParamsType extends Obj<any, Required>,
    QueryType extends Obj<any, Required>,
    ReturnTypes extends Schema<any, Required>[]
  >(
    assertions: AssertionsType<BodyType, ParamsType, QueryType>,
    next: (
      req: ExpressRequest & RequestType<BodyType, ParamsType, QueryType>,
      me: JWTType,
      res: ExpressResponse
    ) => Promise<OneOfReturnTypes<ReturnTypes>>,
    options: OptionsType<ReturnTypes> = {
      title: "",
      returns: [] as ReturnTypes,
    }
  ) => {
    return prepare(
      assertions,
      (async (req, res) => {
        const token = bearerAuth(req);
        if (!token) {
          return new HttpError(401, "Unauthorized");
        }
        let jwt: JWTType;
        try {
          jwt = verifyJWT(token, webtokenkey) as JWTType;
        } catch (err) {
          return new HttpError(401, "Token invalid");
        }
        const { action } = jwt;
        if (action !== "login") {
          return new HttpError(401, "Unauthorized");
        } else {
          return await next(req, jwt, res);
        }
      }) as NextFnType<BodyType, ParamsType, QueryType, ReturnTypes>,
      {
        ...options,
        auth: "Bearer jwt",
        returns: [
          ...options.returns,
          httpErrorSchema(401, "Unauthorized"),
          httpErrorSchema(401, "Token invalid"),
        ] as ReturnTypes,
      }
    );
  };
prepauthTokenJWT.returns = [
  httpErrorSchema(401, "Unauthorized"),
  httpErrorSchema(401, "Token invalid"),
];
