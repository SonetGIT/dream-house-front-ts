import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import MaterialWriteOffTable from '../../materialWriteOffs/MaterialWriteOffTable';
import { fetchMaterialWriteOffs } from '../../materialWriteOffs/materialWriteOffSlice';

interface Props {
    warehouseId: number;
    refs: Record<string, ReferenceResult>;
}

export default function WarehouseWriteOffAvrTab({ warehouseId, refs }: Props) {
    const dispatch = useAppDispatch();

    const { data, pagination, loading } = useAppSelector((state) => state.materialWriteOff);

    const fetchData = (page = 1, size = 10) => {
        dispatch(
            fetchMaterialWriteOffs({
                project_id: 0,
                block_id: 0,
                warehouse_id: warehouseId,
                work_performed_id: 0,
                work_performed_item_id: 0,
                status: 0,
                page,
                size,
            }),
        );
    };

    useEffect(() => {
        fetchData(1, 10);
    }, [warehouseId]);

    return (
        <MaterialWriteOffTable
            data={data}
            refs={refs}
            pagination={pagination}
            loading={loading}
            onPageChange={(newPage) => fetchData(newPage, 10)}
            onSizeChange={(newSize) => fetchData(1, newSize)}
        />
    );
}
