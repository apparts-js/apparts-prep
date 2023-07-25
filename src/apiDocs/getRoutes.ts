import { Application } from "express";
import { Type, traverseType, ObjType } from "@apparts/types";

const recursiveFormatType = (type: Type): ObjType => {
  return traverseType(type, (type) => {
    const newType = { ...type };
    if ("default" in type) {
      newType.optional = true;
      if (typeof type.default === "function") {
        delete newType.default;
      }
    }
    return newType;
  }) as ObjType;
};

const formatReceives = (receives: {
  body?: Record<string, Type>;
  params?: Record<string, Type>;
  query?: Record<string, Type>;
}) => ({
  body: recursiveFormatType({ type: "object", keys: receives?.body || {} })
    .keys,
  params: recursiveFormatType({ type: "object", keys: receives?.params || {} })
    .keys,
  query: recursiveFormatType({ type: "object", keys: receives?.query || {} })
    .keys,
});

export const getRoutes = (app: Application) => {
  return ((app._router || {}).stack || [])
    .map((route) => {
      if (route.route && route.route.path) {
        const {
          route: { path, stack = [] },
        } = route;
        const { method, handle } = stack[stack.length - 1];
        const {
          returns = [],
          title = "",
          description,
          ...options
        } = handle.options || {};
        return {
          method,
          path,
          assertions: formatReceives(handle.assertions),
          returns: returns,
          title,
          description,
          options: {
            ...options,
            section: route.route.section,
          },
          route: route.route,
        };
      }
      return false;
    })
    .filter((a) => !!a)
    .map((route) => {
      return {
        ...route,
        returns: route.returns.map((type) => {
          if (
            type.keys?.type?.value === "HttpError" ||
            type.keys?.type?.value === "HttpCode"
          ) {
            return {
              status: type.keys.code.value,
              ...type.keys.message,
            };
          } else {
            return {
              status: 200,
              ...type,
            };
          }
        }),
      };
    });
};
