/**
 * Locket Enhanced - Firebase Remote Config Feature Flag Engine
 * Version: 0.1.2-beta
 * 
 * Modifies client-side Remote Config entries to configure:
 * - Extended Video Recording (video_max_duration_seconds)
 * - Video Sound Pipeline (video_audio_enabled)
 * - Extended Caption limit (caption_character_limit)
 * - Theme Customization (themes_enabled)
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

    // Clone default overrides
    var overrides = {};
    for (var i = 0; i < ALLOWED_FIELDS.length; i++) {
        var field = ALLOWED_FIELDS[i];
        overrides[field] = DEFAULT_CONFIG_OVERRIDES[field];
    }

    // Apply custom parameters if provided via arguments
    if (options.videoDuration !== undefined && options.videoDuration !== null && options.videoDuration !== "") {
        var durationNum = parseInt(options.videoDuration, 10);
        if (!isNaN(durationNum) && durationNum > 0 && durationNum <= 300) {
            overrides["video_max_duration_seconds"] = String(durationNum);
        }
    }

    if (options.audioEnabled !== undefined && options.audioEnabled !== null) {
        var isAudio = options.audioEnabled === true || options.audioEnabled === "true";
        overrides["video_audio_enabled"] = isAudio ? "true" : "false";
    }

    if (options.captionLimit !== undefined && options.captionLimit !== null && options.captionLimit !== "") {
        var limitNum = parseInt(options.captionLimit, 10);
        if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 2000) {
            overrides["caption_character_limit"] = String(limitNum);
        }
    }

    if (options.themesEnabled !== undefined && options.themesEnabled !== null) {
        var isThemes = options.themesEnabled === true || options.themesEnabled === "true";
        overrides["themes_enabled"] = isThemes ? "true" : "false";
    }

    var modifiedCount = 0;
    for (var j = 0; j < ALLOWED_FIELDS.length; j++) {
        var key = ALLOWED_FIELDS[j];
        var targetVal = String(overrides[key]);
        if (data.entries[key] !== targetVal) {
            data.entries[key] = targetVal;
            modifiedCount++;
        }
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