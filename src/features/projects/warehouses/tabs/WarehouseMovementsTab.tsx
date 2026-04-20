import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import MaterialMovementsTable from '../../materialMovements/MaterialMovementsTable';
import { fetchMaterialMovements } from '../../materialMovements/materialMovementsSlice';

interface Props {
    warehouseId: number;
}

export default function WarehouseMovementsTab({ warehouseId }: Props) {
    const dispatch = useAppDispatch();

    const { items, pagination, loading } = useAppSelector((state) => state.materialMovements);

    useEffect(() => {
        dispatch(fetchMaterialMovements({ warehouse_id: warehouseId, page: 1, size: 10 }));
    }, [dispatch, warehouseId]);

    return (
        <MaterialMovementsTable
            items={items}
            pagination={pagination}
            loading={loading}
            onPageChange={(newPage) => {
                dispatch(
                    fetchMaterialMovements({ warehouse_id: warehouseId, page: newPage, size: 10 }),
                );
            }}
            onSizeChange={(newSize) => {
                dispatch(
                    fetchMaterialMovements({ warehouse_id: warehouseId, page: 1, size: newSize }),
                );
            }}
        />
    );
}
