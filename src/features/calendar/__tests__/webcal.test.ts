import { maskUrl, webcalUrl } from '../webcal';

describe('calendar feed URL', () => {
  const feed = 'https://club.example.org/calendar/3f9a1c2b7e8d4a6f.ics';

  it('switches to webcal:// so calendar apps subscribe instead of downloading', () => {
    expect(webcalUrl(feed)).toBe('webcal://club.example.org/calendar/3f9a1c2b7e8d4a6f.ics');
    expect(webcalUrl('http://a.fr/x.ics')).toBe('webcal://a.fr/x.ics');
  });

  it('masks the secret part', () => {
    const masked = maskUrl(feed);
    expect(masked).toBe('club.example.org/…6f.ics');
    expect(masked).not.toContain('3f9a1c2b');
  });
});
