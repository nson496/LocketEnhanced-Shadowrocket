/**
 * Safe Store & Diagnostics Utility
 * Handles persistent storage access, safe logging, and PII protection.
 * Strictly avoids logging tokens, user IDs, or private payloads.
 */

var SAFE_STORE_PREFIX = "LocketEnhanced_";

function isSafeModeActive() {
    try {
        if (typeof $persistentStore !== "undefined" && $persistentStore.read) {
            var val = $persistentStore.read(SAFE_STORE_PREFIX + "SafeMode");
            return val === "true" || val === true;
        }
    } catch (e) {}
    return false;
}

function safeRead(key, fallback) {
    try {
        if (typeof $persistentStore !== "undefined" && $persistentStore.read) {
            var val = $persistentStore.read(SAFE_STORE_PREFIX + key);
            return val !== null && val !== undefined ? val : fallback;
        }
    } catch (e) {}
    return fallback;
}

function safeWrite(key, value) {
    try {
        if (typeof $persistentStore !== "undefined" && $persistentStore.write) {
            return $persistentStore.write(String(value), SAFE_STORE_PREFIX + key);
        }
    } catch (e) {}
    return false;
}

function safeLog(message) {
    try {
        var sanitized = String(message)
            .replace(/Bearer\s+[A-Za-z0-9\-_.]+/gi, "Bearer [REDACTED]")
            .replace(/AIzaSy[A-Za-z0-9\-_]{33}/gi, "[API_KEY_REDACTED]")
            .replace(/"token":\s*"[^"]+"/gi, '"token":"[REDACTED]"');
        console.log("[LocketEnhanced] " + sanitized);
    } catch (e) {}
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        isSafeModeActive: isSafeModeActive,
        safeRead: safeRead,
        safeWrite: safeWrite,
        safeLog: safeLog
    };
}
