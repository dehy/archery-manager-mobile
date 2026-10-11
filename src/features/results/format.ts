import type { ContestResult, HistoryResult } from '@/api/types';

type Scores = Pick<
  ContestResult,
  | 'discipline'
  | 'distance'
  | 'target_type'
  | 'target_size'
  | 'total'
  | 'max_total'
  | 'nb10'
  | 'nb10p'
  | 'tie_break_labels'
  | 'position'
>;

/** "18 m · Trispot 40 cm" */
export function targetLine(r: Pick<Scores, 'distance' | 'target_type' | 'target_size'>): string {
  const target =
    r.target_size != null ? `${r.target_type.label} ${r.target_size} cm` : r.target_type.label;
  return [r.distance != null ? `${r.distance} m` : null, target].filter(Boolean).join(' · ');
}

/** "568 / 600", or "568" when the format has no known maximum (field, 3D...). */
export function scoreLine(r: Pick<Scores, 'total' | 'max_total'>): string | null {
  if (r.total == null) return null;
  return r.max_total != null ? `${r.total} / ${r.max_total}` : String(r.total);
}

/** "12 × 10 · 3 × X": tie-break counts, named by the API (compound counts 10 and X). */
export function tieBreakLine(
  r: Pick<Scores, 'nb10' | 'nb10p' | 'tie_break_labels'>,
): string | null {
  const [first, second] = r.tie_break_labels;
  const parts = [
    r.nb10 != null ? `${r.nb10} × ${first}` : null,
    r.nb10p != null ? `${r.nb10p} × ${second}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

/** French ordinal for a ranking: "1er", "2e". */
export const positionLabel = (position: number | null): string | null =>
  position == null ? null : position === 1 ? '1er' : `${position}e`;

/** Seasons present in the history, newest first (results without a season are left out). */
export function seasonsOf(results: HistoryResult[]): number[] {
  const seasons = new Set<number>();
  for (const r of results) if (r.event?.season) seasons.add(r.event.season);
  return [...seasons].sort((a, b) => b - a);
}

/**
 * Totals are only comparable within one format (discipline, distance, target face and size):
 * 18 m indoor and 70 m outdoor scores must never share a chart.
 */
export const formatKey = (r: Scores) =>
  [r.discipline.code, r.distance, r.target_type.code, r.target_size].join('|');

export type ProgressionPoint = { id: number; date: string; total: number };
export type Progression = { label: string; max: number | null; points: ProgressionPoint[] };

/**
 * The season's most frequent format with at least two scored contests, oldest first, ready to
 * chart. `null` when no format has enough results to show a trend.
 */
export function progression(results: HistoryResult[], season: number): Progression | null {
  const byFormat = new Map<string, HistoryResult[]>();
  for (const r of results) {
    if (r.event?.season !== season || r.total == null || !r.event.starts_at) continue;
    const key = formatKey(r);
    byFormat.set(key, [...(byFormat.get(key) ?? []), r]);
  }
  let best: HistoryResult[] | null = null;
  for (const group of byFormat.values()) {
    if (group.length >= 2 && (!best || group.length > best.length)) best = group;
  }
  if (!best) return null;

  const points = best
    .map((r) => ({ id: r.id, date: r.event!.starts_at!, total: r.total! }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return { label: targetLine(best[0]), max: best[0].max_total, points };
}

export type CategoryGroup = { key: string; title: string; results: ContestResult[] };

/** Contest results arrive ordered by age category, then activity: group them under that heading. */
export function groupByCategory(results: ContestResult[]): CategoryGroup[] {
  const groups: CategoryGroup[] = [];
  for (const r of results) {
    const key = `${r.age_category.code}/${r.activity.code}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.results.push(r);
    else groups.push({ key, title: `${r.age_category.label} · ${r.activity.label}`, results: [r] });
  }
  return groups;
}
