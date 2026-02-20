export default function RiskGauge({ score, severity }) {
    if (score === null || score === undefined) return null;

    const pct = Math.round(score * 100);
    // Dark mode palette with neon glow
    const colors = {
        low: { main: "#10b981", glow: "rgba(16, 185, 129, 0.6)", text: "Low Risk" },
        medium: { main: "#f59e0b", glow: "rgba(245, 158, 11, 0.6)", text: "Medium Risk" },
        high: { main: "#ef4444", glow: "rgba(239, 68, 68, 0.6)", text: "High Risk" },
        critical: { main: "#dc2626", glow: "rgba(220, 38, 38, 0.8)", text: "Critical Risk" },
    };

    const c = colors[severity?.toLowerCase()] || colors.low;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (pct / 100) * circumference;

    return (
        <div className="card risk-gauge-card glass-panel" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px', background: 'rgba(28, 31, 38, 0.6)', backdropFilter: 'blur(12px)',
            border: `1px solid rgba(255, 255, 255, 0.05)`,
            borderTop: `1px solid ${c.glow}`,
            borderRadius: '16px',
            boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 2px 20px 0 ${c.glow.replace('0.6', '0.1')}`
        }}>
            <h3 style={{ color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", alignSelf: 'flex-start', margin: '0 0 16px 0' }}>
                Unified Risk Score
            </h3>

            <div className="gauge-container" style={{ position: "relative", width: "160px", height: "160px", margin: "10px auto" }}>
                {/* 3D background shadow circle */}
                <div style={{
                    position: 'absolute', top: '10px', left: '10px', width: '140px', height: '140px',
                    borderRadius: '50%', background: 'var(--bg-panel)',
                    boxShadow: `inset 4px 4px 10px rgba(0,0,0,0.5), inset -4px -4px 10px rgba(255,255,255,0.05)`
                }}></div>

                <svg width="160" height="160" viewBox="0 0 160 160" className="gauge-svg" style={{ position: 'absolute', zIndex: 2, filter: `drop-shadow(0 0 8px ${c.glow})` }}>
                    {/* Track */}
                    <circle
                        cx="80" cy="80" r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="14"
                    />
                    {/* Progress with precise cap */}
                    <circle
                        cx="80" cy="80" r={radius}
                        fill="none"
                        stroke={c.main}
                        strokeWidth="14"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                        className="gauge-progress"
                        style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                    />
                </svg>

                <div className="gauge-center" style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 3,
                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <span className="gauge-pct" style={{
                        display: "block", fontSize: "36px", fontWeight: "800",
                        color: c.main, fontFamily: "var(--font-mono)",
                        textShadow: `0 0 15px ${c.glow}`
                    }}>
                        {pct}%
                    </span>
                    <span className="gauge-label" style={{
                        fontSize: "10px", color: "var(--text-primary)",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px'
                    }}>
                        {c.text}
                    </span>
                </div>
            </div>

            {/* Meta Data */}
            <div className="gauge-meta" style={{
                display: "flex", justifyContent: "space-between", width: '100%',
                borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", marginTop: "16px",
                fontSize: "12px", color: "var(--text-primary)"
            }}>
                <span style={{ color: "var(--text-secondary)" }}>Raw Context Score: <strong style={{ color: c.main }}>{score.toFixed(3)}</strong></span>
                <span className={`severity-tag ${severity?.toLowerCase()}`} style={{ fontSize: "10px" }}>{severity?.toUpperCase()}</span>
            </div>
        </div>
    );
}
