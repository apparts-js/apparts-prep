export { apiToMd } from "./apiToMd";
export { apiToHtml } from "./apiToHtml";
export { apiToReact } from "./apiToReact";
export { apiToOpenApi } from "./apiToOpenApi";
import { Application } from "express";

const getRoutes = (app: Application) => {
  return ((app._router || {}).stack || [])
    .map((route) => {
      if (route.route && route.route.path) {
        const {
          route: { path, stack = [] },
        } = route;
        const { method, handle } = stack[stack.length - 1];
        const { returns, title, description, ...options } =
          handle.options || {};
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
    .filter((a) => !!a);
};

type ApiSection = {
  title: string;
  description?: string;
  subsections?: ApiSection[];
};

type ExtendedExpressApp = Application & {
  appartsApiSections: ApiSection[];
};

export const section = ({
  app,
  title,
  description,
  routes,
}: {
  app: Application;
  title: string;
  description?: string;
  routes?: (app: Application) => void;
}) => {
  const exdendedApp = app as ExtendedExpressApp;
  const prevRoutes = getRoutes(app);
  const prevSections = exdendedApp.appartsApiSections || [];
  exdendedApp.appartsApiSections = [];
  routes && routes(app);
  const newRoutes = getRoutes(app);
  const addedSections = exdendedApp.appartsApiSections;
  const addedRoutes = newRoutes.filter(
    ({ method, path }) =>
      !prevRoutes.find(
        ({ method: m1, path: p1 }) => m1 === method && p1 === path
      )
  );

  exdendedApp.appartsApiSections = prevSections;
  exdendedApp.appartsApiSections.push({
    title,
    description,
    subsections: addedSections,
  });

  addedRoutes.forEach((route) => {
    const sectionId = exdendedApp.appartsApiSections.length - 1;
    // Has to be attached to the route instead of the function, as
    // otherwise, routes that use the same function would be handled
    // multiple times in here. That would brake stuff.
    const options = route.route;
    options.section = options.section
      ? sectionId + "." + options.section
      : "" + sectionId;
  });
};

export const getApi = (app: Application) => {
  const exdendedApp = app as ExtendedExpressApp;
  const api = getRoutes(app);
  return { routes: api, sections: exdendedApp.appartsApiSections || [] };
};
