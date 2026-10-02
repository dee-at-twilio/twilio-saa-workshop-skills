// Fetch a TaskRouter Task.
// Returns the task's current state, attributes JSON (as a string in `attributes`),
// assignment status, age, and routing data.

import { Twilio } from 'twilio';

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const workspaceSid = process.env.FLEX_APP_WORKSPACE_SID!;

export async function fetchTask(taskSid: string) {
  return client.taskrouter.v1.workspaces(workspaceSid).tasks(taskSid).fetch();
}
