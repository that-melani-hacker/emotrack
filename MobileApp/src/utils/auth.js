import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY   = '@emotrack_users';
const SESSION_KEY = '@emotrack_session';

async function getUsers() {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function register(name, email, password) {
  const users = await getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const user = {
    id:        Date.now().toString(),
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    password,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export async function login(email, password) {
  const users = await getUsers();
  const user  = users.find(
    u => u.email === email.trim().toLowerCase() && u.password === password
  );
  if (!user) throw new Error('Incorrect email or password.');
  await AsyncStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export async function logout() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getCurrentUser() {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  const users = await getUsers();
  return users.find(u => u.id === userId) || null;
}

export async function updateUser(userId, updates) {
  const users = await getUsers();
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found.');
  // If email is being changed, check it isn't taken
  if (updates.email) {
    const taken = users.find(
      u => u.email === updates.email.toLowerCase() && u.id !== userId
    );
    if (taken) throw new Error('That email is already in use.');
    updates.email = updates.email.toLowerCase();
  }
  users[idx] = { ...users[idx], ...updates };
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users[idx];
}

export async function deleteAccount(userId) {
  const users   = await getUsers();
  const updated = users.filter(u => u.id !== userId);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
  await AsyncStorage.removeItem(SESSION_KEY);
  await AsyncStorage.removeItem(`@emotrack_journal_${userId}`);
}
