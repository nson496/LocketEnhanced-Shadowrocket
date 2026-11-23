/**
 * Locket Enhanced - User Profile Badge Injector
 * Injects 'locket_gold' badge into the current user's profile on /fetchUserV2
 * Strictly preserves UID, names, avatars, and session tokens without leakage.
 */

var GOLD_BADGE_NAME = "locket_gold";

function transformProfileResponse(bodyString, options) {
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

    var userObj = null;

    // Pattern 1: data.result.data (Locket v2 standard)
    if (data.result && data.result.data && typeof data.result.data === "object") {
        userObj = data.result.data;
    }
    // Pattern 2: data.data (alternate direct wrap)
    else if (data.data && typeof data.data === "object") {
        userObj = data.data;
    }
    // Pattern 3: direct user profile object
    else if (data.uid) {
        userObj = data;
    }

    if (!userObj) {
        return { modified: false, body: bodyString, reason: "user_object_not_found" };
    }

    // Set Gold badge while keeping all existing fields intact
    if (userObj.badge !== GOLD_BADGE_NAME) {
        userObj.badge = GOLD_BADGE_NAME;
        return {
            modified: true,
            body: JSON.stringify(data)
        };
    }

    return { modified: false, body: bodyString, reason: "badge_already_set" };
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

    var result = transformProfileResponse(rawBody, { safeMode: isSafe });
    if (result.modified) {
        return { body: result.body };
    }
    return {};
}

// Export for Node.js unit tests
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        transformProfileResponse: transformProfileResponse,
        handleResponse: handleResponse,
        GOLD_BADGE_NAME: GOLD_BADGE_NAME
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
