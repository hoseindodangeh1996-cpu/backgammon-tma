import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatchStore } from '../../store/matchStore';
import { useAppStore } from '../../store/appStore';
import { Board } from '../../components/board';
import type { BoardLabels, BoardSpot } from '../../components/board';
import { Dice } from '../../components/dice';
import {
  fromToSpot,
  spotToNumber,
  toDiceItems,
  toPointViews,
  toToSpot,
} from './boardAdapter';

// ایمپورت عکس‌های پس‌زمینه از پوشه assets
import eagleImg from '../../assets/images/eagle.jpg';
import motherImg from '../../assets/images/mother.jpg';
import mountainsImg from '../../assets/images/mountains.jpg';

const BACKGROUND_IMAGES = [eagleImg, motherImg, mountainsImg];

interface GameBoardScreenProps {
  onExit?: () => void;
}

export function GameBoardScreen({ onExit }: GameBoardScreenProps) {
  const { t } = useTranslation();

  const [randomBackground, setRandomBackground] = useState<string | null>(null);

  const mode = useMatchStore((s) => s.mode);
  const playerColor = useMatchStore((s) => s.playerColor);
  const gameState = useMatchStore((s) => s.gameState);
  const selectedPoint = useMatchStore((s) => s.selectedPoint);
  const targetMoves = useMatchStore((s) => s.targetMoves);
  const aiThinking = useMatchStore((s) => s.aiThinking);
  const turnTimeLeft = useMatchStore((s) => s.turnTimeLeft);
  const warnings = useMatchStore((s) => s.warnings);
  const timeoutMessage = useMatchStore((s) => s.timeoutMessage);
  const tickTimer = useMatchStore((s) => s.tickTimer);

  const reducedMotion = useAppStore((s) => s.reducedMotion);

  const startMatch = useMatchStore((s) => s.startMatch);
  const rollDice = useMatchStore((s) => s.rollDice);
  const selectPoint = useMatchStore((s) => s.selectPoint);
  const aiTurn = useMatchStore((s) => s.aiTurn);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  useEffect(() => {
    if (!randomBackground) {
      const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
      setRandomBackground(BACKGROUND_IMAGES[randomIndex]);
    }
  }, [randomBackground]);

  useEffect(() => {
    if (!gameState) startMatch();
  }, [gameState, startMatch]);

  useEffect(() => {
    if (!gameState || gameState.phase === 'ended') return;
    if (mode === 'ai') return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, mode, tickTimer]);

  useEffect(() => {
    if (!gameState || mode !== 'ai') return;
    if (gameState.phase === 'ended') return;
    if (gameState.turn === playerColor) return;
    if (aiThinking) return;
    aiTurn();
  }, [gameState, mode, playerColor, aiThinking, aiTurn]);

  const labels: BoardLabels = useMemo(
    () => ({
      point: (n: number) => t('game.point', { n }),
      bar: t('game.bar'),
      home: t('game.home'),
    }),
    [t],
  );

  if (!gameState) return null;

  const { turn, phase, winner, board } = gameState;
  const isHumanTurn = mode === 'local' || turn === playerColor;
  const canRoll = isHumanTurn && phase === 'rolling' && !aiThinking;
  const canTap = isHumanTurn && phase === 'moving' && !aiThinking;

  const selected: BoardSpot | null =
    selectedPoint !== null ? fromToSpot(selectedPoint, turn) : null;
  
  const targets: BoardSpot[] = reducedMotion
    ? []
    : targetMoves.map((m) => toToSpot(m.to, turn));

  const handleSpotClick = (spot: BoardSpot) => {
    if (!canTap) return;
    selectPoint(spotToNumber(spot, turn));
  };

  let status: string;
  if (aiThinking) status = t('game.aiThinking');
  else if (mode === 'ai') status = isHumanTurn ? t('game.yourTurn') : t('game.opponentTurn');
  else status = turn === 'white' ? t('game.whiteTurn') : t('game.blackTurn');

  let winText = '';
  if (phase === 'ended' && winner) {
    winText =
      mode === 'ai'
        ? winner === playerColor
          ? t('game.youWin')
          : t('game.youLose')
        : winner === 'white'
          ? t('game.whiteWins')
          : t('game.blackWins');
  }

  const handleExit = () => {
    resetMatch();
    onExit?.();
  };

  const currentWarnings = warnings[turn] || 0;

  return (
    <div
      className="relative flex min-h-screen flex-col gap-4 bg-black p-3 text-amber-50 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: randomBackground ? `url(${randomBackground})` : 'none',
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {mode === 'local' ? (
            <div className="flex items-center gap-2 rounded-full bg-stone-800 px-4 py-2 text-sm font-bold text-amber-400 border border-amber-500/30">
              <span>⏳ {turnTimeLeft}s</span>
              <span className="text-xs text-red-400">({currentWarnings}/3 զգուշացում)</span>
            </div>
          ) : (
            <div className="w-[72px]" />
          )}
          <span className="text-sm font-semibold">{status}</span>
          <button
            type="button"
            onClick={handleExit}
            className="rounded-full bg-stone-700 px-4 py-2 text-sm font-semibold active:scale-95"
          >
            {t('game.menu')}
          </button>
        </div>

        {timeoutMessage && mode === 'local' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 rounded-xl bg-red-600/90 px-4 py-2 text-sm font-bold text-white shadow-lg animate-bounce">
            {timeoutMessage}
          </div>
        )}

        <div className="relative z-20">
          <Board
            points={toPointViews(board.points)}
            bar={board.bar}
            off={board.off}
            selected={selected}
            targets={targets}
            labels={labels}
            onSpotClick={handleSpotClick}
          />
        </div>

        <div className="flex min-h-[56px] items-center justify-center relative z-20">
          <Dice
            dice={toDiceItems(gameState)}
            canRoll={canRoll}
            onRoll={rollDice}
            rollLabel={t('game.roll')}
          />
        </div>

        {phase === 'ended' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-stone-800 p-6 text-center">
              <h2 className="text-2xl font-bold">{winText}</h2>
              <button
                type="button"
                onClick={startMatch}
                className="w-full rounded-full bg-amber-500 px-6 py-3 font-bold text-stone-900 active:scale-95"
              >
                {t('game.newGame')}
              </button>
              <button
                type="button"
                onClick={handleExit}
                className="w-full rounded-full bg-stone-700 px-6 py-3 font-semibold active:scale-95"
              >
                {t('game.menu')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
