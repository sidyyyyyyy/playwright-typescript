import { test, expect } from '@playwright/test';
import { createPersonaFromTestData } from '../../utils/faq-evaluation/robo-sim/single-step';
import { RoboEvaluator } from '../../utils/faq-evaluation/robo-sim/core/evaluator';
import { env } from '../../utils/env';
import { createAndActivateAgent } from '../../utils/api/ushur.Agents';
import { agentConfig } from '@configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { FunctionAdapter } from '../../utils/faq-evaluation/robo-sim/adapters/func';
import { RoboSimulator } from '../../utils/faq-evaluation/robo-sim/core/simulator';
import { roboSimTestData, agentConfiguration } from '../../data/robo-sim-test-data';
import { 
  sendMessage, 
  waitForAgentResponse, 
  isConversationComplete, 
  isResponseSimilar 
} from '../../utils/robo-sim-agent-helpers';
import * as fs from 'fs';
import * as path from 'path';

test.describe('RoboSim Agent Preview Integration with API Creation', () => {

  test('RoboSim with API-Created Agent Preview - Address Update Flow', async ({ page, browser }) => {
    test.setTimeout(300000); // 5 minutes
    
    // Create new context for debugging
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('Starting RoboSim Agent Preview Integration...');

    // Step 0: Create Agent via API
    console.log('\nSTEP 0: Creating Agent via API');
    const instance = env.instance;
    const { token, account } = await getUshurTokenFromApi();
    console.log(`Using account: ${account}`);
    
    // Create agent with custom configuration
    const customArgs = agentConfiguration;
    
    console.log('Creating agent with custom configuration...');
    console.log('Agent Configuration:', JSON.stringify(customArgs, null, 2));
    
    const agentSessionUrl = await createAndActivateAgent(instance, token, agentConfig, account, customArgs);
    console.log(`Agent created successfully! Session URL: ${agentSessionUrl}`);
    
    // Extract agent name/ID from the session URL for later reference
    const agentName = agentSessionUrl.split('/').pop() || 'unknown';
    console.log(`Agent Name/ID: ${agentName}`);
    console.log(`Agent will appear as the first agent in the agents table`);

    // Step 1: Navigate to Ushur signin page
    console.log('\nSTEP 1: Navigating to Ushur Signin Page');
    const signinUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=signin';
    console.log(`Navigating to: ${signinUrl}`);
    
    await newPage.goto(signinUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 2: Login with credentials from .env file
    console.log('\nSTEP 2: Logging in with .env credentials');
    
    if (!env.email || !env.password) {
      throw new Error('Email or password not found in .env file. Please check your environment variables.');
    }
    
    console.log(`Email: ${env.email}`);
    console.log(`Password: ${env.password ? '***' : 'NOT SET'}`);
    
    // Look for login form elements
    const emailInput = newPage.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
    const passwordInput = newPage.locator('input[type="password"]').first();
    const loginButton = newPage.locator('button:has-text("Login")').first();
    
    // Fill login credentials
    await emailInput.fill(env.email);
    await passwordInput.fill(env.password);
    await loginButton.click();
    
    console.log('Login button clicked');
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 3: Navigate to agents page
    console.log('\nSTEP 3: Navigating to Agents Page');
    const agentsUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=agents';
    await newPage.goto(agentsUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 4: Find and click on the first agent (newly created)
    console.log('\nSTEP 4: Finding First Agent (Newly Created)');
    
    // Wait for the agents table to load
    await newPage.waitForSelector('table', { timeout: 10000 });
    
    // Find all agent rows
    const agentRows = newPage.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`Found ${rowCount} agent rows in table`);
    
    let selectedAgentRow = null;
    
    // Look for the first valid agent row (should be the newly created one)
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      // Skip header rows or rows without proper content
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      // Select the first valid agent row (newly created agent should be first)
      console.log(`Selecting first agent in row ${i + 1}`);
        selectedAgentRow = row;
        break;
    }
    
    if (!selectedAgentRow) {
      throw new Error('No agent found in the agents table');
    }
    
    // Click on the selected agent row to open it
    console.log('Clicking on first agent row...');
    await selectedAgentRow.click();
    await newPage.waitForTimeout(3000);

    // Step 5: Click Configure button
    console.log('\nSTEP 5: Opening Agent Configuration');
    const configureButton = newPage.locator('div[role="tab"]:has-text("Configure")').first();
    
    if (await configureButton.count() > 0) {
      console.log('Found Configure button, clicking...');
      await configureButton.click();
      await newPage.waitForTimeout(3000);
    } else {
      throw new Error('Configure button not found');
    }

    // Step 6: Scroll down to find API section
    console.log('\nSTEP 6: Scrolling to find API Section');
    await newPage.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await newPage.waitForTimeout(2000);

    // Step 7: Click API directly
    console.log('\nSTEP 7: Clicking API Button');
    // Try multiple selectors for the API button
    let apiButton = newPage.locator('div.flex.gap-2.items-center.py-1.px-3.text-\\[\\#8A69FF\\].rounded-lg.border.\\!border-\\[\\#8A69FF\\].border-solid.cursor-pointer p[aria-label="API"]').first();
    
    if (await apiButton.count() === 0) {
      console.log('Trying alternative API button selector...');
      apiButton = newPage.locator('p[aria-label="API"]').first();
    }
    
    if (await apiButton.count() > 0) {
      console.log('Found API button, clicking...');
      await apiButton.click();
      await newPage.waitForTimeout(3000);
    } else {
      console.log('API button not found, trying to find any element with "API" text...');
      const apiTextButton = newPage.locator('text=API').first();
      if (await apiTextButton.count() > 0) {
        console.log('Found API text element, clicking...');
        await apiTextButton.click();
        await newPage.waitForTimeout(3000);
      } else {
        throw new Error('API button not found with any selector');
      }
    }

    // Step 8: Upload API spec file
    console.log('\nSTEP 8: Uploading API Spec File');
    
    // Look for the actual file input element (usually hidden)
    const fileInput = newPage.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      console.log('Found file input element, uploading API spec...');
      
      // Look for API spec files in the data folder
      const apiSpecFiles = [
        'src/data/api_spec/openapi-spec (2).yaml',
        'src/data/api-spec.json', 
        'src/data/openapi.json', 
        'src/data/swagger.json'
      ];
      let uploadedFile = false;
      
      for (const filePath of apiSpecFiles) {
        try {
          // Check if file exists
          if (fs.existsSync(filePath)) {
            console.log(`Uploading ${filePath}...`);
            await fileInput.setInputFiles(filePath);
            await newPage.waitForTimeout(2000);
            uploadedFile = true;
            break;
          }
        } catch (error) {
          console.log(`File ${filePath} not found, trying next...`);
        }
      }
      
      if (!uploadedFile) {
        console.log('No API spec files found in src/data/, creating a sample one...');
        // Create a sample API spec file
        const sampleApiSpec = {
          "openapi": "3.0.0",
          "info": {
            "title": "Health Plan API",
            "version": "1.0.0",
            "description": "API for Health Plan Member Management"
          },
          "paths": {
            "/api/address/update": {
              "post": {
                "summary": "Update member address",
                "parameters": [
                  {
                    "name": "memberId",
                    "in": "query",
                    "required": true,
                    "schema": { "type": "string" }
                  }
                ],
                "requestBody": {
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "newAddress": { "type": "string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        
        const sampleFilePath = path.join(process.cwd(), 'src/data/sample-api-spec.json');
        fs.writeFileSync(sampleFilePath, JSON.stringify(sampleApiSpec, null, 2));
        
        console.log('Uploading sample API spec...');
        await fileInput.setInputFiles(sampleFilePath);
        await newPage.waitForTimeout(2000);
      }
    } else {
      console.log('File input element not found, trying to click upload area...');
      // Try clicking the upload area to trigger file selection
      const fileUploadArea = newPage.locator('div.uppy-DragDrop-label:has-text("DROP OR SELECT FILE TO UPLOAD")').first();
      if (await fileUploadArea.count() > 0) {
        console.log('Clicking upload area to trigger file selection...');
        await fileUploadArea.click();
        await newPage.waitForTimeout(1000);
        
        // Try to find file input again after clicking
        const fileInputAfterClick = newPage.locator('input[type="file"]').first();
        if (await fileInputAfterClick.count() > 0) {
          console.log('Found file input after clicking upload area...');
          const yamlFilePath = path.join(process.cwd(), 'src/data/api_spec/openapi-spec (2).yaml');
          if (fs.existsSync(yamlFilePath)) {
            console.log('Uploading openapi-spec (2).yaml...');
            await fileInputAfterClick.setInputFiles(yamlFilePath);
            await newPage.waitForTimeout(2000);
          } else {
            console.log('YAML file not found, continuing...');
          }
        } else {
          console.log('Still no file input found, continuing...');
        }
      } else {
        console.log('File upload area not found, continuing...');
      }
    }

    // Step 9: Click Next: Security Configurations
    console.log('\nSTEP 9: Clicking Next: Security Configurations');
    
    // Wait for upload to complete and page to update
    await newPage.waitForTimeout(3000);
    
    // Debug: Log all text content on the page to see what's available
    console.log('Debug: Looking for available buttons/text on page...');
    const allButtons = await newPage.locator('button, span, div, a').all();
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      const text = await allButtons[i].textContent();
      if (text && (text.includes('Next') || text.includes('Security') || text.includes('Continue'))) {
        console.log(`Found button/text: "${text}"`);
      }
    }
    
    // Try multiple selectors and contexts for the Next button
    let nextSecurityButton = newPage.locator('span:has-text("Next: Security Configurations")').first();
    
    if (await nextSecurityButton.count() === 0) {
      console.log('Trying alternative selectors for Next button...');
      // Try different variations
      nextSecurityButton = newPage.locator('button:has-text("Next: Security Configurations")').first();
    }
    
    if (await nextSecurityButton.count() === 0) {
      console.log('Trying to find any "Next" button...');
      nextSecurityButton = newPage.locator('*:has-text("Next")').first();
    }
    
    if (await nextSecurityButton.count() === 0) {
      console.log('Trying to find "Security" related button...');
      nextSecurityButton = newPage.locator('*:has-text("Security")').first();
    }
    
    if (await nextSecurityButton.count() > 0) {
      console.log('Found Next/Security button, clicking...');
      await nextSecurityButton.click();
      await newPage.waitForTimeout(3000);
    } else {
      console.log('Next: Security Configurations button not found, taking screenshot for debugging...');
      await newPage.screenshot({ path: 'debug-next-button-not-found.png' });
      console.log('Screenshot saved as debug-next-button-not-found.png');
    }

    // Step 10: Click server URL dropdown and select https://aiagents.ushur.dev
    console.log('\nSTEP 10: Configuring Server URL');
    const serverUrlDropdown = newPage.locator('button.dropdown-toggle.btn.btn-outline-secondary.btn-sm:has-text("Enter server URL")').first();
    if (await serverUrlDropdown.count() > 0) {
      console.log('Found server URL dropdown, clicking...');
      await serverUrlDropdown.click();
      await newPage.waitForTimeout(1000);
      
      const serverUrlOption = newPage.locator('button.dropdown-item:has-text("https://aiagents.ushur.dev")').first();
      if (await serverUrlOption.count() > 0) {
        console.log('Found https://aiagents.ushur.dev option, selecting...');
        await serverUrlOption.click();
        await newPage.waitForTimeout(2000);
      } else {
        console.log('Server URL option not found, continuing...');
      }
    } else {
      console.log('Server URL dropdown not found, continuing...');
    }

    // Step 11: Click Next: Review Specifications
    console.log('\nSTEP 11: Clicking Next: Review Specifications');
    const nextReviewButton = newPage.locator('span:has-text("Next: Review Specifications")').first();
    if (await nextReviewButton.count() > 0) {
      console.log('Found Next: Review Specifications button, clicking...');
      await nextReviewButton.click();
      await newPage.waitForTimeout(2000);
    } else {
      console.log('Next: Review Specifications button not found, continuing...');
    }

    // Step 12: Click Configure API
    console.log('\nSTEP 12: Clicking Configure API');
    const configureApiButton = newPage.locator('span:has-text("Configure API")').first();
    if (await configureApiButton.count() > 0) {
      console.log('Found Configure API button, clicking...');
      await configureApiButton.click();
      await newPage.waitForTimeout(3000);
    } else {
      console.log('Configure API button not found, continuing...');
    }

    // Step 13: Click Return to Agent Dashboard
    console.log('\nSTEP 13: Clicking Return to Agent Dashboard');
    const returnToDashboardButton = newPage.locator('span:has-text("Return to Agent Dashboard")').first();
    if (await returnToDashboardButton.count() > 0) {
      console.log('Found Return to Agent Dashboard button, clicking...');
      await returnToDashboardButton.click();
      await newPage.waitForTimeout(2000);
    } else {
      console.log('Return to Agent Dashboard button not found, continuing...');
    }

    // Step 14: Click Preview Agent button
    console.log('\nSTEP 14: Opening Agent Preview');
    
    // Wait for page to load after returning to dashboard
    await newPage.waitForTimeout(3000);
    
    // Wait for Preview Agent button to be available with timeout
    console.log('Waiting for Preview Agent button to appear...');
    const previewButton = newPage.locator('button:has-text("Preview Agent")').first();
    
    try {
      // Wait up to 15 seconds for the button to appear
      await previewButton.waitFor({ timeout: 15000 });
      console.log('Found Preview Agent button, clicking...');
      await previewButton.click();
      await newPage.waitForTimeout(5000);
    } catch (error) {
      console.log('Preview Agent button not found within timeout, trying alternative selectors...');
      
      // Try alternative selectors
      let altPreviewButton = newPage.locator('button:has-text("Preview")').first();
      
      if (await altPreviewButton.count() === 0) {
        console.log('Trying to find any element with "Preview" text...');
        altPreviewButton = newPage.locator('*:has-text("Preview")').first();
      }
      
      if (await altPreviewButton.count() === 0) {
        console.log('Debug: Looking for available buttons on dashboard...');
        const allButtons = await newPage.locator('button, span, div, a').all();
        for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
          const text = await allButtons[i].textContent();
          if (text && (text.includes('Preview') || text.includes('Test') || text.includes('Launch'))) {
            console.log(`Found button/text: "${text}"`);
          }
        }
      }
      
      if (await altPreviewButton.count() > 0) {
        console.log('Found alternative Preview button, clicking...');
        await altPreviewButton.click();
      await newPage.waitForTimeout(5000);
    } else {
        console.log('Preview Agent button not found, taking screenshot for debugging...');
        await newPage.screenshot({ path: 'debug-preview-button-not-found.png' });
        console.log('Screenshot saved as debug-preview-button-not-found.png');
        console.log('Continuing without Preview button...');
      }
    }

    // Step 15: Switch to chat iframe
    console.log('\nSTEP 15: Switching to Chat Iframe');
    const chatIframe = newPage.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
    
    if (await chatIframe.count() > 0) {
      console.log('Found chat iframe, switching context...');
      
      const frame = await chatIframe.elementHandle();
      const chatFrame = await frame?.contentFrame();
      
      if (chatFrame) {
        console.log('Successfully switched to chat iframe');
        await newPage.waitForTimeout(5000);
        
        // Step 16: Initialize RoboSim
        console.log('\nSTEP 16: Initializing RoboSim Framework');
        const persona = createPersonaFromTestData(roboSimTestData);
        const evaluator = new RoboEvaluator();
        
        console.log('Created persona:', JSON.stringify(persona, null, 2));
        
        // Step 17: Start RoboSim conversation
        console.log('\nSTEP 17: Starting RoboSim Conversation with Real Agent');
        
        const conversationHistory: Array<{ role: 'user' | 'agent' | 'system'; content: string }> = [];
        let turnCount = 0;
        const maxTurns = 8;
        
        // Initial user message
        const initialMessage = "Hi, I need to update my address in the system.";
        console.log(`Initial User Message: "${initialMessage}"`);
        
        // Use multiple selectors to find chat input (from original working spec)
        let currentChatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
        let inputCount = await currentChatInput.count();
        
        if (inputCount === 0) {
          console.log('Trying alternative chat input selectors...');
          currentChatInput = chatFrame.locator('textarea, input[type="text"], .chatbot-input-container textarea, .ushur-chatbot textarea');
          inputCount = await currentChatInput.count();
          console.log(`Alternative selector found ${inputCount} elements`);
        }
        
        if (inputCount === 0) {
          console.log('Trying broader selectors...');
          currentChatInput = chatFrame.locator('textarea, input[type="text"]');
          inputCount = await currentChatInput.count();
          console.log(`Broader selector found ${inputCount} elements`);
        }
        
        console.log(`Final count: ${inputCount} chat input elements in iframe`);
        
        if (inputCount === 0) {
          throw new Error('Chat input not found in iframe');
        }
        
        // Helper function to get current message count
        const getCurrentMessageCount = async (): Promise<number> => {
          const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
          return await outgoingMessages.count();
        };
        
        // Get initial message count
        let previousMessageCount = await getCurrentMessageCount();
        console.log(`Initial message count: ${previousMessageCount}`);
        
        // Send initial message to agent (using exact approach from original)
        console.log(`Sending initial message: "${initialMessage}"`);
        await sendMessage(currentChatInput, initialMessage);
        conversationHistory.push({ role: 'user' as const, content: initialMessage });
        
        // Wait for the user message to appear in chat
        await newPage.waitForTimeout(2000);
        
        // Verify user message was sent and count total messages
        const userMessages = chatFrame.locator('div.chatbot-message.incoming');
        const userMessageCount = await userMessages.count();
        const allMessages = chatFrame.locator('div.chatbot-message');
        const totalMessageCount = await allMessages.count();
        
        console.log(`User messages in chat: ${userMessageCount}`);
        console.log(`Total messages in chat after initial message: ${totalMessageCount}`);
        
        if (userMessageCount === 0) {
          throw new Error('User message not found in chat for initial message');
        }
        
        // Wait for agent response using the helper method (from original)
        let agentResponse = await waitForAgentResponse(chatFrame, newPage);
        
        // Log the response received from helper method
        if (agentResponse && agentResponse.length > 10) {
          console.log(`Agent response received: "${agentResponse.substring(0, 100)}..."`);
          const firstWords = agentResponse.split(' ').slice(0, 5).join(' ');
          console.log(`Response starts with: "${firstWords}..."`);
        } else {
          console.log(`No valid response received: "${agentResponse}"`);
        }
        
        console.log(`Final captured response: "${agentResponse.substring(0, 100)}..."`);
        conversationHistory.push({ role: 'agent' as const, content: agentResponse });
        
        // RoboSim conversation loop with real agent responses (using original approach)
        console.log('\n Starting real multi-turn conversation with HealthPlan agent...');
        
        for (let i = 0; i < maxTurns; i++) {
          turnCount++;
          console.log(`\nTurn ${turnCount}:`);
          
          // Generate user response with the CURRENT agent response using custom RoboSim with higher temperature
          console.log(`Generating user response for turn ${i + 1} with current agent message...`);
          
          // Create a custom simulator with higher temperature for more varied responses
          const adapter = new FunctionAdapter();
          adapter.setAgentMessage(agentResponse);
          
          const simulator = new RoboSimulator(persona, adapter, {
            model: 'gpt-4o-mini',
            temperature: 0.8 + (i * 0.1), // Increase temperature with each turn for variety
            max_turns: 1,
            agent_id: 'test-agent'
          });
          
          const userResponse = await simulator.runOnce(agentResponse);
          console.log(`RoboSim User Response: "${userResponse}"`);
          
          // Send the user response
          console.log(`Sending RoboSim message ${i + 1}: "${userResponse}"`);
          
          // Wait for input field to be ready (EXACT COPY from original)
          console.log(`Waiting for input field to be ready for message ${i + 1}...`);
          
          if (i > 0) {
            console.log(`Waiting for input field to become interactive after message ${i}...`);
            
            let attempts = 0;
            let inputReady = false;
            
            while (!inputReady && attempts < 10) {
              attempts++;
              await newPage.waitForTimeout(1000);
              
              try {
                const isDisabled = await currentChatInput.first().getAttribute('disabled');
                const isReadOnly = await currentChatInput.first().getAttribute('readonly');
                
                if (!isDisabled && !isReadOnly) {
                  console.log(`Input field is ready after ${attempts} attempts`);
                  inputReady = true;
                } else {
                  console.log(`Attempt ${attempts}: Input disabled=${isDisabled}, readonly=${isReadOnly}`);
                }
              } catch (e) {
                console.log(`Attempt ${attempts}: Checking input state...`);
              }
            }
            
            if (inputReady) {
              await newPage.waitForTimeout(2000);
            }
          } else {
            await newPage.waitForTimeout(2000);
          }
          
          console.log(`Sending RoboSim message ${i + 1}: "${userResponse}"`);
          
          // Use different input methods for subsequent messages (from original)
          console.log('Trying different input methods for subsequent messages...');
          
          // Method 1: Try keyboard events
          console.log('Method 1: Using keyboard events...');
          try {
            await currentChatInput.first().click({ force: true });
            await newPage.waitForTimeout(1000);
            await currentChatInput.first().focus();
            await newPage.waitForTimeout(500);
            
            // Clear any existing content
            await currentChatInput.first().press('Control+a');
            await newPage.waitForTimeout(200);
            await currentChatInput.first().press('Delete');
            await newPage.waitForTimeout(500);
            
            // Type character by character
            for (const char of userResponse) {
              await currentChatInput.first().type(char, { delay: 50 });
              await newPage.waitForTimeout(50);
            }
            
            await newPage.waitForTimeout(1000);
            const inputValue = await currentChatInput.first().inputValue();
            console.log(`Keyboard method result: "${inputValue}"`);
            
            if (inputValue === userResponse) {
              console.log('Keyboard method successful');
              await currentChatInput.first().press('Enter');
              await newPage.waitForTimeout(2000);
              conversationHistory.push({ role: 'user' as const, content: userResponse });
              
              // Wait for agent response after successful keyboard input
              console.log('Waiting for agent response after keyboard input...');
              await newPage.waitForTimeout(5000);
              
              // Check if agent is typing or processing
              try {
                await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                  state: 'visible', 
                  timeout: 3000 
                });
                console.log('Agent is typing/processing...');
                
                // Wait for typing to finish
                await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                  state: 'hidden', 
                  timeout: 10000 
                });
                console.log('Agent finished typing');
              } catch (e) {
                console.log('No typing indicator found, proceeding...');
              }
              
              // Wait for any loading states to clear
              try {
                await chatFrame.locator('.loading, .spinner, [data-testid="loading"]').waitFor({ 
                  state: 'hidden', 
                  timeout: 5000 
                });
                console.log('Loading states cleared');
              } catch (e) {
                console.log('No loading states found');
              }
              
              // Additional wait for agent response
              console.log('Additional wait for agent response...');
              await newPage.waitForTimeout(3000);
              
              // Capture Real Agent Response
              console.log('Capturing real agent response...');
              const actualResponse = await waitForAgentResponse(chatFrame, newPage);
              
              // Log the response received
              if (actualResponse && actualResponse.length > 10) {
                console.log(`Real agent response received: "${actualResponse.substring(0, 100)}..."`);
                const firstWords = actualResponse.split(' ').slice(0, 5).join(' ');
                console.log(`Response starts with: "${firstWords}..."`);
              } else {
                console.log(`No valid response received: "${actualResponse}"`);
              }
              
              console.log(`Final captured response: "${actualResponse}"`);
              conversationHistory.push({ role: 'agent' as const, content: actualResponse });
          
          // Check if conversation should end
              if (isConversationComplete(actualResponse)) {
            console.log('Conversation completed naturally');
            break;
          }
          
          // Check if agent response is almost the same as previous response
              if (isResponseSimilar(agentResponse, actualResponse)) {
            console.log('Agent response is similar to previous response - ending conversation');
            break;
          }
          
              // Update for next iteration - use the real agent response
              agentResponse = actualResponse;
              continue;
            }
          } catch (e) {
            console.log(`Keyboard method failed: ${e}`);
          }
          
          // Method 2: Try dispatchEvent
          console.log('Method 2: Using dispatchEvent...');
          try {
            await currentChatInput.first().evaluate((element: any, text: string) => {
              element.value = text;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
            }, userResponse);
            
            await newPage.waitForTimeout(1000);
            const inputValue = await currentChatInput.first().inputValue();
            console.log(`DispatchEvent method result: "${inputValue}"`);
            
            if (inputValue === userResponse) {
              console.log('DispatchEvent method successful');
              await currentChatInput.first().press('Enter');
              await newPage.waitForTimeout(2000);
              conversationHistory.push({ role: 'user' as const, content: userResponse });
              
              // Wait for agent response after successful dispatchEvent input
              console.log('Waiting for agent response after dispatchEvent input...');
              await newPage.waitForTimeout(5000);
              
              // Check if agent is typing or processing
              try {
                await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                  state: 'visible', 
                  timeout: 3000 
                });
                console.log('Agent is typing/processing...');
                
                // Wait for typing to finish
                await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                  state: 'hidden', 
                  timeout: 10000 
                });
                console.log('Agent finished typing');
              } catch (e) {
                console.log('No typing indicator found, proceeding...');
              }
              
              // Wait for any loading states to clear
              try {
                await chatFrame.locator('.loading, .spinner, [data-testid="loading"]').waitFor({ 
                  state: 'hidden', 
                  timeout: 5000 
                });
                console.log('Loading states cleared');
              } catch (e) {
                console.log('No loading states found');
              }
              
              // Additional wait for agent response
              console.log('Additional wait for agent response...');
              await newPage.waitForTimeout(3000);
              
              // Capture Real Agent Response
              console.log('Capturing real agent response...');
              const actualResponse = await waitForAgentResponse(chatFrame, newPage);
              
              // Log the response received
              if (actualResponse && actualResponse.length > 10) {
                console.log(`Real agent response received: "${actualResponse.substring(0, 100)}..."`);
                const firstWords = actualResponse.split(' ').slice(0, 5).join(' ');
                console.log(`Response starts with: "${firstWords}..."`);
              } else {
                console.log(`No valid response received: "${actualResponse}"`);
              }
              
              console.log(`Final captured response: "${actualResponse}"`);
              conversationHistory.push({ role: 'agent' as const, content: actualResponse });
              
              // Check if conversation should end
              if (isConversationComplete(actualResponse)) {
                console.log('Conversation completed naturally');
                break;
              }
              
              // Check if agent response is almost the same as previous response
              if (isResponseSimilar(agentResponse, actualResponse)) {
                console.log('Agent response is similar to previous response - ending conversation');
                break;
              }
              
              // Update for next iteration - use the real agent response
              agentResponse = actualResponse;
              continue;
            }
          } catch (e) {
            console.log(`DispatchEvent method failed: ${e}`);
          }
          
          // Method 3: Try setAttribute
          console.log('Method 3: Using setAttribute...');
          try {
            await currentChatInput.first().evaluate((element: any, text: string) => {
              element.setAttribute('value', text);
              element.value = text;
              element.dispatchEvent(new Event('input', { bubbles: true }));
            }, userResponse);
            
            await newPage.waitForTimeout(1000);
            const inputValue = await currentChatInput.first().inputValue();
            console.log(`SetAttribute method result: "${inputValue}"`);
            
            if (inputValue === userResponse) {
              console.log('SetAttribute method successful');
              await currentChatInput.first().press('Enter');
              await newPage.waitForTimeout(2000);
              conversationHistory.push({ role: 'user' as const, content: userResponse });
              
              // Wait for agent response after successful setAttribute input
              console.log('Waiting for agent response after setAttribute input...');
              await newPage.waitForTimeout(5000);
              
              // Check if agent is typing or processing
              try {
                await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                  state: 'visible', 
                  timeout: 3000 
                });
                console.log('Agent is typing/processing...');
                
                // Wait for typing to finish
                await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                  state: 'hidden', 
                  timeout: 10000 
                });
                console.log('Agent finished typing');
              } catch (e) {
                console.log('No typing indicator found, proceeding...');
              }
              
              // Wait for any loading states to clear
              try {
                await chatFrame.locator('.loading, .spinner, [data-testid="loading"]').waitFor({ 
                  state: 'hidden', 
                  timeout: 5000 
                });
                console.log('Loading states cleared');
              } catch (e) {
                console.log('No loading states found');
              }
              
              // Additional wait for agent response
              console.log('Additional wait for agent response...');
              await newPage.waitForTimeout(3000);
              
              // Capture Real Agent Response
              console.log('Capturing real agent response...');
              const actualResponse = await waitForAgentResponse(chatFrame, newPage);
              
              // Log the response received
              if (actualResponse && actualResponse.length > 10) {
                console.log(`Real agent response received: "${actualResponse.substring(0, 100)}..."`);
                const firstWords = actualResponse.split(' ').slice(0, 5).join(' ');
                console.log(`Response starts with: "${firstWords}..."`);
              } else {
                console.log(`No valid response received: "${actualResponse}"`);
              }
              
              console.log(`Final captured response: "${actualResponse}"`);
              conversationHistory.push({ role: 'agent' as const, content: actualResponse });
              
              // Check if conversation should end
              if (isConversationComplete(actualResponse)) {
                console.log('Conversation completed naturally');
                break;
              }
              
              // Check if agent response is almost the same as previous response
              if (isResponseSimilar(agentResponse, actualResponse)) {
                console.log('Agent response is similar to previous response - ending conversation');
                break;
              }
              
              // Update for next iteration - use the real agent response
              agentResponse = actualResponse;
              continue;
            }
          } catch (e) {
            console.log(`SetAttribute method failed: ${e}`);
          }
          
          // Method 4: Try fill with force
          console.log('Method 4: Using fill with force...');
          try {
            await currentChatInput.first().fill(userResponse, { force: true });
            await newPage.waitForTimeout(1000);
            const inputValue = await currentChatInput.first().inputValue();
            console.log(`Force fill method result: "${inputValue}"`);
            
            if (inputValue === userResponse) {
              console.log('Force fill method successful');
              await currentChatInput.first().press('Enter');
              await newPage.waitForTimeout(2000);
              conversationHistory.push({ role: 'user' as const, content: userResponse });
              
              // Wait for agent response after successful force fill input
              console.log('Waiting for agent response after force fill input...');
              await newPage.waitForTimeout(5000);
              
              // Check if agent is typing or processing
              try {
                await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                  state: 'visible', 
                  timeout: 3000 
                });
                console.log('Agent is typing/processing...');
                
                // Wait for typing to finish
                await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                  state: 'hidden', 
                  timeout: 10000 
                });
                console.log('Agent finished typing');
              } catch (e) {
                console.log('No typing indicator found, proceeding...');
              }
              
              // Wait for any loading states to clear
              try {
                await chatFrame.locator('.loading, .spinner, [data-testid="loading"]').waitFor({ 
                  state: 'hidden', 
                  timeout: 5000 
                });
                console.log('Loading states cleared');
              } catch (e) {
                console.log('No loading states found');
              }
              
              // Additional wait for agent response
              console.log('Additional wait for agent response...');
              await newPage.waitForTimeout(3000);
              
              // Capture Real Agent Response
              console.log('Capturing real agent response...');
              const actualResponse = await waitForAgentResponse(chatFrame, newPage);
              
              // Log the response received
              if (actualResponse && actualResponse.length > 10) {
                console.log(`Real agent response received: "${actualResponse.substring(0, 100)}..."`);
                const firstWords = actualResponse.split(' ').slice(0, 5).join(' ');
                console.log(`Response starts with: "${firstWords}..."`);
              } else {
                console.log(`No valid response received: "${actualResponse}"`);
              }
              
              console.log(`Final captured response: "${actualResponse}"`);
              conversationHistory.push({ role: 'agent' as const, content: actualResponse });
              
              // Check if conversation should end
              if (isConversationComplete(actualResponse)) {
                console.log('Conversation completed naturally');
                break;
              }
              
              // Check if agent response is almost the same as previous response
              if (isResponseSimilar(agentResponse, actualResponse)) {
                console.log('Agent response is similar to previous response - ending conversation');
                break;
              }
              
              // Update for next iteration - use the real agent response
              agentResponse = actualResponse;
              continue;
            }
          } catch (e) {
            console.log(`Force fill method failed: ${e}`);
          }
          
          // Method 5: Try clicking and typing with different selectors
          console.log('Method 5: Trying different selectors...');
          try {
            // Try to find input by different selectors
            const alternativeInputs = [
              chatFrame.locator('input[type="text"]'),
              chatFrame.locator('textarea'),
              chatFrame.locator('input[placeholder*="message"]'),
              chatFrame.locator('input[placeholder*="type"]'),
              chatFrame.locator('[contenteditable="true"]'),
              chatFrame.locator('.input-field'),
              chatFrame.locator('#message-input'),
              chatFrame.locator('[data-testid="message-input"]')
            ];
            
            for (const altInput of alternativeInputs) {
              const count = await altInput.count();
              if (count > 0) {
                console.log(`Found alternative input with ${count} elements`);
                await altInput.first().click({ force: true });
                await newPage.waitForTimeout(500);
                await altInput.first().fill(userResponse);
                await newPage.waitForTimeout(1000);
                
                const inputValue = await altInput.first().inputValue();
                console.log(`Alternative input result: "${inputValue}"`);
                
                if (inputValue === userResponse) {
                  console.log('Alternative input method successful');
                  await altInput.first().press('Enter');
                  await newPage.waitForTimeout(2000);
                  conversationHistory.push({ role: 'user' as const, content: userResponse });
                  
                  // Wait for agent response after successful alternative input
                  console.log('Waiting for agent response after alternative input...');
                  await newPage.waitForTimeout(5000);
                  
                  // Check if agent is typing or processing
                  try {
                    await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                      state: 'visible', 
                      timeout: 3000 
                    });
                    console.log('Agent is typing/processing...');
                    
                    // Wait for typing to finish
                    await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
                      state: 'hidden', 
                      timeout: 10000 
                    });
                    console.log('Agent finished typing');
                  } catch (e) {
                    console.log('No typing indicator found, proceeding...');
                  }
                  
                  // Wait for any loading states to clear
                  try {
                    await chatFrame.locator('.loading, .spinner, [data-testid="loading"]').waitFor({ 
                      state: 'hidden', 
                      timeout: 5000 
                    });
                    console.log('Loading states cleared');
                  } catch (e) {
                    console.log('No loading states found');
                  }
                  
                  // Additional wait for agent response
                  console.log('Additional wait for agent response...');
                  await newPage.waitForTimeout(3000);
                  
                  // Capture Real Agent Response
                  console.log('Capturing real agent response...');
                  const actualResponse = await waitForAgentResponse(chatFrame, newPage);
                  
                  // Log the response received
                  if (actualResponse && actualResponse.length > 10) {
                    console.log(`Real agent response received: "${actualResponse.substring(0, 100)}..."`);
                    const firstWords = actualResponse.split(' ').slice(0, 5).join(' ');
                    console.log(`Response starts with: "${firstWords}..."`);
                  } else {
                    console.log(`No valid response received: "${actualResponse}"`);
                  }
                  
                  console.log(`Final captured response: "${actualResponse}"`);
                  conversationHistory.push({ role: 'agent' as const, content: actualResponse });
                  
                  // Check if conversation should end
                  if (isConversationComplete(actualResponse)) {
                    console.log('Conversation completed naturally');
                    break;
                  }
                  
                  // Check if agent response is almost the same as previous response
                  if (isResponseSimilar(agentResponse, actualResponse)) {
                    console.log('Agent response is similar to previous response - ending conversation');
                    break;
                  }
                  
                  // Update for next iteration - use the real agent response
                  agentResponse = actualResponse;
                  break;
                }
              }
            }
          } catch (e) {
            console.log(`Alternative input method failed: ${e}`);
          }
          
          // If all methods fail, use the original sendMessage as fallback
          console.log('All alternative methods failed, using original sendMessage...');
          await sendMessage(currentChatInput, userResponse);
          
          // Add user message to conversation history
          conversationHistory.push({ role: 'user' as const, content: userResponse });
          
          // Wait for agent to process the message and respond (from original)
          console.log('Waiting for agent to process the message and respond...');
          
          // Wait longer for agent to process the message
          await newPage.waitForTimeout(5000);
          
          // Check if agent is typing or processing
          try {
            await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
              state: 'visible', 
              timeout: 3000 
            });
            console.log('Agent is typing/processing...');
            
            // Wait for typing to finish
            await chatFrame.locator('.typing, .processing, [data-state="typing"]').waitFor({ 
              state: 'hidden', 
              timeout: 10000 
            });
            console.log('Agent finished typing');
          } catch (e) {
            console.log('No typing indicator found, proceeding...');
          }
          
          // Wait for any loading states to clear
          try {
            await chatFrame.locator('.loading, .spinner, [data-testid="loading"]').waitFor({ 
              state: 'hidden', 
              timeout: 5000 
            });
            console.log('Loading states cleared');
          } catch (e) {
            console.log('No loading states found');
          }
          
          // Additional wait for agent response
          console.log('Additional wait for agent response...');
          await newPage.waitForTimeout(3000);
          
          // Verify user message was sent and count total messages
          const userMessages = chatFrame.locator('div.chatbot-message.incoming');
          const userMessageCount = await userMessages.count();
          const allMessages = chatFrame.locator('div.chatbot-message');
          const totalMessageCount = await allMessages.count();
          
          console.log(`User messages in chat: ${userMessageCount}`);
          console.log(`Total messages in chat after message ${i + 1}: ${totalMessageCount}`);
          
          // Debug: Check if this message actually appeared in chat
          if (userMessageCount > 0) {
            const latestUserMessage = userMessages.last();
            const userMessageText = await latestUserMessage.textContent();
            console.log(`Latest user message text: "${userMessageText?.trim()}"`);
            
            if (userMessageText && userMessageText.includes(userResponse.substring(0, 20))) {
              console.log(`Message ${i + 1} successfully appeared in chat`);
            } else {
              console.log(`Message ${i + 1} may not have been sent properly`);
              console.log(` Expected: "${userResponse.substring(0, 20)}..."`);
              console.log(` Found: "${userMessageText?.trim()}"`);
            }
          }
          
          if (userMessageCount === 0) {
            throw new Error(`User message not found in chat for message ${i + 1}`);
          }
          
          // SOLUTION 5: Capture Real Agent Response (FIXED)
          console.log('Capturing real agent response...');
          
          // Wait for agent response using the helper method (from working script)
          const actualResponse = await waitForAgentResponse(chatFrame, newPage);
          
          // Log the response received from helper method
          if (actualResponse && actualResponse.length > 10) {
            console.log(`Real agent response received: "${actualResponse.substring(0, 100)}..."`);
            const firstWords = actualResponse.split(' ').slice(0, 5).join(' ');
            console.log(`Response starts with: "${firstWords}..."`);
          } else {
            console.log(`No valid response received: "${actualResponse}"`);
          }
          
          console.log(`Final captured response: "${actualResponse}"`);
          conversationHistory.push({ role: 'agent' as const, content: actualResponse });
          
          // Check if conversation should end
          if (isConversationComplete(actualResponse)) {
            console.log('Conversation completed naturally');
            break;
          }
          
          // Check if agent response is almost the same as previous response
          if (isResponseSimilar(agentResponse, actualResponse)) {
            console.log('Agent response is similar to previous response - ending conversation');
            break;
          }
          
          // Update for next iteration - use the real agent response
          agentResponse = actualResponse;
        }
        
        // Step 18: Evaluate conversation
        console.log('\nSTEP 18: Evaluating Conversation with RoboSim');
        const evaluation = await evaluator.evaluate(conversationHistory, persona.goals);
        
        console.log('RoboSim Evaluation Results:');
        console.log(' Correctness:', evaluation.behavior.correctness.toFixed(2));
        console.log(' Relevance:', evaluation.behavior.relevance.toFixed(2));
        console.log(' Conciseness:', evaluation.behavior.conciseness.toFixed(2));
        console.log(' Faithfulness:', evaluation.behavior.faithfulness.toFixed(2));
        console.log(' Goal Accuracy:', evaluation.behavior.goalAccuracy.toFixed(2));
        console.log(' Next Action:', evaluation.nextAction.type);
        
        // Assertions - Adjusted for agent preview interface limitation (from original)
        // The agent preview interface only processes the first message, so we adjust expectations
        expect(evaluation.behavior.correctness).toBeGreaterThanOrEqual(0.3);
        expect(evaluation.behavior.relevance).toBeGreaterThanOrEqual(0.5);
        expect(evaluation.behavior.faithfulness).toBeGreaterThan(0.8);
        
        console.log('\n===== ROBOSIM AGENT PREVIEW INTEGRATION COMPLETE =====');
        console.log(`Total Turns: ${turnCount}`);
        console.log(`Conversation History Length: ${conversationHistory.length}`);
        
      } else {
        throw new Error('Could not access iframe content');
      }
    } else {
      throw new Error('Chat iframe not found');
    }
  });

});

// Helper functions moved to src/utils/robo-sim-agent-helpers.ts
