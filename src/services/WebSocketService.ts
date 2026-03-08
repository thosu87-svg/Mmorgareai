'use client';
/**
 * @fileOverview Client-side WebSocket service for real-time Ouroboros event synchronization.
 */

import { useStore } from '../store';

class WebSocketService {
  private ws: WebSocket | null = null;
  private intentionalClose = false;

  connect() {
    // Only attempt connection in browser environment
    if (typeof window === 'undefined') return;

    this.intentionalClose = false;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[OUROBOROS_CORE] Real-time link established.');
        useStore.getState().addLog('Neural WebSocket link established.', 'SYSTEM');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'PLAYER_MOVE') {
            useStore.setState(state => ({
              agents: state.agents.map(agent =>
                agent.id === message.payload.id
                  ? { ...agent, position: message.payload.position }
                  : agent
              )
            }));
          }

          if (message.type === 'SYSTEM_ALERT') {
            useStore.getState().addLog(message.payload.message, 'SYSTEM');
          }
        } catch (e) {
          console.error('[WS_PARSE_ERROR]', e);
        }
      };

      this.ws.onclose = () => {
        console.warn('[OUROBOROS_CORE] Real-time link severed.');
        if (!this.intentionalClose) {
          useStore.getState().addLog('Real-time connection lost. Attempting reconnection...', 'ERROR');
          setTimeout(() => this.connect(), 3000);
        }
        this.ws = null;
      };

      this.ws.onerror = (error) => {
        console.error('[WS_ERROR]', error);
        useStore.getState().addLog('Neural link protocol error.', 'ERROR');
      };
    } catch (err) {
      console.error('[WS_CONNECT_FAILED]', err);
    }
  }

  sendMessage(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      this.ws.send(message);
    } else {
      console.error('Ouroboros WebSocket is not connected.');
    }
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const webSocketService = new WebSocketService();
