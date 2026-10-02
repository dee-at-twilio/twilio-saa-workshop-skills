// Look up a TaskRouter Worker's attributes by friendlyName.
//
// Common when a Conversations participant has an identity string (e.g. an
// agent's email) and you need the human-readable name or skills set stored
// in the Worker's attributes JSON.

import { Twilio } from 'twilio';

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const workspaceSid = process.env.FLEX_APP_WORKSPACE_SID!;

export async function getWorkerAttributesByFriendlyName(
  friendlyName: string,
): Promise<Record<string, unknown> | null> {
  const workers = await client.taskrouter.v1.workspaces(workspaceSid).workers.list({
    friendlyName,
    limit: 1,
  });
  if (workers.length === 0) return null;
  return JSON.parse(workers[0].attributes);
}
