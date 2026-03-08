
'use client';
/**
 * @fileOverview Ouroboros Character Exporter
 * Translates Three.js rigged models into GLB format for Godot integration.
 */

import * as THREE from 'three';

export class CharacterExportService {
  /**
   * Parses a Three.js object and triggers a browser download of the GLB file.
   */
  static async exportToGLB(sceneObject: THREE.Object3D, filename: string = 'character.glb') {
    const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
    
    const exporter = new GLTFExporter();
    
    // We clone the object to strip any scene-specific metadata before export
    const clone = sceneObject.clone();
    
    return new Promise((resolve, reject) => {
      exporter.parse(
        clone,
        (result) => {
          if (result instanceof ArrayBuffer) {
            this.saveArrayBuffer(result, filename);
            resolve(true);
          } else {
            const output = JSON.stringify(result, null, 2);
            this.saveString(output, filename.replace('.glb', '.gltf'));
            resolve(true);
          }
        },
        (error) => {
          console.error('GLTF Export Error:', error);
          reject(error);
        },
        { binary: true, animations: [] }
      );
    });
  }

  private static save(blob: Blob, filename: string) {
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    document.body.removeChild(link);
  }

  private static saveString(text: string, filename: string) {
    this.save(new Blob([text], { type: 'text/plain' }), filename);
  }

  private static saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
    this.save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
  }
}
