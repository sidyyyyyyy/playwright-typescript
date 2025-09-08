import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentSelectorFromCLI, initAgentBySelector, getAgentHandle } from '@utils/api/ushur.Agents';
import { agentConfig } from '@configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '@utils/env';

test('Simple agent interaction - send message and capture response', async ({ page }) => {
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
  await page.waitForTimeout(5000); // Give time for the widget to initialize
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'reports/agent-initial-load.png',
    fullPage: true 
  });
  console.log('📸 Initial screenshot saved');
  
  // Look for any greeting or initial messages
  const initialPageText = await page.textContent('body');
  console.log('📄 Initial page text length:', initialPageText?.length || 0);
  
  // Find and interact with the chat input
  const testMessage = "Hello, what services do you offer?";
  console.log(`📤 Sending test message: "${testMessage}"`);
  
  try {
    // Try to find the chat input
    const chatInput = page.locator('textarea[placeholder*="Type"]').first();
    
    if (await chatInput.isVisible({ timeout: 10000 })) {
      console.log('✅ Found chat input field');
      
      // Clear and type the message
      await chatInput.click();
      await chatInput.fill(testMessage);
      
      // Take screenshot before sending
      await page.screenshot({ 
        path: 'reports/agent-before-send.png',
        fullPage: true 
      });
      
      // Send the message
      await chatInput.press('Enter');
      console.log('✅ Message sent');
      
      // Wait for potential response and take multiple screenshots to catch the response
      for (let i = 1; i <= 10; i++) {
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: `reports/agent-response-wait-${i}.png`,
          fullPage: true 
        });
        
        // Check page content changes
        const currentPageText = await page.textContent('body');
        const currentLength = currentPageText?.length || 0;
        console.log(`⏳ Wait ${i}: Page text length = ${currentLength}`);
        
        // Look for any message elements that might contain responses
        const messageElements = await page.locator('[class*="message"], [class*="chat"], [class*="response"], [class*="bot"], [class*="agent"]').all();
        
        if (messageElements.length > 0) {
          console.log(`🔍 Found ${messageElements.length} potential message elements`);
          
          for (let j = 0; j < messageElements.length; j++) {
            try {
              const text = await messageElements[j].textContent();
              if (text && text.trim().length > 0 && !text.includes(testMessage)) {
                console.log(`📥 Potential response ${j + 1}: "${text.substring(0, 200)}..."`);
              }
            } catch (e) {
              // Element might not be accessible
            }
          }
        }
        
        // Check for any new text that doesn't include our sent message
        if (currentPageText && !currentPageText.includes(testMessage)) {
          // Look for new content
          console.log('🔍 Scanning for new content...');
        }
        
        // Stop early if we see significant content changes
        if (currentLength > (initialPageText?.length || 0) + 100) {
          console.log('📈 Significant content change detected, likely response received');
          break;
        }
      }
      
      // Take final screenshot
      await page.screenshot({ 
        path: 'reports/agent-final-response.png',
        fullPage: true 
      });
      
      // Try to extract all text content and look for responses
      const finalPageText = await page.textContent('body');
      console.log('📄 Final page text length:', finalPageText?.length || 0);
      
      // Look for common response patterns
      if (finalPageText) {
        const lines = finalPageText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        console.log('📋 Page content lines:');
        lines.forEach((line, index) => {
          if (line && line.length > 10) {
            console.log(`  ${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          }
        });
      }
      
    } else {
      console.log('❌ Could not find chat input field');
      
      // Try alternative methods
      await page.keyboard.type(testMessage);
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: 'reports/agent-alternative-method.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ Error during interaction:', error);
    
    await page.screenshot({ 
      path: 'reports/agent-interaction-error.png',
      fullPage: true 
    });
  }
  
  console.log('✅ Test completed!');
});
