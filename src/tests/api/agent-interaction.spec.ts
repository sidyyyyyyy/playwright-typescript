import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentSelectorFromCLI, initAgentBySelector, getAgentHandle } from '@utils/api/ushur.Agents';
import { agentConfig } from '@configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '@utils/env';

test('Create agent and test interactive messaging', async ({ page }) => {
  const instance = env.instance;
  const { token, account } = await getUshurTokenFromApi();
  console.log(`🔐 Using account: ${account}`);
  
  const handle = getAgentHandle();
  console.log('selector from CLI/env:', handle);
  
  let agentUrl: string;
  
  if (handle) {
    agentUrl = await initAgentBySelector(instance, token, agentConfig, handle);
    console.log('Initialized existing agent →', agentUrl);
  } else {
    agentUrl = await createAndActivateAgent(instance, token, agentConfig, account);
    console.log('Created new agent →', agentUrl);
  }

  // Navigate to the agent session URL
  console.log('🌐 Navigating to agent URL:', agentUrl);
  await page.goto(agentUrl);
  
  // Wait for the chat interface to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Give time for the widget to initialize
  
  // Define test messages to send sequentially
  const testMessages = [
    "Hello, I need help with my banking account",
    "What are the fees for my checking account?",
    "I want to update my address, how can I do that?",
    "Can you help me with my debit card that's not working?",
    "What's the difference between savings and checking accounts?"
  ];
  
  console.log('🤖 Starting conversation with agent...');
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n📤 Sending message ${i + 1}: "${message}"`);
    
    try {
      // Try different selectors for the chat input
      const inputSelectors = [
        'input[placeholder*="Type"]',
        'textarea[placeholder*="Type"]',
        'input[type="text"]',
        'textarea',
        '[data-testid="chat-input"]',
        '.chat-input',
        '#chat-input',
        'input.message-input',
        'textarea.message-input'
      ];
      
      let inputFound = false;
      
      for (const selector of inputSelectors) {
        try {
          const input = page.locator(selector).first();
          if (await input.isVisible({ timeout: 2000 })) {
            console.log(`✅ Found input with selector: ${selector}`);
            await input.fill(message);
            await input.press('Enter');
            inputFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!inputFound) {
        console.log('❌ Could not find chat input field. Trying alternative approach...');
        
        // Try to find any clickable element that might open chat
        const clickableElements = [
          'button[aria-label*="chat"]',
          'button[title*="chat"]',
          '.chat-button',
          '[data-testid="chat-button"]',
          'button:has-text("Chat")',
          'button:has-text("Send")'
        ];
        
        for (const selector of clickableElements) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 })) {
              console.log(`🔘 Found clickable element: ${selector}`);
              await element.click();
              await page.waitForTimeout(1000);
              break;
            }
          } catch (e) {
            // Continue
          }
        }
        
        // Try keyboard shortcut to focus input
        await page.keyboard.press('Tab');
        await page.keyboard.type(message);
        await page.keyboard.press('Enter');
      }
      
      // Wait for response
      console.log('⏳ Waiting for agent response...');
      await page.waitForTimeout(3000);
      
      // Try to capture the response
      const responseSelectors = [
        '.message.bot',
        '.message.agent',
        '.chat-message.bot',
        '.chat-message.agent',
        '[data-testid="bot-message"]',
        '[data-testid="agent-message"]',
        '.agent-response',
        '.bot-response'
      ];
      
      let responseText = 'No response captured';
      
      for (const selector of responseSelectors) {
        try {
          const responses = page.locator(selector);
          const count = await responses.count();
          if (count > 0) {
            const lastResponse = responses.last();
            if (await lastResponse.isVisible()) {
              responseText = await lastResponse.textContent() || 'Empty response';
              console.log(`📥 Agent response: "${responseText}"`);
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (responseText === 'No response captured') {
        // Try to capture any new text that appeared
        const allText = await page.textContent('body');
        console.log('📄 Page content length:', allText?.length || 0);
        
        // Take a screenshot for debugging
        await page.screenshot({ 
          path: `reports/agent-interaction-step-${i + 1}.png`,
          fullPage: true 
        });
        console.log(`📸 Screenshot saved: agent-interaction-step-${i + 1}.png`);
      }
      
      // Wait before next message
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.error(`❌ Error sending message ${i + 1}:`, error);
      
      // Take screenshot on error
      await page.screenshot({ 
        path: `reports/agent-interaction-error-${i + 1}.png`,
        fullPage: true 
      });
      console.log(`📸 Error screenshot saved: agent-interaction-error-${i + 1}.png`);
    }
  }
  
  console.log('\n✅ Conversation test completed!');
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'reports/agent-interaction-final.png',
    fullPage: true 
  });
  console.log('📸 Final screenshot saved: agent-interaction-final.png');
  
  // Wait a bit more to see if any delayed responses come in
  await page.waitForTimeout(5000);
});
