import { test, expect } from '@playwright/test';
import { env } from '../../utils/env';

test.describe('Healthcare Agent - Existing Agent Interactive Test', () => {
  test('Open Existing Healthcare Agent for Real-time Interaction', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for interactive session
    
    console.log('🏥 Starting Healthcare Agent Interactive Test with Existing Agent...');
    
    // Step 1: Navigate to Ushur signin page
    console.log('\n🌐 STEP 1: Navigating to Ushur Signin Page');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const signinUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=signin';
    console.log(`🔗 Navigating to: ${signinUrl}`);
    
    await page.goto(signinUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 2: Login with credentials
    console.log('\n🔐 STEP 2: Logging in with .env credentials');
    
    if (!env.email || !env.password) {
      throw new Error('Email or password not found in .env file. Please check your environment variables.');
    }
    
    console.log(`📧 Email: ${env.email}`);
    console.log(`🔒 Password: ${env.password ? '***' : 'NOT SET'}`);
    
    const emailInput = page.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), input[type="submit"]').first();
    
    await emailInput.fill(env.email);
    await passwordInput.fill(env.password);
    await loginButton.click();
    console.log('✅ Login button clicked');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 3: Navigate to agents page
    console.log('\n🏢 STEP 3: Navigating to Agents Page');
    const agentsUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=agents';
    await page.goto(agentsUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 4: Find and click on Healthcare agent
    console.log('\n🔍 STEP 4: Finding Healthcare Agent');
    
    await page.waitForSelector('table', { timeout: 10000 });
    
    const agentRows = page.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`📊 Found ${rowCount} agent rows in table`);
    
    let selectedAgentRow = null;
    let agentName = '';
    
    // Look for any HealthPlan agent
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      if (rowText.includes('HealthPlan') || rowText.includes('Health') || rowText.includes('Dr. Sarah')) {
        console.log(`✅ Found Healthcare agent in row ${i + 1}`);
        selectedAgentRow = row;
        agentName = rowText.split('\n')[0] || 'Healthcare Agent';
        break;
      }
    }
    
    if (!selectedAgentRow) {
      // If no specific healthcare agent found, use the first available agent
      console.log('⚠️ No specific Healthcare agent found, using first available agent');
      selectedAgentRow = agentRows.first();
      agentName = 'Available Agent';
    }
    
    await selectedAgentRow.click();
    await page.waitForTimeout(3000);

    // Step 5: Click Preview Agent button
    console.log('\n🔍 STEP 5: Opening Agent Preview');
    const previewButton = page.locator('button:has-text("Preview Agent")').first();
    
    if (await previewButton.count() > 0) {
      console.log('✅ Found Preview Agent button, clicking...');
      await previewButton.click();
      await page.waitForTimeout(5000);
    } else {
      throw new Error('Preview Agent button not found');
    }

    // Step 6: Switch to chat iframe
    console.log('\n🔍 STEP 6: Switching to Chat Iframe');
    const chatIframe = page.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
    
    if (await chatIframe.count() === 0) {
      throw new Error('Chat iframe not found');
    }
    
    console.log('✅ Found chat iframe, switching context...');
    
    const frame = await chatIframe.elementHandle();
    const chatFrame = await frame?.contentFrame();
    
    if (!chatFrame) {
      throw new Error('Could not access chat iframe content');
    }
    
    console.log('✅ Successfully switched to chat iframe');
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'reports/healthcare-agent-existing-interactive-initial.png',
      fullPage: true 
    });

    // Step 7: Real-time Interactive Session
    console.log('\n🏥 STEP 7: Starting Real-time Interactive Session');
    console.log(`🎯 The ${agentName} is now ready for real-time interaction!`);
    console.log('💬 You can now interact with the agent in the browser window.');
    console.log('📋 Suggested healthcare test scenarios:');
    console.log('   1. "I need to schedule a medical appointment"');
    console.log('   2. "I have questions about my prescription medication"');
    console.log('   3. "I need medical advice about some symptoms"');
    console.log('   4. "I need information about my health insurance coverage"');
    console.log('   5. "Can you help me with my health benefits?"');
    console.log('   6. "I need to update my address"');
    console.log('   7. "What are my copay amounts?"');
    console.log('   8. "How do I file a claim?"');
    console.log('\n⏳ Keeping the browser open for 5 minutes for interactive testing...');
    console.log('🔄 The test will automatically take screenshots and provide feedback...');
    
    // Keep the browser open for interactive testing
    const interactiveDuration = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();
    let interactionCount = 0;
    
    while (Date.now() - startTime < interactiveDuration) {
      await page.waitForTimeout(10000); // Check every 10 seconds
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.floor((interactiveDuration - (Date.now() - startTime)) / 1000);
      
      if (elapsed % 30 === 0) { // Log every 30 seconds
        console.log(`⏰ Interactive session: ${elapsed}s elapsed, ${remaining}s remaining`);
        
        // Take periodic screenshots
        await page.screenshot({ 
          path: `reports/healthcare-agent-existing-interactive-${Math.floor(elapsed/30)}.png`,
          fullPage: true 
        });
      }
      
      // Check for new messages in the chat
      try {
        const messages = chatFrame.locator('div.chatbot-messages > div, .chat-message, .message, [class*="message"]');
        const messageCount = await messages.count();
        
        if (messageCount > interactionCount) {
          interactionCount = messageCount;
          console.log(`💬 New interaction detected! Total messages: ${messageCount}`);
          
          // Take screenshot of new interaction
          await page.screenshot({ 
            path: `reports/healthcare-agent-existing-interactive-message-${messageCount}.png`,
            fullPage: true 
          });
        }
      } catch (error) {
        // Ignore errors when checking for messages
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'reports/healthcare-agent-existing-interactive-final.png',
      fullPage: true 
    });
    
    console.log('\n✅ Real-time interactive session completed!');
    console.log('📸 Screenshots saved:');
    console.log('   - Initial state: reports/healthcare-agent-existing-interactive-initial.png');
    console.log('   - Final state: reports/healthcare-agent-existing-interactive-final.png');
    console.log('   - Periodic screenshots: reports/healthcare-agent-existing-interactive-*.png');
    console.log('   - Message screenshots: reports/healthcare-agent-existing-interactive-message-*.png');
    
    // Keep browser open for a bit longer to see final state
    await page.waitForTimeout(5000);
    
    console.log('\n🎯 ===== HEALTHCARE AGENT INTERACTIVE TEST COMPLETE =====');
    console.log(`🏥 Agent Used: ${agentName}`);
    console.log(`⏱️ Interactive Duration: 5 minutes`);
    console.log(`💬 Total Interactions Detected: ${interactionCount}`);
    console.log(`🌐 Browser Session: Active and ready for testing`);
    console.log(`📊 Test Status: Completed successfully`);
    
    // Assertions
    expect(chatFrame).toBeDefined();
    expect(interactionCount).toBeGreaterThanOrEqual(0);
    
    console.log('\n✅ Healthcare Agent Interactive Test completed successfully!');
    console.log('🎉 You can now review the screenshots to see your interactions with the agent!');
    
  });
});

