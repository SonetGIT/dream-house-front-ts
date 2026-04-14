import { Plus, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/app/store';

import ReferencesSelect from '@/components/ui/ReferencesSelect';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

import { parseNumber } from '@/utils/parseNumber';
import toast from 'react-hot-toast';
import { useCurrencyRates } from '@/utils/useCurrencyRates';
import type { EstimateItem } from '../../projectBlocks/estimatess/estimateItems/estimateItemsSlice';
import { createWorkPerformed, fetchWorkPerformed } from '../workPerformedSlice';
import { fetchWorkPerformedItems } from '../workPerformedItems/workPerformedItemsSlice';
import { useServiceRows, type ServiceRow } from './useServiceRows';

/*PROPS*/
interface Props {
    projectId: number;
    blockId: number;

    initialItems?: EstimateItem[];
    refs: Record<string, ReferenceResult>;

    onCancel: () => void;
}

/*COMPONENT*/
export default function WorkPerformedItemCreateEditForm({
    projectId,
    blockId,
    initialItems = [],
    refs,
    onCancel,
}: Props) {
    const dispatch = useAppDispatch();
    const rates = useCurrencyRates();

    const { rows, updateRow, addRow, removeRow } = useServiceRows({
        initialItems,
        refs,
    });

    const services = refs.services?.data || [];
    const serviceTypes = refs.serviceTypes?.data || [];
    const units = refs.unitsOfMeasure?.data || [];
    const currencies = refs.currencies?.data || [];
    const blockStages = refs.blockStages?.data || [];
    const stageSubsections = refs.stageSubsections?.data || [];

    const calcSum = (row: ServiceRow) => {
        const total = (row.quantity || 0) * (row.price || 0) * (row.currency_rate || 1);
        return Number(isNaN(total) ? '0.00' : total.toFixed(2));
    };

    const isRowValid = (r: ServiceRow) => {
        return (
            r.stage_id !== null &&
            r.subsection_id !== null &&
            r.service_type !== null &&
            r.service_id !== null &&
            r.unit_of_measure !== null &&
            r.currency !== null &&
            r.quantity > 0 &&
            r.price >= 0
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const invalidRows = rows.filter((r) => !isRowValid(r));

        if (invalidRows.length > 0) {
            toast.error('Заполните все обязательные поля!');
            return;
        }

        try {
            const res = await dispatch(
                createWorkPerformed({
                    project_id: projectId,
                    block_id: blockId,
                    status: 1,
                    items: rows.map((r) => ({
                        item_type: r.isFromEstimate ? 1 : 2,
                        stage_id: r.stage_id,
                        subsection_id: r.subsection_id,
                        service_type: r.service_type,
                        service_id: r.service_id,
                        unit_of_measure: r.unit_of_measure,
                        quantity: r.quantity,
                        currency: r.currency,
                        currency_rate: r.currency_rate,
                        price: r.price,
                        comment: r.comment,
                    })),
                }),
            ).unwrap();

            //достаём id
            const newId = res?.id;
            console.log(newId);
            if (newId) {
                await dispatch(
                    fetchWorkPerformedItems({
                        work_performed_id: newId,
                        page: 1,
                        size: 10,
                    }),
                );
            }
            await dispatch(
                fetchWorkPerformed({
                    project_id: projectId,
                    blockId: blockId,
                    page: 1,
                    size: 10,
                }),
            );
            onCancel();
        } catch (e) {
            toast.error('Ошибка создания заявки');
        }
    };

    /************************************************************************************************************/
    return (
        <div className="space-y-4">
            <div className="flex-1 p-4 overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-xs border">№</th>
                            <th className="border px-3 py-3 text-xs min-w-[180px]">Этап</th>
                            <th className="border px-3 py-3 text-xs min-w-[200px]">Подэтап</th>
                            <th className="border px-3 py-3 text-xs min-w-[180px]">Тип услуги</th>
                            <th className="border px-3 py-3 text-xs min-w-[200px]">Услуга</th>
                            <th className="border px-3 py-3 text-xs min-w-[160px]">Ед. изм</th>
                            <th className="border px-3 py-3 text-xs min-w-[100px]">Кол-во</th>
                            <th className="border px-3 py-3 text-xs min-w-[130px]">Валюта</th>
                            <th className="border px-3 py-3 text-xs min-w-[120px]">Курс НБКР</th>
                            <th className="border px-3 py-3 text-xs min-w-[100px]">Цена</th>
                            <th className="border px-3 py-3 text-xs min-w-[100px] text-green-700">
                                Сумма
                            </th>
                            <th className="border px-3 py-3 text-xs min-w-[150px]">Примечание</th>
                            <th className="px-3 py-3 text-xs border">Действия</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, index) => {
                            const isReadonly = row.isFromEstimate;

                            const filteredServices = row.service_type
                                ? services.filter(
                                      (s: any) =>
                                          Number(s.service_type) === Number(row.service_type),
                                  )
                                : [];

                            const filteredSubStages = row.stage_id
                                ? stageSubsections.filter(
                                      (s: any) => Number(s.stage_id) === Number(row.stage_id),
                                  )
                                : [];

                            return (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-center border">{index + 1}</td>
                                    {/* Этап */}
                                    <td className="px-3 py-2 border">
                                        <ReferencesSelect
                                            options={blockStages}
                                            value={row.stage_id}
                                            disabled={isReadonly}
                                            onChange={(v) => updateRow(row.id, 'stage_id', v)}
                                        />
                                    </td>

                                    {/* Подэтап */}
                                    <td className="px-3 py-2 border">
                                        <ReferencesSelect
                                            options={filteredSubStages}
                                            value={row.subsection_id}
                                            disabled={isReadonly}
                                            onChange={(v) => updateRow(row.id, 'subsection_id', v)}
                                        />
                                    </td>

                                    {/* Тип */}
                                    <td className="px-3 py-2 border">
                                        <ReferencesSelect
                                            options={serviceTypes}
                                            value={row.service_type}
                                            disabled={isReadonly}
                                            onChange={(v) => {
                                                updateRow(row.id, 'service_type', v);
                                                updateRow(row.id, 'service_id', null);
                                            }}
                                        />
                                    </td>

                                    {/* Услуга */}
                                    <td className="px-3 py-2 border">
                                        <ReferencesSelect
                                            options={filteredServices}
                                            value={row.service_id}
                                            disabled={!row.service_type || isReadonly}
                                            onChange={(v) => {
                                                updateRow(row.id, 'service_id', v);

                                                const service = services.find(
                                                    (m) => Number(m.id) === Number(v),
                                                );

                                                updateRow(
                                                    row.id,
                                                    'unit_of_measure',
                                                    service?.unit_of_measure
                                                        ? Number(service.unit_of_measure)
                                                        : null,
                                                );
                                            }}
                                        />
                                    </td>

                                    {/* Ед */}
                                    <td className="px-3 py-2 border">
                                        <ReferencesSelect
                                            options={units}
                                            value={row.unit_of_measure}
                                            disabled={isReadonly}
                                            onChange={(v) =>
                                                updateRow(row.id, 'unit_of_measure', v)
                                            }
                                        />
                                    </td>

                                    {/* Кол-во */}
                                    <td className="px-3 py-2 border">
                                        <input
                                            type="text"
                                            value={row.quantity}
                                            onChange={(e) =>
                                                updateRow(
                                                    row.id,
                                                    'quantity',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-full px-2 py-1 text-right border rounded border-fuchsia-500"
                                        />
                                    </td>

                                    {/* Валюта */}
                                    <td className="px-3 py-2 border">
                                        <ReferencesSelect
                                            options={currencies}
                                            value={row.currency}
                                            disabled={isReadonly}
                                            onChange={(v) => {
                                                updateRow(row.id, 'currency', v);

                                                if (!v) return;

                                                const rate = rates.find(
                                                    (r) => Number(r.currency_id) === Number(v),
                                                )?.rate;

                                                updateRow(row.id, 'currency_rate', rate ?? 1);
                                            }}
                                        />
                                    </td>

                                    {/* Курс */}
                                    <td className="px-3 py-2 border">
                                        <input
                                            type="text"
                                            value={row.currency_rate}
                                            disabled={isReadonly}
                                            onChange={(e) =>
                                                updateRow(
                                                    row.id,
                                                    'currency_rate',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-full px-2 py-1.5 border rounded text-right"
                                        />
                                    </td>

                                    {/* Цена */}
                                    <td className="px-3 py-2 border">
                                        <input
                                            type="text"
                                            value={row.price}
                                            disabled={isReadonly}
                                            onChange={(e) =>
                                                updateRow(
                                                    row.id,
                                                    'price',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-full px-2 py-1.5 border rounded text-right"
                                        />
                                    </td>

                                    {/* Сумма */}
                                    <td className="px-3 py-2 font-bold text-right text-green-700 border bg-green-50">
                                        {calcSum(row)}
                                    </td>
                                    <td className="px-3 py-2 border">
                                        <input
                                            type="text"
                                            value={row.comment}
                                            onChange={(e) =>
                                                updateRow(row.id, 'comment', e.target.value)
                                            }
                                            className="w-full px-2 py-1.5 border rounded"
                                        />
                                    </td>

                                    {/* Delete */}
                                    <td className="px-3 py-2 text-center border">
                                        <button
                                            onClick={() => removeRow(row.id)}
                                            disabled={rows.length === 1}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={addRow}
                    className="flex items-center px-4 py-2 text-sm text-white rounded bg-sky-600"
                >
                    <Plus className="w-4 h-4" />
                    Добавить услугу
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded"
                    >
                        Создать АВР
                    </button>
                    <button onClick={onCancel} className="px-4 py-2 text-sm border rounded">
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}
