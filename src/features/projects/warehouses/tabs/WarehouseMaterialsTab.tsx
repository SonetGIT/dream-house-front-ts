import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { Warehouse } from '../warehousesSlice';
import WarehouseStocksTable from '../../warehouseStocks/WarehouseStocksTable';
import { fetchWarehouseItems } from '../../warehouseStocks/warehouseStocksSlice';

interface WarehouseMaterialsProps {
    warehouse: Warehouse;
    refs: Record<string, ReferenceResult>;
}

export default function WarehouseMaterialsTab({ warehouse, refs }: WarehouseMaterialsProps) {
    const dispatch = useAppDispatch();

    const { list: warehouseStockItems, pagination } = useAppSelector(
        (state) => state.warehouseStocks,
    );

    useEffect(() => {
        dispatch(
            fetchWarehouseItems({
                warehouse_id: warehouse.id,
                page: 1,
                size: 10,
            }),
        );
    }, [dispatch, warehouse.id]);

    return (
        <WarehouseStocksTable
            // ✅ ИСПРАВЛЕНО: таблица теперь подписана на Redux
            items={warehouseStockItems}
            whItemPagination={pagination}
            refs={refs}
            onPageChange={(newPage) => {
                dispatch(
                    fetchWarehouseItems({
                        warehouse_id: warehouse.id,
                        page: newPage,
                        size: 10,
                    }),
                );
            }}
            onSizeChange={(newSize) => {
                dispatch(
                    fetchWarehouseItems({
                        warehouse_id: warehouse.id,
                        page: 1,
                        size: newSize,
                    }),
                );
            }}
        />
    );
}
