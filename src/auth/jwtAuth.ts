import { HttpError, httpErrorSchema } from "../error";
import { bearerAuth } from "./authorizationHeader";
import { Request } from "express";
import { verify as verifyJWT } from "jsonwebtoken";

export const validJwt = (webtokenkey: string) => {
  const fn = async (req: Request) => {
    const token = bearerAuth(req);
    if (!token) {
      return new HttpError(401, "Unauthorized");
    }

    try {
      const jwt = verifyJWT(token, webtokenkey);
      return jwt;
    } catch (err) {
      return new HttpError(401, "Unauthorized");
    }
  };
  fn.description = "Bearer jwt";
  fn.returns = [httpErrorSchema(401, "Unauthorized")];
  return fn;
};
