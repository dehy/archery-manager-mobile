import { fireEvent, getDefaultNormalizer, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { HtmlContent, isSafeLink } from '../HtmlContent';

// Shapes produced by the API: league/commonmark (GitHub flavor) then Symfony's HTML sanitizer.
const advice = `<h2>Placement</h2>
<p>Garde le <strong>coude</strong> haut et <em>relâche</em> en douceur.<br />Respire.</p>
<ul>
<li>Pieds écartés</li>
<li>Regard sur la cible
<ol start="3"><li>Viser</li><li>Tirer</li></ol>
</li>
</ul>
<blockquote><p>La régularité avant la puissance.</p></blockquote>
<pre><code>Séance A :
  3 × 12 flèches</code></pre>
<table><thead><tr><th>Distance</th><th>Volées</th></tr></thead>
<tbody><tr><td>18 m</td><td>10</td></tr></tbody></table>
<p>Voir <a href="https://ffta.fr/regles">les règles</a> ou <a href="mailto:coach@example.org">écrire</a>.</p>`;

describe('HtmlContent', () => {
  it('renders headings, inline styles, lists, quotes, code and tables as text', async () => {
    await render(<HtmlContent html={advice} />);
    expect(screen.getByRole('header')).toHaveTextContent('Placement');
    expect(screen.getByText(/Garde le/)).toHaveTextContent(
      'Garde le coude haut et relâche en douceur.\nRespire.',
    );
    expect(screen.getByText('Pieds écartés')).toBeTruthy();
    expect(screen.getByText('3.')).toBeTruthy(); // <ol start="3">
    expect(screen.getByText('4.')).toBeTruthy();
    expect(screen.getByText('La régularité avant la puissance.')).toBeTruthy();
    // <pre> keeps its whitespace (the default matcher would collapse it).
    const raw = { normalizer: getDefaultNormalizer({ trim: false, collapseWhitespace: false }) };
    expect(screen.getByText('Séance A :\n  3 × 12 flèches', raw)).toBeTruthy();
    expect(screen.getByText('Distance')).toBeTruthy();
    expect(screen.getByText('18 m')).toBeTruthy();
  });

  it('opens https and mailto links', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await render(<HtmlContent html={advice} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    await fireEvent.press(screen.getByText('les règles'));
    expect(openURL).toHaveBeenCalledWith('https://ffta.fr/regles');
    openURL.mockRestore();
  });

  it('never turns other schemes into links (defence in depth)', async () => {
    await render(
      <HtmlContent
        html={'<p><a href="javascript:alert(1)">piège</a> <a href="http://x.fr">http</a></p>'}
      />,
    );
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText(/piège/)).toBeTruthy();
  });

  it('keeps elements it has no special rendering for', async () => {
    await render(
      <HtmlContent
        html={
          '<section><dl><dt>Arme</dt><dd>Classique</dd></dl><p>Fin <mark>importante</mark></p></section>'
        }
      />,
    );
    expect(screen.getByText('Arme')).toBeTruthy();
    expect(screen.getByText('Classique')).toBeTruthy();
    expect(screen.getByText(/importante/)).toBeTruthy();
  });

  it('renders nothing for empty advice', async () => {
    await render(<HtmlContent html="" />);
    expect(screen.queryByText(/./)).toBeNull();
  });
});

describe('isSafeLink', () => {
  it('accepts only https and mailto', () => {
    expect(isSafeLink('https://a.fr')).toBe(true);
    expect(isSafeLink(' mailto:a@b.fr')).toBe(true);
    expect(isSafeLink('http://a.fr')).toBe(false);
    expect(isSafeLink('javascript:alert(1)')).toBe(false);
    expect(isSafeLink(undefined)).toBe(false);
  });
});
