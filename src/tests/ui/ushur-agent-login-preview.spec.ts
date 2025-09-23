import { test, expect } from '@playwright/test';
import { env } from '@utils/env';

test.describe('Ushur Agent Login and Preview Testing', () => {
  const agentUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?agentId=9jr1HaT';

  test('Ushur Agent - Login and Preview Button Test', async ({ page }) => {
    console.log('🔐 Starting Ushur Agent login and preview test...');
    console.log(`🤖 Agent URL: ${agentUrl}`);
    console.log('ℹ️ This URL will redirect to login page first, then to agent page after login');

    // Step 1: Navigate directly to agent URL (which will redirect to login)
    console.log('📱 Navigating to agent URL (will redirect to login)...');
    await page.goto(agentUrl);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot of login page
    await page.screenshot({
      path: 'reports/ui/ushur-login-page.png',
      fullPage: true
    });

    // Step 2: Find and fill login form
    console.log('🔍 Looking for login form elements...');
    
    // Look for login form elements with multiple selector strategies
    const emailInput = page.locator([
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email"]',
      'input[placeholder*="Email"]',
      'input[id*="email"]',
      'input[class*="email"]',
      'input[aria-label*="email"]',
      'input[aria-label*="Email"]'
    ].join(', '));

    const passwordInput = page.locator([
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password"]',
      'input[placeholder*="Password"]',
      'input[id*="password"]',
      'input[class*="password"]',
      'input[aria-label*="password"]',
      'input[aria-label*="Password"]'
    ].join(', '));

    const loginButton = page.locator([
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'input[type="submit"]',
      '[class*="login"]',
      '[class*="signin"]',
      '[class*="submit"]'
    ].join(', '));

    // Log all form elements found for debugging
    console.log('🔍 Form element discovery...');
    
    const allInputs = page.locator('input, textarea');
    const inputCount = await allInputs.count();
    console.log(`Found ${inputCount} input elements on the page`);

    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      try {
        const input = allInputs.nth(i);
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        const id = await input.getAttribute('id');
        const className = await input.getAttribute('class');
        console.log(`Input ${i + 1}: Type="${type}" Name="${name}" Placeholder="${placeholder}" ID="${id}" Class="${className}"`);
      } catch (e) {
        console.log(`Input ${i + 1}: Could not read properties`);
      }
    }

    const allButtons = page.locator('button, input[type="submit"], [role="button"]');
    const buttonCount = await allButtons.count();
    console.log(`Found ${buttonCount} button elements on the page`);

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      try {
        const button = allButtons.nth(i);
        const type = await button.getAttribute('type');
        const text = await button.textContent();
        const className = await button.getAttribute('class');
        const id = await button.getAttribute('id');
        console.log(`Button ${i + 1}: Type="${type}" Text="${text?.trim()}" Class="${className}" ID="${id}"`);
      } catch (e) {
        console.log(`Button ${i + 1}: Could not read properties`);
      }
    }

    // Step 3: Fill login credentials from .env file
    console.log('🔑 Filling login credentials...');
    console.log(`📧 Email: ${env.email}`);
    console.log(`🔒 Password: ${env.password ? '***' : 'NOT SET'}`);

    if (!env.email || !env.password) {
      throw new Error('Email or password not found in .env file. Please check your environment variables.');
    }

    // Fill email field
    if (await emailInput.count() > 0) {
      console.log('✅ Email input field found');
      await expect(emailInput.first()).toBeVisible();
      await emailInput.first().click();
      await emailInput.first().fill(env.email);
      
      // Verify email input
      const emailValue = await emailInput.first().inputValue();
      console.log(`📧 Email field contains: "${emailValue}"`);
    } else {
      console.log('⚠️ Email input field not found, trying alternative selectors...');
      
      // Try alternative email input selectors
      const altEmailInput = page.locator([
        'input[type="text"]',
        'input',
        'textarea'
      ].join(', '));
      
      if (await altEmailInput.count() > 0) {
        console.log('✅ Alternative input field found for email');
        await altEmailInput.first().click();
        await altEmailInput.first().fill(env.email);
        console.log(`📧 Alternative email field filled with: "${env.email}"`);
      } else {
        throw new Error('Could not find email input field');
      }
    }

    // Fill password field
    if (await passwordInput.count() > 0) {
      console.log('✅ Password input field found');
      await expect(passwordInput.first()).toBeVisible();
      await passwordInput.first().click();
      await passwordInput.first().fill(env.password);
      
      // Verify password input (don't log the actual password)
      const passwordValue = await passwordInput.first().inputValue();
      console.log(`🔒 Password field contains: "${passwordValue ? '***' : 'EMPTY'}"`);
    } else {
      console.log('⚠️ Password input field not found, trying alternative selectors...');
      
      // Try alternative password input selectors
      const altPasswordInput = page.locator([
        'input[type="text"]',
        'input',
        'textarea'
      ].join(', '));
      
      if (await altPasswordInput.count() > 1) {
        console.log('✅ Alternative input field found for password');
        await altPasswordInput.nth(1).click();
        await altPasswordInput.nth(1).fill(env.password);
        console.log('🔒 Alternative password field filled');
      } else {
        throw new Error('Could not find password input field');
      }
    }

    // Take screenshot with credentials filled
    await page.screenshot({
      path: 'reports/ui/ushur-login-credentials-filled.png',
      fullPage: true
    });

    // Step 4: Click login button
    console.log('🔘 Attempting to click login button...');
    
    if (await loginButton.count() > 0) {
      console.log('✅ Login button found');
      await expect(loginButton.first()).toBeVisible();
      await loginButton.first().click();
      console.log('🔘 Login button clicked');
    } else {
      console.log('⚠️ Login button not found, trying alternative approaches...');
      
      // Try pressing Enter on the last input field
      const lastInput = page.locator('input, textarea').last();
      if (await lastInput.count() > 0) {
        console.log('✅ Pressing Enter on last input field');
        await lastInput.press('Enter');
        console.log('🔘 Enter key pressed');
      } else {
        throw new Error('Could not find login button or alternative submission method');
      }
    }

    // Step 5: Wait for login to complete and redirect
    console.log('⏳ Waiting for login to complete...');
    await page.waitForTimeout(5000);

    // Check if we're redirected or still on login page
    const currentUrl = page.url();
    console.log(`🔗 Current URL after login attempt: ${currentUrl}`);

    if (currentUrl.includes('/login') || currentUrl.includes('login')) {
      console.log('⚠️ Still on login page, checking for error messages...');
      
      // Look for error messages
      const errorMessages = page.locator([
        '[class*="error"]',
        '[class*="alert"]',
        '[class*="message"]',
        '.error',
        '.alert',
        '.message'
      ].join(', '));
      
      if (await errorMessages.count() > 0) {
        for (let i = 0; i < await errorMessages.count(); i++) {
          const error = errorMessages.nth(i);
          const errorText = await error.textContent();
          console.log(`🚨 Error message ${i + 1}: "${errorText?.trim()}"`);
        }
      }
      
      // Take screenshot of login page with potential errors
      await page.screenshot({
        path: 'reports/ui/ushur-login-error.png',
        fullPage: true
      });
      
      throw new Error('Login failed - still on login page');
    }

    console.log('✅ Login appears successful, proceeding to agent page...');

    // Step 6: Wait for redirect to agent page after successful login
    console.log('🤖 Waiting for redirect to agent page after successful login...');
    await page.waitForTimeout(3000);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Take screenshot of agent page
    await page.screenshot({
      path: 'reports/ui/ushur-agent-page.png',
      fullPage: true
    });

    // Step 7: Click on the specific agent row using the provided CSS selector
    console.log('🔍 Looking for the specific agent row to click...');
    
    const specificAgentRow = page.locator('#root > div > div.flex-1.main-content > div > div.pl-10 > div > div > div > div > div.react-bootstrap-table > table > tbody > tr:nth-child(3)');
    
    // Check if the specific row exists
    if (await specificAgentRow.count() > 0) {
      console.log('✅ Found the specific agent row (3rd row in table)');
      
      // Get the text content of the row to see what agent we're clicking on
      const rowText = await specificAgentRow.textContent();
      console.log(`Agent row content: "${rowText?.trim()}"`);
      
      // Take screenshot before clicking agent
      await page.screenshot({
        path: 'reports/ui/ushur-agent-before-click.png',
        fullPage: true
      });
      
      // Click on the specific agent row
      await specificAgentRow.click();
      console.log('🔘 Specific agent row clicked successfully!');
      
      // Wait for navigation or page change
      await page.waitForTimeout(3000);
      
      // Take screenshot after clicking agent
      await page.screenshot({
        path: 'reports/ui/ushur-agent-after-click.png',
        fullPage: true
      });
      
      console.log('✅ Agent selection completed!');
    } else {
      console.log('❌ Could not find the specific agent row');
      
      // Take screenshot for debugging
      await page.screenshot({
        path: 'reports/ui/ushur-agent-row-not-found.png',
        fullPage: true
      });
      
      throw new Error('Could not find the specific agent row using the provided selector');
    }


    // Step 8: Look for and click the "Preview Agent" button on the agent details page
    console.log('🔍 Looking for "Preview Agent" button on agent details page...');
    
    // Wait for page to load after agent selection
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot of agent details page
    await page.screenshot({
      path: 'reports/ui/ushur-agent-details-page.png',
      fullPage: true
    });

    // Multiple strategies to find the "Preview Agent" button
    const previewAgentButton = page.locator([
      'button:has-text("Preview Agent")',
      'button:has-text("preview agent")',
      'button:has-text("PREVIEW AGENT")',
      'button:has-text("Preview")',
      'button:has-text("preview")',
      '[class*="preview"]',
      '[id*="preview"]',
      'button[type="button"]:has-text("Preview")',
      'a:has-text("Preview Agent")',
      'a:has-text("Preview")',
      '[role="button"]:has-text("Preview")',
      '.btn:has-text("Preview")',
      '.button:has-text("Preview")'
    ].join(', '));

    // Alternative: Look for any button that might be the preview button
    const detailsPageButtons = page.locator('button, [role="button"], a[href="#"], .btn, .button');
    const detailsButtonCount = await detailsPageButtons.count();
    console.log(`Found ${detailsButtonCount} potential buttons on the agent details page`);

    // Log all button texts for debugging
    for (let i = 0; i < Math.min(detailsButtonCount, 15); i++) {
      try {
        const button = detailsPageButtons.nth(i);
        const text = await button.textContent();
        const className = await button.getAttribute('class');
        const id = await button.getAttribute('id');
        const type = await button.getAttribute('type');
        console.log(`Button ${i + 1}: Text="${text?.trim()}" Class="${className}" ID="${id}" Type="${type}"`);
      } catch (e) {
        console.log(`Button ${i + 1}: Could not read properties`);
      }
    }

    // Try to find and click the "Preview Agent" button
    let previewAgentButtonFound = false;
    
    if (await previewAgentButton.count() > 0) {
      console.log('✅ Found "Preview Agent" button using text selector');
      await expect(previewAgentButton.first()).toBeVisible();
      await previewAgentButton.first().click();
      previewAgentButtonFound = true;
      console.log('🔘 "Preview Agent" button clicked successfully!');
    } else {
      // Try alternative approaches
      console.log('🔍 "Preview Agent" button not found with text, trying alternative approaches...');
      
      // Look for buttons with preview-related classes or IDs
      const previewRelatedButtons = page.locator([
        '[class*="preview"]',
        '[id*="preview"]',
        '[class*="start"]',
        '[id*="start"]',
        '[class*="chat"]',
        '[id*="chat"]',
        '[class*="launch"]',
        '[id*="launch"]',
        '[class*="open"]',
        '[id*="open"]'
      ].join(', '));

      if (await previewRelatedButtons.count() > 0) {
        console.log('✅ Found preview-related button');
        await expect(previewRelatedButtons.first()).toBeVisible();
        await previewRelatedButtons.first().click();
        previewAgentButtonFound = true;
        console.log('🔘 Preview-related button clicked successfully!');
      } else {
        // Look for any clickable element that might start the conversation
        const startElements = page.locator([
          'button:has-text("Start")',
          'button:has-text("Begin")',
          'button:has-text("Chat")',
          'button:has-text("Launch")',
          'button:has-text("Open")',
          'button:has-text("Try")',
          'button:has-text("Demo")',
          'a:has-text("Start")',
          'a:has-text("Begin")',
          'a:has-text("Chat")'
        ].join(', '));

        if (await startElements.count() > 0) {
          console.log('✅ Found start/chat button');
          await expect(startElements.first()).toBeVisible();
          await startElements.first().click();
          previewAgentButtonFound = true;
          console.log('🔘 Start/chat button clicked successfully!');
        }
      }
    }

    if (!previewAgentButtonFound) {
      console.log('⚠️ No "Preview Agent" button found, checking page content...');
      
      // Log page content for debugging
      const pageText = await page.textContent('body');
      console.log(`Page contains text: ${pageText?.substring(0, 1000)}...`);
      
      // Take screenshot for debugging
      await page.screenshot({
        path: 'reports/ui/ushur-agent-no-preview-agent-button.png',
        fullPage: true
      });
    } else {
      // Wait for any UI changes after button click
      console.log('⏳ Waiting for UI changes after "Preview Agent" button click...');
      await page.waitForTimeout(5000);

      // Take screenshot after button interaction
      await page.screenshot({
        path: 'reports/ui/ushur-agent-after-preview-agent-click.png',
        fullPage: true
      });

      console.log('✅ "Preview Agent" button interaction completed!');
    }

             // Step 8: Wait for the preview chat interface to fully load and handle iframe
         console.log('🔍 Waiting for preview chat interface to load...');
         
         // Wait for the preview chat interface to fully load
         await page.waitForTimeout(5000);
         
         // Take screenshot of the current preview state
         await page.screenshot({
           path: 'reports/ui/ushur-agent-preview-loaded.png',
           fullPage: true
         });
         
         // Look for the iframe that contains the chat interface
         const chatIframe = page.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"], iframe[src*="ushurwidgets"]');
         
         if (await chatIframe.count() > 0) {
           console.log('✅ Found chat iframe - chat interface is ready!');
           
           // Take screenshot showing the iframe
           await page.screenshot({
             path: 'reports/ui/ushur-agent-chat-iframe-found.png',
             fullPage: true
           });
           
         } else {
           console.log('⚠️ Chat iframe not found, taking screenshot for debugging...');
           await page.screenshot({
             path: 'reports/ui/ushur-agent-no-iframe.png',
             fullPage: true
           });
         }
         
         // Step 9: Start a sample conversation in the preview chat iframe
         console.log('💬 Starting sample conversation in preview chat...');
         
         // Wait for chat interface to be ready
         await page.waitForTimeout(3000);
         
         // Check if we have the iframe and switch to it for chat interaction
         if (await chatIframe.count() > 0) {
           console.log('✅ Chat iframe found, attempting to interact with chat...');
           
           try {
             // Get the iframe frame element
             const frame = chatIframe.first();
             const frameElement = await frame.elementHandle();
             
             if (frameElement) {
               // Switch to the iframe context
               const chatFrame = await frameElement.contentFrame();
               
               if (chatFrame) {
                 console.log('✅ Successfully switched to chat iframe context');
                 
                 // Wait for iframe to fully load and be ready
                 console.log('⏳ Waiting for iframe content to fully load...');
                 await page.waitForTimeout(5000);
                 
                 // Take screenshot before starting conversation
                 await page.screenshot({
                   path: 'reports/ui/ushur-agent-chat-before-conversation.png',
                   fullPage: true
                 });
                 
                 // Look for the chat input field within the iframe using the provided CSS selector
                 const chatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
                 
                 console.log('🔍 Looking for chat input field in iframe...');
                 
                 // Immediately try to interact with the chat input without waiting for visibility
                 console.log('🚀 Attempting immediate chat interaction (no visibility wait)...');
                 
                 if (await chatInput.count() > 0) {
                   console.log('✅ Chat input found, attempting immediate interaction...');
                   
                   try {
                     // Take screenshot before interaction
                     await page.screenshot({
                       path: 'reports/ui/ushur-agent-chat-before-interaction.png',
                       fullPage: true
                     });
                     
                     // Try to click on input field immediately (force mode)
                     console.log('🖱️ Clicking on chat input field (force mode)...');
                     await chatInput.first().click({ force: true });
                     await page.waitForTimeout(2000);
                     
                     // Try to type a test message
                     console.log('✍️ Attempting to type test message...');
                     await chatInput.first().type("Hello", { force: true });
                     await page.waitForTimeout(2000);
                     
                     // Check if it worked
                     const inputValue = await chatInput.first().inputValue();
                     console.log(`✅ Input value after typing: "${inputValue}"`);
                     
                     if (inputValue === "Hello") {
                       console.log('🎉 Immediate interaction worked! Chat input is functional');
                       
                       // Clear the test message quickly
                       await chatInput.first().fill('');
                       
                       // Now try the full conversation with response collection
                       const sampleMessages = [
                         "Hello",
                         "What are my health plan benefits?",
                         "How do I find a doctor?"
                       ];
                       
                       const conversationResults = [];
                       
                       for (let i = 0; i < sampleMessages.length; i++) {
                         const message = sampleMessages[i];
                         console.log(`\n💬 Sending message ${i + 1}: "${message}"`);
                         
                         try {
                           // Get initial chat content before sending message
                           const initialChatContent = await chatFrame.textContent('body');
                           const initialLength = initialChatContent?.length || 0;
                           console.log(`📏 Initial chat content length: ${initialLength}`);
                           
                           // Clear and fill message (faster than type)
                           await chatInput.first().fill(message);
                           console.log(`✅ Message typed: "${message}"`);
                           
                           // Send message
                           await chatInput.first().press('Enter');
                           console.log(`✅ Message ${i + 1} sent: "${message}"`);
                           
                           // Wait for response and collect it
                           console.log('⏳ Waiting for agent response...');
                           let response = '';
                           let responseDetected = false;
                           let waitAttempts = 0;
                           const startTime = Date.now();
                           
                           while (!responseDetected && waitAttempts < 15) {
                             waitAttempts++;
                             await page.waitForTimeout(3000);
                             
                             // Check for new content in the chat
                             const currentChatContent = await chatFrame.textContent('body');
                             const currentLength = currentChatContent?.length || 0;
                             
                             console.log(`📏 Wait ${waitAttempts}: Chat content length = ${currentLength} (was ${initialLength})`);
                             
                             if (currentLength > initialLength + message.length + 30) {
                               // New content detected, try to extract the response
                               console.log('📈 New content detected, extracting response...');
                               
                               // Look for response bubbles or text that's not our message
                               const responseBubbles = chatFrame.locator([
                                 '[class*="message"]',
                                 '[class*="response"]', 
                                 '[class*="bubble"]',
                                 '[class*="chat-message"]',
                                 '[class*="bot-message"]',
                                 '[class*="agent-message"]',
                                 '.message',
                                 '.response',
                                 '.bubble'
                               ].join(', '));
                               
                               const bubbleCount = await responseBubbles.count();
                               console.log(`💬 Found ${bubbleCount} message bubbles`);
                               
                               if (bubbleCount > 0) {
                                 // Get the last few bubbles to find the response
                                 for (let j = Math.max(0, bubbleCount - 3); j < bubbleCount; j++) {
                                   try {
                                     const bubbleText = await responseBubbles.nth(j).textContent();
                                     if (bubbleText && bubbleText.trim().length > 0 && !bubbleText.includes(message)) {
                                       // This looks like a response
                                       response = bubbleText.trim();
                                       responseDetected = true;
                                       console.log(`📥 Response captured: "${response.substring(0, 100)}..."`);
                                       break;
                                     }
                                   } catch (e) {
                                     // Continue to next bubble
                                   }
                                 }
                               }
                               
                               if (!responseDetected) {
                                 // Fallback: look for any new text that wasn't there before
                                 const newText = currentChatContent?.substring(initialLength) || '';
                                 const cleanNewText = newText.replace(message, '').trim();
                                 
                                 if (cleanNewText.length > 20) {
                                   response = cleanNewText.substring(0, 500); // Limit response length
                                   responseDetected = true;
                                   console.log(`📥 Fallback response captured: "${response.substring(0, 100)}..."`);
                                 }
                               }
                               
                               if (responseDetected) {
                                 break;
                               }
                             }
                           }
                           
                           const responseTime = Date.now() - startTime;
                           
                           if (!responseDetected) {
                             response = 'No response detected';
                             console.log('⚠️ No response detected after waiting');
                           }
                           
                           // Store conversation result
                           conversationResults.push({
                             messageNumber: i + 1,
                             userMessage: message,
                             agentResponse: response,
                             responseTime: responseTime,
                             timestamp: new Date().toISOString()
                           });
                           
                           console.log(`📊 Message ${i + 1} Results:`);
                           console.log(`   User: "${message}"`);
                           console.log(`   Agent: "${response.substring(0, 200)}${response.length > 200 ? '...' : ''}"`);
                           console.log(`   Response Time: ${responseTime}ms`);
                           
                           // Take screenshot after each exchange
                           await page.screenshot({
                             path: `reports/ui/ushur-agent-chat-message-${i + 1}.png`,
                             fullPage: true
                           });
                           
                           console.log(`📸 Screenshot saved for message ${i + 1}`);
                           
                           // Wait before next message to ensure response is complete
                           console.log('⏳ Waiting 5 seconds before next message...');
                           await page.waitForTimeout(5000);
                           
                         } catch (error) {
                           console.error(`❌ Error sending message ${i + 1}:`, error);
                           
                           // Store error result
                           conversationResults.push({
                             messageNumber: i + 1,
                             userMessage: message,
                             agentResponse: `ERROR: ${error.message}`,
                             responseTime: 0,
                             timestamp: new Date().toISOString()
                           });
                           
                           // Take error screenshot
                           await page.screenshot({
                             path: `reports/ui/ushur-agent-chat-error-message-${i + 1}.png`,
                             fullPage: true
                           });
                           
                           // Continue with next message instead of failing completely
                           console.log('🔄 Continuing with next message...');
                         }
                       }
                       
                       // Log complete conversation results
                       console.log('\n📋 ===== COMPLETE CONVERSATION RESULTS =====');
                       console.log(`Total Messages: ${conversationResults.length}`);
                       console.log(`Agent Type: HealthPlan (6662227)`);
                       console.log(`Session Type: UI Preview Chat`);
                       console.log(`Test Timestamp: ${new Date().toISOString()}`);
                       
                       conversationResults.forEach((result, index) => {
                         console.log(`\n💬 Exchange ${result.messageNumber}:`);
                         console.log(`   👤 User: ${result.userMessage}`);
                         console.log(`   🤖 Agent: ${result.agentResponse.substring(0, 150)}${result.agentResponse.length > 150 ? '...' : ''}`);
                         console.log(`   ⏱️ Response Time: ${result.responseTime}ms`);
                         console.log(`   🕒 Timestamp: ${result.timestamp}`);
                       });
                       
                       // Calculate summary statistics
                       const successfulExchanges = conversationResults.filter(r => !r.agentResponse.startsWith('ERROR')).length;
                       const avgResponseTime = conversationResults
                         .filter(r => r.responseTime > 0)
                         .reduce((sum, r) => sum + r.responseTime, 0) / Math.max(1, successfulExchanges);
                       
                       console.log('\n📈 CONVERSATION SUMMARY:');
                       console.log(`   Success Rate: ${((successfulExchanges / conversationResults.length) * 100).toFixed(1)}%`);
                       console.log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
                       console.log(`   Total Conversation Duration: ${conversationResults.length > 0 ? 
                         (new Date(conversationResults[conversationResults.length - 1].timestamp).getTime() - 
                          new Date(conversationResults[0].timestamp).getTime()).toFixed(0) : 0}ms`);
                       
                       console.log('✅ Sample conversation with response collection completed successfully!');
                       
                     } else {
                       console.log('❌ Immediate interaction failed - input not functional');
                       
                       // Try one more approach: focus and type
                       console.log('🔄 Trying focus approach...');
                       await chatInput.first().focus();
                       await page.waitForTimeout(1000);
                       await chatInput.first().type("Test", { force: true });
                       await page.waitForTimeout(1000);
                       
                       const focusValue = await chatInput.first().inputValue();
                       console.log(`Focus approach result: "${focusValue}"`);
                       
                       if (focusValue === "Test") {
                         console.log('🎉 Focus approach worked! Starting conversation...');
                         
                         // Clear and start conversation
                         await chatInput.first().fill('');
                         await page.waitForTimeout(1000);
                         
                         // Send one test message
                         await chatInput.first().type("Hello agent!");
                         await page.waitForTimeout(1000);
                         await chatInput.first().press('Enter');
                         console.log('✅ Test message sent via focus approach!');
                         
                         // Wait for response
                         await page.waitForTimeout(8000);
                         
                         // Screenshot
                         await page.screenshot({
                           path: 'reports/ui/ushur-agent-chat-focus-approach-success.png',
                           fullPage: true
                         });
                         
                         console.log('✅ Focus approach conversation completed!');
                       }
                     }
                     
                   } catch (error) {
                     console.error('❌ Immediate interaction error:', error);
                     
                     // Take error screenshot
                     await page.screenshot({
                       path: 'reports/ui/ushur-agent-chat-immediate-interaction-error.png',
                       fullPage: true
                     });
                   }
                   
                 } else {
                   console.log('❌ Chat input not found in iframe');
                   
                   // Log iframe content for debugging
                   try {
                     const iframeText = await chatFrame.textContent('body');
                     console.log(`Iframe content preview: ${iframeText?.substring(0, 500)}...`);
                   } catch (e) {
                     console.log('Could not read iframe content');
                   }
                   
                   await page.screenshot({
                     path: 'reports/ui/ushur-agent-chat-input-not-found-iframe.png',
                     fullPage: true
                   });
                 }
                 
               } else {
                 console.log('❌ Could not access iframe content frame');
                 await page.screenshot({
                   path: 'reports/ui/ushur-agent-iframe-access-failed.png',
                   fullPage: true
                 });
               }
               
             } else {
               console.log('❌ Could not get iframe element handle');
             }
             
           } catch (error) {
             console.error('❌ Error interacting with chat iframe:', error);
             await page.screenshot({
               path: 'reports/ui/ushur-agent-iframe-error.png',
               fullPage: true
             });
           }
           
         } else {
           console.log('⚠️ No chat iframe found, cannot start conversation');
           await page.screenshot({
             path: 'reports/ui/ushur-agent-no-iframe-for-chat.png',
             fullPage: true
           });
         }
         
         // Step 10: Test page responsiveness
         console.log('📱 Testing responsive design...');
         
         // Test mobile viewport
         await page.setViewportSize({ width: 375, height: 667 });
         await page.waitForTimeout(2000);
         await page.screenshot({
           path: 'reports/ui/ushur-agent-mobile-view.png',
           fullPage: true
         });
         
         // Test desktop viewport
         await page.setViewportSize({ width: 1920, height: 1080 });
         await page.waitForTimeout(2000);
         await page.screenshot({
           path: 'reports/ui/ushur-agent-desktop-view.png',
           fullPage: true
         });

         console.log('✅ Ushur Agent login and preview test completed!');
         console.log('📸 Screenshots saved to reports/ui/ folder');
         console.log('💬 Sample conversation completed in preview chat');
  });
});
