import {
  OptionsType,
  NextFnWithAuthType,
  NextFnType,
  BodyObj,
  ParamsObj,
  QueryObj,
  ReturnsArray,
} from "./types";

import { HttpError, httpErrorSchema } from "../error";

import { prepare } from "./preparator";
import { bearerAuth } from "./authorizationHeader";
import { verify as verifyJWT } from "jsonwebtoken";

export const prepauthTokenJWT =
  <JWTType extends { action: string }>(webtokenkey: string) =>
  <
    BodyType extends BodyObj,
    ParamsType extends ParamsObj,
    QueryType extends QueryObj,
    ReturnTypes extends ReturnsArray
  >(
    options: OptionsType<BodyType, ParamsType, QueryType, ReturnTypes>,
    next: NextFnWithAuthType<
      BodyType,
      ParamsType,
      QueryType,
      ReturnTypes,
      JWTType
    >
  ) => {
    return prepare(
      {
        ...options,
        auth: "Bearer jwt",
        returns: [
          ...options.returns,
          httpErrorSchema(401, "Unauthorized"),
          httpErrorSchema(401, "Token invalid"),
        ] as ReturnTypes,
      },
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
      }) as NextFnType<BodyType, ParamsType, QueryType, ReturnTypes>
    );
  };
prepauthTokenJWT.returns = [
  httpErrorSchema(401, "Unauthorized"),
  httpErrorSchema(401, "Token invalid"),
];
