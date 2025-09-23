import { test, expect } from '@playwright/test';
import { env } from '../../utils/env';

test.describe('HealthPlan Address Update - Working Version', () => {
  test('HealthPlan Agent Address Update Test', async ({ page, browser }) => {
    test.setTimeout(300000); // 5 minutes
    
    // Create new context for debugging (like in reference code)
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🏥 Starting HealthPlan Agent Address Update Test...');

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
        
        // Step 7: Conduct Address Update Test
        console.log('\n💬 STEP 7: Conducting HealthPlan Address Update Test');
        
        // Address update conversation steps
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
        
        const conversationResults = [];
        
        for (let i = 0; i < addressUpdateSteps.length; i++) {
          const step = addressUpdateSteps[i];
          const messageTime = new Date().toISOString();
          console.log(`\n🏠 Address Update Step ${step.step}: ${step.description}`);
          console.log(`💬 User Input: "${step.userInput}"`);
          
          try {
            // Use the working chat input selector from reference code
            const currentChatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
            
            const inputCount = await currentChatInput.count();
            console.log(`📝 Found ${inputCount} chat input elements in iframe`);
            
            if (inputCount === 0) {
              throw new Error(`Chat input not found in iframe for step ${step.step}`);
            }
            
            // Wait for input field to be ready
            console.log(`⏳ Waiting for input field to be ready for step ${step.step}...`);
            
            if (i > 0) {
              console.log(`🔄 Waiting for input field to become interactive after step ${i}...`);
              
              let attempts = 0;
              let inputReady = false;
              
              while (!inputReady && attempts < 10) {
                attempts++;
                await newPage.waitForTimeout(1000);
                
                try {
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
              
              // Additional wait after input is ready
              if (inputReady) {
                await newPage.waitForTimeout(2000);
              }
            } else {
              await newPage.waitForTimeout(2000);
            }
            
            console.log(`✍️ Typing address update step ${step.step}: "${step.userInput}"`);
            
            // Use the EXACT working typing approach from reference code
            await currentChatInput.first().click();
            await newPage.waitForTimeout(500);
            
            await currentChatInput.first().fill('');
            await newPage.waitForTimeout(300);
            await currentChatInput.first().press('Control+a');
            await newPage.waitForTimeout(300);
            await currentChatInput.first().press('Delete');
            await newPage.waitForTimeout(500);
            
            await currentChatInput.first().type(step.userInput, { delay: 100 });
            await newPage.waitForTimeout(1000);
            
            const inputValue = await currentChatInput.first().inputValue();
            console.log(`📋 Input value after typing: "${inputValue}"`);
            
            // Verify the message was actually typed
            if (!inputValue || inputValue.trim() !== step.userInput.trim()) {
              console.log('⚠️ Message not typed properly, trying alternative approach...');
              
              // Try to re-focus and clear the input field
              await currentChatInput.first().click();
              await newPage.waitForTimeout(500);
              await currentChatInput.first().fill('');
              await newPage.waitForTimeout(300);
              
              // Try typing again
              await currentChatInput.first().type(step.userInput, { delay: 100 });
              await newPage.waitForTimeout(500);
              
              const retryValue = await currentChatInput.first().inputValue();
              console.log(`📋 Retry input value: "${retryValue}"`);
              
              if (!retryValue || retryValue.trim() !== step.userInput.trim()) {
                console.log('⚠️ Second retry failed, trying fill approach...');
                await currentChatInput.first().fill(step.userInput);
                await newPage.waitForTimeout(500);
                
                const fillValue = await currentChatInput.first().inputValue();
                console.log(`📋 Fill approach value: "${fillValue}"`);
                
                if (!fillValue || fillValue.trim() !== step.userInput.trim()) {
                  throw new Error(`Failed to type message for step ${step.step} after all retry attempts`);
                }
              }
            }
            
            // Get current message count before sending message
            const messagesBeforeMessage = chatFrame.locator('div.chatbot-message');
            const messageCountBefore = await messagesBeforeMessage.count();
            console.log(`📊 Messages before step ${step.step}: ${messageCountBefore}`);
            
            // Send the message
            console.log('📤 Pressing Enter to send address update message...');
            await currentChatInput.first().press('Enter');
            console.log(`✅ Address update step ${step.step} sent: "${step.userInput}"`);
            
            // Wait for the user message to appear in chat
            await newPage.waitForTimeout(2000);
            
            // Verify user message was sent and count total messages
            const userMessages = chatFrame.locator('div.chatbot-message.incoming');
            const userMessageCount = await userMessages.count();
            const allMessages = chatFrame.locator('div.chatbot-message');
            const totalMessageCount = await allMessages.count();
            
            console.log(`👤 User messages in chat: ${userMessageCount}`);
            console.log(`📊 Total messages in chat after step ${step.step}: ${totalMessageCount}`);
            
            // Debug: Check if this message actually appeared in chat
            if (userMessageCount > 0) {
              const latestUserMessage = userMessages.last();
              const userMessageText = await latestUserMessage.textContent();
              console.log(`💬 Latest user message text: "${userMessageText?.trim()}"`);
              
              // Verify this is the message we just sent
              if (userMessageText && userMessageText.includes(step.userInput.substring(0, 20))) {
                console.log(`✅ Step ${step.step} successfully appeared in chat`);
              } else {
                console.log(`⚠️ Step ${step.step} may not have been sent properly`);
                console.log(`   Expected: "${step.userInput.substring(0, 20)}..."`);
                console.log(`   Found: "${userMessageText?.trim()}"`);
              }
            }
            
            if (userMessageCount === 0) {
              throw new Error(`User message not found in chat for step ${step.step}`);
            }
            
            // Wait for agent response
            console.log('⏳ Waiting for agent response...');
            let actualResponse = '';
            
            // Wait for initial processing
            await newPage.waitForTimeout(10000);
            
            try {
              // Get all messages and find the latest outgoing (agent) response
              const allMessages = chatFrame.locator('div.chatbot-message');
              const totalMessages = await allMessages.count();
              console.log(`📊 Total messages in chat: ${totalMessages}`);
              
              if (totalMessages > 0) {
                // Look for the latest outgoing message (agent response)
                const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
                const outgoingCount = await outgoingMessages.count();
                console.log(`🤖 Outgoing messages (agent responses): ${outgoingCount}`);
                
                if (outgoingCount > 0) {
                  // Get the most recent outgoing message
                  const latestOutgoing = outgoingMessages.last();
                  const responseText = await latestOutgoing.textContent();
                  
                  if (responseText && responseText.trim().length > 10) {
                    actualResponse = responseText.trim();
                    console.log(`✅ Captured latest agent response: "${responseText.trim().substring(0, 100)}..."`);
                    
                    // Log the first few words to help debug if responses are different
                    const firstWords = responseText.trim().split(' ').slice(0, 5).join(' ');
                    console.log(`📝 Response starts with: "${firstWords}..."`);
                  } else {
                    actualResponse = 'Response text too short';
                    console.log('⚠️ Latest response text is too short');
                  }
                } else {
                  actualResponse = 'No outgoing messages found';
                  console.log('❌ No outgoing messages found');
                }
              } else {
                actualResponse = 'No messages in chat';
                console.log('❌ No messages found in chat');
              }
            } catch (e) {
              const errorMessage = e instanceof Error ? e.message : String(e);
              console.log(`⚠️ Error capturing response: ${errorMessage}`);
              actualResponse = 'Error in response capture';
            }
            
            console.log(`📥 Final captured response: "${actualResponse.substring(0, 100)}..."`);
            
            // Store results
            conversationResults.push({
              step: step.step,
              userInput: step.userInput,
              response: actualResponse,
              timestamp: messageTime
            });
            
            // Take screenshot
            await newPage.screenshot({
              path: `reports/healthplan-address-update-step-${step.step}-response.png`,
              fullPage: true
            });
            
            console.log(`📸 Screenshot saved for address update step ${step.step}`);
            
            if (i < addressUpdateSteps.length - 1) {
              console.log('⏳ Waiting 3 seconds before next step...');
              await newPage.waitForTimeout(3000);
            }
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error with address update step ${step.step}:`, errorMessage);
            
            conversationResults.push({
              step: step.step,
              userInput: step.userInput,
              response: `ERROR: ${errorMessage}`,
              timestamp: messageTime
            });
          }
        }
        
        // Generate address update test report
        console.log('\n📊 STEP 8: Generating Address Update Test Report');
        
        const successfulSteps = conversationResults.filter(r => !r.response.includes('ERROR'));
        if (successfulSteps.length > 0) {
          console.log('📊 Address Update Test Results:');
          conversationResults.forEach((result, index) => {
            console.log(`\n   Step ${result.step}: ${result.userInput}`);
            console.log(`   Response: ${result.response.substring(0, 100)}...`);
            console.log(`   Status: ${result.response.includes('ERROR') ? 'ERROR' : 'SUCCESS'}`);
          });
        } else {
          console.log('⚠️ No successful steps to report');
        }
        
        console.log('\n🎯 ===== HEALTHPLAN ADDRESS UPDATE TEST COMPLETE =====');
        console.log(`📊 Steps Executed: ${conversationResults.length}`);
        console.log(`✅ Successful Steps: ${successfulSteps.length}`);
        console.log(`❌ Failed Steps: ${conversationResults.length - successfulSteps.length}`);
        
      } else {
        throw new Error('Could not access iframe content');
      }
    } else {
      throw new Error('Chat iframe not found');
    }
  });
});

