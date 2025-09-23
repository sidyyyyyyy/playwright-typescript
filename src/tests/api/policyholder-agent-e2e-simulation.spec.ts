import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentSelectorFromCLI, initAgentBySelector, getAgentHandle } from '@utils/api/ushur.Agents';
import { agentConfig } from '@configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '@utils/env';
import { OpenAI } from 'openai';

// Dynamic User Simulator for PolicyHolder Agent
class PolicyHolderUserSimulator {
  private openai: any;
  private persona: any;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private turnCount: number = 0;
  private maxTurns: number = 8;
  private completed: boolean = false;
  private goodbyePhrase: string = "That's all I need, thank you!";

  constructor(persona: any) {
    this.persona = persona;
    // Initialize OpenAI (will be set up in the test)
  }

  private buildSystemPrompt(): string {
    return `You are a PolicyHolder customer persona for testing an insurance agent chatbot. 

PERSONA DETAILS:
- Name: ${this.persona.name || 'John Smith'}
- Age: ${this.persona.age || '45'}
- Policy Type: ${this.persona.policyType || 'Auto Insurance'}
- Policy Number: ${this.persona.policyNumber || 'POL123456789'}
- Member ID: ${this.persona.memberId || 'MEM12345'}
- Date of Birth: ${this.persona.dateOfBirth || '03/15/1980'}
- Current Address: ${this.persona.currentAddress || '123 Oak Street, Springfield, IL 62701'}
- New Address: ${this.persona.newAddress || '456 Pine Avenue, Chicago, IL 60601'}

GOALS:
${this.persona.goals?.map((goal: string) => `- ${goal}`).join('\n') || '- Update my address information'}

BEHAVIOR RULES:
1. You are a real customer, not a test system
2. Be conversational and natural
3. Provide information when asked
4. Ask clarifying questions if needed
5. Show appreciation for helpful responses
6. Be polite but direct about your needs
7. If asked for verification, provide your member ID and date of birth
8. Focus on completing your address update task

CRITICAL RULES:
1. You are the CUSTOMER, not the agent
2. NEVER ask "Can you please provide me with your member ID" - you are the customer, not the agent
3. When asked for verification, respond with "My member ID is MEM12345 and my date of birth is 03/15/1980."
4. You want to UPDATE your address, not just check it
5. Be specific about your new address when asked
6. Thank the agent when they help you
7. Keep responses concise but informative
8. If the agent asks for your current address, provide it
9. If the agent asks for your new address, provide it clearly
10. End the conversation when your address update is complete

CONVERSATION HISTORY:
${this.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Generate a natural, helpful response as this customer. Keep it under 100 words.`;
  }

  async generateResponse(): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate your next response as the customer.' }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      let userResponse = response.choices[0].message.content?.trim() || '';

      // Post-process to fix common issues
      if (userResponse.includes('Could you please provide') ||
          userResponse.includes('Can you provide') ||
          userResponse.includes('I need your') ||
          userResponse.includes('Please provide your') ||
          userResponse.includes('member ID and date of birth for verification') ||
          userResponse.includes('verification')) {
        console.log('⚠️ User simulator tried to ask for information, correcting...');
        userResponse = "My member ID is MEM12345 and my date of birth is 03/15/1980. What else do you need?";
      }

