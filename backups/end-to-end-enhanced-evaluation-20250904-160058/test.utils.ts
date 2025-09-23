import { Page } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { 
  RealPDFLoader, 
  QuestionGeneratorFactory,
  FAQSynthesisUtils 
} from './synthesis.utils';
import { 
  FAQEvaluatorFactory,
  FAQReportGenerator 
} from './metrics.utils';

// Using relative path for PDF loading

/**
 * Common test configuration for FAQ evaluation tests
 */
export interface FAQTestConfig {
  agentType: 'healthplan' | 'clientservices' | 'policyholder';
  agentUrl: string;
  testTimeout: number;
  questionCount: number;
  pdfPath?: string;
}

/**
 * Test results structure
 */
export interface FAQTestResults {
  agentType: string;
  questions: string[];
  responses: string[];
  evaluations: any[];
  overallScore: number;
  report: string;
}

/**
 * Base class for FAQ evaluation tests
 */
export class BaseFAQTestRunner {
  protected config: FAQTestConfig;
  protected page: Page;

  constructor(page: Page, config: FAQTestConfig) {
    this.page = page;
    this.config = config;
  }

  /**
   * Set up the test environment
   */
  async setup(): Promise<void> {
    console.log(`🖥️ Setting up ${this.config.agentType} FAQ evaluation test...`);
    
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    console.log('🖥️ Set viewport to normal desktop size: 1920x1080');
  }

