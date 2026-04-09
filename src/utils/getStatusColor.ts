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

// taskStatuses/gets
export const taskStatuses: Record<number, { label: string; className: string }> = {
    1: {
        label: 'Создана',
        className: 'bg-gray-500/15 text-gray-700 border border-gray-400',
    },
    2: {
        label: 'Ознакомлен',
        className: 'bg-blue-500/15 text-blue-700 border border-blue-400',
    },
    3: {
        label: 'В работе',
        className: 'bg-amber-500/15 text-amber-700 border border-amber-400',
    },
    4: {
        label: 'Исполнена',
        className: 'bg-green-600/15 text-green-700 border border-green-500',
    },
    5: {
        label: 'Отменена',
        className: 'bg-rose-500/15 text-rose-700 border border-rose-400',
    },
};

// taskPriorities/gets
export const taskPriorities: Record<number, { label: string; className: string }> = {
    1: {
        label: 'Низкий',
        className: 'bg-gray-500/15 text-gray-700 border border-gray-400',
    },
    2: {
        label: 'Средний',
        className: 'bg-blue-500/15 text-blue-700 border border-blue-400',
    },
    3: {
        label: 'Высокий',
        className: 'bg-amber-500/15 text-amber-700 border border-amber-400',
    },
    4: {
        label: 'Критический',
        className: 'bg-red-600/15 text-red-700 border border-red-500',
    },
};
