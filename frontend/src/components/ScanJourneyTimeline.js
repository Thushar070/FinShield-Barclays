import React from 'react';
import { Upload, Cpu, Layers, GitMerge, CheckCircle } from 'lucide-react';

export default function ScanJourneyTimeline({ step }) {
    // Determine active steps based on the current overall step
    // 0: Upload/Input
    // 1: Preprocessing
    // 2: AI Models (Feature Extraction)
    // 3: Multi-Modal Fusion
    // 4: Final Decision

    let currentStep = 0;
    if (step === 'preprocessing') currentStep = 1;
    if (step === 'models') currentStep = 2;
    if (step === 'fusion') currentStep = 3;
    if (step === 'decision') currentStep = 4;

    const stages = [
        { id: 0, label: "Input Acquired", icon: Upload },
        { id: 1, label: "Preprocessing", icon: Cpu },
        { id: 2, label: "Neural Extraction", icon: Layers },
        { id: 3, label: "Multi-Modal Fusion", icon: GitMerge },
        { id: 4, label: "Final Decision", icon: CheckCircle },
    ];

    return (
        <div className="journey-timeline">
            {stages.map((stage, index) => {
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;
                const Icon = stage.icon;

                return (
                    <div key={stage.id} className={`journey-stage ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="stage-icon-container">
                            <Icon size={18} className="stage-icon" />
                            {isCurrent && <div className="pulse-ring"></div>}
                        </div>
                        <div className="stage-label">{stage.label}</div>
                        {index < stages.length - 1 && (
                            <div className="stage-connector">
                                <div className="connector-fill" style={{ width: isActive && !isCurrent ? '100%' : '0%' }}></div>
                            </div>
                        )}
                    </div>
                );
            })}

            <style>{`
                .journey-timeline {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 20px 0;
                    position: relative;
                }
                .journey-stage {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    z-index: 2;
                    flex: 1;
                }
                .stage-icon-container {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--bg-hover);
                    border: 1px solid var(--border-console);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    position: relative;
                    transition: all 0.3s ease;
                }
                .journey-stage.active .stage-icon-container {
                    background: rgba(6, 182, 212, 0.1);
                    border-color: var(--accent-cyan);
                    color: var(--accent-cyan);
                    box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
                }
                .journey-stage.current .stage-icon-container {
                    background: var(--accent-cyan);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
                }
                .pulse-ring {
                    position: absolute;
                    top: -5px; left: -5px; right: -5px; bottom: -5px;
                    border-radius: 50%;
                    border: 1px solid var(--accent-cyan);
                    animation: pulse-ring 1.5s infinite;
                }
                .stage-label {
                    margin-top: 10px;
                    font-size: 11px;
                    font-family: var(--font-mono);
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    text-align: center;
                    transition: color 0.3s ease;
                }
                .journey-stage.active .stage-label {
                    color: var(--text-primary);
                }
                .journey-stage.current .stage-label {
                    color: var(--accent-cyan);
                    font-weight: bold;
                }
                .stage-connector {
                    position: absolute;
                    top: 20px;
                    left: calc(50% + 20px);
                    width: calc(100% - 40px);
                    height: 2px;
                    background: var(--border-console);
                    z-index: 1;
                }
                .connector-fill {
                    height: 100%;
                    background: var(--accent-cyan);
                    box-shadow: 0 0 10px var(--accent-cyan);
                    transition: width 0.5s ease;
                }
            `}</style>
        </div>
    );
}
