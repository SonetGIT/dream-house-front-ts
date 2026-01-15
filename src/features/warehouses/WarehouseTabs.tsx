import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import PurchaseOrdersTable from '../projects/purchaseOrders/PurchaseOrdersTable';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchWarehouseStocks } from '../projects/warehouseStocks/warehouseStocksSlice';
import WarehouseStocksTable from '../projects/warehouseStocks/warehouseStocksTable';
import { useReference } from '../reference/useReference';
import WarehousePurchaseOrdersTable from './WarehousePurchaseOrdersTable';

export default function WarehouseTabs() {
    const [tab, setTab] = useState(0);
    const dispatch = useAppDispatch();
    const { data, pagination } = useAppSelector((state) => state.warehouseStocks);

    //Первичная загрузка
    useEffect(() => {
        dispatch(fetchWarehouseStocks({ page: 1, size: 10 }));
    }, [dispatch]);

    //Справочники
    const { lookup: getMaterialTypeName } = useReference('681635e7-3eff-413f-9a07-990bfe7bc68a');
    const { lookup: getMaterialName } = useReference('7c52acfc-843a-4242-80ba-08f7439a29a7');
    const { lookup: getUnitOfMeasure } = useReference('2198d87a-d834-4c5d-abf8-8925aeed784e');
    const { lookup: getWareHouseName } = useReference('7ff6ec0d-46fe-a9cd-bc8a-d32f20fbfbcd');

    const getRefName = useMemo(
        () => ({
            materialTypeName: getMaterialTypeName,
            materialName: getMaterialName,
            unitName: getUnitOfMeasure,
            houseName: getWareHouseName,
        }),
        [getMaterialTypeName, getMaterialName, getUnitOfMeasure, getWareHouseName]
    );

    return (
        <Paper>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Список запасов" />
                <Tab label="Список заявок" />
            </Tabs>

            <Box>
                {tab === 0 && (
                    <WarehouseStocksTable
                        data={data}
                        pagination={pagination}
                        getRefName={getRefName}
                    />
                )}
                {tab === 1 && <WarehousePurchaseOrdersTable />}
            </Box>
        </Paper>
    );
}
