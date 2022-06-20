module.exports = `
:root {
  --dark-0: #0e0e0c;
  --dark-1: #292923;
  --dark-2: #45453a;
  --dark-3: #616152;
  --dark-4: #7c7c69;

  --bright-0: #adad9e;
  --bright-1: #c0c0b5;
  --bright-2: #d4d4cc;
  --bright-3: #e7e7e3;
  --bright-4: #fafaf9;

  --primary-0: #5e5108;
  --primary-1: #7d6c0b;
  --primary-2: #9c870e;
  --primary-3: #bba111;
  --primary-4: #dabc14;
  --primary-5: #ebcd25;
  --primary-6: #eed444;
  --primary-7: #f1dc63;
  --primary-8: #f4e382;
  --primary-9: #f7eaa2;

  --secondary-0: #425511;
  --secondary-1: #587216;
  --secondary-2: #6e8e1c;
  --secondary-3: #84aa22;
  --secondary-4: #9ac727;
  --secondary-5: #abd838;
  --secondary-6: #b7dd55;
  --secondary-7: #c3e371;
  --secondary-8: #cfe98d;
  --secondary-9: #dbeeaa;

  --green-0: #145214;
  --green-1: #248f24;
  --green-2: #33cc33;
  --green-3: #70db70;
  --green-4: #adebad;

  --yellow-0: #565610;
  --yellow-1: #96971c;
  --yellow-2: #d7d728;
  --yellow-3: #e3e369;
  --yellow-4: #efefa9;

  --red-0: #521414;
  --red-1: #8f2424;
  --red-2: #cc3333;
  --red-3: #db7070;
  --red-4: #ebadad;
}

body {
  background: var(--bright-5);
  font-family: sans-serif;
}
* {
  line-height: 1.5rem;
}
section {
  background: rgba(0,0,0,0.05);
  padding: 40px;
  border-radius: 10px;
  margin: 20px 0px 20px 0px;
}
.path {
  font-weight: bold;
  color: var(--primary-1);
}
.version {
  color: var(--green-1);
}
.method {
  color: var(--secondary-2);
}
.type {
  color: var(--primary-3);
}
.funcName {
  font-size: 8px;
  color: gray;
}
.error {
  font-weight: bold;
  color: red;
}
.returns, .usage {
  font-weight: bold;
}
.docs {
  max-width: 800px;
  margin: auto;
}
.toc {
  margin: 20px 20px 100px 20px;
  padding: 20px;
  background: var(--bright-3);
  border-radius: 10px;
}
.toc .method {
  min-width: 60px;
  text-align: right;
  display: inline-block;
}
.toc .link {
  text-decoration: underline;
}
li {
  margin-bottom: 10px;
}
h2{
}
.toc code {
  display: inline-block;
  margin: 5px;
}
.toc a {
  margin: 20px;
  color: var(--primary-1);
  display: block;
  text-decoration: none;
}
code {
  font-family: mono, monospace;
  background: var(--bright-2);
  padding: 2px;
  border-radius: 4px;
}

code.block, pre code {
  display: block;
  padding: 4px 10px;
}

span.code {
  font-family: mono, monospace;
}

@media (min-width: 1000px) {
  .docs:first-of-type {
    position: fixed;
    width: min(48vw, 600px);
    max-height: 100vh;
    overflow-y: scroll;
  }
  .docs:last-of-type {
    max-width: 50vw;
    margin-left: min(48vw,600px);
    margin-right: unset;
  }
}
`;
