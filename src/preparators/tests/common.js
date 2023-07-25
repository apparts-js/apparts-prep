const request = require("supertest");
const { prepare } = require("../preparator");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const expectSuccess = async (path, body, retBody = "ok") => {
  const res = await request(app)
    .post(path)
    .send(body)
    .expect("Content-Type", "application/json; charset=utf-8");
  expect(res.body).toStrictEqual(retBody);
  expect(res.status).toBe(200);
  return res;
};

const expectMiss = async (path, body, paramType, field, fType) => {
  const res = await request(app)
    .post(path)
    .send(body)
    .expect("Content-Type", "application/json; charset=utf-8");
  expect(res.body).toMatchObject({
    error: "Fieldmissmatch",
    description: `missing ${fType} for field "${field}" in ${paramType}`,
  });
  expect(res.status).toBe(400);
  return res;
};

const expectWrong = async (path, body, paramType, field, fType) => {
  const res = await request(app)
    .post(path)
    .send(body)
    .expect("Content-Type", "application/json; charset=utf-8");
  expect(res.body).toMatchObject({
    error: "Fieldmissmatch",
    description: `expected ${fType} for field "${field}" in ${paramType}`,
  });
  expect(res.status).toBe(400);
  return res;
};

const expectError = async (path, body, code, resBody) => {
  const res = await request(app)
    .post(path)
    .send(body)
    .expect("Content-Type", "application/json; charset=utf-8");
  expect(res.status).toBe(code);
  expect(res.body).toMatchObject(resBody);

  return res;
};

let lastPath = 0;

const defPrep = (path, assumptions, tipe) => {
  lastPath++;
  app.post(
    "/a" + lastPath + "/" + path,
    prepare(
      { receives: assumptions, returns: [], hasAccess: async () => true },
      async ({ body, query, params }) => {
        if (tipe) {
          const val = { ...body, ...query, ...params }["myField"];
          switch (tipe) {
            case "hex":
            case "base64":
            case "uuidv4":
            case "string":
            case "email":
            case "password":
              return typeof val === "string" ? val : "nope";

            case "id":
            case "int":
            case "float":
            case "time":
              return typeof val === "number" ? val : "nope";

            case "boolean":
              return typeof val === "boolean" ? val : "nope";

            case "array":
            case "array_int":
            case "array_id":
            case "array_time":
              return Array.isArray(val) ? val : "nope";

            case "object":
              return typeof val === "object" ? val : "nope";
            case "/":
              return val;
          }
        }
        return "ok";
      }
    )
  );
  return "/a" + lastPath + "/";
};

module.exports = {
  defPrep,
  expectWrong,
  expectMiss,
  expectSuccess,
  app,
  expectError,
};
