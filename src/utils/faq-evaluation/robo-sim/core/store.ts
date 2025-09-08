import { ConversationMessage } from './schema';

export class MemoryStore {
  public history: ConversationMessage[] = [];
  public turn: number = 0;
  public retries: number = 0;

  append(role: 'user' | 'agent' | 'system', content: string): void {
    this.history.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    
    if (role === 'agent') {
      this.turn += 1;
    }
  }

  getLastMessage(): ConversationMessage | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  getLastUserMessage(): ConversationMessage | null {
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].role === 'user') {
        return this.history[i];
      }
    }
    return null;
  }

  getLastAgentMessage(): ConversationMessage | null {
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].role === 'agent') {
        return this.history[i];
      }
    }
    return null;
  }

  clear(): void {
    this.history = [];
    this.turn = 0;
    this.retries = 0;
  }

  getConversationLength(): number {
    return this.history.length;
  }

  getTurnCount(): number {
    return this.turn;
  }
}

