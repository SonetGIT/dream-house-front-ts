import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '../reference/useReference';
import { fetchWarehouses } from './warehousesSlice';
import WarehousesList from './WarehousesList';

/*******************************************************************************************************************************************************************/
export default function WarehousesPage() {
    const dispatch = useAppDispatch();
    const { data, pagination } = useAppSelector((state) => state.warehouses);

    // Справочники
    const { lookup: getUserName } = useReference('d0336075-e674-41ef-aa38-189de9adaeb4');

    const getRefName = useMemo(
        () => ({
            userName: getUserName,
        }),
        [getUserName]
    );
    //Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchWarehouses());
    }, [dispatch]);

    /********************************************************************************************************************************************/
    return (
        <div>
            {/* Список складов */}
            <WarehousesList items={data} pagination={pagination} getRefName={getRefName} />
        </div>
    );
}
