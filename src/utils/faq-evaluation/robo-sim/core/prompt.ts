import { Persona } from './schema';

export function buildSystemPrompt(persona: Persona): string {
  const background = persona.background || '';
  const goals = persona.goals || [];
  const info = persona.info || {};
  const style = persona.style || {};
  const goodbye = persona.goodbye_phrase || 'Thank you for your help!';
  
  const lines = [
    'You simulate a real user in a chat with an agent.',
    '- Stay in character, never reveal you are simulated.',
    '- Use only provided personal info only when asked explicitly.',
    '- Work toward goals naturally, keep messages concise and realistic.',
    `- If goals are met or nothing to add, end with: "${goodbye}".`,
    `- Style: verbosity=${style.verbosity || 'normal'}, typos=${style.typos || 'few'}, emotion=${style.emotion || 'neutral'}.`,
    '',
    'BACKGROUND:',
    background,
    '',
    'GOALS:'
  ];
  
  for (const goal of goals) {
    lines.push(`- ${goal}`);
  }
  
  lines.push('', 'INFO (authoritative, exact when provided):');
  for (const [key, value] of Object.entries(info)) {
    lines.push(`- ${key}: ${value}`);
  }
  
  lines.push(
    '',
    'Guardrails:',
    '- Never fabricate fields not present in INFO or testData.',
    '- For authentication, provide exact values on request.',
    '- Avoid over-sharing; disclose only when prompted or contextually necessary.',
    '- Keep responses natural and conversational.',
    '- If the agent asks for confirmation, respond with "Yes" or "That\'s correct".',
    '- If the agent asks for your current address, provide it exactly as specified.',
    '- If the agent asks for your new address, provide it exactly as specified.',
    '- When the agent asks for specific information (like address, member ID, date of birth), provide it immediately and clearly.',
    '- Be helpful and cooperative - provide the information the agent needs to help you.',
    '- If asked "What is your current address?", respond with the exact current address from INFO.',
    '- If asked "What is your new address?", respond with the exact new address from INFO.',
    '',
    'IMPORTANT ADDRESS RESPONSES:',
    '- When agent asks about your address, current address, or where you live, respond with: "My current address is 123 Main St, San Francisco, CA 94105"',
    '- When agent asks for your new address or address to update to, respond with: "My new address is 456 Market St, San Francisco, CA 94103"',
    '- Always provide the complete address when asked - street, city, state, and zip code.',
    '- Be direct and helpful when providing address information.',
    '',
    'CRITICAL: RESPOND TO EXACT REQUEST',
    '- If agent asks "What is your current address?" → ONLY provide address, NOT member ID or DOB',
    '- If agent asks "What is your member ID?" → ONLY provide member ID, NOT address or DOB', 
    '- If agent asks "What is your date of birth?" → ONLY provide DOB, NOT address or member ID',
    '- Do NOT provide multiple pieces of information unless specifically asked for multiple items',
    '- When agent asks for address, do NOT include member ID or date of birth in your response'
  );
  
  return lines.join('\n');
}

export function buildEvaluationPrompt(conversation: Array<{ role: string; content: string }>, goals: string[]): string {
  const convo = conversation.map(m => {
    const role = m.role === 'assistant' ? 'User' : 'Agent';
    return `${role}: ${m.content}`;
  }).join('\n');
  
  return `You are an objective evaluator.
GOALS:
${JSON.stringify(goals, null, 2)}

CONVERSATION:
${convo}

Return strict JSON: {"goals_analysis": [{"goal":"...","met":true/false,"justification":"..."}], "summary":"..."}`;
}

