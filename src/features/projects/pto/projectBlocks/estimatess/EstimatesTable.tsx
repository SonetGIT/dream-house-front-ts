import { Fragment, useMemo, useState } from 'react';
import { Button, Collapse } from '@mui/material';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useReference } from '@/features/reference/useReference';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { useAppSelector } from '@/app/store';
import EstimateDetails from './EstimateDetails';
import EstimateRow from './EstimateRow';
import type { Estimate } from './estimatesSlice';
import { calcRowTotal } from '@/utils/calcRowTotal';
import { formatDateTime } from '@/utils/formatDateTime';
import type { User } from '@/features/users/userSlice';

interface EstimatesTableProps {
    blockId: number;
    data: Estimate[];
    currentUser?: User | null;
    canSign?: (estimate: Estimate, user?: User | null) => boolean;
    isFullyApproved?: (estimate: Estimate) => boolean;
    onSign?: (estimate: Estimate) => void;
    signing?: boolean;
    onDeleteEstimateId: (id: number) => void;
    onDeleteEstimateItemId: (id: number) => void;
}

const getSignatureClassName = (approved?: boolean | null) => {
    if (approved === true) return 'text-green-600';
    if (approved === false) return 'text-red-500';
    return 'text-gray-400';
};

const getSignatureText = (approved?: boolean | null, approvedTime?: string | null) => {
    if (approved === true) return `✔ ${formatDateTime(approvedTime)}`;
    if (approved === false) return `✖ ${formatDateTime(approvedTime)}`;
    return '⏳ Ожидает';
};

/*************************************************************************************************************************/
export default function EstimatesTable({
    blockId,
    data,
    currentUser,
    canSign,
    isFullyApproved,
    onSign,
    signing = false,
    onDeleteEstimateId,
    onDeleteEstimateItemId,
}: EstimatesTableProps) {
    const estimateItems = useAppSelector((state) => state.estimateItems.byEstimateId);
    const users = useReference('users');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (id: number) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const sums = useMemo(() => {
        const result: Record<number, { material: number; service: number }> = {};

        Object.entries(estimateItems).forEach(([estimateId, items]) => {
            const id = Number(estimateId);

            const material = items
                .filter((row) => row.item_type === 1)
                .reduce((sum, row) => sum + calcRowTotal(row), 0);

            const service = items
                .filter((row) => row.item_type === 2)
                .reduce((sum, row) => sum + calcRowTotal(row), 0);

            result[id] = { material, service };
        });

        return result;
    }, [estimateItems]);

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
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
                                <th className="w-[560px] px-4 py-3 text-center border-l bg-green-50">
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
                                        userId: item.planning_engineer_user_id,
                                        approved: item.signed_by_planning_engineer,
                                        approvedTime: item.signed_by_planning_engineer_time,
                                    },
                                    {
                                        label: 'Гл. инженер',
                                        userId: item.main_engineer_user_id,
                                        approved: item.signed_by_main_engineer,
                                        approvedTime: item.signed_by_main_engineer_time,
                                    },
                                    {
                                        label: 'Ген. директор',
                                        userId: item.general_director_user_id,
                                        approved: item.signed_by_general_director,
                                        approvedTime: item.signed_by_general_director_time,
                                    },
                                ];

                                const items = estimateItems[item.id] ?? [];
                                const isExpanded = expandedRows.has(item.id);
                                const showSignButton =
                                    !!currentUser &&
                                    !!canSign &&
                                    !!onSign &&
                                    canSign(item, currentUser);
                                const signDisabled = isFullyApproved
                                    ? isFullyApproved(item) || signing
                                    : signing;

                                return (
                                    <Fragment key={item.id}>
                                        <tr
                                            className="border-b transition-colors hover:bg-gray-50"
                                            onClick={() => toggleRow(item.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(item.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </td>

                                            <EstimateRow
                                                item={item}
                                                materialSum={sums[item.id]?.material || 0}
                                                serviceSum={sums[item.id]?.service || 0}
                                                totalSum={
                                                    (sums[item.id]?.material || 0) +
                                                    (sums[item.id]?.service || 0)
                                                }
                                            />

                                            <td className="px-2 py-2 pl-2 text-sm text-center text-gray-900 border-l">
                                                <div className="grid grid-cols-3 gap-3 text-xs items-start">
                                                    {signatures.map((signature) => (
                                                        <div
                                                            key={signature.label}
                                                            className="space-y-0.5 text-left"
                                                        >
                                                            <div className="flex items-center gap-1 pl-1 font-medium text-gray-700">
                                                                <span className="min-w-0 text-xs">
                                                                    {signature.label}
                                                                </span>
                                                            </div>

                                                            <div className="truncate pl-1 text-[0.75rem] italic text-gray-500">
                                                                {signature.userId
                                                                    ? users.lookup(signature.userId)
                                                                    : '—'}
                                                            </div>

                                                            <div
                                                                className={`whitespace-nowrap pl-1 text-[0.75rem] ${getSignatureClassName(
                                                                    signature.approved,
                                                                )}`}
                                                            >
                                                                {getSignatureText(
                                                                    signature.approved,
                                                                    signature.approvedTime,
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 border-l bg-gray-50">
                                                <div className="flex items-center justify-center gap-2">
                                                    <StyledTooltip title="Удалить смету">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteEstimateId(item.id);
                                                            }}
                                                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </StyledTooltip>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr className="border-b bg-gradient-to-r to-blue-50/50">
                                            <td colSpan={8} className="px-4 py-3">
                                                <Collapse in={isExpanded} unmountOnExit>
                                                    <div
                                                        className="space-y-3 px-2 py-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {showSignButton ? (
                                                            <div className="flex justify-center">
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    disabled={signDisabled}
                                                                    onClick={() => onSign?.(item)}
                                                                >
                                                                    Подписать
                                                                </Button>
                                                            </div>
                                                        ) : null}

                                                        <EstimateDetails
                                                            blockId={blockId}
                                                            item={item}
                                                            items={items}
                                                            onDeleteEstimateItemId={
                                                                onDeleteEstimateItemId
                                                            }
                                                        />
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>
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
