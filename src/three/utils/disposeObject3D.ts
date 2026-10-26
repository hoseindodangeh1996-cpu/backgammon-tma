import type { Material, Object3D, Texture } from 'three';

function disposeMaterial(material: Material): void {
  const mat = material as Material & Record<string, unknown>;
  for (const key of Object.keys(mat)) {
    const value = mat[key];
    if (value && typeof value === 'object' && 'isTexture' in (value as object)) {
      (value as Texture).dispose();
    }
  }
  material.dispose();
}

/** Recursively dispose geometries, materials, and textures under a root. */
export function disposeObject3D(root: Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as Object3D & {
      geometry?: { dispose: () => void };
      material?: Material | Material[];
    };

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(mesh.material);
      }
    }
  });
}
