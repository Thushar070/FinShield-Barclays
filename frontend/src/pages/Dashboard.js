import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../utils/auth";
import { apiPost, apiUpload, apiGet } from "../utils/api";
import Sidebar from "../components/Sidebar";
import StatsCards from "../components/StatsCards";
import RiskGauge from "../components/RiskGauge";
import ExplanationPanel from "../components/ExplanationPanel";
import ActivityFeed from "../components/ActivityFeed";
import DashboardCharts from "../components/DashboardCharts";
import UserProfile from "../components/UserProfile";
import SystemStatus from "../components/SystemStatus";
import OnboardingTour from "../components/OnboardingTour";
import HowItWorksModal from "../components/HowItWorksModal";
import ScanExamples from "../components/ScanExamples";
import { FileText, Image, Mic, Video, Upload, Send, AlertTriangle, RefreshCw, HelpCircle, File, Lock, CheckCircle } from "lucide-react";

function safeString(val) {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (typeof val === "object") return val.message || val.msg || JSON.stringify(val);
    return String(val);
}

function formatDate(isoString) {
    if (!isoString) return "—";
    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
            hour12: false
        }).format(new Date(isoString));
    } catch (e) { return isoString; }
}

const SEVERITY_TIPS = {
    LOW: "Risk Score < 30% (Generally Safe)",
    MEDIUM: "Risk Score 30-60% (Exercise Caution)",
    HIGH: "Risk Score 60-80% (Likely Malicious)",
    CRITICAL: "Risk Score > 80% (Dangerous Threat)",
    // Capability for lowercase fallback
    low: "Risk Score < 30% (Generally Safe)",
    medium: "Risk Score 30-60% (Exercise Caution)",
    high: "Risk Score 60-80% (Likely Malicious)",
    critical: "Risk Score > 80% (Dangerous Threat)",
};

const SCAN_MODES = [
    { id: "text", label: "Text Analysis", icon: FileText, desc: "Analyze emails, SMS, or documents for phishing cues." },
    { id: "image", label: "Image Analysis", icon: Image, desc: "Scan screenshots or logos for brand impersonation." },
    { id: "audio", label: "Audio Analysis", icon: Mic, desc: "Detect voice scams or deepfake audio patterns." },
    { id: "video", label: "Video Analysis", icon: Video, desc: "Identify deepfake faces or manipulated video content." },
];

