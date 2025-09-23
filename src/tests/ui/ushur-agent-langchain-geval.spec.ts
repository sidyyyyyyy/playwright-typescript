import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock LangChain classes for PDF processing and question generation
class MockPDFLoader {
  constructor(private filePath: string) {}
  
  async load() {
    // Simulate loading PDF content
    console.log(`📄 Loading PDF: ${this.filePath}`);
    return [{
      pageContent: `
        Community Resources for Health Plan Members
        
        Our health plan provides comprehensive coverage including:
        - Primary care physician visits
        - Specialist consultations 
        - Emergency room services
        - Prescription drug coverage
        - Preventive care services
        - Mental health services
        - Dental and vision coverage (select plans)
        
        To find a doctor in your network:
        1. Log into your member portal
        2. Use the provider directory
        3. Search by specialty or location
        4. Verify the provider accepts your plan
        
        For prescription coverage:
        - Check your formulary for covered medications
        - Use preferred pharmacies for lower costs
        - Consider generic alternatives when available
        
        Emergency services are covered 24/7 without prior authorization.
        
        Member support is available Monday-Friday 8AM-8PM at 1-800-HEALTH.
      `,
      metadata: { source: this.filePath, page: 1 }
    }];
  }
}

class MockTextSplitter {
  constructor(private options: { chunkSize: number; chunkOverlap: number }) {}
  
  splitDocuments(docs: any[]) {
    // Simulate splitting documents into chunks
    const chunks = [];
    for (const doc of docs) {
      const content = doc.pageContent;
      const lines = content.split('\n').filter(line => line.trim());
      
      for (let i = 0; i < lines.length; i += 3) {
        chunks.push({
          pageContent: lines.slice(i, i + 3).join('\n'),
          metadata: doc.metadata
        });
      }
    }
    return chunks;
  }
}

class MockQuestionGenerator {
  constructor(private context: string) {}
  
  async generateQuestions(count: number = 5): Promise<string[]> {
    // Generate contextual questions based on the PDF content
    const questions = [
      "What types of services are covered by my health plan?",
      "How do I find a doctor in my network?", 
      "What is the process for getting prescription drug coverage?",
      "Are emergency room visits covered without prior authorization?",
      "What are the hours for member support services?"
    ];
    
    console.log(`🤖 Generated ${count} questions from PDF context`);
    return questions.slice(0, count);
  }
}

// G-Eval scoring system
class GEvalScorer {
  constructor() {}
  
  async evaluateResponse(question: string, response: string, context: string) {
    // Simulate G-Eval scoring
    const scores = {
      relevance: this.scoreRelevance(question, response),
      coherence: this.scoreCoherence(response),
      consistency: this.scoreConsistency(response, context),
      fluency: this.scoreFluency(response),
      factualAccuracy: this.scoreFactualAccuracy(response, context)
    };
    
    const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    
    return {
      scores,
      overallScore: Math.round(overallScore * 100) / 100,
      evaluation: this.generateEvaluation(scores, overallScore)
    };
  }
  
  private scoreRelevance(question: string, response: string): number {
    // Score 1-5 based on how well response addresses the question
    const questionKeywords = question.toLowerCase().split(' ');
    const responseText = response.toLowerCase();
    
    let matches = 0;
    for (const keyword of questionKeywords) {
      if (keyword.length > 3 && responseText.includes(keyword)) {
        matches++;
      }
    }
    
    return Math.min(5, Math.max(1, (matches / questionKeywords.length) * 5));
  }
  
  private scoreCoherence(response: string): number {
    // Score based on response structure and flow
    const sentences = response.split('.').filter(s => s.trim().length > 0);
    const hasStructure = sentences.length > 1;
    const hasTransitions = response.includes('however') || response.includes('additionally') || response.includes('furthermore');
    
    let score = 3; // Base score
    if (hasStructure) score += 1;
    if (hasTransitions) score += 1;
    if (response.length > 100) score += 0.5; // Detailed responses
    
    return Math.min(5, score);
  }
  
