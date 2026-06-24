import { Collapse } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { formatDate } from '@/utils/formatData';
import { taskPriorities, taskStatuses } from '@/utils/getStatusColor';
import {
    getTaskAssigneeIds,
    type Task,
    type TaskAssignee,
} from './tasksSlice';
import {
    TASK_STATUS_ACKNOWLEDGED,
    TASK_STATUS_CANCELED,
    TASK_STATUS_COMPLETED,
    TASK_STATUS_CREATED,
    TASK_STATUS_IN_PROGRESS,
} from './TasksPage';

interface TasksTablePropsType {
    items: Task[];
    refs: Record<string, ReferenceResult>;
    currentUserId: number | null;
    focusedTaskId?: number | null;
    onEdit: (task: Task) => void;
    onDeleteTasksId: (id: number) => void;
    onAcknowledgeTask: (id: number) => void;
    onStartTask: (id: number) => void;
    onCompleteTask: (id: number) => void;
    onCancelTask: (id: number) => void;
}

export default function TasksTable({
    items,
    refs,
    currentUserId,
    focusedTaskId,
    onEdit,
    onDeleteTasksId,
    onAcknowledgeTask,
    onStartTask,
    onCompleteTask,
    onCancelTask,
}: TasksTablePropsType) {
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!focusedTaskId) return;
        if (!items.some((task) => Number(task.id) === Number(focusedTaskId))) return;

        setOpenRows((prev) => ({
            ...prev,
            [focusedTaskId]: true,
        }));

        const timeoutId = window.setTimeout(() => {
            document
                .getElementById(`task-row-${focusedTaskId}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        return () => window.clearTimeout(timeoutId);
    }, [focusedTaskId, items]);

    const ACTIVE_STATUSES = [
        TASK_STATUS_CREATED,
        TASK_STATUS_ACKNOWLEDGED,
        TASK_STATUS_IN_PROGRESS,
    ];

    const isOverdue = (deadline: string, status: number) => {
        if (!ACTIVE_STATUSES.includes(status)) return false;

        const deadlineDate = new Date(deadline.replace(' ', 'T'));
        return deadlineDate < new Date();
    };

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const getCurrentAssignee = (task: Task): TaskAssignee | null => {
        if (!currentUserId || !Array.isArray(task.assignees)) return null;

        return (
            task.assignees.find((assignee) => Number(assignee.user_id) === Number(currentUserId)) ||
            null
        );
    };

    const getDisplayedStatus = (task: Task) =>
        getCurrentAssignee(task)?.status ?? task.status;

    const getAssigneeNames = (task: Task) => {
        const assigneeIds = getTaskAssigneeIds(task);
        if (!assigneeIds.length) return '—';

        const names = assigneeIds
            .map((userId) => refs.users.lookup(userId))
            .filter((name) => Boolean(name && name !== '—'));

        return names.length ? names.join(', ') : '—';
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 bg-blue-50 px-4 py-3 text-left"></th>
                                <th className="bg-blue-50 px-4 py-3 text-left">
                                    <div className="text-xs font-semibold uppercase text-blue-700">
                                        Название задачи
                                    </div>
                                </th>
                                <th className="border-l bg-blue-50 px-4 py-3 text-center">
                                    <div className="text-xs font-semibold uppercase text-blue-700">
                                        Статус
                                    </div>
                                </th>
                                <th className="border-l bg-blue-50 px-4 py-3 text-center">
                                    <div className="text-xs font-semibold uppercase text-blue-700">
                                        Приоритет
                                    </div>
                                </th>
                                <th className="border-l bg-blue-50 px-4 py-3 text-center">
                                    <div className="text-xs font-semibold uppercase text-blue-700">
                                        Дедлайн
                                    </div>
                                </th>
                                <th className="border-l bg-blue-50 px-4 py-3 text-center">
                                    <div className="text-left text-xs font-semibold uppercase text-blue-700">
                                        Исполнители
                                    </div>
                                </th>
                                <th className="w-24 border-l bg-gray-50 px-4 py-3 text-center">
                                    <div className="text-xs uppercase text-gray-600">Действия</div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((task) => {
                                const displayedStatus = getDisplayedStatus(task);
                                const taskStatus = taskStatuses[displayedStatus];
                                const priority =
                                    task.priority != null ? taskPriorities[task.priority] : undefined;
                                const taskAssigneeIds = getTaskAssigneeIds(task);
                                const isTaskOverdue = isOverdue(task.deadline, displayedStatus);
                                const isAssignee =
                                    currentUserId != null &&
                                    taskAssigneeIds.some(
                                        (userId) => Number(userId) === Number(currentUserId),
                                    );
                                const isCreator =
                                    currentUserId != null &&
                                    Number(currentUserId) === Number(task.created_user_id);
                                const canCancel =
                                    isCreator &&
                                    ![TASK_STATUS_COMPLETED, TASK_STATUS_CANCELED].includes(task.status);

                                return (
                                    <React.Fragment key={task.id}>
                                        <tr
                                            id={`task-row-${task.id}`}
                                            className="border-b transition-colors hover:bg-gray-50"
                                            onClick={() => toggleRow(task.id)}
                                            data-focused={
                                                focusedTaskId &&
                                                Number(focusedTaskId) === Number(task.id)
                                                    ? 'true'
                                                    : 'false'
                                            }
                                            style={
                                                focusedTaskId &&
                                                Number(focusedTaskId) === Number(task.id)
                                                    ? {
                                                          backgroundColor: '#eff6ff',
                                                          boxShadow:
                                                              'inset 3px 0 0 #2563eb, inset 0 0 0 1px rgba(37,99,235,0.15)',
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(task.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[task.id] ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </td>

                                            <td className="px-3 py-2">
                                                <div className="max-w-[180px] truncate text-sm font-medium text-gray-700">
                                                    {task.title}
                                                </div>
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                <span
                                                    className={`rounded border px-2 py-[2px] text-xs font-medium ${
                                                        taskStatus?.className ||
                                                        'border-gray-300 bg-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    {taskStatus?.label ||
                                                        refs.taskStatuses.lookup(displayedStatus)}
                                                </span>
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                {task.priority ? (
                                                    <span
                                                        className={`rounded border px-2 py-[2px] text-xs font-medium ${
                                                            priority?.className ||
                                                            'border-gray-300 bg-gray-200 text-gray-600'
                                                        }`}
                                                    >
                                                        {priority?.label ||
                                                            refs.taskPriorities.lookup(task.priority)}
                                                    </span>
                                                ) : (
                                                    '_'
                                                )}
                                            </td>

                                            <td className="px-3 py-2 text-center">
                                                <span
                                                    className={`text-sm ${
                                                        isTaskOverdue ? 'text-red-700' : 'text-sky-700'
                                                    }`}
                                                >
                                                    {formatDate(task.deadline)}
                                                    {isTaskOverdue && (
                                                        <span className="ml-1 text-[11px] text-red-600">
                                                            •
                                                        </span>
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-3 py-2">
                                                <span className="line-clamp-2 text-sm">
                                                    {getAssigneeNames(task)}
                                                </span>
                                            </td>

                                            <td className="border-l px-3 py-2">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <StyledTooltip title="Редактировать">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(task);
                                                            }}
                                                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                    </StyledTooltip>

                                                    <StyledTooltip title="Удалить">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteTasksId(task.id);
                                                            }}
                                                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </StyledTooltip>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td colSpan={7}>
                                                <Collapse in={openRows[task.id]} unmountOnExit>
                                                    <div className="rounded-lg border-blue-100 bg-white px-4 py-3 shadow-sm">
                                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="mb-2 text-sm tracking-wide text-sky-600 underline">
                                                                    Описание задачи
                                                                </p>

                                                                <p className="ml-8 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                                                    {task.description?.trim() ||
                                                                        'Описание отсутствует'}
                                                                </p>
                                                            </div>

                                                            <div className="w-full lg:w-[420px] lg:shrink-0">
                                                                <div className="space-y-2">
                                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-700">
                                                                        <div className="text-sm">
                                                                            <span className="text-xs font-medium text-violet-600">
                                                                                Автор:
                                                                            </span>{' '}
                                                                            {task.created_user_id
                                                                                ? refs.users.lookup(
                                                                                      task.created_user_id,
                                                                                  )
                                                                                : '—'}
                                                                        </div>

                                                                        <div className="text-sm">
                                                                            <span className="text-xs font-medium text-gray-600">
                                                                                Дата создания:
                                                                            </span>{' '}
                                                                            {task.created_at
                                                                                ? formatDate(task.created_at)
                                                                                : '—'}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-700">
                                                                        <div className="text-sm">
                                                                            <span className="text-xs font-medium text-violet-800">
                                                                                Исполнители:
                                                                            </span>{' '}
                                                                            {getAssigneeNames(task)}
                                                                        </div>

                                                                        <div className="text-sm">
                                                                            <span className="text-xs font-medium text-rose-700">
                                                                                Дедлайн:
                                                                            </span>{' '}
                                                                            {task.deadline
                                                                                ? formatDate(task.deadline)
                                                                                : '—'}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                                                                    {isAssignee &&
                                                                        displayedStatus ===
                                                                            TASK_STATUS_CREATED && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onAcknowledgeTask(task.id);
                                                                                }}
                                                                                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                                                            >
                                                                                Ознакомлен
                                                                            </button>
                                                                        )}

                                                                    {isAssignee &&
                                                                        displayedStatus ===
                                                                            TASK_STATUS_ACKNOWLEDGED && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onStartTask(task.id);
                                                                                }}
                                                                                className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
                                                                            >
                                                                                В работе
                                                                            </button>
                                                                        )}

                                                                    {isAssignee &&
                                                                        displayedStatus ===
                                                                            TASK_STATUS_IN_PROGRESS && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onCompleteTask(task.id);
                                                                                }}
                                                                                className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                                                                            >
                                                                                Выполнена
                                                                            </button>
                                                                        )}

                                                                    {canCancel && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onCancelTask(task.id);
                                                                            }}
                                                                            className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
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
