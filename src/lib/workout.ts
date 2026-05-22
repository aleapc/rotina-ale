import data from './data/workout.json';
import type { Workout, Day } from './types';

export const workout = data as Workout;

export function dayByWeekday(weekday: number): Day {
  return workout.weekdays.find((d) => d.weekday === weekday) ?? workout.weekdays[0];
}

export function dayById(id: string): Day | undefined {
  return workout.weekdays.find((d) => d.id === id);
}

export function neighborDays(id: string): { prev: Day; next: Day } {
  const days = workout.weekdays;
  const ordered = [...days].sort((a, b) => {
    const norm = (w: number) => (w === 0 ? 7 : w);
    return norm(a.weekday) - norm(b.weekday);
  });
  const idx = ordered.findIndex((d) => d.id === id);
  const prev = ordered[(idx - 1 + ordered.length) % ordered.length];
  const next = ordered[(idx + 1) % ordered.length];
  return { prev, next };
}

export function totalExercises(day: Day): number {
  return day.blocks.reduce((acc, b) => acc + b.exercises.length, 0);
}

export function exerciseKey(dayId: string, blockKind: string, exName: string): string {
  return `${dayId}::${blockKind}::${exName}`;
}

export function parseSets(sets: string): number {
  const m = sets.match(/^(\d+)\s*[×x]/i);
  if (m) return parseInt(m[1], 10);
  return 1;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
