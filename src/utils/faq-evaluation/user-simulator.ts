import { Page, Locator } from '@playwright/test';

export class UserSimulator {
  private agentId: string;
  private persona: any;
  private maxTurns: number;
  private showOutput: boolean;
  private conversationHistory: Array<{ role: string; content: string }>;
  private turnCount: number;
  private goodbyePhrase: string;
  private page: Page;
  private chatIframe: Locator | null;
  private chatInput: Locator | null;

  constructor(
    agentId: string, 
    persona: any, 
    page: Page, 
    chatIframe: Locator | null, 
    maxTurns: number = 10, 
    showOutput: boolean = true
  ) {
    this.agentId = agentId;
    this.persona = persona;
    this.page = page;
    this.chatIframe = chatIframe;
    this.maxTurns = maxTurns;
    this.showOutput = showOutput;
    this.conversationHistory = [];
    this.turnCount = 0;
    this.goodbyePhrase = this.persona.goodbye_phrase || "Thank you for your help!";
  }

  private buildSystemPrompt(): string {
    return `You are simulating a user interaction with a healthcare agent. 
    Your persona: ${JSON.stringify(this.persona)}
    
    Respond naturally and authentically based on the conversation context.
    Use the exact values from your persona when providing information.
    Keep responses conversational and realistic.`;
  }

  private async generateResponse(conversationHistory: Array<{ role: string; content: string }>): Promise<string> {
    const lastAgentMessage = conversationHistory[conversationHistory.length - 1]?.content || "";
    const response = lastAgentMessage.toLowerCase();

    console.log(`🔍 Debug: Agent message: "${lastAgentMessage}"`);
    console.log(`🔍 Debug: Turn count: ${this.turnCount}`);

    // Check if agent is asking for authentication
    if ((response.includes('member id') || response.includes('date of birth')) &&
        (response.includes('provide') || response.includes('please provide') || response.includes('need to verify') || 
         response.includes('can you provide') || response.includes('i need') || response.includes('please share'))) {
      console.log(`✅ Detected authentication request`);
      return `My member ID is ${this.persona.info['member id']} and my date of birth is ${this.persona.info['date of birth']}`;
    }

    // Check if agent is asking for confirmation (check this FIRST to avoid conflicts)
    if (response.includes('confirm') || response.includes('correct') ||
        response.includes('is this right') || response.includes('is this correct') ||
        response.includes('do you confirm') || response.includes('please confirm') ||
        response.includes('verify') || response.includes('proceed') ||
        response.includes('is that right') || response.includes('does this look right')) {
      console.log(`✅ Detected confirmation request`);
      return "Yes, that's correct. Please update my address.";
    }

    // Check if agent is asking for current address
    if (response.includes('current address') || response.includes('existing address') ||
        response.includes('what is your current') || response.includes('where do you live') ||
        response.includes('verify it in our system') || response.includes('know your current') ||
        response.includes('confirm your current') || response.includes('current location')) {
      console.log(`✅ Detected current address request`);
      return `My current address is 456 Old Street, Previous City, PC 54321`;
    }

    // Check if agent is asking for new address
    if (response.includes('new address') || response.includes('updated address') ||
        response.includes('what is your new') || response.includes('where would you like') ||
        response.includes('new location') || response.includes('updated location') ||
        response.includes('what should be your new')) {
      console.log(`✅ Detected new address request`);
      return `My new address is ${this.persona.info['new address']}`;
    }

    // Check if agent mentions processing time
    if (response.includes('processing') || response.includes('24-hour') || response.includes('time') ||
        response.includes('how long') || response.includes('when will')) {
      console.log(`✅ Detected processing time request`);
      return "Thank you! When will this be processed?";
    }

    // Check if agent says it can't help
    if (response.includes('unable') || response.includes('sorry') || response.includes('technical issue') ||
        response.includes('i cannot') || response.includes('i can\'t') || response.includes('not able')) {
      console.log(`✅ Detected technical issue`);
      return "I understand there might be technical issues. Can you please try again or connect me with a human agent?";
    }

    // Check if agent is greeting or asking how to help
    if (response.includes('hello') || response.includes('hi') || response.includes('how can i help') ||
        response.includes('what can i do') || response.includes('how may i assist')) {
      console.log(`✅ Detected greeting/help request`);
      return "Hi, I need to update my address in the system.";
    }

    // Check if all goals are accomplished
    if (this.turnCount >= 3 && (response.includes('updated') || response.includes('success') || response.includes('complete') ||
        response.includes('done') || response.includes('finished') || response.includes('processed'))) {
      console.log(`✅ Detected completion`);
      return this.goodbyePhrase;
    }

    // Default responses based on turn count and conversation state
    if (this.turnCount === 0) {
      console.log(`🔄 Using turn-based response for turn 0`);
      return "Hi, I need to update my address in the system.";
    } else if (this.turnCount === 1) {
      console.log(`🔄 Using turn-based response for turn 1`);
      return `My member ID is ${this.persona.info['member id']} and my date of birth is ${this.persona.info['date of birth']}`;
    } else if (this.turnCount === 2) {
      console.log(`🔄 Using turn-based response for turn 2`);
      return `My current address is 456 Old Street, Previous City, PC 54321`;
    } else if (this.turnCount === 3) {
      console.log(`🔄 Using turn-based response for turn 3`);
      return `My new address is ${this.persona.info['new address']}`;
    } else if (this.turnCount === 4) {
      console.log(`🔄 Using turn-based response for turn 4`);
      return "Yes, that's correct. Please update my address.";
    } else if (this.turnCount >= 5) {
      console.log(`🔄 Using turn-based response for turn 5+`);
      return this.goodbyePhrase;
    }

    console.log(`⚠️ Using fallback response`);
    return "I need to update my address.";
  }

