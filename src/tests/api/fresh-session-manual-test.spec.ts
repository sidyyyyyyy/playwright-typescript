import { test, expect } from '@playwright/test';
import { createAndActivateAgent, getAgentSelectorFromCLI, initAgentBySelector, getAgentHandle } from '@utils/api/ushur.Agents';
import { agentConfig } from '@configs/agents.config';
import { getUshurTokenFromApi } from '../../utils/api/getToken';
import { env } from '@utils/env';

test('Create Fresh PolicyHolder Agent Session for Manual Testing', async ({ page }) => {
  console.log('🚀 Creating fresh PolicyHolder agent session for manual testing...');
  
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
  
  // Wait for the chat interface to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // Take a screenshot to show the initial state
  await page.screenshot({ 
    path: 'reports/fresh-session-initial-state.png',
    fullPage: true 
  });
  
  console.log('\n🎯 ===== FRESH SESSION READY FOR MANUAL TESTING =====');
  console.log(`📱 Agent Session URL: ${agentUrl}`);
  console.log(`🤖 Agent Type: PolicyHolder`);
  console.log(`👤 Agent Name: Factual Fred`);
  console.log(`📚 Use Case: policyholder_001`);
  console.log(`🔑 Session Token: ${token.substring(0, 50)}...`);
  console.log('\n📋 MANUAL TESTING INSTRUCTIONS:');
  console.log('1. Copy the Agent Session URL above');
  console.log('2. Open it in a new browser tab/window');
  console.log('3. Test the conversation flow manually');
  console.log('4. Send multiple questions to see if context is maintained');
  console.log('5. Check if responses are relevant to each question');
  console.log('\n💡 SUGGESTED TEST QUESTIONS:');
  console.log('• "What does my auto insurance policy cover?"');
  console.log('• "How do I file a claim for property damage?"');
  console.log('• "What is the timeline for processing claims?"');
  console.log('• "Can you explain my billing statement?"');
  console.log('• "What endorsements can I add to my policy?"');
  console.log('\n📸 Initial session screenshot saved to: reports/fresh-session-initial-state.png');
  console.log('✅ Fresh session created successfully!');
  
  // Keep the page open for a moment so user can see the URL
  await page.waitForTimeout(10000);
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'reports/fresh-session-ready.png',
    fullPage: true 
  });
  
  console.log('\n🎉 Session is ready for manual testing!');
  console.log('📹 Video recording is active for this session');
});
