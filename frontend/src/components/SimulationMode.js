import React, { useState } from 'react';
import { PlayCircle, Award, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import RiskGauge from "./RiskGauge";

const SIMULATIONS = [
    {
        id: 1,
        title: "Urgent Invoice Phishing",
        content: "URGENT: Your recent invoice #9901 for $450.00 is overdue. Please click here to resolve immediately or your account will be suspended.",
        type: "phishing",
        difficulty: "Beginner",
        explanation: "This message uses classic 'Urgency Pressure' and 'Authority Impersonation' to force a quick, unthinking click."
    },
    {
        id: 2,
        title: "CEO Gift Card Request",
        content: "Hi, I'm stuck in a meeting. I need you to purchase five $100 Apple gift cards for a client presentation right now. Scratch the backs and email me the codes. Thanks, CEO.",
        type: "scam",
        difficulty: "Intermediate",
        explanation: "A standard CEO fraud/Business Email Compromise (BEC). It leverages authority and unusual payment methods (gift cards)."
    },
    {
        id: 3,
        title: "Legitimate Password Reset",
        content: "You recently requested to reset your password for your FinShield account. Click the button below to reset it. If you did not request this, please ignore this email.",
        type: "safe",
        difficulty: "Intermediate",
        explanation: "This is a standard, non-pressuring password reset template without urgent threats or generic greetings."
    }
];

export default function SimulationMode() {
    const [selectedSim, setSelectedSim] = useState(null);
    const [userGuess, setUserGuess] = useState(null); // 'safe' or 'phishing'
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const handleSelect = (sim) => {
        setSelectedSim(sim);
        setUserGuess(null);
    };

    const handleGuess = (guess) => {
        setUserGuess(guess);
        const isCorrect = (guess === 'safe' && selectedSim.type === 'safe') || (guess !== 'safe' && selectedSim.type !== 'safe');
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));
    };

    return (
        <div className="simulation-mode">
            <div className="card glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlayCircle size={24} /> Training Simulation
                    </h2>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        Test your intuition against real-world scam patterns. Improve your Continuous Trust Score.
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Accuracy Rating</div>
                    <div style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', color: 'var(--status-green)', fontWeight: 'bold' }}>
                        {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="sim-list">
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>Available Scenarios</h3>
                    {SIMULATIONS.map(sim => (
                        <div
                            key={sim.id}
                            onClick={() => handleSelect(sim)}
                            className="card glass-panel"
                            style={{
                                padding: '16px', marginBottom: '12px', cursor: 'pointer',
                                border: selectedSim?.id === sim.id ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.05)',
                                background: selectedSim?.id === sim.id ? 'rgba(6, 182, 212, 0.1)' : 'rgba(19, 21, 26, 0.7)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{sim.title}</strong>
                                <span className={`severity-tag ${sim.difficulty === 'Beginner' ? 'low' : 'medium'}`}>{sim.difficulty}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sim.content}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="sim-workspace">
                    {selectedSim ? (
                        <div className="card glass-panel" style={{ padding: '24px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ background: '#fff', color: '#000', padding: '20px', borderRadius: '8px', fontFamily: 'sans-serif', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                                {selectedSim.content}
                            </div>

                            {!userGuess ? (
                                <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Is this message safe or a threat?</h4>
                                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                        <button className="btn-primary" style={{ background: 'var(--status-green)' }} onClick={() => handleGuess('safe')}>
                                            <CheckCircle size={16} /> Mark as Safe
                                        </button>
                                        <button className="btn-primary" style={{ background: 'var(--status-red)' }} onClick={() => handleGuess('phishing')}>
                                            <AlertTriangle size={16} /> Mark as Threat
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ marginTop: 'auto', padding: '16px', background: 'var(--bg-hover)', borderRadius: '8px', borderLeft: `4px solid ${(userGuess === 'safe' && selectedSim.type === 'safe') || (userGuess !== 'safe' && selectedSim.type !== 'safe') ? 'var(--status-green)' : 'var(--status-red)'}` }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {((userGuess === 'safe' && selectedSim.type === 'safe') || (userGuess !== 'safe' && selectedSim.type !== 'safe')) ? (
                                            <><CheckCircle size={18} color="var(--status-green)" /> Correct!</>
                                        ) : (
                                            <><XCircle size={18} color="var(--status-red)" /> Incorrect</>
                                        )}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        {selectedSim.explanation}
                                    </p>
                                    <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={() => setUserGuess(null)}>Try Again</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card glass-panel" style={{ padding: '24px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            <div>
                                <Award size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                <p>Select a scenario from the left to begin training.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
