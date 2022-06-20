const ReactMarkdown = window.ReactMarkdown;
const remarkGfm = window.remarkGfm;
const SyntaxHighlighter = window.SyntaxHighlighter;
const stackoverflowLight = window.stackoverflowLight;

const Markdown = (props) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <SyntaxHighlighter
            style={stackoverflowLight}
            customStyle={{ padding: 0 }}
            children={String(children).replace(/\n$/, "")}
            language={match[1]}
            {...props}
          />
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}
    {...props}
  />
);

const TocLine = ({ route }) => {
  const { path, title, version, method } = route,
    id = `${method}_${path}`,
    methodText = method.toUpperCase();

  return (
    <a href={`#${id}`}>
      <span className="version">{version ? "v" + version : ""}</span>
      <span className="link">{title || ""}</span>
      <br />
      &nbsp;&nbsp;<span className="method">{methodText}</span>
      <code>{path}</code>
    </a>
  );
};
const TocSection = ({ id, name, section, routes }) => {
  return (
    <React.Fragment>
      <a href={`#${id}`} style={{ fontWeight: "bold" }}>
        {name} {section.title}
      </a>
      <div style={{ paddingLeft: 20 }}>
        {getRoutesForSection(routes, "" + id).map((route) => (
          <TocLine key={route.method + "-" + route.path} route={route} />
        ))}
        {(section.subsections || []).map((section, i) => (
          <TocSection
            key={id + "." + i}
            id={id + "." + i}
            name={name + "." + (i + 1)}
            section={section}
            routes={routes}
          />
        ))}
      </div>
    </React.Fragment>
  );
};

const Toc = ({ sections, routes }) => (
  <div className="toc">
    <h2 style={{ marginLeft: 20 }}>Contents:</h2>

    {sections.map((section, i) => (
      <TocSection
        key={i}
        name={i + 1}
        id={i}
        section={section}
        routes={routes}
      />
    ))}
    {getRoutesForSection(routes).map((route) => (
      <TocLine key={route.method + "-" + route.path} route={route} />
    ))}
  </div>
);

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

const htmlifyLines = (text) =>
  text.replace(/\n/g, "<br/>").replace(/ {2}/g, "&nbsp;&nbsp;");

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
${spaces}  <span class="type">&lt;/&gt;</span>: ${recursivelyPrintType(
        type.values,
        indent + 2
      )}
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

const Type = ({ ...type }) => {
  return (
    <span
      className="code"
      dangerouslySetInnerHTML={{ __html: recursivelyPrintType(type) }}
    ></span>
  );
};

const getRoutesForSection = (routes, section) =>
  routes.filter(({ options }) => options.section === section);

const Section = ({
  title,
  description,
  subsections = [],
  routes,
  id,
  name,
}) => (
  <section id={id}>
    <h2>
      {name} {title}
    </h2>
    <Markdown>{description}</Markdown>
    {getRoutesForSection(routes, "" + id).map((route, i) => (
      <Route key={i} route {...route} />
    ))}
    {subsections.map((section, i) => (
      <Section
        key={i}
        {...section}
        id={id + "." + i}
        name={name + "." + (i + 1)}
        routes={routes}
      />
    ))}
  </section>
);

const Route = ({
  method = "",
  path,
  assertions = {},
  returns = [],
  description,
  title,
  options = {},
}) => {
  const [, version] = path.match(/v\/?(\d+)/) || [undefined, undefined];
  return (
    <section id={`${method}_${path}`}>
      <h3>
        <span className="version">{version ? "v" + version : ""}</span> {title}
      </h3>
      <Markdown>{description}</Markdown>
      <div className="api">
        <strong className="method">{method.toUpperCase()}</strong>{" "}
        <span className="path">{path}</span>
        <br />
        <ul>
          {options.auth && (
            <li>
              Header:
              <ul>
                <li>
                  <code className="block">Authorization: {options.auth}</code>
                </li>
              </ul>
            </li>
          )}

          {Object.keys(assertions).map((type, i) => (
            <li key={i}>
              {type.slice(0, 1).toUpperCase() + type.slice(1)}: <br />
              <ul>
                {Object.keys(assertions[type]).map((key) => (
                  <li key={key}>
                    <code className="block">
                      <span
                        className="code"
                        dangerouslySetInnerHTML={{
                          __html: htmlifyLines(
                            printDescription(assertions[type][key], 0)
                          ),
                        }}
                      ></span>
                      {key}: <Type {...assertions[type][key]} />
                      {assertions[type][key].default !== undefined
                        ? ` (= ${JSON.stringify(
                            assertions[type][key].default
                          )})`
                        : ""}
                    </code>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <span className="returns">Returns:</span> <br />
        <ul>
          {returns.map(({ status, error, ...rest }, i) => (
            <li key={i}>
              Status: {status}
              <code className="block">
                {error ? (
                  `{ "error": ${JSON.stringify(error)} }`
                ) : (
                  <Type {...rest} />
                )}
              </code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const Api = ({ api }) => {
  const { sections = [], routes = [] } = api;
  return (
    <div>
      <div className="docs">
        <Toc sections={sections} routes={routes} />
      </div>
      <div className="docs" style={{ paddingLeft: 10 }}>
        <h1>{apiName}</h1>
        {sections.map((section, i) => (
          <Section key={i} {...section} id={i} name={i + 1} routes={routes} />
        ))}
        {getRoutesForSection(routes, undefined).map((route, i) => (
          <Route key={i} {...route} />
        ))}
      </div>
    </div>
  );
};

window.onload = function () {
  const domContainer = document.querySelector("#root");
  const root = ReactDOM.createRoot(domContainer);

  root.render(
    <div>
      <Api api={api} apiName={apiName} />
    </div>
  );
};
