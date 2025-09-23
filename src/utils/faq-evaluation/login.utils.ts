import { Page, Locator } from '@playwright/test';

export class FAQEvaluationLoginUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Complete login process for FAQ evaluation tests
   */
  async loginToUshur(): Promise<void> {
    console.log('🔍 Looking for login form...');
    
    const emailInput = this.page.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
    const passwordInput = this.page.locator('input[type="password"]').first();
    const loginButton = this.page.locator('button:has-text("Login")').first();
    
    const email = process.env.USHUR_USER_EMAIL || 'femila.david@ushur.com';
    const password = process.env.USHUR_USER_PASSWORD || 'your_password_here';
    
    console.log(`📧 Email: ${email}`);
    
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await loginButton.click();
    
    console.log('🔘 Login button clicked');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }

  /**
   * Select agent and navigate to preview
   */
  async selectAgentAndPreview(): Promise<any> {
    console.log('🔍 Looking for agent rows...');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    
    const tableRows = this.page.locator([
      'table tbody tr',
      '[class*="table"] tbody tr', 
      '[class*="list"] [class*="item"]',
      '[class*="row"]',
      'tr',
      '[role="row"]'
    ].join(', '));
    
    const rowCount = await tableRows.count();
    console.log(`📊 Found ${rowCount} potential table rows`);
    
    if (rowCount === 0) {
      throw new Error('No agent rows found');
    }

    const agentRow = tableRows.nth(1); // 2nd row to skip header
    console.log('✅ Found agent element, clicking...');
    await agentRow.click();
    await this.page.waitForTimeout(3000);
    
    // Click Preview Agent button
    const previewButton = this.page.locator('button:has-text("Preview Agent")').first();
    if (await previewButton.count() === 0) {
      throw new Error('Preview Agent button not found');
    }
    
    console.log('✅ Found Preview Agent button, clicking...');
    await previewButton.click();
    await this.page.waitForTimeout(5000);
    
    // Access chat iframe
    const chatIframe = this.page.locator('iframe[title="Agent Preview"], iframe[id="scaled-frame"]').first();
    if (await chatIframe.count() === 0) {
      throw new Error('Chat iframe not found');
    }
    
    console.log('✅ Found chat iframe, switching context...');
    const frame = await chatIframe.elementHandle();
    const chatFrame = await frame?.contentFrame();
    
    if (!chatFrame) {
      throw new Error('Failed to access chat iframe content');
    }
    
    console.log('✅ Successfully switched to chat iframe');
    await this.page.waitForTimeout(5000);
    
    return chatFrame;
  }

  /**
   * Complete full login and agent selection flow
   */
  async completeLoginFlow(agentUrl: string): Promise<any> {
    console.log(`🤖 Agent URL: ${agentUrl}`);
    
    await this.page.goto(agentUrl);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    
    await this.loginToUshur();
    return await this.selectAgentAndPreview();
  }
}

