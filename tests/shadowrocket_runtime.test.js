const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

// Load the source files
const rcScriptPath = path.join(__dirname, "..", "scripts", "core", "locket_remoteconfig.js");
const headerScriptPath = path.join(__dirname, "..", "scripts", "core", "locket_rc_request.js");
const safeStorePath = path.join(__dirname, "..", "scripts", "utils", "safe_store.js");
const fixturePath = path.join(__dirname, "..", "fixtures", "remoteconfig_original.json");
const sampleJson = fs.readFileSync(fixturePath, "utf-8");

test("Integration Runtime - Mock $response and $done for Remote Config", () => {
    // Setup Mock Shadowrocket Global Environment
    let doneCalled = false;
    let doneOutput = null;

    global.$response = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: sampleJson
    };
    global.$argument = "videoDuration=45&audio=true&captionLimit=600";
    global.$done = (obj) => {
        doneCalled = true;
        doneOutput = obj;
    };
    global.$persistentStore = {
        read: (key) => null,
        write: (val, key) => true
    };

    // Require and execute
    delete require.cache[require.resolve(rcScriptPath)];
    const rcModule = require(rcScriptPath);
    const output = rcModule.handleResponse();

    assert.ok(output.body, "Should output modified body");
    const parsed = JSON.parse(output.body);
    assert.strictEqual(parsed.entries.video_max_duration_seconds, "45");
    assert.strictEqual(parsed.entries.video_audio_enabled, "true");
    assert.strictEqual(parsed.entries.caption_character_limit, "600");

    // Clean globals
    delete global.$response;
    delete global.$argument;
    delete global.$done;
    delete global.$persistentStore;
});

test("Integration Runtime - Safe Mode via $persistentStore bypasses changes", () => {
    global.$response = {
        status: 200,
        body: sampleJson
    };
    global.$argument = "videoDuration=60";
    global.$persistentStore = {
        read: (key) => {
            if (key === "LocketEnhanced_SafeMode") return "true";
            return null;
        }
    };
    global.$done = (obj) => {};

    delete require.cache[require.resolve(rcScriptPath)];
    const rcModule = require(rcScriptPath);
    const output = rcModule.handleResponse();

    // In Safe Mode, handleResponse returns empty object {} so Shadowrocket leaves response untouched
    assert.deepStrictEqual(output, {});

    delete global.$response;
    delete global.$argument;
    delete global.$persistentStore;
    delete global.$done;
});

test("Integration Runtime - Mock $request header cleaning removes conditional headers", () => {
    global.$request = {
        headers: {
            "Host": "firebaseremoteconfig.googleapis.com",
            "If-None-Match": '"abc123etag"',
            "if-modified-since": "Mon, 23 Nov 2026 12:00:00 GMT",
            "X-Goog-If-None-Match": '"googetag456"',
            "User-Agent": "Locket/1.144.0 (iPhone; iOS 17.5.1)"
        }
    };
    global.$done = (obj) => {};

    delete require.cache[require.resolve(headerScriptPath)];
    const headerModule = require(headerScriptPath);
    const output = headerModule.handleRequest();

    assert.ok(output.headers);
    assert.strictEqual(output.headers["Host"], "firebaseremoteconfig.googleapis.com");
    assert.strictEqual(output.headers["User-Agent"], "Locket/1.144.0 (iPhone; iOS 17.5.1)");
    // Conditional cache headers must be completely stripped
    assert.strictEqual(output.headers["If-None-Match"], undefined);
    assert.strictEqual(output.headers["if-modified-since"], undefined);
    assert.strictEqual(output.headers["X-Goog-If-None-Match"], undefined);

    delete global.$request;
    delete global.$done;
});

test("Integration Runtime - PII and sensitive token redaction in safe_store", () => {
    const { safeLog } = require(safeStorePath);
    let logged = "";
    const originalConsoleLog = console.log;
    console.log = (msg) => { logged = msg; };

    try {
        safeLog('User request with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token123 and AIzaSyD34k5j6l7m8n9o0p1q2r3s4t5u6v7w8x9');
        assert.ok(!logged.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"));
        assert.ok(logged.includes("[REDACTED]"));
        assert.ok(!logged.includes("AIzaSyD34k5j6l7m8n9o0p1q2r3s4t5u6v7w8x9"));
    } finally {
        console.log = originalConsoleLog;
    }
});
