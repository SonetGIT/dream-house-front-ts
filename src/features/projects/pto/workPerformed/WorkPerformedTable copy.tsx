import { Fragment, useMemo, useState } from 'react';
import { useAppSelector } from '@/app/store';
import { calcRowTotal } from '@/utils/calcRowTotal';
import type { WorkPerformed } from './workPerformedSlice';
import WorkPerformedRow from './WorkPerformedRow';

interface WorkPerformedTableProps {
    blockId: number;
    data: WorkPerformed[];
    onDeleteWorkPerformedId: (id: number) => void;
    onDeleteWorkPerformedItemId: (id: number) => void;
}

/*************************************************************************************************************************/
export default function WorkPerformedTable({
    blockId,
    data,
    onDeleteWorkPerformedId,
    onDeleteWorkPerformedItemId,
}: WorkPerformedTableProps) {
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
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => {
                                const items = estimateItems[item.id] ?? [];
                                const isExpanded = expandedRows.has(item.id);

                                return (
                                    <Fragment key={item.id}>
                                        {/* <WorkPerformedRow
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
                                        /> */}

                                        {/* {isExpanded && (
                                            <EstimateDetails
                                                blockId={blockId}
                                                item={item}
                                                items={items}
                                                onDeleteEstimateItemId={onDeleteEstimateItemId}
                                            />
                                        )} */}
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
