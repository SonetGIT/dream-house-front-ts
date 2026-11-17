import { useReference } from '@/features/reference/useReference';
import type { Estimate } from './estimatesSlice';
import { formatNumber } from '@/utils/formatNumber';
import { getStatusColor } from '@/utils/getStatusColor';
import { Pencil } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

interface EstimateRowProps {
    onRename: () => void;
    item: Estimate;
    materialSum: number;
    serviceSum: number;
    totalSum: number;
}

/***********************************************************************************************************/
export default function EstimateRow({
    onRename,
    item,
    materialSum,
    serviceSum,
    totalSum,
}: EstimateRowProps) {
    const statuses = useReference('generalStatuses');

    return (
        <>
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
                <div className="flex items-center gap-2">
                    <span className="text-[12px] leading-4">{item.name}</span>
                    <StyledTooltip title="Изменить название сметы">
                        <button type="button" aria-label="Изменить название сметы"
                            onClick={(event) => { event.stopPropagation(); onRename(); }}
                            className="shrink-0 rounded p-1 text-sky-600 hover:bg-blue-100">
                            <Pencil className="h-4 w-4" />
                        </button>
                    </StyledTooltip>
                </div>
            </td>

            <td className="px-4 py-3 font-medium text-right text-gray-900 border-l bg-blue-50/30">
                {formatNumber(materialSum)}
            </td>

            <td className="px-4 py-3 font-medium text-right text-gray-900 border-l bg-blue-50/30">
                {formatNumber(serviceSum)}
            </td>

            <td className="px-4 py-3 text-base font-bold text-right text-green-700 border-l bg-green-50/30">
                {formatNumber(totalSum)}
            </td>
        </>
    );
}
