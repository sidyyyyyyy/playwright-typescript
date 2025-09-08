import { BaseChatAdapter } from './base';

export class FunctionAdapter extends BaseChatAdapter {
  private onSend?: (content: string) => void;
  private onRecv?: () => string;
  private currentAgentMessage: string = '';

  constructor(onSend?: (content: string) => void, onRecv?: () => string) {
    super();
    this.onSend = onSend;
    this.onRecv = onRecv;
  }

  setAgentMessage(message: string): void {
    this.currentAgentMessage = message;
  }

  async init(): Promise<void> {
    // No initialization needed for function adapter
  }

  async sendUserMessage(content: string): Promise<void> {
    if (this.onSend) {
      this.onSend(content);
    }
  }

  async recvAgentMessage(): Promise<string> {
    if (this.onRecv) {
      return this.onRecv();
    }
    return this.currentAgentMessage;
  }

  async close(): Promise<void> {
    // No cleanup needed for function adapter
  }
}

