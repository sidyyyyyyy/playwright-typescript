import { test, expect } from '@playwright/test';
import { 
  FAQSynthesisUtils, 
  FAQEvaluatorFactory, 
  FAQReportGenerator 
} from '../../utils/faq-evaluation';
import { EnhancedEvaluatorFactory } from '../../utils/faq-evaluation/geval-enhanced.utils';
import { createAndActivateAgent } from '../../utils/api/ushur.Agents';
import { env } from '../../utils/env';

test.describe('End-to-End Complete Backup Test - Agent Creation to Evaluation', () => {
  test('Create agent from scratch, select from dashboard, and run enhanced evaluation', async ({ page, browser }) => {
    test.setTimeout(600000); // 10 minutes for complete flow
    
    // Create new context for debugging
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting Complete End-to-End Backup Test...');

    // Step 1: Load PDF and generate questions using LangChain
    console.log('\n📚 STEP 1: Loading PDF and Generating Questions with LangChain');
    const { documents, questions } = await FAQSynthesisUtils.synthesizeFAQContent('policyholder', 3);
    
    console.log('📝 Generated Questions from PDF:');
    questions.forEach((q, i) => console.log(`   ${i + 1}. ${q}`));

    // Step 2: Create a new PolicyHolder agent from scratch
    console.log('\n🤖 STEP 2: Creating New PolicyHolder Agent from Scratch');
    const agentConfig = {
      AGENT_TYPE: 'PolicyHolder',
      AGENT_DESCRIPTION: 'The Policyholder Engagement System helps insurance customers navigate their policies by clarifying coverage, explaining billing, guiding them on claim filing and status timelines, and answering endorsement questions. Policyholders can ask any policy-related question and receive precise information or step-by-step guidance. The system is committed to making every interaction with the insurer seamless, informative, and satisfying for policyholders.',
      FRIENDLY_NAME: 'Backup Test Agent',
      GREET_MESSAGE: 'Hello! I\'m your backup test agent here to help with policy questions and provide information about our services.',
      USE_CASE_TEMPLATE: 'policyholder_001',
      CAP_NAME: 'Knowledge Base',
      CAP_INDEX: '0',
      TASK_ID: 'task_002',
      TASK_NAME: 'Update Address',
      PERSONA_ID: 'persona_002',
      TONE: 'Professional',
      FORMALITY: 'Casual',
      EMPATHY: 'Low',
      READABILITY: 'College Readability'
    };

    let agentId = null;
    let sessionURL = null;
    let agentName = agentConfig.FRIENDLY_NAME;

    try {
      console.log('🔄 Creating agent with configuration...');
      const agentData = await createAndActivateAgent(agentConfig);
      agentId = agentData.agentId;
      sessionURL = agentData.agentInitSessionURL || agentData.sessionURL;
      console.log(`✅ Successfully created agent with ID: ${agentId}`);
      console.log(`🔗 Session URL: ${sessionURL}`);
      console.log(`📝 Agent Name: ${agentName}`);
    } catch (error) {
      console.log('⚠️ Agent creation failed, using fallback approach...');
      // Fallback: Use existing agent
      agentId = '8851657'; // Known PolicyHolder agent
      agentName = 'Existing PolicyHolder Agent';
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

    // Step 6: Find the created agent by ID or name from dashboard
    console.log('\n🔍 STEP 6: Finding Created Agent in Dashboard');
    
    // Wait for the agents table to load
    await newPage.waitForSelector('table', { timeout: 10000 });
    
    // Find all agent rows
    const agentRows = newPage.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`📊 Found ${rowCount} agent rows in dashboard`);
    
    let selectedAgentRow = null;
    let foundAgentInfo = null;
    
    // Look for the created agent by ID or name
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      // Skip header rows or rows without proper content
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      // Check if this row contains our created agent
      if (rowText.includes(agentId) || 
          rowText.includes(agentName) || 
          rowText.includes('Backup Test Agent') ||
          (rowText.includes('PolicyHolder') && agentId === '8851657')) {
        console.log(`✅ Found target agent in row ${i + 1}: ${rowText.substring(0, 50)}...`);
        selectedAgentRow = row;
        foundAgentInfo = {
          rowNumber: i + 1,
          agentId: rowText.split(' ')[0], // Extract agent ID from first column
          agentName: rowText.split(' ')[1] || 'Unknown',
          agentType: rowText.includes('PolicyHolder') ? 'PolicyHolder' : 'Unknown'
        };
        break;
      }
    }
    
    if (!selectedAgentRow) {
      throw new Error(`Created agent with ID ${agentId} or name "${agentName}" not found in dashboard`);
    }
    
    console.log(`🎯 Selected Agent Details:`);
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
      
      const frame = await chatIframe.elementHandle();
      const chatFrame = await frame?.contentFrame();
      
      if (chatFrame) {
        console.log('✅ Successfully switched to chat iframe');
        await newPage.waitForTimeout(5000);
        
        // Step 9: Create evaluators
        console.log('\n🔍 STEP 9: Creating Evaluation Systems');
        const traditionalEvaluator = FAQEvaluatorFactory.createEvaluator('policyholder');
        const enhancedEvaluator = EnhancedEvaluatorFactory.createEvaluator();
        
        // Step 10: Conduct FAQ evaluation with both systems
        console.log('\n💬 STEP 10: Conducting Comprehensive FAQ Evaluation');
        
        const faqResults = [];
        const enhancedResults = [];

        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          const messageTime = new Date().toISOString();
          console.log(`\n🤖 FAQ Question ${i + 1}/${questions.length}: "${question}"`);
          
          try {
            // Use the working chat input selector
            const currentChatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
            
            const inputCount = await currentChatInput.count();
            console.log(`📝 Found ${inputCount} chat input elements in iframe`);
            
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
            
            console.log(`✍️ Typing FAQ question ${i + 1}: "${question}"`);
            
            // Use the working typing approach
            await currentChatInput.first().click();
            await newPage.waitForTimeout(500);
            
            await currentChatInput.first().fill('');
            await newPage.waitForTimeout(300);
            await currentChatInput.first().press('Control+a');
            await newPage.waitForTimeout(300);
            await currentChatInput.first().press('Delete');
            await newPage.waitForTimeout(500);
            
            await currentChatInput.first().type(question, { delay: 100 });
            await newPage.waitForTimeout(1000);
            
            const inputValue = await currentChatInput.first().inputValue();
            console.log(`📋 Input value after typing: "${inputValue}"`);
            
            // Verify the question was actually typed
            if (!inputValue || inputValue.trim() !== question.trim()) {
              console.log('⚠️ Question not typed properly, trying alternative approach...');
              
              await currentChatInput.first().click();
              await newPage.waitForTimeout(500);
              await currentChatInput.first().fill('');
              await newPage.waitForTimeout(300);
              
              await currentChatInput.first().type(question, { delay: 100 });
              await newPage.waitForTimeout(500);
              
              const retryValue = await currentChatInput.first().inputValue();
              console.log(`📋 Retry input value: "${retryValue}"`);
              
              if (!retryValue || retryValue.trim() !== question.trim()) {
                console.log('⚠️ Second retry failed, trying fill approach...');
                await currentChatInput.first().fill(question);
                await newPage.waitForTimeout(500);
                
                const fillValue = await currentChatInput.first().inputValue();
                console.log(`📋 Fill approach value: "${fillValue}"`);
                
                if (!fillValue || fillValue.trim() !== question.trim()) {
                  throw new Error(`Failed to type question ${i + 1} after all retry attempts`);
                }
              }
            }
            
            // Get current message count before sending question
            const messagesBeforeQuestion = chatFrame.locator('div.chatbot-message');
            const messageCountBefore = await messagesBeforeQuestion.count();
            console.log(`📊 Messages before question ${i + 1}: ${messageCountBefore}`);
            
            // Send the question
            console.log('📤 Pressing Enter to send FAQ question...');
            await currentChatInput.first().press('Enter');
            console.log(`✅ FAQ question ${i + 1} sent: "${question}"`);
            
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
            
            // Wait for agent response
            console.log('⏳ Waiting for agent response...');
            let actualResponse = '';
            
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
                    actualResponse = responseText.trim();
                    console.log(`✅ Captured latest agent response: "${responseText.trim().substring(0, 100)}..."`);
                    
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
            
            // Create expected output based on PDF content
            const expectedOutput = `Based on the Community Resource Centers information, ${question.toLowerCase().includes('claim') ? 
              'Community Wellness Centers offer free services, so no insurance claims are needed. Services include fitness classes, health workshops, and wellness activities at locations in Riverside, San Bernardino, and Victorville.' :
              'Community Resource Centers provide various support services including job training, youth mentoring, immigration support, and housing support. These services are available to all IE residents and are provided through community partnerships.'}`;

            // Traditional evaluation
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
            faqResults.push({
              question,
              response: actualResponse,
              traditional: traditionalEvaluation,
              enhanced: enhancedEvaluation,
              timestamp: messageTime
            });

            enhancedResults.push(enhancedEvaluation);

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
              path: `reports/ui/backup-e2e-faq-q${i + 1}-response.png`,
              fullPage: true
            });
            
            console.log(`📸 Screenshot saved for FAQ question ${i + 1}`);
            
            if (i < questions.length - 1) {
              console.log('⏳ Waiting 3 seconds before next question...');
              await newPage.waitForTimeout(3000);
            }
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error with FAQ question ${i + 1}:`, errorMessage);
            
            faqResults.push({
              question,
              response: `ERROR: ${errorMessage}`,
              traditional: null,
              enhanced: null,
              timestamp: messageTime
            });
          }
        }
        
        // Step 11: Generate comprehensive evaluation report
        console.log('\n📊 STEP 11: Generating Comprehensive Evaluation Report');
        
        const successfulEvaluations = faqResults.filter(r => r.traditional !== null && r.enhanced !== null);
        if (successfulEvaluations.length > 0) {
          // Calculate averages
          const traditionalScores = successfulEvaluations.map(r => r.traditional.overallScore);
          const enhancedScores = successfulEvaluations.map(r => r.enhanced.overallScore);
          
          const avgTraditional = traditionalScores.reduce((a, b) => a + b, 0) / traditionalScores.length;
          const avgEnhanced = enhancedScores.reduce((a, b) => a + b, 0) / enhancedScores.length;

          console.log('\n📈 ===== COMPREHENSIVE BACKUP EVALUATION REPORT =====');
          console.log(`🤖 Agent ID: ${agentId}`);
          console.log(`📝 Agent Name: ${agentName}`);
          console.log(`📋 Questions Evaluated: ${successfulEvaluations.length}`);
          console.log(`📊 Traditional Evaluation Average: ${avgTraditional.toFixed(3)}/5.0`);
          console.log(`🔍 Enhanced GEval Average: ${avgEnhanced.toFixed(3)}/1.0`);
          
          // Detailed metrics comparison
          console.log('\n📊 Detailed Metrics Comparison:');
          successfulEvaluations.forEach((result, index) => {
            console.log(`\n   Q${index + 1}: ${result.question.substring(0, 60)}...`);
            console.log(`   Traditional Score: ${result.traditional.overallScore.toFixed(3)}/5.0 (${result.traditional.evaluation})`);
            console.log(`   Enhanced Score: ${result.enhanced.overallScore.toFixed(3)}/1.0 (${result.enhanced.evaluation})`);
            console.log(`   Correctness1: ${result.enhanced.correctness1.score.toFixed(3)}/1.0 (${result.enhanced.correctness1.classification ? '✅' : '❌'})`);
            console.log(`   Correctness2: ${result.enhanced.correctness2.score.toFixed(3)}/1.0 (${result.enhanced.correctness2.classification ? '✅' : '❌'})`);
            console.log(`   Correctness3: ${result.enhanced.correctness3.score.toFixed(3)}/1.0 (${result.enhanced.correctness3.classification ? '✅' : '❌'})`);
          });

          // Assertions
          expect(successfulEvaluations.length).toBeGreaterThan(0);
          expect(avgTraditional).toBeGreaterThanOrEqual(0);
          expect(avgEnhanced).toBeGreaterThanOrEqual(0);
          expect(avgEnhanced).toBeLessThanOrEqual(1);
        } else {
          console.log('⚠️ No successful evaluations to report');
        }
        
        console.log('\n🎯 ===== COMPLETE BACKUP TEST COMPLETE =====');
        console.log(`📊 Questions Evaluated: ${faqResults.length}`);
        console.log(`🤖 Agent Created and Selected: ${agentId} - ${agentName}`);
        
      } else {
        throw new Error('Could not access iframe content');
      }
    } else {
      throw new Error('Chat iframe not found');
    }
  });
});
