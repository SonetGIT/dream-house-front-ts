import type { Pagination } from '@/features/users/userSlice';
import type { EstimateItem } from './estimateItemsSlice';

interface EstimateItemsPage {
    items: EstimateItem[];
    pagination: Pagination;
}

export function getEstimateItemsPage(
    items: readonly EstimateItem[],
    itemType: 1 | 2,
    requestedPage: number,
    requestedSize: number,
): EstimateItemsPage {
    let rows = items.filter((item) => item.item_type === itemType);

    if (itemType === 1) {
        // Keep stage/subsection groups contiguous across the complete material list.
        // Preserve the original order of stages, subsections and rows within a group.
        const stages = new Map<number | null, Map<number | null, EstimateItem[]>>();
        for (const row of rows) {
            let subsections = stages.get(row.stage_id);
            if (!subsections) {
                subsections = new Map();
                stages.set(row.stage_id, subsections);
            }
            const group = subsections.get(row.subsection_id);
            if (group) group.push(row);
            else subsections.set(row.subsection_id, [row]);
        }
        rows = [...stages.values()].flatMap((subsections) => [...subsections.values()].flat());
    }

    const size = Number.isSafeInteger(requestedSize) && requestedSize > 0 ? requestedSize : 10;
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / size));
    const page = Number.isSafeInteger(requestedPage) ? Math.min(pages, Math.max(1, requestedPage)) : 1;

    return {
        items: rows.slice((page - 1) * size, page * size),
        pagination: { page, size, total, pages, hasPrev: page > 1, hasNext: page < pages },
    };
}
