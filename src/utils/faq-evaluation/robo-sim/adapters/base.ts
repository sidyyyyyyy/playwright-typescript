export abstract class BaseChatAdapter {
  abstract init(): Promise<void>;
  abstract sendUserMessage(content: string): Promise<void>;
  abstract recvAgentMessage(): Promise<string>;
  abstract close(): Promise<void>;
}

