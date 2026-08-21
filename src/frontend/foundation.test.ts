import assert from "node:assert/strict";
import test from "node:test";

import { foundationRoute, normalizeApiError } from "./foundation.js";

test("classifies canonical learner and operations routes for the shared shell", () => {
  assert.equal(foundationRoute("/"), "home");
  assert.equal(foundationRoute("/learn"), "learn");
  assert.equal(foundationRoute("/practice/demo"), "learn");
  assert.equal(foundationRoute("/transfer/demo"), "learn");
  assert.equal(foundationRoute("/receipts/demo"), "learn");
  assert.equal(foundationRoute("/progress"), "progress");
  assert.equal(foundationRoute("/ops"), "ops");
});

test("normalizes API-shaped and unknown failures into a retryable frontend error", () => {
  assert.deepEqual(
    normalizeApiError({ error: { code: "CONTENT_INTEGRITY_FAILED", message: "Nội dung chưa sẵn sàng." } }),
    { code: "CONTENT_INTEGRITY_FAILED", message: "Nội dung chưa sẵn sàng.", retryable: false },
  );
  assert.deepEqual(
    normalizeApiError(new Error("Network unavailable")),
    { code: "NETWORK_ERROR", message: "Không thể kết nối. Hãy thử lại.", retryable: true },
  );
});
