// Sync store: Supabase = source of truth, IndexedDB = offline cache.
// Writes go to IndexedDB first (instant UI), then push to Supabase.
// Realtime subscription updates IndexedDB + UI when other devices change state.

import localforage from 'localforage';
import { writable, get } from 'svelte/store';
import type { Session, User } from '@supabase/supabase-js';
import type { SessionLog, SetLog } from './types';
import { todayISO } from './workout';
import { supabase } from './supabase';

// ─── local caches ─────────────────────────────────────────────────────────
const sessionsCache = localforage.createInstance({
  name: 'rotina-ale',
  storeName: 'sessions'
});

const historyCache = localforage.createInstance({
  name: 'rotina-ale',
  storeName: 'history'
});

const pendingQueue = localforage.createInstance({
  name: 'rotina-ale',
  storeName: 'pending'
});

// ─── reactive stores ──────────────────────────────────────────────────────
export const currentSession = writable<SessionLog | null>(null);
export const authUser = writable<User | null>(null);
export const isOnline = writable<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline.set(true);
    flushPendingQueue();
  });
  window.addEventListener('offline', () => isOnline.set(false));
}

// ─── auth ─────────────────────────────────────────────────────────────────
export async function initAuth(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  authUser.set(data.session?.user ?? null);
  supabase.auth.onAuthStateChange((_event, session) => {
    authUser.set(session?.user ?? null);
  });
  return data.session?.user ?? null;
}

export async function signInWithMagicLink(email: string, redirectTo?: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true
    }
  });
}

export async function verifyOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
}

export async function signOut() {
  await supabase.auth.signOut();
  authUser.set(null);
  await sessionsCache.clear();
  await historyCache.clear();
  await pendingQueue.clear();
  currentSession.set(null);
}

// ─── session loading ──────────────────────────────────────────────────────
function sessionKey(date: string, dayId: string) {
  return `${date}::${dayId}`;
}

export async function loadSession(dayId: string): Promise<SessionLog> {
  const date = todayISO();
  const key = sessionKey(date, dayId);

  // 1. show cached version immediately
  let s = (await sessionsCache.getItem<SessionLog>(key)) ?? {
    date,
    dayId,
    exercises: {}
  };
  currentSession.set(s);

  // 2. try to fetch fresh from server
  const user = get(authUser);
  if (user && get(isOnline)) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .eq('day_id', dayId)
        .maybeSingle();
      if (!error && data) {
        s = {
          date,
          dayId,
          exercises: data.exercises ?? {},
          completedAt: data.completed_at ? new Date(data.completed_at).getTime() : undefined
        };
        await sessionsCache.setItem(key, s);
        currentSession.set(s);
      }
    } catch {
      // offline — keep cached
    }
  }
  return s;
}

// ─── writes ───────────────────────────────────────────────────────────────
async function persistSession(s: SessionLog) {
  const key = sessionKey(s.date, s.dayId);
  await sessionsCache.setItem(key, s);
  currentSession.set(s);

  const user = get(authUser);
  if (!user) return;

  // queue for retry if offline
  if (!get(isOnline)) {
    await pendingQueue.setItem(`session::${key}`, s);
    return;
  }

  try {
    await supabase.from('sessions').upsert(
      {
        user_id: user.id,
        date: s.date,
        day_id: s.dayId,
        exercises: s.exercises,
        completed_at: s.completedAt ? new Date(s.completedAt).toISOString() : null
      },
      { onConflict: 'user_id,date,day_id' }
    );
  } catch {
    await pendingQueue.setItem(`session::${key}`, s);
  }
}

export async function updateSet(
  dayId: string,
  exerciseKey: string,
  setIndex: number,
  patch: Partial<SetLog>,
  totalSets: number
): Promise<void> {
  let s = get(currentSession);
  if (!s || s.dayId !== dayId) {
    s = await loadSession(dayId);
  }

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

  await persistSession(s);

  if (patch.load !== undefined) {
    await saveHistory(exerciseKey, patch.load);
  }
}

async function saveHistory(exerciseKey: string, load: number) {
  await historyCache.setItem(exerciseKey, { lastLoad: load, date: todayISO() });
  const user = get(authUser);
  if (!user) return;
  if (!get(isOnline)) {
    await pendingQueue.setItem(`hist::${exerciseKey}`, { user_id: user.id, exercise_key: exerciseKey, last_load: load });
    return;
  }
  try {
    await supabase
      .from('exercise_history')
      .upsert(
        { user_id: user.id, exercise_key: exerciseKey, last_load: load },
        { onConflict: 'user_id,exercise_key' }
      );
  } catch {
    await pendingQueue.setItem(`hist::${exerciseKey}`, { user_id: user.id, exercise_key: exerciseKey, last_load: load });
  }
}

export async function lastLoad(exerciseKey: string): Promise<number | null> {
  // try cache first for instant value
  const cached = await historyCache.getItem<{ lastLoad: number }>(exerciseKey);
  if (cached) return cached.lastLoad;

  const user = get(authUser);
  if (!user || !get(isOnline)) return null;

  const { data } = await supabase
    .from('exercise_history')
    .select('last_load')
    .eq('user_id', user.id)
    .eq('exercise_key', exerciseKey)
    .maybeSingle();
  if (data) {
    await historyCache.setItem(exerciseKey, { lastLoad: data.last_load, date: todayISO() });
    return data.last_load;
  }
  return null;
}

// ─── flush pending writes when back online ────────────────────────────────
async function flushPendingQueue() {
  const user = get(authUser);
  if (!user) return;
  const keys = await pendingQueue.keys();
  for (const k of keys) {
    const item = await pendingQueue.getItem(k);
    if (!item) continue;
    try {
      if (k.startsWith('session::')) {
        const s = item as SessionLog;
        await supabase.from('sessions').upsert(
          {
            user_id: user.id,
            date: s.date,
            day_id: s.dayId,
            exercises: s.exercises,
            completed_at: s.completedAt ? new Date(s.completedAt).toISOString() : null
          },
          { onConflict: 'user_id,date,day_id' }
        );
      } else if (k.startsWith('hist::')) {
        await supabase
          .from('exercise_history')
          .upsert(item as any, { onConflict: 'user_id,exercise_key' });
      }
      await pendingQueue.removeItem(k);
    } catch {
      break; // stop on first failure, retry later
    }
  }
}

// ─── realtime subscription ────────────────────────────────────────────────
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

export async function subscribeRealtime() {
  const user = get(authUser);
  if (!user || realtimeChannel) return;

  realtimeChannel = supabase
    .channel(`user:${user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `user_id=eq.${user.id}`
      },
      async (payload) => {
        if (payload.eventType === 'DELETE') return;
        const row = payload.new as any;
        const s: SessionLog = {
          date: row.date,
          dayId: row.day_id,
          exercises: row.exercises ?? {},
          completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined
        };
        await sessionsCache.setItem(sessionKey(s.date, s.dayId), s);

        // if this is the current session, update reactive store
        const current = get(currentSession);
        if (current && current.date === s.date && current.dayId === s.dayId) {
          currentSession.set(s);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'exercise_history',
        filter: `user_id=eq.${user.id}`
      },
      async (payload) => {
        const row = payload.new as any;
        if (row?.exercise_key) {
          await historyCache.setItem(row.exercise_key, {
            lastLoad: row.last_load,
            date: todayISO()
          });
        }
      }
    )
    .subscribe();
}

export async function unsubscribeRealtime() {
  if (realtimeChannel) {
    await supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

// keep the legacy export for callers that still use it
export async function saveSession(s: SessionLog): Promise<void> {
  await persistSession(s);
}
