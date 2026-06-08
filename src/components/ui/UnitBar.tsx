export default function UnitBar({
    total,
    free,
    reserved,
    sold,
    off,
}: {
    total: number;
    free: number;
    reserved: number;
    sold: number;
    off: number;
}) {
    if (!total) return null;
    const pct = (n: number) => `${(n / total) * 100}%`;

    return (
        <div className="flex h-2 w-full rounded-full overflow-hidden gap-0.5 mt-1.5 bg-gray-300">
            <div
                style={{ width: pct(free) }}
                className={`transition-all ${free > 0 ? 'bg-emerald-500' : 'bg-emerald-300'}`}
            />
            <div
                style={{ width: pct(reserved) }}
                className={`transition-all ${reserved > 0 ? 'bg-amber-500' : 'bg-amber-300'}`}
            />
            <div
                style={{ width: pct(sold) }}
                className={`transition-all ${sold > 0 ? 'bg-sky-500' : 'bg-sky-300'}`}
            />
            <div
                style={{ width: pct(off) }}
                className={`transition-all ${off > 0 ? 'bg-gray-400' : 'bg-gray-200'}`}
            />
        </div>
    );
}
