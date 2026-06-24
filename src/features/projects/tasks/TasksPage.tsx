import { Add } from '@mui/icons-material';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { FolderOpen, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '../../reference/useReference';
import type { ProjectOutletContext } from '../pto/PtoPage';
import TaskForm from './TasksForm';
import TasksTable from './TasksTable';
import {
    addTaskAssignees,
    createTask,
    deleteTask,
    fetchTasks,
    getTaskAssigneeIds,
    updateOwnTaskAssigneeStatus,
    updateTask,
    type CreateTaskPayload,
    type Task,
    type UpdateTaskPayload,
} from './tasksSlice';

export const TASK_STATUS_CREATED = 1;
export const TASK_STATUS_ACKNOWLEDGED = 2;
export const TASK_STATUS_IN_PROGRESS = 3;
export const TASK_STATUS_COMPLETED = 4;
export const TASK_STATUS_CANCELED = 6;

type TaskSubmitData = (CreateTaskPayload | UpdateTaskPayload) & {
    assignee_user_ids: number[];
};

const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

export default function TasksPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { items, stats, pagination, loading } = useAppSelector((state) => state.tasks);
    const currentUser = useAppSelector((state) => state.auth.user);
    const isAdmin = currentUser?.role_id === 1;

    const newCount = stats?.statuses?.[1] ?? 0;
    const readCount = stats?.statuses?.[2] ?? 0;
    const activeCount = stats?.statuses?.[3] ?? 0;
    const doneCount = stats?.statuses?.[4] ?? 0;
    const cancelCount = stats?.statuses?.[5] ?? 0;
    const overdueCount = stats?.overdueCount ?? 0;

    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const focusId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const value = params.get('focus');
        if (!value) return null;

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }, [location.search]);

    const refs = {
        users: useReference('users'),
        taskStatuses: useReference('taskStatuses'),
        taskPriorities: useReference('taskPriorities'),
    };

    const loadTasks = () =>
        dispatch(
            fetchTasks({
                project_id: Number(projectId),
                ...(focusId ? { id: focusId } : { page, size }),
                ...(focusId ? {} : isAdmin ? {} : { user_id: currentUser?.id }),
            }),
        );

    const clearFocusFromUrl = () => {
        const params = new URLSearchParams(location.search);
        if (!params.has('focus')) return;
        params.delete('focus');

        navigate(
            {
                pathname: location.pathname,
                search: params.toString() ? `?${params.toString()}` : '',
            },
            { replace: true },
        );
    };

    useEffect(() => {
        if (!projectId) return;

        dispatch(
            fetchTasks({
                project_id: Number(projectId),
                ...(focusId ? { id: focusId } : { page, size }),
                ...(focusId ? {} : isAdmin ? {} : { user_id: currentUser?.id }),
            }),
        );
    }, [dispatch, projectId, page, size, isAdmin, currentUser?.id, focusId]);

    function StatusBadge({
        color,
        bg,
        label,
        count,
    }: {
        color: string;
        bg: string;
        label: string;
        count: number;
    }) {
        return (
            <div className="flex items-center gap-2">
                <span style={{ fontSize: '13px', color: '#757575' }}>{label}:</span>
                <span
                    style={{
                        backgroundColor: bg,
                        color,
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '1px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${color}22`,
                    }}
                >
                    {count}
                </span>
            </div>
        );
    }

    const handleCreateOrUpdate = async (data: TaskSubmitData) => {
        try {
            const { assignee_user_ids, ...rest } = data;

            if (editingTask) {
                const existingAssigneeIds = getTaskAssigneeIds(editingTask);
                const newAssigneeIds = assignee_user_ids.filter(
                    (userId) => !existingAssigneeIds.includes(Number(userId)),
                );

                await dispatch(
                    updateTask({
                        id: editingTask.id,
                        data: rest,
                    }),
                ).unwrap();

                if (newAssigneeIds.length) {
                    await dispatch(
                        addTaskAssignees({
                            taskId: editingTask.id,
                            assignee_user_ids: newAssigneeIds,
                        }),
                    ).unwrap();
                }

                toast.success(
                    newAssigneeIds.length
                        ? 'Задача обновлена, новые исполнители добавлены'
                        : 'Задача успешно обновлена',
                );
            } else {
                await dispatch(
                    createTask({
                        ...(rest as CreateTaskPayload),
                        project_id: Number(projectId),
                        assignee_user_ids,
                    }),
                ).unwrap();

                toast.success('Задача успешно создана');
            }

            await loadTasks();
            setOpenCreate(false);
            setEditingTask(null);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Ошибка при сохранении задачи'));
        }
    };

    const handleDelete = (id: number) => {
        setSelectedTaskId(id);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!selectedTaskId) return;

        try {
            await dispatch(deleteTask(selectedTaskId)).unwrap();
            await loadTasks();
            toast.success('Задача успешно удалена');
        } catch (error: unknown) {
            toast.error(
                getErrorMessage(error, 'Ошибка при удалении задачи. Проверьте права доступа.'),
            );
        } finally {
            setConfirmOpen(false);
            setSelectedTaskId(null);
        }
    };

    const handleChangeTaskStatus = async (taskId: number, status: number) => {
        const statusMessages: Record<number, string> = {
            [TASK_STATUS_ACKNOWLEDGED]: 'Ваш статус по задаче обновлён: "Ознакомлен"',
            [TASK_STATUS_IN_PROGRESS]: 'Ваш статус по задаче обновлён: "В работе"',
            [TASK_STATUS_COMPLETED]: 'Ваш статус по задаче обновлён: "Выполнена"',
            [TASK_STATUS_CANCELED]: 'Задача переведена в статус "Отменена"',
        };

        try {
            if (status === TASK_STATUS_CANCELED) {
                await dispatch(
                    updateTask({
                        id: taskId,
                        data: { status },
                    }),
                ).unwrap();
            } else {
                await dispatch(updateOwnTaskAssigneeStatus({ taskId, status })).unwrap();
            }

            await loadTasks();
            toast.success(statusMessages[status] || 'Статус задачи обновлён');
        } catch (error) {
            console.error(error);
            toast.error('Не удалось изменить статус задачи');
        }
    };

    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            <div className="flex items-center justify-between mb-3 text-sm">
                {/* ЛЕВАЯ ЧАСТЬ: Бейджи + Линия снизу */}
                <div className="flex items-center gap-4 pb-2 pr-4 border-b border-stone-200">
                    <StatusBadge color="#1976d2" bg="#e3f2fd" label="Новые" count={newCount} />
                    <StatusBadge
                        color="#e65100"
                        bg="#fff3e0"
                        label="В работе"
                        count={activeCount}
                    />
                    <StatusBadge
                        color="#6a1b9a"
                        bg="#f3e5f5"
                        label="Ознакомлен"
                        count={readCount}
                    />
                    <StatusBadge color="#2e7d32" bg="#e8f5e9" label="Исполнена" count={doneCount} />
                    <StatusBadge
                        color="#757575"
                        bg="#f5f5f5"
                        label="Отменено"
                        count={cancelCount}
                    />

                    {/* Блок "Просрочено" */}
                    <div className="flex items-center gap-2 pl-4 ml-2 border-l border-stone-200">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-stone-500">Просрочено:</span>
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                            {overdueCount}
                        </span>
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: Кнопка (отдельно, без линии снизу) */}
                <div className="shrink-0">
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setOpenCreate(true)}
                        className="ml-4" /* Отступ от фильтров */
                    >
                        Добавить задачу
                    </Button>
                </div>
            </div>

            {loading ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : items.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-gray-900">
                        В объекте отсутствуют задачи. Добавьте новую задачу кнопкой "Добавить
                        задачу".
                    </h3>
                </div>
            ) : (
                <>
                    <TasksTable
                        items={items}
                        refs={refs}
                        currentUserId={currentUser?.id ?? null}
                        focusedTaskId={focusId}
                        onEdit={setEditingTask}
                        onDeleteTasksId={handleDelete}
                        onAcknowledgeTask={(id) =>
                            handleChangeTaskStatus(id, TASK_STATUS_ACKNOWLEDGED)
                        }
                        onStartTask={(id) => handleChangeTaskStatus(id, TASK_STATUS_IN_PROGRESS)}
                        onCompleteTask={(id) => handleChangeTaskStatus(id, TASK_STATUS_COMPLETED)}
                        onCancelTask={(id) => handleChangeTaskStatus(id, TASK_STATUS_CANCELED)}
                    />

                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                clearFocusFromUrl();
                                setPage(newPage);
                            }}
                            onSizeChange={(newSize) => {
                                clearFocusFromUrl();
                                setPage(1);
                                setSize(newSize);
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </>
            )}

            <TaskForm
                open={openCreate || !!editingTask}
                projectId={Number(projectId)}
                task={editingTask}
                refs={refs}
                onSubmit={handleCreateOrUpdate}
                onClose={() => {
                    setOpenCreate(false);
                    setEditingTask(null);
                }}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Удаление задачи"
                message="Вы уверены, что хотите удалить задачу?"
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </Paper>
    );
}
