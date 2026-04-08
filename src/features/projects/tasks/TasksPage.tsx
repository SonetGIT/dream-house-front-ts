import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '../../reference/useReference';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../pto/PtoPage';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { CheckCircle2, FolderOpen, TrendingUp, XCircle } from 'lucide-react';
import { Add } from '@mui/icons-material';
import { TablePagination } from '@/components/ui/TablePagination';
import toast from 'react-hot-toast';
import { deleteWarehouseItem } from '../warehouseStocks/warehouseStocksSlice';
import { deleteTask, fetchTasks, type Task } from './tasksSlice';
import TasksTable from './TasksTable';
import { ConfirmDialogNew } from '@/components/ui/ConfirmDialogNew';

/*******************************************************************************************************************************************************************/
export default function TasksPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const projectIdNum = projectId ? Number(projectId) : null;
    const dispatch = useAppDispatch();
    const { items, pagination, loading } = useAppSelector((s) => s.tasks);

    const newCount = items.filter((t) => t.status === 1).length; //Создана
    const activeCount = items.filter((t) => t.status === 3).length; //в работе
    const doneCount = items.filter((t) => t.status === 4).length; //Исполнена
    const reviewCount = items.filter((t) => t.status === 2).length; //Ознакомлен
    const cancelCount = items.filter((t) => t.status === 5).length; //Отменена
    const overdueCount = items.filter(
        (t) => t.status !== 3 && t.status !== 4 && new Date(t.deadline) < new Date(),
    ).length;
    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    // const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    // const [formLoading, setFormLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    // const emptyWarehouses = data.filter((w) => !w.items?.length).length;
    // const filledWarehouses = data.filter((w) => w.items && w.items.length > 0).length;
    // const fillPercent = data.length > 0 ? Math.round((filledWarehouses / data.length) * 100) : 0;

    // // Справочники
    const refs = {
        users: useReference('users'),
        taskStatuses: useReference('taskStatuses'),
        taskPriorities: useReference('taskPriorities'),
    };

    // //Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchTasks({ page, size, project_id: projectId }));
    }, [projectId, page, size]);

    // const handleCreate = () => {
    //     setSelectedWarehouse(null);
    //     setModal('create');
    // };

    // const handleEdit = (warehouse: Warehouse) => {
    //     setSelectedWarehouse(warehouse);
    //     setModal('edit');
    // };

    // const refetchWHouse = (page = pagination?.page ?? 1, size = pagination?.size ?? 10) => {
    //     dispatch(
    //         fetchWarehouses({
    //             project_id: projectId,
    //             page,
    //             size,
    //             // ...filters,
    //         }),
    //     );
    // };

    // const handleCreateWhouse = async (data: WarehouseFormData) => {
    //     try {
    //         setFormLoading(true);

    //         await dispatch(createWarehouse({ project_id: projectId, data })).unwrap();

    //         toast.success(`Склад успешно создан: ${data.name}`);

    //         refetchWHouse(1); //всегда на первую страницу

    //         setModal(null);
    //     } catch (err: any) {
    //         toast.error(err || 'Ошибка создания склада');
    //     } finally {
    //         setFormLoading(false);
    //     }
    // };

    // const handleUpdateWhouse = async (data: WarehouseFormData) => {
    //     if (!selectedWarehouse) return;

    //     try {
    //         setFormLoading(true);

    //         await dispatch(
    //             updateWarehouse({
    //                 id: selectedWarehouse.id,
    //                 data,
    //             }),
    //         ).unwrap();

    //         toast.success(`Данные склада обновлены: ${data.name}`);

    //         refetchWHouse(); //остаёмся на текущей странице

    //         setModal(null);
    //         setSelectedWarehouse(null);
    //     } catch (err: any) {
    //         toast.error(err || 'Ошибка обновления данных склада');
    //     } finally {
    //         setFormLoading(false);
    //     }
    // };

    // /* удаление */
    const handleDelete = (task: Task) => {
        setSelectedTask(task);
        setModal('delete');
    };
    const handleDeleteTask = async () => {
        if (!selectedTask) return;

        try {
            setDeleteLoading(true);

            await dispatch(deleteTask(selectedTask.id)).unwrap();

            toast.success(`Задача успешно удалёна: ${selectedTask.title}`);

            dispatch(
                fetchTasks({
                    page: pagination?.page ?? page,
                    size: pagination?.size ?? size,
                    // ...filters,
                }),
            );

            setModal(null);
            setSelectedTask(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка удаления задачи');
        } finally {
            setDeleteLoading(false);
        }
    };

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

    /********************************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => alert('handleCreate')}
                >
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
                        count={reviewCount}
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
                        В объекте отсутствуют задачи. Добавьте новую ЗАДАЧУ нажав на кнопку "
                        Добавить задачу".
                    </h3>
                </div>
            ) : (
                <>
                    <TasksTable
                        items={items}
                        refs={refs}
                        onEdit={() => alert('handleEdit')}
                        onDeleteTasksId={handleDelete}
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
            {/* <Modal
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать новый склад"
            >
                <WarehouseForm
                    refs={refs}
                    onSubmit={handleCreateWhouse}
                    onCancel={() => setModal(null)}
                    isLoading={loading}
                />
            </Modal> */}

            {/* EDIT */}

            {/* DELETE CONFIRM */}
            <ConfirmDialogNew
                isOpen={modal === 'delete'}
                onClose={() => setModal(null)}
                onConfirm={handleDeleteTask}
                title="Удалить подрядчика?"
                message={`Вы уверены, что хотите удалить подрядчика "${selectedTask?.title}"`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={deleteLoading}
            />
        </Paper>
    );
}
