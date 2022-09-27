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

type ApiSection = {
  title: string;
  id?: string;
  description?: string;
  subsections?: ApiSection[];
};

type ExtendedExpressApp = Application & {
  appartsApiSections: ApiSection[];
};

export const section = ({
  app,
  title,
  id,
  description,
  routes,
}: {
  app: Application;
  title: string;
  id?: string;
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
    id,
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

type ApiDocOptions = {
  routesFilter?: (route) => boolean;
  sectionFilter?: (section) => boolean;
};

const filterSections = (
  sections: ApiSection[],
  sectionFilter: (s: ApiSection) => boolean,
  oldSectionPrefix = "",
  newSectionPrefix = ""
) => {
  const filteredSections: ApiSection[] = [];
  let indexReplacements = {};
  let counter = 0;
  for (const section of sections) {
    const filterResult = sectionFilter(section);
    const {
      filteredSections: subsections,
      indexReplacements: subsectionReplacements,
    } = filterSections(
      section.subsections,
      filterResult ? () => true : sectionFilter,
      counter + ".",
      filteredSections.length + "."
    );
    indexReplacements = { ...indexReplacements, ...subsectionReplacements };
    if (subsections.length > 0 || filterResult) {
      indexReplacements[oldSectionPrefix + counter] =
        newSectionPrefix + filteredSections.length;
      filteredSections.push({ ...section, subsections: subsections });
    } else {
      indexReplacements[oldSectionPrefix + counter] = false;
    }
    counter++;
  }
  return { filteredSections, indexReplacements };
};

export const getApi = (app: Application, options: ApiDocOptions) => {
  const exdendedApp = app as ExtendedExpressApp;

  let routes = getRoutes(app).map(
    ({ method, path, assertions, returns, title, description, options }) => ({
      method,
      path,
      assertions,
      returns,
      title,
      description,
      options,
    })
  );
  if (options?.routesFilter) {
    routes = routes.filter(options.routesFilter);
  }
  const originalSections = exdendedApp.appartsApiSections || [];
  let sections = originalSections;
  let sectionMap: Record<string, string | false> = {};
  if (options?.sectionFilter) {
    const { filteredSections, indexReplacements } = filterSections(
      originalSections,
      options.sectionFilter
    );
    sections = filteredSections;
    sectionMap = indexReplacements;
  }

  for (const key in sectionMap) {
    const newId = sectionMap[key];

    routes = routes.filter(
      (route) =>
        !(route.options?.section && route.options.section === key) ||
        newId !== false
    );
  }

  for (const key in sectionMap) {
    const newId = sectionMap[key];

    routes = routes.map((route) => {
      if (route.options?.section && route.options.section === key) {
        return {
          ...route,
          options: {
            ...route.options,
            section: newId,
          },
        };
      }
      return route;
    });
  }
  return { routes, sections };
};
