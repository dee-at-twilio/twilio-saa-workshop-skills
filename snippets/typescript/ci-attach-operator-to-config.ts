// Attach a Language Operator to an Intelligence Configuration.
//
// PUT /v3/ControlPlane/Configurations/{id} requires the full configuration
// body (displayName, rules, ...) — any field you omit is cleared. Fetch the
// current config first, append the new rule, then PUT the merged object
// back.
//
// A rule binds operators to a trigger (COMMUNICATION with optional
// throttle count, CONVERSATION_END, or CONVERSATION_INACTIVE) and posts
// results to a webhook action.

const INTEL_BASE = 'https://intelligence.twilio.com/v3';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

interface Rule {
  id?: string;
  operators: Array<{ id: string; parameters?: Record<string, unknown> }>;
  triggers: Array<{ on: string; parameters?: { count: number } }>;
  actions: Array<{ type: 'WEBHOOK'; method: 'POST' | 'GET'; url: string }>;
  context?: Record<string, unknown>;
}

interface Configuration {
  id?: string;
  displayName: string;
  description?: string | null;
  rules?: Rule[];
}

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

  const updateBody: Configuration = {
    displayName: current.displayName,
    ...(current.description ? { description: current.description } : {}),
    rules: [...(current.rules ?? []), newRule],
  };

  const putResp = await fetch(`${INTEL_BASE}/ControlPlane/Configurations/${args.configId}`, {
    method: 'PUT',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(updateBody),
  });
  if (!putResp.ok) {
    throw new Error(`Update config failed: ${putResp.status} ${await putResp.text()}`);
  }
  return putResp.json() as Promise<Configuration>;
}
