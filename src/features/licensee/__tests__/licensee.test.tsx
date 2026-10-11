import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { ApiError } from '@/api/errors';
import type { LicenseeProfile } from '@/api/types';

import { formatDocumentDate, formatSize } from '../format';
import { LicenseeContent } from '../LicenseeContent';
import { openAttachment, safeFileName } from '@/features/files/openAttachment';

jest.mock('@/features/files/openAttachment', () => ({
  ...jest.requireActual('@/features/files/openAttachment'),
  openAttachment: jest.fn(),
}));

const licensee: LicenseeProfile = {
  id: 7,
  display_name: 'Léa M.',
  full_name: 'Léa Martin',
  firstname: 'Léa',
  lastname: 'Martin',
  groups: [{ id: 1, name: 'Compétition' }],
  activities: [{ code: 'CL', label: 'Classique' }],
  picture_url: null,
  gender: { code: 'F', label: 'Femme' },
  ffta_member_code: '1234567A',
  license: {
    season: 2027,
    club: { id: 3, name: 'Les Archers de Guyenne' },
    type: { code: 'A', label: 'Adulte compétition' },
    category: null,
    age_category: { code: 'S1', label: 'Senior 1' },
    activities: [{ code: 'CL', label: 'Classique' }],
  },
  attachments: [
    {
      id: 42,
      type: { code: 'MEDICAL', label: 'Certificat médical' },
      season: 2027,
      document_date: '2026-09-12',
      file_name: 'certificat.pdf',
      mime_type: 'application/pdf',
      size: 188_416,
      url: '/api/v1/licensees/7/attachments/42',
    },
  ],
};

describe('formatters', () => {
  it('formats document dates and sizes in French', () => {
    expect(formatDocumentDate('2026-09-12')).toBe('12 sept. 2026');
    expect(formatDocumentDate(null)).toBeNull();
    expect(formatSize(512)).toBe('512 o');
    expect(formatSize(188_416)).toBe('184 Ko');
    expect(formatSize(2_621_440)).toBe('2,5 Mo');
  });

  it('sanitises file names', () => {
    expect(safeFileName('../etc/passwd', 'x')).toBe('_etc_passwd');
    expect(safeFileName('certificat médical.pdf', 'x')).toBe('certificat_médical.pdf');
    expect(safeFileName(null, 'document')).toBe('document');
  });
});

describe('LicenseeContent', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the license, identity and documents', async () => {
    await render(<LicenseeContent licensee={licensee} />);
    expect(screen.getByText('Léa Martin')).toBeTruthy();
    expect(screen.getByText('Les Archers de Guyenne')).toBeTruthy();
    expect(screen.getByText('2026/2027')).toBeTruthy();
    expect(screen.getByText('Femme')).toBeTruthy();
    expect(screen.getByText('12 sept. 2026 · 184 Ko')).toBeTruthy();
  });

  it('opens an attachment when tapped', async () => {
    (openAttachment as jest.Mock).mockResolvedValue(undefined);
    await render(<LicenseeContent licensee={licensee} />);
    await fireEvent.press(screen.getByText('Certificat médical'));
    await waitFor(() => expect(openAttachment).toHaveBeenCalledWith(licensee.attachments[0]));
  });

  it('tells the user when the document is gone', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (openAttachment as jest.Mock).mockRejectedValue(new ApiError(404, 'not_found', 'x'));
    await render(<LicenseeContent licensee={licensee} />);
    await fireEvent.press(screen.getByText('Certificat médical'));
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Document introuvable.'));
  });

  it('copes with a profile without license or documents', async () => {
    await render(<LicenseeContent licensee={{ ...licensee, license: null, attachments: [] }} />);
    expect(screen.getByText('Pas de licence pour cette saison.')).toBeTruthy();
    expect(screen.getByText('Aucun document.')).toBeTruthy();
  });
});
