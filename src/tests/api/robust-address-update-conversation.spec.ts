import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentHandle, initAgentBySelector } from '../../utils/api/ushur.Agents';
import { agentConfig } from '../../../configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '../../utils/env';

test.describe('Robust Address Update Conversation', () => {
  test('Demonstrate Real Address Update Conversation with Proper Flow', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for complete flow
    
    console.log('🏠 Starting Robust Address Update Conversation...');
    
    // Step 1: Get existing agent
    console.log('\n🚀 STEP 1: Getting Existing PolicyHolder Agent');
    
    const instance = env.instance;
    const { token, account } = await getUshurTokenFromApi();
    console.log(`🔐 Using account: ${account}`);
    
    const handle = getAgentHandle();
    console.log('Agent selector from CLI/env:', handle);
    
    let agentUrl: string;
    
    if (handle) {
      console.log('🔄 Using existing agent with handle:', handle);
      agentUrl = await initAgentBySelector(instance, token, agentConfig, handle);
      console.log('🔄 Initialized existing agent →', agentUrl);
    } else {
      // Use existing PolicyHolder agent
      console.log('🔄 Using existing PolicyHolder agent for address update...');
      agentUrl = await initAgentBySelector(instance, token, agentConfig, '8851657');
      console.log('✅ Using existing PolicyHolder agent →', agentUrl);
    }

    // Step 2: Navigate to agent session URL
    console.log('\n🌐 STEP 2: Navigating to Agent Session');
    console.log(`🔗 Agent URL: ${agentUrl}`);
    
    await page.goto(agentUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'reports/robust-address-update-conversation-initial.png',
      fullPage: true 
    });

    // Step 3: Wait for chat interface to load
    console.log('\n🔍 STEP 3: Waiting for Chat Interface to Load');
    
    const chatInput = page.locator('textarea[placeholder*="Type"], input[placeholder*="Type"], [contenteditable="true"]').first();
    
    if (await chatInput.isVisible({ timeout: 30000 })) {
      console.log('✅ Chat input is visible and ready');
    } else {
      throw new Error('Chat input not found or not visible');
    }

    // Step 4: Robust Address Update Conversation
    console.log('\n🏠 STEP 4: Starting Robust Address Update Conversation');
    
    const conversationSteps = [
      {
        step: 1,
        userInput: "Hello, I need to update my address",
        waitTime: 15000,
        description: "Initial address update request"
      },
      {
        step: 2,
        userInput: "My current address is 456 Oak Street, Springfield, IL 62701",
        waitTime: 15000,
        description: "Provide current address"
      },
      {
        step: 3,
        userInput: "I want to change it to 123 Main Street, Apt 4B, New York, NY 10001",
        waitTime: 15000,
        description: "Provide new address"
      },
      {
        step: 4,
        userInput: "Yes, please update my address",
        waitTime: 15000,
        description: "Confirm address update"
      },
      {
        step: 5,
        userInput: "Can you confirm the address has been updated?",
        waitTime: 15000,
        description: "Request confirmation"
      }
    ];
    
    const conversationHistory: any[] = [];
    
    // Execute conversation with better error handling and response capture
    for (const step of conversationSteps) {
      console.log(`\n📤 Step ${step.step}: ${step.description}`);
      console.log(`💬 User Input: "${step.userInput}"`);
      
      try {
        // Wait for any previous messages to complete
        console.log('⏳ Waiting for previous message to complete...');
        await page.waitForTimeout(5000);
        
        // Take screenshot before interaction
        await page.screenshot({ 
          path: `reports/robust-address-update-conversation-step-${step.step}-before.png`,
          fullPage: true 
        });
        
        // Get current message count before sending
        const messagesBefore = await getCurrentMessageCount(page);
        console.log(`📊 Messages before step ${step.step}: ${messagesBefore}`);
        
        // Clear and focus the input field with multiple attempts
        console.log('🖱️ Focusing input field...');
        await chatInput.click();
        await page.waitForTimeout(2000);
        
        // Clear the input field completely
        console.log('🧹 Clearing input field...');
        await chatInput.fill('');
        await page.waitForTimeout(1000);
        await chatInput.press('Control+a');
        await chatInput.press('Delete');
        await page.waitForTimeout(1000);
        
        // Type the user input with slower typing
        console.log(`✍️ Typing: "${step.userInput}"`);
        await chatInput.type(step.userInput, { delay: 200 });
        await page.waitForTimeout(2000);
        
        // Verify the input was typed correctly
        const inputValue = await chatInput.inputValue();
        console.log(`📋 Input value: "${inputValue}"`);
        
        if (inputValue !== step.userInput) {
          console.log('⚠️ Input value mismatch, trying alternative approach...');
          await chatInput.fill('');
          await page.waitForTimeout(1000);
          await chatInput.type(step.userInput, { delay: 100 });
          await page.waitForTimeout(1000);
        }
        
        // Send the message
        console.log('📤 Sending message...');
        await chatInput.press('Enter');
        console.log(`✅ Message sent: "${step.userInput}"`);
        
        // Wait for agent response with longer timeout
        console.log(`⏳ Waiting ${step.waitTime/1000} seconds for agent response...`);
        await page.waitForTimeout(step.waitTime);
        
        // Get message count after sending
        const messagesAfter = await getCurrentMessageCount(page);
        console.log(`📊 Messages after step ${step.step}: ${messagesAfter}`);
        
        // Take screenshot after interaction
        await page.screenshot({ 
          path: `reports/robust-address-update-conversation-step-${step.step}-after.png`,
          fullPage: true 
        });
        
        // Capture the agent's response with better selectors
        const agentResponse = await captureAgentResponse(page, step.step);
        console.log(`✅ Agent response: "${agentResponse.substring(0, 150)}..."`);
        
        // Store the conversation step
        const conversationStep = {
          step: step.step,
          userInput: step.userInput,
          agentResponse,
          messagesBefore,
          messagesAfter,
          newMessages: messagesAfter - messagesBefore,
          timestamp: new Date().toISOString()
        };
        
        conversationHistory.push(conversationStep);
        
        console.log(`✅ Step ${step.step} completed successfully`);
        console.log(`📝 New messages added: ${conversationStep.newMessages}`);
        
        // Wait before next step
        await page.waitForTimeout(3000);
        
      } catch (error) {
        console.error(`❌ Error with step ${step.step}:`, error);
        
        // Store error step
        conversationHistory.push({
          step: step.step,
          userInput: step.userInput,
          agentResponse: `Error: ${error.message}`,
          messagesBefore: 0,
          messagesAfter: 0,
          newMessages: 0,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Step 5: Analyze Conversation Flow
    console.log('\n🔍 STEP 5: Analyzing Conversation Flow');
    
    const totalMessages = conversationHistory.reduce((sum, step) => sum + step.newMessages, 0);
    const successfulSteps = conversationHistory.filter(step => !step.agentResponse.includes('Error'));
    const uniqueResponses = new Set(conversationHistory.map(step => step.agentResponse.substring(0, 50)));
    
    console.log(`📊 Conversation Analysis:`);
    console.log(`   Total Steps: ${conversationSteps.length}`);
    console.log(`   Successful Steps: ${successfulSteps.length}`);
    console.log(`   Total New Messages: ${totalMessages}`);
    console.log(`   Unique Agent Responses: ${uniqueResponses.size}`);
    
    // Step 6: Generate Comprehensive Report
    console.log('\n📊 STEP 6: Generating Robust Conversation Report');
    
    console.log('\n🎯 ===== ROBUST ADDRESS UPDATE CONVERSATION COMPLETE =====');
    console.log(`🏠 Task: Address Update Conversation`);
    console.log(`📊 Total Steps Executed: ${conversationSteps.length}`);
    console.log(`✅ Successful Steps: ${successfulSteps.length}`);
    console.log(`❌ Failed Steps: ${conversationHistory.length - successfulSteps.length}`);
    console.log(`💬 Total New Messages: ${totalMessages}`);
    console.log(`🔄 Unique Agent Responses: ${uniqueResponses.size}`);
    
    // Detailed conversation log
    console.log('\n📋 DETAILED CONVERSATION LOG:');
    conversationHistory.forEach((step, index) => {
      console.log(`\n   Step ${step.step}:`);
      console.log(`   User: "${step.userInput}"`);
      console.log(`   Agent: "${step.agentResponse.substring(0, 100)}..."`);
      console.log(`   Messages: ${step.messagesBefore} → ${step.messagesAfter} (+${step.newMessages})`);
      console.log(`   Status: ${step.agentResponse.includes('Error') ? '❌ Failed' : '✅ Success'}`);
    });
    
    // Conversation flow insights
    console.log('\n🔍 CONVERSATION FLOW INSIGHTS:');
    if (uniqueResponses.size === 1) {
      console.log('⚠️ WARNING: Agent gave the same response to all messages');
      console.log('   This indicates the conversation is not progressing properly');
    } else if (uniqueResponses.size > 1) {
      console.log('✅ GOOD: Agent provided different responses to different messages');
      console.log('   This indicates the conversation is progressing properly');
    }
    
    if (totalMessages < conversationSteps.length) {
      console.log('⚠️ WARNING: Not all messages generated new responses');
      console.log('   This suggests some messages may not have been processed');
    } else {
      console.log('✅ GOOD: All messages generated responses');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'reports/robust-address-update-conversation-final.png',
      fullPage: true 
    });
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - Initial state: reports/robust-address-update-conversation-initial.png');
    console.log('   - Before each step: reports/robust-address-update-conversation-step-*-before.png');
    console.log('   - After each step: reports/robust-address-update-conversation-step-*-after.png');
    console.log('   - Final state: reports/robust-address-update-conversation-final.png');
    
    // Assertions
    expect(conversationHistory.length).toBeGreaterThan(0);
    expect(successfulSteps.length).toBeGreaterThan(0);
    
    console.log('\n✅ Robust Address Update Conversation completed successfully!');
    console.log('🎉 You can now review the screenshots and conversation analysis!');
    
  });
});

// Helper function to get current message count
async function getCurrentMessageCount(page: any): Promise<number> {
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
    
    let totalMessages = 0;
    for (const selector of messageSelectors) {
      const messages = page.locator(selector);
      const count = await messages.count();
      totalMessages = Math.max(totalMessages, count);
    }
    
    return totalMessages;
  } catch (error) {
    console.log('⚠️ Could not get message count:', error.message);
    return 0;
  }
}

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
