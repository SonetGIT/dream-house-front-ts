import React, { useState } from 'react';
import { Collapse } from '@mui/material';
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

                                            <td className="px-3 py-2 text-xs text-center">
                                                {whs.manager_id ? (
                                                    <span>{refs.users.lookup(whs.manager_id)}</span>
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
                                                        <div className="flex gap-2 mb-4 border-b">
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
        </div>
    );
}
