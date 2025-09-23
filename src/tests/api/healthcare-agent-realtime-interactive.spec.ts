import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentHandle } from '../../utils/api/ushur.Agents';
import { agentConfig } from '../../../configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '../../utils/env';

test.describe('Healthcare Agent - Real-time Interactive Test', () => {
  test('Create Healthcare Agent and Open for Real-time Interaction', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for interactive session
    
    console.log('🏥 Starting Healthcare Agent Real-time Interactive Test...');
    
    // Step 1: Create Healthcare Agent with custom configuration
    console.log('\n🚀 STEP 1: Creating Healthcare Agent with Custom Configuration');
    
    const instance = env.instance;
    const { token, account } = await getUshurTokenFromApi();
    console.log(`🔐 Using account: ${account}`);
    
    const handle = getAgentHandle();
    console.log('Agent selector from CLI/env:', handle);
    
    let agentUrl: string;
    
    if (handle) {
      console.log('🔄 Using existing agent with handle:', handle);
      throw new Error('Existing agent handling not implemented in this test');
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
      
      console.log('✨ Creating NEW Healthcare agent with custom configuration...');
      agentUrl = await createAndActivateAgent(instance, token, agentConfig, account);
      console.log('✅ Created NEW Healthcare agent →', agentUrl);
    }

    // Step 2: Navigate to Ushur signin page
    console.log('\n🌐 STEP 2: Navigating to Ushur Signin Page');
    
    const context = await page.context();
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 1920, height: 1080 });
    
    const signinUrl = 'https://r2d2demo.ushur.dev/mob3.0/ushur-ui/?route=signin';
    console.log(`🔗 Navigating to: ${signinUrl}`);
    
    await newPage.goto(signinUrl);
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(3000);

    // Step 3: Login with credentials
    console.log('\n🔐 STEP 3: Logging in with .env credentials');
    
    if (!env.email || !env.password) {
      throw new Error('Email or password not found in .env file. Please check your environment variables.');
    }
    
    console.log(`📧 Email: ${env.email}`);
    console.log(`🔒 Password: ${env.password ? '***' : 'NOT SET'}`);
    
    const emailInput = newPage.locator('input[placeholder*="example@mail.com"], input[type="text"]').first();
    const passwordInput = newPage.locator('input[type="password"]').first();
    const loginButton = newPage.locator('button[type="submit"], button:has-text("Login"), input[type="submit"]').first();
    
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

    // Step 5: Find and click on Healthcare agent
    console.log('\n🔍 STEP 5: Finding Healthcare Agent');
    
    await newPage.waitForSelector('table', { timeout: 10000 });
    
    const agentRows = newPage.locator('table tbody tr');
    const rowCount = await agentRows.count();
    console.log(`📊 Found ${rowCount} agent rows in table`);
    
    let selectedAgentRow = null;
    
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      
      if (!rowText || rowText.trim().length < 10) {
        continue;
      }
      
      console.log(`🔍 Row ${i + 1}: ${rowText.substring(0, 100)}...`);
      
      if (rowText.includes('HealthPlan') || rowText.includes('Healthcare')) {
        console.log(`✅ Found Healthcare agent in row ${i + 1}`);
        selectedAgentRow = row;
        break;
      }
    }
    
    if (!selectedAgentRow) {
      throw new Error('No Healthcare agent found in the agents table');
    }
    
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
    
    if (await chatIframe.count() === 0) {
      throw new Error('Chat iframe not found');
    }
    
    console.log('✅ Found chat iframe, switching context...');
    
    const frame = await chatIframe.elementHandle();
    const chatFrame = await frame?.contentFrame();
    
    if (!chatFrame) {
      throw new Error('Could not access chat iframe content');
    }
    
    console.log('✅ Successfully switched to chat iframe');
    await newPage.waitForTimeout(5000);
    
    // Take initial screenshot
    await newPage.screenshot({ 
      path: 'reports/healthcare-agent-realtime-interactive-initial.png',
      fullPage: true 
    });

    // Step 8: Real-time Interactive Session
    console.log('\n🏥 STEP 8: Starting Real-time Interactive Session');
    console.log('🎯 The Healthcare Agent is now ready for real-time interaction!');
    console.log('💬 You can now interact with the agent in the browser window.');
    console.log('📋 Suggested test scenarios:');
    console.log('   1. "I need to schedule a medical appointment"');
    console.log('   2. "I have questions about my prescription medication"');
    console.log('   3. "I need medical advice about some symptoms"');
    console.log('   4. "I need information about my health insurance coverage"');
    console.log('\n⏳ Keeping the browser open for 5 minutes for interactive testing...');
    
    // Keep the browser open for interactive testing
    const interactiveDuration = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();
    
    while (Date.now() - startTime < interactiveDuration) {
      await newPage.waitForTimeout(10000); // Check every 10 seconds
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.floor((interactiveDuration - (Date.now() - startTime)) / 1000);
      
      if (elapsed % 30 === 0) { // Log every 30 seconds
        console.log(`⏰ Interactive session: ${elapsed}s elapsed, ${remaining}s remaining`);
      }
    }
    
    // Take final screenshot
    await newPage.screenshot({ 
      path: 'reports/healthcare-agent-realtime-interactive-final.png',
      fullPage: true 
    });
    
    console.log('\n✅ Real-time interactive session completed!');
    console.log('📸 Screenshots saved:');
    console.log('   - Initial state: reports/healthcare-agent-realtime-interactive-initial.png');
    console.log('   - Final state: reports/healthcare-agent-realtime-interactive-final.png');
    
    // Keep browser open for a bit longer to see final state
    await newPage.waitForTimeout(5000);
    
    console.log('\n🎯 ===== HEALTHCARE AGENT REAL-TIME INTERACTIVE TEST COMPLETE =====');
    console.log(`🏥 Agent Type: Healthcare Assistant (Dr. Sarah)`);
    console.log(`⏱️ Interactive Duration: 5 minutes`);
    console.log(`🌐 Browser Session: Active and ready for testing`);
    console.log(`📊 Test Status: Completed successfully`);
    
    // Assertions
    expect(agentUrl).toBeDefined();
    expect(chatFrame).toBeDefined();
    
    console.log('\n✅ Healthcare Agent Real-time Interactive Test completed successfully!');
    
  });
});

