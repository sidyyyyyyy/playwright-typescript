import { RoboSimulator } from './core/simulator';
import { FunctionAdapter } from './adapters/func';
import { Persona } from './core/schema';

export async function nextUserReply(agentMessage: string, persona: Persona): Promise<string> {
  const adapter = new FunctionAdapter();
  adapter.setAgentMessage(agentMessage);
  
  const simulator = new RoboSimulator(persona, adapter, {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTurns: 1
  });
  
  return await simulator.runOnce(agentMessage);
}

export function createPersonaFromTestData(testData: any): Persona {
  const memberInfo = testData.memberInfo || testData.testData?.memberInfo;
  
  if (!memberInfo) {
    throw new Error('Invalid test data: missing memberInfo');
  }
  
  return {
    background: 'Member wants to update their address in the system.',
    info: {
      'member id': memberInfo.memberId,
      'date of birth': memberInfo.dateOfBirth,
      'current address': `${memberInfo.currentAddress.street}, ${memberInfo.currentAddress.city}, ${memberInfo.currentAddress.state} ${memberInfo.currentAddress.zip}`,
      'new address': `${memberInfo.newAddress.street}, ${memberInfo.newAddress.city}, ${memberInfo.newAddress.state} ${memberInfo.newAddress.zip}`,
      'phone number': memberInfo.phoneNumber,
      'email': memberInfo.email
    },
    goals: testData.testCases?.[0]?.goals || [
      'Successfully authenticate member',
      'Update member address', 
      'Provide clear confirmation'
    ],
    goodbye_phrase: 'Thank you for your help!',
    style: {
      verbosity: 'normal',
      typos: 'few',
      emotion: 'polite'
    }
  };
}

