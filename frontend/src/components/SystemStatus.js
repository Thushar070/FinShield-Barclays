import { Activity, Shield, Server, Wifi } from "lucide-react";

export default function SystemStatus() {
    return (
        <div className="system-status-bar">
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
                <span className="status-value">24ms</span>
            </div>
            <div className="status-divider"></div>
            <div className="status-item">
                <Activity size={14} className="status-icon" />
                <span className="status-label">THREAT LEVEL:</span>
                <span className="status-value low">LOW</span>
            </div>
        </div>
    );
}
