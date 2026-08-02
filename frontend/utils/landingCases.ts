import type { IProjects } from "./interfaces/IProjects.ts";

export function selectFeaturedProjects(projects: IProjects[], limit = 6): IProjects[] {
  return [...projects]
    .filter((project) => project.is_featured && project.slug)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, limit);
}

export function moveCaseIndex(current: number, direction: 1 | -1, length: number): number {
  if (length <= 0) return 0;
  return (current + direction + length) % length;
}

export function getNextProject(projects: IProjects[], slug: string): IProjects | undefined {
  if (!projects.length) return undefined;
  const current = projects.findIndex((project) => project.slug === slug);
  return projects[(current < 0 ? 0 : current + 1) % projects.length];
}

export function getMetricGridClass(count: number): string {
  if (count <= 1) return "is-single";
  if (count === 2) return "is-pair";
  return "is-grid";
}
