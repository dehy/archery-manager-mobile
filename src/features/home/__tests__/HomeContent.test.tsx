import { render, screen } from '@testing-library/react-native';

import type { HomeResponse } from '@/api/types';

import { HomeContent } from '../HomeContent';

const licensee = { id: 7, firstname: 'Camille', ffta_member_code: '1234567A' };

describe('HomeContent', () => {
  it('shows the blank account state', async () => {
    const home: HomeResponse = { state: 'blank_account', season: 2027, licensee: null };
    await render(<HomeContent home={home} />);
    expect(screen.getByText("Aucun licencié n'est rattaché à ce compte.")).toBeTruthy();
  });

  it('lists club applications when there is no license', async () => {
    const home: HomeResponse = {
      state: 'no_license',
      season: 2027,
      licensee,
      applications: [
        {
          id: 1,
          club: { id: 3, name: 'Les Archers de Guyenne' },
          season: 2027,
          status: 'waiting_list',
          admin_message: 'Nous vous recontactons.',
          created_at: '2026-09-01T10:00:00+02:00',
        },
      ],
    };
    await render(<HomeContent home={home} />);
    expect(screen.getByText('Pas de licence pour la saison 2026/2027.')).toBeTruthy();
    expect(screen.getByText('Les Archers de Guyenne')).toBeTruthy();
    expect(screen.getByText("Liste d'attente")).toBeTruthy();
  });

  it('shows events with their participation and results', async () => {
    const home: HomeResponse = {
      state: 'dashboard',
      season: 2027,
      licensee,
      next_events: [
        {
          id: 10,
          slug: 'entrainement-salle',
          title: 'Entraînement salle',
          type: 'training',
          starts_at: '2026-10-13T19:00:00+02:00',
          ends_at: '2026-10-13T21:00:00+02:00',
          all_day: false,
          address: 'Gymnase Jean Moulin',
          participation_state: 'registered',
          participants_count: 22,
        },
      ],
      last_results: [
        {
          id: 20,
          event: {
            id: 5,
            slug: 'departemental',
            title: 'Championnat départemental',
            starts_at: null,
            ends_at: null,
          },
          distance: 18,
          target_type: { code: 'trispot', label: 'Trispot' },
          target_size: 40,
          total: 568,
        },
      ],
    };
    await render(<HomeContent home={home} />);
    expect(screen.getByText('Entraînement salle')).toBeTruthy();
    expect(screen.getByText(/Présent · 22 participants/)).toBeTruthy();
    expect(screen.getByText('Championnat départemental')).toBeTruthy();
    expect(screen.getByText('568')).toBeTruthy();
    expect(screen.getByText('18 m · Trispot 40 cm')).toBeTruthy();
  });

  it('shows empty sections', async () => {
    const home: HomeResponse = {
      state: 'dashboard',
      season: 2027,
      licensee,
      next_events: [],
      last_results: [],
    };
    await render(<HomeContent home={home} />);
    expect(screen.getByText('Aucun événement à venir.')).toBeTruthy();
    expect(screen.getByText('Aucun résultat pour le moment.')).toBeTruthy();
  });

  it('shows the club badge once the club is known', async () => {
    const home: HomeResponse = {
      state: 'dashboard',
      season: 2027,
      licensee,
      next_events: [],
      last_results: [],
    };
    const club = {
      id: 3,
      name: 'Les Archers de Guyenne',
      city: 'Bordeaux',
      contact_email: null,
      ffta_code: null,
      primary_color: '#0a7d33',
      logo_url: null,
    };
    await render(<HomeContent home={home} club={club} />);
    expect(screen.getByLabelText('Les Archers de Guyenne')).toBeTruthy();
    expect(screen.getByText('LG')).toBeTruthy();
  });
});
