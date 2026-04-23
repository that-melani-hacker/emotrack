import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { updateUser, logout, deleteAccount } from '../utils/auth';
import { useUser } from '../context/UserContext';
import { COLORS } from '../constants/emotions';

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .map(w => w[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('');
  return (
    <LinearGradient colors={['#2563EB', '#1E3A8A']} style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </LinearGradient>
  );
}

export default function ProfileScreen() {
  const { user, onUpdate, onLogout } = useUser();

  const [name,     setName]     = useState(user?.name    || '');
  const [email,    setEmail]    = useState(user?.email   || '');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState('');
  const [error,    setError]    = useState('');

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email cannot be empty.'); return;
    }
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (password && password !== confirm) {
      setError('Passwords do not match.'); return;
    }
    setSaving(true); setError(''); setMsg('');
    try {
      const updates = { name: name.trim(), email: email.trim() };
      if (password) updates.password = password;
      const updated = await updateUser(user.id, updates);
      onUpdate(updated);
      setMsg('Profile updated successfully!');
      setPassword(''); setConfirm('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await logout(); onLogout();
      }},
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and ALL your journal entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: async () => {
          await deleteAccount(user.id); onLogout();
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.header}>
          <Avatar name={user?.name || 'U'} />
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.memberSince}>
            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Edit details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit Profile</Text>

            {msg ? <View style={styles.successBox}><Text style={styles.successText}>✓  {msg}</Text></View> : null}
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>⚠️  {error}</Text></View> : null}

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholderTextColor={COLORS.textLight} autoCapitalize="words" />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholderTextColor={COLORS.textLight} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>New Password  <Text style={styles.optional}>(leave blank to keep current)</Text></Text>
            <View style={styles.pwdRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="New password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <Text>{showPwd ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {password.length > 0 && (
              <>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat new password"
                  placeholderTextColor={COLORS.textLight}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                />
              </>
            )}

            <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85} style={{ marginTop: 20 }}>
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                style={styles.saveBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Save Changes</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Account actions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account</Text>

            <TouchableOpacity style={styles.actionRow} onPress={handleLogout} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🚪</Text>
              <Text style={styles.actionText}>Sign Out</Text>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionRow} onPress={handleDelete} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🗑️</Text>
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete Account</Text>
              <Text style={[styles.actionChevron, { color: '#EF4444' }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 32, paddingBottom: 32,
    alignItems: 'center', gap: 6,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText:   { fontSize: 28, fontWeight: '800', color: '#fff' },
  userName:     { fontSize: 20, fontWeight: '800', color: '#fff' },
  userEmail:    { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  memberSince:  { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 },

  body: { padding: 16, gap: 12, marginTop: -16, backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 16 },

  successBox: { backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#10B981' },
  successText: { color: '#065F46', fontSize: 13 },
  errorBox:   { backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#EF4444' },
  errorText:  { color: '#B91C1C', fontSize: 13 },

  label: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
  optional: { fontWeight: '400', textTransform: 'none', fontSize: 11 },
  input: {
    backgroundColor: COLORS.background, borderRadius: 12, padding: 13,
    fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
  },
  pwdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  actionIcon: { fontSize: 20 },
  actionText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  actionChevron: { fontSize: 20, color: COLORS.textLight },
  divider: { height: 1, backgroundColor: COLORS.border },
});
