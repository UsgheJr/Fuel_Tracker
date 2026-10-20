// src/shared/types/categories.ts

export type TripCategory = 'Lavoro' | 'Personale' | 'Altro' | string;

export const DEFAULT_CATEGORIES: TripCategory[] = [
  'Lavoro',
  'Personale',
  'Altro',
];