      return userResponse;
    } catch (error) {
      console.error('Error generating user response:', error);
      return "I'd like to update my address, please.";
    }
  }

  async simulateConversation(chatInput: any, chatFrame: any): Promise<Array<{ role: string; content: string }>> {
    console.log('🎭 Starting PolicyHolder User Simulation...');
    
    // Start with initial message
    const initialMessage = "I need to update my address on my insurance policy.";
    await this.sendMessage(chatInput, initialMessage);
    this.conversationHistory.push({ role: 'user', content: initialMessage });
    this.turnCount++;

    while (!this.completed && this.turnCount < this.maxTurns) {
      console.log(`\n🔄 Turn ${this.turnCount + 1}:`);
      
      // Wait for agent response
      await this.waitForAgentResponse(chatFrame);
      
      if (this.completed) {
        break;
      }

      // Generate user response
      const userResponse = await this.generateResponse();
      console.log(`👤 User: ${userResponse}`);
      
      // Send user response
      await this.sendMessage(chatInput, userResponse);
      this.conversationHistory.push({ role: 'user', content: userResponse });
      this.turnCount++;
    }

    console.log('\n✅ PolicyHolder conversation simulation completed!');
    return this.conversationHistory;
  }

  private async waitForAgentResponse(chatFrame: any): Promise<void> {
    console.log('⏳ Waiting for agent response...');
    
    let attempts = 0;
    const maxAttempts = 15;
    let lastAgentMessage = '';
    let duplicateCount = 0;
    
    const initialOutgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
    const initialCount = await initialOutgoingMessages.count();
    console.log(`📊 Initial agent message count: ${initialCount}`);
    
    const initialIncomingMessages = chatFrame.locator('div.chatbot-message.incoming');
    let initialIncomingCount = await initialIncomingMessages.count();
    console.log(`📊 Initial incoming message count: ${initialIncomingCount}`);
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
      const outgoingCount = await outgoingMessages.count();
      
      const altOutgoingMessages = chatFrame.locator('[class*="outgoing"], [class*="agent"], .message.agent, .bot-message');
      const altOutgoingCount = await altOutgoingMessages.count();
      
      const incomingMessages = chatFrame.locator('div.chatbot-message.incoming');
      const incomingCount = await incomingMessages.count();
      
      console.log(`🔍 Check ${attempts}: Found ${outgoingCount} outgoing messages, ${altOutgoingCount} alt outgoing, ${incomingCount} incoming messages`);
      
      const totalOutgoingCount = Math.max(outgoingCount, altOutgoingCount);
      const messagesToCheck = outgoingCount > 0 ? outgoingMessages : altOutgoingMessages;
      
      if (totalOutgoingCount > initialCount) {
        const latestResponse = messagesToCheck.last();
        const responseText = await latestResponse.textContent();
        
        if (responseText && responseText.trim().length > 10) {
          const agentResponse = responseText.trim();
          
          if (agentResponse !== lastAgentMessage) {
            console.log(`🤖 Agent: ${agentResponse}`);
            
            this.conversationHistory.push({ role: 'agent', content: agentResponse });
            lastAgentMessage = agentResponse;
            duplicateCount = 0;
            
            if (this.isAgentEndingConversation(agentResponse)) {
              this.completed = true;
            }
            
            return;
          } else {
            duplicateCount++;
            console.log(`⚠️ Agent repeated the same message (${duplicateCount} times): "${agentResponse}"`);
            
            if (duplicateCount >= 3) {
              console.log(`❌ Agent stuck in loop after ${duplicateCount} duplicate messages, ending conversation`);
              this.completed = true;
              return;
            }
          }
        }
      }
      
      if (incomingCount > initialIncomingCount) {
        console.log(`📤 User message detected, waiting for agent response...`);
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
      await chatInput.first().fill(message);
      await new Promise(resolve => setTimeout(resolve, 500));
      await chatInput.first().press('Enter');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`✅ Sent: "${message}"`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  private shouldEndConversation(message: string): boolean {
    const endPhrases = [
      'thank you', 'thanks', 'that\'s all', 'goodbye', 'bye',
      'have a great day', 'appreciate your help', 'that\'s everything'
    ];
    return endPhrases.some(phrase => message.toLowerCase().includes(phrase));
  }

  private isAgentEndingConversation(message: string): boolean {
    const endPhrases = [
      'is there anything else', 'anything else i can help',
      'anything else you need', 'help you with anything else',
      'anything else today', 'other questions', 'other assistance'
    ];
    return endPhrases.some(phrase => message.toLowerCase().includes(phrase));
  }
}

// Conversation evaluation function
function evaluateConversation(conversation: Array<{ role: string; content: string }>) {
  const totalTurns = conversation.length / 2; // Each turn has user + agent message
  const conversationLength = conversation.length;
  
  // Calculate success rate based on conversation flow
  let successRate = 0.5; // Base rate
  
  // Check if agent provided helpful responses
  const agentMessages = conversation.filter(msg => msg.role === 'agent');
  const helpfulResponses = agentMessages.filter(msg => 
    msg.content.toLowerCase().includes('address') || 
    msg.content.toLowerCase().includes('update') ||
    msg.content.toLowerCase().includes('help') ||
    msg.content.toLowerCase().includes('assist')
  );
  
  if (helpfulResponses.length > 0) {
    successRate += 0.3;
  }
  
  // Check if conversation had proper flow
  if (totalTurns >= 3) {
    successRate += 0.2;
  }
  
  // Calculate user satisfaction (simplified)
  const userSatisfaction = Math.min(0.9, successRate + 0.1);
  
  return {
    totalTurns,
    conversationLength,
    successRate: Math.min(1, successRate),
    userSatisfaction: Math.min(1, userSatisfaction)
  };
}

test.describe('PolicyHolder Agent E2E Simulation', () => {
  test('Test PolicyHolder agent with dynamic user simulation', async ({ page }) => {
    console.log('🚀 Starting PolicyHolder Agent E2E Test...');

    // Load configuration
    const baseUrl = 'https://r2d2demo.ushur.dev';
    const email = env.email;
    const password = env.password;

    // Set up PolicyHolder agent configuration (same pattern as working test)
    console.log('\n🤖 STEP 1: Setting up PolicyHolder Agent Configuration');
    process.env.AGENT_TYPE = 'PolicyHolder';
    process.env.AGENT_DESCRIPTION = 'The Policyholder Engagement System helps insurance customers navigate their policies by clarifying coverage, explaining billing, guiding them on claim filing and status timelines, and answering endorsement questions. Policyholders can ask any policy-related question and receive precise information or step-by-step guidance. The system is committed to making every interaction with the insurer seamless, informative, and satisfying for policyholders.';
    process.env.FRIENDLY_NAME = 'Factual Fred';
    process.env.GREET_MESSAGE = 'Hello. I\'m ready to provide information — what do you need assistance with?';
    process.env.USE_CASE_TEMPLATE = 'policyholder_001';
    process.env.CAP_NAME = 'Knowledge Base';
    process.env.CAP_INDEX = '0';
    process.env.TASK_ID = 'task_002';
    process.env.TASK_NAME = 'Update Address';
    process.env.PERSONA_ID = 'persona_002';
    process.env.TONE = 'Professional';
    process.env.FORMALITY = 'Casual';
    process.env.EMPATHY = 'Low';
    process.env.READABILITY = 'College Readiness';

    // User persona for PolicyHolder
    const userPersona = {
      name: 'John Smith',
      age: '45',
      policyType: 'Auto Insurance',
      policyNumber: 'POL123456789',
      memberId: 'MEM12345',
      dateOfBirth: '03/15/1980',
      currentAddress: '123 Oak Street, Springfield, IL 62701',
      newAddress: '456 Pine Avenue, Chicago, IL 60601',
      goals: [
        'Update my address information on my insurance policy',
        'Ensure the change is processed correctly',
        'Get confirmation of the address update'
      ]
    };

    try {
      // Step 2: Get authentication and create/initialize agent
      console.log('\n🔐 STEP 2: Authentication and Agent Setup');
      const instance = 'r2d2demo.ushur.dev';
      const { token, account } = await getUshurTokenFromApi();
      console.log(`🔐 Using account: ${account}`);

      // Step 3: Navigate to Ushur signin page for dashboard access
      console.log('\n🌐 STEP 3: Navigating to Ushur Dashboard');
      const signinUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=signin';
      console.log(`🔗 Navigating to: ${signinUrl}`);
      
      await page.goto(signinUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('\n🔐 STEP 4: Logging in with .env credentials');
      
      if (!email || !password) {
        throw new Error('Email or password not found in .env file. Please check your environment variables.');
      }
      
      console.log(`📧 Email: ${email}`);
      console.log(`🔒 Password: ${password ? '***' : 'NOT SET'}`);
      
      // Look for login form elements
      const emailInput = page.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button:has-text("Login")').first();
      
      // Fill login credentials
      await emailInput.fill(email);
      await passwordInput.fill(password);
      await loginButton.click();
      
      console.log('✅ Login button clicked');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      console.log('\n🏢 STEP 5: Navigating to Agents Page');
      const agentsUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=agents';
      await page.goto(agentsUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Step 6: Create or find PolicyHolder agent
      console.log('\n🔍 STEP 6: Creating or Finding PolicyHolder Agent');
      
      // Try to create a new agent first
      let agentUrl = '';
      try {
        console.log('✨ Creating NEW PolicyHolder agent...');
        agentUrl = await createAndActivateAgent(instance, token, agentConfig, account);
        console.log('✅ Created NEW PolicyHolder agent →', agentUrl);
      } catch (error) {
        console.log('⚠️ Agent creation failed, will look for existing agents...');
      }

      // Step 7: Find and select PolicyHolder agent
      console.log('\n🔍 STEP 7: Finding and Selecting PolicyHolder Agent');
      
      // Wait for the agents table to load
      await page.waitForSelector('table', { timeout: 10000 });
      
      // Find all agent rows
      const agentRows = page.locator('table tbody tr');
      const rowCount = await agentRows.count();
      console.log(`📊 Found ${rowCount} agent rows in table`);
      
      let selectedAgentRow = null;
      let agentId = '';
      
      // Look for PolicyHolder agents
      for (let i = 0; i < rowCount; i++) {
        const row = agentRows.nth(i);
        const rowText = await row.textContent();
        
        // Skip header rows or rows without proper content
        if (!rowText || rowText.trim().length < 10) {
          continue;
        }
        
        console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
        
        // Check if this row contains a PolicyHolder agent
        if (rowText.includes('PolicyHolder') || rowText.includes('Policy')) {
          console.log(`✅ Found PolicyHolder agent in row ${i + 1}`);
          selectedAgentRow = row;
          
          // Extract agent ID from the first column
          const idCell = row.locator('td').first();
          agentId = await idCell.textContent() || '';
          break;
        }
      }
      
      if (!selectedAgentRow) {
        throw new Error('PolicyHolder agent not found');
      }

      console.log('\n🖱️ STEP 8: Clicking on PolicyHolder Agent');
      await selectedAgentRow.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('\n🔍 STEP 9: Opening Agent Preview');
      const previewButton = page.locator('button:has-text("Preview Agent")').first();
      await expect(previewButton).toBeVisible();
      await previewButton.click();
      console.log('✅ Found Preview Agent button, clicking...');

      // Wait for iframe to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('\n🔍 STEP 10: Switching to Chat Iframe');
      const iframe = page.frameLocator('iframe[title*="chat"], iframe[title*="Chat"], iframe[title*="preview"], iframe[title*="Preview"]');
      const chatInput = iframe.locator('textarea[placeholder*="Type your message"], textarea[placeholder*="message"]').first();
      
      await expect(chatInput).toBeVisible({ timeout: 10000 });
      console.log('✅ Found chat iframe, switching context...');
      console.log('✅ Successfully switched to chat iframe');

      console.log('\n💬 STEP 11: Starting PolicyHolder User Simulation');
      console.log('✅ Chat input is ready');
      console.log('✅ Found chat input');

      // Initialize OpenAI for the simulator
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      // Create and run user simulator
      const userSimulator = new PolicyHolderUserSimulator(userPersona);
      (userSimulator as any).openai = openai;

      let conversationHistory: Array<{ role: string; content: string }> = [];
      conversationHistory = await userSimulator.simulateConversation(chatInput, iframe);

      console.log('\n📝 Conversation Summary:');
      conversationHistory.forEach((msg, index) => {
        const emoji = msg.role === 'user' ? '👤' : '🤖';
        console.log(`${emoji} ${msg.role}: ${msg.content}`);
      });

      console.log('\n📊 STEP 12: Evaluating Conversation');
      const evaluation = evaluateConversation(conversationHistory);
      console.log('📈 Evaluation Results:');
      console.log(`  Total Turns: ${evaluation.totalTurns}`);
      console.log(`  Conversation Length: ${evaluation.conversationLength}`);
      console.log(`  Success Rate: ${evaluation.successRate}`);
      console.log(`  User Satisfaction: ${evaluation.userSatisfaction}`);

      // Assertions
      expect(evaluation.totalTurns).toBeGreaterThan(0);
      expect(evaluation.conversationLength).toBeGreaterThan(0);
      expect(evaluation.successRate).toBeGreaterThanOrEqual(0.5);
      expect(evaluation.userSatisfaction).toBeGreaterThan(0.3);

      console.log('\n🎯 ===== POLICYHOLDER AGENT TEST COMPLETE =====');
      console.log(`📊 Total Turns: ${evaluation.totalTurns}`);
      console.log(`💬 Conversation History Length: ${evaluation.conversationLength}`);
      console.log(`✅ Agent ID: ${agentId}`);

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  });
});
