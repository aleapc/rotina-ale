export type BlockKind = 'forca' | 'cardio' | 'core' | 'alongamento' | 'recuperacao';

export interface Exercise {
  name: string;
  sets: string;
  focus: string;
}

export interface Block {
  kind: BlockKind;
  label: string;
  duration: string;
  exercises: Exercise[];
}

export interface Day {
  id: string;
  weekday: number;
  label: string;
  short: string;
  focus: string;
  intention: string;
  intentionDetail: string;
  estimatedMinutes: string;
  blocks: Block[];
}

export interface Workout {
  meta: {
    athlete: string;
    age: number;
    context: string;
    principles: string[];
  };
  weekdays: Day[];
  method: {
    title: string;
    subtitle: string;
    rules: string[];
  };
  nutrition: {
    title: string;
    subtitle: string;
    pillars: { metric: string; label: string; note: string }[];
  };
}

export interface SetLog {
  load?: number;
  done: boolean;
}

export interface ExerciseLog {
  exerciseKey: string;
  sets: SetLog[];
  updatedAt: number;
}

export interface SessionLog {
  date: string;
  dayId: string;
  exercises: Record<string, ExerciseLog>;
  completedAt?: number;
}
