export const COLORS = {
  primary:       '#2563EB',
  primaryDark:   '#1D4ED8',
  primaryLight:  '#EFF6FF',
  primaryMid:    '#DBEAFE',
  white:         '#FFFFFF',
  background:    '#F8FAFC',
  card:          '#FFFFFF',
  border:        '#E2E8F0',
  text:          '#1E293B',
  textSecondary: '#64748B',
  textLight:     '#94A3B8',
};

export const EMOTIONS = {
  joy: {
    label: 'Joy',
    emoji: '😊',
    color: '#F59E0B',
    lightColor: '#FFFBEB',
    description: 'You seem to be in a positive and uplifted mood.',
  },
  sadness: {
    label: 'Sadness',
    emoji: '😢',
    color: '#2563EB',
    lightColor: '#EFF6FF',
    description: 'It sounds like you might be feeling down right now.',
  },
  anger: {
    label: 'Anger',
    emoji: '😠',
    color: '#EF4444',
    lightColor: '#FEF2F2',
    description: 'You may be feeling frustrated or upset.',
  },
  fear: {
    label: 'Fear',
    emoji: '😨',
    color: '#8B5CF6',
    lightColor: '#F5F3FF',
    description: 'You seem to be experiencing some anxiety or worry.',
  },
  disgust: {
    label: 'Disgust',
    emoji: '🤢',
    color: '#10B981',
    lightColor: '#ECFDF5',
    description: 'Something seems to be bothering or repelling you.',
  },
  surprise: {
    label: 'Surprise',
    emoji: '😲',
    color: '#F97316',
    lightColor: '#FFF7ED',
    description: 'Something unexpected seems to have caught your attention.',
  },
  neutral: {
    label: 'Neutral',
    emoji: '😐',
    color: '#64748B',
    lightColor: '#F8FAFC',
    description: 'Your reflection has a calm, balanced tone.',
  },
};

export const EKMAN_ORDER = [
  'joy', 'neutral', 'sadness', 'surprise', 'anger', 'fear', 'disgust',
];

export const ONBOARDING_SLIDES = [
  {
    emoji:       '✍️',
    title:       'Express Yourself',
    description: 'Write a short daily reflection — a sentence or two is enough. No judgement, just your thoughts.',
    bg:          ['#2563EB', '#1D4ED8'],
  },
  {
    emoji:       '🧠',
    title:       'AI Understands You',
    description: 'Our model detects 7 core emotions from your words instantly — joy, sadness, anger, fear, disgust, surprise, or neutral.',
    bg:          ['#1D4ED8', '#1E40AF'],
  },
  {
    emoji:       '📖',
    title:       'Track Your Journey',
    description: 'Every entry is saved with an exact timestamp so you can look back and understand your emotional patterns.',
    bg:          ['#1E40AF', '#1E3A8A'],
  },
];
