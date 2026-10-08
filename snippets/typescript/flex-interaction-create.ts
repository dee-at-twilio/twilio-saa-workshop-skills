// Create a Flex Interaction routed to a specific worker.
//
// Used for agent-initiated outbound: once a Conversations channel exists for
// the customer, wrap it in a Flex Interaction that targets a specific worker
// via (workspaceSid, workflowSid, queueSid, workerSid). The task's attributes
// carry customer context onto the agent's desktop.

import { Twilio } from 'twilio';

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

const workspaceSid = process.env.FLEX_APP_WORKSPACE_SID!;
const workflowSid = process.env.FLEX_APP_WORKFLOW_SID!;
const queueSid = process.env.FLEX_APP_QUEUE_SID!;
const workerSid = process.env.FLEX_APP_WORKER_SID!;

export async function createOutboundSmsInteraction(args: {
  conversationSid: string;
  customerName: string;
  customerAddress: string;
  fromNumber: string;
}) {
  return client.flexApi.v1.interaction.create({
    channel: {
      type: 'sms',
      initiated_by: 'agent',
      properties: { media_channel_sid: args.conversationSid },
    },
    routing: {
      properties: {
        workspace_sid: workspaceSid,
        workflow_sid: workflowSid,
        queue_sid: queueSid,
        worker_sid: workerSid,
        task_channel_unique_name: 'chat',
        attributes: {
          customerName: args.customerName,
          from: args.fromNumber,
          direction: 'outbound',
          customerAddress: args.customerAddress,
          twilioNumber: args.fromNumber,
        },
      },
    },
  });
}
