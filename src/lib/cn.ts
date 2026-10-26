/** Tiny className joiner — no extra dependency in Phase A. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
