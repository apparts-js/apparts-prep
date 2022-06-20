"use strict";

const { HttpError } = require("../error");
const exceptionTo = (type, exception, to) => {
  if (exception.constructor.name === type.name) {
    return to;
  } else {
    throw exception;
  }
};

const { prepare } = require("./preparator");
const { basicAuth, bearerAuth } = require("./authorizationHeader.js");

let verifyJWT = function () {
  throw '@apparts/types: Missing peer dependency: "jsonwebtoken"\nPlease install manually with \n\tnpm i --save jsonwebtoken\n\n';
};
try {
  verifyJWT = require("jsonwebtoken").verify;
} catch (e) {
  // ignore
}

let NotFound;
const _prepauth = (assertions, fun, options = {}, usePw, User) => {
  return prepare(
    assertions,
    async (req, res) => {
      const [email, token] = basicAuth(req);
      if (!email || !token) {
        return new HttpError(400, "Authorization wrong");
      }
      const user = new User(req.dbs);
      try {
        await user.load({ email: email.toLowerCase(), deleted: false });
        if (usePw) {
          await user.checkAuthPw(token);
        } else {
          await user.checkAuth(token);
        }
      } catch (e) {
        return exceptionTo(NotFound, e, new HttpError(401, "User not found"));
      }
      return fun(req, user, res);
    },
    options
  );
};
_prepauth.returns = [
  { status: 401, error: "User not found" },
  { status: 400, error: "Authorization wrong" },
];

const prepauthToken =
  (User) =>
  (assertions, fun, options = {}) => {
    try {
      NotFound = require("@apparts/model").NotFound;
    } catch (e) {
      throw '@apparts/types: Missing peer dependency: "@apparts/model"\nPlease install manually with \n\tnpm i --save @apparts/model\n\n';
    }

    return _prepauth(
      assertions,
      fun,
      {
        ...options,
        auth: "Basic btoa(uname:token)",
        returns: [...(options.returns || []), ...prepauthToken.returns],
      },
      false,
      User
    );
  };
prepauthToken.returns = _prepauth.returns;

const prepauthPW =
  (User) =>
  (assertions, fun, options = {}) => {
    try {
      NotFound = require("@apparts/model").NotFound;
    } catch (e) {
      throw '@apparts/types: Missing peer dependency: "@apparts/model"\nPlease install manually with \n\tnpm i --save @apparts/model\n\n';
    }

    return _prepauth(
      assertions,
      fun,
      {
        ...options,
        auth: "Basic btoa(uname:password)",
        returns: [...(options.returns || []), ...prepauthPW.returns],
      },
      true,
      User
    );
  };
prepauthPW.returns = _prepauth.returns;

const prepauthTokenJWT =
  (webtokenkey) =>
  (assertions, fun, options = {}) => {
    return prepare(
      assertions,
      async (req, res) => {
        const token = bearerAuth(req);
        if (!token) {
          return new HttpError(401);
        }
        let jwt;
        try {
          jwt = verifyJWT(token, webtokenkey);
        } catch (err) {
          return new HttpError(401, "Token invalid");
        }
        const { action } = jwt;
        if (action !== "login") {
          return new HttpError(401);
        } else {
          return await fun(req, jwt, res);
        }
      },
      {
        ...options,
        auth: "Bearer jwt",
        returns: [...(options.returns || []), ...prepauthTokenJWT.returns],
      }
    );
  };
prepauthTokenJWT.returns = [
  { status: 401, error: "Unauthorized" },
  { status: 401, error: "Token invalid" },
];

module.exports = {
  prepauthToken,
  prepauthPW,
  prepauthTokenJWT,
};
