export function sanitizeClassName(className: string): string {
  return className.replace(/\s+/g, " ").trim();
}
