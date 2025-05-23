import { HttpError, httpErrorSchema } from "../error";
import { bearerAuth } from "./authorizationHeader";
import { Request } from "express";
import { verify as verifyJWT } from "jsonwebtoken";

export const validJwt = <TokenContent>(webtokenkey: string) => {
  const fn = async (req: Request) => {
    const token = bearerAuth(req);
    if (!token) {
      return new HttpError(401, "Unauthorized");
    }

    try {
      const jwt = verifyJWT(token, webtokenkey);
      return jwt as TokenContent;
    } catch (err) {
      return new HttpError(401, "Token invalid");
    }
  };
  fn.description = "Bearer jwt";
  fn.returns = [
    httpErrorSchema(401, "Unauthorized"),
    httpErrorSchema(401, "Token invalid"),
  ];
  return fn;
};
