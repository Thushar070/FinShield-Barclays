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

            <div className="card">
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
