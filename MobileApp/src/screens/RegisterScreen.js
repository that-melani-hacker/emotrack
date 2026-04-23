import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../utils/auth';
import { COLORS } from '../constants/emotions';

export default function RegisterScreen({ onRegister, onGoLogin }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await register(name, email, password);
      onRegister(user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <LinearGradient colors={['#2563EB', '#1E3A8A']} style={styles.header}>
            <Text style={styles.logo}>🧠</Text>
            <Text style={styles.appName}>Emotrack</Text>
            <Text style={styles.tagline}>Start your wellness journey</Text>
          </LinearGradient>

          <View style={styles.form}>
            <Text style={styles.title}>Create Account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️  {error}</Text>
              </View>
            ) : null}

            {[
              { label: 'Full Name',        value: name,     set: setName,     placeholder: 'Your name',           type: 'default',       secure: false },
              { label: 'Email',            value: email,    set: setEmail,    placeholder: 'you@example.com',     type: 'email-address', secure: false },
              { label: 'Password',         value: password, set: setPassword, placeholder: 'At least 6 characters', type: 'default',     secure: true  },
              { label: 'Confirm Password', value: confirm,  set: setConfirm,  placeholder: 'Repeat your password', type: 'default',      secure: true  },
            ].map(({ label, value, set, placeholder, type, secure }) => (
              <View key={label}>
                <Text style={styles.label}>{label}</Text>
                {secure ? (
                  <View style={styles.pwdRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder={placeholder}
                      placeholderTextColor={COLORS.textLight}
                      value={value}
                      onChangeText={set}
                      secureTextEntry={!showPwd}
                      autoCapitalize="none"
                    />
                    {label === 'Password' && (
                      <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                        <Text style={styles.eyeIcon}>{showPwd ? '🙈' : '👁️'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textLight}
                    value={value}
                    onChangeText={set}
                    keyboardType={type}
                    autoCapitalize={type === 'email-address' ? 'none' : 'words'}
                    autoCorrect={false}
                  />
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              style={{ marginTop: 24 }}
            >
              <LinearGradient
                colors={['#2563EB', '#1D4ED8']}
                style={styles.btn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Create Account</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <TouchableOpacity onPress={onGoLogin}>
                <Text style={styles.switchLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: COLORS.background },
  flex:  { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 48, paddingBottom: 40,
    alignItems: 'center', gap: 6,
  },
  logo:    { fontSize: 56 },
  appName: { fontSize: 30, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.75)' },
  form: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginTop: -20,
  },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#EF4444',
  },
  errorText: { color: '#B91C1C', fontSize: 13 },
  label: {
    fontSize: 13, fontWeight: '700', color: COLORS.textSecondary,
    marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  input: {
    backgroundColor: COLORS.background, borderRadius: 12, padding: 14,
    fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 4,
  },
  pwdRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:  { padding: 10 },
  eyeIcon: { fontSize: 18 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  switchText: { color: COLORS.textSecondary, fontSize: 14 },
  switchLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
