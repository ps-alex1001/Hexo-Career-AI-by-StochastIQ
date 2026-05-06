import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Removes duplicate spaces/newlines and caps length
export function optimizeTextLimit(text: string, maxLen: number): string {
  if (!text) return "";
  let flattened = text
    .replace(/[\r\n]+/g, "\n") // collapse multiple newlines
    .replace(/[ \t]{2,}/g, " ") // collapse multiple spaces
    .trim();
  return flattened.length > maxLen
    ? flattened.slice(0, maxLen) + "... [TRUNCATED]"
    : flattened;
}

// Aggressive pruning for web-scraped noise (headers, nav menus, ads)
export function optimizeScrapedWebText(text: string, maxLen: number): string {
  if (!text) return "";
  const lines = text.split("\n");
  const validLines = lines.filter((line) => {
    const trimmed = line.trim();
    // Keep lines that are long enough (paragraph), OR look like a list item/header
    return (
      trimmed.length > 30 ||
      /^[A-Z0-9\-\*\•]/.test(trimmed) ||
      trimmed.includes(":")
    );
  });
  return optimizeTextLimit(validLines.join("\n"), maxLen);
}
