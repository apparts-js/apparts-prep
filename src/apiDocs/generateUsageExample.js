const pathToParamPath = (path) => {
  const pathParts = path.split("/").slice(3);

  const params = pathParts
    .filter((part) => part.charAt(0) === ":")
    .map((part) => part.substr(1));
  let counter = 1;
  const pathWithParams = pathParts
    .map((part) => (part.charAt(0) === ":" ? "$" + counter++ : part))
    .join("/");
  return { pathWithParams, params };
};

const usageExample = (method, path, assertions, options, returns) => {
  let res = "try {";
  const { pathWithParams, params } = pathToParamPath(path);
  res += `
  const response = await ${method}("${pathWithParams}", [ ${params.join(
    ", "
  )} ])`;
  if (assertions.query) {
    res += `
    .query({ ${Object.keys(assertions.query).join(", ")} })`;
  }
  if (assertions.body) {
    res += `
    .data({ ${Object.keys(assertions.body).join(", ")} })`;
  }
  if (options.auth) {
    res += `
    .auth(user)`;
  }
  for (const returnType of returns) {
    if (returnType.status >= 400 && returnType.error !== "Fieldmissmatch") {
      res += `
    .on({ status: ${returnType.status}, error: "${returnType.error}" }, () => {
       /* handle error */
    })`;
    }
  }
  res += `;
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}`;
  return res;
};

module.exports = { pathToParamPath, usageExample };
