import { AlertTriangle, ShieldCheck, Activity, Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatsCards({ stats }) {
    if (!stats) return <StatsSkeleton />;

    const critical = stats.severity_breakdown?.critical || 0;
    const high = stats.severity_breakdown?.high || 0;
    const critical_pct = stats.total_scans ? Math.round(((critical + high) / stats.total_scans) * 100) : 0;

    // Trend Calculation
    const trendData = stats.recent_trend || [];
    let trendLabel = "Stable";
    let trendIcon = Minus;
    let trendColor = "blue";

    if (trendData.length >= 2) {
        const today = trendData[trendData.length - 1]?.count || 0;
        const yesterday = trendData[trendData.length - 2]?.count || 0;
        const diff = today - yesterday;

        if (diff > 0) {
            trendLabel = `+${diff} from yesterday`;
            trendIcon = TrendingUp;
            trendColor = "red"; // Increasing activity might be bad if it's threats
        } else if (diff < 0) {
            trendLabel = `${diff} from yesterday`;
            trendIcon = TrendingDown;
            trendColor = "green";
        }
    }

    const risk_level = critical_pct > 20 ? "High" : critical_pct > 5 ? "Medium" : "Low";
    const risk_color = risk_level === "High" ? "red" : risk_level === "Medium" ? "amber" : "green";

    return (
        <div className="stats-grid">
            <StatCard
                label="Daily Scan Volume"
                value={stats.scans_last_24h || 0}
                icon={Activity}
                color="blue"
                trend={trendLabel}
                TrendIcon={trendIcon}
                tooltip="Total number of scans processed in the last 24 hours."
            />

            <StatCard
                label="Threats Blocked"
                value={critical + high}
                icon={ShieldCheck}
                color="green"
                subtext={`${critical_pct}% rate`}
                tooltip="Number of scans flagged as High or Critical risk."
            />

            <StatCard
                label="Risk Trend"
                value={risk_level}
                icon={AlertTriangle}
                color={risk_color}
                subtext="Based on recent activity"
                tooltip="Overall threat level based on the percentage of critical incidents."
            />

            <StatCard
                label="AI Confidence"
                value={`${Math.round(stats.average_risk_score * 100)}%`}
                icon={Brain}
                color="purple"
                subtext="Model accuracy"
                tooltip="Average confidence score of the AI detection engine."
            />
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, subtext, trend, TrendIcon, tooltip }) {
    return (
        <div className={`stat-card stat-${color}`} title={tooltip}>
            <div className="stat-header">
                <span className="stat-label">{label}</span>
                <Icon size={16} className={`stat-icon-sm ${color}`} />
            </div>
            <div className="stat-body">
                <span className="stat-value">{value}</span>
                {subtext && <span className="stat-subtext">{subtext}</span>}
                {trend && (
                    <div className="stat-trend-row">
                        {TrendIcon && <TrendIcon size={14} className={color === 'red' ? 'text-red' : 'text-green'} />}
                        <span className="stat-trend-text">{trend}</span>
                    </div>
                )}
            </div>
            <div className={`stat-progress-bg`}>
                <div className={`stat-progress-bar ${color}`} style={{ width: '60%' }}></div>
            </div>
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="stats-grid">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="stat-card skeleton">
                    <div className="stat-header"><div className="skeleton-bar" style={{ width: '40%' }}></div></div>
                    <div className="stat-body"><div className="skeleton-bar" style={{ width: '60%', height: '24px' }}></div></div>
                </div>
            ))}
        </div>
    );
}
