const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { transformProfileResponse, GOLD_BADGE_NAME } = require("../scripts/features/locket_profile_badge");

const fixturePath = path.join(__dirname, "..", "fixtures", "profile_original.json");
const sampleJson = fs.readFileSync(fixturePath, "utf-8");

test("Profile Badge - injects locket_gold badge into user profile", () => {
    const result = transformProfileResponse(sampleJson);
    assert.strictEqual(result.modified, true);

    const parsed = JSON.parse(result.body);
    const user = parsed.result.data;
    assert.strictEqual(user.badge, GOLD_BADGE_NAME);
    // Preserves all existing fields
    assert.strictEqual(user.uid, "sanitized_user_id_001");
    assert.strictEqual(user.first_name, "Test");
    assert.strictEqual(user.username, "testuser");
});

test("Profile Badge - Safe Mode leaves profile unchanged", () => {
    const result = transformProfileResponse(sampleJson, { safeMode: true });
    assert.strictEqual(result.modified, false);
    assert.strictEqual(result.reason, "safe_mode_active");
});

test("Profile Badge - avoids redundant writes if badge is already set", () => {
    const alreadyGold = {
        result: {
            data: {
                uid: "user_123",
                badge: "locket_gold"
            }
        }
    };
    const result = transformProfileResponse(JSON.stringify(alreadyGold));
    assert.strictEqual(result.modified, false);
    assert.strictEqual(result.reason, "badge_already_set");
});
