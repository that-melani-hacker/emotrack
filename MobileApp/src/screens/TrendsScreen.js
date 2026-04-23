import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getEntries } from '../utils/storage';
import { useUser } from '../context/UserContext';
import { EMOTIONS, EKMAN_ORDER, COLORS } from '../constants/emotions';

const { width } = Dimensions.get('window');
const BAR_MAX_WIDTH = width - 32 - 16 - 80 - 48; // screen - padding - label - count

// ── helpers ──────────────────────────────────────────────────────────────────

function dayLabel(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short' });
}

function getWeekDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toDateString());
  }
  return days;
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ emoji, value, label, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmotionFrequencyChart({ counts, total }) {
  const max = Math.max(...Object.values(counts), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Emotion Frequency</Text>
      <Text style={styles.cardSubtitle}>All time · {total} total entries</Text>

      {EKMAN_ORDER.map(key => {
        const count = counts[key] || 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        const info  = EMOTIONS[key];
        const barW  = max > 0 ? (count / max) * BAR_MAX_WIDTH : 0;

        return (
          <View key={key} style={styles.freqRow}>
            <Text style={styles.freqEmoji}>{info.emoji}</Text>
            <Text style={styles.freqLabel}>{info.label}</Text>
            <View style={styles.freqBarTrack}>
              <View style={[styles.freqBarFill, {
                width: barW,
                backgroundColor: count > 0 ? info.color : COLORS.border,
              }]} />
            </View>
            <Text style={styles.freqCount}>{count > 0 ? `${pct}%` : '—'}</Text>
          </View>
        );
      })}
    </View>
  );
}

function WeeklyMoodStrip({ entries }) {
  const weekDays  = getWeekDays();
  const dayMap    = {};
  entries.forEach(e => {
    const key = new Date(e.createdAt).toDateString();
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(e);
  });

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>This Week</Text>
      <Text style={styles.cardSubtitle}>Last 7 days — most recent entry per day</Text>

      <View style={styles.weekRow}>
        {weekDays.map(dayStr => {
          const dayEntries = dayMap[dayStr] || [];
          const top        = dayEntries[dayEntries.length - 1]; // latest
          const info       = top ? EMOTIONS[top.emotion] : null;
          const isToday    = dayStr === new Date().toDateString();

          return (
            <View key={dayStr} style={styles.dayCol}>
              <View style={[
                styles.dayCircle,
                info  && { backgroundColor: info.lightColor, borderColor: info.color },
                !info && { backgroundColor: COLORS.background, borderColor: COLORS.border },
                isToday && styles.dayCircleToday,
              ]}>
                <Text style={styles.dayEmoji}>{info ? info.emoji : '·'}</Text>
              </View>
              <Text style={[styles.dayName, isToday && { color: COLORS.primary, fontWeight: '700' }]}>
                {new Date(dayStr).toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              {isToday && <View style={styles.todayDot} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MoodDistributionBar({ counts, total }) {
  if (total === 0) return null;
  const segments = EKMAN_ORDER
    .filter(k => counts[k] > 0)
    .map(k => ({ key: k, pct: (counts[k] / total) * 100, color: EMOTIONS[k].color }));

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Overall Mood Mix</Text>
      <Text style={styles.cardSubtitle}>Proportional breakdown of all entries</Text>

      <View style={styles.mixBar}>
        {segments.map(s => (
          <View key={s.key} style={[styles.mixSegment, { flex: s.pct, backgroundColor: s.color }]} />
        ))}
      </View>

      <View style={styles.mixLegend}>
        {segments.map(s => (
          <View key={s.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>
              {EMOTIONS[s.key].emoji} {Math.round(s.pct)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Text style={{ fontSize: 48 }}>📊</Text>
      </View>
      <Text style={styles.emptyTitle}>No data yet</Text>
      <Text style={styles.emptySubtitle}>
        Save a few journal entries and your emotion trends will appear here.
      </Text>
    </View>
  );
}

// ── main screen ───────────────────────────────────────────────────────────────

export default function TrendsScreen() {
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

  // ── derive stats ───────────────────────────────────────────────────────────
  const total  = entries.length;
  const counts = {};
  EKMAN_ORDER.forEach(k => { counts[k] = 0; });
  entries.forEach(e => { if (counts[e.emotion] !== undefined) counts[e.emotion]++; });

  const topEmotion = total > 0
    ? EKMAN_ORDER.reduce((a, b) => counts[a] >= counts[b] ? a : b)
    : null;

  const uniqueDays = new Set(entries.map(e => new Date(e.createdAt).toDateString())).size;

  const avgConfidence = total > 0
    ? Math.round(entries.reduce((s, e) => s + e.confidence, 0) / total * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={total === 0 ? styles.emptyScroll : styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {total === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Summary stat cards */}
            <View style={styles.statsRow}>
              <StatCard
                emoji="📝"
                value={String(total)}
                label="Total Entries"
                color={COLORS.primary}
              />
              <StatCard
                emoji={topEmotion ? EMOTIONS[topEmotion].emoji : '—'}
                value={topEmotion ? EMOTIONS[topEmotion].label : '—'}
                label="Top Emotion"
                color={topEmotion ? EMOTIONS[topEmotion].color : COLORS.textLight}
              />
              <StatCard
                emoji="📅"
                value={String(uniqueDays)}
                label="Days Tracked"
                color="#10B981"
              />
            </View>

            {/* Average confidence */}
            <View style={[styles.card, styles.confCard]}>
              <View>
                <Text style={styles.confLabel}>Average Confidence</Text>
                <Text style={styles.confSub}>How certain the model is about your emotions</Text>
              </View>
              <View style={styles.confCircle}>
                <Text style={styles.confValue}>{avgConfidence}%</Text>
              </View>
            </View>

            {/* Weekly strip */}
            <WeeklyMoodStrip entries={entries} />

            {/* Frequency chart */}
            <EmotionFrequencyChart counts={counts} total={total} />

            {/* Distribution bar */}
            <MoodDistributionBar counts={counts} total={total} />

            <View style={{ height: 32 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.background },
  scroll:      { padding: 16, gap: 12 },
  emptyScroll: { flex: 1, justifyContent: 'center', padding: 32 },

  // Stat cards
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },

  // Shared card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle:    { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 },

  // Confidence card
  confCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confLabel:  { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  confSub:    { fontSize: 12, color: COLORS.textSecondary, maxWidth: 200 },
  confCircle: {
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confValue:  { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  // Weekly strip
  weekRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol:      { alignItems: 'center', gap: 4 },
  dayCircle: {
    width: 40, height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleToday: { borderWidth: 2.5, borderColor: COLORS.primary },
  dayEmoji:  { fontSize: 18 },
  dayName:   { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  todayDot:  {
    width: 5, height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  // Frequency chart
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  freqEmoji:    { fontSize: 15, width: 22 },
  freqLabel:    { fontSize: 12, color: COLORS.textSecondary, width: 62 },
  freqBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  freqBarFill:  { height: '100%', borderRadius: 5 },
  freqCount:    { fontSize: 12, color: COLORS.textSecondary, width: 34, textAlign: 'right', fontWeight: '700' },

  // Distribution bar
  mixBar: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 14,
  },
  mixSegment: { height: '100%' },
  mixLegend:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: COLORS.textSecondary },

  // Empty
  empty:         { alignItems: 'center' },
  emptyIcon: {
    width: 90, height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle:    { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
});
