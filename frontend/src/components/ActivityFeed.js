import { FileText, Image, Mic, Video, Clock } from "lucide-react";

const typeIcons = { text: FileText, image: Image, audio: Mic, video: Video };

export default function ActivityFeed({ scans }) {
    if (!scans || scans.length === 0) {
        return (
            <div className="card activity-card">
                <h3><Clock size={20} /> Recent Activity</h3>
                <p className="empty-state">No recent scans</p>
            </div>
        );
    }

    return (
        <div className="card activity-card">
            <h3><Clock size={20} /> Recent Activity</h3>
            <div className="activity-list">
                {scans.map((s, i) => {
                    const Icon = typeIcons[s.scan_type] || FileText;
                    return (
                        <div key={s.id || i} className="activity-item">
                            <div className={`activity-icon ${s.severity}`}>
                                <Icon size={16} />
                            </div>
                            <div className="activity-details">
                                <span className="activity-type">{s.scan_type} scan</span>
                                <span className="activity-preview">{s.input_preview || "File uploaded"}</span>
                            </div>
                            <div className="activity-right">
                                <span className={`risk-chip ${s.severity}`}>{s.risk_score}</span>
                                <span className="activity-time">{formatTime(s.created_at)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
}
