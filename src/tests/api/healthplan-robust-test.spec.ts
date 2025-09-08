import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentSelectorFromCLI, initAgentBySelector, getAgentHandle } from '@utils/api/ushur.Agents';
import { agentConfig } from '@configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '@utils/env';

test.use({ 
  video: 'on',
  screenshot: 'on',
  trace: 'on',
  headless: false
});

test('HealthPlan Agent - Robust Test with Better Automation', async ({ page }) => {
  console.log('🏥 HealthPlan Agent Robust Test: Testing with improved automation...');
  
  const instance = env.instance;
  const { token, account } = await getUshurTokenFromApi();
  console.log(`🔐 Using account: ${account}`);
  
  const handle = getAgentHandle();
  console.log('selector from CLI/env:', handle);
  
  let agentUrl: string;
  
  if (handle) {
    agentUrl = await initAgentBySelector(instance, token, agentConfig, handle);
    console.log('🔄 Initialized existing agent →', agentUrl);
  } else {
    agentUrl = await createAndActivateAgent(instance, token, agentConfig, account);
    console.log('✨ Created NEW agent →', agentUrl);
  }

  // Navigate to the agent session URL
  console.log('🌐 Navigating to agent URL:', agentUrl);
  await page.goto(agentUrl);
  
  // Wait for the chat interface to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(10000); // Longer initial wait
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'reports/healthplan-robust-initial.png',
    fullPage: true 
  });
  
  // Define 3 health plan related questions
  const healthQuestions = [
    {
      question: "What are my health plan benefits for doctor visits?",
      category: "Benefits Information",
      expectedKeywords: ["benefits", "doctor", "visits", "health", "plan"]
    },
    {
      question: "How do I file a claim for prescription medication?",
      category: "Claims Process",
      expectedKeywords: ["claim", "file", "prescription", "medication", "process"]
    },
    {
      question: "What is the coverage for emergency room visits?",
      category: "Emergency Coverage",
      expectedKeywords: ["coverage", "emergency", "room", "visits", "urgent"]
    }
  ];
  
  console.log('✅ Prepared 3 health plan questions for testing');
  console.log('📹 Video recording is active - capturing entire interaction');
  console.log('🔧 Using improved automation techniques...');
  
  // Store all responses and analysis
  const testResults = [];
  
  // Send each question and collect responses
  for (let i = 0; i < healthQuestions.length; i++) {
    const { question, category, expectedKeywords } = healthQuestions[i];
    console.log(`\n📤 Question ${i + 1} (${category}): "${question}"`);
    
    try {
      // Wait longer for any previous messages to complete
      console.log('⏳ Waiting for previous message to complete...');
      await page.waitForTimeout(8000); // Increased wait time
      
      // Find and interact with the chat input
      const chatInput = page.locator('textarea[placeholder*="Type"], input[placeholder*="Type"], [contenteditable="true"]').first();
      
      if (await chatInput.isVisible({ timeout: 15000 })) {
        // Take screenshot before interaction
        await page.screenshot({ 
          path: `reports/healthplan-robust-before-question-${i + 1}.png`,
          fullPage: true 
        });
        
        // Explicitly click on the input field to ensure it's focused
        console.log('🖱️ Clicking on input field to focus...');
        await chatInput.click();
        await page.waitForTimeout(2000); // Longer focus wait
        
        // Clear the input field completely with multiple attempts
        console.log('🧹 Clearing input field...');
        await chatInput.fill('');
        await page.waitForTimeout(1000);
        await chatInput.press('Control+a'); // Select all
        await chatInput.press('Delete'); // Delete selection
        await page.waitForTimeout(1000);
        
        // Verify the input field is completely empty
        const inputValueAfterClear = await chatInput.inputValue();
        if (inputValueAfterClear !== '') {
          console.log(`⚠️ Input field not cleared. Content: "${inputValueAfterClear}"`);
          // Force clear with JavaScript
          await page.evaluate(() => {
            const inputs = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
            inputs.forEach(input => {
              if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
                input.value = '';
              } else if (input instanceof HTMLElement && input.contentEditable === 'true') {
                input.textContent = '';
              }
            });
          });
          await page.waitForTimeout(1000);
        }
        
        // Type the new question slowly
        console.log(`✍️ Typing question: "${question}"`);
        await chatInput.type(question, { delay: 100 }); // Type with delay
        await page.waitForTimeout(1000);
        
        // Verify the question is in the input field
        const inputValue = await chatInput.inputValue();
        if (inputValue !== question) {
          console.log(`⚠️ Input verification failed. Expected: "${question}", Got: "${inputValue}"`);
          // Try to clear and retype
          await chatInput.fill('');
          await page.waitForTimeout(1000);
          await chatInput.type(question, { delay: 100 });
          await page.waitForTimeout(1000);
        }
        
        console.log(`✅ Question typed: "${question}"`);
        
        // Take screenshot before sending
        await page.screenshot({ 
          path: `reports/healthplan-robust-question-${i + 1}-before-send.png`,
          fullPage: true 
        });
        
        // Send the question using Enter key
        console.log('📤 Sending question...');
        await chatInput.press('Enter');
        console.log('✅ Question sent via Enter key');
        
        // Wait longer and verify the input field is cleared
        await page.waitForTimeout(3000);
        const inputAfterSend = await chatInput.inputValue();
        if (inputAfterSend !== '') {
          console.log(`⚠️ Input field not cleared after send. Content: "${inputAfterSend}"`);
          // Try pressing Enter again
          await chatInput.press('Enter');
          await page.waitForTimeout(2000);
        }
        
        // Wait for response with better detection
        console.log('⏳ Waiting for response...');
        let responseText = '';
        let responseDetected = false;
        let responseTime = 0;
        const startTime = Date.now();
        
        // Wait for initial response
        await page.waitForTimeout(5000);
        
        for (let waitCount = 1; waitCount <= 30; waitCount++) {
          await page.waitForTimeout(3000); // Longer wait between checks
          
          // Take screenshot at key intervals
          if (waitCount <= 5 || waitCount % 5 === 0) {
            await page.screenshot({ 
              path: `reports/healthplan-robust-question-${i + 1}-wait-${waitCount}.png`,
              fullPage: true 
            });
          }
          
          // Check page content changes
          const currentPageText = await page.textContent('body');
          const currentLength = currentPageText?.length || 0;
          
          if (waitCount <= 5 || waitCount % 5 === 0) {
            console.log(`⏳ Wait ${waitCount}: Page text length = ${currentLength}`);
          }
          
          // Look for new message elements with better selectors
          const messageElements = await page.locator('[class*="message"], [class*="chat"], [class*="response"], [class*="bot"], [class*="agent"], [class*="bubble"], [class*="text"], [class*="content"]').all();
          
          if (messageElements.length > 0) {
            // Look for the most recent response that doesn't contain our question
            for (let j = messageElements.length - 1; j >= 0; j--) {
              try {
                const text = await messageElements[j].textContent();
                if (text && text.trim().length > 0 && !text.includes(question) && text.length > 20) {
                  // This looks like a response - check if it's different from previous responses
                  const newResponseText = text.trim();
                  if (newResponseText !== responseText) {
                    responseText = newResponseText;
                    responseDetected = true;
                    responseTime = Date.now() - startTime;
                    console.log(`📥 Captured NEW response (${responseTime}ms): "${responseText.substring(0, 200)}..."`);
                    break;
                  }
                }
              } catch (e) {
                // Element might not be accessible
              }
            }
            
            if (responseDetected) {
              break;
            }
          }
          
          // Stop early if we see significant content changes
          if (currentLength > 16000) {
            console.log('📈 Significant content change detected, likely response received');
            break;
          }
        }
        
        if (!responseDetected) {
          console.log('⚠️ No response captured, using fallback method');
          // Try to extract any new content that appeared
          const finalPageText = await page.textContent('body');
          if (finalPageText) {
            // Look for content that might be the response
            const lines = finalPageText.split('\n').map(line => line.trim()).filter(line => line.length > 20);
            const potentialResponse = lines.find(line => 
              !line.includes(question) && 
              !line.includes('Title') && 
              !line.includes('function') &&
              line.length > 50
            );
            if (potentialResponse) {
              responseText = potentialResponse;
              responseTime = Date.now() - startTime;
              console.log(`📥 Fallback response (${responseTime}ms): "${responseText.substring(0, 200)}..."`);
            }
          }
        }
        
        // Analyze the response
        console.log('🔍 Analyzing response...');
        const analysis = analyzeHealthResponse(question, responseText, expectedKeywords);
        
        testResults.push({
          questionNumber: i + 1,
          category: category,
          question: question,
          response: responseText,
          responseTime: responseTime,
          analysis: analysis,
          expectedKeywords: expectedKeywords
        });
        
        console.log(`📊 Analysis Results for Question ${i + 1}:`);
        console.log(`   Response Length: ${responseText.length} characters`);
        console.log(`   Response Time: ${responseTime}ms`);
        console.log(`   Keyword Match: ${(analysis.keywordMatchScore * 100).toFixed(1)}%`);
        console.log(`   Relevance Score: ${(analysis.relevanceScore * 100).toFixed(1)}%`);
        console.log(`   Coverage Score: ${(analysis.coverageScore * 100).toFixed(1)}%`);
        console.log(`   Friendly Tone: ${analysis.friendlyTone ? '✅ Yes' : '❌ No'}`);
        
        // After collecting response, explicitly click on input field again for next question
        if (i < healthQuestions.length - 1) { // Don't click after the last question
          console.log('🖱️ Clicking on input field again to prepare for next question...');
          await chatInput.click();
          await page.waitForTimeout(2000);
          
          // Verify the input field is focused and ready
          const isFocused = await chatInput.evaluate(el => el === document.activeElement);
          console.log(`✅ Input field focused: ${isFocused ? 'Yes' : 'No'}`);
        }
        
        // Wait much longer between questions to ensure proper processing
        console.log('⏳ Waiting 10 seconds before next question...');
        await page.waitForTimeout(10000);
        
      } else {
        console.log('❌ Could not find chat input field');
        throw new Error('Chat input not found');
      }
      
    } catch (error) {
      console.error(`❌ Error processing question ${i + 1}:`, error);
      
      // Add error result
      testResults.push({
        questionNumber: i + 1,
        category: category,
        question: question,
        response: 'ERROR: Could not capture response',
        responseTime: 0,
        analysis: {
          keywordMatchScore: 0,
          relevanceScore: 0,
          coverageScore: 0,
          friendlyTone: false
        },
        expectedKeywords: expectedKeywords
      });
    }
  }
  
  // Generate comprehensive test report
  console.log('\n📋 ===== HEALTHPLAN AGENT ROBUST TEST REPORT =====');
  console.log(`Total Questions Tested: ${testResults.length}`);
  console.log(`Agent Type: HealthPlan`);
  console.log(`Agent Name: Friendly Farah`);
  console.log(`Use Case: healthplan_001`);
  console.log('📹 Video recording completed for entire test session');
  console.log('🔧 Improved automation techniques used');
  
  // Calculate overall metrics
  let totalKeywordMatch = 0;
  let totalRelevance = 0;
  let totalCoverage = 0;
  let totalResponseTime = 0;
  let successfulResponses = 0;
  let friendlyToneCount = 0;
  
  testResults.forEach((result, index) => {
    if (result.response !== 'ERROR: Could not capture response') {
      successfulResponses++;
      totalKeywordMatch += result.analysis.keywordMatchScore;
      totalRelevance += result.analysis.relevanceScore;
      totalCoverage += result.analysis.coverageScore;
      totalResponseTime += result.responseTime;
      if (result.analysis.friendlyTone) friendlyToneCount++;
    }
    
    console.log(`\n🔍 Question ${result.questionNumber} (${result.category}):`);
    console.log(`   Q: ${result.question}`);
    console.log(`   A: ${result.response.substring(0, 150)}${result.response.length > 150 ? '...' : ''}`);
    console.log(`   Time: ${result.responseTime}ms | Keywords: ${(result.analysis.keywordMatchScore * 100).toFixed(1)}% | Relevance: ${(result.analysis.relevanceScore * 100).toFixed(1)}%`);
  });
  
  if (successfulResponses > 0) {
    console.log('\n📊 OVERALL PERFORMANCE METRICS:');
    console.log(`   Average Response Time: ${(totalResponseTime / successfulResponses).toFixed(0)}ms`);
    console.log(`   Average Keyword Match: ${((totalKeywordMatch / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Average Relevance: ${((totalRelevance / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Average Coverage: ${((totalCoverage / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Friendly Tone Rate: ${((friendlyToneCount / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Success Rate: ${((successfulResponses / testResults.length) * 100).toFixed(1)}%`);
  }
  
  // Category-specific analysis
  console.log('\n📈 CATEGORY PERFORMANCE ANALYSIS:');
  const categoryAnalysis: Record<string, { count: number; totalScore: number; totalTime: number }> = {};
  testResults.forEach(result => {
    if (!categoryAnalysis[result.category]) {
      categoryAnalysis[result.category] = { count: 0, totalScore: 0, totalTime: 0 };
    }
    if (result.response !== 'ERROR: Could not capture response') {
      categoryAnalysis[result.category].count++;
      categoryAnalysis[result.category].totalScore += result.analysis.keywordMatchScore;
      categoryAnalysis[result.category].totalTime += result.responseTime;
    }
  });
  
  Object.entries(categoryAnalysis).forEach(([category, data]) => {
    if (data.count > 0) {
      const avgScore = (data.totalScore / data.count * 100).toFixed(1);
      const avgTime = (data.totalTime / data.count).toFixed(0);
      console.log(`   ${category}: ${avgScore}% keyword match, ${avgTime}ms avg response time`);
    }
  });
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'reports/healthplan-robust-final.png',
    fullPage: true 
  });
  console.log('📸 Final test screenshot saved');
  
  console.log('\n✅ HealthPlan Agent Robust Test completed!');
  console.log('📹 Check the test results folder for the recorded video file');
  console.log('🔧 Improved automation should resolve the context issues');
});