  async simulateConversation(chatInput: Locator): Promise<Array<{ role: string; content: string }>> {
    console.log(`🤖 Starting Python-style User Simulation...`);
    console.log(`📋 Persona: A 22-year-old member who recently moved to a new apartment and needs to update their address in the system. They want to make sure their mail, especially any new membership cards or important documents, will reach them at the correct location.`);
    console.log(`🎯 Goals: Successfully authenticate with the system, Provide their new address information, Confirm the address update was processed`);
    console.log(`📊 Max Turns: ${this.maxTurns}`);

    while (this.turnCount < this.maxTurns) {
      console.log(`\n🔄 Turn ${this.turnCount + 1}:`);
      
      // Generate user response
      const userResponse = await this.generateResponse(this.conversationHistory);
      this.conversationHistory.push({ role: 'user', content: userResponse });
      
      console.log(`👤 User: ${userResponse}`);
      
      // Type the user response in the chat
      try {
        await chatInput.clear();
        await chatInput.fill(userResponse);
        await chatInput.press('Enter');
        
        // Wait a bit for the message to be sent
        await this.page.waitForTimeout(2000);
      } catch (error) {
        console.log(`❌ Error typing message: ${error}`);
        break;
      }
      
      // Wait for agent response
      console.log(`⏳ Waiting for agent response...`);
      await this.page.waitForTimeout(2000); // Reduced wait time for better performance
      
      // Get agent response
      const agentResponse = await this.getLatestAgentResponse();
      if (agentResponse) {
        this.conversationHistory.push({ role: 'assistant', content: agentResponse });
        console.log(`🤖 Agent: ${agentResponse}`);
      } else {
        console.log(`⚠️ No agent response received`);
        // Add empty agent response to maintain conversation flow
        this.conversationHistory.push({ role: 'assistant', content: '' });
      }
      
      this.turnCount++;
      
      // Check if conversation should end
      if (this.turnCount >= this.maxTurns) {
        console.log(`⚠️ Reached maximum turns (${this.maxTurns})`);
        break;
      }
    }

    return this.conversationHistory;
  }

  private async getLatestAgentResponse(): Promise<string> {
    try {
      // Look for agent messages in the chat iframe using the specific selector
      const chatIframe = this.page.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
      
      if (await chatIframe.count() > 0) {
        const frame = await chatIframe.elementHandle();
        const chatFrame = await frame?.contentFrame();
        
        if (chatFrame) {
          // Look for agent messages using multiple selectors
          const agentMessageSelectors = [
            '.agent-message',
            '.bot-message', 
            '.ushur-message',
            '.message.agent',
            '.message.bot',
            '[class*="agent"]',
            '[class*="bot"]',
            '.chat-message:not(.user-message)',
            '.message:not(.user-message)'
          ];
          
          let latestMessage = '';
          
          for (const selector of agentMessageSelectors) {
            const messages = await chatFrame.locator(selector).all();
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1];
              const messageText = await lastMessage.textContent();
              if (messageText && messageText.trim()) {
                latestMessage = messageText.trim();
                console.log(`✅ Found agent message with selector "${selector}": "${latestMessage}"`);
                break;
              }
            }
          }
          
          // If no specific agent message found, try to get any message that's not from user
          if (!latestMessage) {
            const allMessages = await chatFrame.locator('.message, .chat-message, [class*="message"]').all();
            if (allMessages.length > 0) {
              // Get the last message that's not from the user
              for (let i = allMessages.length - 1; i >= 0; i--) {
                const message = allMessages[i];
                const messageText = await message.textContent();
                const isUserMessage = await message.locator('.user-message, [class*="user"]').count() > 0;
                
                if (messageText && messageText.trim() && !isUserMessage) {
                  latestMessage = messageText.trim();
                  console.log(`✅ Found agent message (fallback): "${latestMessage}"`);
                  break;
                }
              }
            }
          }
          
          return latestMessage;
        }
      }
      
      return '';
    } catch (error) {
      console.log(`❌ Error getting agent response: ${error}`);
      return '';
    }
  }
}
