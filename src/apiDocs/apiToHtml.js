const STYLE = require("./style");

const { usageExample: _usageExample } = require("./generateUsageExample");

const usageExample = (...args) => {
  const res = _usageExample(...args);
  return res.replace(/\n/g, "<br/>").replace(/ {2}/g, "&nbsp;&nbsp;");
};

const htmlifyLines = (text) =>
  text.replace(/\n/g, "<br/>").replace(/ {2}/g, "&nbsp;&nbsp;");

const brakeLines = (text, lineLength) => {
  if (!text || text.length <= 0) {
    return [];
  }
  const line = text.slice(0, lineLength);
  const lineUntilBrake = line
    .split("")
    .reverse()
    .reduce((a, b) => (a.length > 0 ? a + b : b === " " ? b : ""), "")
    .split("")
    .reverse()
    .join("");
  if (lineUntilBrake.length > 0) {
    const rest = text.slice(lineUntilBrake.length);
    return [lineUntilBrake, ...brakeLines(rest, lineLength)];
  } else {
    const lines = text.split(" ", 1);
    return [
      lines[0],
      ...brakeLines(text.slice(lines[0].length + 1), lineLength),
    ];
  }
};

const printDescription = ({ description }, indent, addSpace) => {
  if (description) {
    return (
      (addSpace ? "\n" : "") +
      " ".repeat(indent) +
      "/* " +
      brakeLines(description + " */ ", 60).join("\n" + " ".repeat(indent + 3)) +
      "\n"
    );
  } else {
    return "";
  }
};

const recursivelyPrintType = (type, indent = 0) => {
  let res = "";
  const spaces = " ".repeat(indent);
  if (type.type === "object") {
    if (typeof type.keys === "object") {
      res += `${type.optional ? "? " : ""}{
${Object.keys(type.keys)
  .map(
    (key) =>
      printDescription(type.keys[key], indent + 2, true) +
      spaces +
      `  "${key}": ${recursivelyPrintType(type.keys[key], indent + 2)}`
  )
  .join(",\n")}
${spaces}}`;
    } else {
      res += `${type.optional ? "? " : ""}{
${spaces}  <span class="type">&lt;/&gt;</span>: <span class="type">${recursivelyPrintType(
        type.values,
        indent + 2
      )}</span>
${spaces}}`;
    }
  } else if (type.type === "array") {
    res += `${type.optional ? "? " : ""}[
${printDescription(type.items, indent + 2)}${spaces}  ${recursivelyPrintType(
      type.items,
      indent + 2
    )}
${spaces}]`;
  } else if (type.type === "oneOf") {
    res += `${type.optional ? "? " : ""}(
${type.alternatives
  .map(
    (alt) =>
      printDescription(alt, indent + 2, true) +
      spaces +
      "  " +
      recursivelyPrintType(alt, indent + 2)
  )
  .join(` |\n`)}
${spaces})`;
  } else if (type.type) {
    res += `${type.optional ? "? " : ""}<span class="type">&lt;${
      type.type
    }&gt;</span>`;
  } else {
    res += JSON.stringify(type.value);
  }
  return htmlifyLines(res);
};

const apiToHtml = (api, commitHash, style = STYLE) => {
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
        return `<section id="${method}_${path}">
   <h3><span class="version">${version ? "v" + version : ""}</span>
${title || ""}</h3>
   <p >${description || ""}</p>
   <div class="api">
     <strong class="method">${method.toUpperCase()}</strong>
     <span class="path">${path}</span><br/>
     <ul>
     ${
       options.auth
         ? `
        <li>Header:
            <ul>
        <li>
        <code class="block">Authorization: ${options.auth}</code>
        </li>
        </ul>
        </li>
        `
         : ""
     }

     ${Object.keys(assertions)
       .map(
         (type) =>
           `
        <li>${type.slice(0, 1).toUpperCase() + type.slice(1)}: <br><ul>` +
           Object.keys(assertions[type])
             .map(
               (key) => `
                                                               <li><code class="block">${htmlifyLines(
                                                                 printDescription(
                                                                   assertions[
                                                                     type
                                                                   ][key],
                                                                   0
                                                                 )
                                                               )}${key}: ${recursivelyPrintType(
                 assertions[type][key]
               )}${
                 assertions[type][key].default !== undefined
                   ? ` (= ${JSON.stringify(assertions[type][key].default)})`
                   : ""
               }</code></li>
        </li>`
             )
             .join("") +
           "</ul></li>"
       )
       .join("")}
     </ul>
     <span class="returns">Returns:</span> <br>
     <ul>
     ${returns
       .map(
         ({ status, error, ...rest }) => `
        <li>Status: ${status}
        <code class="block">${
          error
            ? `{ "error": ${JSON.stringify(error)} }`
            : recursivelyPrintType(rest)
        }</code></li>
        `
       )
       .join("")}
     </ul>
     <span class="usage">Usage:</span> <br><br>
     <code class="block">${usageExample(
       method,
       path,
       assertions,
       options,
       returns
     )}</code>
  </div>
</section>`;
      }
    )
    .join("");

  return `
<!DOCTYPE html>
<!-- Commit hash: ${commitHash} -->
<html>
  <head>
    <style>
      ${style}
    </style>
  </head>
  <body>
    <div class="docs" >
      <h2>Contents:</h2>
      <div class="toc">
        ${toc
          .map(
            (a) =>
              `<a href="#${a[0]}">
  <span class="version">${a[4] ? "v" + a[4] : ""}</span>
  <span class="link">${a[3] || ""}</span><br/>
             &nbsp;&nbsp;<span class="method">${
               a[1]
             }</span><code class="block">${a[2]}</code>
  </a>`
          )
          .join("")}
      </div>
    </div>
    <div class="docs" >
     <h2>Endpoints:</h2>
    ${data}
    </div>
  </body>
</html>

  `;
};

module.exports = {
  apiToHtml,
};
