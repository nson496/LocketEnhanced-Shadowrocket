const test = require("node:test");
const assert = require("node:assert");
const { processRequestHeaders, DROP_HEADER_NAMES } = require("../scripts/core/locket_rc_request");

test("Request Cleaner - drops cache and ETag headers case-insensitively", () => {
    const inputHeaders = {
        "Host": "api.revenuecat.com",
        "Authorization": "Bearer test_token",
        "If-None-Match": 'W/"12345"',
        "if-modified-since": "Mon, 01 Jan 2024 00:00:00 GMT",
        "X-RevenueCat-ETag": "etag_abc",
        "x-goog-if-none-match": "firebase_etag",
        "User-Agent": "LocketWidget/1.0"
    };

    const cleaned = processRequestHeaders(inputHeaders);

    assert.strictEqual(cleaned["Host"], "api.revenuecat.com");
    assert.strictEqual(cleaned["Authorization"], "Bearer test_token");
    assert.strictEqual(cleaned["User-Agent"], "LocketWidget/1.0");

    assert.strictEqual(cleaned["If-None-Match"], undefined);
    assert.strictEqual(cleaned["if-modified-since"], undefined);
    assert.strictEqual(cleaned["X-RevenueCat-ETag"], undefined);
    assert.strictEqual(cleaned["x-goog-if-none-match"], undefined);
});

test("Request Cleaner - handles empty and malformed headers gracefully", () => {
    assert.deepStrictEqual(processRequestHeaders(null), {});
    assert.deepStrictEqual(processRequestHeaders(undefined), {});
    assert.deepStrictEqual(processRequestHeaders({}), {});
});
