export default function RiskGauge({ score, severity }) {
    if (score === null || score === undefined) return null;

    const pct = Math.round(score * 100);
    // Dark mode palette
    const colors = {
        low: { main: "#10b981", bg: "rgba(16, 185, 129, 0.2)", text: "Low Risk" },
        medium: { main: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)", text: "Medium Risk" },
        high: { main: "#ef4444", bg: "rgba(239, 68, 68, 0.2)", text: "High Risk" },
        critical: { main: "#ef4444", bg: "rgba(239, 68, 68, 0.2)", text: "Critical Risk" },
    };

    const c = colors[severity] || colors.low;
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (pct / 100) * circumference;

    return (
        <div className="card risk-gauge-card">
            <h3 style={{ color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Risk Assessment
            </h3>

            <div className="gauge-container" style={{ position: "relative", width: "160px", margin: "20px auto" }}>
                <svg width="160" height="160" viewBox="0 0 160 160" className="gauge-svg">
                    {/* Track */}
                    <circle
                        cx="80" cy="80" r={radius}
                        fill="none"
                        stroke="var(--bg-hover)"
                        strokeWidth="12"
                    />
                    {/* Progress */}
                    <circle
                        cx="80" cy="80" r={radius}
                        fill="none"
                        stroke={c.main}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                        className="gauge-progress"
                        style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                </svg>

                <div className="gauge-center" style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)", textAlign: "center"
                }}>
                    <span className="gauge-pct" style={{
                        display: "block", fontSize: "32px", fontWeight: "700",
                        color: c.main, fontFamily: "var(--font-mono)"
                    }}>
                        {pct}%
                    </span>
                    <span className="gauge-label" style={{
                        fontSize: "10px", color: "var(--text-secondary)",
                        textTransform: "uppercase"
                    }}>
                        {c.text}
                    </span>
                </div>
            </div>

            {/* Meta Data */}
            <div className="gauge-meta" style={{
                display: "flex", justifyContent: "space-between",
                borderTop: "1px solid var(--border-console)", paddingTop: "12px",
                fontSize: "12px", color: "var(--text-primary)"
            }}>
                <span>Score: <strong style={{ color: c.main }}>{score}</strong></span>
                <span className={`severity-tag ${severity}`} style={{ fontSize: "10px" }}>{severity?.toUpperCase()}</span>
            </div>
        </div>
    );
}
