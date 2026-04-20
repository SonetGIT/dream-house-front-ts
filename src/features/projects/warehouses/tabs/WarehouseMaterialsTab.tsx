import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { Warehouse } from '../warehousesSlice';
import WarehouseStocksTable from '../../warehouseStocks/WarehouseStocksTable';
import { fetchWarehouseItems } from '../../warehouseStocks/warehouseStocksSlice';

interface Props {
    warehouse: Warehouse;
    refs: Record<string, ReferenceResult>;
}

export default function WarehouseMaterialsTab({ warehouse, refs }: Props) {
    const dispatch = useAppDispatch();
    const { pagination } = useAppSelector((state) => state.warehouseStocks);

    useEffect(() => {
        dispatch(fetchWarehouseItems({ warehouse_id: warehouse.id, page: 1, size: 10 }));
    }, [dispatch, warehouse.id]);

    return (
        <WarehouseStocksTable
            items={warehouse.items}
            whItemPagination={pagination}
            refs={refs}
            onPageChange={(newPage) => {
                dispatch(
                    fetchWarehouseItems({ warehouse_id: warehouse.id, page: newPage, size: 10 }),
                );
            }}
            onSizeChange={(newSize) => {
                dispatch(
                    fetchWarehouseItems({ warehouse_id: warehouse.id, page: 1, size: newSize }),
                );
            }}
        />
    );
}
