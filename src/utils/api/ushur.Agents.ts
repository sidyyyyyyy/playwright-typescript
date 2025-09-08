import axios from 'axios';
import dotenv from 'dotenv';
import { getAssetIds } from '@utils/api/uploadAssets';
dotenv.config();

type AgentArgs = {
  description?: string;
  type?: string;
  friendly?: string;
  greet?: string;
  useCaseTemplate?: string;
  capName?: string;
  capIndex?: number;
  taskId?: string;
  taskName?: string;
  taskIndex?: number;
  personaId?: string;
  tone?: string;
  formality?: string;
  empathy?: string;
  readability?: string;
  personaProps?: Partial<{ tone: string; formality: string; empathy: string; readability: string }>;
};


function safeJSON<T = any>(s?: string) {
  try { return s ? JSON.parse(s) as T : undefined; } catch { return undefined; }
}

function readFileIfExists(p?: string) {
  if (!p) return undefined;
  try { return require('fs').readFileSync(p, 'utf8'); } catch { return undefined; }
}

type AgentSummary = {
  name?: string;
  agentId?: string;
  id?: string;
  status?: string;
  [k: string]: any;
};

export function getAgentHandle(): string | undefined {
  const idx = process.argv.indexOf('--');
  if (idx !== -1) {
    const tail = process.argv.slice(idx + 1);
    const flag = tail.find(t => t.startsWith('--agent='));
    if (flag) return flag.slice('--agent='.length);
  }
  return process.env.AGENT_HANDLE || undefined;
}

export function getAgentSelectorFromCLI(): string | undefined {
  const argv = process.argv.slice(2);
  const dd = argv.indexOf('--');
  const head = dd === -1 ? argv : argv.slice(0, dd);
  const selector = head.find(t =>
    !t.startsWith('-') &&
    !t.endsWith('.spec.ts') &&
    !t.endsWith('.test.ts') &&
    !t.endsWith('.ts') &&
    !t.endsWith('.js')
  );
  return selector || process.env.AGENT_HANDLE || undefined;
}

async function listAgents(instance: string, headers: any, agentConfig: any): Promise<AgentSummary[]> {
  const url = `https://${instance}${agentConfig.end_points.createAgent}`; // ensure this exists in your config
  const res = await axios.get(url, { headers });
  const body = res.data ?? {};
  const items = body.data; // <- your payload shows agents under "data"
  if (!Array.isArray(items)) {
    throw new Error(`listAgents: unexpected response ${JSON.stringify(body).slice(0, 300)}…`);
  }
  return items as AgentSummary[];
}

function pickAgentByNameOrId(agents: AgentSummary[], selector: string): AgentSummary | undefined {
  const s = selector.toLowerCase();
  let m = agents.find(a => a.name?.toLowerCase() === s);
  if (m) return m;
  m = agents.find(a => (a.agentId ?? a.id) === selector);
  if (m) return m;
  return agents.find(a =>
    a.name?.toLowerCase().includes(s) ||
    (a.agentId ?? a.id ?? '').toLowerCase().includes(s)
  );
}

async function initExistingAgent(instance: string, headers: any, agentConfig: any, agent: AgentSummary): Promise<string> {
  const initUrl = `https://${instance}${agentConfig.end_points.agentInit}`;
  const attempts = [
    { aiagentName: agent.name, tokenId: headers.token, preview: true },
    { aiagentName: agent.agentId ?? agent.id, tokenId: headers.token, preview: true },
  ].filter(p => p.aiagentName);

  let lastErr: any;
  for (const payload of attempts) {
    try {
      // Your existing init call used body with tokenId and no headers — keep that pattern
      const r = await axios.post(initUrl, payload);
      const d = r.data ?? {};
      const url = d.sessionUrl ?? d.url ?? d.agentUrl ?? d.launchUrl;
      if (url) return url;
      lastErr = new Error(`Init returned no URL field; response keys: ${Object.keys(d).join(', ')}`);
    } catch (e) {
      lastErr = e;
      // try the next payload
    }
  }
  throw lastErr || new Error('Init failed for all payload attempts');
}

