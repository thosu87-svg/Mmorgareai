'use client';
/**
 * @fileOverview Ouroboros GPU Instancing Engine (Three.js Edition)
 * Ultra-efficient rendering for thousands of world assets with shared materials and physics hulls.
 */

import * as THREE from 'three';

export interface InstanceNode {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export class InstancedAssetEngine {
  /**
   * Creates a high-performance THREE.InstancedMesh for world nodes.
   */
  static createInstancedMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    nodes: InstanceNode[]
  ): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geometry, material, nodes.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    nodes.forEach((node, i) => {
      dummy.position.copy(node.position);
      dummy.rotation.copy(node.rotation);
      dummy.scale.copy(node.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  /**
   * Generates a simplified collision hull from a complex mesh for physics efficiency.
   */
  static generateCollisionHull(mesh: THREE.Mesh): THREE.BufferGeometry {
    // For this prototype, we use a simple bounding box as the hull
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    mesh.geometry.boundingBox?.getSize(size);
    const box = new THREE.BoxGeometry(size.x, size.y, size.z);
    return box;
  }
}