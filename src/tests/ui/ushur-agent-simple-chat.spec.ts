import { test, expect } from '@playwright/test';

test.describe('Ushur Agent Simple Chat Testing', () => {
  test('Simple Chat Conversation Test', async ({ page }) => {
    // Increase test timeout to allow for longer conversations
    // 3 messages × 15 seconds wait + 3 seconds between messages + buffer time = ~60 seconds minimum
    // Setting to 5 minutes (300 seconds) to ensure plenty of time for responses
    test.setTimeout(300000); // 5 minutes (300 seconds)
    
    // Set normal window size to match manual testing
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('🖥️ Set viewport to normal desktop size: 1920x1080');
    
    console.log('🔐 Starting simple chat conversation test...');
    
    // Navigate to the agent URL
    const agentUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?agentId=9jr1HaT';
    console.log(`🤖 Agent URL: ${agentUrl}`);
    
    await page.goto(agentUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot of login page
    await page.screenshot({
      path: 'reports/ui/simple-chat-login-page.png',
      fullPage: true
    });
    
    // Find and fill login form
    console.log('🔍 Looking for login form...');
    
    const emailInput = page.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Login")').first();
    
    // Fill credentials from environment (using the exact names from .env file)
    const email = process.env.USHUR_USER_EMAIL || 'femila.david@ushur.com';
    const password = process.env.USHUR_USER_PASSWORD || 'your_password_here';
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Password: ${password ? '***' : 'NOT SET'}`);
    
    if (!email || !password || password === 'your_password_here') {
      throw new Error('Email or password not properly set. Please check your .env file.');
    }
    
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await loginButton.click();
    
    console.log('🔘 Login button clicked');
    
    // Wait for navigation to complete
    console.log('⏳ Waiting for login redirect...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check if we're redirected
    const currentUrl = page.url();
    console.log(`🔗 Current URL after login: ${currentUrl}`);
    
    // If still on login page, wait longer
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('⚠️ Still on login page, waiting for redirect...');
      await page.waitForTimeout(10000);
      await page.waitForLoadState('networkidle');
    }
    
    // Take screenshot after login
    await page.screenshot({
      path: 'reports/ui/simple-chat-after-login.png',
      fullPage: true
    });
    
    // Look for any agent row in the table
    console.log('🔍 Looking for agent rows...');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot to see what's on the page
    await page.screenshot({
      path: 'reports/ui/simple-chat-page-after-login.png',
      fullPage: true
    });
    
    // Try multiple strategies to find agents
    let agentRow = null;
    
    // Debug: Log page content
    const pageText = await page.textContent('body');
    console.log(`📄 Page contains text: ${pageText?.substring(0, 500)}...`);
    
    // Strategy 1: Look for table rows with more flexible selectors
    const tableRows = page.locator([
      'table tbody tr',
      '[class*="table"] tbody tr', 
      '[class*="list"] [class*="item"]',
      '[class*="row"]',
      'tr',
      '[role="row"]'
    ].join(', '));
    
    const rowCount = await tableRows.count();
    console.log(`📊 Found ${rowCount} potential table rows`);
    
    // Log first few rows for debugging
    for (let i = 0; i < Math.min(rowCount, 5); i++) {
      try {
        const rowText = await tableRows.nth(i).textContent();
        console.log(`Row ${i}: "${rowText?.trim()}"`);
      } catch (e) {
        console.log(`Row ${i}: Could not read`);
      }
    }
    
    if (rowCount > 0) {
      // Skip header row, take the first data row
      agentRow = tableRows.nth(1); // 2nd row (index 1) to skip header
      console.log('✅ Using table row strategy');
    } else {
      // Strategy 2: Look for agent links
      const agentLinks = page.locator([
        'a[href*="agent"]',
        'button[class*="agent"]:not(:has-text("Add")):not(:has-text("Create"))',
        '[data-agent-id]',
        '[class*="agent-name"]',
        'a:has-text("HealthPlan")',
        'a:has-text("6662227")'
      ].join(', '));
      
      const linkCount = await agentLinks.count();
      console.log(`🔗 Found ${linkCount} agent links`);
      
      if (linkCount > 0) {
        agentRow = agentLinks.first();
        console.log('✅ Using agent link strategy');
      }
    }
    
    if (agentRow) {
      console.log('✅ Found agent element, clicking...');
      await agentRow.click();
      await page.waitForTimeout(3000);
      
      // Take screenshot after agent selection
      await page.screenshot({
        path: 'reports/ui/simple-chat-agent-selected.png',
        fullPage: true
      });
      
      // Look for Preview Agent button
      const previewButton = page.locator('button:has-text("Preview Agent")').first();
      if (await previewButton.count() > 0) {
        console.log('✅ Found Preview Agent button, clicking...');
        await previewButton.click();
        await page.waitForTimeout(5000);
        
        // Take screenshot after preview button
        await page.screenshot({
          path: 'reports/ui/simple-chat-preview-clicked.png',
          fullPage: true
        });
        
        // Look for chat iframe
        const chatIframe = page.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
        
        if (await chatIframe.count() > 0) {
          console.log('✅ Found chat iframe, switching context...');
          
          // Switch to iframe
          const frame = await chatIframe.elementHandle();
          const chatFrame = await frame?.contentFrame();
          
          if (chatFrame) {
            console.log('✅ Successfully switched to chat iframe');
            
            // Wait for iframe to load
            await page.waitForTimeout(5000);
            
            // Look for chat input using your exact selector
            const chatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
            
            if (await chatInput.count() > 0) {
              console.log('✅ Found chat input, starting conversation...');
              
              // Simple messages
              const messages = ["Hello", "How are you?", "What can you help me with?"];
              
              // Array to store conversation details
              const conversationLog = [];
              
              for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                const messageTime = new Date().toISOString();
                console.log(`\n💬 Sending message ${i + 1}: "${message}"`);
                
                try {
                  // Re-locate chat input for each message to ensure it's still available
                  console.log(`🔍 Re-locating chat input for message ${i + 1}...`);
                  const currentChatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
                  
                  // Verify chat input is still available
                  const inputCount = await currentChatInput.count();
                  console.log(`📝 Found ${inputCount} chat input elements`);
                  
                  if (inputCount === 0) {
                    throw new Error(`Chat input not found for message ${i + 1}`);
                  }
                  
                  // Wait for input field to be enabled and ready
                  console.log(`⏳ Waiting for input field to be ready for message ${i + 1}...`);
                  
                  // For messages after the first one, wait for the input to become interactive
                  if (i > 0) {
                    console.log(`🔄 Waiting for input field to become interactive after message ${i}...`);
                    
                    // Wait for input to be enabled (not disabled)
                    let attempts = 0;
                    let inputReady = false;
                    
                    while (!inputReady && attempts < 10) {
                      attempts++;
                      await page.waitForTimeout(1000);
                      
                      try {
                        // Check if input is enabled and can receive focus
                        const isDisabled = await currentChatInput.first().getAttribute('disabled');
                        const isReadOnly = await currentChatInput.first().getAttribute('readonly');
                        
                        if (!isDisabled && !isReadOnly) {
                          console.log(`✅ Input field is ready after ${attempts} attempts`);
                          inputReady = true;
                        } else {
                          console.log(`⏳ Attempt ${attempts}: Input disabled=${isDisabled}, readonly=${isReadOnly}`);
                        }
                      } catch (e) {
                        console.log(`⏳ Attempt ${attempts}: Checking input state...`);
                      }
                    }
                    
                    if (!inputReady) {
                      console.log(`⚠️ Input field may not be ready, proceeding anyway...`);
                    }
                  } else {
                    // For first message, just wait normally
                    await page.waitForTimeout(2000);
                  }
                  
                  // Try multiple approaches to ensure input works
                  console.log(`✍️ Typing message ${i + 1}: "${message}"`);
                  
                  // Approach 1: Click and clear
                  await currentChatInput.first().click();
                  await page.waitForTimeout(500);
                  
                  // Clear field using multiple methods
                  await currentChatInput.first().fill('');
                  await page.waitForTimeout(300);
                  await currentChatInput.first().press('Control+a');
                  await page.waitForTimeout(300);
                  await currentChatInput.first().press('Delete');
                  await page.waitForTimeout(500);
                  
                  // Type the message
                  await currentChatInput.first().type(message, { delay: 100 });
                  await page.waitForTimeout(1000);
                  
                  // Verify the message was typed
                  const inputValue = await currentChatInput.first().inputValue();
                  console.log(`📋 Input value after typing: "${inputValue}"`);
                  
                  if (inputValue !== message) {
                    console.log(`⚠️ Warning: Expected "${message}", but input contains "${inputValue}"`);
                  }
                  
                  // Send the message
                  console.log(`📤 Pressing Enter to send message ${i + 1}...`);
                  await currentChatInput.first().press('Enter');
                  
                  console.log(`✅ Message ${i + 1} sent: "${message}"`);
                  
                  // Wait for response with fixed 15-second timeout
                  console.log('⏳ Waiting 15 seconds for agent response...');
                  await page.waitForTimeout(15000);
                  
                  // Take screenshot after response
                  await page.screenshot({
                    path: `reports/ui/simple-chat-message-${i + 1}-with-response.png`,
                    fullPage: true
                  });
                  
                  console.log(`📸 Screenshot saved for message ${i + 1} with response`);
                  
                  // Save conversation details
                  conversationLog.push({
                    messageNumber: i + 1,
                    userMessage: message,
                    timestamp: messageTime,
                    screenshotPath: `reports/ui/simple-chat-message-${i + 1}-with-response.png`,
                    inputVerified: inputValue === message
                  });
                  
                  // Wait 3 seconds before next message to ensure response is complete
                  if (i < messages.length - 1) {
                    console.log('⏳ Waiting 3 seconds before next message...');
                    await page.waitForTimeout(3000);
                  }
                  
                } catch (error) {
                  console.error(`❌ Error sending message ${i + 1}:`, error);
                  
                  // Save error details
                  conversationLog.push({
                    messageNumber: i + 1,
                    userMessage: message,
                    timestamp: messageTime,
                    error: error.message,
                    screenshotPath: `reports/ui/simple-chat-message-${i + 1}-error.png`
                  });
                }
              }
              
              // Log complete conversation summary
              console.log('\n📋 ===== CONVERSATION SUMMARY =====');
              console.log(`Total Messages: ${conversationLog.length}`);
              console.log(`Agent Type: HealthPlan`);
              console.log(`Test Timestamp: ${new Date().toISOString()}`);
              
              conversationLog.forEach((entry) => {
                console.log(`\n💬 Message ${entry.messageNumber}:`);
                console.log(`   👤 User: ${entry.userMessage}`);
                console.log(`   🕒 Timestamp: ${entry.timestamp}`);
                console.log(`   📸 Screenshot: ${entry.screenshotPath}`);
                if (entry.inputVerified !== undefined) {
                  console.log(`   ✅ Input Verified: ${entry.inputVerified ? 'YES' : 'NO'}`);
                }
                if (entry.error) {
                  console.log(`   ❌ Error: ${entry.error}`);
                }
              });
              
              console.log('\n✅ Simple chat conversation completed!');
              
            } else {
              console.log('❌ Chat input not found in iframe');
            }
            
          } else {
            console.log('❌ Could not access iframe content');
          }
          
        } else {
          console.log('❌ Chat iframe not found');
        }
        
      } else {
        console.log('❌ Preview Agent button not found');
      }
      
    } else {
      console.log('❌ Agent row not found');
    }
    
    console.log('✅ Simple chat test completed!');
  });
});
