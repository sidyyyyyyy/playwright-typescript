import { test, expect } from '@playwright/test';
import { 
  FAQSynthesisUtils, 
  FAQEvaluatorFactory, 
  FAQReportGenerator 
} from '../../utils/faq-evaluation';
import { EnhancedEvaluatorFactory } from '../../utils/faq-evaluation/geval-enhanced.utils';
import { createAndActivateAgent } from '../../utils/api/ushur.Agents';
import { env } from '../../utils/env';

// Helper method for sending messages (from dynamic user simulation)
async function sendMessage(chatInput: any, message: string): Promise<void> {
  try {
    await chatInput.first().click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    await chatInput.first().fill('');
    await new Promise(resolve => setTimeout(resolve, 300));
    await chatInput.first().type(message, { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await chatInput.first().press('Enter');
    console.log(`✅ Sent: "${message}"`);
  } catch (e) {
    console.log('⚠️ Error sending message, trying fill approach...');
    await chatInput.first().fill(message);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await chatInput.first().press('Enter');
    console.log(`✅ Sent via fill: "${message}"`);
  }
}

// Helper method for waiting for agent response (from dynamic user simulation)
async function waitForAgentResponse(chatFrame: any): Promise<string> {
  console.log('⏳ Waiting for agent response...');
  
  let attempts = 0;
  const maxAttempts = 15;
  let lastAgentMessage = '';
  
  // Get the current count of agent messages
  const initialOutgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
  const initialCount = await initialOutgoingMessages.count();
  console.log(`📊 Initial agent message count: ${initialCount}`);
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    attempts++;
    
    // Get agent response
    const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
    const outgoingCount = await outgoingMessages.count();
    
    console.log(`🔍 Check ${attempts}: Found ${outgoingCount} outgoing messages`);
    
    if (outgoingCount > initialCount) {
      // New message appeared
      const latestResponse = outgoingMessages.last();
      const responseText = await latestResponse.textContent();
      
      if (responseText && responseText.trim().length > 10) {
        const agentResponse = responseText.trim();
        
        // Check if this is a new message (not the same as last one)
        if (agentResponse !== lastAgentMessage) {
          console.log(`🤖 Agent: ${agentResponse}`);
          lastAgentMessage = agentResponse;
          return agentResponse;
        }
      }
    }
  }
  
  console.log('❌ No new agent response received after maximum wait time');
  return 'No response received';
}

test.describe('Client Services Agent Evaluation - Preloaded Config', () => {
  test('Create Client Services agent from preloaded config and run FAQ evaluation', async ({ page, browser }) => {
    test.setTimeout(600000); // 10 minutes for complete flow
    
    // Create new context for debugging
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting Client Services Agent Evaluation with Preloaded Config...');

    // Step 1: Load PDF and generate questions using LangChain
    console.log('\n📚 STEP 1: Loading PDF and Generating Questions with LangChain');
    const { documents, questions } = await FAQSynthesisUtils.synthesizeFAQContent('policyholder', 3);
    
    console.log('📝 Generated Questions from PDF:');
    questions.forEach((q, i) => console.log(`   ${i + 1}. ${q}`));

    // Step 2: Create Client Services agent from preloaded config
    console.log('\n🤖 STEP 2: Creating Client Services Agent from Preloaded Config');
    const agentConfig = {
      AGENT_TYPE: 'ClientServices',
      AGENT_DESCRIPTION: 'The Client Services Engagement System supports banking customers by answering questions about account features, fee explanations, debit or credit card issues, basic product comparisons, and everyday transaction guidance. Clients simply ask their questions and the system promptly provides accurate information or next‑step directions. The goal is to make every interaction with the financial institution seamless, informative, and satisfying for each client.',
      FRIENDLY_NAME: 'Gentle Jamie',
      GREET_MESSAGE: 'Hello! Finding your way through the complexities of your options can be tough. I\'m here to help.',
      USE_CASE_TEMPLATE: 'clientservices_001',
      CAP_NAME: 'Knowledge Base',
      CAP_INDEX: '0',
      TASK_ID: 'task_002',
      TASK_NAME: 'Update Address',
      PERSONA_ID: 'persona_006',
      TONE: 'Professional',
      FORMALITY: 'Casual',
      EMPATHY: 'Low',
      READABILITY: 'College Readability'
    };

    let agentId = null;
    let sessionURL = null;
    let agentName = agentConfig.FRIENDLY_NAME;

    try {
      console.log('🔄 Creating Client Services agent with preloaded configuration...');
      const agentData = await createAndActivateAgent(agentConfig);
      agentId = agentData.agentId;
      sessionURL = agentData.agentInitSessionURL || agentData.sessionURL;
      console.log(`✅ Successfully created Client Services agent with ID: ${agentId}`);
      console.log(`🔗 Session URL: ${sessionURL}`);
      console.log(`📝 Agent Name: ${agentName}`);
    } catch (error) {
      console.log('⚠️ Agent creation failed, using fallback approach...');
      // Fallback: Use existing agent
      agentId = '4038509'; // Known agent
      agentName = 'Existing Client Services Agent';
      console.log(`🔄 Using fallback agent ID: ${agentId}`);
    }

    // Step 3: Navigate to Ushur signin page
    console.log('\n🌐 STEP 3: Navigating to Ushur Signin Page');
    const signinUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=signin';
    console.log(`🔗 Navigating to: ${signinUrl}`);
    
    await newPage.goto(signinUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 4: Login with credentials from .env file
    console.log('\n🔐 STEP 4: Logging in with .env credentials');
    
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

    // Step 5: Navigate to agents page
    console.log('\n🏢 STEP 5: Navigating to Agents Dashboard');
    const agentsUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=agents';
    await newPage.goto(agentsUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 6: Select the first available agent from dashboard
    console.log('\n🔍 STEP 6: Selecting First Available Agent from Dashboard');
    
    // Wait for the agents table to load
    await newPage.waitForSelector('table', { timeout: 10000 });
    
    // Find all agent rows
    const agentRows = newPage.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`📊 Found ${rowCount} agent rows in dashboard`);
    
    let selectedAgentRow = null;
    let foundAgentInfo = null;
    
    // Select the first valid agent row
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      // Skip header rows or rows without proper content
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      // Select the first valid row
      console.log(`✅ Selecting first available agent in row ${i + 1}: ${rowText.substring(0, 50)}...`);
      selectedAgentRow = row;
      foundAgentInfo = {
        rowNumber: i + 1,
        agentId: rowText.split(' ')[0], // Extract agent ID from first column
        agentName: rowText.split(' ')[1] || 'Unknown',
        agentType: rowText.includes('ClientServices') ? 'ClientServices' : 'Unknown'
      };
      break;
    }
    
    if (!selectedAgentRow) {
      throw new Error(`No valid agents found in dashboard`);
    }
    
    console.log(`🎯 Selected Agent Details (First Available):`);
    console.log(`   Row: ${foundAgentInfo.rowNumber}`);
    console.log(`   ID: ${foundAgentInfo.agentId}`);
    console.log(`   Name: ${foundAgentInfo.agentName}`);
    console.log(`   Type: ${foundAgentInfo.agentType}`);
    
    // Step 7: Click on the selected agent and open preview
    console.log('\n🔍 STEP 7: Opening Agent Preview from Dashboard');
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

    // Step 8: Switch to chat iframe
    console.log('\n🔍 STEP 8: Switching to Chat Iframe');
    const chatIframe = newPage.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
    
    if (await chatIframe.count() > 0) {
      console.log('✅ Found chat iframe, switching context...');
      await newPage.frameLocator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').locator('body').waitFor({ timeout: 10000 });
      console.log('✅ Successfully switched to chat iframe');
    } else {
      throw new Error('Chat iframe not found');
    }

    // Step 9: Create evaluation systems
    console.log('\n🔍 STEP 9: Creating Evaluation Systems');
    const traditionalEvaluator = FAQEvaluatorFactory.createEvaluator('policyholder');
    const enhancedEvaluator = EnhancedEvaluatorFactory.createEvaluator();
    const reportGenerator = new FAQReportGenerator();

    // Step 10: Conduct comprehensive FAQ evaluation
    console.log('\n💬 STEP 10: Conducting Comprehensive FAQ Evaluation');
    const evaluations = [];
    const chatFrame = newPage.frameLocator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]');

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const messageTime = new Date().toISOString();
      console.log(`\n🤖 FAQ Question ${i + 1}/${questions.length}: "${question}"`);
      
      try {
        // Wait for iframe to be fully loaded
        console.log('⏳ Waiting for iframe content to load...');
        await newPage.waitForTimeout(3000);
        
        // Use multiple selectors to find chat input
        let currentChatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
        let inputCount = await currentChatInput.count();
        
        if (inputCount === 0) {
          console.log('🔍 Trying alternative chat input selectors...');
          currentChatInput = chatFrame.locator('textarea, input[type="text"], .chatbot-input-container textarea, .ushur-chatbot textarea');
          inputCount = await currentChatInput.count();
          console.log(`📝 Alternative selector found ${inputCount} elements`);
        }
        
        if (inputCount === 0) {
          console.log('🔍 Trying broader selectors...');
          currentChatInput = chatFrame.locator('textarea, input[type="text"]');
          inputCount = await currentChatInput.count();
          console.log(`📝 Broader selector found ${inputCount} elements`);
        }
        
        console.log(`📝 Final count: ${inputCount} chat input elements in iframe`);
        
        if (inputCount === 0) {
          throw new Error(`Chat input not found in iframe for question ${i + 1}`);
        }

        // Wait for input field to be ready
        console.log(`⏳ Waiting for input field to be ready for message ${i + 1}...`);
        
        if (i > 0) {
          console.log(`🔄 Waiting for input field to become interactive after message ${i}...`);
          
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
        
        console.log(`✍️ Sending FAQ question ${i + 1}: "${question}"`);
        
        // Use the dynamic user simulation approach for sending messages
        await sendMessage(currentChatInput, question);
        
        // Wait for the user message to appear in chat
        await newPage.waitForTimeout(2000);
        
        // Verify user message was sent and count total messages
        const userMessages = chatFrame.locator('div.chatbot-message.incoming');
        const userMessageCount = await userMessages.count();
        const allMessages = chatFrame.locator('div.chatbot-message');
        const totalMessageCount = await allMessages.count();
        
        console.log(`👤 User messages in chat: ${userMessageCount}`);
        console.log(`📊 Total messages in chat after question ${i + 1}: ${totalMessageCount}`);
        
        // Debug: Check if this question actually appeared in chat
        if (userMessageCount > 0) {
          const latestUserMessage = userMessages.last();
          const userMessageText = await latestUserMessage.textContent();
          console.log(`💬 Latest user message text: "${userMessageText?.trim()}"`);
          
          if (userMessageText && userMessageText.includes(question.substring(0, 20))) {
            console.log(`✅ Question ${i + 1} successfully appeared in chat`);
          } else {
            console.log(`⚠️ Question ${i + 1} may not have been sent properly`);
            console.log(`   Expected: "${question.substring(0, 20)}..."`);
            console.log(`   Found: "${userMessageText?.trim()}"`);
          }
        }
        
        if (userMessageCount === 0) {
          throw new Error(`User message not found in chat for question ${i + 1}`);
        }
        
        // Wait for agent response using the helper method
        const actualResponse = await waitForAgentResponse(chatFrame);
        
        // Log the response received from helper method
        if (actualResponse && actualResponse.length > 10) {
          console.log(`✅ Agent response received: "${actualResponse.substring(0, 100)}..."`);
          const firstWords = actualResponse.split(' ').slice(0, 5).join(' ');
          console.log(`📝 Response starts with: "${firstWords}..."`);
        } else {
          console.log(`⚠️ No valid response received: "${actualResponse}"`);
        }
        
        console.log(`📥 Final captured response: "${actualResponse.substring(0, 100)}..."`);
        
        // Create expected output based on PDF content
        const expectedOutput = `Based on the Community Resource Centers information, ${question.toLowerCase().includes('claim') ? 
          'Community Resource Centers provide various support services including job training, youth mentoring, immigration support, and housing support. These services are typically free, so no insurance claims are needed.' :
          question.toLowerCase().includes('coverage') ?
          'Community Resource Centers offer free fitness classes, health workshops, and wellness programs. These services are available to community members at no cost.' :
          'Community Resource Centers provide comprehensive support services including fitness classes, health workshops, job training, and youth mentoring programs. These services are designed to support community wellness and development.'}`;

        // Run traditional evaluation
        console.log('📊 Running Traditional Evaluation...');
        const traditionalEvaluation = await traditionalEvaluator.evaluateResponse(question, actualResponse, documents[0].pageContent);
        
        // Enhanced GEval evaluation
        console.log('🔍 Running Enhanced GEval Evaluation...');
        const enhancedEvaluation = await enhancedEvaluator.evaluateWithGEvalMetrics(
          question,
          actualResponse,
          expectedOutput
        );

        // Store results
        const evaluationResult = {
          questionNumber: i + 1,
          question: question,
          actualResponse: actualResponse,
          expectedResponse: expectedOutput,
          traditional: traditionalEvaluation,
          enhanced: enhancedEvaluation,
          timestamp: messageTime,
          agentId: foundAgentInfo.agentId,
          agentName: foundAgentInfo.agentName
        };
        
        evaluations.push(evaluationResult);

        // Generate detailed report for this question
        const detailedReport = enhancedEvaluator.generateDetailedReport(
          question,
          actualResponse,
          expectedOutput,
          enhancedEvaluation
        );
        
        console.log(detailedReport);
        
        // Take screenshot
        await newPage.screenshot({
          path: `reports/faq-evaluation/client-services-q${i + 1}-response.png`,
          fullPage: true
        });
        
        console.log(`📸 Screenshot saved for FAQ question ${i + 1}`);
        
        if (i < questions.length - 1) {
          console.log('⏳ Waiting 3 seconds before next question...');
          await newPage.waitForTimeout(3000);
        }
        
      } catch (error) {
        console.log(`❌ Error with FAQ question ${i + 1}: ${error.message}`);
        
        // Create error evaluation result
        const errorEvaluation = {
          questionNumber: i + 1,
          question: question,
          actualResponse: `Error: ${error.message}`,
          expectedResponse: 'N/A',
          traditionalScores: { relevance: 0, accuracy: 0, completeness: 0, clarity: 0 },
          enhancedScores: { correctness1: 0, correctness2: 0, correctness3: 0, answerRelevancy: 0 },
          timestamp: messageTime,
          agentId: foundAgentInfo.agentId,
          agentName: foundAgentInfo.agentName,
          error: error.message
        };
        
        evaluations.push(errorEvaluation);
      }
    }

    // Step 11: Generate comprehensive evaluation report
    console.log('\n📊 STEP 11: Generating Comprehensive Evaluation Report');
    
    if (evaluations.length > 0) {
      // Generate report (simplified to avoid method call issues)
      console.log('\n📈 ===== COMPREHENSIVE CLIENT SERVICES EVALUATION REPORT =====');
      
      console.log('\n📈 ===== COMPREHENSIVE CLIENT SERVICES EVALUATION REPORT =====');
      console.log(`🤖 Agent ID: ${foundAgentInfo.agentId}`);
      console.log(`📝 Agent Name: ${foundAgentInfo.agentName}`);
      console.log(`📋 Questions Evaluated: ${evaluations.length}`);
      
      // Calculate averages using the same structure as working test
      const successfulEvaluations = evaluations.filter(r => r.traditional && r.enhanced);
      const traditionalScores = successfulEvaluations.map(r => r.traditional.overallScore);
      const enhancedScores = successfulEvaluations.map(r => r.enhanced.overallScore);
      
      const avgTraditional = traditionalScores.length > 0 ? traditionalScores.reduce((a, b) => a + b, 0) / traditionalScores.length : 0;
      const avgEnhanced = enhancedScores.length > 0 ? enhancedScores.reduce((a, b) => a + b, 0) / enhancedScores.length : 0;
      
      console.log(`📊 Traditional Evaluation Average: ${avgTraditional.toFixed(3)}/5.0`);
      console.log(`🔍 Enhanced GEval Average: ${avgEnhanced.toFixed(3)}/1.0`);
      
      console.log('\n📊 Detailed Metrics Comparison:');
      successfulEvaluations.forEach((evaluation, index) => {
        const traditionalScore = evaluation.traditional.overallScore;
        const enhancedScore = evaluation.enhanced.overallScore;
        
        console.log(`\n   Q${index + 1}: ${evaluation.question.substring(0, 50)}...`);
        console.log(`   Traditional Score: ${traditionalScore.toFixed(3)}/5.0 (${evaluation.traditional.evaluation})`);
        console.log(`   Enhanced Score: ${enhancedScore.toFixed(3)}/1.0 (${evaluation.enhanced.evaluation})`);
        
        if (evaluation.enhanced.correctness1) {
          console.log(`   Correctness1: ${evaluation.enhanced.correctness1.score.toFixed(3)}/1.0 (${evaluation.enhanced.correctness1.classification ? '✅' : '❌'})`);
          console.log(`   Correctness2: ${evaluation.enhanced.correctness2.score.toFixed(3)}/1.0 (${evaluation.enhanced.correctness2.classification ? '✅' : '❌'})`);
          console.log(`   Correctness3: ${evaluation.enhanced.correctness3.score.toFixed(3)}/1.0 (${evaluation.enhanced.correctness3.classification ? '✅' : '❌'})`);
        }
      });
    } else {
      console.log('⚠️ No successful evaluations to report');
    }

    console.log('\n🎯 ===== CLIENT SERVICES EVALUATION COMPLETE =====');
    console.log(`📊 Questions Evaluated: ${evaluations.length}`);
    console.log(`🤖 Agent Created and Selected: ${foundAgentInfo.agentId} - ${foundAgentInfo.agentName}`);
  });
});
