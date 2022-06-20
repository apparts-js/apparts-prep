export { prepare } from "./preparators/preparator";
export * from "./code";
export * from "./error";
export * from "./preparators/prepauth";
export * from "./checkReturns/checkApiTypes";

import * as genApiDocs from "./apiDocs";
const section = genApiDocs.section;

export { genApiDocs, section };
