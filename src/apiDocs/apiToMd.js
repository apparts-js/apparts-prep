const { usageExample } = require("./generateUsageExample");

const recursivelyPrintType = (type, indent = 0) => {
  let res = "";
  const spaces = " ".repeat(indent);
  if (type.type === "object") {
    if (typeof type.keys === "object") {
      res += `${type.optional ? "? " : ""}{
${Object.keys(type.keys)
  .map(
    (key) =>
      spaces + `  "${key}": ${recursivelyPrintType(type.keys[key], indent + 2)}`
  )
  .join(",\n")}
${spaces}}`;
    } else {
      res += `${type.optional ? "? " : ""}{
${spaces}  </>: ${recursivelyPrintType(type.values, indent + 2)}
${spaces}}`;
    }
  } else if (type.type === "array") {
    res += `${type.optional ? "? " : ""}[
${spaces}  ${recursivelyPrintType(type.items, indent + 2)}
${spaces}]`;
  } else if (type.type === "oneOf") {
    res += `${type.optional ? "? " : ""}(
${spaces}  ${type.alternatives
      .map((alt) => recursivelyPrintType(alt, indent + 2))
      .join(`\n${spaces}  | `)}
${spaces})`;
  } else if (type.type) {
    res += `${type.optional ? "? " : ""}<${type.type}>`;
  } else {
    res += JSON.stringify(type.value);
  }
  return res;
};

const apiToMd = (api, commitHash) => {
  const toc = [];
  const data = api.routes
    .map(
      ({
        method = "",
        path,
        assertions = {},
        returns = [],
        description,
        title,
        options = {},
      }) => {
        const [, version] = path.match(/v\/?(\d+)/) || [undefined, undefined];
        toc.push([
          `${method}_${path}`,
          method.toUpperCase(),
          path,
          title,
          version,
        ]);

        const headersMd = options.auth
          ? `
- **Header:**
  - Authorization: ${options.auth}
        `
          : "";

        const assertionsMd = Object.keys(assertions)
          .map(
            (type) =>
              `
- **${type.slice(0, 1).toUpperCase() + type.slice(1)}:**
` +
              Object.keys(assertions[type])
                .map(
                  (key) =>
                    `  - ${key}:
    ${"```"}
    ${recursivelyPrintType(assertions[type][key], 4)}${
                      assertions[type][key].default !== undefined
                        ? ` (= ${JSON.stringify(
                            assertions[type][key].default
                          )})`
                        : ""
                    }
    ${"```"}
`
                )
                .join("")
          )
          .join("");

        const returnsMd =
          `
- **Returns:**` +
          returns
            .map(
              ({ status, error, ...rest }) => `
  - Status: ${status}
    ${"```"}
    ${
      error
        ? `{ "error": ${JSON.stringify(error)} }`
        : recursivelyPrintType(rest, 4)
    }
    ${"```"}`
            )
            .join("");

        const usageMd = `
- **Usage:**
${"```js"}
${usageExample(method, path, assertions, options, returns)}
${"```"}`;

        return (
          `
### ${version ? "v" + version : ""} ${title || ""}

${description || ""}

**Method:** ${"`" + method.toUpperCase() + "`"}

**Path:** ${"`" + path + "`"}
` +
          headersMd +
          assertionsMd +
          returnsMd +
          usageMd
        );
      }
    )
    .join("");

  return `
# API Documentation

Commit hash: ${commitHash}

## Content

${toc
  .map(
    (a) =>
      `- [${a[4] ? "v" + a[4] : ""} - ${a[1]} ${a[3] || ""} ${a[2]}](#${
        a[4] ? "v" + a[4] : ""
      }-${(a[3] || "").toLowerCase().split(" ").join("-")})`
  )
  .join("\n")}
## Endpoints

${data}

  `;
};

module.exports = {
  apiToMd,
};
