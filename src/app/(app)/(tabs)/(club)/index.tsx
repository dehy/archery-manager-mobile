import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import type { MemberSummary } from '@/api/types';
import { ClubHeader } from '@/features/club/ClubHeader';
import { GroupFilters } from '@/features/club/GroupFilters';
import { initials } from '@/features/club/initials';
import { useClub, useMembers, type GroupFilter } from '@/features/club/queries';
import { isForbidden, loadErrorMessage } from '@/features/errors';
import { useDebouncedValue } from '@/features/useDebouncedValue';
import { t } from '@/i18n';
import { Avatar, Message, Row, SkeletonRows, Text, isIOS, useTheme } from '@/ui';

export default function ClubScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [group, setGroup] = useState<GroupFilter>('all');
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query, 300);

  const club = useClub();
  const members = useMembers(group, search);

  const items = useMemo(() => members.data?.pages.flatMap((p) => p.data) ?? [], [members.data]);
  const first = members.data?.pages[0];
  const error = club.error ?? members.error;

  const searchBar = (
    <Stack.SearchBar
      placeholder={t('club.search')}
      onChangeText={(e) => setQuery(e.nativeEvent.text)}
      onCancelButtonPress={() => setQuery('')}
    />
  );

  if (error && !first) {
    return (
      <>
        {searchBar}
        <Message
          title={isForbidden(error) ? t('common.forbiddenSeason') : loadErrorMessage(error)}
          actionLabel={isForbidden(error) ? undefined : t('common.retry')}
          onAction={() => {
            club.refetch();
            members.refetch();
          }}
        />
      </>
    );
  }

  const header = (
    <View>
      {club.data ? <ClubHeader overview={club.data} /> : null}
      {first ? (
        <GroupFilters
          groups={first.filters.groups}
          withoutGroupCount={first.filters.without_group_count}
          value={group}
          onChange={setGroup}
        />
      ) : null}
      {first ? (
        <Text variant="muted" style={{ marginHorizontal: 16, marginBottom: 8 }}>
          {first.meta.total === first.meta.total_in_club
            ? t('club.members', { count: first.meta.total })
            : t('club.membersOfTotal', {
                count: first.meta.total,
                total: first.meta.total_in_club,
              })}
        </Text>
      ) : null}
    </View>
  );

  const renderItem = ({ item, index }: { item: MemberSummary; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === items.length - 1 && !members.hasNextPage;
    return (
      <View
        style={
          isIOS
            ? {
                backgroundColor: theme.surface,
                marginHorizontal: 16,
                borderTopLeftRadius: isFirst ? 12 : 0,
                borderTopRightRadius: isFirst ? 12 : 0,
                borderBottomLeftRadius: isLast ? 12 : 0,
                borderBottomRightRadius: isLast ? 12 : 0,
                overflow: 'hidden',
              }
            : undefined
        }
      >
        <Row
          testID={`member-${item.id}`}
          title={item.display_name}
          subtitle={item.groups.map((g) => g.name).join(', ') || null}
          caption={item.activities.map((a) => a.label).join(' · ') || null}
          left={<Avatar pictureUrl={item.picture_url} initials={initials(item.display_name)} />}
          onPress={() => router.push({ pathname: '/licensee/[id]', params: { id: item.id } })}
          last={isLast}
        />
      </View>
    );
  };

  return (
    <>
      {searchBar}
      <FlatList
        style={{ flex: 1, backgroundColor: theme.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingVertical: 16 }}
        data={items}
        keyExtractor={(m) => String(m.id)}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          members.isPending ? (
            <SkeletonRows count={6} />
          ) : (
            <Message
              title={
                search.trim() ? t('club.noMatch', { query: search.trim() }) : t('club.noMembers')
              }
            />
          )
        }
        ListFooterComponent={
          members.isFetchingNextPage ? <ActivityIndicator style={{ margin: 16 }} /> : null
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (members.hasNextPage && !members.isFetchingNextPage) members.fetchNextPage();
        }}
        refreshing={club.isRefetching || (members.isRefetching && !members.isFetchingNextPage)}
        onRefresh={() => {
          club.refetch();
          members.refetch();
        }}
        keyboardDismissMode="on-drag"
      />
    </>
  );
}
