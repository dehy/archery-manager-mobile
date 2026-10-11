import { adviceByline, adviceCaption } from '../format';

describe('advice format', () => {
  it('builds the byline from what is known', () => {
    expect(
      adviceByline({ author_firstname: 'Julien', created_at: '2026-10-03T18:00:00+02:00' }),
    ).toBe('Par Julien · 3 oct. 2026');
    expect(adviceByline({ author_firstname: null, created_at: null })).toBe('');
  });

  it('mentions archiving and attachments only when relevant', () => {
    expect(adviceCaption({ archived_at: '2026-10-03T18:00:00+02:00', attachments_count: 2 })).toBe(
      'Archivé · 2 pièces jointes',
    );
    expect(adviceCaption({ archived_at: null, attachments_count: 1 })).toBe('1 pièce jointe');
    expect(adviceCaption({ archived_at: null, attachments_count: 0 })).toBeNull();
  });
});
