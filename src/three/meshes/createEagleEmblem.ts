import {
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
} from 'three';

/**
 * Stylized heraldic eagle for the board lid (procedural Shape → Extrude).
 * Not photoreal — readable silhouette under gold rim light.
 */
export function createEagleEmblem(): Group {
  const group = new Group();
  group.name = 'EagleEmblem';

  const body = new Shape();
  // Body + head (facing up)
  body.moveTo(0, 0.55);
  body.quadraticCurveTo(0.08, 0.48, 0.1, 0.38);
  body.lineTo(0.12, 0.22);
  body.quadraticCurveTo(0.18, 0.05, 0.08, -0.15);
  body.lineTo(0.05, -0.45);
  body.lineTo(0, -0.52);
  body.lineTo(-0.05, -0.45);
  body.lineTo(-0.08, -0.15);
  body.quadraticCurveTo(-0.18, 0.05, -0.12, 0.22);
  body.lineTo(-0.1, 0.38);
  body.quadraticCurveTo(-0.08, 0.48, 0, 0.55);

  const leftWing = new Shape();
  leftWing.moveTo(-0.1, 0.25);
  leftWing.quadraticCurveTo(-0.55, 0.35, -0.72, 0.05);
  leftWing.quadraticCurveTo(-0.65, -0.15, -0.35, -0.05);
  leftWing.quadraticCurveTo(-0.22, 0.05, -0.12, 0.12);
  leftWing.lineTo(-0.1, 0.25);

  const rightWing = new Shape();
  rightWing.moveTo(0.1, 0.25);
  rightWing.quadraticCurveTo(0.55, 0.35, 0.72, 0.05);
  rightWing.quadraticCurveTo(0.65, -0.15, 0.35, -0.05);
  rightWing.quadraticCurveTo(0.22, 0.05, 0.12, 0.12);
  rightWing.lineTo(0.1, 0.25);

  const extrude = {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.008,
    bevelSegments: 1,
  };

  const gold = new MeshStandardMaterial({
    color: 0xc9a227,
    metalness: 0.85,
    roughness: 0.35,
    emissive: 0x3a2a08,
    emissiveIntensity: 0.25,
  });

  const darkInlay = new MeshStandardMaterial({
    color: 0x2a1810,
    metalness: 0.2,
    roughness: 0.7,
  });

  const shapes: Array<{ shape: Shape; mat: MeshStandardMaterial; z: number }> = [
    { shape: leftWing, mat: gold, z: 0 },
    { shape: rightWing, mat: gold, z: 0 },
    { shape: body, mat: gold, z: 0.005 },
  ];

  for (const { shape, mat, z } of shapes) {
    const geo = new ExtrudeGeometry(shape, extrude);
    geo.center();
    const mesh = new Mesh(geo, mat);
    mesh.position.z = z;
    group.add(mesh);
  }

  // Recessed plate behind emblem (engraved look)
  const plate = new Shape();
  plate.absellipse(0, 0, 0.95, 0.75, 0, Math.PI * 2, false, 0);
  const plateGeo = new ExtrudeGeometry(plate, {
    depth: 0.02,
    bevelEnabled: false,
  });
  plateGeo.center();
  const plateMesh = new Mesh(plateGeo, darkInlay);
  plateMesh.position.z = -0.03;
  group.add(plateMesh);

  group.scale.setScalar(0.55);
  return group;
}
