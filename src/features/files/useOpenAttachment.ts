import { useState } from 'react';
import { Alert } from 'react-native';

import { ApiError } from '@/api/errors';
import { t } from '@/i18n';

import { openAttachment, type FileAttachment } from './openAttachment';

/** Opens attachments one at a time and tells the user when it fails (404 gets its own message). */
export function useOpenAttachment() {
  const [downloading, setDownloading] = useState<number | null>(null);

  const open = async (attachment: FileAttachment) => {
    if (downloading !== null) return;
    setDownloading(attachment.id);
    try {
      await openAttachment(attachment);
    } catch (error) {
      const missing = error instanceof ApiError && error.status === 404;
      Alert.alert(missing ? t('files.notFound') : t('files.error'));
    } finally {
      setDownloading(null);
    }
  };

  return { open, downloading };
}
