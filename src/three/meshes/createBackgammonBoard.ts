import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
} from 'three';
import { createEagleEmblem } from './createEagleEmblem';

export type BackgammonBoardParts = {
  root: Group;
  /** Lid that opens (hinged along +X). */
  lid: Group;
  base: Group;
};

function createWoodMaterial(color: number, roughness = 0.72): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.05,
  });
}

function createTrianglePoint(
  width: number,
  height: number,
  color: number,
): Mesh {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(width / 2, height);
  shape.lineTo(-width / 2, height);
  shape.closePath();

  const geo = new ShapeGeometry(shape);
  const mat = new MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0,
  });
  const mesh = new Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/**
 * Procedural stylized nard board: base tray + hinged outer lid with eagle.
 */
export function createBackgammonBoard(): BackgammonBoardParts {
  const root = new Group();
  root.name = 'BackgammonBoard';

  const woodDeep = createWoodMaterial(0x3d2414, 0.78);
  const woodMid = createWoodMaterial(0x6b3f24, 0.7);
  const woodLight = createWoodMaterial(0x8a5530, 0.65);
  const felt = new MeshStandardMaterial({
    color: 0x1a3d2e,
    roughness: 0.95,
    metalness: 0,
  });

  const base = new Group();
  base.name = 'BoardBase';

  // Outer frame
  const frame = new Mesh(new BoxGeometry(3.2, 0.22, 2.0), woodDeep);
  frame.position.y = 0;
  base.add(frame);

  // Inner tray recess
  const tray = new Mesh(new BoxGeometry(2.9, 0.08, 1.7), woodMid);
  tray.position.y = 0.08;
  base.add(tray);

  // Felt playing surface
  const feltMesh = new Mesh(new BoxGeometry(2.75, 0.02, 1.55), felt);
  feltMesh.position.y = 0.13;
  base.add(feltMesh);

  // Stylized points (visible when lid opens)
  const pointW = 0.2;
  const pointH = 0.55;
  const colors = [0xc9a227, 0x2a1810];
  for (let i = 0; i < 6; i++) {
    const x = -1.15 + i * 0.22;
    const top = createTrianglePoint(pointW, pointH, colors[i % 2]!);
    top.position.set(x, 0.145, -0.55);
    base.add(top);

    const bottom = createTrianglePoint(pointW, pointH, colors[(i + 1) % 2]!);
    bottom.rotation.z = Math.PI;
    bottom.position.set(x, 0.145, 0.55);
    base.add(bottom);

    const x2 = 0.15 + i * 0.22;
    const top2 = createTrianglePoint(pointW, pointH, colors[(i + 1) % 2]!);
    top2.position.set(x2, 0.145, -0.55);
    base.add(top2);

    const bottom2 = createTrianglePoint(pointW, pointH, colors[i % 2]!);
    bottom2.rotation.z = Math.PI;
    bottom2.position.set(x2, 0.145, 0.55);
    base.add(bottom2);
  }

  // Center bar
  const bar = new Mesh(new BoxGeometry(0.12, 0.16, 1.55), woodLight);
  bar.position.set(0, 0.16, 0);
  base.add(bar);

  root.add(base);

  // Lid hinged at back edge (-Z)
  const lid = new Group();
  lid.name = 'BoardLid';
  lid.position.set(0, 0.2, -1.0);

  const lidPanel = new Mesh(new BoxGeometry(3.2, 0.1, 2.0), woodDeep);
  lidPanel.position.set(0, 0.05, 1.0);
  lid.add(lidPanel);

  const lidFace = new Mesh(new BoxGeometry(2.95, 0.02, 1.75), woodMid);
  lidFace.position.set(0, 0.11, 1.0);
  lid.add(lidFace);

  const eagle = createEagleEmblem();
  eagle.rotation.x = -Math.PI / 2;
  eagle.position.set(0, 0.14, 1.0);
  lid.add(eagle);

  // Gold corner accents
  const accentMat = new MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.3,
  });
  const corners: Array<[number, number]> = [
    [-1.4, 0.2],
    [1.4, 0.2],
    [-1.4, 1.8],
    [1.4, 1.8],
  ];
  for (const [x, z] of corners) {
    const c = new Mesh(new BoxGeometry(0.12, 0.04, 0.12), accentMat);
    c.position.set(x, 0.13, z);
    lid.add(c);
  }

  root.add(lid);
  root.position.y = -0.4;

  return { root, lid, base };
}
