import {
  CanvasTexture,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  LinearFilter,
} from 'three';

/** Canvas-drawn Armenian title as a billboard plane (avoids font atlas deps). */
export function createTitlePlane(text: string): {
  mesh: Mesh;
  texture: CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas unavailable for title texture');
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Soft gold glow
  const glow = ctx.createRadialGradient(512, 160, 20, 512, 160, 280);
  glow.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
  glow.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font =
    '700 160px "Noto Serif Armenian", "Noto Sans Armenian", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8d48b';
  ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
  ctx.shadowBlur = 28;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 8);

  // Thin underline accent
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 250);
  ctx.lineTo(724, 250);
  ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    side: DoubleSide,
    depthWrite: false,
  });

  const mesh = new Mesh(new PlaneGeometry(3.4, 1.05), material);
  mesh.name = 'TitlePlane';
  mesh.position.set(0, 1.55, 0.2);

  return { mesh, texture };
}
