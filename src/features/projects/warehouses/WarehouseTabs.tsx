import { useEffect, useState } from 'react';
import { Paper, Tabs, Tab } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchWarehouseStocks } from '../warehouseStocks/warehouseStocksSlice';
import WarehouseStocksTable from '../warehouseStocks/WarehouseStocksTable';
import WarehousePurchaseOrdersTable from './WarehousePurchaseOrdersTable';
import { useOutletContext, useParams } from 'react-router-dom';
import type { ProjectOutletContext } from '../material_request/MaterialRequestsPage';
import { fetchPurchaseOrders } from '../purchaseOrders/purchaseOrdersSlice';
import MaterialMovementsTable from '../materialMovements/MaterialMovementsTable';
import { fetchMaterialMovements } from '../materialMovements/materialMovementsSlice';
import { useReference } from '@/features/reference/useReference';

export default function WarehouseTabs() {
    const [tab, setTab] = useState(0);
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const { warehouseId } = useParams<{ warehouseId: string | undefined }>();
    const dispatch = useAppDispatch();

    const purchaseOrdersState = useAppSelector((state) => state.purchaseOrders); //СПИСОК ЗАЯВОК
    const warehouseStocksState = useAppSelector((state) => state.warehouseStocks);
    const materialMovementsState = useAppSelector((state) => state.materialMovements);

    //Загрузка СПИСОК ЗАЯВОК
    useEffect(() => {
        dispatch(fetchPurchaseOrders({ page: 1, size: 10, project_id: projectId })); // ЗАПАС МАТЕРИАЛОВ
    }, [dispatch]);

    //Первичная загрузка ЗАПАС МАТЕРИАЛОВ
    useEffect(() => {
        dispatch(
            fetchWarehouseStocks({
                page: 1,
                size: 10,
                project_id: projectId,
                // warehouse_id: warehouseId,
            }),
        );
    }, [dispatch]);

    //Загрузка СПИСОК ЗАЯВОК
    useEffect(() => {
        dispatch(fetchMaterialMovements({ page: 1, size: 10, project_id: projectId })); // ЗАПАС МАТЕРИАЛОВ
    }, [dispatch]);

    //Справочники для СПИСОК ЗАЯВОК + ЗАПАС МАТЕРИАЛОВ
    const refs = {
        materialMovementStatuses: useReference('materialMovementStatuses'),
        users: useReference('users'),
        materialTypes: useReference('materialTypes'),
        materials: useReference('materials'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
        warehouses: useReference('warehouses'),
        purchaseOrderStatuses: useReference('purchaseOrderStatuses'),
        purchaseOrderItemStatuses: useReference('purchaseOrderItemStatuses'),
        suppliers: useReference('suppliers'),
    };

    /******************************************************************************************************************************/
    return (
        <Paper>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="📋 Список заявок" />
                <Tab label="🏭 Запас материалов" />
                <Tab label="📊 Транзакции" />
            </Tabs>

            <div>
                {tab === 0 && (
                    <WarehousePurchaseOrdersTable
                        warehouseId={warehouseId}
                        orders={purchaseOrdersState.data}
                        refs={refs}
                    />
                )}
                {tab === 1 && (
                    <WarehouseStocksTable
                        data={warehouseStocksState.data}
                        pagination={warehouseStocksState.pagination}
                        refs={refs}
                    />
                )}
                {tab === 2 && (
                    <MaterialMovementsTable
                        data={materialMovementsState.data}
                        pagination={materialMovementsState.pagination}
                        refs={refs}
                    />
                )}
            </div>
        </Paper>
    );
}
