import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getEntries, deleteEntry } from '../utils/storage';
import { useUser } from '../context/UserContext';
import { EMOTIONS, COLORS } from '../constants/emotions';

// Returns e.g.  "2:35 PM  ·  Mon, Apr 14 2026"
function formatExactTime(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const date = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
  });
  return `${time}  ·  ${date}`;
}

function EntryCard({ entry, onDelete }) {
  const info = EMOTIONS[entry.emotion] || EMOTIONS.neutral;
  const pct  = Math.round(entry.confidence * 100);

  const confirmDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Remove this journal entry permanently?',
      [
        { text: 'Cancel',  style: 'cancel' },
        { text: 'Delete',  style: 'destructive', onPress: () => onDelete(entry.id) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Left colour strip */}
      <View style={[styles.strip, { backgroundColor: info.color }]} />

      <View style={styles.cardContent}>
        {/* Time — exact, shown prominently */}
        <Text style={styles.timestamp}>{formatExactTime(entry.createdAt)}</Text>

        {/* Emotion badge + delete */}
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: info.lightColor }]}>
            <Text style={styles.badgeEmoji}>{info.emoji}</Text>
            <Text style={[styles.badgeLabel, { color: info.color }]}>{info.label}</Text>
            <View style={[styles.badgePct, { backgroundColor: info.color }]}>
              <Text style={styles.badgePctText}>{pct}%</Text>
            </View>
          </View>

          <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Journal text */}
        <Text style={styles.entryText} numberOfLines={3}>{entry.text}</Text>

        {/* Mini confidence bar */}
        <View style={styles.confTrack}>
          <View style={[styles.confFill, { width: `${pct}%`, backgroundColor: info.color }]} />
        </View>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 48 }}>📖</Text>
      </View>
      <Text style={styles.emptyTitle}>No entries yet</Text>
      <Text style={styles.emptySubtitle}>
        Write your first reflection on the Journal tab, analyze it, and save it here.
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { user }  = useUser();
  const [entries,    setEntries]    = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getEntries(user.id);
    setEntries(data);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = async (id) => {
    await deleteEntry(user.id, id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {entries.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
          </Text>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <EntryCard entry={item} onDelete={handleDelete} />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={
          entries.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  summaryBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  list:           { padding: 16, gap: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', padding: 32 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  strip:       { width: 4 },
  cardContent: { flex: 1, padding: 14, gap: 8 },

  // Exact timestamp — the most prominent metadata
  timestamp: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  badgeEmoji: { fontSize: 14 },
  badgeLabel: { fontSize: 13, fontWeight: '700' },
  badgePct: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePctText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  deleteIcon:   { color: COLORS.textLight, fontSize: 14 },

  entryText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 21,
  },

  confTrack: {
    height: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confFill: { height: '100%', borderRadius: 2 },

  empty:         { alignItems: 'center' },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle:    { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
