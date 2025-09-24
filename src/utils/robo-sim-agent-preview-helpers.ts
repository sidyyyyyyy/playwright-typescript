import { Locator, Page, Frame } from '@playwright/test';
import { Persona } from './faq-evaluation/robo-sim/core/schema';
import { RoboSimulator } from './faq-evaluation/robo-sim/core/simulator';
import { FunctionAdapter } from './faq-evaluation/robo-sim/adapters/func';

// Enhanced function to generate varied user responses
export async function generateVariedUserReply(
  agentMessage: string, 
  persona: Persona, 
  conversationHistory: Array<{ role: 'user' | 'agent' | 'system'; content: string }>,
  turnIndex: number
): Promise<string> {
  const adapter = new FunctionAdapter();
  adapter.setAgentMessage(agentMessage);
  
  // Create a more varied persona based on turn index
  const variedPersona = {
    ...persona,
    style: {
      ...persona.style,
      verbosity: turnIndex % 2 === 0 ? 'normal' : 'chatty' as 'normal' | 'chatty',
      emotion: (turnIndex % 3 === 0 ? 'impatient' : turnIndex % 3 === 1 ? 'polite' : 'concerned') as 'impatient' | 'polite' | 'concerned'
    }
  };
  
  // Add conversation context to make responses more varied
  const contextPrompt = conversationHistory.length > 2 
    ? `Previous conversation context: ${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join(' | ')}`
    : '';
  
  const simulator = new RoboSimulator(variedPersona, adapter, {
    agent_id: 'test-agent',
    model: 'gpt-4o-mini',
    temperature: 0.8 + (turnIndex * 0.1), // Increase temperature with each turn
    max_turns: 1
  });
  
  // Add turn-specific response patterns
  const turnSpecificPrompts = [
    "Ask for specific information needed",
    "Express understanding and provide details",
    "Ask clarifying questions about the process",
    "Show impatience and ask for next steps",
    "Provide additional information proactively",
    "Ask about timeline or confirmation",
    "Express concerns or ask for reassurance",
    "Ask for alternative options or methods"
  ];
  
  const turnPrompt = turnSpecificPrompts[turnIndex % turnSpecificPrompts.length];
  
  return await simulator.runOnce(`${contextPrompt} ${turnPrompt}. Agent said: ${agentMessage}`);
}

