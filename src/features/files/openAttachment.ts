import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { api } from '@/auth/session';

/** Keeps letters, digits, dots, dashes and underscores: file names come from users. */
export function safeFileName(name: string | null, fallback: string): string {
  const cleaned = (name ?? '').replace(/[^\p{L}\p{N}._-]+/gu, '_').replace(/^\.+/, '');
  return cleaned || fallback;
}

/**
 * Downloads an attachment with the bearer token into the cache, then hands it to the system
 * (share sheet / viewer). Throws ApiError (404, 403...) like any other API call.
 */
export type FileAttachment = {
  id: number;
  url: string;
  file_name: string | null;
  mime_type: string | null;
};

export async function openAttachment(attachment: FileAttachment): Promise<void> {
  const bytes = await api.requestFile(attachment.url);
  const file = new File(
    Paths.cache,
    `attachment-${attachment.id}-${safeFileName(attachment.file_name, 'document')}`,
  );
  file.create({ overwrite: true });
  file.write(new Uint8Array(bytes));
  await Sharing.shareAsync(file.uri, {
    mimeType: attachment.mime_type ?? undefined,
    dialogTitle: attachment.file_name ?? undefined,
  });
}
