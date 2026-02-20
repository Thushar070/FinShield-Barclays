import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello Analyst. I am the FinShield AI Advisor. How can I help you investigate today?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        // Simulate AI Response
        setTimeout(() => {
            let reply = "I'm analyzing that query...";
            const lowerInput = input.toLowerCase();

            if (lowerInput.includes('urgent') || lowerInput.includes('pressuring')) {
                reply = "Messages creating artificial urgency are a hallmark of Business Email Compromise (BEC) and phishing. Check the sender's true domain.";
            } else if (lowerInput.includes('qr code') || lowerInput.includes('quishing')) {
                reply = "QR codes can obscure malicious URLs (Quishing). FinShield extracts the embedded URL and runs our heuristics against it before you visit.";
            } else if (lowerInput.includes('playbook')) {
                reply = "For high-severity threats, our Automated Response Playbook recommends immediate password resets, network isolation, and reporting to the SOC.";
            } else {
                reply = "Based on current global threat intelligence, I recommend running a full multi-modal scan on any suspicious artifacts related to that query.";
            }

            setMessages([...newMessages, { sender: 'bot', text: reply }]);
        }, 800);
    };

    return (
        <div className="chatbot-widget" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
            {!isOpen && (
                <button
                    className="btn-primary"
                    style={{ borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(6, 182, 212, 0.4)' }}
                    onClick={() => setIsOpen(true)}
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {isOpen && (
                <div className="card glass-panel" style={{ width: '340px', height: '480px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
                    <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.15)', borderBottom: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                            <Bot size={20} /> AI Fraud Advisor
                        </div>
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                {msg.sender === 'bot' && <Bot size={16} style={{ color: 'var(--accent-cyan)', marginTop: '4px' }} />}
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    lineHeight: '1.4',
                                    background: msg.sender === 'user' ? 'var(--accent-cyan)' : 'var(--bg-hover)',
                                    color: msg.sender === 'user' ? '#000' : 'var(--text-primary)',
                                    borderBottomRightRadius: msg.sender === 'user' ? '0' : '12px',
                                    borderBottomLeftRadius: msg.sender === 'bot' ? '0' : '12px',
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask the advisor..."
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-dark)', color: 'var(--text-primary)', outline: 'none' }}
                        />
                        <button
                            style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            onClick={handleSend}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
