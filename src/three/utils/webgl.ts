/** Detect WebGL availability for intro fallback. */
export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('experimental-webgl', {
        failIfMajorPerformanceCaveat: false,
      });
    return Boolean(gl);
  } catch {
    return false;
  }
}

/** Heuristic for low-end devices — prefer CSS fallback. */
export function shouldPreferCssIntroFallback(): boolean {
  if (typeof navigator === 'undefined') return false;

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection?.saveData;

  if (saveData) return true;
  if (typeof mem === 'number' && mem > 0 && mem <= 2) return true;
  if (cores <= 2) return true;

  return false;
}
