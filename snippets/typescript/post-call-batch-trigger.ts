// Pattern: call-status webhook enqueueing a keyed batch job on completion,
// rather than running analysis (e.g. a CINTEL summary) inline.

app.post('/webhooks/call-status', (req, res) => {
  if (req.body.CallStatus === 'completed') {
    summaryQueue.enqueue({ callSid: req.body.CallSid });
  }
  res.sendStatus(204);
});
