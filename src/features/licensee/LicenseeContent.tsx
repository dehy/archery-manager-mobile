import { useState } from 'react';
import { Alert, View } from 'react-native';

import { ApiError } from '@/api/errors';
import type { LicenseeProfile } from '@/api/types';
import { initials } from '@/features/club/initials';
import { formatSeason } from '@/features/home/format';
import { t } from '@/i18n';
import { Avatar, Row, Section, Text, spacing } from '@/ui';

import { formatDocumentDate, formatSize } from './format';
import { openAttachment } from './openAttachment';

export function LicenseeContent({ licensee }: { licensee: LicenseeProfile }) {
  const [downloading, setDownloading] = useState<number | null>(null);
  const { license } = licensee;

  const open = async (attachmentId: number) => {
    const attachment = licensee.attachments.find((a) => a.id === attachmentId);
    if (!attachment || downloading !== null) return;
    setDownloading(attachmentId);
    try {
      await openAttachment(attachment);
    } catch (error) {
      const missing = error instanceof ApiError && error.status === 404;
      Alert.alert(missing ? t('licensee.attachmentNotFound') : t('licensee.attachmentError'));
    } finally {
      setDownloading(null);
    }
  };

  const licenseRows: [string, string | null | undefined][] = license
    ? [
        [t('licensee.season'), license.season ? formatSeason(license.season) : null],
        [t('licensee.club'), license.club?.name],
        [t('licensee.type'), license.type?.label],
        [t('licensee.category'), license.category?.label],
        [t('licensee.ageCategory'), license.age_category?.label],
        [t('licensee.activities'), license.activities.map((a) => a.label).join(', ') || null],
      ]
    : [];
  const shownLicenseRows = licenseRows.filter(([, v]) => v);

  return (
    <>
      <View style={{ alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.lg }}>
        <Avatar
          pictureUrl={licensee.picture_url}
          initials={initials(licensee.full_name)}
          size={88}
        />
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '600' }}>
          {licensee.full_name}
        </Text>
        {licensee.groups.length > 0 ? (
          <Text variant="muted">{licensee.groups.map((g) => g.name).join(' · ')}</Text>
        ) : null}
      </View>

      <Section title={t('licensee.license')}>
        {shownLicenseRows.length === 0 ? (
          <Row title={t('licensee.noLicense')} last />
        ) : (
          shownLicenseRows.map(([label, value], i) => (
            <Row
              key={label}
              title={label}
              subtitle={value}
              last={i === shownLicenseRows.length - 1}
            />
          ))
        )}
      </Section>

      <Section title={t('licensee.identity')}>
        <Row title={t('licensee.gender')} subtitle={licensee.gender.label} />
        <Row title={t('licensee.fftaCode')} subtitle={licensee.ffta_member_code} last />
      </Section>

      <Section title={t('licensee.documents')}>
        {licensee.attachments.length === 0 ? (
          <Row title={t('licensee.noDocuments')} last />
        ) : (
          licensee.attachments.map((a, i) => (
            <Row
              key={a.id}
              testID={`attachment-${a.id}`}
              title={a.type?.label ?? a.file_name ?? ''}
              subtitle={
                downloading === a.id
                  ? t('licensee.downloading')
                  : [formatDocumentDate(a.document_date), formatSize(a.size)]
                      .filter(Boolean)
                      .join(' · ')
              }
              onPress={() => open(a.id)}
              last={i === licensee.attachments.length - 1}
            />
          ))
        )}
      </Section>
    </>
  );
}
