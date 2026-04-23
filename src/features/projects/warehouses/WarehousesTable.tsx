import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

import { fetchWarehouses, type Warehouse } from './warehousesSlice';
import WarehouseRow, { type WarehouseTabType } from './WarehouseRow';
import WarehouseReceiveModal from './WarehouseReceiveModal';
import MaterialWriteOffAvrModal from './materialWriteOffs/MaterialWriteOffAvrModal';

import {
    fetchPurchaseOrderItems,
    receivePurchaseOrderItems,
    type ReceivePurchaseOrderItemPayload,
} from '../purchaseOrderItems/purchaseOrderItemsSlice';
import { fetchWarehouseItems } from '../warehouseStocks/warehouseStocksSlice';
import { fetchMaterialMovements } from '../materialMovements/materialMovementsSlice';
import {
    createMaterialWriteOff,
    fetchMaterialWriteOffs,
} from './materialWriteOffs/materialWriteOffSlice';
import { fetchWorkPerformed } from '../pto/workPerformed/workPerformedSlice';
import MbpWriteOffModal from './mbpWriteOffs/MbpWriteOffModal';
import { createMbpWriteOff, fetchMbpWriteOffs } from './mbpWriteOffs/mbpWriteOffSlice';
import {
    createProcessingWriteOff,
    fetchProcessingWriteOffs,
} from './materialProcessingWriteOffs/processingWriteOffSlice';
import ProcessingWriteOffModal from './materialProcessingWriteOffs/ProcessingWriteOffModal';
import WarehouseTransferModal from './warehouseTransfers/WarehouseTransfersModal';
import { fetchWarehouseTransfers } from './warehouseTransfers/warehouseTransfersSlice';

interface WarehousesTablePropsType {
    projectId: number;
    data: Warehouse[];
    refs: Record<string, ReferenceResult>;
    onEdit: (warehouse: Warehouse) => void;
}

const CONFIRMED_BY_SUPPLIER_STATUS = 2;
const ALL_PURCHASE_ORDERS_ID = 0;

