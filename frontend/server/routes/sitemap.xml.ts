import type { IProjectDetail, IProjects } from "~/utils/interfaces/IProjects";
import { absoluteSiteUrl } from "~/utils/seo";

// Lists the landing and every public case the admin has not marked noindex.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiBase = `${config.apiInternalUrl || config.public.apiUrl}/api`;
  const projects = await $fetch<IProjects[]>(`${apiBase}/projects`, { query: { lang: "ru" } }).catch(() => []);
  const details = await Promise.all(projects.filter((project) => project.slug).map((project) =>
    $fetch<IProjectDetail>(`${apiBase}/projects/${project.slug}`, { query: { lang: "ru" } }).catch(() => null)));
  const casePaths = details
    .filter((project): project is IProjectDetail => Boolean(project)
      && !project.seo_noindex
      && !project.metrics.some((metric) => metric.is_demo))
    .map((project) => `/cases/${project.slug}`);

  const urls = ["/", ...casePaths]
    .map((path) => `  <url><loc>${absoluteSiteUrl(path)}</loc></url>`)
    .join("\n");
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
});
