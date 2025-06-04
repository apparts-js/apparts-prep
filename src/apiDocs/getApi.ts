import { Application } from "express";
import { ApiSection, ExtendedExpressApp } from "./section";
import { getRoutes } from "./getRoutes";

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
      section.subsections || [],
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

  const routesWithSection = routes.map((route) => {
    for (const key in sectionMap) {
      const newId = sectionMap[key];

      if (route.options?.section && route.options.section === key) {
        return {
          ...route,
          options: {
            ...route.options,
            section: newId,
          },
        };
      }
    }
    return route;
  });
  return { routes: routesWithSection, sections };
};
