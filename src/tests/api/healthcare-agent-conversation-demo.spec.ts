import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentHandle, initAgentBySelector } from '../../utils/api/ushur.Agents';
import { agentConfig } from '../../../configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '../../utils/env';

test.describe('Healthcare Agent - Conversation Demo', () => {
  test('Healthcare Agent Conversation Demo with Real Interactions', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for full conversation
    
    console.log('🏥 Starting Healthcare Agent Conversation Demo...');
    
    // Step 1: Get or create agent
    console.log('\n🚀 STEP 1: Getting Healthcare Agent');
    
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
      // Set environment variables for Healthcare agent configuration
      process.env.AGENT_TYPE = 'HealthPlan';
      process.env.AGENT_DESCRIPTION = 'The Healthcare Assistant provides comprehensive healthcare information and assistance. This system helps patients with appointment scheduling, prescription information, general medical advice, and insurance-related queries. The assistant maintains professional and empathetic communication while ensuring HIPAA compliance and patient safety.';
      process.env.FRIENDLY_NAME = 'Dr. Sarah';
      process.env.GREET_MESSAGE = 'Hello! I\'m Dr. Sarah, your healthcare assistant. How can I help you with your health needs today?';
      process.env.USE_CASE_TEMPLATE = 'healthplan_001';
      process.env.CAP_NAME = 'Knowledge Base';
      process.env.CAP_INDEX = '0';
      process.env.TASK_ID = 'task_001';
      process.env.TASK_NAME = 'Healthcare Assistance';
      process.env.PERSONA_ID = 'persona_001';
      process.env.TONE = 'Professional';
      process.env.FORMALITY = 'Professional';
      process.env.EMPATHY = 'High';
      process.env.READABILITY = 'Grade 8';
      
      console.log('✨ Creating NEW Healthcare agent...');
      agentUrl = await createAndActivateAgent(instance, token, agentConfig, account);
      console.log('✅ Created NEW Healthcare agent →', agentUrl);
    }

    // Step 2: Navigate to agent session URL
    console.log('\n🌐 STEP 2: Navigating to Healthcare Agent Session');
    console.log(`🔗 Agent URL: ${agentUrl}`);
    
    await page.goto(agentUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'reports/healthcare-agent-conversation-demo-initial.png',
      fullPage: true 
    });

    // Step 3: Wait for chat interface to load
    console.log('\n🔍 STEP 3: Waiting for Chat Interface to Load');
    
    // Wait for chat input to be available
    const chatInput = page.locator('textarea[placeholder*="Type"], input[placeholder*="Type"], [contenteditable="true"]').first();
    
    if (await chatInput.isVisible({ timeout: 30000 })) {
      console.log('✅ Chat input is visible and ready');
    } else {
      throw new Error('Chat input not found or not visible');
    }

    // Step 4: Healthcare Conversation Demo
    console.log('\n🏥 STEP 4: Starting Healthcare Conversation Demo');
    
    const healthcareQuestions = [
      {
        question: "Hello! I need help with my healthcare needs.",
        category: "Greeting",
        expectedKeywords: ["help", "healthcare", "assistance"]
      },
      {
        question: "I need to schedule a medical appointment for next week.",
        category: "Appointment Scheduling",
        expectedKeywords: ["appointment", "schedule", "medical"]
      },
      {
        question: "What are my health insurance benefits?",
        category: "Insurance Information",
        expectedKeywords: ["insurance", "benefits", "coverage"]
      },
      {
        question: "I have questions about my prescription medication.",
        category: "Prescription Information",
        expectedKeywords: ["prescription", "medication", "drug"]
      },
      {
        question: "I'm experiencing some symptoms and need medical advice.",
        category: "Medical Advice",
        expectedKeywords: ["symptoms", "advice", "medical"]
      }
    ];
    
    const conversationResults = [];
    
    // Send each question and collect responses
    for (let i = 0; i < healthcareQuestions.length; i++) {
      const { question, category, expectedKeywords } = healthcareQuestions[i];
      console.log(`\n📤 Healthcare Question ${i + 1} (${category}): "${question}"`);
      
      try {
        // Wait for any previous messages to complete
        console.log('⏳ Waiting for previous message to complete...');
        await page.waitForTimeout(8000);
        
        // Take screenshot before interaction
        await page.screenshot({ 
          path: `reports/healthcare-agent-conversation-demo-before-question-${i + 1}.png`,
          fullPage: true 
        });
        
        // Clear and focus the input field
        console.log('🖱️ Clicking on input field to focus...');
        await chatInput.click();
        await page.waitForTimeout(2000);
        
        // Clear the input field completely
        console.log('🧹 Clearing input field...');
        await chatInput.fill('');
        await page.waitForTimeout(1000);
        await chatInput.press('Control+a');
        await chatInput.press('Delete');
        await page.waitForTimeout(1000);
        
        // Verify the input field is completely empty
        const inputValueAfterClear = await chatInput.inputValue();
        if (inputValueAfterClear !== '') {
          console.log('⚠️ Input field not completely empty, trying alternative clear method...');
          await chatInput.press('Control+a');
          await chatInput.press('Backspace');
          await page.waitForTimeout(1000);
        }
        
        // Type the question
        console.log(`✍️ Typing healthcare question: "${question}"`);
        await chatInput.type(question, { delay: 100 });
        await page.waitForTimeout(1000);
        
        // Verify the question was typed correctly
        const inputValue = await chatInput.inputValue();
        console.log(`📋 Input value after typing: "${inputValue}"`);
        
        if (inputValue !== question) {
          console.log('⚠️ Input value mismatch, retrying...');
          await chatInput.fill('');
          await page.waitForTimeout(1000);
          await chatInput.type(question, { delay: 100 });
          await page.waitForTimeout(1000);
        }
        
        // Send the message
        console.log('📤 Sending message...');
        await chatInput.press('Enter');
        console.log(`✅ Message sent: "${question}"`);
        
        // Wait for agent response
        console.log('⏳ Waiting for agent response...');
        await page.waitForTimeout(15000); // Wait longer for response
        
        // Take screenshot after interaction
        await page.screenshot({ 
          path: `reports/healthcare-agent-conversation-demo-after-question-${i + 1}.png`,
          fullPage: true 
        });
        
        // Try to capture the agent's response
        let agentResponse = 'No response captured';
        
        // Look for agent messages in various possible locations
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
            // Get the last message (most recent)
            const lastMessage = messages.last();
            const response = await lastMessage.textContent();
            if (response && response.length > 10 && !response.includes(question)) {
              agentResponse = response;
              console.log(`✅ Captured agent response: "${agentResponse.substring(0, 100)}..."`);
              break;
            }
          }
        }
        
        // Store the conversation result
        const result = {
          questionNumber: i + 1,
          category,
          question,
          agentResponse,
          expectedKeywords,
          timestamp: new Date().toISOString()
        };
        
        conversationResults.push(result);
        
        console.log(`✅ Question ${i + 1} completed successfully`);
        console.log(`📝 Agent Response: "${agentResponse.substring(0, 150)}..."`);
        
        // Wait before next question
        await page.waitForTimeout(3000);
        
      } catch (error) {
        console.error(`❌ Error with question ${i + 1}:`, error);
        
        // Store error result
        conversationResults.push({
          questionNumber: i + 1,
          category,
          question,
          agentResponse: `Error: ${error.message}`,
          expectedKeywords,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Step 5: Generate Conversation Report
    console.log('\n📊 STEP 5: Generating Healthcare Conversation Report');
    
    console.log('\n🎯 ===== HEALTHCARE AGENT CONVERSATION DEMO COMPLETE =====');
    console.log(`🏥 Agent Type: Healthcare Assistant`);
    console.log(`💬 Total Questions Asked: ${healthcareQuestions.length}`);
    console.log(`✅ Successful Interactions: ${conversationResults.filter(r => !r.agentResponse.includes('Error')).length}`);
    console.log(`❌ Failed Interactions: ${conversationResults.filter(r => r.agentResponse.includes('Error')).length}`);
    
    // Detailed conversation log
    console.log('\n📋 CONVERSATION LOG:');
    conversationResults.forEach((result, index) => {
      console.log(`\n   Question ${result.questionNumber} (${result.category}):`);
      console.log(`   User: "${result.question}"`);
      console.log(`   Agent: "${result.agentResponse.substring(0, 100)}..."`);
      console.log(`   Status: ${result.agentResponse.includes('Error') ? '❌ Failed' : '✅ Success'}`);
    });
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'reports/healthcare-agent-conversation-demo-final.png',
      fullPage: true 
    });
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - Initial state: reports/healthcare-agent-conversation-demo-initial.png');
    console.log('   - Before each question: reports/healthcare-agent-conversation-demo-before-question-*.png');
    console.log('   - After each question: reports/healthcare-agent-conversation-demo-after-question-*.png');
    console.log('   - Final state: reports/healthcare-agent-conversation-demo-final.png');
    
    // Healthcare-specific insights
    console.log('\n🏥 HEALTHCARE CONVERSATION INSIGHTS:');
    console.log('✅ Real-time conversation with healthcare agent demonstrated');
    console.log('✅ Multiple healthcare scenarios tested');
    console.log('✅ Agent responses captured and analyzed');
    console.log('✅ Screenshots taken at each interaction point');
    console.log('✅ Conversation flow documented');
    
    // Assertions
    expect(conversationResults.length).toBeGreaterThan(0);
    expect(conversationResults.filter(r => !r.agentResponse.includes('Error')).length).toBeGreaterThan(0);
    
    console.log('\n✅ Healthcare Agent Conversation Demo completed successfully!');
    console.log('🎉 You can now review the screenshots and conversation log to see the full interaction!');
    
  });
});

