import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '../../reference/useReference';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../pto/PtoPage';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { FolderOpen, XCircle } from 'lucide-react';
import { Add } from '@mui/icons-material';
import { TablePagination } from '@/components/ui/TablePagination';
import toast from 'react-hot-toast';
import { createTask, deleteTask, fetchTasks, updateTask, type Task } from './tasksSlice';
import TasksTable from './TasksTable';
import TaskForm from './TasksForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export const TASK_STATUS_CREATED = 1;
export const TASK_STATUS_ACKNOWLEDGED = 2;
export const TASK_STATUS_IN_PROGRESS = 3;
export const TASK_STATUS_COMPLETED = 4;
export const TASK_STATUS_CANCELED = 6;
/*******************************************************************************************************************************************************************/
export default function TasksPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const dispatch = useAppDispatch();
    const { items, stats, pagination, loading } = useAppSelector((s) => s.tasks);

    const newCount = stats?.statuses?.[1] ?? 0; // Создана
    const readCount = stats?.statuses?.[2] ?? 0; //Ознакомлен
    const activeCount = stats?.statuses?.[3] ?? 0; // В работе
    const doneCount = stats?.statuses?.[4] ?? 0; // Исполнена
    const cancelCount = stats?.statuses?.[5] ?? 0; // Отменена
    const overdueCount = stats?.overdueCount ?? 0; // просрочена

    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const currentUser = useAppSelector((state) => state.auth.user);
    const isAdmin = currentUser?.role_id === 1;

    //Справочники
    const refs = {
        users: useReference('users'),
        taskStatuses: useReference('taskStatuses'),
        taskPriorities: useReference('taskPriorities'),
    };

    //Первичная загрузка =====
    useEffect(() => {
        if (!projectId) return;

        dispatch(
            fetchTasks({
                project_id: Number(projectId),
                page,
                size,
                ...(isAdmin ? {} : { user_id: currentUser?.id }),
            }),
        );
    }, [dispatch, projectId, page, size, isAdmin, currentUser?.id]);

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

    /*CREATE*/
    const handleCreate = async (data: Partial<Task>) => {
        try {
            if (editingTask) {
                await dispatch(
                    updateTask({
                        id: editingTask.id,
                        data,
                    }),
                ).unwrap();

                toast.success('Задача успешно обновлена');
            } else {
                await dispatch(createTask(data)).unwrap();

                toast.success('Задача успешно создана');
            }

            dispatch(
                fetchTasks({
                    page,
                    size,
                    project_id: projectId,
                }),
            );

            setOpenCreate(false);
            setEditingTask(null);
        } catch (error: any) {
            toast.error(error || 'Ошибка при сохранении задачи');
        }
    };

    /* удаление */
    const handleDelete = (id: number) => {
        setSelectedTaskId(id);
        setConfirmOpen(true);
    };

    /* CONFIRM DELETE */
    const handleConfirm = async () => {
        if (!selectedTaskId) return;

        try {
            await dispatch(deleteTask(selectedTaskId)).unwrap();

            dispatch(
                fetchTasks({
                    page,
                    size,
                    project_id: projectId,
                }),
            );

            toast.success(`Задача успешно удалёна`);
        } catch (error: any) {
            toast.error(
                error || 'Ошибка при удалении задачи. Проверьте права доступа на удаление.',
            );
        } finally {
            setConfirmOpen(false);
            setSelectedTaskId(null);
        }
    };

    /**********************************************/
    const handleChangeTaskStatus = async (taskId: number, status: number) => {
        const statusMessages: Record<number, string> = {
            [TASK_STATUS_ACKNOWLEDGED]: 'Задача переведена в статус "Ознакомлен"',
            [TASK_STATUS_IN_PROGRESS]: 'Задача переведена в статус "В работе"',
            [TASK_STATUS_COMPLETED]: 'Задача переведена в статус "Выполнена"',
            [TASK_STATUS_CANCELED]: 'Задача переведена в статус "Отменена"',
        };

        try {
            await dispatch(
                updateTask({
                    id: taskId,
                    data: { status },
                }),
            ).unwrap();

            toast.success(statusMessages[status] || 'Статус задачи обновлён');
        } catch (e) {
            console.error(e);
            toast.error('Не удалось изменить статус задачи');
        }
    };

    /********************************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenCreate(true)}>
                    Добавить задачу
                </Button>
            </Box>

            <div className="flex items-center gap-6 mb-6 text-sm">
                <div
                    className="flex flex-wrap items-center gap-5"
                    style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0' }}
                >
                    <StatusBadge color="#1976d2" bg="#e3f2fd" label="Новых" count={newCount} />
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
                    <div className="flex items-center gap-2">
                        <XCircle style={{ width: '15px', height: '15px', color: '#e53935' }} />
                        <span style={{ fontSize: '13px', color: '#757575' }}>Просрочено:</span>
                        <span
                            style={{
                                backgroundColor: '#e53935',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 600,
                                padding: '1px 8px',
                                borderRadius: '4px',
                            }}
                        >
                            {overdueCount}
                        </span>
                    </div>
                </div>
            </div>
            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : items.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-gray-900">
                        В объекте отсутствуют задачи. Добавьте новую задачу нажав на кнопку "
                        Добавить задачу".
                    </h3>
                </div>
            ) : (
                <>
                    <TasksTable
                        items={items}
                        refs={refs}
                        currentUserId={currentUser?.id ?? null}
                        onEdit={setEditingTask}
                        onDeleteTasksId={handleDelete}
                        onAcknowledgeTask={(id) => handleChangeTaskStatus(id, 2)}
                        onStartTask={(id) => handleChangeTaskStatus(id, 3)}
                        onCompleteTask={(id) => handleChangeTaskStatus(id, 4)}
                        onCancelTask={(id) => handleChangeTaskStatus(id, 6)}
                    />

                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => setPage(newPage)}
                            onSizeChange={(newSize) => {
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
            {/* CREATE/EDIT MODAL */}
            <TaskForm
                open={openCreate || !!editingTask}
                projectId={projectId}
                task={editingTask}
                refs={refs}
                onSubmit={handleCreate}
                onClose={() => {
                    setOpenCreate(false);
                    setEditingTask(null);
                }}
            />

            {/* Диалог подтверждения */}
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
