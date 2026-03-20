import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    label?: string;
    to?: string;
}

export default function BackButton({ label = 'Înapoi', to = '/' }: BackButtonProps) {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(to)}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', padding: '4px 0',
                color: 'var(--color-primary)', fontSize: '0.8125rem',
                fontWeight: 700, cursor: 'pointer', marginBottom: 12,
            }}
        >
            <ArrowLeft size={16} />
            {label}
        </button>
    );
}
