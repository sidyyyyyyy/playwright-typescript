import { test, expect } from '@playwright/test';
import { nextUserReply, createPersonaFromTestData } from '../../utils/faq-evaluation/robo-sim/single-step';
import { RoboSimulator } from '../../utils/faq-evaluation/robo-sim/core/simulator';
import { FunctionAdapter } from '../../utils/faq-evaluation/robo-sim/adapters/func';
import { RoboEvaluator } from '../../utils/faq-evaluation/robo-sim/core/evaluator';
import { env } from '../../utils/env';

test.describe('RoboSim Agent Preview Integration', () => {
  const testData = {
    testData: {
      memberInfo: {
        firstName: 'John',
        lastName: 'Doe',
        memberId: 'MEM12345',
        dateOfBirth: '1980-01-15',
        currentAddress: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105'
        },
        newAddress: {
          street: '456 Market St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94103'
        },
        phoneNumber: '555-123-4567',
        email: 'john.doe@example.com'
      }
    },
    testCases: [{
      id: 'address-update-001',
      name: 'Basic Address Update Flow',
      description: 'Validate agent\'s ability to handle a simple address update request',
      scenario: 'Given I am a member with an existing address...',
      goals: [
        'Successfully authenticate member',
        'Update member address',
        'Provide clear confirmation'
      ]
    }]
  };

  test('RoboSim with Real Agent Preview - Address Update Flow', async ({ page, browser }) => {
    test.setTimeout(300000); // 5 minutes
    
    // Create new context for debugging
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting RoboSim Agent Preview Integration...');

    // Step 1: Navigate to Ushur signin page
    console.log('\n🌐 STEP 1: Navigating to Ushur Signin Page');
    const signinUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=signin';
    console.log(`🔗 Navigating to: ${signinUrl}`);
    
    await newPage.goto(signinUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 2: Login with credentials from .env file
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

    // Step 4: Find and click on HealthPlan agent
    console.log('\n🔍 STEP 4: Finding HealthPlan Agent');
    
    // Wait for the agents table to load
    await newPage.waitForSelector('table', { timeout: 10000 });
    
    // Find all agent rows
    const agentRows = newPage.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`📊 Found ${rowCount} agent rows in table`);
    
    let selectedAgentRow = null;
    
    // Look for HealthPlan agents
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      // Skip header rows or rows without proper content
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      // Check if this row contains a HealthPlan agent
      if (rowText.includes('HealthPlan') || rowText.includes('Health')) {
        console.log(`✅ Found HealthPlan agent in row ${i + 1}`);
        selectedAgentRow = row;
        break;
      }
    }
    
    if (!selectedAgentRow) {
      throw new Error('No HealthPlan agent found in the agents table');
    }
    
    // Click on the selected agent row to open it
    console.log('🖱️ Clicking on HealthPlan agent row...');
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
        
        // Step 7: Initialize RoboSim
        console.log('\n🤖 STEP 7: Initializing RoboSim Framework');
        const persona = createPersonaFromTestData(testData);
        const adapter = new FunctionAdapter();
        const simulator = new RoboSimulator(persona, adapter, {
          model: 'gpt-4o-mini',
          temperature: 0.7,
          maxTurns: 10
        });
        const evaluator = new RoboEvaluator();
        
        console.log('📋 Created persona:', JSON.stringify(persona, null, 2));
        
        // Step 8: Start RoboSim conversation
        console.log('\n💬 STEP 8: Starting RoboSim Conversation with Real Agent');
        
        const conversationHistory = [];
        let turnCount = 0;
        const maxTurns = 8;
        
        // Initial user message
        const initialMessage = "Hi, I need to update my address in the system.";
        console.log(`👤 Initial User Message: "${initialMessage}"`);
        
        // Send initial message to agent
        await sendMessageToAgent(chatFrame, newPage, initialMessage);
        conversationHistory.push({ role: 'user', content: initialMessage });
        
        // Wait for agent response
        let agentResponse = await waitForAgentResponse(chatFrame, newPage);
        console.log(`🤖 Agent Response: "${agentResponse}"`);
        conversationHistory.push({ role: 'agent', content: agentResponse });
        
        // RoboSim conversation loop
        while (turnCount < maxTurns) {
          turnCount++;
          console.log(`\n🔄 Turn ${turnCount}:`);
          
          // Use RoboSim to generate user response
          const userResponse = await nextUserReply(agentResponse, persona);
          console.log(`👤 RoboSim User Response: "${userResponse}"`);
          
          // Send user response to agent
          await sendMessageToAgent(chatFrame, newPage, userResponse);
          conversationHistory.push({ role: 'user', content: userResponse });
          
          // Wait for agent response
          const nextAgentResponse = await waitForAgentResponse(chatFrame, newPage);
          console.log(`🤖 Agent Response: "${nextAgentResponse}"`);
          conversationHistory.push({ role: 'agent', content: nextAgentResponse });
          
          // Check if conversation should end
          if (isConversationComplete(nextAgentResponse)) {
            console.log('🏁 Conversation completed naturally');
            break;
          }
          
          // Check if agent response is almost the same as previous response
          if (isResponseSimilar(agentResponse, nextAgentResponse)) {
            console.log('🔄 Agent response is similar to previous response - ending conversation');
            break;
          }
          
          // Update for next iteration
          agentResponse = nextAgentResponse;
        }
        
        // Step 9: Evaluate conversation
        console.log('\n📊 STEP 9: Evaluating Conversation with RoboSim');
        const evaluation = await evaluator.evaluate(conversationHistory, persona.goals);
        
        console.log('📈 RoboSim Evaluation Results:');
        console.log('  Correctness:', evaluation.behavior.correctness.toFixed(2));
        console.log('  Relevance:', evaluation.behavior.relevance.toFixed(2));
        console.log('  Conciseness:', evaluation.behavior.conciseness.toFixed(2));
        console.log('  Faithfulness:', evaluation.behavior.faithfulness.toFixed(2));
        console.log('  Goal Accuracy:', evaluation.behavior.goalAccuracy.toFixed(2));
        console.log('  Next Action:', evaluation.nextAction.type);
        
        // Assertions
        expect(evaluation.behavior.correctness).toBeGreaterThan(0.5);
        expect(evaluation.behavior.relevance).toBeGreaterThan(0.5);
        expect(evaluation.behavior.faithfulness).toBeGreaterThan(0.8);
        
        console.log('\n🎯 ===== ROBOSIM AGENT PREVIEW INTEGRATION COMPLETE =====');
        console.log(`📊 Total Turns: ${turnCount}`);
        console.log(`💬 Conversation History Length: ${conversationHistory.length}`);
        
      } else {
        throw new Error('Could not access iframe content');
      }
    } else {
      throw new Error('Chat iframe not found');
    }
  });

});

