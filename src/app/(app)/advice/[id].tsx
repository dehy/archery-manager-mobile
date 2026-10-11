import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ApiError } from '@/api/errors';
import { adviceByline } from '@/features/advice/format';
import { useAdvice } from '@/features/advice/queries';
import { loadErrorMessage } from '@/features/errors';
import { useOpenAttachment } from '@/features/files/useOpenAttachment';
import { formatSize } from '@/features/licensee/format';
import { t } from '@/i18n';
import { Badge, Message, Row, ScrollScreen, Section, SkeletonRows, Text, spacing } from '@/ui';
import { HtmlContent } from '@/ui/html/HtmlContent';

export default function AdviceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, isPending, isRefetching, refetch } = useAdvice(Number(id));
  const { open, downloading } = useOpenAttachment();
  const status = error instanceof ApiError ? error.status : null;

  return (
    <ScrollScreen refreshing={isRefetching} onRefresh={refetch}>
      <Stack.Screen options={{ title: '', headerBackButtonDisplayMode: 'minimal' }} />
      {isPending && !error ? <SkeletonRows count={5} /> : null}
      {status === 404 ? <Message title={t('advice.notFound')} /> : null}
      {error && status !== 404 ? (
        <Message
          title={loadErrorMessage(error)}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : null}
      {data ? (
        <>
          <View style={{ paddingHorizontal: 16, gap: spacing.sm, paddingBottom: spacing.lg }}>
            <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '600' }}>
              {data.title}
            </Text>
            <Text variant="muted">{adviceByline(data)}</Text>
            {data.archived_at ? <Badge label={t('advice.archived')} /> : null}
            <View style={{ marginTop: spacing.sm }}>
              {/* advice_html is converted from the coach's Markdown and sanitized by the API. */}
              <HtmlContent html={data.advice_html} />
            </View>
          </View>
          {data.attachments.length > 0 ? (
            <Section title={t('advice.documents')}>
              {data.attachments.map((a, i) => (
                <Row
                  key={a.id}
                  testID={`advice-attachment-${a.id}`}
                  title={a.type?.label ?? a.file_name ?? ''}
                  subtitle={
                    downloading === a.id
                      ? t('files.downloading')
                      : [a.file_name, formatSize(a.size)].filter(Boolean).join(' · ')
                  }
                  onPress={() => open(a)}
                  last={i === data.attachments.length - 1}
                />
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </ScrollScreen>
  );
}
