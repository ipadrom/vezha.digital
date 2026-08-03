export type CaseMenuVariantId = "1" | "2" | "3" | "4" | "5";
export type CaseMenuView = "desktop" | "mobile";

export const caseMenuVariants = [
  { id: "1", name: "Редакторский rail", note: "Активный кейс раскрыт, остальные собраны в индекс." },
  { id: "2", name: "Верхний индекс", note: "Выбор проекта вынесен в горизонтальную строку." },
  { id: "3", name: "Один селектор", note: "Список появляется только по запросу." },
  { id: "4", name: "Стопка кейсов", note: "Проекты читаются как последовательность обложек." },
  { id: "5", name: "Числовой трек", note: "Навигация превращена в тонкую ось 01–04." },
] as const;

export function normalizeCaseMenuVariant(value: unknown): CaseMenuVariantId {
  return typeof value === "string" && ["1", "2", "3", "4", "5"].includes(value)
    ? value as CaseMenuVariantId
    : "1";
}

export function normalizeCaseMenuView(value: unknown): CaseMenuView {
  return value === "mobile" ? "mobile" : "desktop";
}

export function getCaseMenuVariant(value: unknown) {
  const id = normalizeCaseMenuVariant(value);
  return caseMenuVariants.find((item) => item.id === id)!;
}
