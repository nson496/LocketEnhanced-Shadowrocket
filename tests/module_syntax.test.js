const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const modules = [
    "LocketEnhanced.sgmodule",
    "LocketEnhanced-Beta.sgmodule",
    "LocketEnhanced-Diagnostic.sgmodule"
];

for (const modName of modules) {
    test(`Module Syntax Validation - ${modName}`, () => {
        const filePath = path.join(__dirname, "..", "modules", modName);
        assert.ok(fs.existsSync(filePath), `File ${modName} must exist`);

        const content = fs.readFileSync(filePath, "utf-8");

        // Validate metadata directives
        assert.ok(content.includes("#!name="), "Module must have #!name");
        assert.ok(content.includes("#!desc="), "Module must have #!desc");
        assert.ok(content.includes("#!system=ios"), "Module must specify iOS system");

        // Validate required functional sections
        assert.ok(content.includes("[Script]"), "Module must contain [Script]");
        assert.ok(content.includes("[MITM]"), "Module must contain [MITM]");

        // Validate MITM %APPEND% directive (prevents clobbering user hosts)
        assert.ok(content.includes("hostname = %APPEND%"), "MITM hostname must use %APPEND%");

        // Validate hostnames present
        assert.ok(content.includes("firebaseremoteconfig.googleapis.com"), "MITM must include firebaseremoteconfig");
        assert.ok(!content.includes("hostname = *"), "MITM must NOT use global wildcard");

        // Validate scripts have required properties
        assert.ok(content.includes("script-path="), "Scripts must have valid script-path");
        assert.ok(content.includes("timeout="), "Scripts must declare timeout");
    });
}
