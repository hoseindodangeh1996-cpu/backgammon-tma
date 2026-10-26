import { useEffect, useRef, useCallback, useState } from 'react';
import { IntroScene } from '@/three/scenes/IntroScene';
import {
  isWebGLAvailable,
  shouldPreferCssIntroFallback,
} from '@/three/utils/webgl';

export type UseIntroSceneOptions = {
  title: string;
  reducedMotion: boolean;
  enabled: boolean;
  onBoardOpen: () => void;
  onComplete: () => void;
};

export type IntroRenderMode = 'webgl' | 'fallback' | 'pending';

/**
 * Mounts IntroScene on a canvas ref; disposes on unmount / skip.
 */
export function useIntroScene({
  title,
  reducedMotion,
  enabled,
  onBoardOpen,
  onComplete,
}: UseIntroSceneOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<IntroScene | null>(null);
  const completedRef = useRef(false);
  const [mode, setMode] = useState<IntroRenderMode>('pending');

  const safeComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  /** Accelerate the cinematic; navigation is owned by the screen (skipIntro / completeIntro). */
  const skip = useCallback(() => {
    sceneRef.current?.skip();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const preferFallback =
      reducedMotion || !isWebGLAvailable() || shouldPreferCssIntroFallback();

    if (preferFallback) {
      setMode('fallback');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setMode('fallback');
      return;
    }

    let scene: IntroScene;
    try {
      scene = new IntroScene({
        canvas,
        title,
        reducedMotion: false,
        onBoardOpen,
        onComplete: safeComplete,
      });
    } catch (err) {
      console.warn('[IntroScene] WebGL init failed, using CSS fallback', err);
      setMode('fallback');
      return;
    }

    sceneRef.current = scene;
    setMode('webgl');
    scene.start();

    const onResize = () => scene.resize();
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [enabled, title, reducedMotion, onBoardOpen, safeComplete]);

  return { canvasRef, mode, skip };
}
