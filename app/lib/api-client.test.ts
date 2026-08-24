import assert from "node:assert/strict";
import test from "node:test";

import { requestJson } from "./api-client.js";

test("a public demo learner request bootstraps a clean actor session once after an unauthenticated response", async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ readonly url: string; readonly method: string }> = [];
  try {
    globalThis.fetch = async (url, init) => {
      const method = String(init?.method ?? "GET");
      calls.push({ url: String(url), method });
      if (calls.length === 1) return new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "A valid actor session is required." } }), { status: 401 });
      if (calls.length === 2) return new Response(JSON.stringify({ actorId: "actor_demo_clean", role: "learner" }), { status: 200 });
      return new Response(JSON.stringify({ subjects: [] }), { status: 200 });
    };
    assert.deepEqual(await requestJson<{ readonly subjects: readonly unknown[] }>("/api/v1/home"), { subjects: [] });
    assert.deepEqual(calls, [
      { url: "/api/v1/home", method: "GET" },
      { url: "/api/v1/demo/session", method: "POST" },
      { url: "/api/v1/home", method: "GET" },
    ]);
  } finally { globalThis.fetch = originalFetch; }
});
