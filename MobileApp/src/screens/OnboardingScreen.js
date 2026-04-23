import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_SLIDES } from '../constants/emotions';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onDone }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const finish = async () => {
    await AsyncStorage.setItem('@emotrack_onboarded', 'true');
    onDone();
  };

  const handleNext = () => {
    if (activeIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finish();
    }
  };

  const isLast = activeIndex === ONBOARDING_SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip button — always visible until last slide */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Swipeable slides — scrollEnabled:true so user can swipe */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <LinearGradient colors={item.bg} style={styles.slideTop}>
              <Text style={styles.slideEmoji}>{item.emoji}</Text>
            </LinearGradient>
            <View style={styles.slideBottom}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDesc}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index: i, animated: true });
              setActiveIndex(i);
            }}
          >
            <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Next / Get Started button */}
      <View style={styles.btnRow}>
        <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={styles.nextBtnWrap}>
          <LinearGradient
            colors={['#2563EB', '#1D4ED8']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextBtnText}>{isLast ? '🚀  Get Started' : 'Next  →'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  skipBtn: {
    position: 'absolute', top: 56, right: 24,
    zIndex: 10, paddingVertical: 6, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  skipText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  slide:       { width, flex: 1 },
  slideTop:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  slideEmoji:  { fontSize: 88 },
  slideBottom: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32, paddingTop: 36, paddingBottom: 16,
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 26, fontWeight: '800', color: '#1E293B',
    textAlign: 'center', marginBottom: 12,
  },
  slideDesc: {
    fontSize: 15, color: '#64748B',
    textAlign: 'center', lineHeight: 24,
  },

  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    paddingVertical: 16, gap: 8, backgroundColor: '#FFFFFF',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DBEAFE' },
  dotActive: { backgroundColor: '#2563EB', width: 24 },

  btnRow: { paddingHorizontal: 24, paddingBottom: 48, backgroundColor: '#FFFFFF' },
  nextBtnWrap: { width: '100%' },
  nextBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
