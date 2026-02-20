import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info, Cpu, FileText, Printer } from "lucide-react";

export default function ExplanationPanel({ result }) {
    const [expanded, setExpanded] = useState(true);
    const exp = result?.explanation;
    if (!exp) return null;

    const severityIcon = result.severity === "high" || result.severity === "critical"
        ? <AlertTriangle size={20} className="icon-danger" />
        : result.severity === "medium"
            ? <Info size={20} className="icon-warning" />
            : <CheckCircle size={20} className="icon-success" />;

    return (
        <div className="card explanation-card">
            <div className="exp-header" onClick={() => setExpanded(!expanded)}>
                <h3>{severityIcon} AI Explanation</h3>
                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {expanded && (
                <div className="exp-body">
                    <div className="exp-meta-row">
                        <div className="exp-meta">
                            <span className="exp-meta-label">Category</span>
                            <span className={`category-badge ${result.severity}`}>
                                {exp.fraud_category?.replace(/_/g, " ")}
                            </span>
                        </div>
                        <div className="exp-meta">
                            <span className="exp-meta-label">Confidence</span>
                            <span className="confidence-val">{Math.round(exp.confidence * 100)}%</span>
                        </div>
                        {exp.confidence_stability && (
                            <div className="exp-meta">
                                <span className="exp-meta-label">Stability</span>
                                <span className={`confidence-val ${exp.confidence_stability === 'FLUCTUATING' ? 'warning' : ''}`} style={{ color: exp.confidence_stability === 'FLUCTUATING' ? 'var(--status-amber)' : 'var(--status-green)' }}>
                                    {exp.confidence_stability}
                                </span>
                            </div>
                        )}
                        <div className="exp-meta">
                            <span className="exp-meta-label">Model</span>
                            <span className="model-badge"><Cpu size={14} /> {exp.model_used}</span>
                        </div>
                    </div>

                    <div className="exp-reasoning">
                        <h4>Reasoning</h4>
                        <p>{exp.reasoning}</p>
                    </div>

                    {exp.counterfactual && (
                        <div className="exp-reasoning" style={{ marginTop: '12px', padding: '10px', background: 'rgba(6, 182, 212, 0.1)', borderLeft: '2px solid var(--accent-cyan)', borderRadius: '4px' }}>
                            <h4 style={{ color: 'var(--accent-cyan)' }}>Counterfactual Analysis</h4>
                            <p style={{ fontStyle: 'italic', fontSize: '12px' }}>{exp.counterfactual}</p>
                        </div>
                    )}

                    {result.intelligence && result.intelligence.dark_patterns && result.intelligence.dark_patterns.length > 0 && (
                        <div className="exp-signals" style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--status-red)' }}>
                            <h4 style={{ color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertTriangle size={14} /> Detected Dark Patterns
                            </h4>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                {result.intelligence.dark_patterns.map((dp, i) => (
                                    <span key={i} style={{ fontSize: '11px', background: 'var(--status-red)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        {dp}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {exp.signals && exp.signals.length > 0 && (
                        <div className="exp-signals">
                            <h4>Detected Signals</h4>
                            <ul>
                                {exp.signals.map((s, i) => (
                                    <li key={i} className="signal-item">
                                        <span className="signal-dot"></span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.risk_breakdown && result.risk_breakdown.length > 0 && (
                        <div className="exp-breakdown">
                            <h4>Model Breakdown</h4>
                            {result.risk_breakdown.map((rb, i) => (
                                <div key={i} className="breakdown-row">
                                    <span className="breakdown-model">{rb.model}</span>
                                    <div className="breakdown-bar-wrap">
                                        <div
                                            className={`breakdown-bar ${rb.score >= 0.6 ? "high" : rb.score >= 0.3 ? "medium" : "low"}`}
                                            style={{ width: `${rb.score * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="breakdown-score">{rb.score}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {(result.severity === 'high' || result.severity === 'critical') && (
                        <div className="exp-playbook" style={{ marginTop: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--status-red)', borderRadius: '8px' }}>
                            <h4 style={{ color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <AlertTriangle size={16} /> Automated Response Playbook
                            </h4>
                            <ol style={{ margin: 0, paddingLeft: '24px', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <li><strong>Isolate:</strong> Immediately disconnect the affected device from the corporate network.</li>
                                <li><strong>Block:</strong> Add the sender domain and IP to the global blocklist.</li>
                                <li><strong>Reset:</strong> Enforce a mandatory password reset for the targeted user account.</li>
                                <li><strong>Report:</strong> Forward this scan ID to the tier-2 SOC team for deeper investigation.</li>
                            </ol>
                            <button className="btn-primary" style={{ marginTop: '16px', width: '100%', background: 'var(--status-red)' }}>
                                Execute Playbook
                            </button>
                        </div>
                    )}

                    {result.intelligence && result.intelligence.fingerprint && (
                        <div className="exp-meta" style={{ marginTop: '16px', borderTop: '1px solid var(--border-console)', paddingTop: '16px' }}>
                            <span className="exp-meta-label">Unique Threat Fingerprint</span>
                            <span className="confidence-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                                {result.intelligence.fingerprint}
                            </span>
                        </div>
                    )}

                    {/* Simulating 4.3 Real-Time Link Sandbox Preview if textual scan has suspected URLs */}
                    {result.type === 'text' && result.severity !== 'low' && (
                        <div className="exp-sandbox" style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={14} /> Real-Time Link Sandbox Preview
                            </h4>
                            <div style={{ position: 'relative', height: '120px', background: '#111', borderRadius: '4px', overflow: 'hidden', border: '1px dashed var(--status-red)' }}>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-red)', opacity: 0.8, flexDirection: 'column', gap: '8px' }}>
                                    <AlertTriangle size={24} />
                                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Isolated rendering complete. Malicious payload blocked.</span>
                                </div>
                                <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '4px 8px', background: 'var(--status-red)', color: '#fff', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                                    URL: http://secure-update-billing-xyz.com
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="exp-footer">
                        <button className="btn-secondary btn-sm" onClick={() => window.print()}>
                            <Printer size={14} /> Download Report (PDF)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
