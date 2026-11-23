const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const {
    ALLOWED_FIELDS,
    DEFAULT_CONFIG_OVERRIDES,
    parseScriptArgument,
    transformRemoteConfigResponse
} = require("../scripts/core/locket_remoteconfig");

const fixturePath = path.join(__dirname, "..", "fixtures", "remoteconfig_original.json");
const sampleJson = fs.readFileSync(fixturePath, "utf-8");

test("Remote Config - overrides allowlisted fields with exact string types", () => {
    const result = transformRemoteConfigResponse(sampleJson);
    assert.strictEqual(result.modified, true);

    const parsed = JSON.parse(result.body);
    // Strict allowlist checks
    assert.strictEqual(parsed.entries.video_max_duration_seconds, "60");
    assert.strictEqual(parsed.entries.video_audio_enabled, "true");
    assert.strictEqual(parsed.entries.caption_character_limit, "500");
    assert.strictEqual(parsed.entries.themes_enabled, "true");

    // Native schema support if present
    if (parsed.entries.camera) {
        const cam = JSON.parse(parsed.entries.camera);
        assert.strictEqual(cam.max_duration, 60);
    }

    // Must NOT contain invented keys
    assert.strictEqual(parsed.entries.video_max_duration_ms, undefined);
    assert.strictEqual(parsed.entries.can_record_long_video, undefined);
    assert.strictEqual(parsed.entries.enable_video_sound, undefined);
    assert.strictEqual(parsed.entries.allow_video_picker, undefined);
    assert.strictEqual(parsed.entries.caption_max_lines, undefined);

    // Existing metadata strictly preserved
    assert.strictEqual(parsed.templateVersion, "100");
    assert.strictEqual(parsed.state, "UPDATE");
});

test("Remote Config - supports argument overrides for 5s, 15s, 30s, 45s, 60s", () => {
    const durations = [5, 15, 30, 45, 60];
    for (const d of durations) {
        const res = transformRemoteConfigResponse(sampleJson, { videoDuration: d });
        const parsed = JSON.parse(res.body);
        assert.strictEqual(parsed.entries.video_max_duration_seconds, String(d));
    }
});

test("Remote Config - supports toggling audio and themes flags", () => {
    const res = transformRemoteConfigResponse(sampleJson, {
        audioEnabled: false,
        themesEnabled: false
    });
    const parsed = JSON.parse(res.body);
    assert.strictEqual(parsed.entries.video_audio_enabled, "false");
    assert.strictEqual(parsed.entries.themes_enabled, "false");
});

test("Remote Config - argument parsing parses key-value pairs safely", () => {
    const parsed = parseScriptArgument("videoDuration=45&audio=true&captionLimit=350&themes=false&safeMode=true");
    assert.strictEqual(parsed.videoDuration, "45");
    assert.strictEqual(parsed.audio, "true");
    assert.strictEqual(parsed.captionLimit, "350");
    assert.strictEqual(parsed.themes, "false");
    assert.strictEqual(parsed.safeMode, "true");
});

test("Remote Config - Safe Mode returns original response without modification", () => {
    const result = transformRemoteConfigResponse(sampleJson, { safeMode: true });
    assert.strictEqual(result.modified, false);
    assert.strictEqual(result.reason, "safe_mode_active");
    assert.strictEqual(result.body, sampleJson);
});

test("Remote Config - handles corrupt or broken JSON gracefully", () => {
    const broken = "<html><head><title>502 Bad Gateway</title></head></html>";
    const result = transformRemoteConfigResponse(broken);
    assert.strictEqual(result.modified, false);
    assert.strictEqual(result.error, "json_parse_error");
    assert.strictEqual(result.body, broken);
});

test("Remote Config - handles missing or invalid 'entries' schema without throwing", () => {
    const schemaWithoutEntries = JSON.stringify({ state: "NO_CHANGE", version: 12 });
    const result = transformRemoteConfigResponse(schemaWithoutEntries);
    assert.strictEqual(result.modified, false);
    assert.strictEqual(result.reason, "entries_schema_mismatch");
    assert.strictEqual(result.body, schemaWithoutEntries);
});

test("Remote Config - handles empty or null input gracefully", () => {
    const resEmpty = transformRemoteConfigResponse("");
    assert.strictEqual(resEmpty.modified, false);

    const resNull = transformRemoteConfigResponse(null);
    assert.strictEqual(resNull.modified, false);
});

test("Remote Config - modifies native Locket schema with feature_gates, camera, and camera_roll", () => {
    const nativePayload = JSON.stringify({
        state: "NO_CHANGE",
        templateVersion: "123",
        entries: {
            feature_gates: JSON.stringify({ longer_video: "disabled", camera_roll: "disabled" }),
            camera: JSON.stringify({ max_duration: 5.0, gold_max_duration: 5.0 }),
            camera_roll: JSON.stringify({ max_duration: 5.0 }),
            captions_enabled: "false"
        }
    });

    const result = transformRemoteConfigResponse(nativePayload, { videoDuration: 45 });
    assert.strictEqual(result.modified, true);

    const parsed = JSON.parse(result.body);
    assert.strictEqual(parsed.state, "UPDATE");

    const fg = JSON.parse(parsed.entries.feature_gates);
    assert.strictEqual(fg.longer_video, "enabled");
    assert.strictEqual(fg.camera_roll, "enabled");
    assert.strictEqual(fg.long_captions, "enabled");

    const cam = JSON.parse(parsed.entries.camera);
    assert.strictEqual(cam.max_duration, 45);
    assert.strictEqual(cam.gold_max_duration, 45);
    assert.strictEqual(cam.sound_enabled, true);

    const cr = JSON.parse(parsed.entries.camera_roll);
    assert.strictEqual(cr.max_duration, 45);
    assert.strictEqual(cr.gold_max_duration, 45);

    assert.strictEqual(parsed.entries.captions_enabled, "true");
    assert.strictEqual(parsed.entries.video_max_duration_seconds, "45");
});
