import type { ReactNode } from 'react';
import { useGarageStore } from '../store/useGarageStore';
import { Wrench, ShieldAlert, ExternalLink } from 'lucide-react';

interface TrialGuardProps {
    children: ReactNode;
}

export default function TrialGuard({ children }: TrialGuardProps) {
    const { settings } = useGarageStore();
    const firstSeenAt = settings.firstSeenAt || Date.now();
    const trialDays = 7;
    const msInDay = 24 * 60 * 60 * 1000;
    const expiryTime = firstSeenAt + (trialDays * msInDay);
    const isExpired = Date.now() > expiryTime;

    if (!isExpired) return <>{children}</>;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'white', zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 30, textAlign: 'center'
        }}>
            <div style={{ 
                width: 80, height: 80, borderRadius: 24, background: '#FEF2F2', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#EF4444', marginBottom: 24
            }}>
                <ShieldAlert size={40} />
            </div>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--color-text)', marginBottom: 12 }}>
                Perioada de testare a expirat
            </h1>
            
            <p style={{ fontSize: '1rem', color: 'var(--color-text-2)', lineHeight: 1.6, maxWidth: 400, marginBottom: 32 }}>
                Cele 7 zile de testare gratuită pentru <strong>AI Garage</strong> au luat sfârșit. 
                Pentru a continua să folosești platforma la capacitate maximă, te rugăm să ne contactezi.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
                <a 
                    href="https://velocityautomationai.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '16px', borderRadius: 16, background: 'var(--color-primary)',
                        color: 'white', fontWeight: 900, textDecoration: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 8px 20px rgba(37,99,235,0.2)'
                    }}
                >
                    Upgradează acum <ExternalLink size={18} />
                </a>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                    <Wrench size={16} color="var(--color-text-3)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--color-text-3)' }}>Powered by Velocity Automation</span>
                </div>
            </div>
        </div>
    );
}
