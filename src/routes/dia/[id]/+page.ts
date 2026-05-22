import { error } from '@sveltejs/kit';
import { dayById, workout } from '$lib/workout';
import type { PageLoad } from './$types';

export const prerender = true;

export function entries() {
  return workout.weekdays.map((d) => ({ id: d.id }));
}

export const load: PageLoad = ({ params }) => {
  const day = dayById(params.id);
  if (!day) throw error(404, 'Dia não encontrado');
  return { day };
};
