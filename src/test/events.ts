import type { EventDetail } from '@/api/types';

export const trainingEvent: EventDetail = {
  id: 11,
  slug: 'entrainement',
  title: 'Entraînement salle',
  type: 'training',
  starts_at: '2026-10-13T19:00:00+02:00',
  ends_at: '2026-10-13T21:00:00+02:00',
  all_day: false,
  address: 'Gymnase Jean Moulin\n33000 Bordeaux',
  participation_state: 'registered',
  participants_count: 22,
  club: { id: 17, name: 'Les Archers de Guyenne' },
  can_participate: true,
  discipline: null,
  contest_type: null,
  latitude: 44.84,
  longitude: -0.58,
  assigned_groups: [{ id: 1, name: 'Compétition' }],
  attachments: [],
  my_participation: {
    participation_state: 'registered',
    is_default: true,
    activity: { code: 'CL', label: 'Classique' },
    target_type: null,
    departure: null,
  },
  participation_options: {
    states: ['not_going', 'registered'],
    activities: [{ code: 'CL', label: 'Classique' }],
    target_types: null,
    departures: null,
  },
};

export const contestEvent: EventDetail = {
  ...trainingEvent,
  id: 12,
  title: 'Concours salle Arsac',
  type: 'contest_official',
  participation_state: null,
  my_participation: {
    participation_state: null,
    is_default: true,
    activity: null,
    target_type: null,
    departure: null,
  },
  participation_options: {
    states: ['not_going', 'interested', 'registered'],
    activities: [
      { code: 'CL', label: 'Classique' },
      { code: 'CO', label: 'Poulies' },
    ],
    target_types: [
      { code: 'trispot', label: 'Trispot' },
      { code: 'mono', label: 'Blason' },
    ],
    departures: [1, 2],
  },
};