// Public entry: use selector → list → pick → init
export async function initAgentBySelector(instance: string, token: string, agentConfig: any, selector: string) {
  const headers = { 'Content-Type': 'application/json', token };
  console.log(`🔎 Selector: "${selector}" → fetching agents…`);
  const agents = await listAgents(instance, headers, agentConfig);
  const agent = pickAgentByNameOrId(agents, selector);
  if (!agent) {
    console.log('Available agent names:', agents.map(a => a.name).filter(Boolean).slice(0, 20));
    throw new Error(`No agent matched "${selector}"`);
  }
  console.log(`Found agent: ${agent.name ?? agent.agentId}`);
  const url = await initExistingAgent(instance, headers, agentConfig, agent);
  console.log('AGENT_URL:', url);
  process.env.AGENT_URL = url;
  return url;
}


export function getCustomArgs(): AgentArgs {
  // read flags that appear after a `--` in the Playwright command
  const idx = process.argv.indexOf('--');
  const tail = idx === -1 ? [] : process.argv.slice(idx + 1);

  const kv: Record<string, string> = {};
  for (const token of tail) {
    const m = /^--([^=]+)=(.*)$/i.exec(token);
    if (m) kv[m[1]] = m[2];
  }

  const personaPropsJSON = kv.personaProps ?? process.env.PERSONA_PROPS;
  const personaPropsFile = kv.personaPropsFile ?? process.env.PERSONA_PROPS_FILE;
  const personaPropsFromFile = safeJSON(readFileIfExists(personaPropsFile));
  const personaProps = safeJSON(personaPropsJSON) ?? personaPropsFromFile;

  return {
    type: kv.type ?? process.env.AGENT_TYPE,
    description: kv.description ?? process.env.AGENT_DESCRIPTION,
    friendly: kv.friendly ?? process.env.FRIENDLY_NAME,
    greet: kv.greet ?? process.env.GREET_MESSAGE,
    useCaseTemplate: kv.useCaseTemplate ?? process.env.USE_CASE_TEMPLATE,
    capName: kv.capName ?? process.env.CAP_NAME,
    capIndex: Number(kv.capIndex ?? process.env.CAP_INDEX ?? 0),

    taskId: kv.taskId ?? process.env.TASK_ID,
    taskName: kv.taskName ?? process.env.TASK_NAME,
    taskIndex: Number(kv.taskIndex ?? process.env.TASK_INDEX ?? 1),
   
    personaId: kv.personaId ?? process.env.PERSONA_ID,
    tone: kv.tone ?? process.env.TONE,
    formality: kv.formality ?? process.env.FORMALITY,
    empathy: kv.empathy ?? process.env.EMPATHY,
    readability: kv.readability ?? process.env.READABILITY,
    personaProps,
  };
}

