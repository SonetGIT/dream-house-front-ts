import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type CardsProps = {
    title: string;
    label?: string;
    value?: string;
    color?: string;
    to?: string;
    icon?: ReactNode;
};

export function Cards({ title, label, value, color, to, icon }: CardsProps) {
    const navigate = useNavigate();

    return (
        <div
            className="cards"
            style={{ borderLeft: `4px double ${color || 'var(--primary)'}` }}
            onClick={() => to && navigate(to)}
            role="button"
        >
            {icon && (
                <div
                    className="cards-icon-title"
                    style={{
                        color,
                        fontSize: '1.4rem',
                    }}
                >
                    {icon}
                    <h4>{title}</h4>
                </div>
            )}

            <div className="cards-row">
                <div>
                    {/* <span>{label}</span> */}
                    <div className="cards-value" style={{ color }}>
                        Доп. информация {value}
                    </div>
                </div>
            </div>
        </div>
    );
}
