import React, { useState } from 'react';
import { Box, Button, Collapse } from '@mui/material';
import { ChevronDown, ChevronRight, Pencil, Phone, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { formatPhoneDisplay } from '@/utils/formatPhoneNumber';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { Warehouse } from './warehousesSlice';
import WarehouseStocksTable from '../warehouseStocks/WarehouseStocksTable';
import { fetchWarehouseItems } from '../warehouseStocks/warehouseStocksSlice';
import MaterialMovementsTable from '../materialMovements/MaterialMovementsTable';
import { fetchMaterialMovements } from '../materialMovements/materialMovementsSlice';
import { Add } from '@mui/icons-material';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import {
    fetchPurchaseOrderItems,
    receivePurchaseOrderItems,
    type PurchaseOrderItem,
} from '../purchaseOrderItems/purchaseOrderItemsSlice';

interface WarehousesTablePropsType {
    data: Warehouse[];
    refs: Record<string, ReferenceResult>;
    onEdit: (warehouse: Warehouse) => void;
    onDeleteWarehouseId: (id: number) => void;
    onDeleteWHouseItemId: (id: number) => void;
}

type TabType = 'materials' | 'movements';

/*******************************************************************************************************************************/
export default function WarehousesTable({
    data,
    refs,
    onEdit,
    onDeleteWarehouseId,
    onDeleteWHouseItemId,
}: WarehousesTablePropsType) {
    const dispatch = useAppDispatch();

    const { pagination: whItemPagination } = useAppSelector((state) => state.warehouseStocks);
    const {
        items: movementItems,
        pagination: movementPagination,
        loading: movementLoading,
    } = useAppSelector((state) => state.materialMovements);
    console.log('movementItems', movementItems);
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const [tabs, setTabs] = useState<Record<number, TabType>>({});

    /*ПРИЕМКА*/
    const { data: purchaseOrderItems, loading: purchaseOrderItemsLoading } = useAppSelector(
        (state) => state.purchaseOrderItems,
    );
    console.log('purchaseOrderItems', purchaseOrderItems);
    const [receiveWarehouse, setReceiveWarehouse] = useState<Warehouse | null>(null);
    const [receiveRows, setReceiveRows] = useState<
        Record<number, { checked: boolean; received_quantity: number; comment: string }>
    >({});

    /* TOGGLE */
    const toggleRow = (id: number) => {
        const isOpening = !openRows[id];

        setOpenRows((prev) => ({
            ...prev,
            [id]: isOpening,
        }));

        if (isOpening) {
            dispatch(
                fetchWarehouseItems({
                    warehouse_id: id,
                    page: 1,
                    size: 10,
                }),
            );
        }
    };

    const setWarehouseTab = (warehouseId: number, tab: TabType) => {
        setTabs((prev) => ({
            ...prev,
            [warehouseId]: tab,
        }));
        if (tab === 'movements') {
            dispatch(
                fetchMaterialMovements({
                    warehouse_id: warehouseId,
                    page: 1,
                    size: 10,
                }),
            );
        }
    };

    /*ПРИЕМКА*/
    const handleOpenReceive = (warehouse: Warehouse, purchaseOrderId: number) => {
        setReceiveWarehouse(warehouse);
        setReceiveRows({});

        dispatch(
            fetchPurchaseOrderItems({
                purchase_order_id: purchaseOrderId,
                page: 1,
                size: 10,
            }),
        );
    };

    const updateReceiveRow = (
        item: PurchaseOrderItem,
        patch: Partial<{ checked: boolean; received_quantity: number; comment: string }>,
    ) => {
        const remaining = Math.max(
            Number(item.quantity || 0) - Number(item.delivered_quantity || 0),
            0,
        );

        setReceiveRows((prev) => ({
            ...prev,
            [item.id]: {
                checked: prev[item.id]?.checked ?? false,
                received_quantity: prev[item.id]?.received_quantity ?? remaining,
                comment: prev[item.id]?.comment ?? '',
                ...patch,
            },
        }));
    };

    const handleReceiveItems = async () => {
        if (!receiveWarehouse) return;

        const items = purchaseOrderItems
            .filter((item) => receiveRows[item.id]?.checked)
            .map((item) => ({
                purchase_order_item_id: item.id,
                received_quantity: Number(receiveRows[item.id]?.received_quantity || 0),
                comment: receiveRows[item.id]?.comment || '',
            }))
            .filter((item) => item.received_quantity > 0);

        if (!items.length) {
            toast.error('Выберите товары для приёмки');
            return;
        }

        try {
            await dispatch(
                receivePurchaseOrderItems({
                    warehouse_id: receiveWarehouse.id,
                    items,
                }),
            ).unwrap();

            toast.success('Товар принят на склад');
            setReceiveWarehouse(null);
            setReceiveRows({});

            dispatch(
                fetchWarehouseItems({
                    warehouse_id: receiveWarehouse.id,
                    page: 1,
                    size: 10,
                }),
            );

            dispatch(
                fetchMaterialMovements({
                    warehouse_id: receiveWarehouse.id,
                    page: 1,
                    size: 10,
                }),
            );
        } catch (e) {
            console.error(e);
            toast.error('Ошибка при приёмке товара');
        }
    };

    /*******************************************************************************************************************************/
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
                            {data?.map((whs) => {
                                const activeTab = tabs[whs.id] ?? 'materials';

                                return (
                                    <React.Fragment key={whs.id}>
                                        <tr
                                            className="transition-colors border-b hover:bg-gray-50"
                                            onClick={() => toggleRow(whs.id)}
                                        >
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(whs.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[whs.id] ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>

                                            <td className="px-3 py-2">
                                                <div className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                                    {whs.name}
                                                </div>
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-sky-700 bg-sky-100 border border-sky-200 rounded">
                                                    {whs.code}
                                                </span>
                                            </td>

                                            <td className="px-3 py-2 text-sm text-center">
                                                {whs.address}
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                {whs.manager_id ? (
                                                    <span className="text-sm">
                                                        {refs.users.lookup(whs.manager_id)}
                                                    </span>
                                                ) : (
                                                    '_'
                                                )}
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                <div className="space-y-1 text-sm">
                                                    {whs.phone && (
                                                        <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                            {formatPhoneDisplay(whs.phone)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td
                                                className="px-3 py-2 font-medium text-center border-gray-200 text-violet-800"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {whs.items?.length || 0} поз.
                                            </td>

                                            <td className="px-3 py-2 border-l">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <StyledTooltip title="Редактировать">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(whs);
                                                            }}
                                                            className="
                                                                p-1.5
                                                                text-gray-400
                                                                hover:text-blue-600
                                                                hover:bg-blue-50
                                                                rounded
                                                                transition-colors
                                                            "
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </StyledTooltip>

                                                    <StyledTooltip title="Удалить">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteWarehouseId(whs.id);
                                                            }}
                                                            className="
                                                                p-1.5
                                                                text-gray-400
                                                                hover:text-red-600
                                                                hover:bg-red-50
                                                                rounded
                                                                transition-colors
                                                            "
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </StyledTooltip>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="border-b bg-gradient-to-r to-blue-50/50">
                                            <td colSpan={8} className="px-3 py-2">
                                                <Collapse in={openRows[whs.id]} unmountOnExit>
                                                    <div className="px-3 py-2 ml-8">
                                                        <div className="flex items-center justify-between gap-2 mb-4 border-b">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        setWarehouseTab(
                                                                            whs.id,
                                                                            'materials',
                                                                        )
                                                                    }
                                                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                                                        activeTab === 'materials'
                                                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                                                            : 'text-gray-600 hover:text-gray-900'
                                                                    }`}
                                                                >
                                                                    Материалы
                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        setWarehouseTab(
                                                                            whs.id,
                                                                            'movements',
                                                                        )
                                                                    }
                                                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                                                        activeTab === 'movements'
                                                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                                                            : 'text-gray-600 hover:text-gray-900'
                                                                    }`}
                                                                >
                                                                    Перемещены
                                                                </button>
                                                            </div>

                                                            <Box sx={{ mb: 1 }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<Add />}
                                                                    onClick={() =>
                                                                        handleOpenReceive(whs, 65)
                                                                    }
                                                                    sx={{
                                                                        color: 'violet',
                                                                        borderColor: 'violet',
                                                                        '&:hover': {
                                                                            borderColor:
                                                                                'darkviolet',
                                                                            backgroundColor:
                                                                                'rgba(141, 15, 141, 0.1)',
                                                                        },
                                                                    }}
                                                                >
                                                                    Принять товар
                                                                </Button>
                                                            </Box>
                                                        </div>

                                                        {activeTab === 'materials' && (
                                                            <WarehouseStocksTable
                                                                items={whs.items}
                                                                whItemPagination={whItemPagination}
                                                                refs={refs}
                                                                onDelete={onDeleteWHouseItemId}
                                                                onPageChange={(newPage) => {
                                                                    dispatch(
                                                                        fetchMaterialMovements({
                                                                            warehouse_id: whs.id,
                                                                            page: newPage,
                                                                            size: 10,
                                                                        }),
                                                                    );
                                                                }}
                                                                onSizeChange={(newSize) => {
                                                                    dispatch(
                                                                        fetchMaterialMovements({
                                                                            warehouse_id: whs.id,
                                                                            page: 1,
                                                                            size: newSize,
                                                                        }),
                                                                    );
                                                                }}
                                                            />
                                                        )}

                                                        {activeTab === 'movements' && (
                                                            <MaterialMovementsTable
                                                                items={movementItems}
                                                                pagination={movementPagination}
                                                                loading={movementLoading}
                                                                onPageChange={(newPage) => {
                                                                    dispatch(
                                                                        fetchMaterialMovements({
                                                                            warehouse_id: whs.id,
                                                                            page: newPage,
                                                                            size: 10,
                                                                        }),
                                                                    );
                                                                }}
                                                                onSizeChange={(newSize) => {
                                                                    dispatch(
                                                                        fetchMaterialMovements({
                                                                            warehouse_id: whs.id,
                                                                            page: 1,
                                                                            size: newSize,
                                                                        }),
                                                                    );
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                size="full"
                isOpen={Boolean(receiveWarehouse)}
                onClose={() => setReceiveWarehouse(null)}
                title={`Приём товара${receiveWarehouse ? ` на склад: ${receiveWarehouse.name}` : ''}`}
            >
                <div className="space-y-4">
                    {purchaseOrderItemsLoading ? (
                        <div className="p-4 text-sm text-gray-500">Загрузка...</div>
                    ) : !purchaseOrderItems.length ? (
                        <div className="p-4 text-sm text-gray-400 border rounded-lg">
                            Нет товаров со статусом к поставке
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-white border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-blue-50/40">
                                    <tr className="border-b">
                                        <th className="w-12 px-3 py-2 text-center"></th>
                                        <th className="px-3 py-2 text-left">№ заявки на закуп</th>
                                        <th className="px-3 py-2 text-left">Материал</th>
                                        <th className="px-3 py-2 text-center">Заказано</th>
                                        <th className="px-3 py-2 text-center">Уже принято</th>
                                        <th className="px-3 py-2 text-center">Принять</th>
                                        <th className="px-3 py-2 text-left">Комментарий</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {purchaseOrderItems.map((item) => {
                                        const remaining = Math.max(
                                            Number(item.quantity || 0) -
                                                Number(item.delivered_quantity || 0),
                                            0,
                                        );
                                        const row = receiveRows[item.id];

                                        return (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="px-3 py-2 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={row?.checked ?? false}
                                                        disabled={remaining <= 0}
                                                        onChange={(e) =>
                                                            updateReceiveRow(item, {
                                                                checked: e.target.checked,
                                                            })
                                                        }
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {item.purchase_order_id}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {refs.materials.lookup(
                                                        Number(item.material_id),
                                                    )}
                                                </td>

                                                <td className="px-3 py-2 text-center">
                                                    {item.quantity}
                                                </td>

                                                <td className="px-3 py-2 text-center">
                                                    {item.delivered_quantity ?? 0}
                                                </td>

                                                <td className="px-3 py-2 text-center">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={remaining}
                                                        value={row?.received_quantity ?? remaining}
                                                        disabled={remaining <= 0}
                                                        onChange={(e) =>
                                                            updateReceiveRow(item, {
                                                                received_quantity: Number(
                                                                    e.target.value,
                                                                ),
                                                            })
                                                        }
                                                        className="px-2 py-1 text-right border rounded w-28"
                                                    />
                                                </td>

                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={row?.comment ?? ''}
                                                        onChange={(e) =>
                                                            updateReceiveRow(item, {
                                                                comment: e.target.value,
                                                            })
                                                        }
                                                        placeholder="Комментарий"
                                                        className="w-full px-2 py-1 border rounded"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setReceiveWarehouse(null)}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            Отмена
                        </button>

                        <button
                            type="button"
                            onClick={handleReceiveItems}
                            disabled={purchaseOrderItemsLoading}
                            className="px-4 py-2 text-sm text-white rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                        >
                            Принять
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
