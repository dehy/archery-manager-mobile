/** "Camille R." -> "CR"; works for full names too. */
export function initials(displayName: string): string {
  const letters = displayName
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}]/gu, '')[0])
    .filter(Boolean);
  return (
    letters.length > 1 ? letters[0] + letters[letters.length - 1] : (letters[0] ?? '?')
  ).toUpperCase();
}
