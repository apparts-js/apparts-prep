import { Application } from "express";

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
          assertions: handle.assertions,
          returns,
          title,
          description,
          options: { ...options, section: route.route.section },
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
