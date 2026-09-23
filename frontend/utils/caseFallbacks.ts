import type { IProjectDetail } from "./interfaces/IProjects";

type LocaleCode = "ru" | "en";

// Only real project content may be used when the API is unavailable, and none is bundled now.
export function getCaseFallbacks(_locale: LocaleCode): IProjectDetail[] {
  return [];
}
