export default function TypeChips({
    apt,
    com,
    park,
    stor,
}: {
    apt: number;
    com: number;
    park: number;
    stor: number;
}) {
    // Хелпер для определения стилей
    const getChipStyle = (value: number, baseClass: string) => {
        return value === 0 ? 'opacity-60 bg-gray-80 text-gray-600 border-gray-400' : baseClass;
    };

    return (
        <div className="flex flex-wrap gap-2">
            <span
                className={`px-1.5 py-0.5 text-xs border rounded ${getChipStyle(apt, 'bg-sky-50 text-sky-700 border-sky-200')}`}
            >
                Кв: {apt}
            </span>
            <span
                className={`px-1.5 py-0.5 text-xs border rounded ${getChipStyle(com, 'bg-purple-50 text-purple-700 border-purple-200')}`}
            >
                Ком.пом: {com}
            </span>
            <span
                className={`px-1.5 py-0.5 text-xs border rounded ${getChipStyle(park, 'bg-slate-50 text-slate-600 border-slate-200')}`}
            >
                Парк: {park}
            </span>
            <span
                className={`px-1.5 py-0.5 text-xs border rounded ${getChipStyle(stor, 'bg-orange-50 text-orange-600 border-orange-200')}`}
            >
                Клад: {stor}
            </span>
        </div>
    );
}