  private scoreConsistency(response: string, context: string): number {
    // Score based on consistency with training context
    const contextKeywords = ['health plan', 'coverage', 'network', 'provider', 'member', 'services'];
    const responseText = response.toLowerCase();
    
    let relevantTerms = 0;
    for (const term of contextKeywords) {
      if (responseText.includes(term)) {
        relevantTerms++;
      }
    }
    
    return Math.min(5, (relevantTerms / contextKeywords.length) * 5 + 1);
  }
  
  private scoreFluency(response: string): number {
    // Score based on language fluency
    const hasProperSentences = response.includes('.') || response.includes('!') || response.includes('?');
    const noGibberish = !response.includes('###') && !response.includes('***');
    const reasonableLength = response.length > 20 && response.length < 1000;
    
    let score = 2; // Base score
    if (hasProperSentences) score += 1.5;
    if (noGibberish) score += 1;
    if (reasonableLength) score += 0.5;
    
    return Math.min(5, score);
  }
  
  private scoreFactualAccuracy(response: string, context: string): number {
    // Score based on factual accuracy against context
    const facts = [
      'emergency services', 'prior authorization', 'member portal', 
      'provider directory', 'formulary', 'monday-friday', '8am-8pm'
    ];
    
    let accurateFacts = 0;
    const responseText = response.toLowerCase();
    
    for (const fact of facts) {
      if (responseText.includes(fact.toLowerCase())) {
        accurateFacts++;
      }
    }
    
    return Math.min(5, (accurateFacts / facts.length) * 5 + 2);
  }
  
  private generateEvaluation(scores: any, overallScore: number): string {
    if (overallScore >= 4.5) return 'Excellent';
    if (overallScore >= 4.0) return 'Very Good';
    if (overallScore >= 3.5) return 'Good';
    if (overallScore >= 3.0) return 'Fair';
    return 'Poor';
  }
}

