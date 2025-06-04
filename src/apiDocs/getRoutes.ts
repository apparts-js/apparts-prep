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
  const appRoutes = ((app._router || {}).stack || []) as any[];

  return appRoutes
    .filter((route) => route.route && route.route.path)
    .map((route) => {
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
        method: method as string,
        path: path as string,
        assertions: formatReceives(handle.assertions),
        returns: returns,
        title: title as string,
        description: description as string,
        options: {
          ...(options as Record<string, any>),
          section: route.route.section as string | undefined,
        },
        route: route.route,
      };
    })
    .map((route) => {
      return {
        ...route,
        returns: (route.returns as Type[]).map((type) => {
          if (
            "keys" in type &&
            "type" in type.keys &&
            "value" in type.keys.type &&
            "code" in type.keys &&
            "value" in type.keys.code &&
            (type.keys?.type?.value === "HttpError" ||
              type.keys?.type?.value === "HttpCode")
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
