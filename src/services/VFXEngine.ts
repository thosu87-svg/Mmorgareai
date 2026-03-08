'use client';
/**
 * @fileOverview Ouroboros Three.js VFX Engine
 * JSON-driven particle effects system for Axiom Frontier.
 */

import * as THREE from 'three';
import presetsJson from '@/data/vfx-presets.json';

interface VFXPreset {
  capacity: number;
  emitRate?: number;
  manualEmitCount?: number;
  lifetime: { min: number; max: number };
  size: { min: number; max: number };
  color1: [number, number, number, number];
  color2: [number, number, number, number];
  colorDead: [number, number, number, number];
  emitPower: { min: number; max: number };
  direction1: [number, number, number];
  direction2: [number, number, number];
  gravity: [number, number, number];
  targetStopDuration?: number;
  blendMode?: 'add' | 'standard' | 'multiply';
}

const PRESETS = presetsJson as Record<string, VFXPreset>;

class VFXSystem {
  points: THREE.Points;
  particles: any[] = [];
  preset: VFXPreset;
  active = false;
  texture: THREE.Texture;

  constructor(preset: VFXPreset, texture: THREE.Texture) {
    this.preset = preset;
    this.texture = texture;
    
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: preset.size.max,
      map: texture,
      transparent: true,
      blending: preset.blendMode === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      vertexColors: true
    });

    const positions = new Float32Array(preset.capacity * 3);
    const colors = new Float32Array(preset.capacity * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
  }

  spawn(origin: THREE.Vector3) {
    if (this.particles.length >= this.preset.capacity) return;
    
    const particle = {
      position: origin.clone(),
      velocity: new THREE.Vector3(
        (Math.random() * (this.preset.direction2[0] - this.preset.direction1[0]) + this.preset.direction1[0]) * this.preset.emitPower.max,
        (Math.random() * (this.preset.direction2[1] - this.preset.direction1[1]) + this.preset.direction1[1]) * this.preset.emitPower.max,
        (Math.random() * (this.preset.direction2[2] - this.preset.direction1[2]) + this.preset.direction1[2]) * this.preset.emitPower.max
      ),
      life: 0,
      maxLife: Math.random() * (this.preset.lifetime.max - this.preset.lifetime.min) + this.preset.lifetime.min,
      color: new THREE.Color().fromArray(this.preset.color1.slice(0, 3))
    };
    this.particles.push(particle);
  }

  update(delta: number) {
    const posAttr = this.points.geometry.getAttribute('position');
    const colAttr = this.points.geometry.getAttribute('color');

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.velocity.y += this.preset.gravity[1] * delta;
      p.position.add(p.velocity.clone().multiplyScalar(delta));

      posAttr.setXYZ(i, p.position.x, p.position.y, p.position.z);
      
      const t = p.life / p.maxLife;
      const c1 = new THREE.Color().fromArray(this.preset.color1.slice(0, 3));
      const c2 = new THREE.Color().fromArray(this.preset.color2.slice(0, 3));
      p.color.copy(c1).lerp(c2, t);
      colAttr.setXYZ(i, p.color.r, p.color.g, p.color.b);
    }

    // Hide inactive particles by moving them out of view
    for (let i = this.particles.length; i < this.preset.capacity; i++) {
      posAttr.setXYZ(i, 0, -1000, 0);
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }
}

export class VFXEngine {
  private scene: THREE.Scene;
  private texture: THREE.Texture;
  private activeSystems: VFXSystem[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.texture = this.createDefaultTexture();
  }

  private createDefaultTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  burst(presetId: string, position: THREE.Vector3) {
    const preset = PRESETS[presetId];
    if (!preset) return;

    const system = new VFXSystem(preset, this.texture);
    this.scene.add(system.points);
    this.activeSystems.push(system);
    
    const count = preset.manualEmitCount || preset.capacity;
    for (let i = 0; i < count; i++) {
      system.spawn(position);
    }

    const duration = preset.targetStopDuration || 1.0;
    setTimeout(() => {
      this.scene.remove(system.points);
      system.points.geometry.dispose();
      (system.points.material as THREE.Material).dispose();
      this.activeSystems = this.activeSystems.filter(s => s !== system);
    }, duration * 1000);

    return system;
  }

  update(delta: number) {
    this.activeSystems.forEach(s => s.update(delta));
  }
}