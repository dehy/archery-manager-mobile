import { buildAnswer, canSave, initialDraft, isContest } from '../participation';
import { mapsUrl } from '../maps';

import { contestEvent, trainingEvent } from '@/test/events';

describe('participation answer', () => {
  it('starts from the current answer and defaults the activity', () => {
    expect(initialDraft(trainingEvent)).toEqual({
      state: 'registered',
      activity: 'CL',
      targetType: null,
      departure: null,
    });
    expect(initialDraft(contestEvent).activity).toBe('CL');
    expect(initialDraft(contestEvent).state).toBeNull();
  });

  it('never sends contest-only fields for other events', () => {
    const answer = buildAnswer(initialDraft(trainingEvent), trainingEvent.participation_options);
    expect(answer).toEqual({ participation_state: 'registered', activity: 'CL' });
    expect(answer).not.toHaveProperty('target_type');
    expect(answer).not.toHaveProperty('departure');
  });

  it('sends the whole contest answer', () => {
    const draft = {
      state: 'registered' as const,
      activity: 'CO',
      targetType: 'trispot',
      departure: 2,
    };
    expect(buildAnswer(draft, contestEvent.participation_options)).toEqual({
      participation_state: 'registered',
      activity: 'CO',
      target_type: 'trispot',
      departure: 2,
    });
  });

  it('has nothing to send without an answer', () => {
    expect(buildAnswer(initialDraft(contestEvent), contestEvent.participation_options)).toBeNull();
  });

  it('tells contests from other events by their target types', () => {
    expect(isContest(contestEvent.participation_options)).toBe(true);
    expect(isContest(trainingEvent.participation_options)).toBe(false);
  });
});

describe('canSave', () => {
  const recorded = {
    ...trainingEvent,
    my_participation: { ...trainingEvent.my_participation, is_default: false },
  };

  it('requires a change, except to record a default answer', () => {
    expect(canSave(initialDraft(recorded), recorded)).toBe(false);
    expect(canSave({ ...initialDraft(recorded), state: 'not_going' }, recorded)).toBe(true);
    expect(canSave(initialDraft(trainingEvent), trainingEvent)).toBe(true); // default, not recorded yet
  });

  it('requires an answer and a permitted event', () => {
    expect(canSave(initialDraft(contestEvent), contestEvent)).toBe(false);
    const restricted = { ...contestEvent, can_participate: false };
    expect(canSave({ ...initialDraft(restricted), state: 'registered' }, restricted)).toBe(false);
  });
});

describe('mapsUrl', () => {
  it('prefers coordinates, then the address', () => {
    expect(mapsUrl(trainingEvent, 'ios')).toContain('ll=44.84,-0.58');
    expect(mapsUrl(trainingEvent, 'android')).toMatch(/^geo:44\.84,-0\.58\?q=/);
    const noCoords = { ...trainingEvent, latitude: null, longitude: null };
    expect(mapsUrl(noCoords, 'ios')).toContain('Gymnase%20Jean%20Moulin%2C%2033000%20Bordeaux');
    expect(mapsUrl({ ...noCoords, address: null }, 'android')).toBeNull();
  });
});
