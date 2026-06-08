export default function UnitStat({
    label,
    count,
    color,
}: {
    label: string;
    count: number;
    color: string;
}) {
    const isZero = count === 0;
    return (
        <div className={`text-center ${isZero ? 'opacity-40' : ''}`}>
            <div className={`text-sm font-semibold ${color}`}>{count}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}
