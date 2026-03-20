import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchMaterialRequestItems } from '../material_request_items/materialRequestItemsSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import { RowActions } from '@/components/ui/RowActions';
import { Trash2 } from 'lucide-react';

interface MatREqItemsProps {
    materialRequestId: number;
    refs: any;
    onDelete: (id: number) => void;
}

const matReqItemStatuses: Record<number, { label: string; className: string }> = {
    1: {
        label: 'Создан',
        className: 'bg-lime-100 text-lime-800 border-lime-200',
    },
    2: {
        label: 'Одобрено',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    3: {
        label: 'Частично заказано',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    4: {
        label: 'Полностью заказано',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    5: {
        label: 'Отменено',
        className: 'bg-red-100 text-red-800 border-red-200',
    },
};

/*******************************************************************************************************/
export default function MaterialRequestItemsTable({
    materialRequestId,
    refs,
    onDelete,
}: MatREqItemsProps) {
    const dispatch = useAppDispatch();

    const { items, loading, pagination } = useAppSelector((state) => state.materialRequestItems);

    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(
            fetchMaterialRequestItems({
                material_request_id: materialRequestId,
                page: 1,
                size: 10,
            }),
        );
    }, [materialRequestId, dispatch]);

    const getStatusConfig = (statusId: number) => {
        return (
            matReqItemStatuses[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };
    /********************************************************************************************************/
    return (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <table className="w-full">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="w-12 px-3 py-3 text-sm font-semibold text-left">№</th>
                        <th className="px-3 py-2 text-sm text-left">Тип</th>
                        <th className="px-3 py-2 text-sm text-left">Материал</th>
                        <th className="px-3 py-2 text-sm text-left">Ед. изм</th>
                        <th className="px-3 py-2 text-sm text-right">Кол-во</th>
                        <th className="px-3 py-2 text-sm text-right">Валюта</th>
                        <th className="px-3 py-2 text-sm text-right">Курс</th>
                        <th className="px-3 py-2 text-sm text-right">Цена</th>
                        <th className="px-3 py-2 text-sm text-right">Сумма</th>
                        <th className="px-3 py-2 text-sm text-right">Примечание</th>
                        <th className="px-3 py-2 text-sm text-center">Статус</th>
                        <th className="px-3 py-2 text-sm text-center">Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {items?.map((item, index) => {
                        const statusInfo = getStatusConfig(item.status);

                        return (
                            <tr key={item.id}>
                                {/* Номер */}
                                <td className="px-2 py-2 text-xs font-medium text-gray-700">
                                    {index + 1}
                                </td>

                                <td className="px-2 py-2 text-sm text-gray-600">
                                    {refs.materialTypes.lookup(item.material_type)}
                                </td>

                                <td className="px-2 py-2 text-sm text-gray-600">
                                    {refs.materials.lookup(item.material_id)}
                                </td>

                                <td className="px-2 py-2 text-sm text-gray-600">
                                    {refs.unitsOfMeasure.lookup(item.unit_of_measure)}
                                </td>

                                {/* Количество */}
                                <td className="px-2 py-2 text-sm text-right text-gray-900">
                                    {item.quantity}
                                </td>

                                {/* Валюта */}
                                <td className="px-2 py-2 text-sm text-right text-blue-700">
                                    {item.currency != null
                                        ? refs.currencies.lookup(item.currency)
                                        : '—'}
                                </td>

                                {/* Курс */}
                                <td className="px-2 py-2 font-medium text-right">
                                    {item.currency_rate}
                                </td>

                                {/* Цена */}
                                <td className="px-2 py-2 font-medium text-right">{item.price}</td>

                                {/* Сумма */}
                                <td className="px-2 py-2 font-medium text-right text-green-600">
                                    {/* если есть функция расчета — вставь */}
                                </td>

                                {/* Примечание */}
                                <td className="px-2 py-2 text-xs text-center text-gray-600">
                                    {item.comment || '—'}
                                </td>

                                {/* Статус */}
                                <td className="px-3 py-2.5">
                                    <span
                                        className={`
                                        inline-flex text-center px-2 py-0.5
                                        text-xs font-semibold border rounded-full
                                        ${statusInfo.className}
                                    `}
                                    >
                                        {refs.materialRequestItemStatuses.lookup(item.status)}
                                    </span>
                                </td>

                                {/* Действия */}
                                <td className="px-2 py-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <RowActions
                                            row={item}
                                            actions={[
                                                {
                                                    label: 'Удалить',
                                                    icon: Trash2,
                                                    onClick: () => onDelete(item.id),
                                                    className: 'text-red-600 hover:bg-red-50',
                                                },
                                            ]}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* ПАГИНАЦИЯ + КНОПКА */}
            <div className="space-y-3">
                {pagination && (
                    <div
                        className={`
                        w-full
                        ${loading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                    >
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                setPage(newPage);

                                dispatch(
                                    fetchMaterialRequestItems({
                                        material_request_id: materialRequestId,
                                        page: newPage,
                                        size: pagination.size,
                                    }),
                                );
                            }}
                            onSizeChange={(newSize) => {
                                setPage(1);

                                dispatch(
                                    fetchMaterialRequestItems({
                                        material_request_id: materialRequestId,
                                        page: 1,
                                        size: newSize,
                                    }),
                                );
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
