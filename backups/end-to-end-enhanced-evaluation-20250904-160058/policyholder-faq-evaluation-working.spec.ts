import { test, expect } from '@playwright/test';
import { 
  FAQSynthesisUtils, 
  FAQEvaluatorFactory, 
  FAQReportGenerator 
} from '../../utils/faq-evaluation';
import { env } from '../../utils/env';

test.describe('PolicyHolder Agent FAQ Evaluation - Working Version', () => {
  test('PolicyHolder Agent FAQ Knowledge Assessment', async ({ page, browser }) => {
    test.setTimeout(300000); // 5 minutes
    
    // Create new context for debugging (like in reference code)
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting PolicyHolder Agent FAQ Evaluation...');

    // Step 1: Load PDF and generate questions
    console.log('\n📚 STEP 1: Loading Policy Holder PDF and Generating Questions');
    const { documents, questions } = await FAQSynthesisUtils.synthesizeFAQContent('policyholder', 3);
    
    console.log('📝 Policy Holder FAQ Questions:');
    questions.forEach((q, i) => console.log(`   ${i + 1}. ${q}`));

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
    console.log('\n🏢 STEP 4: Navigating to Agents Page');
    const agentsUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=agents';
    await newPage.goto(agentsUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 5: Find and click on PolicyHolder agent
    console.log('\n🔍 STEP 5: Finding PolicyHolder Agent');
    
    // Wait for the agents table to load
    await newPage.waitForSelector('table', { timeout: 10000 });
    
    // Find all agent rows
    const agentRows = newPage.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`📊 Found ${rowCount} agent rows in table`);
    
    let selectedAgentRow = null;
    
    // Look for PolicyHolder agents
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      // Skip header rows or rows without proper content
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      // Check if this row contains a PolicyHolder agent
      if (rowText.includes('PolicyHolder') || rowText.includes('Policy')) {
        console.log(`✅ Found PolicyHolder agent in row ${i + 1}`);
        selectedAgentRow = row;
        break;
      }
    }
    
    if (!selectedAgentRow) {
      throw new Error('No PolicyHolder agent found in the agents table');
    }
    
    // Click on the selected agent row to open it
    console.log('🖱️ Clicking on PolicyHolder agent row...');
    await selectedAgentRow.click();
    await newPage.waitForTimeout(3000);

    // Step 6: Click Preview Agent button
    console.log('\n🔍 STEP 6: Opening Agent Preview');
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
        
        // Step 8: Conduct FAQ evaluation
        console.log('\n💬 STEP 8: Conducting PolicyHolder FAQ Evaluation');
        
        // Debug: Let's see what's actually in the iframe
        console.log('🔍 Debugging iframe content...');
        
        // Check for any input elements
        const allInputs = chatFrame.locator('input, textarea, [contenteditable="true"]');
        const inputCount = await allInputs.count();
        console.log(`📝 Found ${inputCount} total input elements in iframe`);
        
        // Check for any elements with the chatbot class
        const chatbotElements = chatFrame.locator('[class*="chatbot"], [class*="ushur"]');
        const chatbotCount = await chatbotElements.count();
        console.log(`🤖 Found ${chatbotCount} chatbot-related elements in iframe`);
        
        // Check for any textarea elements specifically
        const textareas = chatFrame.locator('textarea');
        const textareaCount = await textareas.count();
        console.log(`📝 Found ${textareaCount} textarea elements in iframe`);
        
        // List all elements to see what's available
        const allElements = chatFrame.locator('*');
        const totalElements = await allElements.count();
        console.log(`🔍 Total elements in iframe: ${totalElements}`);
        
        // Try to find the specific selector we're looking for
        const specificSelector = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
        const specificCount = await specificSelector.count();
        console.log(`🎯 Specific selector found ${specificCount} elements`);
        
        // If no specific selector, try broader selectors
        if (specificCount === 0) {
          console.log('⚠️ Specific selector not found, trying broader selectors...');
          
          // Try just the textarea
          const anyTextarea = chatFrame.locator('textarea').first();
          if (await anyTextarea.count() > 0) {
            console.log('✅ Found textarea with broader selector');
            const placeholder = await anyTextarea.getAttribute('placeholder');
            const className = await anyTextarea.getAttribute('class');
            console.log(`📝 Textarea placeholder: "${placeholder}"`);
            console.log(`📝 Textarea class: "${className}"`);
          }
        }
        
        const faqResults = [];
        const faqEvaluator = FAQEvaluatorFactory.createEvaluator('policyholder');
        
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          const messageTime = new Date().toISOString();
          console.log(`\n🤖 FAQ Question ${i + 1}/${questions.length}: "${question}"`);
          
          try {
            // Use the working chat input selector from reference code
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
              
              // Additional wait after input is ready (like in reference code)
              if (inputReady) {
                await newPage.waitForTimeout(2000);
              }
            } else {
              await newPage.waitForTimeout(2000);
            }
            
            console.log(`✍️ Typing FAQ question ${i + 1}: "${question}"`);
            
            // Use the EXACT working typing approach from reference code
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
              
              // Try to re-focus and clear the input field
              await currentChatInput.first().click();
              await newPage.waitForTimeout(500);
              await currentChatInput.first().fill('');
              await newPage.waitForTimeout(300);
              
              // Try typing again
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
              
              // Verify this is the question we just sent
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
            
            // SIMPLE BUT EFFECTIVE RESPONSE CAPTURE - Wait and get the latest response
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
            
            // Evaluate the response
            console.log('🔍 Evaluating FAQ response...');
            const evaluation = await faqEvaluator.evaluateResponse(question, actualResponse, documents[0].pageContent);
            
            console.log('📊 FAQ Evaluation Scores:');
            for (const [metric, score] of Object.entries(evaluation.scores)) {
              console.log(`   ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${score}/5`);
            }
            console.log(`   Overall Score: ${evaluation.overallScore}/5 (${evaluation.evaluation})`);
            
            // Store results
            faqResults.push({
              question,
              response: actualResponse,
              evaluation,
              timestamp: messageTime
            });
            
            // Take screenshot
            await newPage.screenshot({
              path: `reports/ui/policyholder-faq-q${i + 1}-response.png`,
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
              evaluation: null,
              timestamp: messageTime
            });
          }
        }
        
        // Generate FAQ evaluation report
        console.log('\n📊 STEP 9: Generating PolicyHolder FAQ Evaluation Report');
        
        const successfulEvaluations = faqResults.filter(r => r.evaluation !== null);
        if (successfulEvaluations.length > 0) {
          console.log('📊 FAQ Evaluation Results:');
          faqResults.forEach((result, index) => {
            console.log(`\n   Q${index + 1}: ${result.question}`);
            console.log(`   Response: ${result.response.substring(0, 100)}...`);
            if (result.evaluation) {
              console.log(`   Score: ${result.evaluation.overallScore}/5 (${result.evaluation.evaluation})`);
            } else {
              console.log(`   Score: ERROR`);
            }
          });
        } else {
          console.log('⚠️ No successful evaluations to report');
        }
        
        console.log('\n🎯 ===== POLICYHOLDER FAQ EVALUATION COMPLETE =====');
        console.log(`📊 Questions Evaluated: ${faqResults.length}`);
        
      } else {
        throw new Error('Could not access iframe content');
      }
    } else {
      throw new Error('Chat iframe not found');
    }
  });
});
