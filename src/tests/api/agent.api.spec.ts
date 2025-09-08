import { test } from '@playwright/test';
import { createAndActivateAgent,getAgentSelectorFromCLI, initAgentBySelector,getAgentHandle } from '@utils/api/ushur.Agents';
import { agentConfig } from '@configs/agents.config';


import { getUshurTokenFromApi } from '../../utils/api/getToken'; // relative import
import { env } from '@utils/env';

test('Create and activate agent with random account (or init existing via selector)', async () => {
  
const instance = env.instance;
const { token, account } = await getUshurTokenFromApi();
console.log(`🔐 Using account: ${account}`);
const handle = getAgentHandle();
  console.log('selector from CLI/env:', handle);
  if (handle) {
    const url = await initAgentBySelector(instance, token, agentConfig, handle);
    console.log('Initialized existing agent →', url);
    return;
  }


//test('Create and activate agent with random account', async () => {
  

  const result = await createAndActivateAgent(instance, token, agentConfig, account);

  
  
});
