import { render, screen } from '@testing-library/react-native';

import { BarChart } from '../BarChart';

describe('BarChart', () => {
  it('exposes one sentence to screen readers and labels the ends of the axis', async () => {
    await render(
      <BarChart
        summary="Progression sur 3 concours"
        bars={[
          { key: 1, value: 540, label: '15 nov.' },
          { key: 2, value: 555, label: '10 déc.' },
          { key: 3, value: 571, label: '1 févr.' },
        ]}
      />,
    );
    expect(screen.getByLabelText('Progression sur 3 concours')).toBeTruthy();
    expect(screen.getByText('15 nov.')).toBeTruthy();
    expect(screen.getByText('1 févr.')).toBeTruthy();
    expect(screen.queryByText('10 déc.')).toBeNull();
  });

  it('renders nothing without data', async () => {
    const { toJSON } = await render(<BarChart summary="x" bars={[]} />);
    expect(toJSON()).toBeNull();
  });
});
