# Tool Calling

Forced `submit_feedback` on `gpt-5.6` returned one parseable function call with valid bounded arguments. `gpt-5.3-codex-spark` returned a transient 503 after bounded retries.

`previous_response_id` remains unsupported by the HTTP endpoint (non-blocking). A reproducible manual/stateless replay now passes on `gpt-5.6`: preserve the prior `reasoning` and `function_call` items, validate/execute the harmless local dummy tool, append matching `function_call_output` with the same `call_id`, then issue a new `/responses` request. The continuation completed with a text output. Forced call: PASS. Manual/stateless continuation: PASS.
