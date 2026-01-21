import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchWarehouseStocks } from '../warehouseStocks/warehouseStocksSlice';
import WarehouseStocksTable from '../warehouseStocks/WarehouseStocksTable';
import { useReference } from '../../reference/useReference';
import WarehousePurchaseOrdersTable from './WarehousePurchaseOrdersTable';
import { useOutletContext, useParams } from 'react-router-dom';
import type { ProjectOutletContext } from '../material_request/MaterialRequests';
import { fetchPurchaseOrders } from '../purchaseOrders/purchaseOrdersSlice';
import MaterialMovementsTable from '../materialMovements/MaterialMovementsTable';
import { fetchMaterialMovements } from '../materialMovements/materialMovementsSlice';

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
            })
        );
    }, [dispatch]);
    //Загрузка СПИСОК ЗАЯВОК
    useEffect(() => {
        dispatch(fetchMaterialMovements({ page: 1, size: 10, project_id: projectId })); // ЗАПАС МАТЕРИАЛОВ
    }, [dispatch]);

    //Справочники для СПИСОК ЗАЯВОК + ЗАПАС МАТЕРИАЛОВ
    const { lookup: getMaterialMovementsName } = useReference(
        '5f72a11c-ff64-452a-b650-d593811776b7'
    );
    const { lookup: getUserName } = useReference('d0336075-e674-41ef-aa38-189de9adaeb4');
    const { lookup: getMaterialTypeName } = useReference('681635e7-3eff-413f-9a07-990bfe7bc68a');
    const { lookup: getMaterialName } = useReference('7c52acfc-843a-4242-80ba-08f7439a29a7');
    const { lookup: getUnitOfMeasure } = useReference('2198d87a-d834-4c5d-abf8-8925aeed784e');
    const { lookup: getWareHouseName } = useReference('7ff6ec0d-46fe-a9cd-bc8a-d32f20fbfbcd');
    const { lookup: getPurchaseOrderStatusesName } = useReference(
        '84242cf6-76a5-403a-bd87-63f58c539d2b'
    ); //purchaseOrderStatuses/gets

    const { lookup: getPurchaseOrderItemStatusesName } = useReference(
        '2beaaf9c2-b0d1-4c1c-8861-6c3345723b93'
    ); //purchaseOrderItemStatuses/gets
    const { lookup: getSuppliersName } = useReference('7ec0dff6-a9cd-46fe-bc8a-d32f20bcdfbf');

    const getRefName = useMemo(
        () => ({
            movementsName: getMaterialMovementsName,
            userName: getUserName,
            materialTypeName: getMaterialTypeName,
            materialName: getMaterialName,
            unitName: getUnitOfMeasure,
            wareHouseName: getWareHouseName,
            suppliersName: getSuppliersName,
            statusName: getPurchaseOrderStatusesName,
            statusItemName: getPurchaseOrderItemStatusesName,
        }),
        [
            getMaterialMovementsName,
            getUserName,
            getMaterialTypeName,
            getMaterialName,
            getUnitOfMeasure,
            getWareHouseName,
            getSuppliersName,
            getPurchaseOrderStatusesName,
            getPurchaseOrderItemStatusesName,
        ]
    );

    /******************************************************************************************************************************/
    return (
        <Paper>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Список заявок" />
                <Tab label="Запас материалов" />
                <Tab label="Транзакции" />
            </Tabs>

            <Box>
                {tab === 0 && (
                    <WarehousePurchaseOrdersTable
                        warehouseId={warehouseId}
                        orders={purchaseOrdersState.data}
                        getRefName={getRefName}
                    />
                )}
                {tab === 1 && (
                    <WarehouseStocksTable
                        data={warehouseStocksState.data}
                        pagination={warehouseStocksState.pagination}
                        getRefName={getRefName}
                    />
                )}
                {tab === 2 && (
                    <MaterialMovementsTable
                        data={materialMovementsState.data}
                        pagination={materialMovementsState.pagination}
                        getRefName={getRefName}
                    />
                )}
            </Box>
        </Paper>
    );
}
