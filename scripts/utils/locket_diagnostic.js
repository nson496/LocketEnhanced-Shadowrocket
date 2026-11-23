/**
 * Locket Enhanced - Safe Diagnostic Logger
 * Version: 0.1.4-beta
 * 
 * Inspects network events on Firebase Remote Config and Realtime endpoints.
 * Strictly complies with Zero PII policy:
 * - Records ONLY metadata: Timestamp, Host, Method, Path.
 * - Never logs sensitive headers, credentials, request bodies, or response bodies.
 * - Non-blocking: Returns $done({}) immediately without delaying long-lived HTTP/2 streams.
 */

function extractSafeMetadata(req) {
    if (!req || typeof req !== "object") {
        return { valid: false };
    }

    var url = req.url || "";
    var method = req.method || "UNKNOWN";
    var host = "";
    var path = "";

    try {
        var match = url.match(/^https?:\/\/([^/:]+)(?::\d+)?(\/[^?#]*)?/i);
        if (match) {
            host = match[1] || "";
            path = match[2] || "/";
        } else {
            path = url.split("?")[0];
        }
    } catch (e) {
        path = "/unknown_path";
    }

    return {
        valid: true,
        timestamp: new Date().toISOString(),
        host: host.toLowerCase(),
        method: String(method).toUpperCase(),
        path: path
    };
}

function handleDiagnosticRequest() {
    var req = (typeof $request !== "undefined" && $request) ? $request : null;
    if (!req) {
        return {};
    }

    try {
        var meta = extractSafeMetadata(req);
        if (meta.valid) {
            // Safe structured console output - strictly ZERO PII
            var logMessage = "[LocketDiag] " + meta.timestamp + " " + meta.method + " " + meta.host + meta.path;
            console.log(logMessage);
        }
    } catch (e) {
        // Fail silent to never interrupt network traffic
    }

    return {};
}

// Export for Node.js unit tests
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        extractSafeMetadata: extractSafeMetadata,
        handleDiagnosticRequest: handleDiagnosticRequest
    };
}

// Execution runtime inside Shadowrocket
if (typeof $request !== "undefined" && typeof $response === "undefined") {
    try {
        $done(handleDiagnosticRequest());
    } catch (e) {
        $done({});
    }
}
