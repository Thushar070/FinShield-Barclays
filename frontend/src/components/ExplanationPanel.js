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
                        <div className="exp-meta">
                            <span className="exp-meta-label">Model</span>
                            <span className="model-badge"><Cpu size={14} /> {exp.model_used}</span>
                        </div>
                    </div>

                    <div className="exp-reasoning">
                        <h4>Reasoning</h4>
                        <p>{exp.reasoning}</p>
                    </div>

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
