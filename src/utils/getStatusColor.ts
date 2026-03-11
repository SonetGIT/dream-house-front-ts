import { useReference } from '@/features/reference/useReference';

const statuses = useReference('generalStatuses');

export default function getStatusColor(statusId: number | null) {
    if (statusId === null) {
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }

    const fullStatus = statuses.lookup(statusId);

    const statusColorMap: Record<string, string> = {
        Черновик:
            'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm',
        Подписан:
            'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm',
        Отклонен:
            'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200 shadow-sm',
        Архив: 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border border-sky-200 shadow-sm',
    };

    return statusColorMap[fullStatus] || 'bg-gray-50 text-gray-700 border border-gray-200';
}
