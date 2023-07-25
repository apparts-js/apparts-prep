import { Request } from "express";

export const basicAuth = (req: Request) => {
  let m = /^Basic (.*)$/.exec(req.get("Authorization") || "");
  if (m) {
    m = /([^:]*):(.*)/.exec(Buffer.from(m[1], "base64").toString("ascii"));
    if (m) {
      const email = m[1],
        token = m[2];
      return [email, token];
    }
  }
  return [];
};

export const bearerAuth = (req: Request) => {
  const m = /^Bearer (.*)$/.exec(req.get("Authorization") || "");
  if (m) {
    return m[1];
  }
  return null;
};
