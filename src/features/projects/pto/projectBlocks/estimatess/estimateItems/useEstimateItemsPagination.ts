import { useEffect, useMemo, useState } from 'react';
import type { EstimateItem } from './estimateItemsSlice';
import { getEstimateItemsPage } from './estimateItemsView';

export function useEstimateItemsPagination(items: EstimateItem[], itemType: 1 | 2) {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const result = useMemo(() => getEstimateItemsPage(items, itemType, page, size), [items, itemType, page, size]);

    // A deletion may remove the last page. Persist the clamped page so adding
    // another row later does not unexpectedly return the user to the old page.
    useEffect(() => {
        if (page !== result.pagination.page) setPage(result.pagination.page);
    }, [page, result.pagination.page]);

    const onSizeChange = (nextSize: number) => {
        setSize(nextSize);
        setPage(1);
    };

    return { ...result, onPageChange: setPage, onSizeChange };
}
