import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentSelectorFromCLI, initAgentBySelector, getAgentHandle } from '@utils/api/ushur.Agents';
import { agentConfig } from '@configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '@utils/env';

// Mock LangChain functionality for question generation
class MockLangChain {
  static generateQuestionsFromPDF(): Array<{ question: string; expectedAnswer: string }> {
    // Simulating LangChain-generated questions based on the community_resources.pdf
    return [
      {
        question: "What are the key features of community banking services?",
        expectedAnswer: "Community banking services typically include personal and business accounts, loans, mortgages, online banking, mobile apps, and local community support programs."
      },
      {
        question: "How can I access my banking information online?",
        expectedAnswer: "You can access your banking information online through secure login portals, mobile banking apps, and web-based platforms that provide 24/7 access to account balances, transactions, and banking services."
      },
      {
        question: "What types of loans are available for small businesses?",
        expectedAnswer: "Small business loans include term loans, lines of credit, equipment financing, commercial real estate loans, and SBA-guaranteed loans designed to support business growth and operations."
      }
    ];
  }
}

// Evaluation metrics class
class EvaluationMetrics {
  static evaluateResponse(question: string, expectedAnswer: string, actualResponse: string) {
    const results = {
      question,
      expectedAnswer,
      actualResponse,
      metrics: {
        factualAccuracy: this.calculateFactualAccuracy(expectedAnswer, actualResponse),
        completeness: this.calculateCompleteness(expectedAnswer, actualResponse),
        relevance: this.calculateRelevance(question, actualResponse),
        structure: this.calculateStructure(actualResponse)
      }
    };
    
    return results;
  }

  private static calculateFactualAccuracy(expected: string, actual: string): number {
    const expectedWords = expected.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const actualWords = actual.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    if (expectedWords.length === 0) return 1.0;
    
    const matchingWords = expectedWords.filter(word => 
      actualWords.some(actualWord => actualWord.includes(word) || word.includes(actualWord))
    );
    
    return matchingWords.length / expectedWords.length;
  }

  private static calculateCompleteness(expected: string, actual: string): number {
    const expectedLength = expected.length;
    const actualLength = actual.length;
    
    if (expectedLength === 0) return 1.0;
    
    // Normalize by expected length, cap at 1.0
    return Math.min(actualLength / expectedLength, 1.0);
  }

  private static calculateRelevance(question: string, response: string): number {
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const responseWords = response.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    if (questionWords.length === 0) return 1.0;
    
    const relevantWords = questionWords.filter(word => 
      responseWords.some(responseWord => responseWord.includes(word) || word.includes(responseWord))
    );
    
    return relevantWords.length / questionWords.length;
  }

  private static calculateStructure(response: string): number {
    // Check for structured response elements
    const hasParagraphs = response.includes('\n\n') || response.includes('. ');
    const hasBulletPoints = response.includes('•') || response.includes('-') || response.includes('*');
    const hasNumbering = /\d+\./.test(response);
    
    let structureScore = 0;
    if (hasParagraphs) structureScore += 0.4;
    if (hasBulletPoints) structureScore += 0.3;
    if (hasNumbering) structureScore += 0.3;
    
    return structureScore;
  }
}

