import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { EMOTIONS, COLORS, EKMAN_ORDER } from '../constants/emotions';

export default function EmotionResult({ emotion, confidence, allScores }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [emotion]);

  const info       = EMOTIONS[emotion] || EMOTIONS.neutral;
  const percentage = Math.round(confidence * 100);

  return (
    <Animated.View style={[
      styles.container,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>

      {/* Primary result card */}
      <View style={[styles.resultCard, { borderColor: info.color }]}>
        <View style={[styles.emojiCircle, { backgroundColor: info.lightColor }]}>
          <Text style={styles.emoji}>{info.emoji}</Text>
        </View>

        <View style={styles.resultInfo}>
          <Text style={styles.emotionLabel}>{info.label}</Text>
          <Text style={styles.description}>{info.description}</Text>
        </View>

        <View style={[styles.confidenceBadge, { backgroundColor: info.color }]}>
          <Text style={styles.confidenceText}>{percentage}%</Text>
        </View>
      </View>

      {/* All 7 bars */}
      <View style={styles.barsCard}>
        <Text style={styles.barsTitle}>Emotion Breakdown</Text>
        {EKMAN_ORDER.map(key => {
          const score  = allScores?.[key] ?? 0;
          const pct    = Math.round(score * 100);
          const info_  = EMOTIONS[key];
          const isTop  = key === emotion;
          return (
            <View key={key} style={styles.barRow}>
              <Text style={styles.barEmoji}>{info_.emoji}</Text>
              <Text style={[styles.barLabel, isTop && { color: info_.color, fontWeight: '700' }]}>
                {info_.label}
              </Text>
              <View style={styles.barTrack}>
                <View style={[
                  styles.barFill,
                  { width: `${pct}%`, backgroundColor: isTop ? info_.color : COLORS.primaryMid }
                ]} />
              </View>
              <Text style={[styles.barPct, isTop && { color: info_.color, fontWeight: '700' }]}>
                {pct}%
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },

  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 32 },
  resultInfo:   { flex: 1 },
  emotionLabel: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  description:  { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  barsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  barsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  barEmoji: { fontSize: 15, width: 24 },
  barLabel: { fontSize: 13, color: COLORS.textSecondary, width: 68 },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill:  { height: '100%', borderRadius: 4 },
  barPct:   { fontSize: 12, color: COLORS.textSecondary, width: 36, textAlign: 'right' },
});
