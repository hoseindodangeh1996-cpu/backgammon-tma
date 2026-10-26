export type CheckerColor = 'white' | 'black';

// Anything on the board you can tap: a point (1-24), the bar, or the home tray
export type BoardSpot = number | 'bar' | 'off';

export interface PointView {
  index: number; // 1..24
  color: CheckerColor | null; // who owns it (null = empty)
  count: number; // how many checkers
}

export interface BoardLabels {
  point: (n: number) => string; // Armenian text, passed in from i18n
  bar: string;
  home: string;
}
