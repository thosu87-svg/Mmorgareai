/**
 * @fileOverview Axiom Frontier - Sound Management Service
 * Manages spatial audio and synthesized sound effects using the Web Audio API.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;

  constructor() {
    // SSR Check
    if (typeof window === 'undefined') return;

    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gain = this.ctx.createGain();
      this.gain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("AudioContext not supported in this environment.");
    }
  }

  /**
   * Synthesizes a tone using an oscillator.
   */
  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.ctx || !this.gain) return;
    
    const osc = this.ctx.createOscillator();
    const envelope = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    envelope.gain.setValueAtTime(vol, this.ctx.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(envelope);
    envelope.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /**
   * Triggers audio for UI interactions.
   */
  public playUI(type: 'HOVER' | 'CLICK' | 'ERROR') {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    switch (type) {
      case 'HOVER': 
        this.playTone(400, 'sine', 0.05, 0.02); 
        break;
      case 'CLICK': 
        this.playTone(600, 'triangle', 0.1, 0.05); 
        break;
      case 'ERROR': 
        this.playTone(150, 'sawtooth', 0.2, 0.1); 
        break;
    }
  }

  /**
   * Triggers audio for combat simulation events.
   */
  public playCombat(type: 'SWING' | 'HIT' | 'MAGIC') {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    switch (type) {
      case 'SWING': 
        this.playTone(100 + Math.random() * 50, 'sine', 0.15, 0.05); 
        break;
      case 'HIT': 
        this.playTone(80, 'square', 0.1, 0.1); 
        break;
      case 'MAGIC': 
        this.playTone(800 + Math.random() * 200, 'sine', 0.5, 0.05); 
        break;
    }
  }
}

export const soundManager = new SoundManager();
