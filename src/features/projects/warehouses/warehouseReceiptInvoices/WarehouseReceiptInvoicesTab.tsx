import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchWarehouseReceiptInvoices } from './warehouseReceiptInvoicesSlice';
import WarehouseReceiptInvoicesTable from './WarehouseReceiptInvoicesTable';

interface Props {
    warehouseId: number;
}

export default function WarehouseReceiptInvoicesTab({ warehouseId }: Props) {
    const dispatch = useAppDispatch();

    const { data, pagination, loading } = useAppSelector((state) => state.warehouseReceiptInvoices);

    useEffect(() => {
        dispatch(fetchWarehouseReceiptInvoices({ warehouse_id: warehouseId, page: 1, size: 10 }));
    }, [dispatch, warehouseId]);

    return (
        <WarehouseReceiptInvoicesTable
            data={data}
            pagination={pagination}
            loading={loading}
            onPageChange={(newPage) => {
                dispatch(
                    fetchWarehouseReceiptInvoices({
                        warehouse_id: warehouseId,
                        page: newPage,
                        size: 10,
                    }),
                );
            }}
            onSizeChange={(newSize) => {
                dispatch(
                    fetchWarehouseReceiptInvoices({
                        warehouse_id: warehouseId,
                        page: 1,
                        size: newSize,
                    }),
                );
            }}
        />
    );
}
