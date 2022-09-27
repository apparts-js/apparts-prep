import { Application } from "express";
import { getRoutes } from "./getRoutes";

export type ApiSection = {
  title: string;
  id?: string;
  description?: string;
  subsections?: ApiSection[];
};

export type ExtendedExpressApp = Application & {
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
