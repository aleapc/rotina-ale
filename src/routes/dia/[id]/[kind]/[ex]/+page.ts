import { error } from '@sveltejs/kit';
import { dayById, workout } from '$lib/workout';
import type { PageLoad } from './$types';

export const prerender = true;

export function entries() {
  const out: { id: string; kind: string; ex: string }[] = [];
  for (const day of workout.weekdays) {
    for (const block of day.blocks) {
      for (const ex of block.exercises) {
        out.push({
          id: day.id,
          kind: block.kind,
          ex: encodeURIComponent(`${block.kind}::${ex.name}`)
        });
      }
    }
  }
  return out;
}

export const load: PageLoad = ({ params }) => {
  const day = dayById(params.id);
  if (!day) throw error(404, 'Dia não encontrado');

  const block = day.blocks.find((b) => b.kind === params.kind);
  if (!block) throw error(404, 'Bloco não encontrado');

  const decoded = decodeURIComponent(params.ex);
  const [, exName] = decoded.split('::');
  const idx = block.exercises.findIndex((e) => e.name === exName);
  if (idx < 0) throw error(404, 'Exercício não encontrado');

  return { day, block, exerciseIndex: idx };
};