// Helper function to send message to agent
async function sendMessageToAgent(chatFrame: any, page: any, message: string): Promise<void> {
  const chatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
  
  const inputCount = await chatInput.count();
  if (inputCount === 0) {
    throw new Error('Chat input not found in iframe');
  }
  
  // Clear and focus input
  await chatInput.first().click();
  await page.waitForTimeout(500);
  await chatInput.first().fill('');
  await page.waitForTimeout(300);
  
  // Type message
  await chatInput.first().type(message, { delay: 100 });
  await page.waitForTimeout(1000);
  
  // Send message
  await chatInput.first().press('Enter');
  console.log(`✅ Sent message: "${message}"`);
  
  // Wait for message to appear
  await page.waitForTimeout(2000);
}

// Helper function to wait for agent response
async function waitForAgentResponse(chatFrame: any, page: any): Promise<string> {
  console.log('⏳ Waiting for agent response...');
  
  // Wait for agent response
  await page.waitForTimeout(10000);
  
  try {
    const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
    const outgoingCount = await outgoingMessages.count();
    console.log(`🤖 Outgoing messages (agent responses): ${outgoingCount}`);
    
    if (outgoingCount > 0) {
      const latestOutgoing = outgoingMessages.last();
      const responseText = await latestOutgoing.textContent();
      
      if (responseText && responseText.trim().length > 10) {
        console.log(`✅ Captured agent response: "${responseText.trim().substring(0, 100)}..."`);
        return responseText.trim();
      }
    }
    
    return 'No response received';
  } catch (e) {
    console.log(`⚠️ Error capturing agent response: ${e}`);
    return 'Error in response capture';
  }
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
    'anything else i can help'
  ];
  
  const lowerResponse = agentResponse.toLowerCase();
  return completionIndicators.some(indicator => lowerResponse.includes(indicator));
}

// Helper function to check if responses are similar
function isResponseSimilar(previousResponse: string, currentResponse: string): boolean {
  if (!previousResponse || !currentResponse) {
    return false;
  }
  
  // Normalize responses for comparison
  const normalize = (text: string) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  };
  
  const prev = normalize(previousResponse);
  const curr = normalize(currentResponse);
  
  // If responses are identical, they're similar
  if (prev === curr) {
    return true;
  }
  
  // Calculate similarity using simple word overlap
  const prevWords = prev.split(' ');
  const currWords = curr.split(' ');
  
  const commonWords = prevWords.filter(word => currWords.includes(word));
  const similarity = commonWords.length / Math.max(prevWords.length, currWords.length);
  
  // Consider responses similar if they share more than 80% of words
  const isSimilar = similarity > 0.8;
  
  if (isSimilar) {
    console.log(`🔄 Similarity detected: ${(similarity * 100).toFixed(1)}% word overlap`);
    console.log(`📝 Previous: "${previousResponse.substring(0, 100)}..."`);
    console.log(`📝 Current:  "${currentResponse.substring(0, 100)}..."`);
  }
  
  return isSimilar;
}
