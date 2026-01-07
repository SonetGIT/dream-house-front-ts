const statuses = [
    { label: 'Draft', percent: 3, color: '#cbd5e1' },
    { label: 'Pending', percent: 5, color: '#60a5fa' },
    { label: 'Not Paid', percent: 12, color: '#fbbf24' },
    { label: 'Overdue', percent: 6, color: '#ef4444' },
    { label: 'Partially Paid', percent: 8, color: '#14b8a6' },
    { label: 'Paid', percent: 55, color: '#84cc16' },
];

export function StatusOverview({ title }: { title: string }) {
    return (
        <div className="status-card">
            <h4>{title}</h4>
            {statuses.map((s) => (
                <div key={s.label} className="status-row">
                    <span>{s.label}</span>
                    <span>{s.percent}%</span>
                    <div className="status-bar">
                        <div
                            className="status-bar-fill"
                            style={{ width: `${s.percent}%`, background: s.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
