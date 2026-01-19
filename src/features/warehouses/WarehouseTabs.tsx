import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchWarehouseStocks } from '../projects/warehouseStocks/warehouseStocksSlice';
import WarehouseStocksTable from '../projects/warehouseStocks/WarehouseStocksTable';
import { useReference } from '../reference/useReference';
import WarehousePurchaseOrdersTable from './WarehousePurchaseOrdersTable';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../projects/material_request/MaterialRequests';
import { fetchPurchaseOrders } from '../projects/purchaseOrders/purchaseOrdersSlice';

export default function WarehouseTabs() {
    const { projectId } = useOutletContext<ProjectOutletContext>();

    const [tab, setTab] = useState(0);
    const dispatch = useAppDispatch();

    const { data, pagination } = useAppSelector((state) => state.warehouseStocks);
    const { data: orders } = useAppSelector((state) => state.purchaseOrders);

    //Первичная загрузка
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

    // 🔥 Загрузка списка при монтировании
    useEffect(() => {
        dispatch(fetchPurchaseOrders({ page: 1, size: 10, project_id: projectId }));
    }, [dispatch]);

    //Справочники
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
            materialTypeName: getMaterialTypeName,
            materialName: getMaterialName,
            unitName: getUnitOfMeasure,
            houseName: getWareHouseName,
            suppliersName: getSuppliersName,
            statusName: getPurchaseOrderStatusesName,
            statusItemName: getPurchaseOrderItemStatusesName,
        }),
        [
            getMaterialTypeName,
            getMaterialName,
            getUnitOfMeasure,
            getWareHouseName,
            getSuppliersName,
            getPurchaseOrderStatusesName,
            getPurchaseOrderItemStatusesName,
        ]
    );
    // const getRefName = useMemo(
    //     () => ({
    //         materialTypeName: getMaterialTypeName,
    //         materialName: getMaterialName,
    //         unitName: getUnitOfMeasure,
    //         houseName: getWareHouseName,
    //     }),
    //     [getMaterialTypeName, getMaterialName, getUnitOfMeasure, getWareHouseName]
    // );

    /******************************************************************************************************************************/
    return (
        <Paper>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Список заявок" />
                <Tab label="Запас материалов" />
            </Tabs>

            <Box>
                {tab === 0 && (
                    <WarehousePurchaseOrdersTable orders={orders} getRefName={getRefName} />
                )}
                {tab === 1 && (
                    <WarehouseStocksTable
                        data={data}
                        pagination={pagination}
                        getRefName={getRefName}
                    />
                )}
            </Box>
        </Paper>
    );
}
