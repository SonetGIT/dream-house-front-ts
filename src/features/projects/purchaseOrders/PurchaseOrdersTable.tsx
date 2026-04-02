import React, { useCallback, useState } from 'react';
import { Collapse, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { formatDateTime } from '@/utils/formatDateTime';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { User } from '@/features/users/userSlice';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import toast from 'react-hot-toast';
import MatReqItemsTable from '../material_request_items/MatReqItemsTable';
import { fetchMaterialRequestItems } from '../material_request_items/materialRequestItemsSlice';
import type { PurchaseOrder } from './purchaseOrdersSlice';

interface PropsType {
    data: PurchaseOrder[];
    refs: Record<string, ReferenceResult>;
    onDeleteMatReqOrderId: (id: number) => void;
    onDeleteMatReqOrderItemId: (id: number) => void;
}
const purchaseOrderStatuses: Record<number, { label: string; className: string }> = {
    1: {
        label: 'Отправлен поставщику',
        className: 'bg-violet-500/15 text-violet-700 border border-violet-400',
    },
    2: {
        label: 'Подтверждён поставщиком',
        className: 'bg-blue-500/15 text-blue-700 border border-blue-400',
    },
    3: {
        label: 'В доставке',
        className: 'bg-amber-500/15 text-amber-700 border border-amber-400',
    },
    4: {
        label: 'Частично доставлен',
        className: 'bg-emerald-500/15 text-emerald-700 border border-emerald-400',
    },
    5: {
        label: 'Полностью доставлен',
        className: 'bg-green-600/15 text-green-700 border border-green-500',
    },
    6: {
        label: 'Отменён',
        className: 'bg-rose-500/15 text-rose-700 border border-rose-400',
    },
    7: {
        label: 'Проблема',
        className: 'bg-red-600/15 text-red-700 border border-red-500',
    },
};
//  Таблица заявок на закупку
export default function PurchaseOrdersTable(props: PropsType) {
    const dispatch = useAppDispatch();
    console.log();
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const currentUser = useAppSelector((state) => state.auth.user);
    const [itemsMap, setItemsMap] = useState<Record<number, any[]>>({});
    /*TOGGLE*/
    const toggleRow = (id: number) => {
        const isOpening = !openRows[id];

        // 1. сначала обновляем state
        setOpenRows((prev) => ({
            ...prev,
            [id]: isOpening,
        }));

        // 2. потом dispatch
        if (isOpening) {
            dispatch(
                fetchMaterialRequestItems({
                    material_request_id: id,
                    page: 1,
                    size: 10,
                }),
            );
        }
    };

    /*STATUS*/
    const getStatusConfig = (statusId: number) => {
        return (
            purchaseOrderStatuses[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };
    const handleItemsChange = useCallback((reqId: number, updatedItems: any[]) => {
        setItemsMap((prev) => {
            if (prev[reqId] === updatedItems) return prev;

            return {
                ...prev,
                [reqId]: updatedItems,
            };
        });
    }, []);

    /********************************************************************************************************************************/
    return (
        <div className="space-y-4">
            {/* Table - MATERIALREQ*/}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* MATERIALREQ- HEADER */}
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-left bg-blue-50"></th>
                                <th className="w-12 px-3 py-3 text-sm font-semibold text-center text-blue-700 bg-blue-50">
                                    №
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Блок
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата создание
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Статус
                                    </div>
                                </th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.data?.map((po) => {
                                const statusInfo = getStatusConfig(po.status);

                                return (
                                    <React.Fragment key={po.id}>
                                        {/* MATERIALREQEST_TABBLE */}
                                        <tr
                                            className="transition-colors border-b hover:bg-gray-50"
                                            onClick={() => toggleRow(po.id)}
                                        >
                                            {/* toggle */}
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(po.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[po.id] ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-700 bg-blue-40/20">
                                                {po.id}
                                            </td>

                                            {/* Блок */}
                                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-700 bg-blue-40/20">
                                                {po.block_id
                                                    ? props.refs.prjBlocks.lookup(po.block_id)
                                                    : '—'}
                                            </td>

                                            {/* Дата создания */}
                                            <td className="px-2 py-2 text-xs text-center text-gray-900 border-l ">
                                                {formatDateTime(po.created_at)}
                                            </td>

                                            {/* статус */}
                                            <td className="px-2 py-2 text-center text-gray-900 border-l">
                                                <span
                                                    className={`
                                                    inline-flex text-center px-2 py-0.5
                                                    text-xs font-semibold border rounded-full
                                                    ${statusInfo.className}
                                                `}
                                                >
                                                    {po.status != null
                                                        ? props.refs.purchaseOrderStatuses.lookup(
                                                              po.status,
                                                          )
                                                        : '—'}
                                                </span>
                                            </td>

                                            {/* Действия */}
                                            <td className="px-3 py-2 border-l bg-gray-50">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <StyledTooltip title="Удалить">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                props.onDeleteMatReqOrderId(po.id);
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

                                        {/* MaterialRequestItemsTable*/}
                                        {/* <tr className="border-b bg-gradient-to-r to-blue-50/50">
                                            <td colSpan={8} className="px-3 py-2">
                                                <Collapse in={openRows[req.id]} unmountOnExit>
                                                    <div className="px-3 py-2">
                                                        <p className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                                                            Материалы
                                                        </p>
                                                        <MatReqItemsTable
                                                            materialRequestId={req.id}
                                                            refs={props.refs}
                                                            currentUser={currentUser}
                                                            onDelete={props.onDeleteMatReqOrderItemId}
                                                            // НОВОЕ
                                                            // items={itemsMap[req.id] ?? items ?? []}
                                                            items={
                                                                itemsMap[req.id] ?? req.items ?? []
                                                            }
                                                            onChange={(updatedItems) =>
                                                                handleItemsChange(
                                                                    req.id,
                                                                    updatedItems,
                                                                )
                                                            }
                                                            pagination={pagination}
                                                        />
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr> */}
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
