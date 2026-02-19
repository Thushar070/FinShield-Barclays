import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend, CartesianGrid } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{
                backgroundColor: '#1c1f26',
                border: '1px solid #2a2e36',
                padding: '8px 12px',
                color: '#e2e4e9',
                fontSize: '12px',
                borderRadius: '4px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
                <p className="label" style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
                <p className="intro" style={{ color: payload[0].color || '#fff' }}>
                    {`${payload[0].name}: ${payload[0].value}`}
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardCharts({ stats }) {
    if (!stats) return <div className="card chart-card"><div className="skeleton-chart"></div></div>;

    const typePieData = Object.entries(stats.scans_by_type || {}).map(([name, value]) => ({ name, value }));
    const trendData = stats.recent_trend || [];

    // Safely access new breakdown structure
    const breakdown = stats.severity_breakdown || {};
    const riskDistData = [
        { name: "Low", value: breakdown.low || 0, fill: "#10b981" },
        { name: "Medium", value: breakdown.medium || 0, fill: "#f59e0b" },
        { name: "High", value: breakdown.high || 0, fill: "#ef4444" },
        { name: "Critical", value: breakdown.critical || 0, fill: "#b91c1c" },
    ];

    return (
        <div className="charts-section">
            {/* Scan trend */}
            <div className="card chart-card">
                <h3>Scan Activity (7 Days)</h3>
                <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e36" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="count" stroke="#06b6d4" fill="url(#colorCount)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Risk Distribution */}
            <div className="card chart-card">
                <h3>Risk Distribution</h3>
                <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={riskDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e36" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {riskDistData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Breakdown */}
            {typePieData.length > 0 && (
                <div className="card chart-card">
                    <h3>Scan Types</h3>
                    <div className="chart-wrap pie-wrap">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Pie
                                    data={typePieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {typePieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
