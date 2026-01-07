import { useNavigate } from 'react-router-dom';

type CardsProps = { title: string; label: string; value: string; color?: string; to?: string };

export function Cards({ title, label, value, color, to }: CardsProps) {
    const navigate = useNavigate();

    return (
        <div className="cards" onClick={() => to && navigate(to)} role="button">
            <h4>{title}</h4>
            <div className="cards-row">
                <span>{label}</span>
                <strong style={{ color }}>{value}</strong>
            </div>
        </div>
    );
}
