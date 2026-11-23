/**
 * Locket Enhanced - Firebase Remote Config Feature Flag Engine
 * Version: 0.1.6-beta
 * 
 * Modifies client-side Remote Config entries to configure:
 * - Extended Video Recording (camera.max_duration, camera_roll.max_duration, video_max_duration_seconds)
 * - Video Sound Pipeline (video_audio_enabled, camera.sound_enabled, camera.microphone)
 * - Extended Caption limit (caption_character_limit, feature_gates.long_captions, captions_enabled)
 * - Theme Customization (themes_enabled, feature_gates.camera_theme, feature_gates.app_icon_picker)
 * - Feature Gates (longer_video, camera_roll, custom_widget_frames)
 * 
 * Strictly adheres to verified allowlisted fields and string type requirements.
 * Rejects invented keys to ensure clean schema and client stability.
 */

var ALLOWED_FIELDS = [
    "video_max_duration_seconds",
    "video_audio_enabled",
    "caption_character_limit",
    "themes_enabled"
];

var DEFAULT_CONFIG_OVERRIDES = {
    "video_max_duration_seconds": "60",
    "video_audio_enabled": "true",
    "caption_character_limit": "500",
    "themes_enabled": "true"
};

function parseScriptArgument(argString) {
    var params = {};
    if (!argString || typeof argString !== "string") return params;
    var pairs = argString.split("&");
    for (var i = 0; i < pairs.length; i++) {
        var parts = pairs[i].split("=");
        if (parts.length === 2) {
            params[decodeURIComponent(parts[0]).trim()] = decodeURIComponent(parts[1]).trim();
        }
    }
    return params;
}

function safeJsonParse(str, fallback) {
    if (!str || typeof str !== "string") return fallback;
    try {
        var parsed = JSON.parse(str);
        return (parsed && typeof parsed === "object") ? parsed : fallback;
    } catch (e) {
        return fallback;
    }
}

