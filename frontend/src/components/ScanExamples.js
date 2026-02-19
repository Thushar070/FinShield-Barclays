import { AlertTriangle, Mail, Smartphone, Globe } from "lucide-react";

const EXAMPLES = [
    {
        category: "Phishing SMS",
        icon: Smartphone,
        color: "amber",
        preview: "URGENT: Your bank account is locked...",
        text: "URGENT: Your bank account has been locked due to suspicious activity. Verify your identity immediately at http://secure-verify-bank.com/login or your funds will be frozen."
    },
    {
        category: "Credential Harvesting",
        icon: Mail,
        color: "red",
        preview: "HR updated payroll info...",
        text: "Hello, this is HR. We need you to confirm your direct deposit details. Please login here to update: https://payroll-update-hr.com/login"
    },
    {
        category: "Deepfake Script",
        icon: AlertTriangle,
        color: "purple",
        preview: "CEO needing urgent transfer...",
        text: "Hey, it's the CEO. I'm in a meeting but I need you to wire $50,000 to this vendor immediately. Don't call me, just do it now. It's urgent."
    },
    {
        category: "Crypto Scam",
        icon: Globe,
        color: "green",
        preview: "Double your Bitcoin now...",
        text: "Congratulations! You have been selected to double your Bitcoin. Send 0.1 BTC to this wallet and receive 0.2 BTC back instantly. Limited time offer!"
    }
];

export default function ScanExamples({ onSelect }) {
    return (
        <div className="examples-section">
            <h4>Try an Example Analysis</h4>
            <div className="examples-grid">
                {EXAMPLES.map((ex, i) => (
                    <button
                        key={i}
                        className={`example-card ${ex.color}`}
                        onClick={() => onSelect(ex.text)}
                    >
                        <div className={`example-icon ${ex.color}`}>
                            <ex.icon size={16} />
                        </div>
                        <div className="example-content">
                            <span className="example-cat">{ex.category}</span>
                            <span className="example-preview">{ex.preview}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