test.describe('Ushur Agent LangChain + G-Eval Testing', () => {
  test('PDF-based Question Generation with G-Eval Response Scoring', async ({ page }) => {
    // Increase test timeout for comprehensive evaluation
    test.setTimeout(300000); // 5 minutes (same as working test)
    
    // Set normal window size
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('🖥️ Set viewport to normal desktop size: 1920x1080');
    
    console.log('🔐 Starting LangChain + G-Eval enhanced chat test...');
    
    // Step 1: Load and process PDF training data
    console.log('\n📚 STEP 1: Loading PDF Training Data');
    const pdfPath = path.join(__dirname, '../../data/assets/train/community_resources.pdf');
    const pdfLoader = new MockPDFLoader(pdfPath);
    const documents = await pdfLoader.load();
    
    const textSplitter = new MockTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    const chunks = textSplitter.splitDocuments(documents);
    console.log(`📄 Loaded PDF with ${chunks.length} text chunks`);
    
    // Step 2: Generate questions using LangChain
    console.log('\n🤖 STEP 2: Generating Questions from PDF Context');
    const questionGenerator = new MockQuestionGenerator(documents[0].pageContent);
    const generatedQuestions = await questionGenerator.generateQuestions(3); // Use 3 questions like working test
    
    console.log('📝 Generated Questions:');
    generatedQuestions.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q}`);
    });
    
    // Step 3: Navigate to Ushur and set up chat (using working approach)
    console.log('\n🌐 STEP 3: Setting up Ushur Chat Session');
    const agentUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?agentId=9jr1HaT';
    console.log(`🤖 Agent URL: ${agentUrl}`);
    
    await page.goto(agentUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Login process (using working login logic)
    console.log('🔍 Looking for login form...');
    const emailInput = page.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Login")').first();
    
    const email = process.env.USHUR_USER_EMAIL || 'femila.david@ushur.com';
    const password = process.env.USHUR_USER_PASSWORD || 'your_password_here';
    
    console.log(`📧 Email: ${email}`);
    
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await loginButton.click();
    
    console.log('🔘 Login button clicked');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Agent selection (using working logic)
    console.log('🔍 Looking for agent rows...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const tableRows = page.locator([
      'table tbody tr',
      '[class*="table"] tbody tr', 
      '[class*="list"] [class*="item"]',
      '[class*="row"]',
      'tr',
      '[role="row"]'
    ].join(', '));
    
    const rowCount = await tableRows.count();
    console.log(`📊 Found ${rowCount} potential table rows`);
    
    if (rowCount > 0) {
      const agentRow = tableRows.nth(1); // 2nd row to skip header
      console.log('✅ Found agent element, clicking...');
      await agentRow.click();
      await page.waitForTimeout(3000);
      
      // Click Preview Agent button
      const previewButton = page.locator('button:has-text("Preview Agent")').first();
      if (await previewButton.count() > 0) {
        console.log('✅ Found Preview Agent button, clicking...');
        await previewButton.click();
        await page.waitForTimeout(5000);
        
        // Access chat iframe
        const chatIframe = page.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
        
        if (await chatIframe.count() > 0) {
          console.log('✅ Found chat iframe, switching context...');
          
          const frame = await chatIframe.elementHandle();
          const chatFrame = await frame?.contentFrame();
          
          if (chatFrame) {
            console.log('✅ Successfully switched to chat iframe');
            await page.waitForTimeout(5000);
            
            // Step 4: Ask generated questions and collect responses (using working approach)
            console.log('\n💬 STEP 4: Conducting AI-Generated Q&A Session');
            
            const conversationResults = [];
            const gEvalScorer = new GEvalScorer();
            
            for (let i = 0; i < generatedQuestions.length; i++) {
              const question = generatedQuestions[i];
              const messageTime = new Date().toISOString();
              console.log(`\n💬 Question ${i + 1}/${generatedQuestions.length}: "${question}"`);
              
              try {
                // Re-locate chat input for each message (working approach)
                console.log(`🔍 Re-locating chat input for message ${i + 1}...`);
                const currentChatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
                
                const inputCount = await currentChatInput.count();
                console.log(`📝 Found ${inputCount} chat input elements`);
                
                if (inputCount === 0) {
                  throw new Error(`Chat input not found for question ${i + 1}`);
                }
                
                // Wait for input field to be ready (working approach)
                console.log(`⏳ Waiting for input field to be ready for message ${i + 1}...`);
                
                if (i > 0) {
                  console.log(`🔄 Waiting for input field to become interactive after message ${i}...`);
                  
                  let attempts = 0;
                  let inputReady = false;
                  
                  while (!inputReady && attempts < 10) {
                    attempts++;
                    await page.waitForTimeout(1000);
                    
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
                  
                  if (!inputReady) {
                    console.log(`⚠️ Input field may not be ready, proceeding anyway...`);
                  }
                } else {
                  await page.waitForTimeout(2000);
                }
                
                // Type the question (working approach)
                console.log(`✍️ Typing question ${i + 1}: "${question}"`);
                
                await currentChatInput.first().click();
                await page.waitForTimeout(500);
                
                // Clear field
                await currentChatInput.first().fill('');
                await page.waitForTimeout(300);
                await currentChatInput.first().press('Control+a');
                await page.waitForTimeout(300);
                await currentChatInput.first().press('Delete');
                await page.waitForTimeout(500);
                
                // Type the question
                await currentChatInput.first().type(question, { delay: 100 });
                await page.waitForTimeout(1000);
                
                // Verify the message was typed
                const inputValue = await currentChatInput.first().inputValue();
                console.log(`📋 Input value after typing: "${inputValue}"`);
                
                if (inputValue !== question) {
                  console.log(`⚠️ Warning: Expected "${question}", but input contains "${inputValue}"`);
                }
                
                // Send the message
                console.log(`📤 Pressing Enter to send question ${i + 1}...`);
                await currentChatInput.first().press('Enter');
                console.log(`✅ Question ${i + 1} sent: "${question}"`);
                
                // Wait for response (15 seconds like working test)
                console.log('⏳ Waiting 15 seconds for agent response...');
                await page.waitForTimeout(15000);
                
                // Capture response using dynamic approach
                console.log('🔍 Looking for agent response...');
                let actualResponse = '';
                
                // Wait a bit more for the response to fully appear
                await page.waitForTimeout(2000);
                
                // Strategy 1: Count total messages and get the latest outgoing message
                try {
                  const allMessages = chatFrame.locator('div.chatbot-message');
                  const totalMessages = await allMessages.count();
                  console.log(`📊 Total messages in chat: ${totalMessages}`);
                  
                  if (totalMessages > 0) {
                    // Get the last message (should be the latest response)
                    const lastMessage = allMessages.last();
                    const messageClass = await lastMessage.getAttribute('class');
                    console.log(`🔍 Last message class: ${messageClass}`);
                    
                    // Check if it's an outgoing message (agent response)
                    if (messageClass && messageClass.includes('outgoing')) {
                      const responseText = await lastMessage.textContent();
                      if (responseText && responseText.trim().length > 10) {
                        actualResponse = responseText.trim();
                        console.log(`✅ Found latest agent response: "${responseText.trim().substring(0, 100)}..."`);
                      }
                    }
                  }
                } catch (e) {
                  const errorMessage = e instanceof Error ? e.message : String(e);
                  console.log(`⚠️ Strategy 1 failed: ${errorMessage}`);
                }
                
                // Strategy 2: Look for specific selector if Strategy 1 didn't work
                if (!actualResponse) {
                  try {
                    const specificSelector = 'body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-history-current-module-container > div.chatbot-history > div:nth-child(7) > div.chatbot-message.outgoing';
                    const responseElement = chatFrame.locator(specificSelector);
                    
                    if (await responseElement.count() > 0) {
                      const responseText = await responseElement.textContent();
                      if (responseText && responseText.trim().length > 10) {
                        actualResponse = responseText.trim();
                        console.log(`✅ Found response with specific selector: "${responseText.trim().substring(0, 100)}..."`);
                      }
                    }
                  } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    console.log(`⚠️ Strategy 2 failed: ${errorMessage}`);
                  }
                }
                
                // Strategy 3: Look for any outgoing message if others failed
                if (!actualResponse) {
                  try {
                    const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
                    const count = await outgoingMessages.count();
                    console.log(`🔍 Found ${count} outgoing messages`);
                    
                    if (count > 0) {
                      // Get the latest outgoing message
                      const latestOutgoing = outgoingMessages.last();
                      const responseText = await latestOutgoing.textContent();
                      
                      if (responseText && responseText.trim().length > 10) {
                        actualResponse = responseText.trim();
                        console.log(`✅ Found latest outgoing message: "${responseText.trim().substring(0, 100)}..."`);
                      }
                    }
                                      } catch (e) {
                      const errorMessage = e instanceof Error ? e.message : String(e);
                      console.log(`⚠️ Strategy 3 failed: ${errorMessage}`);
                    }
                }
                
                if (!actualResponse) {
                  actualResponse = 'No response captured from agent';
                  console.log('⚠️ Could not capture agent response with any strategy');
                }
                
                console.log(`📥 Final captured response: "${actualResponse.substring(0, 100)}..."`);
                
                // Step 5: Evaluate response using G-Eval
                console.log(`🔍 Evaluating response with G-Eval...`);
                const evaluation = await gEvalScorer.evaluateResponse(
                  question, 
                  actualResponse, 
                  documents[0].pageContent
                );
                
                // Store results
                conversationResults.push({
                  questionNumber: i + 1,
                  question: question,
                  response: actualResponse,
                  evaluation: evaluation,
                  timestamp: messageTime
                });
                
                console.log(`📊 G-Eval Scores:`);
                console.log(`   Relevance: ${evaluation.scores.relevance}/5`);
                console.log(`   Coherence: ${evaluation.scores.coherence}/5`);
                console.log(`   Consistency: ${evaluation.scores.consistency}/5`);
                console.log(`   Fluency: ${evaluation.scores.fluency}/5`);
                console.log(`   Factual Accuracy: ${evaluation.scores.factualAccuracy}/5`);
                console.log(`   Overall Score: ${evaluation.overallScore}/5 (${evaluation.evaluation})`);
                
                // Take screenshot
                await page.screenshot({
                  path: `reports/ui/langchain-geval-q${i + 1}-response.png`,
                  fullPage: true
                });
                
                console.log(`📸 Screenshot saved for question ${i + 1}`);
                
                // Wait before next question (working approach)
                if (i < generatedQuestions.length - 1) {
                  console.log('⏳ Waiting 3 seconds before next question...');
                  await page.waitForTimeout(3000);
                }
                
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`❌ Error with question ${i + 1}:`, errorMessage);
                
                conversationResults.push({
                  questionNumber: i + 1,
                  question: question,
                  response: `ERROR: ${errorMessage}`,
                  evaluation: null,
                  timestamp: messageTime
                });
              }
            }
            
            // Step 6: Generate comprehensive evaluation report
            console.log('\n📊 STEP 6: Generating Comprehensive Evaluation Report');
            
            const successfulEvaluations = conversationResults.filter(r => r.evaluation !== null);
            const averageScores = {
              relevance: 0,
              coherence: 0,
              consistency: 0,
              fluency: 0,
              factualAccuracy: 0,
              overall: 0
            };
            
            if (successfulEvaluations.length > 0) {
              for (const result of successfulEvaluations) {
                averageScores.relevance += result.evaluation.scores.relevance;
                averageScores.coherence += result.evaluation.scores.coherence;
                averageScores.consistency += result.evaluation.scores.consistency;
                averageScores.fluency += result.evaluation.scores.fluency;
                averageScores.factualAccuracy += result.evaluation.scores.factualAccuracy;
                averageScores.overall += result.evaluation.overallScore;
              }
              
              for (const key of Object.keys(averageScores)) {
                averageScores[key as keyof typeof averageScores] = Math.round((averageScores[key as keyof typeof averageScores] / successfulEvaluations.length) * 100) / 100;
              }
            }
            
            console.log('\n🎯 ===== FINAL EVALUATION REPORT =====');
            console.log(`📋 Test Configuration:`);
            console.log(`   PDF Source: community_resources.pdf`);
            console.log(`   Questions Generated: ${generatedQuestions.length}`);
            console.log(`   Agent Type: HealthPlan`);
            console.log(`   Evaluation Method: G-Eval`);
            console.log(`   Test Timestamp: ${new Date().toISOString()}`);
            
            console.log(`\n📈 Average G-Eval Scores:`);
            console.log(`   Relevance: ${averageScores.relevance}/5`);
            console.log(`   Coherence: ${averageScores.coherence}/5`);
            console.log(`   Consistency: ${averageScores.consistency}/5`);
            console.log(`   Fluency: ${averageScores.fluency}/5`);
            console.log(`   Factual Accuracy: ${averageScores.factualAccuracy}/5`);
            console.log(`   Overall Performance: ${averageScores.overall}/5`);
            
            console.log(`\n📊 Success Rate: ${((successfulEvaluations.length / generatedQuestions.length) * 100).toFixed(1)}%`);
            
            console.log('\n💬 Individual Question Results:');
            conversationResults.forEach((result, index) => {
              console.log(`\n   Q${result.questionNumber}: ${result.question}`);
              console.log(`   Response: ${result.response.substring(0, 100)}...`);
              if (result.evaluation) {
                console.log(`   Score: ${result.evaluation.overallScore}/5 (${result.evaluation.evaluation})`);
              } else {
                console.log(`   Score: ERROR`);
              }
            });
            
            console.log('\n✅ LangChain + G-Eval enhanced chat test completed successfully!');
            
          } else {
            throw new Error('Could not access iframe content');
          }
        } else {
          throw new Error('Chat iframe not found');
        }
      } else {
        throw new Error('Preview Agent button not found');
      }
    } else {
      throw new Error('No agent rows found');
    }
  });
});