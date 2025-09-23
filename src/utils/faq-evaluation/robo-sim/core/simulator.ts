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
    console.log(`🔍 GateSensitive Debug:`);
    console.log(`   Agent message: "${lastAgent}"`);
    console.log(`   User response: "${userText}"`);
    
    const NEEDLES = {
      'member id': /\b(member\s*id|member\s*number|your\s*id|id\s*number|id|member\s*number)\b/i,
      'date of birth': /\b(dob|date\s*of\s*birth|birthday|birth\s*date|your\s*dob|birth)\b/i,
      'current address': /\b(current\s*address|your\s*current\s*address|where\s*do\s*you\s*live|residential\s*address|home\s*address|what\s*is\s*your\s*address|confirm\s*your\s*address|address|your\s*address|current\s*residence|home\s*address|where\s*you\s*live)\b/i,
      'new address': /\b(new\s*address|updated\s*address|change\s*address|what\s*is\s*your\s*new\s*address|address\s*to\s*update|new\s*residence|updated\s*residence)\b/i,
      'phone number': /\b(phone\s*number|contact\s*number|telephone|your\s*phone|phone)\b/i,
      'email': /\b(email\s*address|e-mail|contact\s*email|your\s*email|email)\b/i
    };

    let gated = userText;
    let allowedKeys: string[] = [];
    
    // Debug: Check each pattern against the agent message
    console.log(`🔍 Pattern matching results:`);
    for (const [key, pattern] of Object.entries(NEEDLES)) {
      const matches = pattern.test(lastAgent);
      console.log(`   ${key}: ${matches ? '✅ MATCH' : '❌ NO MATCH'} (pattern: ${pattern})`);
      
      if (matches) {
        allowedKeys.push(key);
        console.log(`✅ Agent asked for ${key}, allowing response to include this information`);
      } else {
        // Redact if model hallucinated sensitive field unprompted
        const val = this.info[key];
        if (val && userText.includes(val)) {
          console.log(`🚫 Redacting ${key} because agent didn't explicitly ask for it`);
          gated = gated.replace(val, '[redacted]');
        }
      }
    }
    
    console.log(`📋 Allowed keys: ${allowedKeys.join(', ')}`);
    console.log(`📤 Final gated response: "${gated}"`);
    
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
    // Removed gateSensitive - return user message directly
    this.mem.append('user', userMessage);
    return userMessage;
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
        // Removed gateSensitive - use reply directly
        this.mem.append('user', reply);
        
        await this.adapter.sendUserMessage(reply);
        turns += 1;
        
        if (shouldStopConversation(reply, this.goodbye)) {
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
