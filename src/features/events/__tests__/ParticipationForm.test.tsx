import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ApiError } from '@/api/errors';
import { api } from '@/auth/session';

import { answerErrorMessage, ParticipationForm } from '../ParticipationForm';

import { contestEvent, trainingEvent } from '@/test/events';

// The native segmented control and pull-down menus render nothing under Jest: stand in with one
// pressable per option, labelled like the native choice.
jest.mock('@/ui/controls', () => {
  const { createElement } = jest.requireActual('react');
  const { Pressable, Text, View } = jest.requireActual('react-native');
  const Choices = ({
    label,
    options,
    onChange,
  }: {
    label?: string;
    options: { value: string | number; label: string }[];
    onChange: (value: string | number) => void;
  }) =>
    createElement(
      View,
      null,
      label ? createElement(Text, null, label) : null,
      options.map((o) =>
        createElement(
          Pressable,
          { key: String(o.value), onPress: () => onChange(o.value) },
          createElement(Text, null, o.label),
        ),
      ),
    );
  return { Segmented: Choices, PickerRow: Choices };
});

const wrap = (ui: ReactNode) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {ui}
    </QueryClientProvider>,
  );

describe('ParticipationForm', () => {
  afterEach(() => jest.restoreAllMocks());

  it('uses training wording and offers no contest fields', async () => {
    await wrap(<ParticipationForm event={trainingEvent} />);
    expect(screen.getByText('Présent')).toBeTruthy();
    expect(screen.getByText('Absent')).toBeTruthy();
    expect(screen.queryByText('Blason')).toBeNull();
    expect(screen.queryByText('Départ')).toBeNull();
  });

  it('sends the whole contest answer and shows confirmation', async () => {
    const request = jest
      .spyOn(api, 'request')
      .mockResolvedValue({ event: { ...contestEvent, participation_state: 'registered' } });
    await wrap(<ParticipationForm event={contestEvent} />);

    await fireEvent.press(screen.getByText('Je suis inscrit'));
    await fireEvent.press(screen.getByText('Poulies'));
    await fireEvent.press(screen.getByText('Trispot'));
    await fireEvent.press(screen.getByText('Départ 2'));
    await fireEvent.press(screen.getByText('Enregistrer'));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith('/events/12/participation', {
        method: 'PUT',
        body: {
          participation_state: 'registered',
          activity: 'CO',
          target_type: 'trispot',
          departure: 2,
        },
      }),
    );
    await waitFor(() => expect(screen.getByText('Réponse enregistrée.')).toBeTruthy());
  });

  it('shows a restricted event as read-only', async () => {
    await wrap(<ParticipationForm event={{ ...contestEvent, can_participate: false }} />);
    expect(screen.getByText(/réservé à certains groupes/)).toBeTruthy();
  });

  it('explains a refused answer', async () => {
    jest.spyOn(api, 'request').mockRejectedValue(new ApiError(403, 'event_restricted', 'x'));
    await wrap(<ParticipationForm event={trainingEvent} />);
    await fireEvent.press(screen.getByText('Absent'));
    await fireEvent.press(screen.getByText('Enregistrer'));
    await waitFor(() =>
      expect(screen.getByText("Cet événement est réservé à d'autres groupes.")).toBeTruthy(),
    );
  });
});

describe('answerErrorMessage', () => {
  it('maps codes to French copy', () => {
    expect(answerErrorMessage(new ApiError(422, 'validation_failed', 'x'))).toContain(
      "n'est pas valide",
    );
    expect(answerErrorMessage(new ApiError(0, 'network_error', 'x'))).toContain('serveur');
    expect(answerErrorMessage(new Error('boom'))).toContain("Impossible d'enregistrer");
  });
});
