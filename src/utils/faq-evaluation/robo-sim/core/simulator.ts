import { ChatOpenAI } from '@langchain/openai';
import { Persona, ConversationMessage, SimulationConfig } from './schema';
import { BaseChatAdapter } from '../adapters/base';
import { buildSystemPrompt } from './prompt';
import { isRetryableError, shouldStopConversation } from './policies';
import { MemoryStore } from './store';

export class RoboSimulator {
  private persona: Persona;
  private adapter: BaseChatAdapter;
  private model: string;
  private temperature: number;
  private maxTurns: number;
  private seed?: number;
  private mem: MemoryStore;
  private goodbye: string;
  private info: Record<string, string>;
  private systemPrompt: string;
  private llm: ChatOpenAI;

  constructor(
    persona: Persona,
    adapter: BaseChatAdapter,
    config: SimulationConfig = {}
  ) {
    this.persona = persona;
    this.adapter = adapter;
    this.model = config.model || 'gpt-4o-mini';
    this.temperature = config.temperature || 0.7;
    this.maxTurns = config.maxTurns || 20;
    this.seed = config.seed;
    this.mem = new MemoryStore();
    this.goodbye = persona.goodbye_phrase || 'Thank you for your help!';
    this.info = { ...persona.info };
    this.systemPrompt = buildSystemPrompt(persona);
    
    this.llm = new ChatOpenAI({
      modelName: this.model,
      temperature: this.temperature,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
  }

  private gateSensitive(userText: string, lastAgent: string): string {
    const NEEDLES = {
      'member id': /\b(member\s*id|id)\b/i,
      'date of birth': /\b(dob|date\s*of\s*birth|birthday)\b/i,
      'address': /\b(address|where\s*do\s*you\s*live|residential)\b/i
    };

    let gated = userText;
    
    for (const [key, pattern] of Object.entries(NEEDLES)) {
      if (pattern.test(lastAgent)) {
        // Allowed to include this key
        continue;
      } else {
        // Redact if model hallucinated sensitive field unprompted
        const val = this.info[key];
        if (val && userText.includes(val)) {
          gated = gated.replace(val, '[redacted]');
        }
      }
    }
    
    return gated;
  }

  private async llmReply(history: ConversationMessage[]): Promise<string> {
    const messages = [
      { role: 'system' as const, content: this.systemPrompt },
      ...history.map(msg => {
        // Convert 'agent' role to 'user' and 'user' role to 'assistant' for LangChain
        const role = msg.role === 'agent' ? 'user' : 'assistant';
        return { role: role as 'user' | 'assistant', content: msg.content };
      })
    ];

    try {
      const response = await this.llm.invoke(messages);
      return response.content as string;
    } catch (error) {
      console.error('LLM Error:', error);
      return 'Could you help me update my details?';
    }
  }

  async runOnce(agentMessage: string): Promise<string> {
    this.mem.append('agent', agentMessage);
    const userMessage = await this.llmReply(this.mem.history);
    const gatedMessage = this.gateSensitive(userMessage, agentMessage);
    this.mem.append('user', gatedMessage);
    return gatedMessage;
  }

  async loop(): Promise<ConversationMessage[]> {
    await this.adapter.init();
    let turns = 0;
    
    try {
      while (turns < this.maxTurns) {
        const agentMsg = await this.adapter.recvAgentMessage();
        
        if (isRetryableError(agentMsg)) {
          this.mem.retries += 1;
          if (this.mem.retries >= 3) {
            this.mem.append('user', '[FAIL_SESSION] Agent failed after 3 attempts');
            break;
          }
          
          // Resend last user message
          const lastUserMsg = this.mem.getLastUserMessage();
          const reply = lastUserMsg?.content || 'Could you try again?';
          await this.adapter.sendUserMessage(reply);
          continue;
        }
        
        this.mem.retries = 0;
        this.mem.append('agent', agentMsg);
        
        const reply = await this.llmReply(this.mem.history);
        const gatedReply = this.gateSensitive(reply, agentMsg);
        this.mem.append('user', gatedReply);
        
        await this.adapter.sendUserMessage(gatedReply);
        turns += 1;
        
        if (shouldStopConversation(gatedReply, this.goodbye)) {
          break;
        }
      }
    } finally {
      await this.adapter.close();
    }
    
    return this.mem.history;
  }

  getHistory(): ConversationMessage[] {
    return this.mem.history;
  }

  getTurnCount(): number {
    return this.mem.getTurnCount();
  }

  getRetryCount(): number {
    return this.mem.retries;
  }
}
