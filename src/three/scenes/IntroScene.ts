import {
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  FogExp2,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { createBackgammonBoard, type BackgammonBoardParts } from '@/three/meshes/createBackgammonBoard';
import { createTitlePlane } from '@/three/meshes/createTitlePlane';
import { disposeObject3D } from '@/three/utils/disposeObject3D';

export type IntroSceneOptions = {
  canvas: HTMLCanvasElement;
  title?: string;
  reducedMotion?: boolean;
  /** Fired once when the lid begins opening. */
  onBoardOpen?: () => void;
  /** Fired when the cinematic finishes (before dispose). */
  onComplete?: () => void;
};

type Phase =
  | 'ambient'
  | 'title'
  | 'boardRise'
  | 'lidOpen'
  | 'cameraPush'
  | 'done';

const PHASE_DURATION: Record<Exclude<Phase, 'done'>, number> = {
  ambient: 1.1,
  title: 1.6,
  boardRise: 1.5,
  lidOpen: 1.8,
  cameraPush: 1.4,
};

/**
 * Self-contained intro cinematic.
 * Call `dispose()` on skip/unmount — cancels rAF and frees GPU resources.
 */
export class IntroScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly clock = new Clock();
  private readonly root = new Group();
  private readonly board: BackgammonBoardParts;
  private readonly titleMesh: Mesh;
  private readonly titleMaterial: MeshBasicMaterial;
  private readonly warmLight: PointLight;
  private readonly options: IntroSceneOptions;

  private rafId: number | null = null;
  private disposed = false;
  private skipping = false;
  private boardOpenSignaled = false;
  private completeSignaled = false;

  private phase: Phase = 'ambient';
  private phaseElapsed = 0;

  private readonly camStart = { x: 0, y: 2.4, z: 5.2 };
  private readonly camMid = { x: 0.15, y: 2.0, z: 4.2 };
  private readonly camEnd = { x: 0, y: 1.55, z: 3.1 };

  constructor(options: IntroSceneOptions) {
    this.options = options;
    const { canvas } = options;

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(new Color(0x0c0a08), 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;

    this.scene = new Scene();
    this.scene.fog = new FogExp2(0x0c0a08, 0.065);
    this.scene.background = new Color(0x0c0a08);

    this.camera = new PerspectiveCamera(42, 1, 0.1, 40);
    this.camera.position.set(this.camStart.x, this.camStart.y, this.camStart.z);
    this.camera.lookAt(0, 0.2, 0);

    // Lighting — night ambient + warm gold key
    this.scene.add(new AmbientLight(0x1a1510, 0.35));

    const key = new DirectionalLight(0xffe0a0, 1.15);
    key.position.set(3.5, 6, 4);
    this.scene.add(key);

    const rim = new DirectionalLight(0x6a8cff, 0.25);
    rim.position.set(-4, 2, -3);
    this.scene.add(rim);

    this.warmLight = new PointLight(0xd4af37, 0, 12, 2);
    this.warmLight.position.set(0, 2.2, 1.5);
    this.scene.add(this.warmLight);

    this.board = createBackgammonBoard();
    this.board.root.position.set(0, -1.2, 0);
    this.board.root.rotation.x = 0.12;
    this.board.lid.rotation.x = 0; // closed
    this.root.add(this.board.root);

    const title = createTitlePlane(options.title ?? 'Նարդ');
    this.titleMesh = title.mesh;
    this.titleMaterial = title.mesh.material as MeshBasicMaterial;
    this.titleMesh.position.y = 1.85;
    this.root.add(this.titleMesh);

    this.scene.add(this.root);

    this.resize();
  }

  start(): void {
    if (this.disposed || this.rafId !== null) return;

    if (this.options.reducedMotion) {
      this.applyReducedMotionPose();
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    this.clock.start();
    this.rafId = requestAnimationFrame(this.tick);
  }

  /** Fast-forward remaining animation, then complete. */
  skip(): void {
    if (this.disposed || this.completeSignaled) return;
    this.skipping = true;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    disposeObject3D(this.scene);
    this.renderer.dispose();
    try {
      this.renderer.forceContextLoss();
    } catch {
      // Optional API — ignore if unavailable.
    }

    const gl = this.renderer.getContext();
    const lose = (gl as WebGLRenderingContext & {
      getExtension: (name: string) => { loseContext?: () => void } | null;
    }).getExtension?.('WEBGL_lose_context');
    lose?.loseContext?.();
  }

  resize = (): void => {
    if (this.disposed) return;
    const canvas = this.renderer.domElement;
    const parent = canvas.parentElement;
    const width = parent?.clientWidth || window.innerWidth;
    const height = parent?.clientHeight || window.innerHeight;
    if (width <= 0 || height <= 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private applyReducedMotionPose(): void {
    this.warmLight.intensity = 1.4;
    this.titleMaterial.opacity = 1;
    this.board.root.position.y = -0.35;
    this.board.lid.rotation.x = -Math.PI * 0.92;
    this.camera.position.set(this.camEnd.x, this.camEnd.y, this.camEnd.z);
    this.camera.lookAt(0, 0.15, 0);
    if (!this.boardOpenSignaled) {
      this.boardOpenSignaled = true;
      this.options.onBoardOpen?.();
    }
  }

  private readonly tick = (): void => {
    if (this.disposed) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.phaseElapsed += this.skipping ? dt * 6 : dt;

    if (this.options.reducedMotion) {
      // Brief hold then complete
      if (this.phaseElapsed > 0.9) {
        this.signalComplete();
        return;
      }
      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    this.updatePhase();
    this.renderer.render(this.scene, this.camera);

    if (this.phase !== 'done') {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private updatePhase(): void {
    switch (this.phase) {
      case 'ambient': {
        const t = this.phaseProgress('ambient');
        this.warmLight.intensity = MathUtils.lerp(0, 0.9, easeOutCubic(t));
        this.camera.position.y = MathUtils.lerp(this.camStart.y, this.camMid.y, t * 0.3);
        if (t >= 1) this.advance('title');
        break;
      }
      case 'title': {
        const t = this.phaseProgress('title');
        this.titleMaterial.opacity = easeOutCubic(t);
        this.titleMesh.position.y = MathUtils.lerp(1.55, 1.85, easeOutCubic(t));
        this.titleMesh.scale.setScalar(MathUtils.lerp(0.92, 1, easeOutCubic(t)));
        this.warmLight.intensity = MathUtils.lerp(0.9, 1.35, t);
        if (t >= 1) this.advance('boardRise');
        break;
      }
      case 'boardRise': {
        const t = this.phaseProgress('boardRise');
        const e = easeOutCubic(t);
        this.board.root.position.y = MathUtils.lerp(-1.2, -0.35, e);
        this.board.root.rotation.y = MathUtils.lerp(-0.25, 0, e);
        this.camera.position.set(
          MathUtils.lerp(this.camStart.x, this.camMid.x, easeInOut(t)),
          MathUtils.lerp(this.camStart.y, this.camMid.y, easeInOut(t)),
          MathUtils.lerp(this.camStart.z, this.camMid.z, easeInOut(t)),
        );
        this.camera.lookAt(0, 0.2, 0);
        this.titleMesh.position.y = MathUtils.lerp(1.85, 2.05, t);
        this.titleMaterial.opacity = MathUtils.lerp(1, 0.85, t);
        if (t >= 1) this.advance('lidOpen');
        break;
      }
      case 'lidOpen': {
        const t = this.phaseProgress('lidOpen');
        if (!this.boardOpenSignaled && t > 0.08) {
          this.boardOpenSignaled = true;
          this.options.onBoardOpen?.();
        }
        this.board.lid.rotation.x = MathUtils.lerp(0, -Math.PI * 0.95, easeInOut(t));
        this.warmLight.intensity = MathUtils.lerp(1.35, 1.8, t);
        this.warmLight.position.y = MathUtils.lerp(2.2, 1.6, t);
        if (t >= 1) this.advance('cameraPush');
        break;
      }
      case 'cameraPush': {
        const t = this.phaseProgress('cameraPush');
        this.camera.position.set(
          MathUtils.lerp(this.camMid.x, this.camEnd.x, easeInOut(t)),
          MathUtils.lerp(this.camMid.y, this.camEnd.y, easeInOut(t)),
          MathUtils.lerp(this.camMid.z, this.camEnd.z, easeInOut(t)),
        );
        this.camera.lookAt(0, 0.12, 0);
        this.titleMaterial.opacity = MathUtils.lerp(0.85, 0, easeInOut(t));
        this.root.position.y = MathUtils.lerp(0, -0.08, t);
        if (t >= 1) {
          this.phase = 'done';
          this.signalComplete();
        }
        break;
      }
      default:
        break;
    }
  }

  private phaseProgress(phase: Exclude<Phase, 'done'>): number {
    return Math.min(1, this.phaseElapsed / PHASE_DURATION[phase]);
  }

  private advance(next: Phase): void {
    this.phase = next;
    this.phaseElapsed = 0;
  }

  private signalComplete(): void {
    if (this.completeSignaled || this.disposed) return;
    this.completeSignaled = true;
    this.phase = 'done';
    this.options.onComplete?.();
  }
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}
