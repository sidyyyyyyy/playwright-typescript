/**
 * Helper functions for RoboSim Agent Preview Integration tests
 */

/**
 * Send a message to the agent chat input
 */
export async function sendMessage(chatInput: any, message: string): Promise<void> {
  try {
    await chatInput.first().click({ force: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    await chatInput.first().fill('');
    await new Promise(resolve => setTimeout(resolve, 300));
    await chatInput.first().type(message, { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await chatInput.first().press('Enter');
    console.log(`✅ Sent: "${message}"`);
  } catch (e) {
    console.log('⚠️ Error sending message, trying fill approach...');
    await chatInput.first().fill(message);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await chatInput.first().press('Enter');
    console.log(`✅ Sent via fill: "${message}"`);
  }
}

/**
 * Wait for agent response and capture it
 */
export async function waitForAgentResponse(chatFrame: any, page: any): Promise<string> {
  console.log('Waiting for agent response...');
  
  // Wait for agent response
  await page.waitForTimeout(10000);
  
  try {
    const outgoingMessages = chatFrame.locator('div.chatbot-message.outgoing');
    const outgoingCount = await outgoingMessages.count();
    console.log(`Outgoing messages (agent responses): ${outgoingCount}`);
    
    if (outgoingCount > 0) {
      const latestOutgoing = outgoingMessages.last();
      const responseText = await latestOutgoing.textContent();
      
      if (responseText && responseText.trim().length > 10) {
        console.log(`Captured agent response: "${responseText.trim().substring(0, 100)}..."`);
        return responseText.trim();
      }
    }
    
    return 'No response received';
  } catch (e) {
    console.log(`Error capturing agent response: ${e}`);
    return 'Error in response capture';
  }
}

/**
 * Check if conversation is complete based on agent response
 */
export function isConversationComplete(agentResponse: string): boolean {
  const completionIndicators = [
    'successfully updated',
    'address has been updated',
    'confirmation email',
    'process completed',
    'thank you for your help',
    'is there anything else',
    'anything else i can help'
  ];
  
  const lowerResponse = agentResponse.toLowerCase();
  return completionIndicators.some(indicator => lowerResponse.includes(indicator));
}

/**
 * Check if responses are similar to avoid repetitive conversations
 */
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
    console.log(`Responses are similar: ${(similarity * 100).toFixed(1)}% word overlap`);
  } else {
    console.log(`Responses are different: ${(similarity * 100).toFixed(1)}% word overlap`);
  }
  
  return isSimilar;
}