  /**
   * Load PDF content and generate questions
   */
  async loadContentAndGenerateQuestions(): Promise<string[]> {
    console.log('\n📚 STEP 1: Loading PDF and Generating Questions');
    
    const pdfPath = this.config.pdfPath || path.join(process.cwd(), 'src/data/assets/train/community_resources.pdf');
    const pdfLoader = new RealPDFLoader(pdfPath);
    const documents = await pdfLoader.load();
    
    const questionGenerator = QuestionGeneratorFactory.createGenerator(
      this.config.agentType, 
      documents[0].pageContent
    );
    
    const questions = await questionGenerator.generateQuestions(this.config.questionCount);
    
    console.log(`${this.config.agentType} FAQ Questions:`);
    questions.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q}`);
    });
    
    return questions;
  }

  /**
   * Navigate to agent and set up chat session
   */
  async navigateToAgent(): Promise<void> {
    console.log('\n🌐 STEP 2: Setting up Agent Chat Session');
    console.log(`${this.config.agentType} Agent URL: ${this.config.agentUrl}`);
    
    await this.page.goto(this.config.agentUrl);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }

  /**
   * Perform login process
   */
  async performLogin(): Promise<void> {
    console.log('🔍 Looking for login form...');
    
    const emailInput = this.page.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
    const passwordInput = this.page.locator('input[type="password"]').first();
    const loginButton = this.page.locator('button:has-text("Login")').first();
    
    const email = process.env.USHUR_USER_EMAIL || 'femila.david@ushur.com';
    const password = process.env.USHUR_USER_PASSWORD || 'your_password_here';
    
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await loginButton.click();
    
    console.log('🔐 Login credentials submitted');
    await this.page.waitForTimeout(3000);
  }

  /**
   * Wait for chat interface to load
   */
  async waitForChatInterface(): Promise<any> {
    console.log('⏳ Waiting for chat interface to load...');
    
    await this.page.waitForTimeout(5000);
    
    // Look for the chat iframe
    const chatFrame = this.page.frameLocator('iframe[title*="chat"], iframe[src*="chat"], iframe[name*="chat"]').first();
    
    // Check if iframe exists by trying to locate elements within it
    try {
      const testElement = chatFrame.locator('body');
      await testElement.first().waitFor({ timeout: 1000 });
      console.log('✅ Chat interface loaded successfully');
      return chatFrame;
    } catch (e) {
      console.log('⚠️ Chat iframe not found, trying alternative selectors...');
      // Try alternative selectors
      const alternativeFrame = this.page.frameLocator('iframe').first();
      try {
        const testElement = alternativeFrame.locator('body');
        await testElement.first().waitFor({ timeout: 1000 });
        console.log('✅ Found alternative iframe, proceeding...');
        return alternativeFrame;
      } catch (e2) {
        throw new Error('Chat interface not found');
      }
    }
  }

  /**
   * Execute FAQ evaluation questions
   */
  async executeFAQEvaluation(questions: string[]): Promise<{ responses: string[], evaluations: any[] }> {
    console.log('\n💬 STEP 3: Executing FAQ Evaluation Questions');
    
    const chatFrame = await this.waitForChatInterface();
    const faqEvaluator = FAQEvaluatorFactory.createEvaluator(this.config.agentType);
    
    const responses: string[] = [];
    const evaluations: any[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n💬 FAQ Question ${i + 1}/${questions.length}: "${question}"`);
      
      try {
        const currentChatInput = chatFrame.locator('body > div.tb-ushur.ushur-widget-container > div.ushur-chatbot.no-logo.no-title > div.chatbot-input-container > textarea');
        
        const inputCount = await currentChatInput.count();
        console.log(`📝 Found ${inputCount} chat input elements`);
        
        if (inputCount === 0) {
          throw new Error(`Chat input not found for question ${i + 1}`);
        }
        
        // Wait for input to be ready
        if (i > 0) {
          await this.waitForInputReady(chatFrame, currentChatInput);
        } else {
          await this.page.waitForTimeout(2000);
        }
        
        // Type and send question
        await currentChatInput.first().fill(question);
        await currentChatInput.first().press('Enter');
        
        console.log(`📤 Question sent: "${question}"`);
        
        // Wait for response
        await this.waitForResponse(chatFrame);
        
        // Extract response
        const response = await this.extractResponse(chatFrame);
        responses.push(response);
        
        console.log(`📥 Response received (${response.length} characters)`);
        
        // Evaluate response
        const evaluation = await faqEvaluator.evaluateResponse(question, response, '');
        evaluations.push(evaluation);
        
        console.log(`📊 Evaluation: ${evaluation.evaluation} (Score: ${evaluation.overallScore})`);
        
        // Wait before next question
        await this.page.waitForTimeout(2000);
        
      } catch (error) {
        console.error(`❌ Error processing question ${i + 1}:`, error);
        responses.push('Error: Could not process question');
        evaluations.push({
          scores: { error: 0 },
          overallScore: 0,
          evaluation: 'Error'
        });
      }
    }
    
    return { responses, evaluations };
  }

  /**
   * Wait for input field to be ready
   */
  private async waitForInputReady(chatFrame: any, currentChatInput: any): Promise<void> {
    let attempts = 0;
    let inputReady = false;
    
    while (!inputReady && attempts < 10) {
      attempts++;
      await this.page.waitForTimeout(1000);
      
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
  }

  /**
   * Wait for response to be generated
   */
  private async waitForResponse(chatFrame: any): Promise<void> {
    console.log('⏳ Waiting for response...');
    
    // Wait for typing indicator or response to appear
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        // Check for typing indicator
        const typingIndicator = chatFrame.locator('.typing-indicator, .bot-typing, [class*="typing"]');
        if (await typingIndicator.count() > 0) {
          console.log('🤖 Bot is typing...');
          await this.page.waitForTimeout(1000);
          continue;
        }
        
        // Check for response messages
        const messages = chatFrame.locator('.message, .chat-message, [class*="message"]');
        const messageCount = await messages.count();
        
        if (messageCount > 0) {
          // Wait a bit more for the response to complete
          await this.page.waitForTimeout(2000);
          console.log(`✅ Response received (${messageCount} messages)`);
          return;
        }
        
        await this.page.waitForTimeout(1000);
      } catch (e) {
        await this.page.waitForTimeout(1000);
      }
    }
    
    console.log('⚠️ Response timeout reached');
  }

  /**
   * Extract the latest response from chat
   */
  private async extractResponse(chatFrame: any): Promise<string> {
    try {
      const messages = chatFrame.locator('.message, .chat-message, [class*="message"]');
      const messageCount = await messages.count();
      
      if (messageCount === 0) {
        return 'No response received';
      }
      
      // Get the last message (bot response)
      const lastMessage = messages.nth(messageCount - 1);
      const responseText = await lastMessage.textContent();
      
      return responseText?.trim() || 'Empty response';
    } catch (error) {
      console.error('Error extracting response:', error);
      return 'Error extracting response';
    }
  }

  /**
   * Generate test report
   */
  async generateReport(questions: string[], responses: string[], evaluations: any[]): Promise<string> {
    const overallScore = evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / evaluations.length;
    
    const report = FAQReportGenerator.generateReport(
      this.config.agentType,
      questions,
      responses,
      evaluations
    );
    
    return report;
  }

  /**
   * Run the complete FAQ evaluation test
   */
  async runTest(): Promise<FAQTestResults> {
    try {
      await this.setup();
      
      const questions = await this.loadContentAndGenerateQuestions();
      await this.navigateToAgent();
      await this.performLogin();
      
      const { responses, evaluations } = await this.executeFAQEvaluation(questions);
      
      const report = await this.generateReport(questions, responses, evaluations);
      
      return {
        agentType: this.config.agentType,
        questions,
        responses,
        evaluations,
        overallScore: evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / evaluations.length,
        report
      };
      
    } catch (error) {
      console.error(`❌ Error running ${this.config.agentType} FAQ test:`, error);
      throw error;
    }
  }
}

/**
 * Factory for creating test runners
 */
export class FAQTestRunnerFactory {
  static createRunner(page: Page, config: FAQTestConfig): BaseFAQTestRunner {
    return new BaseFAQTestRunner(page, config);
  }
}
