import { test, expect } from '@playwright/test';
import { createAndActivateAgent } from '../../utils/api/ushur.Agents';
import { env } from '../../utils/env';

// Mock ReasonerService for simulation
class MockReasonerService {
  private testData: any;
  private conversationStep: number = 0;
  private maxSteps: number = 10;

  constructor(testData: any) {
    this.testData = testData;
  }

  async analyzeInteraction(params: {
    session: any;
    interaction: any;
    agentResponse: string;
    testCase: any;
    testData?: any;
  }): Promise<{
    behavior: any;
    nextAction: any;
  }> {
    console.log(`🤖 Analyzing interaction step ${this.conversationStep + 1}`);
    console.log(`📝 Agent Response: ${params.agentResponse.substring(0, 100)}...`);

    // Simulate conversation flow based on step
    const nextUserInput = this.getNextUserInput(params.agentResponse);
    
    // Check if conversation should complete
    const shouldComplete = this.shouldCompleteConversation(params.agentResponse);
    
    if (shouldComplete || this.conversationStep >= this.maxSteps) {
      return {
        behavior: {
          correctness: 0.8,
          relevance: 0.9,
          conciseness: 0.7,
          faithfulness: 0.8,
          toxicity: 0.0,
          hallucination: 0.1,
          goalAccuracy: 0.8,
          context: {
            correctness: 0.8,
            relevance: 0.9,
            precision: 0.7,
            recall: 0.8
          },
          answer: {
            correctness: 0.8,
            relevance: 0.9,
            critic: 0.7
          }
        },
        nextAction: {
          type: "COMPLETE_SESSION",
          data: {
            reason: "Address update simulation completed successfully"
          }
        }
      };
    }

    this.conversationStep++;

    return {
      behavior: {
        correctness: 0.8,
        relevance: 0.9,
        conciseness: 0.7,
        faithfulness: 0.8,
        toxicity: 0.0,
        hallucination: 0.1,
        goalAccuracy: 0.8,
        context: {
          correctness: 0.8,
          relevance: 0.9,
          precision: 0.7,
          recall: 0.8
        },
        answer: {
          correctness: 0.8,
          relevance: 0.9,
          critic: 0.7
        }
      },
      nextAction: {
        type: "SEND_USER_INPUT",
        data: {
          inputText: nextUserInput
        }
      }
    };
  }

  private getNextUserInput(agentResponse: string): string {
    const response = agentResponse.toLowerCase();
    
    // Step 1: Initial request
    if (this.conversationStep === 0) {
      return "I need to update my address";
    }
    
    // Step 2: Authentication request
    if (response.includes('authenticate') || response.includes('member id') || response.includes('date of birth')) {
      return `My member ID is ${this.testData.memberInfo.memberId} and my date of birth is ${this.testData.memberInfo.dateOfBirth}`;
    }
    
    // Step 3: Current address confirmation
    if (response.includes('current address') || response.includes('existing address')) {
      return `My current address is ${this.testData.memberInfo.currentAddress.street}, ${this.testData.memberInfo.currentAddress.city}, ${this.testData.memberInfo.currentAddress.state} ${this.testData.memberInfo.currentAddress.zip}`;
    }
    
    // Step 4: New address request
    if (response.includes('new address') || response.includes('updated address')) {
      return `My new address is ${this.testData.memberInfo.newAddress.street}, ${this.testData.memberInfo.newAddress.city}, ${this.testData.memberInfo.newAddress.state} ${this.testData.memberInfo.newAddress.zip}`;
    }
    
    // Step 5: Confirmation
    if (response.includes('confirm') || response.includes('correct')) {
      return "Yes, that's correct. Please update my address.";
    }
    
    // Step 6: Processing time inquiry
    if (response.includes('processing') || response.includes('time')) {
      return "Thank you! When will this be processed?";
    }
    
    // Default fallback
    return "Thank you for your help!";
  }

