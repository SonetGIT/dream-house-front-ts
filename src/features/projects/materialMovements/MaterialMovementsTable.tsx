import { TablePagination } from '@/components/ui/TablePagination';
import type { Pagination } from '@/features/users/userSlice';
import { useReference } from '@/features/reference/useReference';
import type { WarehouseMovement } from './materialMovementsSlice';
import { formatDateTime } from '@/utils/formatDateTime';

type MaterialMovementsProps = {
    items: WarehouseMovement[];
    loading?: boolean;
    pagination?: Pagination | null;
    onPageChange?: (page: number) => void;
    onSizeChange?: (size: number) => void;
};

export default function MaterialMovementsTable({
    items = [],
    loading = false,
    pagination = null,
    onPageChange,
    onSizeChange,
}: MaterialMovementsProps) {
    const warehouseMap = useReference('warehouses');
    const materials = useReference('materials');
    const users = useReference('users');

    const getOperationLabel = (operation: string) => {
        if (operation === '+') return 'Приход';
        if (operation === '-') return 'Расход';

        return operation || '—';
    };

    const getOperationClassName = (operation: string) => {
        if (operation === '+') {
            return 'bg-green-100 text-green-700';
        }

        if (operation === '-') {
            return 'bg-red-100 text-red-600';
        }

        return 'bg-gray-100 text-gray-600';
    };

    if (loading) {
        return (
            <div className="w-full p-4 overflow-hidden text-sm text-gray-500 bg-white border rounded-xl">
                Загрузка...
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="w-full p-4 overflow-hidden text-sm text-gray-400 bg-white border rounded-xl">
                Нет данных
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden bg-white border rounded-xl">
            <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-blue-50/30">
                    <tr className="text-gray-700">
                        <th className="px-3 py-2 text-sm text-left">№</th>

                        <th className="px-3 py-2 text-sm text-left">Дата</th>
                        <th className="px-3 py-2 text-sm text-left">Материал</th>
                        <th className="px-3 py-2 text-sm text-left">Операция</th>
                        <th className="px-3 py-2 text-sm text-left">Откуда</th>
                        <th className="px-3 py-2 text-sm text-left">Куда</th>
                        <th className="px-3 py-2 text-sm text-right">Кол-во</th>
                        <th className="px-3 py-2 text-sm text-left">Пользователь</th>
                        <th className="px-3 py-2 text-sm text-left">Комментарий</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((t) => (
                        <tr key={t.id} className="transition border-t hover:bg-gray-50">
                            <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                                {t.id}
                            </td>
                            <td className="px-3 py-3 text-sm text-blue-900 whitespace-nowrap">
                                {formatDateTime(t.date)}
                            </td>

                            <td className="px-3 py-3 text-sm text-gray-600">
                                {t.material_id ? materials.lookup(t.material_id) : '—'}
                            </td>

                            <td className="px-3 py-3">
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getOperationClassName(
                                        t.operation,
                                    )}`}
                                >
                                    {getOperationLabel(t.operation)}
                                </span>
                            </td>

                            <td className="px-3 py-3 text-sm text-gray-600">
                                {t.from_warehouse_id
                                    ? warehouseMap.lookup(t.from_warehouse_id)
                                    : '—'}
                            </td>

                            <td className="px-3 py-3 text-sm text-gray-600">
                                {t.to_warehouse_id ? warehouseMap.lookup(t.to_warehouse_id) : '—'}
                            </td>

                            <td className="px-3 py-3 text-sm text-right text-gray-900">
                                {t.quantity ?? 0}
                            </td>

                            <td className="px-3 py-3 text-sm text-gray-700">
                                {t.user_id ? users.lookup(t.user_id) : '—'}
                            </td>

                            <td className="px-3 py-3 text-sm text-violet-500 max-w-[200px] truncate">
                                {t.note || '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {pagination && (
                <TablePagination
                    pagination={pagination}
                    onPageChange={(newPage) => {
                        onPageChange?.(newPage);
                    }}
                    onSizeChange={(newSize) => {
                        onSizeChange?.(newSize);
                    }}
                    sizeOptions={[10, 25, 50, 100]}
                    showFirstButton
                    showLastButton
                />
            )}
        </div>
    );
}
