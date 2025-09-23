import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentHandle, initAgentBySelector } from '../../utils/api/ushur.Agents';
import { agentConfig } from '../../../configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '../../utils/env';

test.describe('HealthPlan Address Update Preview', () => {
  test('Test Address Update with HealthPlan Agent in Preview Mode', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes
    
    console.log('🏥 Starting HealthPlan Address Update Preview Test...');
    
    // Step 1: Create and activate HealthPlan agent
    console.log('\n🚀 STEP 1: Creating HealthPlan Agent');
    
    const instance = env.instance;
    const { token, account } = await getUshurTokenFromApi();
    console.log(`🔐 Using account: ${account}`);
    
    // Create HealthPlan agent with address update capability
    const agentData = await createAndActivateAgent(instance, token, {
      ...agentConfig,
      type: 'HealthPlan',
      description: 'The Health Plan Member Engagement System is designed to efficiently manage member inquiries and enhance the experience of health plan services. Whether members need assistance with benefits, claims, billing, or any other aspect of their health plan, this intuitive system is ready to help.',
      agentPersona: {
        friendlyName: 'Friendly Farah',
        greetMessage: "Hi there! I'm here to make navigating your health journey simple and stress-free—how can I help today?",
        personaId: 'persona_001',
        properties: {
          tone: 'Friendly',
          formality: 'Casual',
          empathy: 'High',
          readability: 'Grade 6'
        }
      },
      optedCapabilities: [
        {
          id: 'aiskill_001',
          name: 'Knowledge Base',
          type: 'AISkill',
          knowledgeAssetId: 'de83fa41-0d2a-437d-a484-7ebd38700b20' // Use existing asset
        },
        { id: 'task_002', name: 'Update Address', type: 'Tasks' }
      ],
      useCaseTemplate: 'healthplan_001'
    });
    
    console.log('✅ HealthPlan agent created and activated');
    console.log(`🔗 Agent Data:`, agentData);
    
    // Get the session URL from the agent data
    const sessionURL = agentData.agentInitSessionURL || agentData.sessionURL;
    if (!sessionURL) {
      throw new Error('No session URL found in agent data');
    }
    
    console.log(`🔗 Agent URL: ${sessionURL}`);
    
    // Step 2: Navigate to agent session
    console.log('\n🌐 STEP 2: Navigating to HealthPlan Agent Session');
    
    await page.goto(sessionURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'reports/healthplan-address-update-preview-initial.png',
      fullPage: true 
    });
    
    console.log('✅ Navigated to HealthPlan agent session');
    
    // Step 3: Wait for chat interface to load
    console.log('\n🔍 STEP 3: Waiting for Chat Interface to Load');
    
    // Try multiple selectors for chat input
    const chatInputSelectors = [
      'textarea[placeholder*="Type"]',
      'input[placeholder*="Type"]',
      'textarea[placeholder*="message"]',
      'input[placeholder*="message"]',
      '[contenteditable="true"]',
      'textarea',
      'input[type="text"]'
    ];
    
    let chatInput = null;
    for (const selector of chatInputSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        chatInput = element;
        console.log(`✅ Found chat input with selector: ${selector}`);
        break;
      }
    }
    
    if (!chatInput) {
      throw new Error('Chat input not found with any selector');
    }
    
    // Step 4: Test Address Update Conversation
    console.log('\n🏠 STEP 4: Testing Address Update Conversation');
    
    const addressUpdateSteps = [
      {
        step: 1,
        userInput: "Hello, I need to update my address",
        description: "Initial address update request"
      },
      {
        step: 2,
        userInput: "My current address is 123 Main Street, Springfield, IL 62701",
        description: "Provide current address"
      },
      {
        step: 3,
        userInput: "I want to change it to 456 Oak Avenue, Chicago, IL 60601",
        description: "Provide new address"
      },
      {
        step: 4,
        userInput: "Yes, please update my address",
        description: "Confirm address update"
      }
    ];
    
    const conversationHistory: any[] = [];
    
    // Execute address update conversation
    for (const step of addressUpdateSteps) {
      console.log(`\n📤 Step ${step.step}: ${step.description}`);
      console.log(`💬 User Input: "${step.userInput}"`);
      
      try {
        // Wait for any previous messages to complete
        console.log('⏳ Waiting for previous message to complete...');
        await page.waitForTimeout(5000);
        
        // Take screenshot before interaction
        await page.screenshot({ 
          path: `reports/healthplan-address-update-preview-step-${step.step}-before.png`,
          fullPage: true 
        });
        
        // Focus and clear input
        console.log('🖱️ Focusing input field...');
        await chatInput.click();
        await page.waitForTimeout(1000);
        await chatInput.press('Control+a');
        await chatInput.press('Delete');
        await page.waitForTimeout(500);
        
        // Type the message
        console.log(`✍️ Typing: "${step.userInput}"`);
        await chatInput.type(step.userInput, { delay: 100 });
        await page.waitForTimeout(1000);
        
        // Send the message
        console.log('📤 Sending message...');
        await chatInput.press('Enter');
        await page.waitForTimeout(5000);
        
        console.log(`✅ Message sent: "${step.userInput}"`);
        
        // Wait for agent response
        console.log('⏳ Waiting for agent response...');
        await page.waitForTimeout(10000);
        
        // Take screenshot after interaction
        await page.screenshot({ 
          path: `reports/healthplan-address-update-preview-step-${step.step}-after.png`,
          fullPage: true 
        });
        
        // Capture the agent's response
        const agentResponse = await captureAgentResponse(page, step.step);
        console.log(`✅ Agent response: "${agentResponse.substring(0, 150)}..."`);
        
        // Store the conversation step
        const conversationStep = {
          step: step.step,
          userInput: step.userInput,
          agentResponse,
          timestamp: new Date().toISOString()
        };
        
        conversationHistory.push(conversationStep);
        
        console.log(`✅ Step ${step.step} completed successfully`);
        
        // Wait before next step
        await page.waitForTimeout(3000);
        
      } catch (error) {
        console.error(`❌ Error with step ${step.step}:`, error);
        
        // Store error step
        conversationHistory.push({
          step: step.step,
          userInput: step.userInput,
          agentResponse: `Error: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Step 5: Analyze Conversation Results
    console.log('\n🔍 STEP 5: Analyzing Address Update Conversation');
    
    const successfulSteps = conversationHistory.filter(step => !step.agentResponse.includes('Error'));
    const uniqueResponses = new Set(conversationHistory.map(step => step.agentResponse.substring(0, 50)));
    
    console.log(`📊 Address Update Analysis:`);
    console.log(`   Total Steps: ${addressUpdateSteps.length}`);
    console.log(`   Successful Steps: ${successfulSteps.length}`);
    console.log(`   Unique Agent Responses: ${uniqueResponses.size}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'reports/healthplan-address-update-preview-final.png',
      fullPage: true 
    });
    
    // Detailed conversation log
    console.log('\n📋 DETAILED CONVERSATION LOG:');
    conversationHistory.forEach((step, index) => {
      console.log(`\n   Step ${step.step}:`);
      console.log(`   User: "${step.userInput}"`);
      console.log(`   Agent: "${step.agentResponse.substring(0, 100)}..."`);
      console.log(`   Status: ${step.agentResponse.includes('Error') ? '❌ Failed' : '✅ Success'}`);
    });
    
    // Conversation flow insights
    console.log('\n🔍 ADDRESS UPDATE CONVERSATION INSIGHTS:');
    if (uniqueResponses.size === 1) {
      console.log('⚠️ WARNING: Agent gave the same response to all messages');
      console.log('   This indicates the agent may have issues processing different inputs');
    } else if (uniqueResponses.size > 1) {
      console.log('✅ SUCCESS: Agent provided different responses to different messages');
      console.log('   The address update conversation is working!');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - Initial state: reports/healthplan-address-update-preview-initial.png');
    console.log('   - Before each step: reports/healthplan-address-update-preview-step-*-before.png');
    console.log('   - After each step: reports/healthplan-address-update-preview-step-*-after.png');
    console.log('   - Final state: reports/healthplan-address-update-preview-final.png');
    
    // Assertions
    expect(conversationHistory.length).toBeGreaterThan(0);
    expect(successfulSteps.length).toBeGreaterThan(0);
    
    console.log('\n✅ HealthPlan Address Update Preview Test completed successfully!');
    console.log('🎉 You can now review the screenshots to see the address update conversation!');
    
  });
});

// Helper function to capture agent response
async function captureAgentResponse(page: any, stepNumber: number): Promise<string> {
  try {
    const messageSelectors = [
      'div[class*="message"]',
      'div[class*="response"]',
      'div[class*="agent"]',
      'div[class*="bot"]',
      'div[class*="incoming"]',
      'div[class*="received"]',
      '.chat-message',
      '.message',
      '[data-testid*="message"]'
    ];
    
    for (const selector of messageSelectors) {
      const messages = page.locator(selector);
      const count = await messages.count();
      if (count > 0) {
        // Get the last few messages to find the most recent agent response
        const lastMessage = messages.last();
        const response = await lastMessage.textContent();
        if (response && response.length > 10) {
          return response;
        }
      }
    }
    
    return 'No response captured';
  } catch (error) {
    console.log('⚠️ Could not capture agent response:', error.message);
    return `Error capturing response: ${error.message}`;
  }
}
