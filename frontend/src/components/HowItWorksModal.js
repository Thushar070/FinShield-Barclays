import { X, Shield, Cpu, Lock, FileText, ArrowRight } from "lucide-react";

export default function HowItWorksModal({ onClose }) {
    return (
        <div className="tour-overlay" onClick={onClose}>
            <div className="tour-card" onClick={(e) => e.stopPropagation()} style={{ width: '600px' }}>
                <button className="tour-close" onClick={onClose}><X size={18} /></button>
                <h2><Shield size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> How FinShield Works</h2>

                <div className="how-it-works-body">
                    <p>FinShield uses a privacy-first, multi-stage AI pipeline to detect fraud without sending your data to external clouds.</p>

                    <div className="flow-diagram">
                        <div className="flow-step">
                            <div className="flow-icon"><FileText /></div>
                            <span>Input</span>
                        </div>
                        <ArrowRight className="flow-arrow" />
                        <div className="flow-step">
                            <div className="flow-icon"><Cpu /></div>
                            <span>Local AI Analysis</span>
                        </div>
                        <ArrowRight className="flow-arrow" />
                        <div className="flow-step">
                            <div className="flow-icon"><Shield /></div>
                            <span>Hybrid Scoring</span>
                        </div>
                    </div>

                    <div className="flow-details">
                        <div className="detail-item">
                            <h4><Lock size={14} /> Privacy First</h4>
                            <p>All analysis runs locally on your machine. No text, images, or audio are ever uploaded to third-party servers.</p>
                        </div>
                        <div className="detail-item">
                            <h4><Cpu size={14} /> Hybrid Intelligence</h4>
                            <p>We combine deep learning (BERT, CNNs) with expert heuristic rules to catch both sophisticated AI threats and classic scams.</p>
                        </div>
                    </div>
                </div>

                <div className="tour-actions" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn-primary" onClick={onClose}>Got it</button>
                </div>
            </div>
        </div>
    );
}
