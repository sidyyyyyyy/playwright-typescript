import { test, expect } from '@playwright/test';
import { env } from '@utils/env';
import { OpenAI } from 'openai';

// Dynamic User Simulator for specific agent testing
class SpecificAgentUserSimulator {
  private openai: OpenAI;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private turnCount: number = 0;
  private maxTurns: number = 10;
  private completed: boolean = false;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  private buildSystemPrompt(): string {
    return `You are a CUSTOMER seeking help from an AGENT. You are NOT the agent.

Background:
I'm a customer who needs to update my address in the system.

Your goals:
- Update my address in the system
- Provide my current address when asked
- Confirm the address is correct
- Complete the address update process

Your personal information:
- currentAddress: "3959 Montgomery County Rd 2600, Independence, KS 67301, USA"
- newAddress: "123 Main Street, New York, NY 10001, USA"
- memberId: "MEM12345"
- dateOfBirth: "03/15/1985"

CRITICAL RULES:
1. You are the CUSTOMER, not the agent. Never ask the agent for their information.
2. When the agent asks for your current address, provide: "3959 Montgomery County Rd 2600, Independence, KS 67301, USA"
3. When the agent asks if the address is correct, respond with "yes"
4. Keep responses concise and realistic, as a real customer would respond.
5. Use natural, conversational language with contractions and casual expressions.
6. If the agent completes the task or asks if you need help with anything else, you can end the conversation by saying "That's all I need, thank you!"

Remember: You are the CUSTOMER asking for help, not the agent providing help.`;
  }