test('Generate questions with LangChain, send to agent, and evaluate responses', async ({ page }) => {
  const instance = env.instance;
  const { token, account } = await getUshurTokenFromApi();
  console.log(`🔐 Using account: ${account}`);
  
  const handle = getAgentHandle();
  console.log('selector from CLI/env:', handle);
  
  let agentUrl: string;
  
  if (handle) {
    agentUrl = await initAgentBySelector(instance, token, agentConfig, handle);
    console.log('Initialized existing agent →', agentUrl);
  } else {
    agentUrl = await createAndActivateAgent(instance, token, agentConfig, account);
    console.log('Created new agent →', agentUrl);
  }

  // Navigate to the agent session URL
  console.log('🌐 Navigating to agent URL:', agentUrl);
  await page.goto(agentUrl);
  
  // Wait for the chat interface to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // Generate questions using LangChain (simulated)
  console.log('🤖 Generating questions using LangChain...');
  const qaPairs = MockLangChain.generateQuestionsFromPDF();
  console.log(`✅ Generated ${qaPairs.length} Q&A pairs`);
  
  // Store evaluation results
  const evaluationResults = [];
  
  // Send each question and collect responses
  for (let i = 0; i < qaPairs.length; i++) {
    const { question, expectedAnswer } = qaPairs[i];
    console.log(`\n📤 Sending question ${i + 1}: "${question}"`);
    
    try {
      // Find and interact with the chat input
      const chatInput = page.locator('textarea[placeholder*="Type"]').first();
      
      if (await chatInput.isVisible({ timeout: 10000 })) {
        // Clear and type the question
        await chatInput.click();
        await chatInput.fill(question);
        
        // Take screenshot before sending
        await page.screenshot({ 
          path: `reports/agent-question-${i + 1}-before-send.png`,
          fullPage: true 
        });
        
        // Send the question
        await chatInput.press('Enter');
        console.log('✅ Question sent');
        
        // Wait for response with multiple checkpoints
        let responseText = '';
        let responseDetected = false;
        
        for (let waitCount = 1; waitCount <= 15; waitCount++) {
          await page.waitForTimeout(2000);
          
          // Take screenshot at each wait interval
          await page.screenshot({ 
            path: `reports/agent-question-${i + 1}-wait-${waitCount}.png`,
            fullPage: true 
          });
          
          // Check page content changes
          const currentPageText = await page.textContent('body');
          const currentLength = currentPageText?.length || 0;
          console.log(`⏳ Wait ${waitCount}: Page text length = ${currentLength}`);
          
          // Look for new message elements that might contain responses
          const messageElements = await page.locator('[class*="message"], [class*="chat"], [class*="response"], [class*="bot"], [class*="agent"]').all();
          
          if (messageElements.length > 0) {
            console.log(`🔍 Found ${messageElements.length} potential message elements`);
            
            // Look for the most recent response that doesn't contain our question
            for (let j = messageElements.length - 1; j >= 0; j--) {
              try {
                const text = await messageElements[j].textContent();
                if (text && text.trim().length > 0 && !text.includes(question) && text.length > 20) {
                  // This looks like a response
                  responseText = text.trim();
                  responseDetected = true;
                  console.log(`📥 Captured response: "${responseText.substring(0, 200)}..."`);
                  break;
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
          if (currentLength > 15000) {
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
              console.log(`📥 Fallback response: "${responseText.substring(0, 200)}..."`);
            }
          }
        }
        
        // Evaluate the response
        console.log('🔍 Evaluating response...');
        const evaluation = EvaluationMetrics.evaluateResponse(question, expectedAnswer, responseText);
        
        evaluationResults.push({
          questionNumber: i + 1,
          question: question,
          expectedAnswer: expectedAnswer,
          actualResponse: responseText,
          metrics: evaluation.metrics,
          summary: {
            factualAccuracy: evaluation.metrics.factualAccuracy >= 0.7 ? 'High' : evaluation.metrics.factualAccuracy >= 0.4 ? 'Medium' : 'Low',
            completeness: evaluation.metrics.completeness >= 0.7 ? 'High' : evaluation.metrics.completeness >= 0.4 ? 'Medium' : 'Low',
            relevance: evaluation.metrics.relevance >= 0.7 ? 'High' : evaluation.metrics.relevance >= 0.4 ? 'Medium' : 'Low',
            structure: evaluation.metrics.structure >= 0.7 ? 'High' : evaluation.metrics.structure >= 0.4 ? 'Medium' : 'Low'
          }
        });
        
        console.log(`📊 Evaluation Results for Question ${i + 1}:`);
        console.log(`   Factual Accuracy: ${(evaluation.metrics.factualAccuracy * 100).toFixed(1)}% (${evaluation.metrics.factualAccuracy >= 0.7 ? 'High' : evaluation.metrics.factualAccuracy >= 0.4 ? 'Medium' : 'Low'})`);
        console.log(`   Completeness: ${(evaluation.metrics.completeness * 100).toFixed(1)}% (${evaluation.metrics.completeness >= 0.7 ? 'High' : evaluation.metrics.completeness >= 0.4 ? 'Medium' : 'Low'})`);
        console.log(`   Relevance: ${(evaluation.metrics.relevance * 100).toFixed(1)}% (${evaluation.metrics.relevance >= 0.7 ? 'High' : evaluation.metrics.relevance >= 0.4 ? 'Medium' : 'Low'})`);
        console.log(`   Structure: ${(evaluation.metrics.structure * 100).toFixed(1)}% (${evaluation.metrics.structure >= 0.7 ? 'High' : evaluation.metrics.structure >= 0.4 ? 'Medium' : 'Low'})`);
        
        // Wait before next question
        await page.waitForTimeout(3000);
        
      } else {
        console.log('❌ Could not find chat input field');
        throw new Error('Chat input not found');
      }
      
    } catch (error) {
      console.error(`❌ Error processing question ${i + 1}:`, error);
      
      // Add error result
      evaluationResults.push({
        questionNumber: i + 1,
        question: question,
        expectedAnswer: expectedAnswer,
        actualResponse: 'ERROR: Could not capture response',
        metrics: {
          factualAccuracy: 0,
          completeness: 0,
          relevance: 0,
          structure: 0
        },
        summary: {
          factualAccuracy: 'Error',
          completeness: 'Error',
          relevance: 'Error',
          structure: 'Error'
        }
      });
    }
  }
  
  // Generate comprehensive evaluation report
  console.log('\n📋 ===== COMPREHENSIVE EVALUATION REPORT =====');
  console.log(`Total Questions: ${evaluationResults.length}`);
  
  let totalFactualAccuracy = 0;
  let totalCompleteness = 0;
  let totalRelevance = 0;
  let totalStructure = 0;
  let successfulResponses = 0;
  
  evaluationResults.forEach((result, index) => {
    if (result.actualResponse !== 'ERROR: Could not capture response') {
      successfulResponses++;
      totalFactualAccuracy += result.metrics.factualAccuracy;
      totalCompleteness += result.metrics.completeness;
      totalRelevance += result.metrics.relevance;
      totalStructure += result.metrics.structure;
    }
    
    console.log(`\n🔍 Question ${result.questionNumber}:`);
    console.log(`   Q: ${result.question}`);
    console.log(`   Expected: ${result.expectedAnswer.substring(0, 100)}...`);
    console.log(`   Actual: ${result.actualResponse.substring(0, 100)}...`);
    console.log(`   Metrics: F:${(result.metrics.factualAccuracy * 100).toFixed(1)}% C:${(result.metrics.completeness * 100).toFixed(1)}% R:${(result.metrics.relevance * 100).toFixed(1)}% S:${(result.metrics.structure * 100).toFixed(1)}%`);
  });
  
  if (successfulResponses > 0) {
    console.log('\n📊 OVERALL PERFORMANCE METRICS:');
    console.log(`   Factual Accuracy: ${((totalFactualAccuracy / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Completeness: ${((totalCompleteness / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Relevance: ${((totalRelevance / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Structure: ${((totalStructure / successfulResponses) * 100).toFixed(1)}%`);
    console.log(`   Success Rate: ${((successfulResponses / evaluationResults.length) * 100).toFixed(1)}%`);
  }
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'reports/agent-langchain-evaluation-final.png',
    fullPage: true 
  });
  console.log('📸 Final evaluation screenshot saved');
  
  console.log('\n✅ LangChain evaluation test completed!');
});
