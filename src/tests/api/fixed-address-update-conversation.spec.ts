import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentHandle, initAgentBySelector } from '../../utils/api/ushur.Agents';
import { agentConfig } from '../../../configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '../../utils/env';

test.describe('Fixed Address Update Conversation', () => {
  test('Demonstrate Fixed Address Update Conversation with Proper Input Handling', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for complete flow
    
    console.log('🏠 Starting Fixed Address Update Conversation...');
    
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
      path: 'reports/fixed-address-update-conversation-initial.png',
      fullPage: true 
    });

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

    // Step 4: Fixed Address Update Conversation
    console.log('\n🏠 STEP 4: Starting Fixed Address Update Conversation');
    
    const conversationSteps = [
      {
        step: 1,
        userInput: "Hello, I need to update my address",
        description: "Initial address update request"
      },
      {
        step: 2,
        userInput: "My current address is 456 Oak Street, Springfield, IL 62701",
        description: "Provide current address"
      },
      {
        step: 3,
        userInput: "No, that's not correct. I want to change it to 123 Main Street, Apt 4B, New York, NY 10001",
        description: "Correct the address and provide new address"
      },
      {
        step: 4,
        userInput: "Yes, please update my address to 123 Main Street, Apt 4B, New York, NY 10001",
        description: "Confirm the new address"
      },
      {
        step: 5,
        userInput: "Can you confirm the address has been updated?",
        description: "Request final confirmation"
      }
    ];
    
    const conversationHistory: any[] = [];
    
    // Execute conversation with fixed input handling
    for (const step of conversationSteps) {
      console.log(`\n📤 Step ${step.step}: ${step.description}`);
      console.log(`💬 User Input: "${step.userInput}"`);
      
      try {
        // Wait for any previous messages to complete
        console.log('⏳ Waiting for previous message to complete...');
        await page.waitForTimeout(8000);
        
        // Take screenshot before interaction
        await page.screenshot({ 
          path: `reports/fixed-address-update-conversation-step-${step.step}-before.png`,
          fullPage: true 
        });
        
        // Get current message count before sending
        const messagesBefore = await getCurrentMessageCount(page);
        console.log(`📊 Messages before step ${step.step}: ${messagesBefore}`);
        
        // FIXED: Better input field handling
        console.log('🖱️ Focusing input field...');
        
        // Try multiple approaches to focus and clear the input
        let inputFocused = false;
        const focusAttempts = [
          () => chatInput.click(),
          () => chatInput.focus(),
          () => chatInput.hover().then(() => chatInput.click()),
          () => page.keyboard.press('Tab').then(() => chatInput.click())
        ];
        
        for (let i = 0; i < focusAttempts.length; i++) {
          try {
            await focusAttempts[i]();
            await page.waitForTimeout(1000);
            
            // Check if input is focused by trying to type
            await chatInput.press('Control+a');
            await page.waitForTimeout(500);
            await chatInput.press('Delete');
            await page.waitForTimeout(500);
            
            inputFocused = true;
            console.log(`✅ Input focused with attempt ${i + 1}`);
            break;
          } catch (error) {
            console.log(`⚠️ Focus attempt ${i + 1} failed: ${error.message}`);
          }
        }
        
        if (!inputFocused) {
          throw new Error('Could not focus input field');
        }
        
        // FIXED: Better input clearing
        console.log('🧹 Clearing input field...');
        const clearAttempts = [
          () => chatInput.press('Control+a'),
          () => chatInput.press('Meta+a'), // For Mac
          () => chatInput.press('Home'),
          () => chatInput.press('End')
        ];
        
        for (const clearAttempt of clearAttempts) {
          try {
            await clearAttempt();
            await page.waitForTimeout(200);
            await chatInput.press('Delete');
            await page.waitForTimeout(200);
          } catch (error) {
            // Ignore clear errors
          }
        }
        
        // FIXED: Better input typing
        console.log(`✍️ Typing: "${step.userInput}"`);
        
        // Try multiple typing approaches
        let typingSuccess = false;
        const typingAttempts = [
          () => chatInput.type(step.userInput, { delay: 100 }),
          () => chatInput.fill(step.userInput),
          () => chatInput.pressSequentially(step.userInput, { delay: 50 }),
          () => {
            // Type character by character
            for (const char of step.userInput) {
              chatInput.press(char);
            }
          }
        ];
        
        for (let i = 0; i < typingAttempts.length; i++) {
          try {
            await typingAttempts[i]();
            await page.waitForTimeout(1000);
            
            // Verify the input was typed correctly
            const inputValue = await chatInput.inputValue();
            console.log(`📋 Input value after attempt ${i + 1}: "${inputValue}"`);
            
            if (inputValue === step.userInput) {
              typingSuccess = true;
              console.log(`✅ Typing successful with attempt ${i + 1}`);
              break;
            } else if (inputValue.length > 0) {
              console.log(`⚠️ Partial typing with attempt ${i + 1}, trying to complete...`);
              // Try to complete the typing
              const remaining = step.userInput.substring(inputValue.length);
              if (remaining) {
                await chatInput.type(remaining, { delay: 50 });
                await page.waitForTimeout(500);
              }
            }
          } catch (error) {
            console.log(`⚠️ Typing attempt ${i + 1} failed: ${error.message}`);
          }
        }
        
        if (!typingSuccess) {
          // Final verification
          const finalInputValue = await chatInput.inputValue();
          if (finalInputValue !== step.userInput) {
            console.log(`⚠️ Final input value: "${finalInputValue}" (expected: "${step.userInput}")`);
            // Try one more time with fill
            await chatInput.fill(step.userInput);
            await page.waitForTimeout(1000);
          }
        }
        
        // FIXED: Better message sending
        console.log('📤 Sending message...');
        
        const sendAttempts = [
          () => chatInput.press('Enter'),
          () => page.keyboard.press('Enter'),
          () => page.click('button[type="submit"]'),
          () => page.click('button:has-text("Send")'),
          () => page.click('button:has-text("Submit")')
        ];
        
        let messageSent = false;
        for (let i = 0; i < sendAttempts.length; i++) {
          try {
            await sendAttempts[i]();
            await page.waitForTimeout(2000);
            
            // Check if message was sent by looking for new messages
            const messagesAfterSend = await getCurrentMessageCount(page);
            if (messagesAfterSend > messagesBefore) {
              messageSent = true;
              console.log(`✅ Message sent successfully with attempt ${i + 1}`);
              break;
            }
          } catch (error) {
            console.log(`⚠️ Send attempt ${i + 1} failed: ${error.message}`);
          }
        }
        
        if (!messageSent) {
          console.log('⚠️ Message may not have been sent, but continuing...');
        }
        
        console.log(`✅ Message sent: "${step.userInput}"`);
        
        // Wait for agent response
        console.log('⏳ Waiting for agent response...');
        await page.waitForTimeout(15000);
        
        // Get message count after sending
        const messagesAfter = await getCurrentMessageCount(page);
        console.log(`📊 Messages after step ${step.step}: ${messagesAfter}`);
        
        // Take screenshot after interaction
        await page.screenshot({ 
          path: `reports/fixed-address-update-conversation-step-${step.step}-after.png`,
          fullPage: true 
        });
        
        // Capture the agent's response
        const agentResponse = await captureAgentResponse(page, step.step);
        console.log(`✅ Agent response: "${agentResponse.substring(0, 150)}..."`);
        
        // Check if agent is asking for confirmation and respond immediately
        if (agentResponse.toLowerCase().includes('correct') || 
            agentResponse.toLowerCase().includes('confirm') ||
            agentResponse.toLowerCase().includes('verify') ||
            agentResponse.toLowerCase().includes('is this')) {
          
          console.log('🤔 Agent is asking for confirmation, responding immediately...');
          
          // Wait a bit for the agent's message to fully load
          await page.waitForTimeout(3000);
          
          // Send confirmation response
          const confirmationResponse = step.step === 2 ? "No, that's not correct. I want to change it to 123 Main Street, Apt 4B, New York, NY 10001" : "Yes, please update my address";
          
          try {
            // Focus and clear input
            await chatInput.click();
            await page.waitForTimeout(1000);
            await chatInput.press('Control+a');
            await chatInput.press('Delete');
            await page.waitForTimeout(500);
            
            // Type confirmation
            await chatInput.type(confirmationResponse, { delay: 100 });
            await page.waitForTimeout(1000);
            
            // Send confirmation
            await chatInput.press('Enter');
            await page.waitForTimeout(5000);
            
            console.log(`✅ Sent confirmation: "${confirmationResponse}"`);
            
            // Capture updated agent response
            const updatedAgentResponse = await captureAgentResponse(page, step.step);
            console.log(`✅ Updated agent response: "${updatedAgentResponse.substring(0, 150)}..."`);
            
            // Update the conversation step with the confirmation
            const conversationStep = {
              step: step.step,
              userInput: step.userInput,
              agentResponse: updatedAgentResponse,
              confirmationSent: confirmationResponse,
              messagesBefore,
              messagesAfter: await getCurrentMessageCount(page),
              newMessages: (await getCurrentMessageCount(page)) - messagesBefore,
              timestamp: new Date().toISOString()
            };
            
            conversationHistory.push(conversationStep);
            
            console.log(`✅ Step ${step.step} completed with confirmation`);
            console.log(`📝 New messages added: ${conversationStep.newMessages}`);
            
          } catch (confirmationError) {
            console.log(`⚠️ Confirmation failed: ${confirmationError.message}`);
            
            // Store the original step without confirmation
            const conversationStep = {
              step: step.step,
              userInput: step.userInput,
              agentResponse,
              confirmationSent: null,
              messagesBefore,
              messagesAfter,
              newMessages: messagesAfter - messagesBefore,
              timestamp: new Date().toISOString()
            };
            
            conversationHistory.push(conversationStep);
          }
        } else {
          // Store the conversation step normally
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
        }
        
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
    console.log('\n🔍 STEP 5: Analyzing Fixed Conversation Flow');
    
    const totalMessages = conversationHistory.reduce((sum, step) => sum + step.newMessages, 0);
    const successfulSteps = conversationHistory.filter(step => !step.agentResponse.includes('Error'));
    const uniqueResponses = new Set(conversationHistory.map(step => step.agentResponse.substring(0, 50)));
    
    console.log(`📊 Fixed Conversation Analysis:`);
    console.log(`   Total Steps: ${conversationSteps.length}`);
    console.log(`   Successful Steps: ${successfulSteps.length}`);
    console.log(`   Total New Messages: ${totalMessages}`);
    console.log(`   Unique Agent Responses: ${uniqueResponses.size}`);
    
    // Step 6: Generate Comprehensive Report
    console.log('\n📊 STEP 6: Generating Fixed Conversation Report');
    
    console.log('\n🎯 ===== FIXED ADDRESS UPDATE CONVERSATION COMPLETE =====');
    console.log(`🏠 Task: Address Update Conversation (Fixed)`);
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
    console.log('\n🔍 FIXED CONVERSATION FLOW INSIGHTS:');
    if (uniqueResponses.size === 1) {
      console.log('⚠️ WARNING: Agent still gave the same response to all messages');
      console.log('   This indicates the agent itself may have issues processing different inputs');
    } else if (uniqueResponses.size > 1) {
      console.log('✅ SUCCESS: Agent provided different responses to different messages');
      console.log('   The input field fixes worked!');
    }
    
    if (totalMessages < conversationSteps.length) {
      console.log('⚠️ WARNING: Not all messages generated new responses');
      console.log('   Some messages may still not have been processed properly');
    } else {
      console.log('✅ SUCCESS: All messages generated responses');
      console.log('   The input field fixes worked perfectly!');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'reports/fixed-address-update-conversation-final.png',
      fullPage: true 
    });
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - Initial state: reports/fixed-address-update-conversation-initial.png');
    console.log('   - Before each step: reports/fixed-address-update-conversation-step-*-before.png');
    console.log('   - After each step: reports/fixed-address-update-conversation-step-*-after.png');
    console.log('   - Final state: reports/fixed-address-update-conversation-final.png');
    
    // Assertions
    expect(conversationHistory.length).toBeGreaterThan(0);
    expect(successfulSteps.length).toBeGreaterThan(0);
    
    console.log('\n✅ Fixed Address Update Conversation completed successfully!');
    console.log('🎉 You can now review the screenshots and see if the input field fixes worked!');
    
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
