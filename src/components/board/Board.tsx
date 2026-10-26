import { Bar } from './Bar';
import { Home } from './Home';
import { Point } from './Point';
import type { BoardLabels, BoardSpot, CheckerColor, PointView } from './boardTypes';

interface BoardProps {
  points: PointView[];
  bar: { white: number; black: number };
  off: { white: number; black: number };
  selected: BoardSpot | null;
  targets: BoardSpot[];
  labels: BoardLabels;
  onSpotClick: (spot: BoardSpot) => void;
}

// Where does each point sit on the grid?
function cell(index: number): { col: number; row: number } {
  if (index >= 13) return { col: index <= 18 ? index - 12 : index - 11, row: 1 };
  return { col: index >= 7 ? 13 - index : 14 - index, row: 2 };
}

export function Board({ points, bar, off, selected, targets, labels, onSpotClick }: BoardProps) {
  const byIndex = new Map(points.map((p) => [p.index, p]));

  return (
    <div
      className="grid w-full gap-x-0.5 gap-y-2 rounded-xl bg-amber-900 p-2 shadow-2xl"
      style={{ gridTemplateColumns: 'repeat(6, 1fr) 0.9fr repeat(6, 1fr) 1.1fr' }}
    >
      {Array.from({ length: 24 }, (_, i) => i + 1).map((index) => {
        const { col, row } = cell(index);
        const p = byIndex.get(index);
        const color: CheckerColor | null = p?.color ?? null;
        return (
          <div key={index} style={{ gridColumn: col, gridRow: row }}>
            <Point
              index={index}
              position={row === 1 ? 'top' : 'bottom'}
              color={color}
              count={p?.count ?? 0}
              isSelected={selected === index}
              isTarget={targets.includes(index)}
              onClick={onSpotClick}
              ariaLabel={labels.point(index)}
            />
          </div>
        );
      })}

      <div style={{ gridColumn: 7, gridRow: '1 / span 2' }}>
        <Bar
          whiteCount={bar.white}
          blackCount={bar.black}
          isSelected={selected === 'bar'}
          onClick={() => onSpotClick('bar')}
          ariaLabel={labels.bar}
        />
      </div>

      <div style={{ gridColumn: 14, gridRow: '1 / span 2' }}>
        <Home
          whiteOff={off.white}
          blackOff={off.black}
          isTarget={targets.includes('off')}
          onClick={() => onSpotClick('off')}
          label={labels.home}
        />
      </div>
    </div>
  );
}
