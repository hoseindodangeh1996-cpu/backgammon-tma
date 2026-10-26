import type hy from './hy.json';

/** Nested key paths of the Armenian locale file (e.g. "menu.play"). */
export type LocaleSchema = typeof hy;

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5];

export type LeafPaths<T, D extends number = 4> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number
          ? `${K}` | Join<K, LeafPaths<T[K], Prev[D]>>
          : never;
      }[keyof T]
    : '';

/** Strongly typed translation keys — prevents typos in t('...'). */
export type TranslationKey = LeafPaths<LocaleSchema>;
