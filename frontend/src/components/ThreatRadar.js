import React, { useEffect, useState } from 'react';

export default function ThreatRadar() {
    const [blips, setBlips] = useState([]);

    useEffect(() => {
        // Generate random blips for the radar effect
        const generateBlips = () => {
            const newBlips = Array.from({ length: 5 }).map((_, i) => ({
                id: i,
                angle: Math.random() * 360,
                distance: Math.random() * 80 + 10, // 10% to 90% out
                size: Math.random() * 4 + 2,
                opacity: Math.random() * 0.5 + 0.3,
                isThreat: Math.random() > 0.7, // 30% chance to be a high threat (red)
                speed: Math.random() * 0.5 + 0.1,
            }));
            setBlips(newBlips);
        };

        generateBlips();
        const interval = setInterval(() => {
            setBlips(prev => prev.map(blip => {
                // slowly move them
                let newAngle = blip.angle + blip.speed;
                if (newAngle > 360) newAngle -= 360;
                // occasionally fade out and regenerate one
                if (Math.random() < 0.05) {
                    return {
                        ...blip,
                        angle: Math.random() * 360,
                        distance: Math.random() * 80 + 10,
                        isThreat: Math.random() > 0.7,
                    };
                }
                return { ...blip, angle: newAngle };
            }));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card threat-radar-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', position: 'relative', overflow: 'hidden' }}>
            <h3 style={{ position: 'absolute', top: '16px', left: '16px', margin: 0, color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", zIndex: 10 }}>
                Global Threat Radar
            </h3>

            <div className="radar-container" style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.1) inset' }}>
                {/* Concentric circles */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.2)' }}></div>
                <div style={{ position: 'absolute', top: '25%', left: '25%', right: '25%', bottom: '25%', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)' }}></div>
                <div style={{ position: 'absolute', top: '40%', left: '40%', right: '40%', bottom: '40%', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.4)' }}></div>

                {/* Radar Sweep */}
                <div className="radar-sweep-scanner" style={{
                    position: 'absolute',
                    top: '0', left: '50%',
                    width: '50%', height: '50%',
                    background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.5) 0%, transparent 100%)',
                    transformOrigin: '0% 100%',
                    borderLeft: '2px solid var(--accent-cyan)',
                    animation: 'radar-spin 4s infinite linear'
                }}></div>

                {/* Blips */}
                {blips.map(blip => {
                    // Convert polar to cartesian
                    const rad = (blip.angle * Math.PI) / 180;
                    // distance is percentage (0 to 100). radius is 100px.
                    const r = (blip.distance / 100) * 100;
                    const x = 100 + r * Math.cos(rad);
                    const y = 100 + r * Math.sin(rad);

                    return (
                        <div key={blip.id} style={{
                            position: 'absolute',
                            left: `${x}px`,
                            top: `${y}px`,
                            width: `${blip.size}px`,
                            height: `${blip.size}px`,
                            backgroundColor: blip.isThreat ? 'var(--status-red)' : 'var(--status-green)',
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            boxShadow: `0 0 ${blip.size * 2}px ${blip.isThreat ? 'var(--status-red)' : 'var(--status-green)'}`,
                            opacity: blip.opacity,
                            transition: 'left 0.1s linear, top 0.1s linear'
                        }}>
                            {blip.isThreat && (
                                <div style={{
                                    position: 'absolute', top: '50%', left: '50%', width: '100%', height: '100%',
                                    transform: 'translate(-50%, -50%)', borderRadius: '50%',
                                    border: '1px solid var(--status-red)',
                                    animation: 'pulse-ring 1s infinite'
                                }}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-green)', boxShadow: '0 0 5px var(--status-green)' }}></div>
                    Normal Ping
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-red)', boxShadow: '0 0 5px var(--status-red)' }}></div>
                    Active Threat
                </div>
            </div>
        </div>
    );
}
