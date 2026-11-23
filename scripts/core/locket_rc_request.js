/**
 * Locket Enhanced - HTTP Request Header Cleaner
 * Strips conditional cache headers (ETag, If-None-Match) from Firebase Remote Config
 * to ensure servers return full HTTP 200 responses with body instead of empty HTTP 304.
 */

var DROP_HEADER_NAMES = [
    "if-none-match",
    "if-modified-since",
    "x-goog-if-none-match"
];

function processRequestHeaders(headers) {
    if (!headers || typeof headers !== "object") {
        return headers || {};
    }

    var cleaned = {};
    for (var key in headers) {
        if (!Object.prototype.hasOwnProperty.call(headers, key)) continue;
        var lowerKey = key.toLowerCase();
        if (DROP_HEADER_NAMES.indexOf(lowerKey) === -1) {
            cleaned[key] = headers[key];
        }
    }
    return cleaned;
}

function handleRequest() {
    var rawHeaders = (typeof $request !== "undefined" && $request && $request.headers)
        ? $request.headers
        : null;

    if (!rawHeaders) {
        return {};
    }

    var cleanedHeaders = processRequestHeaders(rawHeaders);
    return { headers: cleanedHeaders };
}

// Export for Node.js unit tests
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        DROP_HEADER_NAMES: DROP_HEADER_NAMES,
        processRequestHeaders: processRequestHeaders,
        handleRequest: handleRequest
    };
}

// Execution runtime inside Shadowrocket
if (typeof $request !== "undefined" && typeof $response === "undefined") {
    try {
        $done(handleRequest());
    } catch (e) {
        $done({});
    }
}