export async function createAndActivateAgent(instance: string, token: string, agentConfig: any, accountEmail: string) {
  const headers = {
    'Content-Type': 'application/json',
    token
  };

  const args = getCustomArgs();

const enterpriseSettingsUrl = `https://${instance}${agentConfig.end_points.enterpriseSettings}`;
const enterprisePayload = { ...agentConfig.enterprise_setting, userName: accountEmail,};
const setEnterprise = await axios.post(enterpriseSettingsUrl, JSON.stringify(enterprisePayload), { headers });
const entResult = setEnterprise.data;
  
const assetIds = await getAssetIds(
    instance,
    token,
    agentConfig.end_points.asset,
    '../data/assets/train'
  );
  console.log('assetIds ::::ß', assetIds[0]);
  const createUrl = `https://${instance}${agentConfig.end_points.createAgent}`;
  console.log('createUrl', createUrl);
  const agentPayload = { ...agentConfig.create_agent[0] };

  agentPayload.agentPersona ||= {};
  agentPayload.optedCapabilities ||= [];


  agentPayload.name = `${Math.floor(1000000 + Math.random() * 9000000)}`;
  
  
  if (args.type) agentPayload.type = args.type;
  if (args.description) agentPayload.description = args.description;
  if (args.friendly) agentPayload.agentPersona.friendlyName = args.friendly;
  if (args.greet) agentPayload.agentPersona.greetMessage = args.greet;
  if (args.useCaseTemplate) agentPayload.useCaseTemplate = args.useCaseTemplate;
  if (args.capName) agentPayload.optedCapabilities[args.capIndex ?? 0].name = args.capName;

  if (args.personaId) agentPayload.agentPersona.personaId = args.personaId;



agentPayload.optedCapabilities ||= [];
const oc = agentPayload.optedCapabilities;

// Find an existing Tasks capability (by type). If none, use taskIndex (default 1).
let tIdx = oc.findIndex((c: any) => c?.type === 'Tasks');
if (tIdx === -1) tIdx = args.taskIndex ?? 1;

// Ensure the slot exists, set/keep type as Tasks, and only update id/name.
oc[tIdx] ||= {};
if (!oc[tIdx].type) oc[tIdx].type = 'Tasks';

if (args.taskId)   oc[tIdx].id   = args.taskId;
if (args.taskName) oc[tIdx].name = args.taskName;  

agentPayload.agentPersona.properties = {
  ...agentPayload.agentPersona.properties,
  ...(args.personaProps ?? {}),
  ...(args.tone ? { tone: args.tone } : {}),
  ...(args.formality ? { formality: args.formality } : {}),
  ...(args.empathy ? { empathy: args.empathy } : {}),
  ...(args.readability ? { readability: args.readability } : {}),
};
  
    agentPayload.optedCapabilities[0].knowledgeAssetId = assetIds[0] ;
  console.log('agentPayload.name :', agentPayload.name);
  console.log('agentPayload ::::ß', agentPayload);
  console.log('headers', headers);
  const createRes = await axios.post(createUrl, agentPayload, { headers });
  const result = createRes.data;

  const dataPath = result.data;
  if (!dataPath) throw new Error("No `data` returned in create agent response");

  console.log('dataPath :', dataPath);
  function normalizePath(path: string) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  const statusUrl = `https://${instance}${agentConfig.end_points.createAgent}/${dataPath}`;
  const statusRes = await axios.get(statusUrl, { headers });

  if (statusRes.status === 200 && statusRes.data?.status === 'success') {
    const status = statusRes.data.data?.status;

    console.log(`Current agent status: ${status}`);
  if (status === 'inactive') {
    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      await sleep(10000);
    const activateUrl = `https://${instance}${agentConfig.end_points.createAgent}/${dataPath}${agentConfig.end_points.activateAgent}`;

    console.log(`Activating agent: ${activateUrl}`);
    const activateRes = await axios.post(activateUrl, {}, { headers });

    if (activateRes.data?.status === 'success') {
      console.log(`Agent ${agentPayload.name} activated successfully`);
      const agentInitUrl = `https://${instance}${agentConfig.end_points.agentInit}`;
      console.log('agentInitUrl', agentInitUrl);
      const agentInitPayload = {    
        "aiagentName": dataPath,
        "tokenId": token,
        "preview": true
      }
      console.log('agentInitPayload', agentInitPayload);
      const agentInitRes = await axios.post(agentInitUrl, agentInitPayload);
      const { sessionId, sessionUrl } = agentInitRes.data;
      console.log('agentInitSession:', sessionId);
      console.log('agentInitSessionURL:', sessionUrl);
// Return or use sessionUrl as needed
    return sessionUrl;  
    } else {
      console.error(`Failed to activate agent: ${activateRes.data?.infoText}`);
    }
      } else {
      console.log(`Agent ${agentPayload.name} is already active`);
      // If agent is already active, still initialize session
      const agentInitUrl = `https://${instance}${agentConfig.end_points.agentInit}`;
      console.log('agentInitUrl', agentInitUrl);
      const agentInitPayload = {    
        "aiagentName": dataPath,
        "tokenId": token,
        "preview": true
      }
      console.log('agentInitPayload', agentInitPayload);
      const agentInitRes = await axios.post(agentInitUrl, agentInitPayload);
      const { sessionId, sessionUrl } = agentInitRes.data;
      console.log('agentInitSession:', sessionId);
      console.log('agentInitSessionURL:', sessionUrl);
      return sessionUrl;
    }
} else {
  throw new Error(`Failed to fetch agent details: ${statusRes.data?.infoText || statusRes.statusText}`);
}
}



