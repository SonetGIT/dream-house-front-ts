import { Fragment, useMemo, useState } from 'react';
import { useAppSelector } from '@/app/store';
import EstimateDetails from './EstimateDetails';
import EstimateRow from './EstimateRow';
import type { Estimate } from './estimatesSlice';
import { calcRowTotal } from '@/utils/calcRowTotal';

interface EstTblTableProps {
    blockId: number;
    data: Estimate[];
    onDeleteEstimateId: (id: number) => void;
    onDeleteEstimateItemId: (id: number) => void;
}

/*************************************************************************************************************************/
export default function EstimatesTable({
    blockId,
    data,
    onDeleteEstimateId,
    onDeleteEstimateItemId,
}: EstTblTableProps) {
    const estimateItems = useAppSelector((state) => state.estimateItems.byEstimateId);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (id: number) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const sums = useMemo(() => {
        const result: Record<number, { material: number; service: number }> = {};

        Object.entries(estimateItems).forEach(([estimateId, items]) => {
            const id = Number(estimateId);

            const material = items
                .filter((i) => i.item_type === 1)
                .reduce((sum, row) => sum + calcRowTotal(row), 0);

            const service = items
                .filter((i) => i.item_type === 2)
                .reduce((sum, row) => sum + calcRowTotal(row), 0);

            result[id] = { material, service };
        });

        return result;
    }, [estimateItems]);

    /********************************************************************************************************************/
    return (
        <div className="space-y-4">
            {/* Table - ESTIMATES*/}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* ESTIMATES- HEADER */}
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-left bg-gray-50"></th>
                                <th className="w-24 px-4 py-3 text-left bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Статус</div>
                                </th>
                                <th className="w-24 px-4 py-3 text-left bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">
                                        Наименование
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Материалы (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Услуги (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right border-l bg-green-50">
                                    <div className="text-xs font-semibold text-green-700 uppercase">
                                        Стоимость (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-green-50 w-[700px]">
                                    <div className="text-xs font-semibold text-green-700 uppercase">
                                        Этап подписи
                                    </div>
                                </th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => {
                                const signatures = [
                                    {
                                        label: 'Инженер ПТО',
                                        userId: workPerf.planning_engineer_user_id,
                                        approved: workPerf.signed_by_planning_engineer,
                                        approvedTime: workPerf.signed_by_planning_engineer_time,
                                    },
                                    {
                                        label: 'Гл. инженер',
                                        userId: workPerf.main_engineer_user_id,
                                        approved: workPerf.signed_by_main_engineer,
                                        approvedTime: workPerf.signed_by_main_engineer_time,
                                    },
                                    {
                                        label: 'Ген. директор',
                                        userId: workPerf.main_engineer_user_id,
                                        approved: workPerf.signed_by_main_engineer,
                                        approvedTime: workPerf.signed_by_main_engineer_time,
                                    },
                                ];
                                const items = estimateItems[item.id] ?? [];
                                const isExpanded = expandedRows.has(item.id);

                                return (
                                    <Fragment key={item.id}>
                                        <EstimateRow
                                            item={item}
                                            isExpanded={isExpanded}
                                            toggleRow={toggleRow}
                                            onDeleteEstimateId={onDeleteEstimateId}
                                            materialSum={sums[item.id]?.material || 0}
                                            serviceSum={sums[item.id]?.service || 0}
                                            totalSum={
                                                (sums[item.id]?.material || 0) +
                                                (sums[item.id]?.service || 0)
                                            }
                                        />
                                        {/*ЭТАП ПОДПИСИ  */}
                                        <td className="px-2 py-2 pl-2 text-sm text-center text-gray-900 ">
                                            <div className="grid grid-cols-3 gap-4 text-xs items-left">
                                                {signatures.map((s) => (
                                                    <div
                                                        key={s.label}
                                                        className="space-y-0.5 text-left"
                                                    >
                                                        {/* ROLE */}
                                                        <div className="flex items-center gap-1 pl-1 font-medium text-gray-700">
                                                            <span className="space-y-0.5 text-left min-w-0 text-xs">
                                                                {s.label}
                                                            </span>
                                                        </div>

                                                        {/* USER */}
                                                        <div className="text-[0.75rem] text-gray-500 italic truncate pl-1">
                                                            {s.userId
                                                                ? props.refs.users.lookup(s.userId)
                                                                : '—'}
                                                        </div>

                                                        {/* STATUS */}
                                                        <div
                                                            className={`text-[0.75rem] pl-1 whitespace-nowrap ${
                                                                s.approved
                                                                    ? 'text-green-600'
                                                                    : s.approved === false
                                                                      ? 'text-red-500'
                                                                      : 'text-gray-400'
                                                            }`}
                                                        >
                                                            {s.approved === true
                                                                ? `✔ ${formatDateTime(s.approvedTime)}`
                                                                : s.approved === false
                                                                  ? `✖ ${formatDateTime(s.approvedTime)}`
                                                                  : '⏳ Ожидает'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        {isExpanded && (
                                            <EstimateDetails
                                                blockId={blockId}
                                                item={item}
                                                items={items}
                                                onDeleteEstimateItemId={onDeleteEstimateItemId}
                                            />
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
