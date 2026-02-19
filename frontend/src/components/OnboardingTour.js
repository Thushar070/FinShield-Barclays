import { useState, useEffect } from "react";
import { X, ChevronRight, Check } from "lucide-react";

export default function OnboardingTour({ onComplete }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("finshield_tour_completed");
        if (!hasSeenTour) {
            setVisible(true);
        }
    }, []);

    const handleComplete = () => {
        localStorage.setItem("finshield_tour_completed", "true");
        setVisible(false);
        if (onComplete) onComplete();
    };

    if (!visible) return null;

    const steps = [
        {
            title: "Welcome to FinShield v2.0",
            content: "Your AI-powered cybersecurity console. FinShield helps you detect fraud in text, images, audio, and video using advanced hybrid analysis.",
            action: "Start Tour"
        },
        {
            title: "Multi-Modal Scanning",
            content: "Select a scan type from the dashboard. You can analyze emails (Text), screenshots (Image), voicemails (Audio), or deepfakes (Video). All analysis runs locally for privacy.",
            action: "Next"
        },
        {
            title: "Understanding Risk Scores",
            content: "Our Hybrid Engine assigns a risk score (0-100%). Scores above 80% are CRITICAL and likely malicious. We also categorize threats like 'Phishing' or 'Credential Harvesting'.",
            action: "Next"
        },
        {
            title: "Detailed Analysis",
            content: "Expand the 'AI Explanation' panel to see exactly WHY content was flagged. We highlight suspicious keywords, urgency signals, and technical anomalies.",
            action: "Finish"
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="tour-overlay">
            <div className="tour-card fade-in-up">
                <button className="tour-close" onClick={handleComplete}><X size={18} /></button>
                <div className="tour-progress">
                    {steps.map((_, i) => (
                        <div key={i} className={`tour-dot ${i <= step ? "active" : ""}`}></div>
                    ))}
                </div>
                <h2>{currentStep.title}</h2>
                <p>{currentStep.content}</p>
                <div className="tour-actions">
                    <button className="btn-primary" onClick={() => step < steps.length - 1 ? setStep(step + 1) : handleComplete()}>
                        {step < steps.length - 1 ? (
                            <>
                                {currentStep.action} <ChevronRight size={16} />
                            </>
                        ) : (
                            <>
                                <Check size={16} /> Get Started
                            </>
                        )}
                    </button>
                    {step < steps.length - 1 && (
                        <button className="btn-text" onClick={handleComplete}>Skip Tour</button>
                    )}
                </div>
            </div>
        </div>
    );
}
