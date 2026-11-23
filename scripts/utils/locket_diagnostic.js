/**
 * Locket Enhanced - Passive Diagnostic Logger
 * Version: 0.1.5-beta
 * 
 * Passively observes network events across Locket and Firebase endpoints.
 * Strict Guarantees:
 * - 100% Non-mutating: NEVER modifies any request, header, or response body.
 * - Zero PII: NEVER records auth tokens, cookies, sensitive query params, or body content.
 * - Non-blocking: Immediately invokes $done({}) to preserve HTTP/2 streams and socket speed.
 */

function extractSafeMetadata(req, res) {
    var isResponse = typeof res !== "undefined" && res !== null;
    var target = isResponse ? (typeof req !== "undefined" && req ? req : {}) : (req || {});

    var url = target.url || "";
    var method = target.method || "GET";
    var host = "";
    var path = "";

    try {
        var match = url.match(/^https?:\/\/([^/:]+)(?::\d+)?(\/[^?#]*)?/i);
        if (match) {
            host = match[1] || "";
            path = match[2] || "/";
        } else {
            path = url.split("?")[0] || "/";
        }
    } catch (e) {
        path = "/unknown_path";
    }

    var result = {
        valid: true,
        eventType: isResponse ? "RESPONSE" : "REQUEST",
        timestamp: new Date().toISOString(),
        host: host.toLowerCase(),
        method: String(method).toUpperCase(),
        path: path
    };

    if (isResponse) {
        result.statusCode = res.status || 200;
        var headers = res.headers || {};
        result.contentType = headers["content-type"] || headers["Content-Type"] || "unknown";
        result.bodySize = (res.body && typeof res.body === "string") ? res.body.length : 0;
    }

    return result;
}

function handleDiagnostic() {
    var req = (typeof $request !== "undefined" && $request) ? $request : null;
    var res = (typeof $response !== "undefined" && $response) ? $response : null;

    if (!req && !res) {
        return {};
    }

    try {
        var meta = extractSafeMetadata(req, res);
        if (meta.valid) {
            if (meta.eventType === "RESPONSE") {
                console.log("[LocketDiag] " + meta.timestamp + " RES " + meta.statusCode + " " + meta.method + " " + meta.host + meta.path + " (" + meta.bodySize + "B, " + meta.contentType + ")");
            } else {
                console.log("[LocketDiag] " + meta.timestamp + " REQ " + meta.method + " " + meta.host + meta.path);
            }
        }
    } catch (e) {
        // Fail silent to never interrupt network traffic
    }

    // Always return empty object to guarantee zero mutation
    return {};
}

// Export for Node.js unit tests
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        extractSafeMetadata: extractSafeMetadata,
        handleDiagnostic: handleDiagnostic
    };
}

// Execution runtime inside Shadowrocket
if (typeof $request !== "undefined" || typeof $response !== "undefined") {
    try {
        $done(handleDiagnostic());
    } catch (e) {
        $done({});
    }
}
