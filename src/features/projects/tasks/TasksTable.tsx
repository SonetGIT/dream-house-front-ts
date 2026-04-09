import React, { useState } from 'react';
import { Collapse } from '@mui/material';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { Task } from './tasksSlice';
import { formatDate } from '@/utils/formatData';
import { taskPriorities, taskStatuses } from '@/utils/getStatusColor';
import {
    TASK_STATUS_CREATED,
    TASK_STATUS_ACKNOWLEDGED,
    TASK_STATUS_IN_PROGRESS,
    TASK_STATUS_COMPLETED,
    TASK_STATUS_CANCELED,
} from './TasksPage';

interface TasksTablePropsType {
    items: Task[];
    refs: Record<string, ReferenceResult>;
    currentUserId: number | null;
    onEdit: (task: Task) => void;
    onDeleteTasksId: (id: number) => void;
    onAcknowledgeTask: (id: number) => void;
    onStartTask: (id: number) => void;
    onCompleteTask: (id: number) => void;
    onCancelTask: (id: number) => void;
}
/*******************************************************************************************************************************/
export default function TasksTable({
    items,
    refs,
    currentUserId,
    onEdit,
    onDeleteTasksId,
    onAcknowledgeTask,
    onStartTask,
    onCompleteTask,
    onCancelTask,
}: TasksTablePropsType) {
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});

    const ACTIVE_STATUSES = [
        TASK_STATUS_CREATED,
        TASK_STATUS_ACKNOWLEDGED,
        TASK_STATUS_IN_PROGRESS,
    ];

    function isOverdue(deadline: string, status: number) {
        if (!ACTIVE_STATUSES.includes(status)) return false;

        const deadlineDate = new Date(deadline.replace(' ', 'T'));
        const now = new Date();

        return deadlineDate < now;
    }

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
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
                                const priority =
                                    tsk.priority != null ? taskPriorities[tsk.priority] : undefined;

                                const isTaskOverdue = isOverdue(tsk.deadline, tsk.status);
                                const isResponsible =
                                    currentUserId != null &&
                                    Number(currentUserId) === Number(tsk.responsible_user_id);
                                const isCreator =
                                    currentUserId != null &&
                                    Number(currentUserId) === Number(tsk.created_user_id);

                                const canCancel =
                                    isCreator &&
                                    ![TASK_STATUS_COMPLETED, TASK_STATUS_CANCELED].includes(
                                        tsk.status,
                                    );

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
                                                        {taskStatus?.label ||
                                                            refs.taskStatuses.lookup(tsk.status)}
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
                                                <span
                                                    className={`text-sm ${
                                                        isTaskOverdue
                                                            ? 'text-red-700'
                                                            : 'text-sky-700'
                                                    }`}
                                                >
                                                    {formatDate(tsk.deadline)}
                                                    {isTaskOverdue && (
                                                        <span className="ml-1 text-[11px] text-red-600">
                                                            ▲
                                                        </span>
                                                    )}
                                                </span>
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(tsk);
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
                                                                onDeleteTasksId(tsk.id);
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

                                        <tr>
                                            <td colSpan={7}>
                                                <Collapse in={openRows[tsk.id]} unmountOnExit>
                                                    <div className="px-4 py-3 bg-white border-blue-100 rounded-lg shadow-sm">
                                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="mb-2 text-sm tracking-wide underline text-sky-600">
                                                                    Описание задачи
                                                                </p>

                                                                <p className="ml-8 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                                                                    {tsk.description?.trim() ||
                                                                        'Описание отсутствует'}
                                                                </p>
                                                            </div>

                                                            <div className="w-full lg:w-[360px] lg:shrink-0">
                                                                <div className="space-y-2">
                                                                    <div className="flex flex-wrap items-center text-sm text-gray-700 gap-x-6 gap-y-1">
                                                                        <div className="text-sm">
                                                                            <span className="text-xs font-medium text-violet-600">
                                                                                Автор:
                                                                            </span>{' '}
                                                                            {tsk.created_user_id
                                                                                ? refs.users.lookup(
                                                                                      tsk.created_user_id,
                                                                                  )
                                                                                : '—'}
                                                                        </div>

                                                                        <div className="text-sm">
                                                                            <span className="text-xs font-medium text-gray-600">
                                                                                Дата создания:
                                                                            </span>{' '}
                                                                            {tsk.created_at
                                                                                ? formatDate(
                                                                                      tsk.created_at,
                                                                                  )
                                                                                : '—'}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-wrap items-center text-sm text-gray-700 gap-x-6 gap-y-1">
                                                                        <div className="text-sm">
                                                                            <span className="text-xs font-medium text-violet-800">
                                                                                Ответственный:
                                                                            </span>{' '}
                                                                            {tsk.responsible_user_id
                                                                                ? refs.users.lookup(
                                                                                      tsk.responsible_user_id,
                                                                                  )
                                                                                : '—'}
                                                                        </div>

                                                                        <div className="text-sm">
                                                                            <span className="text-xs font-medium text-rose-700">
                                                                                Дедлайн:
                                                                            </span>{' '}
                                                                            {tsk.deadline
                                                                                ? formatDate(
                                                                                      tsk.deadline,
                                                                                  )
                                                                                : '—'}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap items-center justify-end gap-2 mt-6">
                                                                    {isResponsible &&
                                                                        tsk.status ===
                                                                            TASK_STATUS_CREATED && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onAcknowledgeTask(
                                                                                        tsk.id,
                                                                                    );
                                                                                }}
                                                                                className="px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100"
                                                                            >
                                                                                Ознакомлен
                                                                            </button>
                                                                        )}

                                                                    {isResponsible &&
                                                                        tsk.status ===
                                                                            TASK_STATUS_ACKNOWLEDGED && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onStartTask(
                                                                                        tsk.id,
                                                                                    );
                                                                                }}
                                                                                className="px-3 py-1.5 text-sm font-medium transition-colors border rounded-md text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
                                                                            >
                                                                                В работе
                                                                            </button>
                                                                        )}

                                                                    {isResponsible &&
                                                                        tsk.status ===
                                                                            TASK_STATUS_IN_PROGRESS && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onCompleteTask(
                                                                                        tsk.id,
                                                                                    );
                                                                                }}
                                                                                className="px-3 py-1.5 text-sm font-medium text-green-700 transition-colors border border-green-200 rounded-md bg-green-50 hover:bg-green-100"
                                                                            >
                                                                                Выполнена
                                                                            </button>
                                                                        )}

                                                                    {canCancel && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onCancelTask(
                                                                                    tsk.id,
                                                                                );
                                                                            }}
                                                                            className="px-3 py-1.5 text-sm font-medium text-red-700 transition-colors border border-red-200 rounded-md bg-red-50 hover:bg-red-100"
                                                                        >
                                                                            Отменить
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
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
