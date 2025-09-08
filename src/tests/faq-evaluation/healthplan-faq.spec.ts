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

test('HealthPlan Agent - FAQ Evaluation Test', async ({ page }) => {
  console.log('🏥 HealthPlan Agent FAQ Evaluation Test Starting...');
  
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
  await page.waitForTimeout(10000);
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'reports/faq-evaluation/healthplan-initial.png',
    fullPage: true 
  });
  
  // Define HealthPlan-specific FAQ questions
  const healthFAQQuestions = [
    {
      question: "What are my health plan benefits for doctor visits?",
      category: "Benefits Information",
      expectedKeywords: ["benefits", "doctor", "visits", "health", "plan", "coverage"],
      difficulty: "Basic"
    },
    {
      question: "How do I file a claim for prescription medication?",
      category: "Claims Process",
      expectedKeywords: ["claim", "file", "prescription", "medication", "process", "submit"],
      difficulty: "Intermediate"
    },
    {
      question: "What is the coverage for emergency room visits?",
      category: "Emergency Coverage",
      expectedKeywords: ["coverage", "emergency", "room", "visits", "urgent", "care"],
      difficulty: "Basic"
    },
    {
      question: "Can you explain my billing statement and premium calculations?",
      category: "Billing & Premiums",
      expectedKeywords: ["billing", "premium", "statement", "calculations", "cost", "payment"],
      difficulty: "Intermediate"
    },
    {
      question: "What preventive care services are covered under my plan?",
      category: "Preventive Care",
      expectedKeywords: ["preventive", "care", "services", "covered", "wellness", "checkup"],
      difficulty: "Intermediate"
    }
  ];
  
  console.log('✅ Prepared 5 HealthPlan FAQ questions for evaluation');
  console.log('📹 Video recording is active - capturing entire interaction');
  console.log('🔍 FAQ Evaluation Mode: Testing domain knowledge and conversation context');
  
  // Store all responses and analysis
  const testResults = [];
  
  // Send each FAQ question and collect responses
  for (let i = 0; i < healthFAQQuestions.length; i++) {
    const { question, category, expectedKeywords, difficulty } = healthFAQQuestions[i];
    console.log(`\n📤 FAQ Question ${i + 1} (${category} - ${difficulty}): "${question}"`);
    
    try {
      // Wait for any previous messages to complete
      console.log('⏳ Waiting for previous message to complete...');
      await page.waitForTimeout(8000);
      
      // Find and interact with the chat input
      const chatInput = page.locator('textarea[placeholder*="Type"], input[placeholder*="Type"], [contenteditable="true"]').first();
      
      if (await chatInput.isVisible({ timeout: 15000 })) {
        // Take screenshot before interaction
        await page.screenshot({ 
          path: `reports/faq-evaluation/healthplan-before-question-${i + 1}.png`,
          fullPage: true 
        });
        
        // Explicitly click on the input field to ensure it's focused
        console.log('🖱️ Clicking on input field to focus...');
        await chatInput.click();
        await page.waitForTimeout(2000);
        
        // Clear the input field completely with multiple attempts
        console.log('🧹 Clearing input field...');
        await chatInput.fill('');
        await page.waitForTimeout(1000);
        await chatInput.press('Control+a');
        await chatInput.press('Delete');
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
        console.log(`✍️ Typing FAQ question: "${question}"`);
        await chatInput.type(question, { delay: 100 });
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
        
        console.log(`✅ FAQ question typed: "${question}"`);
        
        // Take screenshot before sending
        await page.screenshot({ 
          path: `reports/faq-evaluation/healthplan-question-${i + 1}-before-send.png`,
          fullPage: true 
        });
        
        // Send the question using Enter key
        console.log('📤 Sending FAQ question...');
        await chatInput.press('Enter');
        console.log('✅ FAQ question sent via Enter key');
        
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
        console.log('⏳ Waiting for FAQ response...');
        let responseText = '';
        let responseDetected = false;
        let responseTime = 0;
        const startTime = Date.now();
        
        // Wait for initial response
        await page.waitForTimeout(5000);
        
        for (let waitCount = 1; waitCount <= 30; waitCount++) {
          await page.waitForTimeout(3000);
          
          // Take screenshot at key intervals
          if (waitCount <= 5 || waitCount % 5 === 0) {
            await page.screenshot({ 
              path: `reports/faq-evaluation/healthplan-question-${i + 1}-wait-${waitCount}.png`,
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
                    console.log(`📥 Captured NEW FAQ response (${responseTime}ms): "${responseText.substring(0, 200)}..."`);
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
              console.log(`📥 Fallback FAQ response (${responseTime}ms): "${responseText.substring(0, 200)}..."`);
            }
          }
        }
        
        // Analyze the FAQ response
        console.log('🔍 Analyzing FAQ response...');
        const analysis = analyzeHealthFAQResponse(question, responseText, expectedKeywords, category);
        
        testResults.push({
          questionNumber: i + 1,
          category: category,
          difficulty: difficulty,
          question: question,
          response: responseText,
          responseTime: responseTime,
          analysis: analysis,
          expectedKeywords: expectedKeywords
        });
        
        console.log(`📊 FAQ Analysis Results for Question ${i + 1}:`);
        console.log(`   Response Length: ${responseText.length} characters`);
        console.log(`   Response Time: ${responseTime}ms`);
        console.log(`   Keyword Match: ${(analysis.keywordMatchScore * 100).toFixed(1)}%`);
        console.log(`   Relevance Score: ${(analysis.relevanceScore * 100).toFixed(1)}%`);
        console.log(`   Coverage Score: ${(analysis.coverageScore * 100).toFixed(1)}%`);
        console.log(`   Domain Accuracy: ${(analysis.domainAccuracy * 100).toFixed(1)}%`);
        console.log(`   Friendly Tone: ${analysis.friendlyTone ? '✅ Yes' : '❌ No'}`);
        
        // After collecting response, explicitly click on input field again for next question
        if (i < healthFAQQuestions.length - 1) {
          console.log('🖱️ Clicking on input field again to prepare for next FAQ question...');
          await chatInput.click();
          await page.waitForTimeout(2000);
          
          // Verify the input field is focused and ready
          const isFocused = await chatInput.evaluate(el => el === document.activeElement);
          console.log(`✅ Input field focused: ${isFocused ? 'Yes' : 'No'}`);
        }
        
        // Wait longer between questions to ensure proper processing
        console.log('⏳ Waiting 10 seconds before next FAQ question...');
        await page.waitForTimeout(10000);
        
      } else {
        console.log('❌ Could not find chat input field');
        throw new Error('Chat input not found');
      }
      
    } catch (error) {
      console.error(`❌ Error processing FAQ question ${i + 1}:`, error);
      
      // Add error result
      testResults.push({
        questionNumber: i + 1,
        category: category,
        difficulty: difficulty,
        question: question,
        response: 'ERROR: Could not capture response',
        responseTime: 0,
        analysis: {
          keywordMatchScore: 0,
          relevanceScore: 0,
          coverageScore: 0,
          domainAccuracy: 0,
          friendlyTone: false
        },
        expectedKeywords: expectedKeywords
      });
    }
  }
  
  // Generate comprehensive FAQ evaluation report
  console.log('\n📋 ===== HEALTHPLAN AGENT FAQ EVALUATION REPORT =====');
  console.log(`Total FAQ Questions Tested: ${testResults.length}`);
  console.log(`Agent Type: HealthPlan`);
  console.log(`Agent Name: Friendly Farah`);
  console.log(`Use Case: healthplan_001`);
  console.log('📹 Video recording completed for entire FAQ evaluation session');
  console.log('🔍 FAQ Evaluation: Testing domain knowledge and conversation context');
  
  // Calculate overall metrics
  let totalKeywordMatch = 0;
  let totalRelevance = 0;
  let totalCoverage = 0;
  let totalDomainAccuracy = 0;
  let totalResponseTime = 0;
  let successfulResponses = 0;
  let friendlyToneCount = 0;
  
  testResults.forEach((result, index) => {
    if (result.response !== 'ERROR: Could not capture response') {
      successfulResponses++;
      totalKeywordMatch += result.analysis.keywordMatchScore;
      totalRelevance += result.analysis.relevanceScore;
      totalCoverage += result.analysis.coverageScore;
      totalDomainAccuracy += result.analysis.domainAccuracy;
      totalResponseTime += result.responseTime;
      if (result.analysis.friendlyTone) friendlyToneCount++;
    }
    
    console.log(`\n🔍 FAQ Question ${result.questionNumber} (${result.category} - ${result.difficulty}):`);
    console.log(`   Q: ${result.question}`);
    console.log(`   A: ${result.response.substring(0, 150)}${result.response.length > 150 ? '...' : ''}`);
    console.log(`   Time: ${result.responseTime}ms | Keywords: ${(result.analysis.keywordMatchScore * 100).toFixed(1)}% | Relevance: ${(result.analysis.relevanceScore * 100).toFixed(1)}% | Domain: ${(result.analysis.domainAccuracy * 100).toFixed(1)}%`);
  });
  
  if (successfulResponses > 0) {
    console.log('\n📊 OVERALL FAQ PERFORMANCE METRICS:');
    console.log(`   Average Response Time: ${(totalResponseTime / successfulResponses).toFixed(0)}ms`);
    console.log(`   Average Keyword Match: ${((totalKeywordMatch / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Average Relevance: ${((totalRelevance / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Average Coverage: ${((totalCoverage / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Average Domain Accuracy: ${((totalDomainAccuracy / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Friendly Tone Rate: ${((friendlyToneCount / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Success Rate: ${((successfulResponses / testResults.length) * 100).toFixed(1)}%`);
  }
  
  // Category-specific analysis
  console.log('\n📈 FAQ CATEGORY PERFORMANCE ANALYSIS:');
  const categoryAnalysis: Record<string, { count: number; totalScore: number; totalTime: number; totalDomain: number }> = {};
  testResults.forEach(result => {
    if (!categoryAnalysis[result.category]) {
      categoryAnalysis[result.category] = { count: 0, totalScore: 0, totalTime: 0, totalDomain: 0 };
    }
    if (result.response !== 'ERROR: Could not capture response') {
      categoryAnalysis[result.category].count++;
      categoryAnalysis[result.category].totalScore += result.analysis.keywordMatchScore;
      categoryAnalysis[result.category].totalTime += result.responseTime;
      categoryAnalysis[result.category].totalDomain += result.analysis.domainAccuracy;
    }
  });
  
  Object.entries(categoryAnalysis).forEach(([category, data]) => {
    if (data.count > 0) {
      const avgScore = (data.totalScore / data.count * 100).toFixed(1);
      const avgTime = (data.totalTime / data.count).toFixed(0);
      const avgDomain = (data.totalDomain / data.count * 100).toFixed(1);
      console.log(`   ${category}: ${avgScore}% keyword match, ${avgDomain}% domain accuracy, ${avgTime}ms avg response time`);
    }
  });
  
  // Difficulty-based analysis
  console.log('\n🎯 FAQ DIFFICULTY PERFORMANCE ANALYSIS:');
  const difficultyAnalysis: Record<string, { count: number; totalScore: number; totalDomain: number }> = {};
  testResults.forEach(result => {
    if (!difficultyAnalysis[result.difficulty]) {
      difficultyAnalysis[result.difficulty] = { count: 0, totalScore: 0, totalDomain: 0 };
    }
    if (result.response !== 'ERROR: Could not capture response') {
      difficultyAnalysis[result.difficulty].count++;
      difficultyAnalysis[result.difficulty].totalScore += result.analysis.keywordMatchScore;
      difficultyAnalysis[result.difficulty].totalDomain += result.analysis.domainAccuracy;
    }
  });
  
  Object.entries(difficultyAnalysis).forEach(([difficulty, data]) => {
    if (data.count > 0) {
      const avgScore = (data.totalScore / data.count * 100).toFixed(1);
      const avgDomain = (data.totalDomain / data.count * 100).toFixed(1);
      console.log(`   ${difficulty}: ${avgScore}% keyword match, ${avgDomain}% domain accuracy`);
    }
  });
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'reports/faq-evaluation/healthplan-faq-final.png',
    fullPage: true 
  });
  console.log('📸 Final FAQ evaluation screenshot saved');
  
  console.log('\n✅ HealthPlan Agent FAQ Evaluation Test completed!');
  console.log('📹 Check the test results folder for the recorded video file');
  console.log('🔍 FAQ Evaluation: Domain knowledge and conversation context tested');
});

// Helper function to analyze HealthPlan FAQ responses
function analyzeHealthFAQResponse(question: string, response: string, expectedKeywords: string[], category: string) {
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
  const coverageScore = Math.min(response.length / 100, 1.0);
  
  // Calculate domain accuracy (how well it answers health plan questions)
  const healthDomainTerms = [
    'benefits', 'coverage', 'claim', 'prescription', 'medication', 'emergency',
    'doctor', 'visit', 'billing', 'premium', 'preventive', 'care', 'wellness',
    'health', 'plan', 'insurance', 'medical', 'treatment', 'service'
  ];
  const domainTermsFound = healthDomainTerms.filter(term => responseLower.includes(term));
  const domainAccuracy = healthDomainTerms.length > 0 ? domainTermsFound.length / healthDomainTerms.length : 0;
  
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
    domainAccuracy,
    friendlyTone
  };
}
