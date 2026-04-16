import { useEffect, useMemo, useState } from 'react';
import { FolderOpen, Trash2 } from 'lucide-react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { Pagination, User } from '@/features/users/userSlice';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import { useCurrencyRates } from '@/utils/useCurrencyRates';
import { parseNumber } from '@/utils/parseNumber';
import { useAppDispatch } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import { fetchWorkPerformedItems, type WorkPerformedItem } from './workPerformedItemsSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

interface WorkPerformedItemsProps {
    workPerformedId: number;
    refs: Record<string, ReferenceResult>;
    onDelete: (id: number) => void;
    currentUser: User | null;
    items: WorkPerformedItem[];
    pagination: Pagination | null;
    //синхронизация
    onChange: (items: WorkPerformedItem[]) => void;
}

export const estimateTypeId = 1;
export const addTypeId = 2;

/*******************************************************************************/
export default function WorkPerformedItemsTable({
    workPerformedId,
    refs,
    onDelete,
    currentUser,
    items,
    pagination,
    onChange,
}: WorkPerformedItemsProps) {
    const dispatch = useAppDispatch();
    const rates = useCurrencyRates();

    const isPTO = currentUser?.role_id === 10;

    const [editedItems, setEditedItems] = useState<Record<number, any>>({});

    const filteredItems = useMemo(() => {
        return items.filter((i) => i.work_performed_id === workPerformedId);
    }, [items, workPerformedId]);

    /* INIT */
    useEffect(() => {
        let hasNew = false;

        for (const item of filteredItems) {
            if (!editedItems[item.id]) {
                hasNew = true;
                break;
            }
        }

        if (!hasNew) return; // ВЫХОД — нет обновлений

        setEditedItems((prev) => {
            const updated = { ...prev };

            filteredItems.forEach((item) => {
                if (!prev[item.id]) {
                    updated[item.id] = {
                        id: item.id,
                        quantity: item.quantity ?? 1,
                        price: item.price ?? 0,
                        currency: item.currency ?? 1,
                        currency_rate: item.currency_rate ?? 1,
                        item_type: item.item_type,
                    };
                }
            });

            return updated;
        });
    }, [filteredItems, editedItems]);

    useEffect(() => {
        const newMergedItems = items
            .filter((i) => i.work_performed_id === workPerformedId)
            .map((item) => ({
                ...item,
                ...editedItems[item.id],
            }));

        onChange?.(newMergedItems);
    }, [editedItems]);

    /* CHANGE */
    const handleChange = (id: number, field: string, value: any) => {
        setEditedItems((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    /* MERGED */
    const mergedItems = useMemo(() => {
        return filteredItems.map((item) => ({
            ...item,
            ...editedItems[item.id],
        }));
    }, [filteredItems, editedItems]);

    /* EMPTY */
    if (filteredItems.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-medium text-gray-900">Нет услуг</h3>
            </div>
        );
    }

    /*****************************************************************************************************************/
    return (
        // <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
        <div className="overflow-visible bg-white border rounded-lg shadow-sm">
            <table className="w-full">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="w-12 px-3 py-3 text-xs font-semibold text-left">№</th>
                        <th className="px-3 py-2 text-xs text-left">Тип заявки</th>
                        <th className="px-3 py-2 text-xs text-left">Этап</th>
                        <th className="px-3 py-2 text-xs text-left">Подэтап</th>
                        <th className="px-3 py-2 text-xs text-left">Тип услуги</th>
                        <th className="px-3 py-2 text-xs text-left">Услуга</th>
                        <th className="px-3 py-2 text-xs text-left">Ед. изм</th>
                        <th className="px-3 py-2 text-xs text-right">Кол-во</th>
                        <th className="px-3 py-2 text-xs text-right">Валюта</th>
                        <th className="px-3 py-2 text-xs text-right">Курс НБКР</th>
                        <th className="px-3 py-2 text-xs text-right">Цена</th>
                        <th className="px-3 py-2 text-xs text-right">Сумма</th>
                        <th className="px-3 py-2 text-xs text-center">Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {mergedItems?.map((item, index) => {
                        const edited = editedItems[item.id] || {};

                        const isManual = Number(item.item_type) === addTypeId;
                        const canEdit = isManual && isPTO && item.status === 1;
                        // const canEdit = isManual && (isPTO || isMainEngineer) && item.status === 1;

                        return (
                            <tr key={item.id}>
                                <td className="px-2 py-2 text-xs font-medium text-gray-700">
                                    {index + 1}
                                </td>

                                <td className="px-2 py-2 text-center text-gray-900 border-l">
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border rounded
                                            ${
                                                item.item_type === estimateTypeId
                                                    ? 'text-pink-800 bg-pink-100 border-pink-200'
                                                    : item.item_type === addTypeId
                                                      ? 'text-orange-800 bg-orange-100 border-orange-200'
                                                      : 'text-gray-800 bg-gray-100 border-gray-200'
                                            }
                                        `}
                                    >
                                        {item.item_type != null
                                            ? refs.workPerformedItemTypes.lookup(
                                                  Number(item.item_type),
                                              )
                                            : '—'}
                                    </span>
                                </td>

                                <td className="px-2 py-2 text-sm text-gray-600">
                                    {refs.blockStages.lookup(item.stage_id)}
                                </td>

                                <td className="px-2 py-2 text-sm text-gray-600">
                                    {refs.stageSubsections.lookup(item.subsection_id)}
                                </td>

                                <td className="px-2 py-2 text-sm text-gray-600">
                                    {refs.serviceTypes.lookup(item.service_type)}
                                </td>

                                <td className="px-2 py-2 text-sm text-gray-600">
                                    {refs.services.lookup(item.service_id)}
                                </td>

                                <td className="px-2 py-2 text-sm text-gray-600">
                                    {refs.unitsOfMeasure.lookup(item.unit_of_measure)}
                                </td>

                                <td className="px-2 py-2 text-sm text-right text-gray-900">
                                    {canEdit ? (
                                        <input
                                            type="text"
                                            value={edited.quantity ?? ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    item.id,
                                                    'quantity',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-16 px-2 py-1.5 border rounded text-right"
                                        />
                                    ) : (
                                        item.quantity
                                    )}
                                </td>

                                {/* Валюта */}
                                <td className="px-3 py-2 text-sm text-right text-blue-500">
                                    {canEdit ? (
                                        <ReferencesSelect
                                            options={refs.currencies.data || []}
                                            value={edited.currency ?? null}
                                            onChange={(v) => {
                                                handleChange(item.id, 'currency', v);

                                                const rate = rates.find(
                                                    (r) => Number(r.currency_id) === Number(v),
                                                )?.rate;

                                                handleChange(item.id, 'currency_rate', rate ?? 1);
                                            }}
                                        />
                                    ) : item.currency != null ? (
                                        refs.currencies.lookup(item.currency)
                                    ) : (
                                        '—'
                                    )}
                                </td>

                                {/* Курс */}
                                <td className="px-3 py-3 text-sm text-right">
                                    {canEdit ? (
                                        <input
                                            type="text"
                                            value={edited.currency_rate ?? ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    item.id,
                                                    'currency_rate',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-20 px-2 py-1.5 border rounded text-right"
                                        />
                                    ) : (
                                        item.currency_rate
                                    )}
                                </td>

                                {/* Цена */}
                                <td className="px-2 py-2 font-medium text-right">
                                    {canEdit ? (
                                        <input
                                            type="text"
                                            value={edited.price ?? ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    item.id,
                                                    'price',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-16 px-2 py-1.5 border rounded text-right"
                                        />
                                    ) : (
                                        item.price
                                    )}
                                </td>

                                {/* Сумма */}
                                <td className="px-2 py-2 font-medium text-right text-green-600">
                                    {(
                                        (edited.quantity ?? item.quantity ?? 0) *
                                        (edited.coefficient ?? item.coefficient ?? 1) *
                                        (edited.price ?? item.price ?? 0) *
                                        (edited.currency_rate ?? item.currency_rate ?? 1)
                                    ).toFixed(2)}
                                </td>
                                <td className="px-2 py-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <StyledTooltip title="Удалить">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(item.id);
                                                }}
                                                className="
                                                    p-1.5
                                                    text-red-600
                                                    hover:text-red-900
                                                    hover:bg-red-200
                                                    rounded
                                                    transition-colors
                                                "
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </StyledTooltip>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {pagination && (
                <TablePagination
                    pagination={pagination}
                    onPageChange={(newPage) => {
                        dispatch(
                            fetchWorkPerformedItems({
                                work_performed_id: workPerformedId,
                                page: newPage,
                                size: pagination.size,
                            }),
                        );
                    }}
                    onSizeChange={(newSize) => {
                        dispatch(
                            fetchWorkPerformedItems({
                                work_performed_id: workPerformedId,
                                page: 1,
                                size: newSize,
                            }),
                        );
                    }}
                    sizeOptions={[10, 25, 50, 100]}
                    showFirstButton
                    showLastButton
                />
            )}
        </div>
    );
}