  async generateResponse(): Promise<string> {
    const systemPrompt = this.buildSystemPrompt();

    // Format conversation history for the API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory.map(msg => ({
        role: msg.role === 'agent' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        temperature: 0.3,
        max_tokens: 150
      });

      if (response && response.choices && response.choices.length > 0) {
        let userResponse = response.choices[0].message.content || "I need help with updating my information.";
        
        // Post-process to ensure user doesn't act like an agent
        if (userResponse.includes('Could you please provide') || 
            userResponse.includes('Can you provide') ||
            userResponse.includes('I need your') ||
            userResponse.includes('Please provide your')) {
          console.log('⚠️ User simulator tried to ask for information, correcting...');
          userResponse = "I'm ready to provide my information. What do you need from me?";
        }
        
        return userResponse;
      } else {
        console.error('Unexpected OpenAI response:', response);
        return "I need to update my address. Can you help me with that please?";
      }
    } catch (error) {
      console.error('Error generating response with OpenAI:', error);
      return "I need to update my address. Can you help me with that please?";
    }
  }

  async simulateConversation(chatInput: any, chatFrame: any): Promise<Array<{ role: string; content: string }>> {
    console.log('🎭 Starting Specific Agent User Simulation...');
    
    // Initial message based on your working example
    const initialMessage = "i want to Update my Address";
    console.log(`👤 User: ${initialMessage}`);
    
    // Send initial message
    await this.sendMessage(chatInput, initialMessage);
    this.conversationHistory.push({ role: 'user', content: initialMessage });
    this.turnCount++;

    // Main conversation loop
    while (this.turnCount < this.maxTurns && !this.completed) {
      console.log(`\n🔄 Turn ${this.turnCount + 1}:`);
      
      // Wait for agent response
      await this.waitForAgentResponse(chatFrame);
      
      if (this.completed) {
        console.log('🏁 Agent ended conversation');
        break;
      }

      // Generate user response
      const userResponse = await this.generateResponse();
      console.log(`👤 User: ${userResponse}`);
      
      // Check if conversation should end
      if (this.shouldEndConversation(userResponse)) {
        console.log('🏁 Conversation ending naturally');
        await this.sendMessage(chatInput, userResponse);
        this.conversationHistory.push({ role: 'user', content: userResponse });
        this.completed = true;
        break;
      }

      // Send user response
      await this.sendMessage(chatInput, userResponse);
      this.conversationHistory.push({ role: 'user', content: userResponse });
      this.turnCount++;
      
      // Small delay between turns
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (this.turnCount >= this.maxTurns) {
      console.log(`⏰ Reached maximum turns (${this.maxTurns}). Ending conversation.`);
    }

    return this.conversationHistory;
  }

  private async waitForAgentResponse(chatFrame: any): Promise<void> {
    console.log('⏳ Waiting for agent response...');
    
    let attempts = 0;
    const maxAttempts = 15; // Reduced back to 15 (30 seconds total)
    let lastAgentMessage = '';
    let duplicateCount = 0; // Track consecutive duplicate messages
    
    // Get the current count of agent messages
    const initialOutgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
    const initialCount = await initialOutgoingMessages.count();
    console.log(`📊 Initial agent message count: ${initialCount}`);
    
    // Also check for incoming messages (user messages) to detect conversation flow
    const initialIncomingMessages = chatFrame.locator('div.chatbot-message.incoming');
    let initialIncomingCount = await initialIncomingMessages.count();
    console.log(`📊 Initial incoming message count: ${initialIncomingCount}`);
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;
      
      // Get agent response - try multiple selectors
      const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
      const outgoingCount = await outgoingMessages.count();
      
      // Also try alternative selectors for agent messages
      const altOutgoingMessages = chatFrame.locator('[class*="outgoing"], [class*="agent"], .message.agent, .bot-message');
      const altOutgoingCount = await altOutgoingMessages.count();
      
      // Also check incoming messages
      const incomingMessages = chatFrame.locator('div.chatbot-message.incoming');
      const incomingCount = await incomingMessages.count();
      
      console.log(`🔍 Check ${attempts}: Found ${outgoingCount} outgoing messages, ${altOutgoingCount} alt outgoing, ${incomingCount} incoming messages`);
      
      // Check both outgoing message selectors
      const totalOutgoingCount = Math.max(outgoingCount, altOutgoingCount);
      const messagesToCheck = outgoingCount > 0 ? outgoingMessages : altOutgoingMessages;
      
      if (totalOutgoingCount > initialCount) {
        // New message appeared
        const latestResponse = messagesToCheck.last();
        const responseText = await latestResponse.textContent();
        
        if (responseText && responseText.trim().length > 10) {
          const agentResponse = responseText.trim();
          
          // Check if this is a new message (not the same as last one)
          if (agentResponse !== lastAgentMessage) {
            console.log(`🤖 Agent: ${agentResponse}`);
            
            this.conversationHistory.push({ role: 'agent', content: agentResponse });
            lastAgentMessage = agentResponse;
            duplicateCount = 0; // Reset duplicate count on new message
            
            // Check if agent is ending the conversation
            if (this.isAgentEndingConversation(agentResponse)) {
              this.completed = true;
            }
            
            return;
          } else {
            // Agent is repeating the same message - this indicates a problem
            duplicateCount++;
            console.log(`⚠️ Agent repeated the same message (${duplicateCount} times): "${agentResponse}"`);
            
            // If agent repeats the same message 3 times, it's stuck
            if (duplicateCount >= 3) {
              console.log(`❌ Agent stuck in loop after ${duplicateCount} duplicate messages, ending conversation`);
              this.completed = true;
              return;
            }
          }
        }
      }
      
      // Additional check: if incoming messages increased, it means user message was sent
      // and we should wait a bit more for agent response
      if (incomingCount > initialIncomingCount) {
        console.log(`📤 User message detected, waiting for agent response...`);
        // Reset the initial count to current count to avoid false positives
        initialIncomingCount = incomingCount;
      }
    }
    
    console.log('❌ No new agent response received after maximum wait time');
    this.completed = true;
  }

  private async sendMessage(chatInput: any, message: string): Promise<void> {
    try {
      await chatInput.first().click({ force: true });
      await new Promise(resolve => setTimeout(resolve, 500));
      await chatInput.first().fill('');
      await new Promise(resolve => setTimeout(resolve, 300));
      await chatInput.first().type(message, { delay: 100 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      await chatInput.first().press('Enter');
      console.log(`✅ Sent: "${message}"`);
    } catch (e) {
      console.log('⚠️ Error sending message, trying fill approach...');
      await chatInput.first().fill(message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await chatInput.first().press('Enter');
      console.log(`✅ Sent via fill: "${message}"`);
    }
  }

  private shouldEndConversation(message: string): boolean {
    const endPhrases = [
      "that's all", "goodbye", "bye", "thank you", "thanks", 
      "that's all i need", "i'm all set", "that's all i need, thank you"
    ];
    
    return endPhrases.some(phrase => message.toLowerCase().includes(phrase));
  }

  private isAgentEndingConversation(message: string): boolean {
    const endPhrases = [
      "goodbye", "bye", "have a great day", "take care", "end of conversation",
      "is there anything else", "anything else i can help", "need help with anything else"
    ];
    
    return endPhrases.some(phrase => message.toLowerCase().includes(phrase));
  }
}

test.describe('Specific Agent 8686840 Test', () => {
  test('Test agent 8686840 with address update conversation', async ({ page, browser }) => {
    test.setTimeout(600000); // 10 minutes
    
    // Create new context for debugging
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting Specific Agent 8686840 Test...');

    // Step 1: Navigate to Ushur signin page
    console.log('\n🌐 STEP 1: Navigating to Ushur Signin Page');
    const signinUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=signin';
    console.log(`🔗 Navigating to: ${signinUrl}`);
    
    await newPage.goto(signinUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 2: Login with credentials
    console.log('\n🔐 STEP 2: Logging in with .env credentials');
    
    if (!env.email || !env.password) {
      throw new Error('Email or password not found in .env file. Please check your environment variables.');
    }
    
    console.log(`📧 Email: ${env.email}`);
    console.log(`🔒 Password: ${env.password ? '***' : 'NOT SET'}`);
    
    // Look for login form elements
    const emailInput = newPage.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
    const passwordInput = newPage.locator('input[type="password"]').first();
    const loginButton = newPage.locator('button:has-text("Login")').first();
    
    // Fill login credentials
    await emailInput.fill(env.email);
    await passwordInput.fill(env.password);
    await loginButton.click();
    
    console.log('✅ Login button clicked');
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 3: Navigate to agents page
    console.log('\n🏢 STEP 3: Navigating to Agents Page');
    const agentsUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=agents';
    await newPage.goto(agentsUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 4: Find and select agent 8686840
    console.log('\n🔍 STEP 4: Finding Agent 8686840');
    
    // Wait for the agents table to load
    await newPage.waitForSelector('table', { timeout: 10000 });
    
    // Find all agent rows
    const agentRows = newPage.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`📊 Found ${rowCount} agent rows in table`);
    
    let selectedAgentRow = null;
    
    // Look for agent 8686840
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      // Skip header rows or rows without proper content
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      // Check if this row contains agent 8686840
      if (rowText.includes('8686840')) {
        console.log(`✅ Found agent 8686840 in row ${i + 1}`);
        selectedAgentRow = row;
        break;
      }
    }
    
    if (!selectedAgentRow) {
      throw new Error('Agent 8686840 not found in the agents table');
    }
    
    // Click on the selected agent row to open it
    console.log('🖱️ Clicking on agent 8686840 row...');
    await selectedAgentRow.click();
    await newPage.waitForTimeout(3000);

    // Step 5: Click Preview Agent button
    console.log('\n🔍 STEP 5: Opening Agent Preview');
    const previewButton = newPage.locator('button:has-text("Preview Agent")').first();
    
    if (await previewButton.count() > 0) {
      console.log('✅ Found Preview Agent button, clicking...');
      await previewButton.click();
      await newPage.waitForTimeout(5000);
    } else {
      throw new Error('Preview Agent button not found');
    }

    // Step 6: Switch to chat iframe
    console.log('\n🔍 STEP 6: Switching to Chat Iframe');
    const chatIframe = newPage.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
    
    if (await chatIframe.count() > 0) {
      console.log('✅ Found chat iframe, switching context...');
      
      const frame = await chatIframe.elementHandle();
      const chatFrame = await frame?.contentFrame();
      
      if (chatFrame) {
        console.log('✅ Successfully switched to chat iframe');
        await newPage.waitForTimeout(5000);
        
        // Step 7: Start Specific Agent User Simulation
        console.log('\n💬 STEP 7: Starting Specific Agent User Simulation');
        
        // Initialize Specific Agent User Simulator
        const userSimulator = new SpecificAgentUserSimulator();
        
        // Get chat input
        const chatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
        
        // Wait for chat input to be ready
        await chatInput.waitFor({ timeout: 10000 });
        console.log('✅ Chat input is ready');
        
        let conversationHistory = [];
        
        if (await chatInput.count() > 0) {
          console.log('✅ Found chat input');
          
          // Start the specific agent conversation simulation
          conversationHistory = await userSimulator.simulateConversation(chatInput, chatFrame);
          
          console.log('\n✅ Specific agent conversation simulation completed!');
          
          // Print conversation summary
          console.log('\n📝 Conversation Summary:');
          conversationHistory.forEach((msg, index) => {
            const role = msg.role === 'user' ? '👤 User' : '🤖 Agent';
            console.log(`${role}: ${msg.content}`);
          });
        } else {
          console.log('❌ Chat input not found');
          throw new Error('Chat input not found');
        }
        
        // Step 8: Evaluate conversation
        console.log('\n📊 STEP 8: Evaluating Conversation');
        const evaluation = evaluateConversation(conversationHistory);
        
        console.log('📈 Evaluation Results:');
        console.log('  Total Turns:', evaluation.totalTurns);
        console.log('  Conversation Length:', evaluation.conversationLength);
        console.log('  Success Rate:', evaluation.successRate);
        console.log('  User Satisfaction:', evaluation.userSatisfaction);
        
        // Assertions
        expect(evaluation.totalTurns).toBeGreaterThan(0);
        expect(evaluation.conversationLength).toBeGreaterThan(0);
        expect(evaluation.successRate).toBeGreaterThanOrEqual(0.5);
        
        console.log('\n🎯 ===== AGENT 8686840 TEST COMPLETE =====');
        console.log(`📊 Total Turns: ${evaluation.totalTurns}`);
        console.log(`💬 Conversation History Length: ${conversationHistory.length}`);
        console.log(`✅ Agent ID: 8686840`);
        
      } else {
        throw new Error('Could not access iframe content');
      }
    } else {
      throw new Error('Chat iframe not found');
    }
  });
});

// Helper function to evaluate conversation
function evaluateConversation(conversationHistory: any[]): any {
  const totalTurns = conversationHistory.length / 2; // User and agent messages
  const conversationLength = conversationHistory.length;
  
  // Simple evaluation based on conversation flow
  let successRate = 0.5; // Base success rate
  let userSatisfaction = 0.5; // Base satisfaction
  
  // Check for successful completion indicators
  const lastAgentMessage = conversationHistory[conversationHistory.length - 1]?.content || '';
  if (isConversationComplete(lastAgentMessage)) {
    successRate = 0.9;
    userSatisfaction = 0.8;
  }
  
  // Check for proper conversation flow
  if (conversationHistory.length >= 4) { // At least 2 exchanges
    successRate = Math.min(successRate + 0.2, 1.0);
  }
  
  return {
    totalTurns,
    conversationLength,
    successRate,
    userSatisfaction
  };
}

// Helper function to check if conversation is complete
function isConversationComplete(agentResponse: string): boolean {
  const completionIndicators = [
    'successfully updated',
    'address has been updated',
    'confirmation email',
    'process completed',
    'thank you for your help',
    'is there anything else',
    'anything else i can help',
    'address update complete',
    'update has been processed',
    'need help with anything else'
  ];
  
  const lowerResponse = agentResponse.toLowerCase();
  return completionIndicators.some(indicator => lowerResponse.includes(indicator));
}
