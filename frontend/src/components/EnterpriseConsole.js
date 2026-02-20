import React, { useState } from 'react';
import { Briefcase, Shield, Server, Users, Search, Filter, FileText, Database, Share2, Activity, Zap } from 'lucide-react';

const CASES = [
    { id: 'FC-9901', origin: 'API /analyze', status: 'OPEN', severity: 'critical', analyst: 'Unassigned', date: '2026-02-20' },
    { id: 'FC-9900', origin: 'Web UI', status: 'INVESTIGATING', severity: 'high', analyst: 'Thushar', date: '2026-02-19' },
    { id: 'FC-9899', origin: 'Outlook Plugin', status: 'MITIGATED', severity: 'medium', analyst: 'Auto-SOC', date: '2026-02-18' }
];

const AUDIT_LOGS = [
    { timestamp: '14:32:01', user: 'system', action: 'Global Threat Pulse Sync', status: 'SUCCESS' },
    { timestamp: '13:15:44', user: 'thushar', action: 'Execute Playbook FC-9900', status: 'SUCCESS' },
    { timestamp: '09:05:12', user: 'guest', action: 'Failed Login Attempt', status: 'DENIED' }
];

export default function EnterpriseConsole() {
    return (
        <div className="enterprise-console">
            <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>

                {/* 7.1 Fraud Case Management & 7.2 Org Dashboard */}
                <div className="card glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <Briefcase size={20} /> Fraud Case Management
                        </h3>
                        <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>Global Org View</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {CASES.map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid var(--status-${c.severity === 'critical' ? 'red' : c.severity === 'high' ? 'amber' : 'green'})` }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{c.id}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Source: {c.origin} • Analyst: {c.analyst}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span className={`severity-tag ${c.severity}`}>{c.severity}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{c.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7.4 Audit Log System & 7.3 RBAC */}
                <div className="card glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0' }}>
                        <Shield size={20} /> RBAC & Security Audit Logs
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {AUDIT_LOGS.map((log, i) => (
                            <div key={i} style={{ display: 'flex', gap: '16px', fontSize: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{log.timestamp}</span>
                                <span style={{ color: 'var(--text-primary)', width: '60px' }}>[{log.user}]</span>
                                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{log.action}</span>
                                <span style={{ color: log.status === 'SUCCESS' ? 'var(--status-green)' : 'var(--status-red)', fontWeight: 'bold' }}>{log.status}</span>
                            </div>
                        ))}
                    </div>
                    <button className="btn-secondary" style={{ width: '100%', marginTop: '16px' }}><Search size={14} /> Full Audit Trail</button>
                </div>
            </div>

            {/* PHASE 8: FUTURE-READY INNOVATIONS */}
            <div className="card glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0' }}>
                    <Zap size={20} color="var(--status-amber)" /> Future-Ready AI Innovations (Core Modules Active)
                </h3>

                <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <Share2 size={24} color="var(--status-green)" style={{ marginBottom: '8px' }} />
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>Federated Learning</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Local anon model updates</p>
                    </div>

                    <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <Database size={24} color="var(--accent-cyan)" style={{ marginBottom: '8px' }} />
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>Self-Improving Data</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Automated bad-actor caching</p>
                    </div>

                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <Activity size={24} color="var(--status-red)" style={{ marginBottom: '8px' }} />
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>Zero-Day Scams</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Heuristic anomaly detection</p>
                    </div>

                    <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                        <Users size={24} color="#8b5cf6" style={{ marginBottom: '8px' }} />
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>Emotional Risk Mapped</h4>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Urgency/Pressure vectors</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
