import { useState, useEffect } from "react";
import { apiGet } from "../utils/api";

export default function UserProfile({ user }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await apiGet("/user/profile");
                setProfile(data);
            } catch (e) { }
        }
        load();
    }, []);

    const p = profile || user || {};

    return (
        <div className="profile-section">
            <div className="card profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {(p.username || "U")[0].toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h2>{p.username}</h2>
                        <span className="profile-role">{p.role || "Analyst"}</span>
                    </div>
                </div>

                <div className="profile-details">
                    <div className="profile-row">
                        <span className="profile-label">Username</span>
                        <span className="profile-value">{p.username}</span>
                    </div>
                    <div className="profile-row">
                        <span className="profile-label">Email</span>
                        <span className="profile-value">{p.email}</span>
                    </div>
                    <div className="profile-row">
                        <span className="profile-label">Role</span>
                        <span className="profile-value">{p.role}</span>
                    </div>
                    <div className="profile-row">
                        <span className="profile-label">Member since</span>
                        <span className="profile-value">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                        </span>
                    </div>
                    <div className="profile-row">
                        <span className="profile-label">Total scans</span>
                        <span className="profile-value">{p.total_scans || 0}</span>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                <div className="card profile-card glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', color: 'var(--accent-cyan)' }}>
                        Personal Risk Profile Engine
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Continuous Trust Score</div>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: p.trust_score > 80 ? 'var(--status-green)' : (p.trust_score > 50 ? 'var(--status-amber)' : 'var(--status-red)') }}>
                                {p.trust_score?.toFixed(1) || "100.0"}
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                                <div style={{ width: `${p.trust_score || 100}%`, height: '100%', background: p.trust_score > 80 ? 'var(--status-green)' : (p.trust_score > 50 ? 'var(--status-amber)' : 'var(--status-red)'), transition: 'width 1s ease-out' }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-hover)', padding: '12px', borderRadius: '8px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Account Exposure Level</span>
                            <span className={`severity-tag ${p.exposure_level?.toLowerCase() || 'low'}`}>{p.exposure_level || 'LOW'}</span>
                        </div>
                    </div>
                </div>

                <div className="card profile-card glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', color: '#8b5cf6' }}>
                        Smart Habit Analyzer
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Based on your recent scans, the AI has identified behavioral targeting vectors against you:
                        </div>
                        {(!p.targeted_scam_types || p.targeted_scam_types.length === 0) ? (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '8px', color: 'var(--status-green)', fontSize: '12px' }}>
                                Excellent hygiene. No risky habits detected.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {p.targeted_scam_types.map((type, i) => (
                                    <span key={i} style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-red)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }}>
                                        🎯 {type}
                                    </span>
                                ))}
                            </div>
                        )}
                        {p.targeted_scam_types?.length > 0 && (
                            <div style={{ marginTop: 'auto', paddingTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                <strong>AI Tip:</strong> You are frequently encountering pressure tactics. Always verify sender domains before taking "Urgent" actions.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card glass-panel" style={{ marginTop: '24px' }}>
                <h3>Security</h3>
                <div className="security-grid">
                    <div className="sec-item">
                        <span className="sec-status on"></span>
                        <span>Password encrypted (bcrypt)</span>
                    </div>
                    <div className="sec-item">
                        <span className="sec-status on"></span>
                        <span>JWT session tokens</span>
                    </div>
                    <div className="sec-item">
                        <span className="sec-status on"></span>
                        <span>Local AI inference only</span>
                    </div>
                    <div className="sec-item">
                        <span className="sec-status on"></span>
                        <span>No external API calls</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
