import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmotionResult from '../components/EmotionResult';
import { analyzeEmotion } from '../utils/api';
import { saveEntry } from '../utils/storage';
import { useUser } from '../context/UserContext';
import { COLORS } from '../constants/emotions';
import { getRandomQuote } from '../constants/quotes';

const MAX_CHARS = 500;

function getGreeting(name) {
  const h    = new Date().getHours();
  const time = h < 12 ? 'morning 🌤' : h < 17 ? 'afternoon ☀️' : 'evening 🌙';
  const first = name?.split(' ')[0] || '';
  return `Good ${time}, ${first}`;
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function QuoteCard({ emotion }) {
  const quote = getRandomQuote(emotion);
  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteTop}>💭  Today's Reflection</Text>
      <Text style={styles.quoteText}>"{quote.text}"</Text>
      <Text style={styles.quoteAuthor}>— {quote.author}</Text>
    </View>
  );
}

export default function JournalScreen() {
  const { user }  = useUser();
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [saved,   setSaved]   = useState(false);
  const scrollRef = useRef(null);

  const canAnalyze = text.trim().length >= 5 && !loading;

  const handleAnalyze = async () => {
    setLoading(true); setResult(null); setError(null); setSaved(false);
    try {
      const data = await analyzeEmotion(text.trim());
      setResult(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || saved) return;
    await saveEntry(user.id, {
      text:       text.trim(),
      emotion:    result.emotion,
      confidence: result.confidence,
      all_scores: result.all_scores,
    });
    setSaved(true);
  };

  const handleReset = () => { setText(''); setResult(null); setError(null); setSaved(false); };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.header}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.greeting}>{getGreeting(user?.name)}</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Text style={styles.prompt}>How are you feeling today?</Text>
          </LinearGradient>

          <View style={styles.body}>
            {/* Input card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Your Reflection</Text>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Write what's on your mind… a sentence or two is enough."
                placeholderTextColor={COLORS.textLight}
                value={text}
                onChangeText={t => { if (t.length <= MAX_CHARS) setText(t); }}
                textAlignVertical="top"
              />
              <View style={styles.inputFooter}>
                <Text style={styles.charCount}>{text.length}/{MAX_CHARS}</Text>
                {text.length > 0 && (
                  <TouchableOpacity onPress={() => setText('')}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Analyze button */}
            <TouchableOpacity onPress={handleAnalyze} disabled={!canAnalyze} activeOpacity={0.85}>
              {canAnalyze ? (
                <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.analyzeBtn}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.analyzeBtnText}>✨  Analyze My Mood</Text>}
                </LinearGradient>
              ) : (
                <View style={[styles.analyzeBtn, styles.analyzeBtnDisabled]}>
                  <Text style={styles.analyzeBtnDisabledText}>
                    {text.length === 0 ? 'Write something to analyze…' : 'Keep writing (min 5 chars)…'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {loading && <Text style={styles.loadingHint}>Analyzing your reflection…</Text>}

            {error && (
              <View style={styles.errorCard}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {result && (
              <>
                <EmotionResult
                  emotion={result.emotion}
                  confidence={result.confidence}
                  allScores={result.all_scores}
                />

                {/* Motivational quote */}
                <QuoteCard emotion={result.emotion} />

                {/* Action buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.saveBtn, saved && styles.savedBtn]}
                    onPress={handleSave} disabled={saved} activeOpacity={0.8}
                  >
                    <Text style={styles.saveBtnText}>
                      {saved ? '✓  Saved!' : '💾  Save to Journal'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
                    <Text style={styles.resetBtnText}>New Entry</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1 },

  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  dateText: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 12 },
  prompt:   { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },

  body: {
    padding: 16, gap: 12, marginTop: -16,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  input: { fontSize: 16, color: COLORS.text, lineHeight: 24, minHeight: 120, maxHeight: 200 },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  charCount: { color: COLORS.textLight, fontSize: 12 },
  clearText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },

  analyzeBtn:         { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  analyzeBtnDisabled: { backgroundColor: COLORS.border },
  analyzeBtnText:         { color: '#fff', fontSize: 16, fontWeight: '700' },
  analyzeBtnDisabledText: { color: COLORS.textLight, fontSize: 15 },
  loadingHint: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 13 },

  errorCard: {
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderLeftWidth: 3, borderLeftColor: '#EF4444',
  },
  errorIcon: { fontSize: 16 },
  errorText: { color: '#B91C1C', fontSize: 14, flex: 1, lineHeight: 20 },

  quoteCard: {
    backgroundColor: COLORS.primaryLight, borderRadius: 16,
    padding: 18, borderLeftWidth: 4, borderLeftColor: COLORS.primary,
  },
  quoteTop:    { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  quoteText:   { fontSize: 15, color: COLORS.text, lineHeight: 23, fontStyle: 'italic', marginBottom: 8 },
  quoteAuthor: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'right' },

  actionRow: { flexDirection: 'row', gap: 10 },
  saveBtn: {
    flex: 2, backgroundColor: COLORS.primary,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  savedBtn:     { backgroundColor: '#10B981' },
  saveBtnText:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  resetBtn: {
    flex: 1, backgroundColor: COLORS.white,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  resetBtnText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
});