/**********************************************************************************************************************/
export default function WarehousesTable({
    projectId,
    data,
    refs,
    onEdit,
}: WarehousesTablePropsType) {
    const dispatch = useAppDispatch();

    // Загрузка всех складов для модалки перемещения
    useEffect(() => {
        dispatch(fetchWarehouses({ page: 1, size: 100, global: true }));
    }, [dispatch]);

    const { data: allWarehouses } = useAppSelector((state) => state.warehouses);

    console.log('Все склады:', allWarehouses); // ✅ Теперь тут полный список
    const { data: purchaseOrderItems, loading: purchaseOrderItemsLoading } = useAppSelector(
        (state) => state.purchaseOrderItems,
    );
    const { list: warehouseStockItems } = useAppSelector((state) => state.warehouseStocks);
    const { data: workPerformedData } = useAppSelector((state) => state.workPerformed);
    const { submitting: writeOffSubmitting } = useAppSelector((state) => state.materialWriteOff);
    const { submitting: mbpWriteOffSubmitting } = useAppSelector((state) => state.mbpWriteOff);
    const { submitting: processingWriteOffSubmitting } = useAppSelector(
        (state) => state.processingWriteOff,
    );
    const { submitting: warehouseTransfersSubmitting } = useAppSelector(
        (state) => state.warehouseTransfers,
    );

    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const [tabs, setTabs] = useState<Record<number, WarehouseTabType>>({});
    const [receiveWarehouse, setReceiveWarehouse] = useState<Warehouse | null>(null);
    const [writeOffAvrWarehouse, setWriteOffAvrWarehouse] = useState<Warehouse | null>(null);
    const [writeOffMbpWarehouse, setWriteOffMbpWarehouse] = useState<Warehouse | null>(null);
    const [writeOffProcWarehouse, setWriteOffProcWarehouse] = useState<Warehouse | null>(null);
    const [warehouseTransfers, setWarehouseTransfers] = useState<Warehouse | null>(null);

    const receivablePurchaseOrderItems = useMemo(() => {
        return purchaseOrderItems.filter((item) => {
            const quantity = Number(item.quantity || 0);
            const delivered = Number(item.delivered_quantity || 0);

            return item.status === CONFIRMED_BY_SUPPLIER_STATUS && quantity > delivered;
        });
    }, [purchaseOrderItems]);

    const workPerformedOptions = useMemo(() => {
        return (workPerformedData ?? []).map((item) => ({
            id: item.id,
            performed_person_name: item.performed_person_name,
            created_at: item.created_at,
            items:
                item.items?.map((workItem: any) => ({
                    id: workItem.id,
                    service_id: workItem.service_id ?? null,
                    service_type: workItem.service_type ?? null,
                    stage_id: workItem.stage_id ?? null,
                    subsection_id: workItem.subsection_id ?? null,
                    quantity: Number(workItem.quantity || 0),
                })) ?? [],
        }));
    }, [workPerformedData]);

    const warehouseStockOptions = useMemo(() => {
        return (warehouseStockItems ?? []).map((item: any) => ({
            material_id: item.material_id,
            unit_of_measure: item.unit_of_measure ?? null,
            quantity: Number(item.quantity || 0),
        }));
    }, [warehouseStockItems]);

    const warehouseOptions = useMemo(() => {
        return (allWarehouses ?? []).map((w) => ({
            id: w.id,
            name: w.name,
        }));
    }, [allWarehouses]);

    const fetchWarehouseStocks = (warehouseId: number, page = 1, size = 10) => {
        dispatch(
            fetchWarehouseItems({
                warehouse_id: warehouseId,
                page,
                size,
            }),
        );
    };

    const fetchWarehouseMovements = (warehouseId: number, page = 1, size = 10) => {
        dispatch(
            fetchMaterialMovements({
                warehouse_id: warehouseId,
                page,
                size,
            }),
        );
    };

    const fetchWarehouseWriteOffAvr = (warehouseId: number, page = 1, size = 10) => {
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

    const toggleRow = (warehouseId: number) => {
        const isOpening = !openRows[warehouseId];

        setOpenRows((prev) => ({
            ...prev,
            [warehouseId]: isOpening,
        }));

        if (isOpening) {
            fetchWarehouseStocks(warehouseId, 1, 10);
        }
    };

    const setWarehouseTab = (warehouseId: number, tab: WarehouseTabType) => {
        setTabs((prev) => ({
            ...prev,
            [warehouseId]: tab,
        }));

        if (tab === 'materials') {
            fetchWarehouseStocks(warehouseId, 1, 10);
        }

        if (tab === 'movements') {
            fetchWarehouseMovements(warehouseId, 1, 10);
        }

        if (tab === 'writeOffAvr') {
            fetchWarehouseWriteOffAvr(warehouseId, 1, 10);
        }
        if (tab === 'writeOffMbp') {
            fetchWarehouseWriteOffAvr(warehouseId, 1, 10);
        }
        if (tab === 'writeOffprocess') {
            fetchWarehouseWriteOffAvr(warehouseId, 1, 10);
        }
    };

    //Прием
    const handleOpenReceive = (warehouse: Warehouse) => {
        setReceiveWarehouse(warehouse);

        dispatch(
            fetchPurchaseOrderItems({
                purchase_order_id: ALL_PURCHASE_ORDERS_ID,
                page: 1,
                size: 100,
            }),
        );
    };

    const handleCloseReceive = () => {
        setReceiveWarehouse(null);
    };

    const handleReceiveItems = async (items: ReceivePurchaseOrderItemPayload[]) => {
        if (!receiveWarehouse) return;

        if (!items.length) {
            toast.error('Выберите товары для приёмки');
            return;
        }

        const warehouseId = receiveWarehouse.id;

        try {
            await dispatch(
                receivePurchaseOrderItems({
                    warehouse_id: warehouseId,
                    items,
                }),
            ).unwrap();

            toast.success('Товар принят на склад');
            handleCloseReceive();

            setTabs((prev) => ({
                ...prev,
                [warehouseId]: 'movements',
            }));

            await dispatch(
                fetchWarehouseItems({
                    warehouse_id: warehouseId,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchMaterialMovements({
                    warehouse_id: warehouseId,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();
        } catch (e) {
            console.error(e);
            toast.error('Ошибка при приёмке товара');
        }
    };

    //АВР
    const handleOpenWriteOffAvr = async (warehouse: Warehouse) => {
        setWriteOffAvrWarehouse(warehouse);
        fetchWarehouseStocks(warehouse.id, 1, 100);

        if (!projectId) {
            toast.error('Не удалось определить projectId');
            return;
        }

        try {
            await dispatch(
                fetchWorkPerformed({
                    project_id: projectId,
                    page: 1,
                    size: 100,
                }),
            ).unwrap();
        } catch (e) {
            console.error(e);
            toast.error('Не удалось загрузить АВР');
        }
    };

    const handleCloseWriteOffAvr = () => {
        setWriteOffAvrWarehouse(null);
    };

    const handleCreateWriteOffAvr = async (payload: any) => {
        if (!writeOffAvrWarehouse) return;

        try {
            await dispatch(createMaterialWriteOff(payload)).unwrap();

            toast.success('Списание по АВР создано');
            handleCloseWriteOffAvr();

            setTabs((prev) => ({
                ...prev,
                [writeOffAvrWarehouse.id]: 'writeOffAvr',
            }));

            await dispatch(
                fetchWarehouseItems({
                    warehouse_id: writeOffAvrWarehouse.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchMaterialMovements({
                    warehouse_id: writeOffAvrWarehouse.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchMaterialWriteOffs({
                    project_id: 0,
                    block_id: 0,
                    warehouse_id: writeOffAvrWarehouse.id,
                    work_performed_id: 0,
                    work_performed_item_id: 0,
                    status: 0,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка создания списания по АВР');
        }
    };

    // МБП
    const handleOpenWriteOffMbp = async (warehouse: Warehouse) => {
        setWriteOffMbpWarehouse(warehouse);
        fetchWarehouseStocks(warehouse.id, 1, 100);

        if (!projectId) {
            toast.error('Не удалось определить projectId');
            return;
        }
    };
    const handleCloseWriteOffMbp = () => {
        setWriteOffMbpWarehouse(null);
    };

    const handleCreateWriteOffMbp = async (payload: any) => {
        if (!writeOffMbpWarehouse) return;

        try {
            await dispatch(createMbpWriteOff(payload)).unwrap();

            toast.success('Списание МБП создано');
            handleCloseWriteOffMbp();

            setTabs((prev) => ({
                ...prev,
                [writeOffMbpWarehouse.id]: 'writeOffMbp',
            }));

            await dispatch(
                fetchWarehouseItems({
                    warehouse_id: writeOffMbpWarehouse.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchMaterialMovements({
                    warehouse_id: writeOffMbpWarehouse.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchMbpWriteOffs({
                    // project_id: 0,
                    // warehouse_id: writeOffMbpWarehouse.id,
                    // work_performed_id: 0,
                    // work_performed_item_id: 0,
                    // status: 0,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка создания списания по МБП');
        }
    };

    // Переработка
    const handleOpenWriteOffProcessing = async (warehouse: Warehouse) => {
        setWriteOffProcWarehouse(warehouse);
        fetchWarehouseStocks(warehouse.id, 1, 100);

        if (!projectId) {
            toast.error('Не удалось определить projectId');
            return;
        }
    };
    const handleCloseWriteOffProcessing = () => {
        setWriteOffProcWarehouse(null);
    };

    const handleCreateWriteOffProcessing = async (payload: any) => {
        if (!writeOffProcWarehouse) return;

        try {
            await dispatch(createProcessingWriteOff(payload)).unwrap();

            toast.success('Списание по переработке создано');
            handleCloseWriteOffProcessing();

            setTabs((prev) => ({
                ...prev,
                [writeOffProcWarehouse.id]: 'writeOffprocess',
            }));

            await dispatch(
                fetchWarehouseItems({
                    warehouse_id: writeOffProcWarehouse.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchMaterialMovements({
                    warehouse_id: writeOffProcWarehouse.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchProcessingWriteOffs({
                    // project_id: 0,
                    warehouse_id: writeOffProcWarehouse.id,
                    // work_performed_id: 0,
                    // work_performed_item_id: 0,
                    // status: 0,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка создания списания по переработке');
        }
    };

    // Перемещение
    const handleOpenWarehouseTransfers = async (warehouse: Warehouse) => {
        setWarehouseTransfers(warehouse);
        fetchWarehouseStocks(warehouse.id, 1, 100);

        if (!projectId) {
            toast.error('Не удалось определить projectId');
            return;
        }
    };
    const handleCloseWarehouseTransfers = () => {
        setWarehouseTransfers(null);
    };

    const handleCreateWarehouseTransfers = async (payload: any) => {
        if (!warehouseTransfers) return;

        try {
            await dispatch(createProcessingWriteOff(payload)).unwrap();

            toast.success('Накладная по перемещении создано');
            handleCloseWarehouseTransfers();

            setTabs((prev) => ({
                ...prev,
                [warehouseTransfers.id]: 'writeOffprocess',
            }));

            await dispatch(
                fetchWarehouseItems({
                    warehouse_id: warehouseTransfers.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchMaterialMovements({
                    warehouse_id: warehouseTransfers.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();

            await dispatch(
                fetchWarehouseTransfers({
                    // project_id: 0,
                    warehouse_id: warehouseTransfers.id,
                    // work_performed_id: 0,
                    // work_performed_item_id: 0,
                    // status: 0,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка создания накладной на перемещение');
        }
    };

    /********************************************************************************************************/
    return (
        <div className="space-y-4">
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-left bg-blue-50"></th>
                                <th className="px-4 py-3 text-left bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Название склада
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Код
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Адрес
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Кладовщик
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-left text-blue-700 uppercase">
                                        Телефон
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Кол-во позиций
                                    </div>
                                </th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        {/* ДАННЫЕ СКЛАДА */}
                        <tbody>
                            {data?.map((warehouse) => (
                                <WarehouseRow
                                    key={warehouse.id}
                                    warehouse={warehouse}
                                    refs={refs}
                                    isOpen={Boolean(openRows[warehouse.id])}
                                    activeTab={tabs[warehouse.id] ?? 'materials'}
                                    onToggle={() => toggleRow(warehouse.id)}
                                    onTabChange={(tab) => setWarehouseTab(warehouse.id, tab)}
                                    onEdit={onEdit}
                                    onOpenReceive={handleOpenReceive}
                                    onOpenWriteOffAvr={handleOpenWriteOffAvr}
                                    onOpenWriteOffMbp={handleOpenWriteOffMbp}
                                    onOpenWriteOffProcessing={handleOpenWriteOffProcessing}
                                    onOpenTransfer={handleOpenWarehouseTransfers}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <WarehouseReceiveModal
                warehouse={receiveWarehouse}
                items={receivablePurchaseOrderItems}
                refs={refs}
                loading={purchaseOrderItemsLoading}
                onClose={handleCloseReceive}
                onSubmit={handleReceiveItems}
            />

            <MaterialWriteOffAvrModal
                open={Boolean(writeOffAvrWarehouse)}
                warehouseId={writeOffAvrWarehouse?.id ?? 0}
                warehouseName={writeOffAvrWarehouse?.name}
                refs={refs}
                workPerformedOptions={workPerformedOptions}
                warehouseStocks={warehouseStockOptions}
                submitting={writeOffSubmitting}
                onClose={handleCloseWriteOffAvr}
                onSubmit={handleCreateWriteOffAvr}
            />
            <MbpWriteOffModal
                open={Boolean(writeOffMbpWarehouse)}
                warehouseId={writeOffMbpWarehouse?.id ?? 0}
                warehouseName={writeOffMbpWarehouse?.name}
                refs={refs}
                warehouseStocks={warehouseStockOptions}
                submitting={mbpWriteOffSubmitting}
                onClose={handleCloseWriteOffMbp}
                onSubmit={handleCreateWriteOffMbp}
            />
            <ProcessingWriteOffModal
                open={Boolean(writeOffProcWarehouse)}
                warehouseId={writeOffProcWarehouse?.id ?? 0}
                warehouseName={writeOffProcWarehouse?.name}
                warehouseStocks={warehouseStockOptions}
                refs={refs}
                submitting={processingWriteOffSubmitting}
                onClose={handleCloseWriteOffProcessing}
                onSubmit={handleCreateWriteOffProcessing}
            />
            <WarehouseTransferModal
                open={Boolean(warehouseTransfers)}
                fromWarehouseId={warehouseTransfers?.id ?? 0}
                fromWarehouseName={warehouseTransfers?.name}
                warehouseStocks={warehouseStockOptions}
                availableWarehouses={warehouseOptions}
                refs={refs}
                submitting={warehouseTransfersSubmitting}
                onClose={handleCloseWarehouseTransfers}
                onSubmit={handleCreateWarehouseTransfers}
            />
        </div>
    );
}
