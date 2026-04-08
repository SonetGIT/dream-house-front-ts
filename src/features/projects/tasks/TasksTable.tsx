import React, { useState } from 'react';
import { Box, Button, Collapse } from '@mui/material';
import { ChevronDown, ChevronRight, Pencil, Phone, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchWarehouseItems } from '../warehouseStocks/warehouseStocksSlice';
import type { Task } from './tasksSlice';
import { formatDate } from '@/utils/formatData';
import { taskPriorities, taskStatuses } from '@/utils/getStatusColor';

interface TasksTablePropsType {
    items: Task[];
    refs: Record<string, ReferenceResult>;
    onEdit: (task: Task) => void;
    onDeleteTasksId: (task: Task) => void;
}

type TabType = 'materials' | 'movements';

/*******************************************************************************************************************************/
export default function TasksTable({ items, refs, onEdit }: TasksTablePropsType) {
    const dispatch = useAppDispatch();

    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});

    /*DEADLINE*/
    const ACTIVE_STATUSES = [1, 2, 3]; // Создана, Ознакомлен, В работе

    function isOverdue(deadline: string, status: number) {
        if (!ACTIVE_STATUSES.includes(status)) return false;

        const deadlineDate = new Date(deadline.replace(' ', 'T'));
        const now = new Date();

        return deadlineDate < now;
    }

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
                                        Название задачи
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Статус
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Приоритет
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дедлайн
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-left text-blue-700 uppercase">
                                        Ответственный
                                    </div>
                                </th>

                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items?.map((tsk) => {
                                const taskStatus = taskStatuses[tsk.status];
                                const priority = taskPriorities[tsk.priority];
                                return (
                                    <React.Fragment key={tsk.id}>
                                        <tr
                                            className="transition-colors border-b hover:bg-gray-50"
                                            onClick={() => toggleRow(tsk.id)}
                                        >
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(tsk.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[tsk.id] ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>

                                            <td className="px-3 py-2">
                                                <div className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                                    {tsk.title}
                                                </div>
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                {tsk.status ? (
                                                    <span
                                                        className={`px-2 py-[2px] rounded text-xs font-medium border ${
                                                            taskStatus?.className ||
                                                            'bg-gray-200 text-gray-600 border-gray-300'
                                                        }`}
                                                    >
                                                        {taskStatus.label ||
                                                            refs.taskStatuses.lookup(tsk.priority)}
                                                    </span>
                                                ) : (
                                                    '_'
                                                )}
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                {tsk.priority ? (
                                                    <span
                                                        className={`px-2 py-[2px] rounded text-xs font-medium border ${
                                                            priority?.className ||
                                                            'bg-gray-200 text-gray-600 border-gray-300'
                                                        }`}
                                                    >
                                                        {priority?.label ||
                                                            refs.taskPriorities.lookup(
                                                                tsk.priority,
                                                            )}
                                                    </span>
                                                ) : (
                                                    '_'
                                                )}
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                {(() => {
                                                    const isTaskOverdue = isOverdue(
                                                        tsk.deadline,
                                                        tsk.status,
                                                    );

                                                    return (
                                                        <span
                                                            className={`text-sm ${
                                                                isTaskOverdue
                                                                    ? 'text-red-700'
                                                                    : 'text-sky-700'
                                                            }`}
                                                        >
                                                            {formatDate(tsk.deadline)}

                                                            {isTaskOverdue && (
                                                                <span className="text-[11px] text-red-600 ml-1">
                                                                    ▲
                                                                </span>
                                                            )}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-3 py-2">
                                                {tsk.responsible_user_id ? (
                                                    <span className="text-sm">
                                                        {refs.users.lookup(tsk.responsible_user_id)}
                                                    </span>
                                                ) : (
                                                    '_'
                                                )}
                                            </td>

                                            <td className="px-3 py-2 border-l">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <StyledTooltip title="Редактировать">
                                                        <button
                                                            // onClick={(e) => {
                                                            //     e.stopPropagation();
                                                            //     onEdit(tsk);
                                                            // }}
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
                                                                onDeleteTasksId(tsk);
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
