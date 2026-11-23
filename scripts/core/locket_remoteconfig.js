/**
 * Locket Enhanced - Firebase Remote Config Feature Flag Engine
 * Modifies client-side Remote Config entries to unlock:
 * - 60s Extended Video Recording
 * - Video Sound & Audio Recording Stream (High Priority)
 * - Video Upload from Camera Roll toggle
 * - Extended Caption limit (500 chars)
 * - Theme & Widget Customization flags
 */

var DEFAULT_CONFIG_OVERRIDES = {
    // Extended Video Recording
    "video_max_duration_seconds": "60",
    "video_max_duration_ms": "60000",
    "can_record_long_video": "true",
    "max_video_length_seconds": "60",

    // Video With Sound (Priority Feature)
    "video_audio_enabled": "true",
    "enable_video_sound": "true",
    "record_audio_with_video": "true",

    // Camera Roll Video Upload
    "can_upload_video": "true",
    "enable_video_upload": "true",
    "allow_video_picker": "true",

    // Caption Enhancements
    "caption_character_limit": "500",
    "caption_max_lines": "5",
    "enable_multiline_caption": "true",

    // Visual Customizations
    "themes_enabled": "true",
    "widget_customization_enabled": "true",
    "can_use_custom_icons": "true"
};

function parseScriptArgument(argString) {
    var params = {};
    if (!argString || typeof argString !== "string") return params;
    var pairs = argString.split("&");
    for (var i = 0; i < pairs.length; i++) {
        var parts = pairs[i].split("=");
        if (parts.length === 2) {
            params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
        }
    }
    return params;
}

function transformRemoteConfigResponse(bodyString, options) {
    options = options || {};
    if (!bodyString || typeof bodyString !== "string") {
        return { modified: false, body: bodyString };
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

    if (!data || typeof data !== "object") {
        return { modified: false, body: bodyString, reason: "invalid_root_type" };
    }

    // Remote Config returns { entries: { ... }, state: "UPDATE" }
    data.entries = data.entries || {};

    var overrides = Object.assign({}, DEFAULT_CONFIG_OVERRIDES);

    // Apply custom overrides if passed via options/argument
    if (options.videoDuration) {
        var durationStr = String(options.videoDuration);
        overrides["video_max_duration_seconds"] = durationStr;
        overrides["video_max_duration_ms"] = String(Number(options.videoDuration) * 1000);
        overrides["max_video_length_seconds"] = durationStr;
    }

    if (options.audioEnabled !== undefined) {
        var audioStr = String(options.audioEnabled);
        overrides["video_audio_enabled"] = audioStr;
        overrides["enable_video_sound"] = audioStr;
    }

    if (options.captionLimit) {
        overrides["caption_character_limit"] = String(options.captionLimit);
    }

    var modifiedCount = 0;
    for (var key in overrides) {
        if (Object.prototype.hasOwnProperty.call(overrides, key)) {
            if (data.entries[key] !== overrides[key]) {
                data.entries[key] = overrides[key];
                modifiedCount++;
            }
        }
    }

    return {
        modified: modifiedCount > 0,
        modifiedCount: modifiedCount,
        body: JSON.stringify(data)
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
        audioEnabled: argParams.audio !== undefined ? argParams.audio === "true" : true,
        captionLimit: argParams.captionLimit
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
        transformRemoteConfigResponse: transformRemoteConfigResponse,
        parseScriptArgument: parseScriptArgument,
        handleResponse: handleResponse,
        DEFAULT_CONFIG_OVERRIDES: DEFAULT_CONFIG_OVERRIDES
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
