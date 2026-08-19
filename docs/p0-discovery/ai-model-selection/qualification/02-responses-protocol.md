# Responses Protocol

The adapter accepts output arrays with any message/content position and extracts all `output_text` fragments. It accepts absent reasoning telemetry and does not guess cost. Matrix runs exercised 8 requested text models; a requested alias can return a different model identifier and that is retained as normalized metadata.

`previous_response_id` in HTTP returned HTTP 400 (“Responses WebSocket v2” only), but stateless replay passed and is the qualified continuation route. The endpoint limitation is recorded as unsupported, not a freeze blocker.
