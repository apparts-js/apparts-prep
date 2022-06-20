const STYLE = require("./style");
const fs = require("fs");

const pathToJsFile = require.resolve("../../src/apiDocs/reactDocs.js");
const js = fs.readFileSync(pathToJsFile);

const apiToReact = (api, commitHash, apiName = "API", style = STYLE) => {
  return `
<!DOCTYPE html>
<!-- Commit hash: ${commitHash} -->
<html>
  <head>
    <script type="module">
      import ReactMarkdown from 'https://esm.sh/react-markdown@7?bundle'
      import remarkGfm from 'https://esm.sh/remark-gfm@3?bundle';
      import SyntaxHighlighter from 'https://esm.sh/react-syntax-highlighter@15.5.0';
      import { stackoverflowLight } from 'https://esm.sh/react-syntax-highlighter@15.5.0/dist/esm/styles/hljs';

      window.ReactMarkdown = ReactMarkdown;
      window.remarkGfm = remarkGfm;
      window.SyntaxHighlighter = SyntaxHighlighter;
      window.stackoverflowLight = stackoverflowLight;
    </script>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <style>
      ${style}
    </style>
    <script type="text/babel">
      const apiName = ${JSON.stringify(apiName)};
      const api = ${JSON.stringify(api)};
      ${js}
    </script>
  </head>
  <body>
    <div id="root" />
  </body>
</html>
  `;
};

module.exports = {
  apiToReact,
};
