import { Stack } from 'expo-router';
import { Alert, Linking, Share, View } from 'react-native';

import {
  useCalendarSubscription,
  useGenerateSubscription,
  useRevokeSubscription,
} from '@/features/calendar/queries';
import { maskUrl, webcalUrl } from '@/features/calendar/webcal';
import { loadErrorMessage } from '@/features/errors';
import { t } from '@/i18n';
import { Button, Message, Row, ScrollScreen, Section, SkeletonRows, Text, spacing } from '@/ui';

export default function CalendarSubscriptionScreen() {
  const { data: url, error, isPending, refetch } = useCalendarSubscription();
  const generate = useGenerateSubscription();
  const revoke = useRevokeSubscription();
  const busy = generate.isPending || revoke.isPending;

  const confirm = (title: string, body: string, action: string, onConfirm: () => void) =>
    Alert.alert(title, body, [
      { text: t('calendar.cancel'), style: 'cancel' },
      { text: action, style: 'destructive', onPress: onConfirm },
    ]);

  const subscribe = async (feed: string) => {
    try {
      await Linking.openURL(webcalUrl(feed));
    } catch {
      Alert.alert(t('calendar.noCalendarApp'));
    }
  };

  const onError = () => Alert.alert(t('calendar.error'));

  return (
    <ScrollScreen>
      <Stack.Screen
        options={{ title: t('calendar.title'), headerBackButtonDisplayMode: 'minimal' }}
      />
      <Text variant="muted" style={{ marginHorizontal: 16, marginBottom: spacing.md }}>
        {t('calendar.intro')}
      </Text>
      {isPending && !error ? <SkeletonRows count={2} /> : null}
      {error ? (
        <Message
          title={loadErrorMessage(error)}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      ) : null}

      {!isPending && !error && !url ? (
        <View style={{ paddingHorizontal: 16, gap: spacing.md }}>
          <Text>{t('calendar.none')}</Text>
          <Button
            title={t('calendar.generate')}
            loading={generate.isPending}
            onPress={() => generate.mutate(undefined, { onError })}
          />
        </View>
      ) : null}

      {url ? (
        <>
          <Section title={t('calendar.current')}>
            {/* The URL is the credential: never shown in full on screen. */}
            <Row title={maskUrl(url)} last />
          </Section>
          <View style={{ paddingHorizontal: 16, gap: spacing.sm, marginBottom: spacing.lg }}>
            <Button
              title={t('calendar.subscribe')}
              onPress={() => subscribe(url)}
              disabled={busy}
            />
          </View>
          <Section>
            <Row
              testID="calendar-share"
              title={t('calendar.share')}
              onPress={() => Share.share({ message: url })}
            />
            <Row
              testID="calendar-regenerate"
              title={t('calendar.regenerate')}
              onPress={() =>
                confirm(
                  t('calendar.regenerateTitle'),
                  t('calendar.regenerateBody'),
                  t('calendar.regenerate'),
                  () => generate.mutate(undefined, { onError }),
                )
              }
            />
            <Row
              testID="calendar-revoke"
              title={t('calendar.revoke')}
              onPress={() =>
                confirm(
                  t('calendar.revokeTitle'),
                  t('calendar.revokeBody'),
                  t('calendar.revoke'),
                  () => revoke.mutate(undefined, { onError }),
                )
              }
              last
            />
          </Section>
        </>
      ) : null}
    </ScrollScreen>
  );
}
