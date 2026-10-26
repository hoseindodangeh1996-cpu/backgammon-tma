import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { useHaptic } from '@/hooks/useHaptic';
import { useIntroScene } from '@/three/hooks/useIntroScene';
import { cn } from '@/lib/cn';

/**
 * Phase C — Three.js intro with CSS/WebGL fallback.
 * Skip or natural completion → Main Menu; Three.js fully disposed on leave.
 */
export function IntroSplashScreen() {
  const { t } = useTranslation();
  const skipIntro = useAppStore((s) => s.skipIntro);
  const completeIntro = useAppStore((s) => s.completeIntro);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const { impact } = useHaptic();

  const [fadingOut, setFadingOut] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

  const finishToMenu = useCallback(async () => {
    setFadingOut(true);
    // Short fade so disposal + route change feel intentional
    await new Promise((r) => window.setTimeout(r, 280));
    await completeIntro();
  }, [completeIntro]);

  const onBoardOpen = useCallback(() => {
    impact('light');
  }, [impact]);

  const { canvasRef, mode, skip } = useIntroScene({
    title: t('app.title'),
    reducedMotion,
    enabled: true,
    onBoardOpen,
    onComplete: () => {
      void finishToMenu();
    },
  });

  // CSS fallback timeline (no WebGL / low-end / reduced motion)
  useEffect(() => {
    if (mode !== 'fallback') return;

    const openTimer = window.setTimeout(() => {
      setFallbackOpen(true);
      impact('light');
    }, reducedMotion ? 200 : 900);

    const doneTimer = window.setTimeout(
      () => {
        void finishToMenu();
      },
      reducedMotion ? 1100 : 3200,
    );

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer);
    };
  }, [mode, reducedMotion, impact, finishToMenu]);

  const onSkip = () => {
    impact('soft');
    setFadingOut(true);
    // Accelerate WebGL timeline if still running; unmount via skipIntro disposes GPU resources.
    if (mode === 'webgl') skip();
    void skipIntro();
  };

  return (
    <div
      className={cn(
        'screen-shell relative items-center justify-center overflow-hidden bg-ink',
        fadingOut && 'pointer-events-none opacity-0 transition-opacity duration-300',
      )}
    >
      {/* WebGL canvas layer */}
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 h-full w-full touch-none',
          mode === 'webgl' ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={mode !== 'webgl'}
      />

      {/* CSS / low-end fallback spectacle */}
      {mode === 'fallback' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 42%, rgba(107,63,36,0.55), transparent 62%), #0c0a08',
            }}
          />
          <h1
            className={cn(
              'relative z-10 font-display text-5xl font-semibold text-gold',
              !reducedMotion && 'animate-fade-in',
            )}
          >
            {t('app.title')}
          </h1>
          <p
            className={cn(
              'relative z-10 mt-3 max-w-xs text-center text-sm text-cream/70',
              !reducedMotion && 'animate-rise-in',
            )}
          >
            {t('app.tagline')}
          </p>

          {/* Stylized board lid metaphor */}
          <div
            className={cn(
              'relative z-10 mt-10 w-full max-w-[260px] transition-transform duration-1000 ease-out',
              fallbackOpen ? '-translate-y-2' : 'translate-y-6 opacity-90',
            )}
          >
            <div className="rounded-xl border border-gold/30 bg-wood-deep p-3 shadow-board">
              <div
                className={cn(
                  'origin-top rounded-lg border border-gold/40 bg-wood px-4 py-8 text-center transition-transform duration-1000 ease-in-out',
                  fallbackOpen ? 'scale-y-[0.08] opacity-40' : 'scale-y-100',
                )}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <span className="font-display text-2xl text-gold" aria-hidden>
                  ✦
                </span>
                <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-gold-soft/80">
                  {t('app.title')}
                </p>
              </div>
              <div className="mt-2 h-16 rounded-md bg-felt" />
            </div>
          </div>
        </div>
      )}

      {mode === 'pending' && (
        <p className="relative z-10 animate-pulse font-display text-lg text-gold-soft">
          {t('app.loading')}
        </p>
      )}

      <button
        type="button"
        className="btn-ghost absolute bottom-10 right-6 z-30"
        onClick={onSkip}
      >
        {t('intro.skip')}
      </button>
    </div>
  );
}
