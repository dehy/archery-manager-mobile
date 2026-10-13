import { act, renderHook } from '@testing-library/react-native';

import { usePullToRefresh } from '../usePullToRefresh';

describe('usePullToRefresh', () => {
  it('spins only while the refetches started by a pull are running', async () => {
    let finish: () => void = () => {};
    const first = jest.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const second = jest.fn(() => Promise.resolve());
    const { result } = await renderHook(() => usePullToRefresh(first, second));
    expect(result.current.refreshing).toBe(false);

    let pulled: Promise<void> = Promise.resolve();
    await act(async () => {
      pulled = result.current.onRefresh();
    });
    expect(result.current.refreshing).toBe(true);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish();
      await pulled;
    });
    expect(result.current.refreshing).toBe(false);
  });

  it('stops spinning when a refetch fails', async () => {
    const failing = jest.fn(() => Promise.reject(new Error('offline')));
    const { result } = await renderHook(() => usePullToRefresh(failing));
    await act(async () => {
      await result.current.onRefresh().catch(() => {});
    });
    expect(result.current.refreshing).toBe(false);
  });
});