function transformRemoteConfigResponse(bodyString, options) {
    options = options || {};
    if (!bodyString || typeof bodyString !== "string") {
        return { modified: false, body: bodyString, reason: "empty_or_invalid_body" };
    }

    if (options.safeMode === true) {
        return { modified: false, body: bodyString, reason: "safe_mode_active" };
    }

    var data;
    try {
        data = JSON.parse(bodyString);
    } catch (e) {
        return { modified: false, body: bodyString, error: "json_parse_error" };
    }

    // Remote Config response schema MUST be an object with an entries object
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return { modified: false, body: bodyString, reason: "invalid_root_type" };
    }

    if (!data.entries || typeof data.entries !== "object" || Array.isArray(data.entries)) {
        // Unknown or unexpected schema -> keep original response unmodified
        return { modified: false, body: bodyString, reason: "entries_schema_mismatch" };
    }

    // Ensure state is UPDATE to force client-side SDK cache invalidation
    if (data.state !== "UPDATE") {
        data.state = "UPDATE";
    }

    // Clone default overrides
    var overrides = {};
    for (var i = 0; i < ALLOWED_FIELDS.length; i++) {
        var field = ALLOWED_FIELDS[i];
        overrides[field] = DEFAULT_CONFIG_OVERRIDES[field];
    }

    var videoSec = 60.0;
    // Apply custom parameters if provided via arguments
    if (options.videoDuration !== undefined && options.videoDuration !== null && options.videoDuration !== "") {
        var durationNum = parseInt(options.videoDuration, 10);
        if (!isNaN(durationNum) && durationNum > 0 && durationNum <= 300) {
            overrides["video_max_duration_seconds"] = String(durationNum);
            videoSec = Number(durationNum);
        }
    }

    var isAudio = true;
    if (options.audioEnabled !== undefined && options.audioEnabled !== null) {
        isAudio = options.audioEnabled === true || options.audioEnabled === "true";
        overrides["video_audio_enabled"] = isAudio ? "true" : "false";
    }

    if (options.captionLimit !== undefined && options.captionLimit !== null && options.captionLimit !== "") {
        var limitNum = parseInt(options.captionLimit, 10);
        if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 2000) {
            overrides["caption_character_limit"] = String(limitNum);
        }
    }

    var isThemes = true;
    if (options.themesEnabled !== undefined && options.themesEnabled !== null) {
        isThemes = options.themesEnabled === true || options.themesEnabled === "true";
        overrides["themes_enabled"] = isThemes ? "true" : "false";
    }

    var modifiedCount = 0;

    // 1. Update allowlisted flat keys
    for (var j = 0; j < ALLOWED_FIELDS.length; j++) {
        var key = ALLOWED_FIELDS[j];
        var targetVal = String(overrides[key]);
        if (data.entries[key] !== targetVal) {
            data.entries[key] = targetVal;
            modifiedCount++;
        }
    }

    // 2. Update native feature_gates if present or needed
    if (data.entries.feature_gates !== undefined) {
        var fgObj = safeJsonParse(data.entries.feature_gates, {});
        var fgChanged = false;
        var fgKeysToEnable = ["longer_video", "longer_videos", "video_recording", "long_captions", "camera_roll", "camera_roll_video"];
        if (isThemes) {
            fgKeysToEnable.push("camera_theme", "app_icon_picker", "custom_widget_frames");
        }
        for (var k = 0; k < fgKeysToEnable.length; k++) {
            var fgK = fgKeysToEnable[k];
            if (fgObj[fgK] !== "enabled") {
                fgObj[fgK] = "enabled";
                fgChanged = true;
            }
        }
        if (fgChanged) {
            data.entries.feature_gates = JSON.stringify(fgObj);
            modifiedCount++;
        }
    }

    // 3. Update native camera config if present
    if (data.entries.camera !== undefined) {
        var camObj = safeJsonParse(data.entries.camera, {});
        var camChanged = false;
        if (camObj.max_duration !== videoSec) {
            camObj.max_duration = videoSec;
            camChanged = true;
        }
        if (camObj.gold_max_duration !== videoSec) {
            camObj.gold_max_duration = videoSec;
            camChanged = true;
        }
        if (camObj.video_max_duration !== videoSec) {
            camObj.video_max_duration = videoSec;
            camChanged = true;
        }
        if (isAudio && camObj.sound_enabled !== true) {
            camObj.sound_enabled = true;
            camObj.microphone = true;
            camChanged = true;
        }
        if (camChanged) {
            data.entries.camera = JSON.stringify(camObj);
            modifiedCount++;
        }
    }

    // 4. Update native camera_roll config if present
    if (data.entries.camera_roll !== undefined) {
        var crObj = safeJsonParse(data.entries.camera_roll, {});
        var crChanged = false;
        if (crObj.max_duration !== videoSec) {
            crObj.max_duration = videoSec;
            crChanged = true;
        }
        if (crObj.gold_max_duration !== videoSec) {
            crObj.gold_max_duration = videoSec;
            crChanged = true;
        }
        if (crChanged) {
            data.entries.camera_roll = JSON.stringify(crObj);
            modifiedCount++;
        }
    }

    // 5. Update captions_enabled if present
    if (data.entries.captions_enabled !== undefined && data.entries.captions_enabled !== "true") {
        data.entries.captions_enabled = "true";
        modifiedCount++;
    }

    return {
        modified: modifiedCount > 0,
        modifiedCount: modifiedCount,
        body: modifiedCount > 0 ? JSON.stringify(data) : bodyString
    };
}

function handleResponse() {
    var rawBody = (typeof $response !== "undefined" && $response && $response.body)
        ? $response.body
        : null;

    if (!rawBody) {
        return {};
    }

    var isSafe = false;
    try {
        if (typeof $persistentStore !== "undefined" && $persistentStore.read) {
            isSafe = $persistentStore.read("LocketEnhanced_SafeMode") === "true";
        }
    } catch (e) {}

    var arg = (typeof $argument !== "undefined" && $argument) ? String($argument) : "";
    var argParams = parseScriptArgument(arg);

    var options = {
        safeMode: isSafe || argParams.safeMode === "true",
        videoDuration: argParams.videoDuration,
        audioEnabled: argParams.audio !== undefined ? argParams.audio : undefined,
        captionLimit: argParams.captionLimit,
        themesEnabled: argParams.themes !== undefined ? argParams.themes : undefined
    };

    var result = transformRemoteConfigResponse(rawBody, options);
    if (result.modified) {
        return { body: result.body };
    }
    return {};
}

// Export for Node.js unit tests
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        ALLOWED_FIELDS: ALLOWED_FIELDS,
        DEFAULT_CONFIG_OVERRIDES: DEFAULT_CONFIG_OVERRIDES,
        parseScriptArgument: parseScriptArgument,
        safeJsonParse: safeJsonParse,
        transformRemoteConfigResponse: transformRemoteConfigResponse,
        handleResponse: handleResponse
    };
}

// Execution runtime inside Shadowrocket
if (typeof $response !== "undefined") {
    try {
        $done(handleResponse());
    } catch (e) {
        $done({});
    }
}
