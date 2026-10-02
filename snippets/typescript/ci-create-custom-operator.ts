// Create a custom Conversation Intelligence Language Operator.
//
// POST /v3/ControlPlane/Operators defines a reusable analysis task run
// against captured conversations. outputFormat is TEXT, CLASSIFICATION, or
// JSON (JSON requires an outputSchema). Setting context.memory.enabled
// exposes the memory tools to the operator — the prompt must then instruct
// the LLM to call them.

const INTEL_BASE = 'https://intelligence.twilio.com/v3';
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

export interface CreateOperatorOptions {
  displayName: string;
  prompt: string;
  outputFormat?: 'TEXT' | 'CLASSIFICATION' | 'JSON';
  description?: string;
  parameters?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  trainingExamples?: Array<{ input: string; output: string }>;
  memoryEnabled?: boolean;
}

export async function createOperator(opts: CreateOperatorOptions): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {
    displayName: opts.displayName,
    prompt: opts.prompt,
    outputFormat: opts.outputFormat ?? 'TEXT',
  };
  if (opts.description) body.description = opts.description;
  if (opts.parameters) body.parameters = opts.parameters;
  if (opts.outputFormat === 'JSON' && opts.outputSchema) body.outputSchema = opts.outputSchema;
  if (opts.trainingExamples) body.trainingExamples = opts.trainingExamples;
  if (opts.memoryEnabled) body.context = { memory: { enabled: true } };

  const resp = await fetch(`${INTEL_BASE}/ControlPlane/Operators`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`CI create operator failed: ${resp.status} ${await resp.text()}`);
  return resp.json() as Promise<Record<string, unknown>>;
}
