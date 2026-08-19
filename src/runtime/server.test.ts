import assert from "node:assert/strict";
import test from "node:test";

import { runtimeConfigurationFromEnvironment } from "./server.js";

test("production runtime configuration fails closed without exact approved-seed provenance", () => {
  assert.throws(() => runtimeConfigurationFromEnvironment({}), /THINKAI_DATABASE_URL/i);
  const config = runtimeConfigurationFromEnvironment({
    THINKAI_DATABASE_URL: "postgresql://example.invalid/thinkai",
    THINKAI_SESSION_SECRET: "0123456789abcdef0123456789abcdef",
    THINKAI_CONTENT_PATH: "./private/approved-content.json",
    THINKAI_DEMO_SEED_PATH: "./private/demo-seed.json",
    THINKAI_DEMO_SEED_SHA256: "a".repeat(64),
    THINKAI_DEMO_SEED_VERSION: "reviewed-v1",
  });
  assert.equal(config.demoSeedVersion, "reviewed-v1");
  assert.equal(config.staffBootstrapSecret, undefined);
  assert.throws(() => runtimeConfigurationFromEnvironment({
    THINKAI_DATABASE_URL: "postgresql://example.invalid/thinkai", THINKAI_SESSION_SECRET: "0123456789abcdef0123456789abcdef",
    THINKAI_CONTENT_PATH: "content", THINKAI_DEMO_SEED_PATH: "seed", THINKAI_DEMO_SEED_SHA256: "a".repeat(64), THINKAI_DEMO_SEED_VERSION: "reviewed-v1",
    THINKAI_RUNTIME_ACCEPTANCE_TEST: "1", NODE_ENV: "production",
  }), /forbidden in production/i);
  assert.throws(() => runtimeConfigurationFromEnvironment({ ...process.env, THINKAI_DATABASE_URL: "db", THINKAI_SESSION_SECRET: "secret", THINKAI_CONTENT_PATH: "content", THINKAI_DEMO_SEED_PATH: "seed", THINKAI_DEMO_SEED_SHA256: "not-a-digest", THINKAI_DEMO_SEED_VERSION: "v1" }), /SHA256/i);
});