// Helper method for sending messages
export async function sendMessage(chatInput: Locator, message: string): Promise<void> {
  try {
    await chatInput.first().click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    await chatInput.first().fill('');
    await new Promise(resolve => setTimeout(resolve, 300));
    await chatInput.first().type(message, { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await chatInput.first().press('Enter');
    console.log(`Sent: "${message}"`);
  } catch (e) {
    console.log('Error sending message, trying fill approach...');
    await chatInput.first().fill(message);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await chatInput.first().press('Enter');
    console.log(`Sent via fill: "${message}"`);
  }
}

// Helper method for waiting for agent response
export async function waitForAgentResponse(chatFrame: Frame): Promise<string> {
  console.log('Waiting for agent response...');
  
  let attempts = 0;
  const maxAttempts = 15;
  let lastAgentMessage = '';
  
  // Get the current count of agent messages
  const initialOutgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
  const initialCount = await initialOutgoingMessages.count();
  console.log(`Initial agent message count: ${initialCount}`);
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    attempts++;
    
    // Get agent response
    const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
    const outgoingCount = await outgoingMessages.count();
    
    console.log(`Check ${attempts}: Found ${outgoingCount} outgoing messages`);
    
    if (outgoingCount > initialCount) {
      // New message appeared
      const latestResponse = outgoingMessages.last();
      const responseText = await latestResponse.textContent();
      
      if (responseText && responseText.trim().length > 10) {
        const agentResponse = responseText.trim();
        
        // Check if this is a new message (not the same as last one)
        if (agentResponse !== lastAgentMessage) {
          console.log(`Agent: ${agentResponse}`);
          lastAgentMessage = agentResponse;
          return agentResponse;
        }
      }
    }
  }
  
  console.log('No new agent response received after maximum wait time');
  return 'No response received';
}

// Helper function to check if conversation is complete
export function isConversationComplete(agentResponse: string): boolean {
  const lowerResponse = agentResponse.toLowerCase();
  
  // Strong completion indicators for address update goal
  const strongCompletionIndicators = [
    'address has been updated',
    'successfully updated',
    'your address has been updated',
    'address update is complete',
    'address update completed',
    'your new address has been updated',
    'address will be updated in your profile',
    'address updated successfully',
    'update is complete',
    'address change has been processed',
    'address modification completed'
  ];
  
  // Check for strong completion indicators first
  const hasStrongCompletion = strongCompletionIndicators.some(indicator => 
    lowerResponse.includes(indicator)
  );
  
  if (hasStrongCompletion) {
    console.log('🎯 Strong completion indicator detected - address update goal accomplished');
    return true;
  }
  
  // Additional completion indicators
  const generalCompletionIndicators = [
    'confirmation email',
    'process completed',
    'thank you for your help',
    'is there anything else',
    'anything else i can help',
    'goodbye',
    'have a great day',
    'take care'
  ];
  
  const hasGeneralCompletion = generalCompletionIndicators.some(indicator => 
    lowerResponse.includes(indicator)
  );
  
  if (hasGeneralCompletion) {
    console.log('✅ General completion indicator detected');
    return true;
  }
  
  return false;
}

// Enhanced function to check if the address update goal is specifically accomplished
export function isAddressUpdateGoalAccomplished(conversationHistory: Array<{ role: 'user' | 'agent' | 'system'; content: string }>): boolean {
  if (conversationHistory.length < 4) {
    return false; // Need at least a few exchanges
  }
  
  // Get the last few agent responses
  const recentAgentResponses = conversationHistory
    .filter(msg => msg.role === 'agent')
    .slice(-3) // Last 3 agent responses
    .map(msg => msg.content.toLowerCase());
  
  // Check if we have evidence of goal completion
  const goalCompletionPatterns = [
    // Direct confirmation patterns
    'address has been updated',
    'successfully updated',
    'your address has been updated',
    'address update is complete',
    'address update completed',
    'your new address has been updated',
    'address will be updated in your profile',
    'address updated successfully',
    'update is complete',
    'address change has been processed',
    'address modification completed',
    
    // Confirmation with details
    '456 market st, san francisco, ca 94103',
    'new address.*updated',
    'address.*updated.*profile',
    'change.*effective',
    'update.*processed',
    
    // Timeline confirmation
    'within 24 hours',
    'will be reflected',
    'takes effect',
    'becomes effective'
  ];
  
  // Check if any recent agent response contains goal completion patterns
  const hasGoalCompletion = recentAgentResponses.some(response => 
    goalCompletionPatterns.some(pattern => {
      if (pattern.includes('.*')) {
        // Handle regex-like patterns
        const regex = new RegExp(pattern, 'i');
        return regex.test(response);
      } else {
        return response.includes(pattern);
      }
    })
  );
  
  if (hasGoalCompletion) {
    console.log('🎯 Address update goal accomplished detected in conversation history');
    console.log('Recent agent responses:', recentAgentResponses);
    return true;
  }
  
  return false;
}

// Helper function to check if responses are similar
export function isResponseSimilar(previousResponse: string, currentResponse: string): boolean {
  if (!previousResponse || !currentResponse) {
    return false;
  }
  
  // Normalize responses for comparison
  const normalize = (text: string) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  };
  
  const prev = normalize(previousResponse);
  const curr = normalize(currentResponse);
  
  // If responses are identical, they're similar
  if (prev === curr) {
    return true;
  }
  
  // Calculate similarity using simple word overlap
  const prevWords = prev.split(' ');
  const currWords = curr.split(' ');
  
  const commonWords = prevWords.filter(word => currWords.includes(word));
  const similarity = commonWords.length / Math.max(prevWords.length, currWords.length);
  
  // Consider responses similar if they share more than 80% of words
  const isSimilar = similarity > 0.8;
  
  if (isSimilar) {
    console.log(`Similarity detected: ${(similarity * 100).toFixed(1)}% word overlap`);
    console.log(`Previous: "${previousResponse.substring(0, 100)}..."`);
    console.log(`Current:  "${currentResponse.substring(0, 100)}..."`);
  } else {
    console.log(`Responses are different: ${(similarity * 100).toFixed(1)}% word overlap`);
  }
  
  return isSimilar;
}

// Test data for the agent preview integration
export const agentPreviewTestData = {
  testData: {
    memberInfo: {
      firstName: 'John',
      lastName: 'Doe',
      memberId: 'MEM12345',
      dateOfBirth: '1980-01-15',
      currentAddress: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      newAddress: {
        street: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103'
      },
      phoneNumber: '555-123-4567',
      email: 'john.doe@example.com'
    }
  },
  testCases: [{
    id: 'address-update-001',
    name: 'Basic Address Update Flow',
    description: 'Validate agent\'s ability to handle a simple address update request',
    scenario: 'Given I am a member with an existing address...',
    goals: [
      'Successfully authenticate member',
      'Update member address',
      'Provide clear confirmation'
    ]
  }]
};

