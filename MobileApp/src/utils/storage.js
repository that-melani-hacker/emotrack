import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (userId) => `@emotrack_journal_${userId}`;

export async function saveEntry(userId, data) {
  const entries  = await getEntries(userId);
  const newEntry = {
    id:        Date.now().toString(),
    createdAt: new Date().toISOString(),   // exact time recorded at save
    ...data,
  };
  await AsyncStorage.setItem(key(userId), JSON.stringify([newEntry, ...entries]));
  return newEntry;
}

export async function getEntries(userId) {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function deleteEntry(userId, entryId) {
  const entries = await getEntries(userId);
  const updated = entries.filter(e => e.id !== entryId);
  await AsyncStorage.setItem(key(userId), JSON.stringify(updated));
}