// Helper function to analyze health plan responses
function analyzeHealthResponse(question: string, response: string, expectedKeywords: string[]) {
  const questionLower = question.toLowerCase();
  const responseLower = response.toLowerCase();
  
  // Calculate keyword match score
  const matchedKeywords = expectedKeywords.filter(keyword => 
    responseLower.includes(keyword.toLowerCase())
  );
  const keywordMatchScore = expectedKeywords.length > 0 ? matchedKeywords.length / expectedKeywords.length : 0;
  
  // Calculate relevance score based on question-response alignment
  const questionWords = questionLower.split(/\s+/).filter(w => w.length > 3);
  const responseWords = responseLower.split(/\s+/).filter(w => w.length > 3);
  const relevantWords = questionWords.filter(word => 
    responseWords.some(responseWord => responseWord.includes(word) || word.includes(responseWord))
  );
  const relevanceScore = questionWords.length > 0 ? relevantWords.length / questionWords.length : 0;
  
  // Calculate coverage score (how comprehensive the response is)
  const coverageScore = Math.min(response.length / 100, 1.0); // Normalize by expected response length
  
  // Check for friendly tone indicators (appropriate for HealthPlan agent)
  const friendlyIndicators = [
    'hi', 'hello', 'help', 'assist', 'welcome', 'friendly', 'simple', 'stress-free',
    'benefits', 'coverage', 'claim', 'prescription', 'medication', 'emergency'
  ];
  const hasFriendlyTerms = friendlyIndicators.some(term => responseLower.includes(term));
  const friendlyTone = hasFriendlyTerms && response.length > 30;
  
  return {
    keywordMatchScore,
    relevanceScore,
    coverageScore,
    friendlyTone
  };
}
