import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { Warehouse } from './warehousesSlice';
import {
    fetchPurchaseOrderItems,
    receivePurchaseOrderItems,
    type PurchaseOrderItem,
    type ReceivePurchaseOrderItemPayload,
} from '../purchaseOrderItems/purchaseOrderItemsSlice';
import type { WarehouseTabType } from './WarehouseRow';
import WarehouseRow from './WarehouseRow';
import WarehouseReceiveModal from './WarehouseReceiveModal';
interface WarehousesTablePropsType {
    data: Warehouse[];
    refs: Record<string, ReferenceResult>;
    onEdit: (warehouse: Warehouse) => void;
}

const CONFIRMED_BY_SUPPLIER_STATUS = 2;
const ALL_PURCHASE_ORDERS_ID = 0;

export default function WarehousesTable({ data, refs, onEdit }: WarehousesTablePropsType) {
    const dispatch = useAppDispatch();

    const { data: purchaseOrderItems, loading: purchaseOrderItemsLoading } = useAppSelector(
        (state) => state.purchaseOrderItems,
    );

    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const [tabs, setTabs] = useState<Record<number, WarehouseTabType>>({});
    const [receiveWarehouse, setReceiveWarehouse] = useState<Warehouse | null>(null);

    const receivablePurchaseOrderItems = useMemo(() => {
        return purchaseOrderItems.filter((item: PurchaseOrderItem) => {
            const quantity = Number(item.quantity || 0);
            const delivered = Number(item.delivered_quantity || 0);

            return item.status === CONFIRMED_BY_SUPPLIER_STATUS && quantity > delivered;
        });
    }, [purchaseOrderItems]);

    const toggleRow = (warehouseId: number) => {
        setOpenRows((prev) => ({
            ...prev,
            [warehouseId]: !prev[warehouseId],
        }));
    };

    const setWarehouseTab = (warehouseId: number, tab: WarehouseTabType) => {
        setTabs((prev) => ({
            ...prev,
            [warehouseId]: tab,
        }));
    };

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
            setWarehouseTab(warehouseId, 'movements');
        } catch (e) {
            console.error(e);
            toast.error('Ошибка при приёмке товара');
        }
    };

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

                        <tbody>
                            {data?.map((warehouse) => (
                                <WarehouseRow
                                    key={warehouse.id}
                                    warehouse={warehouse}
                                    refs={refs}
                                    isOpen={Boolean(openRows[warehouse.id])}
                                    activeTab={tabs[warehouse.id] ?? 'materials'}
                                    onToggle={() => toggleRow(warehouse.id)}
                                    onTabChange={(tab: WarehouseTabType) =>
                                        setWarehouseTab(warehouse.id, tab)
                                    }
                                    onEdit={onEdit}
                                    onOpenReceive={handleOpenReceive}
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
        </div>
    );
}
