'use client';

import { Memory, Relationship, Task, Interaction, SocialGroup } from './types';
import { interactionLogger, InteractionLog } from './interaction-logger';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export class Agent {
  id: string;
  name: string;
  memory: Memory[] = [];
  relationships: Map<string, Relationship> = new Map();
  tasks: Task[] = [];
  inventory: InventoryItem[] = [];
  needs: Record<string, number> = { hunger: 50, social: 50 };
  longTermGoals: string[] = [];
  groups: SocialGroup[] = [];
  trustDecayRate: number = 0.1;

  constructor(id: string, name: string, trustDecayRate: number = 0.1) {
    this.id = id;
    this.name = name;
    this.trustDecayRate = trustDecayRate;
  }

  // Inventory management
  addItem(item: InventoryItem) {
    const existing = this.inventory.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.inventory.push({ ...item });
    }
  }

  removeItem(itemId: string, quantity: number): boolean {
    const item = this.inventory.find(i => i.id === itemId);
    if (item && item.quantity >= quantity) {
      item.quantity -= quantity;
      if (item.quantity === 0) {
        this.inventory = this.inventory.filter(i => i.id !== itemId);
      }
      return true;
    }
    return false;
  }

  getInventoryQuantity(itemId: string): number {
    const item = this.inventory.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }

  // Trust decay logic
  decayTrust() {
    for (const [id, rel] of this.relationships) {
      rel.trust = Math.max(-100, rel.trust - this.trustDecayRate);
      this.relationships.set(id, rel);
    }
  }

  // Update trust level
  updateTrust(targetId: string, delta: number) {
    const rel = this.relationships.get(targetId) || { targetId, trust: 0, type: 'neutral' };
    rel.trust = Math.max(-100, Math.min(100, rel.trust + delta));
    this.relationships.set(targetId, rel);
  }

  // Task and Memory logic
  addMemory(event: string, trustDelta: number) {
    this.memory.push({ event, timestamp: Date.now(), trustDelta });
    if (this.memory.length > 50) this.memory.shift();
  }

  updateTasks() {
    this.tasks.forEach(task => {
      if (task.status === 'active') {
        // Logic to potentially complete tasks based on world state
        if (Math.random() > 0.95) {
          task.status = 'done';
          this.addMemory(`Completed task: ${task.goal}`, 10);
        }
      }
    });
  }

  // Learn from interaction logs
  learnFromLogs(logs: InteractionLog[]) {
    logs.forEach(log => {
      const rel = this.relationships.get(log.interaction.senderId);
      // If we trust the sender and it was a successful interaction
      if (rel && rel.trust > 20 && log.trustDelta > 0) {
        this.addMemory(`Learned from ${log.interaction.senderId}: ${log.interaction.type} was successful`, 1);
        // Heuristic adjustment: success reinforces behavior
        if (log.interaction.type === 'trade') {
          this.needs.hunger = Math.max(0, this.needs.hunger - 5);
        }
      }
    });
  }

  decideAction(allAgents: Agent[]): Interaction | null {
    // 1. Goal-driven behavior
    for (const goal of this.longTermGoals) {
      if (goal === 'gather_food' && this.needs.hunger > 40) {
        const targets = allAgents.filter(a => a.id !== this.id && a.getInventoryQuantity('food') > 0);
        targets.sort((a, b) => (this.relationships.get(b.id)?.trust || 0) - (this.relationships.get(a.id)?.trust || 0));
        const target = targets[0];
        if (target) {
          return { type: 'trade', senderId: this.id, receiverId: target.id, payload: { item: 'food', amount: 1 } };
        }
      }
    }

    // 2. Propose group formation if trust is high
    const potentialPartner = allAgents.find(a => a.id !== this.id && (this.relationships.get(a.id)?.trust || 0) > 80);
    if (potentialPartner) {
        return {
            type: 'proposeGroup',
            senderId: this.id,
            receiverId: potentialPartner.id,
            payload: { groupName: `${this.name}'s Guild`, type: 'guild' }
        };
    }

    // 3. Socialize based on memory
    const positiveInteractions = this.memory.filter(m => m.trustDelta > 0);
    if (positiveInteractions.length > 0 || Math.random() > 0.7) {
        // Seek out someone randomly or from memory
        const target = allAgents[Math.floor(Math.random() * allAgents.length)];
        if (target && target.id !== this.id) {
            return {
                type: 'talk',
                senderId: this.id,
                receiverId: target.id,
                payload: { message: "The Spire rises today, doesn't it?" }
            };
        }
    }
    return null;
  }

  handleInteraction(interaction: Interaction): string {
    switch (interaction.type) {
      case 'talk':
        this.updateTrust(interaction.senderId, 2); // Talking improves trust
        this.addMemory(`Talked to ${interaction.senderId}`, 2);
        interactionLogger.log(interaction, 2);
        return this.handleTalk(interaction);
      case 'trade':
        return this.handleTrade(interaction);
      case 'proposeGroup':
        this.updateTrust(interaction.senderId, 10);
        this.addMemory(`Accepted group proposal from ${interaction.senderId}`, 10);
        interactionLogger.log(interaction, 10);
        return `${this.name} joined ${interaction.payload.groupName}.`;
      default:
        return "I don't understand that interaction.";
    }
  }

  private handleTalk(interaction: Interaction): string {
    const rel = this.relationships.get(interaction.senderId) || { targetId: interaction.senderId, trust: 0, type: 'neutral' as const };
    const tone = rel.trust > 50 ? "warm" : rel.trust < -50 ? "kalt" : "neutral";
    return `[${tone}] ${this.name} says: ${interaction.payload.message}`;
  }

  private handleTrade(interaction: Interaction): string {
    const { item, amount } = interaction.payload;
    if (this.removeItem(item, amount)) {
      this.updateTrust(interaction.senderId, 5); // Trading improves trust
      this.addMemory(`Traded ${item} to ${interaction.senderId}`, 5);
      interactionLogger.log(interaction, 5);
      return `${this.name} traded ${amount} ${item} to ${interaction.senderId}.`;
    }
    this.updateTrust(interaction.senderId, -5); // Failed trade hurts trust
    interactionLogger.log(interaction, -5);
    return `${this.name} does not have enough ${item}.`;
  }

  // Group management
  joinGroup(group: SocialGroup) {
    if (!this.groups.find(g => g.id === group.id)) {
      this.groups.push(group);
      this.addMemory(`Ist der Gruppe beigetreten: ${group.name}`, 5);
    }
  }

  leaveGroup(groupId: string) {
    this.groups = this.groups.filter(g => g.id !== groupId);
    this.addMemory(`Hat die Gruppe verlassen: ${groupId}`, -5);
  }
}
