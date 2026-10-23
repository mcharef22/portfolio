import { fr } from "./fr";
import { en } from "./en";
export type Locale = "fr" | "en";
export function toLocale(value: unknown, pathname = "/"): Locale {
  if (value === "fr" || value === "en") return value;
  return /\/en\/?$/.test(pathname) ? "en" : "fr";
}
export function getDictionary(locale: Locale) {
  return locale === "en" ? en : fr;
}
