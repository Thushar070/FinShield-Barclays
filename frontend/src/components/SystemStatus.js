import { useState, useEffect } from "react";
import { Activity, Shield, Server, Wifi } from "lucide-react";
import { apiGet } from "../utils/api";

export default function SystemStatus() {
    const [threatLevel, setThreatLevel] = useState("SYNCING");
    const [ping, setPing] = useState(24);

    useEffect(() => {
        const fetchThreatLevel = async () => {
            try {
                const start = Date.now();
                const res = await apiGet("/intel/status");
                const end = Date.now();
                setPing(end - start);

                if (res && res.data && res.data.threat_level) {
                    setThreatLevel(res.data.threat_level);
                }
            } catch (e) {
                console.warn("Failed to fetch global threat level");
                setThreatLevel("OFFLINE");
            }
        };

        fetchThreatLevel();
        const interval = setInterval(fetchThreatLevel, 30000);
        return () => clearInterval(interval);
    }, []);

    const getColor = (level) => {
        if (level === "CRITICAL" || level === "HIGH") return "var(--status-red)";
        if (level === "MEDIUM") return "var(--status-amber)";
        if (level === "LOW") return "var(--status-green)";
        return "var(--text-secondary)";
    };

    return (
        <div className="system-status-bar glass-panel" style={{ background: 'rgba(15, 17, 21, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <div className="status-item">
                <Shield size={14} className="status-icon secure" />
                <span className="status-label">SYSTEM:</span>
                <span className="status-value secure">SECURE</span>
            </div>
            <div className="status-divider"></div>
            <div className="status-item">
                <Server size={14} className="status-icon" />
                <span className="status-label">AI ENGINE:</span>
                <span className="status-value">ONLINE (v2.1)</span>
            </div>
            <div className="status-divider"></div>
            <div className="status-item">
                <Wifi size={14} className="status-icon" />
                <span className="status-label">LATENCY:</span>
                <span className="status-value">{ping}ms</span>
            </div>
            <div className="status-divider"></div>
            <div className="status-item">
                <Activity size={14} className="status-icon" style={{ color: getColor(threatLevel), opacity: 1 }} />
                <span className="status-label">GLOBAL THREAT LEVEL:</span>
                <span className="status-value" style={{ color: getColor(threatLevel), textShadow: `0 0 10px ${getColor(threatLevel)}` }}>
                    {threatLevel}
                </span>
            </div>
        </div>
    );
}