const DEFAULT_STATS = {
    total_scans: 0,
    average_risk_score: 0,
    severity_breakdown: { critical: 0, high: 0, medium: 0, low: 0 },
    scans_by_type: {},
    recent_trend: []
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [stats, setStats] = useState(null); // Null triggers skeleton
    const [history, setHistory] = useState([]);
    const [historyMeta, setHistoryMeta] = useState({});
    const [filterType, setFilterType] = useState("all");
    const [showHelp, setShowHelp] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            const data = await apiGet("/history/stats");
            if (data.success !== false) {
                setStats(data);
            } else {
                console.warn("Failed to load stats:", data.message);
                setStats(DEFAULT_STATS);
            }
        } catch (e) {
            console.error("Stats fetch error:", e);
            setStats(DEFAULT_STATS);
        }
    }, []);

    const loadHistory = useCallback(async (page = 1, type = "all") => {
        try {
            let url = `/history/?page=${page}&per_page=15`;
            if (type && type !== "all") url += `&scan_type=${type}`;
            const data = await apiGet(url);

            if (data.success !== false) {
                setHistory(Array.isArray(data.scans) ? data.scans : []);
                setHistoryMeta(data);
            } else {
                setHistory([]);
            }
        } catch (e) { console.error("History fetch error:", e); setHistory([]); }
    }, []);

    // Initial load
    useEffect(() => {
        loadStats();
        loadHistory(1, "all");
    }, [loadStats, loadHistory]);

    const handleFilterChange = (type) => {
        setFilterType(type);
        loadHistory(1, type);
    };

    const handleRefresh = async () => {
        setLoading(true);
        await Promise.all([loadStats(), loadHistory(1, filterType)]);
        setLoading(false);
        showToast("Data refreshed", "success");
    };

    const handleExampleSelect = (val) => {
        setText(val);
        setActiveTab("scan");
    };

    function showToast(msg, type = "success") {
        setToast({ msg: safeString(msg), type });
        setTimeout(() => setToast(null), 3500);
    }

    function switchTab(tab) {
        setActiveTab(tab);
        setResult(null);
        setError("");
        setFile(null);
        if (tab === "overview") loadStats();
        if (tab === "history") loadHistory(1, filterType);
    }

    async function analyzeText() {
        if (!text.trim()) return;
        if (loading) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const data = await apiPost("/analyze", { text });

            if (data.success === false) {
                setError(safeString(data.message));
                showToast("Analysis failed: " + safeString(data.message), "error");
            } else {
                setResult(data);
                showToast("Scan complete", "success");
                setFilterType("all");
                loadStats();
                loadHistory(1, "all");
            }
        } catch (e) {
            setError("Analysis failed due to network error.");
            showToast("Network error occurred", "error");
        } finally {
            setLoading(false);
        }
    }

    async function analyzeFile(endpoint) {
        if (!file) return;
        if (loading) return;

        setLoading(true);
        setError("");
        setResult(null);
        try {
            const data = await apiUpload(endpoint, file);

            if (data.success === false) {
                setError(safeString(data.message));
                showToast("Analysis failed: " + safeString(data.message), "error");
            } else {
                setResult(data);
                showToast("Scan complete", "success");
                setFilterType("all");
                loadStats();
                loadHistory(1, "all");
            }
        } catch (e) {
            setError("Analysis failed. Please try again.");
            showToast("System error occurred", "error");
        } finally {
            setLoading(false);
        }
    }

    // --- Validation Logic ---
    const isImage = file && file.type.startsWith("image/");
    const isAudio = file && file.type.startsWith("audio/");
    const isVideo = file && file.type.startsWith("video/");

    return (
        <div className="app-layout">
            <OnboardingTour />
            {showHelp && <HowItWorksModal onClose={() => setShowHelp(false)} />}

            <Sidebar activeTab={activeTab} onTabChange={switchTab} user={user} onLogout={logout} />

            <main className="main-content">
                {toast && (
                    <div className={`toast toast-${toast.type}`}>
                        {toast.msg}
                        <button className="toast-close" onClick={() => setToast(null)}>&times;</button>
                    </div>
                )}

                <header className="main-header">
                    <div>
                        <h1 className="page-title">
                            {activeTab === "overview" && "Dashboard Overview"}
                            {activeTab === "scan" && "New Scan"}
                            {activeTab === "history" && "Scan History"}
                            {activeTab === "profile" && "Analyst Profile"}
                        </h1>
                        <p className="page-subtitle">
                            {activeTab === "overview" && "Real-time fraud intelligence console"}
                            {activeTab === "scan" && "Multi-modal content analysis breakdown"}
                            {activeTab === "history" && "Audit log of all analyzed content"}
                            {activeTab === "profile" && "Manage your credentials & access"}
                        </p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={() => setShowHelp(true)} title="How it Works">
                            <HelpCircle size={14} /> Help
                        </button>
                        <button className="btn-secondary" onClick={handleRefresh} title="Reload Data" disabled={loading}>
                            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
                        </button>
                    </div>
                </header>

                <SystemStatus />

                <div className="main-body">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <>
                            <StatsCards stats={stats} />
                            <div className="grid-2">
                                <DashboardCharts stats={stats} />
                                <ActivityFeed scans={history.slice(0, 6)} />
                            </div>
                        </>
                    )}

                    {/* SCAN TAB */}
                    {activeTab === "scan" && (
                        <div className="scan-layout">
                            <div className="scan-controls">
                                <div className="scan-modes">
                                    {SCAN_MODES.map((m) => (
                                        <button
                                            key={m.id}
                                            className={`scan-mode-card ${result?.type === m.id || result?.scan_type === m.id ? "active" : ""}`}
                                            onClick={() => { setResult(null); setError(""); setFile(null); setText(""); }}
                                            title={m.desc}
                                        >
                                            <m.icon size={24} />
                                            <span className="scan-mode-label">{m.label}</span>
                                            <span className="scan-mode-desc">{m.desc}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Text Input */}
                                <div className="card scan-card">
                                    <h3><FileText size={18} /> Direct Input</h3>
                                    <textarea
                                        rows={6}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Paste email content, SMS, or suspicious text here..."
                                        disabled={!!file}
                                    />
                                    {!file && (
                                        <button className="btn-primary" onClick={analyzeText} disabled={loading || !text.trim()}>
                                            {loading ? <span className="spinner-sm"></span> : <><Send size={16} /> Run Analysis</>}
                                        </button>
                                    )}
                                    <p className="scan-hint">Supported text formats: Plain text, JSON, XML signatures.</p>
                                </div>

                                {/* File Upload */}
                                <div className="card scan-card">
                                    <h3><Upload size={18} /> File Input</h3>
                                    <div
                                        className={`upload-zone ${file ? 'has-file' : ''}`}
                                        onClick={() => document.getElementById("file-input").click()}
                                        title="Click to select a file"
                                    >
                                        <Upload size={24} className="upload-icon" />
                                        <div className="upload-text">
                                            <span className="upload-main">{file ? file.name : "Select or Drop File"}</span>
                                            <span className="upload-sub">Supports images (jpg/png), audio (mp3/wav), video (mp4)</span>
                                        </div>
                                        <input
                                            id="file-input"
                                            type="file"
                                            accept="image/*,audio/*,video/*"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                const f = e.target.files?.[0] || null;
                                                setFile(f);
                                                if (f) { setText(""); setError(""); setResult(null); }
                                            }}
                                        />
                                    </div>

                                    {file && (
                                        <div className="upload-actions">
                                            <div className="file-preview-bar">
                                                <span className="file-info"><File size={14} /> {file.name}</span>
                                                <span className="file-type-badge">{file.type}</span>
                                                <button className="btn-text-sm" onClick={() => setFile(null)}>Remove</button>
                                            </div>

                                            <div className="scan-actions-grid">
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => analyzeFile("/analyze-image")}
                                                    disabled={loading || !isImage}
                                                    title={isImage ? "Use Tesseract OCR" : "File is not an image"}
                                                    style={{ opacity: isImage ? 1 : 0.5 }}
                                                >
                                                    <Image size={16} /> Scan Image
                                                </button>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => analyzeFile("/analyze-audio")}
                                                    disabled={loading || !isAudio}
                                                    title={isAudio ? "Transcribe and Analyze" : "File is not audio"}
                                                    style={{ opacity: isAudio ? 1 : 0.5 }}
                                                >
                                                    <Mic size={16} /> Scan Audio
                                                </button>
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => analyzeFile("/analyze-video")}
                                                    disabled={loading || !isVideo}
                                                    title={isVideo ? "Analyze Frames and Audio" : "File is not video"}
                                                    style={{ opacity: isVideo ? 1 : 0.5 }}
                                                >
                                                    <Video size={16} /> Scan Video
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Examples Section */}
                                {!result && !loading && !file && !text && (
                                    <ScanExamples onSelect={handleExampleSelect} />
                                )}

                            </div>

                            <div className="scan-results-container">
                                {/* Error */}
                                {error && (
                                    <div className="card error-card">
                                        <AlertTriangle size={20} /> {safeString(error)}
                                    </div>
                                )}

                                {/* Result */}
                                {result && result.risk_score !== undefined && (
                                    <div className="result-section fade-in">
                                        <RiskGauge score={result.risk_score} severity={result.severity} />
                                        <ExplanationPanel result={result} />
                                        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--status-green)' }}>
                                            <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                            Analysis Completed Successfully
                                        </div>
                                    </div>
                                )}

                                {!result && !error && !loading && (
                                    <div className="empty-scan-state">
                                        <div className="pulse-circle"></div>
                                        <p>System Ready. Waiting for input stream...</p>
                                        <p style={{ fontSize: '11px', marginTop: '8px' }}>Select an input source on the left to begin.</p>
                                    </div>
                                )}

                                {loading && (
                                    <div className="scanning-state">
                                        <div className="radar-sweep"></div>
                                        <p>AI Neural Engine Analyzing...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === "history" && (
                        <div className="history-section">
                            <div className="history-controls">
                                <div className="filter-group">
                                    {["all", "text", "image", "audio", "video"].map((t) => (
                                        <button
                                            key={t}
                                            className={`filter-btn ${filterType === t ? "active" : ""}`}
                                            onClick={() => handleFilterChange(t)}
                                        >
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="history-table">
                                <div className="table-header">
                                    <span>Type</span>
                                    <span>Input Preview</span>
                                    <span>Risk Score</span>
                                    <span>Severity</span>
                                    <span>Timestamp</span>
                                </div>
                                {history.length === 0 ? (
                                    <div className="empty-table-state">
                                        <p>No records found matching filter "{filterType}"</p>
                                    </div>
                                ) : (
                                    history.map((s) => (
                                        <div key={s.id} className="table-row" onClick={() => { setActiveTab("scan"); setResult(s); }}>
                                            <span className="type-badge">{safeString(s.type || s.scan_type)}</span>
                                            <span className="input-preview" title={safeString(s.input_preview)}>{safeString(s.input_preview) || "—"}</span>
                                            <span className={`risk-chip ${safeString(s.severity).toLowerCase()}`} title="Expected score range">{safeString(s.risk_score)}</span>
                                            <span
                                                className={`severity-tag ${safeString(s.severity).toLowerCase()}`}
                                                title={SEVERITY_TIPS[s.severity] || SEVERITY_TIPS[safeString(s.severity).toLowerCase()] || "Risk Level"}
                                            >
                                                {safeString(s.severity)}
                                            </span>
                                            <span className="scan-date">{formatDate(s.timestamp || s.created_at)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && <UserProfile user={user} />}
                </div>
            </main>
        </div>
    );
}
