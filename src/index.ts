export * from "./preparators";
export * from "./code";
export * from "./error";
export * from "./checkReturns/checkApiTypes";

import * as genApiDocs from "./apiDocs";
const section = genApiDocs.section;

export { genApiDocs, section };