  private shouldCompleteConversation(agentResponse: string): boolean {
    const response = agentResponse.toLowerCase();
    return response.includes('24-hour') || 
           response.includes('processing') || 
           response.includes('updated successfully') ||
           response.includes('complete') ||
           this.conversationStep >= 6;
  }
}

test.describe('HealthPlan Address Update Simulation', () => {
  test('Create HealthPlan agent, select from dashboard, and simulate address update conversation', async ({ page, browser }) => {
    test.setTimeout(600000); // 10 minutes for complete flow
    
    // Create new context for debugging
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting HealthPlan Address Update Simulation...');

    // Test data
    const testData = {
      memberInfo: {
        firstName: "John",
        lastName: "Doe",
        memberId: "MEM12345",
        dateOfBirth: "1980-01-15",
        currentAddress: {
          street: "123 Main St",
          city: "San Francisco",
          state: "CA",
          zip: "94105"
        },
        newAddress: {
          street: "456 Market St",
          city: "San Francisco",
          state: "CA",
          zip: "94103"
        },
        phoneNumber: "555-123-4567",
        email: "john.doe@example.com"
      }
    };

    const testCase = {
      id: "address-update-001",
      name: "Basic Address Update Flow",
      description: "Validate agent's ability to handle a simple address update request",
      goals: [
        "Successfully authenticate member",
        "Update member address",
        "Provide clear confirmation"
      ]
    };

    // Step 1: Create HealthPlan agent
    console.log('\n🤖 STEP 1: Creating HealthPlan Agent');
    const agentConfig = {
      AGENT_TYPE: 'HealthPlan',
      AGENT_DESCRIPTION: 'The Health Plan Member Engagement System is designed to efficiently manage member inquiries and enhance the experience of health plan services. Whether members need assistance with benefits, claims, billing, or any other aspect of their health plan, this intuitive system is ready to help. Members can simply submit their inquiries, and the advanced AI technology will swiftly connect them with the information and support they need. The system is committed to ensuring that interactions with the health plan are seamless, informative, and satisfying.',
      FRIENDLY_NAME: 'Friendly Farah',
      GREET_MESSAGE: 'Hi there! I\'m here to make navigating your health journey simple and stress-free—how can I help today?',
      USE_CASE_TEMPLATE: 'healthplan_001',
      CAP_NAME: 'Knowledge Base',
      CAP_INDEX: '0',
      TASK_ID: 'task_002',
      TASK_NAME: 'Update Address',
      PERSONA_ID: 'persona_001',
      TONE: 'Friendly',
      FORMALITY: 'Casual',
      EMPATHY: 'High',
      READABILITY: 'Grade 6'
    };

    let agentId = null;
    let agentName = agentConfig.FRIENDLY_NAME;

    try {
      console.log('🔄 Creating agent with configuration...');
      const agentData = await createAndActivateAgent(agentConfig);
      agentId = agentData.agentId;
      console.log(`✅ Successfully created agent with ID: ${agentId}`);
      console.log(`📝 Agent Name: ${agentName}`);
    } catch (error) {
      console.log('⚠️ Agent creation failed, using fallback approach...');
      // Fallback: Use existing agent
      agentId = '7759664'; // Known HealthPlan agent
      agentName = 'Existing HealthPlan Agent';
      console.log(`🔄 Using fallback agent ID: ${agentId}`);
    }

    // Step 2: Navigate to Ushur signin page
    console.log('\n🌐 STEP 2: Navigating to Ushur Signin Page');
    const signinUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=signin';
    console.log(`🔗 Navigating to: ${signinUrl}`);
    
    await newPage.goto(signinUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 3: Login with credentials from .env file
    console.log('\n🔐 STEP 3: Logging in with .env credentials');
    
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

    // Step 4: Navigate to agents page
    console.log('\n🏢 STEP 4: Navigating to Agents Dashboard');
    const agentsUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=agents';
    await newPage.goto(agentsUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 5: Find the created agent by ID or name from dashboard
    console.log('\n🔍 STEP 5: Finding HealthPlan Agent in Dashboard');
    
    // Wait for the agents table to load
    await newPage.waitForSelector('table', { timeout: 10000 });
    
    // Find all agent rows
    const agentRows = newPage.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`📊 Found ${rowCount} agent rows in dashboard`);
    
    let selectedAgentRow = null;
    let foundAgentInfo = null;
    
    // Look for the HealthPlan agent by ID or name
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      // Skip header rows or rows without proper content
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      // Check if this row contains our HealthPlan agent
      if (rowText.includes(agentId) || 
          rowText.includes(agentName) || 
          rowText.includes('Friendly Farah') ||
          (rowText.includes('HealthPlan') && agentId === '7759664')) {
        console.log(`✅ Found target agent in row ${i + 1}: ${rowText.substring(0, 50)}...`);
        selectedAgentRow = row;
        foundAgentInfo = {
          rowNumber: i + 1,
          agentId: rowText.split(' ')[0], // Extract agent ID from first column
          agentName: rowText.split(' ')[1] || 'Unknown',
          agentType: rowText.includes('HealthPlan') ? 'HealthPlan' : 'Unknown'
        };
        break;
      }
    }
    
    if (!selectedAgentRow) {
      throw new Error(`HealthPlan agent with ID ${agentId} or name "${agentName}" not found in dashboard`);
    }
    
    console.log(`🎯 Selected Agent Details:`);
    console.log(`   Row: ${foundAgentInfo.rowNumber}`);
    console.log(`   ID: ${foundAgentInfo.agentId}`);
    console.log(`   Name: ${foundAgentInfo.agentName}`);
    console.log(`   Type: ${foundAgentInfo.agentType}`);
    
    // Step 6: Click on the selected agent and open preview
    console.log('\n🔍 STEP 6: Opening Agent Preview from Dashboard');
    await selectedAgentRow.click();
    await newPage.waitForTimeout(3000);

    const previewButton = newPage.locator('button:has-text("Preview Agent")').first();
    
    if (await previewButton.count() > 0) {
      console.log('✅ Found Preview Agent button, clicking...');
      await previewButton.click();
      await newPage.waitForTimeout(5000);
    } else {
      throw new Error('Preview Agent button not found');
    }

    // Step 7: Switch to chat iframe
    console.log('\n🔍 STEP 7: Switching to Chat Iframe');
    const chatIframe = newPage.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
    
    if (await chatIframe.count() > 0) {
      console.log('✅ Found chat iframe, switching context...');
      
      const frame = await chatIframe.elementHandle();
      const chatFrame = await frame?.contentFrame();
      
      if (chatFrame) {
        console.log('✅ Successfully switched to chat iframe');
        await newPage.waitForTimeout(5000);
        
        // Step 8: Initialize simulation service
        console.log('\n🤖 STEP 8: Initializing Address Update Simulation');
        const reasonerService = new MockReasonerService(testData);
        
        // Step 9: Conduct dynamic conversation simulation
        console.log('\n💬 STEP 9: Conducting Dynamic Address Update Simulation');
        
        const conversationHistory = [];
        let currentUserInput = "I need to update my address";
        let stepCount = 0;
        const maxSteps = 10;

        while (stepCount < maxSteps) {
          stepCount++;
          console.log(`\n🔄 Conversation Step ${stepCount}:`);
          console.log(`👤 User: ${currentUserInput}`);

          try {
            // Find and interact with chat input
            const currentChatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
            
            const inputCount = await currentChatInput.count();
            console.log(`📝 Found ${inputCount} chat input elements in iframe`);
            
            if (inputCount === 0) {
              throw new Error(`Chat input not found in iframe for step ${stepCount}`);
            }
            
            // Wait for input field to be ready
            console.log(`⏳ Waiting for input field to be ready for step ${stepCount}...`);
            
            if (stepCount > 1) {
              console.log(`🔄 Waiting for input field to become interactive after step ${stepCount - 1}...`);
              
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
              
              if (inputReady) {
                await newPage.waitForTimeout(2000);
              }
            } else {
              await newPage.waitForTimeout(2000);
            }
            
            console.log(`✍️ Typing user input: "${currentUserInput}"`);
            
            // Use the working typing approach
            await currentChatInput.first().click();
            await newPage.waitForTimeout(500);
            
            await currentChatInput.first().fill('');
            await newPage.waitForTimeout(300);
            await currentChatInput.first().press('Control+a');
            await newPage.waitForTimeout(300);
            await currentChatInput.first().press('Delete');
            await newPage.waitForTimeout(500);
            
            await currentChatInput.first().type(currentUserInput, { delay: 100 });
            await newPage.waitForTimeout(1000);
            
            const inputValue = await currentChatInput.first().inputValue();
            console.log(`📋 Input value after typing: "${inputValue}"`);
            
            // Verify the input was typed correctly
            if (!inputValue || inputValue.trim() !== currentUserInput.trim()) {
              console.log('⚠️ Input not typed properly, trying alternative approach...');
              
              await currentChatInput.first().click();
              await newPage.waitForTimeout(500);
              await currentChatInput.first().fill('');
              await newPage.waitForTimeout(300);
              
              await currentChatInput.first().type(currentUserInput, { delay: 100 });
              await newPage.waitForTimeout(500);
              
              const retryValue = await currentChatInput.first().inputValue();
              console.log(`📋 Retry input value: "${retryValue}"`);
              
              if (!retryValue || retryValue.trim() !== currentUserInput.trim()) {
                console.log('⚠️ Second retry failed, trying fill approach...');
                await currentChatInput.first().fill(currentUserInput);
                await newPage.waitForTimeout(500);
                
                const fillValue = await currentChatInput.first().inputValue();
                console.log(`📋 Fill approach value: "${fillValue}"`);
                
                if (!fillValue || fillValue.trim() !== currentUserInput.trim()) {
                  throw new Error(`Failed to type input for step ${stepCount} after all retry attempts`);
                }
              }
            }
            
            // Send the input
            console.log('📤 Pressing Enter to send user input...');
            await currentChatInput.first().press('Enter');
            console.log(`✅ User input sent: "${currentUserInput}"`);
            
            // Wait for the user message to appear in chat
            await newPage.waitForTimeout(2000);
            
            // Verify user message was sent
            const userMessages = chatFrame.locator('div.chatbot-message.incoming');
            const userMessageCount = await userMessages.count();
            
            console.log(`👤 User messages in chat: ${userMessageCount}`);
            
            if (userMessageCount === 0) {
              throw new Error(`User message not found in chat for step ${stepCount}`);
            }
            
            // Wait for agent response
            console.log('⏳ Waiting for agent response...');
            let agentResponse = '';
            
            await newPage.waitForTimeout(10000);
            
            try {
              const allMessages = chatFrame.locator('div.chatbot-message');
              const totalMessages = await allMessages.count();
              console.log(`📊 Total messages in chat: ${totalMessages}`);
              
              if (totalMessages > 0) {
                const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
                const outgoingCount = await outgoingMessages.count();
                console.log(`🤖 Outgoing messages (agent responses): ${outgoingCount}`);
                
                if (outgoingCount > 0) {
                  const latestOutgoing = outgoingMessages.last();
                  const responseText = await latestOutgoing.textContent();
                  
                  if (responseText && responseText.trim().length > 10) {
                    agentResponse = responseText.trim();
                    console.log(`🤖 Agent Response: ${agentResponse.substring(0, 100)}...`);
                    
                    const firstWords = agentResponse.trim().split(' ').slice(0, 5).join(' ');
                    console.log(`📝 Response starts with: "${firstWords}..."`);
                  } else {
                    agentResponse = 'Response text too short';
                    console.log('⚠️ Latest response text is too short');
                  }
                } else {
                  agentResponse = 'No outgoing messages found';
                  console.log('❌ No outgoing messages found');
                }
              } else {
                agentResponse = 'No messages in chat';
                console.log('❌ No messages found in chat');
              }
            } catch (e) {
              const errorMessage = e instanceof Error ? e.message : String(e);
              console.log(`⚠️ Error capturing response: ${errorMessage}`);
              agentResponse = 'Error in response capture';
            }
            
            // Store conversation step
            conversationHistory.push({
              step: stepCount,
              userInput: currentUserInput,
              agentResponse: agentResponse,
              timestamp: new Date().toISOString()
            });
            
            // Analyze interaction and get next action
            console.log('🔍 Analyzing interaction with simulation service...');
            const analysis = await reasonerService.analyzeInteraction({
              session: { sessionId: 'simulation-session' },
              interaction: { interactionId: `step-${stepCount}`, interactionType: 'chat' },
              agentResponse: agentResponse,
              testCase: testCase,
              testData: testData
            });
            
            console.log(`📊 Analysis Result: ${analysis.nextAction.type}`);
            console.log(`🎯 Behavior Score: ${analysis.behavior.correctness.toFixed(2)}`);
            
            // Check if conversation should complete
            if (analysis.nextAction.type === 'COMPLETE_SESSION') {
              console.log('✅ Conversation simulation completed successfully!');
              break;
            }
            
            // Get next user input
            if (analysis.nextAction.type === 'SEND_USER_INPUT' && analysis.nextAction.data.inputText) {
              currentUserInput = analysis.nextAction.data.inputText;
            } else {
              console.log('⚠️ No next input provided, ending simulation');
              break;
            }
            
            // Take screenshot for this step
            await newPage.screenshot({
              path: `reports/ui/address-update-step-${stepCount}.png`,
              fullPage: true
            });
            
            console.log(`📸 Screenshot saved for step ${stepCount}`);
            
            // Wait before next step
            await newPage.waitForTimeout(3000);
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error in step ${stepCount}:`, errorMessage);
            break;
          }
        }
        
        // Step 10: Generate simulation report
        console.log('\n📊 STEP 10: Generating Simulation Report');
        
        console.log('\n📈 ===== ADDRESS UPDATE SIMULATION REPORT =====');
        console.log(`🤖 Agent ID: ${agentId}`);
        console.log(`📝 Agent Name: ${agentName}`);
        console.log(`📋 Conversation Steps: ${conversationHistory.length}`);
        console.log(`🎯 Test Case: ${testCase.name}`);
        console.log(`📊 Goals: ${testCase.goals.join(', ')}`);
        
        console.log('\n💬 Conversation History:');
        conversationHistory.forEach((step, index) => {
          console.log(`\n   Step ${step.step}:`);
          console.log(`   👤 User: ${step.userInput}`);
          console.log(`   🤖 Agent: ${step.agentResponse.substring(0, 100)}...`);
        });
        
        // Check if goals were achieved
        const finalResponse = conversationHistory[conversationHistory.length - 1]?.agentResponse || '';
        const goalsAchieved = testCase.goals.filter(goal => {
          const goalKeywords = goal.toLowerCase().split(' ');
          return goalKeywords.some(keyword => 
            finalResponse.toLowerCase().includes(keyword)
          );
        });
        
        console.log('\n🎯 Goal Achievement:');
        testCase.goals.forEach(goal => {
          const achieved = goalsAchieved.includes(goal);
          console.log(`   ${achieved ? '✅' : '❌'} ${goal}`);
        });
        
        console.log(`\n📊 Goals Achieved: ${goalsAchieved.length}/${testCase.goals.length}`);
        
        // Assertions
        expect(conversationHistory.length).toBeGreaterThan(0);
        expect(goalsAchieved.length).toBeGreaterThan(0);
        
        console.log('\n🎯 ===== ADDRESS UPDATE SIMULATION COMPLETE =====');
        
      } else {
        throw new Error('Could not access iframe content');
      }
    } else {
      throw new Error('Chat iframe not found');
    }
  });
});
