
import * as THREE from 'three';
import { AgentState } from '../../types';
import type { HumanoidBones } from './HumanoidModel';

export type AnimationName = 'idle' | 'walk' | 'run' | 'attack' | 'death';

const CROSSFADE_DURATION = 0.3;

function createIdleClip(bones: HumanoidBones): THREE.AnimationClip {
  const duration = 2.0;
  const fps = 30;
  const numFrames = Math.floor(duration * fps);
  const times: number[] = [];
  for (let i = 0; i <= numFrames; i++) {
    times.push((i / numFrames) * duration);
  }

  const tracks: THREE.KeyframeTrack[] = [];

  if (bones.spine) {
    const spineQuats: number[] = [];
    for (let i = 0; i <= numFrames; i++) {
      const t = (i / numFrames) * Math.PI * 2;
      const q = new THREE.Quaternion();
      q.setFromEuler(new THREE.Euler(Math.sin(t) * 0.015, 0, Math.sin(t * 0.5) * 0.01));
      spineQuats.push(q.x, q.y, q.z, q.w);
    }
    tracks.push(new THREE.QuaternionKeyframeTrack(`${bones.spine.name}.quaternion`, times, spineQuats));
  }

  if (bones.chest) {
    const chestQuats: number[] = [];
    for (let i = 0; i <= numFrames; i++) {
      const t = (i / numFrames) * Math.PI * 2;
      const q = new THREE.Quaternion();
      q.setFromEuler(new THREE.Euler(Math.sin(t + 0.5) * 0.01, 0, 0));
      chestQuats.push(q.x, q.y, q.z, q.w);
    }
    tracks.push(new THREE.QuaternionKeyframeTrack(`${bones.chest.name}.quaternion`, times, chestQuats));
  }

  if (bones.head) {
    const headQuats: number[] = [];
    for (let i = 0; i <= numFrames; i++) {
      const t = (i / numFrames) * Math.PI * 2;
      const q = new THREE.Quaternion();
      q.setFromEuler(new THREE.Euler(Math.sin(t * 0.7) * 0.02, Math.sin(t * 0.3) * 0.015, 0));
      headQuats.push(q.x, q.y, q.z, q.w);
    }
    tracks.push(new THREE.QuaternionKeyframeTrack(`${bones.head.name}.quaternion`, times, headQuats));
  }

  return new THREE.AnimationClip('idle', duration, tracks);
}

function createWalkClip(bones: HumanoidBones): THREE.AnimationClip {
  const duration = 1.0;
  const fps = 30;
  const numFrames = Math.floor(duration * fps);
  const times: number[] = [];
  for (let i = 0; i <= numFrames; i++) {
    times.push((i / numFrames) * duration);
  }

  const tracks: THREE.KeyframeTrack[] = [];

  if (bones.upperLegL && bones.lowerLegL) {
    const upperLQuats: number[] = [];
    const lowerLQuats: number[] = [];
    for (let i = 0; i <= numFrames; i++) {
      const t = (i / numFrames) * Math.PI * 2;
      const qUL = new THREE.Quaternion();
      qUL.setFromEuler(new THREE.Euler(Math.sin(t) * 0.4, 0, 0));
      upperLQuats.push(qUL.x, qUL.y, qUL.z, qUL.w);
      const qLL = new THREE.Quaternion();
      qLL.setFromEuler(new THREE.Euler(Math.max(0, -Math.sin(t)) * 0.5, 0, 0));
      lowerLQuats.push(qLL.x, qLL.y, qLL.z, qLL.w);
    }
    tracks.push(new THREE.QuaternionKeyframeTrack(`${bones.upperLegL.name}.quaternion`, times, upperLQuats));
    tracks.push(new THREE.QuaternionKeyframeTrack(`${bones.lowerLegL.name}.quaternion`, times, lowerLQuats));
  }

  return new THREE.AnimationClip('walk', duration, tracks);
}

export function createAnimationClips(bones: HumanoidBones): Record<AnimationName, THREE.AnimationClip | null> {
  return {
    idle: createIdleClip(bones),
    walk: createWalkClip(bones),
    run: null,
    attack: null,
    death: null
  };
}

const STATE_TO_ANIMATION: Record<string, AnimationName> = {
  [AgentState.IDLE]: 'idle',
  [AgentState.EXPLORING]: 'walk',
  [AgentState.GATHERING]: 'walk'
};

export function getAnimationForState(state: AgentState): AnimationName {
  return STATE_TO_ANIMATION[state] || 'idle';
}

export class AnimationController {
  private mixer: THREE.AnimationMixer;
  private actions: Record<AnimationName, THREE.AnimationAction | null>;
  private currentAction: THREE.AnimationAction | null = null;
  private currentName: AnimationName = 'idle';

  constructor(mesh: THREE.SkinnedMesh, clips: Record<AnimationName, THREE.AnimationClip | null>) {
    this.mixer = new THREE.AnimationMixer(mesh);
    this.actions = {} as Record<AnimationName, THREE.AnimationAction | null>;

    for (const [name, clip] of Object.entries(clips)) {
      if (clip) {
        const action = this.mixer.clipAction(clip);
        this.actions[name as AnimationName] = action;
      } else {
        this.actions[name as AnimationName] = null;
      }
    }

    if (this.actions.idle) {
      this.currentAction = this.actions.idle;
      this.currentAction.play();
    }
  }

  play(name: AnimationName): void {
    if (name === this.currentName) return;
    const nextAction = this.actions[name];
    if (!nextAction) return;

    nextAction.reset();
    nextAction.play();
    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, CROSSFADE_DURATION, true);
    }
    this.currentAction = nextAction;
    this.currentName = name;
  }

  playForState(state: AgentState): void {
    const animName = getAnimationForState(state);
    this.play(animName);
  }

  update(delta: number): void {
    this.mixer.update(delta);
  }

  dispose(): void {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.mixer.getRoot());
  }
}
