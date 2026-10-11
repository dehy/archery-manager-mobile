import type { PracticeAdviceSummary } from '@/api/types';
import { t } from '@/i18n';

const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

/** "Par Julien · 3 oct. 2026" */
export function adviceByline(a: Pick<PracticeAdviceSummary, 'author_firstname' | 'created_at'>) {
  return [
    a.author_firstname ? t('advice.by', { name: a.author_firstname }) : null,
    a.created_at ? date.format(new Date(a.created_at)) : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** "Archivé · 2 pièces jointes", or null when there is nothing to say. */
export function adviceCaption(a: Pick<PracticeAdviceSummary, 'archived_at' | 'attachments_count'>) {
  return (
    [
      a.archived_at ? t('advice.archived') : null,
      a.attachments_count > 0 ? t('advice.attachments', { count: a.attachments_count }) : null,
    ]
      .filter(Boolean)
      .join(' · ') || null
  );
}
