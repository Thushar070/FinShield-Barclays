const API_BASE = "http://127.0.0.1:8000";

function getHeaders() {
    const token = localStorage.getItem("finshield_token");
    const headers = {};
    if (token) {
        // Ensure no whitespace
        headers["Authorization"] = `Bearer ${token.trim()}`;
    }
    return headers;
}

function handleExpiredSession() {
    // Intentionally disabled auto-redirect to prevent loops.
    // The user will see an error message and can choose to logout.
    console.warn("Session expired (401).");
    // localStorage.removeItem("finshield_token"); // Don't even clear it, let user decide.
}

/**
 * Safely extract a renderable error string from any API response.
 */
function extractErrorMessage(data) {
    if (!data) return "Something went wrong";
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
    if (typeof data.detail === "string") return data.detail;

    if (Array.isArray(data.detail)) {
        return data.detail
            .map((e) => {
                if (typeof e === "string") return e;
                if (typeof e === "object" && e !== null) {
                    const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : "";
                    const msg = e.msg || "Invalid value";
                    return field && field !== "__root__" ? `${field}: ${msg}` : msg;
                }
                return String(e);
            })
            .join(". ");
    }

    if (typeof data.detail === "object" && data.detail !== null) {
        return data.detail.msg || data.detail.message || JSON.stringify(data.detail);
    }

    return "Something went wrong";
}

export async function apiPost(endpoint, body) {
    let res;
    try {
        console.log(`POST ${endpoint}`);
        res = await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getHeaders() },
            body: JSON.stringify(body),
        });
    } catch (networkErr) {
        console.error("API Network Error:", networkErr);
        return { success: false, message: "Network error — is the server running?" };
    }

    if (res.status === 401 && !endpoint.startsWith("/auth")) {
        handleExpiredSession();
        return { success: false, message: "Session expired. Please sign in again." };
    }

    let data;
    try {
        data = await res.json();
    } catch (parseErr) {
        return { success: false, message: "Invalid server response" };
    }

    if (!res.ok) {
        return { success: false, message: extractErrorMessage(data) };
    }

    return { success: true, ...data };
}

export async function apiUpload(endpoint, file) {
    let res;
    try {
        console.log(`UPLOAD ${endpoint}`);
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: getHeaders(),
            body: formData,
        });
    } catch (networkErr) {
        return { success: false, message: "Network error — is the server running?" };
    }

    if (res.status === 401) {
        handleExpiredSession();
        return { success: false, message: "Session expired" };
    }

    let data;
    try {
        data = await res.json();
    } catch (parseErr) {
        return { success: false, message: "Invalid server response" };
    }

    if (!res.ok) {
        return { success: false, message: extractErrorMessage(data) };
    }

    return { success: true, ...data };
}

export async function apiGet(endpoint) {
    let res;
    try {
        // console.log(`GET ${endpoint}`);
        res = await fetch(`${API_BASE}${endpoint}`, {
            headers: getHeaders(),
        });
    } catch (networkErr) {
        return { success: false, message: "Network error" };
    }

    if (res.status === 401) {
        handleExpiredSession();
        return { success: false, message: "Session expired" };
    }

    let data;
    try {
        data = await res.json();
    } catch (parseErr) {
        return { success: false, message: "Invalid server response" };
    }

    if (!res.ok) {
        return { success: false, message: extractErrorMessage(data) };
    }

    return { success: true, ...data };
}

export function getExportUrl(scanType) {
    let url = `${API_BASE}/reports/export?`;
    if (scanType && scanType !== "all") url += `scan_type=${scanType}&`;
    return url;
}

export function getPdfUrl(scanId) {
    return `${API_BASE}/reports/pdf/${scanId}`;
}
