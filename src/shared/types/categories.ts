export interface TripCategory {
  id: string;
  label: string;
  color: string; // classi Tailwind per il badge (es. 'bg-sky-50 text-sky-700 border-sky-100')
}

export const DEFAULT_CATEGORIES: TripCategory[] = [
  { id: 'Lavoro', label: 'Lavoro', color: 'bg-sky-50 text-sky-700 border-sky-100' },
  { id: 'Personale', label: 'Personale', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { id: 'Commissioni', label: 'Commissioni', color: 'bg-amber-50 text-amber-700 border-amber-100' },
];