// Agent configurations for different agent types
export const agentPreviewConfiguration = {
  type: 'HealthPlan',
  description: 'Health Plan Member Engagement System for automated testing with RoboSim integration',
  friendly: 'Friendly Farah',
  greet: 'Hi there! I\'m here to make navigating your health journey simple and stress-free—how can I help today?',
  personaId: 'persona_001',
  tone: 'Friendly',
  formality: 'Casual',
  empathy: 'High',
  readability: 'Grade 6',
  useCaseTemplate: 'healthplan_001',
  capName: 'Knowledge Base',
  capIndex: 0,
  taskId: 'task_002',
  taskName: 'Update Address',
  additionalTasks: [
    {
      id: 'task_002',
      name: 'Update Address',
      type: 'Tasks'
    }
  ]
};

export const clientServicesAgentConfiguration = {
  type: 'ClientServices',
  description: 'The Client Services Engagement System supports banking customers by answering questions about account features, fee explanations, debit or credit card issues, basic product comparisons, and everyday transaction guidance. Clients simply ask their questions and the system promptly provides accurate information or next‑step directions. The goal is to make every interaction with the financial institution seamless, informative, and satisfying for each client.',
  friendly: 'Gentle Jamie',
  greet: 'Hello! Finding your way through the complexities of your options can be tough. I\'m here to help.',
  personaId: 'persona_006',
  tone: 'Professional',
  formality: 'Casual',
  empathy: 'Low',
  readability: 'College Readability',
  useCaseTemplate: 'clientservices_001',
  capName: 'Knowledge Base',
  capIndex: 0,
  taskId: 'task_002',
  taskName: 'Update Address',
  additionalTasks: [
    {
      id: 'task_002',
      name: 'Update Address',
      type: 'Tasks'
    }
  ]
};

export const policyHolderAgentConfiguration = {
  type: 'PolicyHolder',
  description: 'The Policyholder Engagement System helps insurance customers navigate their policies by clarifying coverage, explaining billing, guiding them on claim filing and status timelines, and answering endorsement questions. Policyholders can ask any policy-related question and receive precise information or step-by-step guidance. The system is committed to making every interaction with the insurer seamless, informative, and satisfying for policyholders.',
  friendly: 'Factual Fred',
  greet: 'Hello. I\'m ready to provide information — what do you need assistance with?',
  personaId: 'persona_002',
  tone: 'Professional',
  formality: 'Casual',
  empathy: 'Low',
  readability: 'College Readability',
  useCaseTemplate: 'policyholder_001',
  capName: 'Knowledge Base',
  capIndex: 0,
  taskId: 'task_002',
  taskName: 'Update Address',
  additionalTasks: [
    {
      id: 'task_002',
      name: 'Update Address',
      type: 'Tasks'
    }
  ]
};

// Helper function to delete an agent using the 3-dots menu
export async function deleteAgent(page: Page, agentName: string): Promise<void> {
  try {
    console.log(`Looking for agent "${agentName}" to delete...`);
    
    // Find the agent row by name
    const agentRows = page.locator('tbody tr');
    const rowCount = await agentRows.count();
    console.log(`Found ${rowCount} agent rows`);
    
    let agentRow = null;
    for (let i = 0; i < rowCount; i++) {
      const row = agentRows.nth(i);
      const rowText = await row.textContent();
      if (rowText && rowText.includes(agentName)) {
        agentRow = row;
        console.log(`Found agent row ${i + 1}: ${rowText?.trim()}`);
        break;
      }
    }
    
    if (!agentRow) {
      console.log(`Agent "${agentName}" not found for deletion`);
      return;
    }
    
    // Click the 3-dots menu (SVG icon)
    console.log('Clicking 3-dots menu...');
    const threeDotsButton = agentRow.locator('svg[viewBox="0 0 4 13"]').first();
    await threeDotsButton.click();
    await page.waitForTimeout(1000);
    
    // Click "Deactivate agent" option
    console.log('Clicking Deactivate agent...');
    const deactivateOption = page.locator('span.text-p1.no-border-option:has-text("Deactivate agent")').first();
    await deactivateOption.click();
    await page.waitForTimeout(2000);
    
    // Click "Delete agent" option
    console.log('Clicking Delete agent...');
    const deleteOption = page.locator('span.text-p1.no-border-option:has-text("Delete agent")').first();
    await deleteOption.click();
    await page.waitForTimeout(2000);
    
    // Confirm deletion if there's a confirmation dialog
    try {
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")').first();
      await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmButton.click();
      console.log('Agent deletion confirmed');
    } catch (e) {
      console.log('No confirmation dialog found, deletion may have completed automatically');
    }
    
    await page.waitForTimeout(2000);
    console.log(`Agent "${agentName}" deleted successfully`);
    
  } catch (error) {
    console.log(`Error during agent deletion: ${error}`);
    throw error;
  }
}
