export function sanitizeClassName(className: string): string {
  return className.replace(/^(\s*|\n)/gm, '').trim();
}
