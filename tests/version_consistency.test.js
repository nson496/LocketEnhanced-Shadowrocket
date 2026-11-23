const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const EXPECTED_VERSION = "0.1.6-beta";
const EXPECTED_TAG = "v" + EXPECTED_VERSION;

const moduleFiles = [
    "LocketEnhanced.sgmodule",
    "LocketEnhanced-Beta.sgmodule",
    "LocketEnhanced-Diagnostic.sgmodule"
];

test("Version Consistency - All modules share identical version 0.1.6-beta", () => {
    const versions = [];

    for (const modFile of moduleFiles) {
        const filePath = path.join(__dirname, "..", "modules", modFile);
        assert.ok(fs.existsSync(filePath), `Module file must exist: ${modFile}`);

        const content = fs.readFileSync(filePath, "utf-8");
        const match = content.match(/#!version=([^\r\n]+)/);
        assert.ok(match, `Module ${modFile} must declare #!version`);

        const version = match[1].trim();
        versions.push(version);
        assert.strictEqual(version, EXPECTED_VERSION, `Module ${modFile} version must match ${EXPECTED_VERSION}`);
    }

    assert.strictEqual(versions[0], versions[1]);
    assert.strictEqual(versions[1], versions[2]);
});

test("Script-Path Pinning - Modules must pin scripts to release tag v0.1.6-beta, never /main/", () => {
    for (const modFile of moduleFiles) {
        const filePath = path.join(__dirname, "..", "modules", modFile);
        const content = fs.readFileSync(filePath, "utf-8");

        const scriptPathRegex = /script-path=([^\s,]+)/g;
        let match;
        let foundScripts = 0;

        while ((match = scriptPathRegex.exec(content)) !== null) {
            foundScripts++;
            const scriptUrl = match[1];

            assert.ok(
                !scriptUrl.includes("/main/"),
                `Script-path in ${modFile} must not reference floating /main/ branch: ${scriptUrl}`
            );

            assert.ok(
                scriptUrl.includes(`/${EXPECTED_TAG}/`),
                `Script-path in ${modFile} must reference pinned tag ${EXPECTED_TAG}: ${scriptUrl}`
            );

            const relativePath = scriptUrl.split(`/${EXPECTED_TAG}/`)[1];
            assert.ok(relativePath, `URL must have valid relative path: ${scriptUrl}`);

            const localTarget = path.join(__dirname, "..", relativePath);
            assert.ok(
                fs.existsSync(localTarget),
                `Referenced script must exist locally at ${localTarget}`
            );
        }

        assert.ok(foundScripts > 0, `Module ${modFile} must declare at least one script`);
    }
});

test("Security Boundary - MITM strictly constrained, no wildcards, no UDP blocking without evidence", () => {
    for (const modFile of moduleFiles) {
        const filePath = path.join(__dirname, "..", "modules", modFile);
        const content = fs.readFileSync(filePath, "utf-8");

        // No global wildcard
        assert.ok(!content.includes("hostname = *"), `Module ${modFile} must not use wildcard MITM`);

        // No revenuecat script or MITM
        assert.ok(!content.includes("locket_revenuecat.js"), `Module ${modFile} must not reference revenuecat script`);
        assert.ok(!content.includes("api.revenuecat.com"), `Module ${modFile} must not MITM revenuecat`);
    }

    // Diagnostic module must NOT block UDP/QUIC (preserves natural OS networking)
    const diagPath = path.join(__dirname, "..", "modules", "LocketEnhanced-Diagnostic.sgmodule");
    const diagContent = fs.readFileSync(diagPath, "utf-8");
    assert.ok(!diagContent.includes("REJECT"), "Diagnostic module must NOT block UDP/QUIC");
});

test("Diagnostic Logger - Full Request & Response Passive Handling without mutation", () => {
    const { extractSafeMetadata, handleDiagnostic } = require("../scripts/utils/locket_diagnostic");

    // 1. Test Request Event
    const mockReq = {
        url: "https://api.locketcamera.com/fetchUserV2?token=secret123",
        method: "GET",
        headers: {
            "Authorization": "Bearer secret_token",
            "Cookie": "uid=123"
        }
    };
    const reqMeta = extractSafeMetadata(mockReq, null);
    assert.strictEqual(reqMeta.eventType, "REQUEST");
    assert.strictEqual(reqMeta.host, "api.locketcamera.com");
    assert.strictEqual(reqMeta.path, "/fetchUserV2");
    assert.ok(!reqMeta.path.includes("secret123"));

    // 2. Test Response Event
    const mockRes = {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: '{"user":"test"}'
    };
    const resMeta = extractSafeMetadata(mockReq, mockRes);
    assert.strictEqual(resMeta.eventType, "RESPONSE");
    assert.strictEqual(resMeta.statusCode, 200);
    assert.strictEqual(resMeta.contentType, "application/json");
    assert.strictEqual(resMeta.bodySize, 15);

    // 3. Test handleDiagnostic returns strictly empty object (zero mutation)
    global.$request = mockReq;
    global.$response = mockRes;
    const handled = handleDiagnostic();
    assert.deepStrictEqual(handled, {}, "Diagnostic handler must return empty object (zero mutation)");
    delete global.$request;
    delete global.$response;
});
