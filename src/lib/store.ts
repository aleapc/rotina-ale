import localforage from 'localforage';
import { writable, get } from 'svelte/store';
import type { SessionLog, SetLog } from './types';
import { todayISO } from './workout';

const sessionStore = localforage.createInstance({
  name: 'rotina-ale',
  storeName: 'sessions'
});

const historyStore = localforage.createInstance({
  name: 'rotina-ale',
  storeName: 'history'
});

export const currentSession = writable<SessionLog | null>(null);

export async function loadSession(dayId: string): Promise<SessionLog> {
  const key = `${todayISO()}::${dayId}`;
  let s = await sessionStore.getItem<SessionLog>(key);
  if (!s) {
    s = { date: todayISO(), dayId, exercises: {} };
  }
  currentSession.set(s);
  return s;
}

export async function saveSession(s: SessionLog): Promise<void> {
  const key = `${s.date}::${s.dayId}`;
  await sessionStore.setItem(key, s);
  currentSession.set(s);
}

export async function updateSet(
  dayId: string,
  exerciseKey: string,
  setIndex: number,
  patch: Partial<SetLog>,
  totalSets: number
): Promise<void> {
  const s = get(currentSession) ?? (await loadSession(dayId));
  if (!s.exercises[exerciseKey]) {
    s.exercises[exerciseKey] = {
      exerciseKey,
      sets: Array.from({ length: totalSets }, () => ({ done: false })),
      updatedAt: Date.now()
    };
  }
  while (s.exercises[exerciseKey].sets.length < totalSets) {
    s.exercises[exerciseKey].sets.push({ done: false });
  }
  s.exercises[exerciseKey].sets[setIndex] = {
    ...s.exercises[exerciseKey].sets[setIndex],
    ...patch
  };
  s.exercises[exerciseKey].updatedAt = Date.now();
  await saveSession(s);
  if (patch.load !== undefined) {
    await historyStore.setItem(exerciseKey, {
      lastLoad: patch.load,
      date: s.date
    });
  }
}

export async function lastLoad(exerciseKey: string): Promise<number | null> {
  const h = await historyStore.getItem<{ lastLoad: number; date: string }>(exerciseKey);
  return h?.lastLoad ?? null;
}

export async function listCompletedDays(): Promise<string[]> {
  const keys = await sessionStore.keys();
  const done: string[] = [];
  for (const k of keys) {
    const s = await sessionStore.getItem<SessionLog>(k);
    if (s?.completedAt) done.push(s.date);
  }
  return done;
}
