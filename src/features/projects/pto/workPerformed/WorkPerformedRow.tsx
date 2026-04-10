import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { useReference } from '@/features/reference/useReference';
import { formatNumber } from '@/utils/formatNumber';
import { getStatusColor } from '@/utils/getStatusColor';
import type { WorkPerformedItem } from './workPerformedItems/workPerformedItemsSlice';

interface EstimateRowProps {
    item: WorkPerformedItem;
    isExpanded: boolean;
    toggleRow: (id: number) => void;
    onDeleteEstimateId: (id: number) => void;
    materialSum: number;
    serviceSum: number;
    totalSum: number;
}

/***********************************************************************************************************/
export default function WorkPerformedRow({
    item,
    isExpanded,
    toggleRow,
    onDeleteEstimateId,
    materialSum,
    serviceSum,
    totalSum,
}: EstimateRowProps) {
    const statuses = useReference('generalStatuses');
    /*****************************************************************************************************************/
    return (
        <tr className="transition-colors border-b hover:bg-gray-50">
            {/* toggle */}
            <td className="px-4 py-3">
                <button
                    onClick={() => toggleRow(item.id)}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>
            </td>

            {/* статус */}
            <td className="px-3 py-3">
                <span
                    className={`px-2 py-1 font-medium rounded ${getStatusColor(
                        item.status,
                        statuses.lookup,
                    )}`}
                >
                    {item.status != null ? statuses.lookup(item.status) : '—'}
                </span>
            </td>

            <td className="w-20 px-4 py-3 text-xs text-left border-l text-sky-800 bg-blue-50/30">
                {item.name}
            </td>
            {/* материалы */}
            <td className="px-4 py-3 font-medium text-right text-gray-900 border-l bg-blue-50/30">
                {formatNumber(materialSum)}
            </td>

            {/* услуги */}
            <td className="px-4 py-3 font-medium text-right text-gray-900 border-l bg-blue-50/30">
                {formatNumber(serviceSum)}
            </td>

            {/* итог */}
            <td className="px-4 py-3 text-base font-bold text-right text-green-700 border-l bg-green-50/30">
                {formatNumber(totalSum)}
            </td>

            {/* действия */}
            <td className="px-4 py-3 border-l">
                <div className="flex items-center justify-center gap-2">
                    <StyledTooltip title="Удалить смету">
                        <button
                            onClick={() => onDeleteEstimateId(item.id)}
                            className="
                                p-1.5
                                text-gray-400
                                hover:text-red-600
                                hover:bg-red-50
                                rounded
                                transition-colors
                            "
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </StyledTooltip>
                </div>
            </td>
        </tr>
    );
}
