export const getStatusColor = (statusId: number | null, lookup: (id: number) => string) => {
    if (statusId === null) {
        return 'bg-gray-100 text-gray-700 border border-gray-200 rounded-lg';
    }

    const fullStatus = lookup(statusId);

    const statusColorMap: Record<string, string> = {
        Черновик: 'bg-amber-50 text-amber-700 text-xs border border-amber-200 rounded-lg',
        Подписан: 'bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 rounded-lg',
        Отклонен: 'bg-rose-50 text-rose-700 text-xs border border-rose-200 rounded-lg',
        Архив: 'bg-blue-50 text-blue-700 text-xs border border-blue-200 rounded-lg',
    };

    return (
        statusColorMap[fullStatus] || 'bg-gray-100 text-gray-700 border border-gray-200 rounded-lg'
    );
};
