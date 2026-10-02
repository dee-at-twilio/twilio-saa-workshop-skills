// Attach a Language Operator to an Intelligence Configuration.
//
// PUT on a Configuration silently creates an inactive version — so the
// reliable path is DELETE + POST to recreate the config with the merged
// rules. The new config ID is different; update any external references
// (e.g. Conversation Orchestrator intelligenceConfigurationIds) to point
// at it.
//
// A rule binds an operator to a trigger (COMMUNICATION with throttle,
// CONVERSATION_END, or CONVERSATION_INACTIVE) and posts results to a
// webhook action.

const INTEL_BASE = 'https://intelligence.twilio.com/v3';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

interface Rule {
  id?: string;
  operators: Array<{ id: string }>;
  triggers: Array<{ on: string; parameters?: { count: number } }>;
  actions: Array<{ type: 'WEBHOOK'; method: 'POST'; url: string }>;
}

interface Configuration {
  id?: string;
  displayName: string;
  description?: string | null;
  rules?: Rule[];
}

const stripRuleIds = (rule: Rule): Rule => {
  const { id: _id, ...rest } = rule;
  return rest;
};

export async function attachOperatorRule(args: {
  configId: string;
  operatorId: string;
  webhookUrl: string;
  triggerOn?: 'COMMUNICATION' | 'CONVERSATION_END' | 'CONVERSATION_INACTIVE';
  throttle?: number;
}): Promise<Configuration> {
  const triggerOn = args.triggerOn ?? 'COMMUNICATION';
  const throttle = args.throttle ?? 1;

  const getResp = await fetch(`${INTEL_BASE}/ControlPlane/Configurations/${args.configId}`, {
    headers: { Authorization: authHeader },
  });
  if (!getResp.ok) throw new Error(`Fetch config failed: ${getResp.status} ${await getResp.text()}`);
  const current = (await getResp.json()) as Configuration;

  const trigger: Rule['triggers'][number] = { on: triggerOn };
  if (triggerOn === 'COMMUNICATION' && throttle > 1) {
    trigger.parameters = { count: throttle };
  }

  const newRule: Rule = {
    operators: [{ id: args.operatorId }],
    triggers: [trigger],
    actions: [{ type: 'WEBHOOK', method: 'POST', url: args.webhookUrl }],
  };
  const rules = [...(current.rules ?? []), newRule];

  const delResp = await fetch(`${INTEL_BASE}/ControlPlane/Configurations/${args.configId}`, {
    method: 'DELETE',
    headers: { Authorization: authHeader },
  });
  if (!delResp.ok && delResp.status !== 404) {
    throw new Error(`Delete config failed: ${delResp.status} ${await delResp.text()}`);
  }

  const createBody: Configuration = {
    displayName: current.displayName ?? 'Config',
    ...(current.description ? { description: current.description } : {}),
    rules: rules.map(stripRuleIds),
  };
  const createResp = await fetch(`${INTEL_BASE}/ControlPlane/Configurations`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(createBody),
  });
  if (!createResp.ok) {
    throw new Error(`Recreate config failed: ${createResp.status} ${await createResp.text()}`);
  }
  return createResp.json() as Promise<Configuration>;
}
