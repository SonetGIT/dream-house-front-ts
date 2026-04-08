import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    type Task,
    type FetchTasksPayload,
} from '@/store/tasksSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
import {
    ChevronsLeft,
    Plus,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    AlignJustify,
    Layers,
    Search,
    X,
} from 'lucide-react';
import { TaskForm } from './TaskForm';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import { EmptyState } from './EmptyState';
import { TaskRow } from './TaskRow';
import { STATUS_MAP } from './constants';

type TabId = 'all' | 'active' | 'done' | 'search';

const TABS: { id: TabId; label: string }[] = [
    { id: 'all', label: 'ВСЕ ЗАДАЧИ' },
    { id: 'active', label: 'В РАБОТЕ' },
    { id: 'done', label: 'ВЫПОЛНЕННЫЕ' },
    { id: 'search', label: 'ПОИСК' },
];

export function TasksPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading } = useAppSelector((s) => s.tasks);

    const [activeTab, setActiveTab] = useState<TabId>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const fetchParams = (): FetchTasksPayload => {
        if (activeTab === 'active') return { page: currentPage, size: pageSize, status: 1 };
        if (activeTab === 'done') return { page: currentPage, size: pageSize, status: 3 };
        return { page: currentPage, size: pageSize };
    };

    useEffect(() => {
        dispatch(fetchTasks(fetchParams()));
    }, [dispatch, activeTab, currentPage]);

    /* ── handlers ── */
    const handleCreate = () => {
        setEditingTask(null);
        setIsFormOpen(true);
    };
    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };
    const handleDelete = (task: Task) => setDeletingTask(task);

    const handleFormSubmit = async (data: Partial<Task>) => {
        setIsSubmitting(true);
        try {
            if (editingTask) {
                await dispatch(updateTask({ id: editingTask.id, data })).unwrap();
                toast.success('Задача успешно обновлена');
            } else {
                await dispatch(createTask(data)).unwrap();
                toast.success('Задача успешно создана');
            }
            setIsFormOpen(false);
            setEditingTask(null);
        } catch {
            toast.error('Ошибка операции. Попробуйте снова.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTask) return;
        setIsSubmitting(true);
        try {
            await dispatch(deleteTask(deletingTask.id)).unwrap();
            toast.success('Задача успешно удалена');
            setDeletingTask(null);
        } catch {
            toast.error('Ошибка удаления задачи');
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── computed ── */
    const displayedItems =
        activeTab === 'search' && searchQuery.trim()
            ? items.filter(
                  (t) =>
                      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()),
              )
            : items;

    const total = items.length;
    const newCount = items.filter((t) => t.status === 0).length;
    const activeCount = items.filter((t) => t.status === 1).length;
    const reviewCount = items.filter((t) => t.status === 2).length;
    const doneCount = items.filter((t) => t.status === 3).length;
    const cancelCount = items.filter((t) => t.status === 4).length;
    const overdueCount = items.filter(
        (t) => t.status !== 3 && t.status !== 4 && new Date(t.deadline) < new Date(),
    ).length;
    const donePercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    /* ── tab change ── */
    const handleTabChange = (id: TabId) => {
        setActiveTab(id);
        setCurrentPage(1);
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#f5f6fa' }}>
            {/* ══ Top Navigation Bar ══ */}
            <div className="bg-white" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <div className="flex items-start" style={{ padding: '10px 16px', gap: '12px' }}>
                    <div style={{ paddingTop: '4px' }}>
                        <ChevronsLeft style={{ width: '20px', height: '20px', color: '#bdbdbd' }} />
                    </div>

                    <button
                        style={{
                            backgroundColor: '#FFD600',
                            color: '#1a1a1a',
                            fontWeight: 500,
                            padding: '4px 12px',
                            marginTop: '2px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        Назад
                    </button>

                    <div className="flex-1 text-center">
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: '18px',
                                color: '#1a1a1a',
                                lineHeight: 1.2,
                            }}
                        >
                            Управление задачами
                        </div>
                        <div
                            className="flex items-center justify-center flex-wrap gap-x-5 gap-y-1"
                            style={{ marginTop: '4px', fontSize: '13px', color: '#616161' }}
                        >
                            <span>
                                Всего задач: <b style={{ color: '#1a1a1a' }}>{total}</b>
                            </span>
                            <span style={{ color: '#e0e0e0' }}>|</span>
                            <span>
                                В работе: <b style={{ color: '#e65100' }}>{activeCount}</b>
                            </span>
                            <span style={{ color: '#e0e0e0' }}>|</span>
                            <span>
                                Выполнено: <b style={{ color: '#2e7d32' }}>{doneCount}</b>
                            </span>
                            <span style={{ color: '#e0e0e0' }}>|</span>
                            <span>
                                Выполнение: <b style={{ color: '#9c27b0' }}>{donePercent}%</b>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ Tab Navigation ══ */}
            <div className="bg-white" style={{ borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ paddingLeft: '16px', display: 'flex' }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            style={{
                                fontSize: '12px',
                                padding: '10px 16px',
                                color: activeTab === tab.id ? '#1976d2' : '#9e9e9e',
                                borderBottom: `2px solid ${activeTab === tab.id ? '#1976d2' : 'transparent'}`,
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                letterSpacing: '0.06em',
                                marginBottom: '-1px',
                                background: 'none',
                                border: 'none',
                                borderBottomStyle: 'solid',
                                borderBottomWidth: '2px',
                                borderBottomColor: activeTab === tab.id ? '#1976d2' : 'transparent',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ══ Main Content ══ */}
            <div style={{ padding: '16px' }}>
                {/* Search bar (only on search tab) */}
                {activeTab === 'search' && (
                    <div
                        className="bg-white rounded"
                        style={{
                            border: '1px solid #e0e0e0',
                            padding: '14px 20px',
                            marginBottom: '12px',
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Search
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '15px',
                                    height: '15px',
                                    color: '#bdbdbd',
                                }}
                            />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск по названию или описанию задачи..."
                                style={{
                                    width: '100%',
                                    padding: '8px 34px 8px 34px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    color: '#1a1a1a',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#1976d2';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e0e0e0';
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9e9e9e',
                                        display: 'flex',
                                        padding: '2px',
                                    }}
                                >
                                    <X style={{ width: '14px', height: '14px' }} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded" style={{ border: '1px solid #e0e0e0' }}>
                    {/* ── Section header + stat chips ── */}
                    <div
                        className="flex items-center justify-between flex-wrap gap-3"
                        style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}
                    >
                        <h2
                            style={{
                                fontWeight: 600,
                                fontSize: '15px',
                                color: '#1a1a1a',
                                margin: 0,
                            }}
                        >
                            Список задач
                        </h2>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Chip: total */}
                            <StatChip
                                icon={
                                    <ClipboardList
                                        style={{ width: '12px', height: '12px', color: 'white' }}
                                    />
                                }
                                iconBg="#4caf50"
                                chipBg="#e8f5e9"
                                chipBorder="#c8e6c9"
                                label="Всего задач"
                                value={total}
                            />
                            {/* Chip: active */}
                            <StatChip
                                icon={
                                    <TrendingUp
                                        style={{ width: '12px', height: '12px', color: 'white' }}
                                    />
                                }
                                iconBg="#1976d2"
                                chipBg="#e3f2fd"
                                chipBorder="#bbdefb"
                                label="В работе"
                                value={activeCount}
                            />
                            {/* Chip: done */}
                            <StatChip
                                icon={
                                    <CheckCircle2
                                        style={{ width: '12px', height: '12px', color: 'white' }}
                                    />
                                }
                                iconBg="#9c27b0"
                                chipBg="#f3e5f5"
                                chipBorder="#e1bee7"
                                label="Выполнено"
                                value={doneCount}
                            />
                            {/* Chip: overdue */}
                            <StatChip
                                icon={
                                    <Clock
                                        style={{ width: '12px', height: '12px', color: 'white' }}
                                    />
                                }
                                iconBg="#e53935"
                                chipBg="#ffebee"
                                chipBorder="#ef9a9a"
                                label="Просрочено"
                                value={overdueCount}
                            />
                        </div>
                    </div>

                    {/* ── Status badges row ── */}
                    <div
                        className="flex items-center gap-5 flex-wrap"
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
                            label="На проверке"
                            count={reviewCount}
                        />
                        <StatusBadge
                            color="#2e7d32"
                            bg="#e8f5e9"
                            label="Выполнено"
                            count={doneCount}
                        />
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

                    {/* ── Toolbar ── */}
                    <div className="flex items-center justify-end" style={{ padding: '12px 20px' }}>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 rounded"
                            style={{
                                border: '1px solid #1976d2',
                                color: '#1976d2',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                padding: '6px 14px',
                                letterSpacing: '0.04em',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e3f2fd';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <Plus style={{ width: '15px', height: '15px' }} />
                            ДОБАВИТЬ ЗАДАЧУ
                        </button>
                    </div>

                    {/* ── Count chips ── */}
                    <div className="flex items-center gap-4" style={{ padding: '0 20px 12px' }}>
                        <div className="flex items-center gap-1.5">
                            <Layers style={{ width: '14px', height: '14px', color: '#1976d2' }} />
                            <span style={{ fontSize: '13px', color: '#757575' }}>Задач:</span>
                            <span
                                style={{
                                    backgroundColor: '#e3f2fd',
                                    color: '#1976d2',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '1px 8px',
                                    borderRadius: '4px',
                                }}
                            >
                                {displayedItems.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <AlignJustify
                                style={{ width: '14px', height: '14px', color: '#9e9e9e' }}
                            />
                            <span style={{ fontSize: '13px', color: '#757575' }}>Страница:</span>
                            <span
                                style={{
                                    backgroundColor: '#f5f5f5',
                                    color: '#616161',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '1px 8px',
                                    borderRadius: '4px',
                                }}
                            >
                                {currentPage}
                            </span>
                        </div>
                    </div>

                    {/* ── Table ── */}
                    {loading ? (
                        <div style={{ padding: '16px 20px' }}>
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-11 rounded mb-2" />
                            ))}
                        </div>
                    ) : displayedItems.length === 0 ? (
                        <EmptyState onCreateClick={handleCreate} />
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    minWidth: '820px',
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor: '#fafafa',
                                            borderTop: '1px solid #f0f0f0',
                                            borderBottom: '1px solid #eeeeee',
                                        }}
                                    >
                                        <th
                                            style={{ width: '32px', padding: '10px 8px 10px 16px' }}
                                        />
                                        <TH>НАЗВАНИЕ ЗАДАЧИ</TH>
                                        <TH>СТАТУС</TH>
                                        <TH>ПРИОРИТЕТ</TH>
                                        <TH highlight>ДЕДЛАЙН</TH>
                                        <TH>ОТВЕТСТВЕННЫЙ</TH>
                                        <TH>ДЕЙСТВИЯ</TH>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedItems.map((task, index) => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            index={index}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {pagination && pagination.pages > 1 && (
                        <div
                            className="flex items-center justify-center gap-2"
                            style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}
                        >
                            <PaginationBtn
                                label="‹ Назад"
                                disabled={!pagination.hasPrev}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            />
                            <span style={{ fontSize: '13px', color: '#757575', padding: '0 12px' }}>
                                Страница {pagination.page} из {pagination.pages}
                            </span>
                            <PaginationBtn
                                label="Вперёд ›"
                                disabled={!pagination.hasNext}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ══ Create / Edit Dialog ══ */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle style={{ fontSize: '16px', fontWeight: 600 }}>
                            {editingTask ? 'Редактировать задачу' : 'Создать новую задачу'}
                        </DialogTitle>
                    </DialogHeader>
                    <TaskForm
                        task={editingTask || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        isLoading={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            {/* ══ Delete Dialog ══ */}
            <DeleteTaskDialog
                task={deletingTask}
                open={!!deletingTask}
                onOpenChange={(open) => !open && setDeletingTask(null)}
                onConfirm={handleDeleteConfirm}
                isLoading={isSubmitting}
            />
        </div>
    );
}

/* ── Small helper components ── */

function StatChip({
    icon,
    iconBg,
    chipBg,
    chipBorder,
    label,
    value,
}: {
    icon: React.ReactNode;
    iconBg: string;
    chipBg: string;
    chipBorder: string;
    label: string;
    value: number;
}) {
    return (
        <div
            className="flex items-center gap-2 rounded"
            style={{
                backgroundColor: chipBg,
                border: `1px solid ${chipBorder}`,
                padding: '6px 12px',
            }}
        >
            <div className="rounded" style={{ backgroundColor: iconBg, padding: '4px' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '11px', color: '#757575', lineHeight: 1 }}>{label}</div>
                <div
                    style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

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

function TH({ children, highlight }: { children?: React.ReactNode; highlight?: boolean }) {
    return (
        <th
            style={{
                textAlign: 'left',
                padding: '10px 12px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                color: highlight ? '#c62828' : '#1976d2',
                backgroundColor: highlight ? '#fce4ec' : 'transparent',
            }}
        >
            {children}
        </th>
    );
}

function PaginationBtn({
    label,
    disabled,
    onClick,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                fontSize: '13px',
                padding: '5px 14px',
                borderRadius: '4px',
                border: `1px solid ${disabled ? '#e0e0e0' : '#1976d2'}`,
                color: disabled ? '#bdbdbd' : '#1976d2',
                backgroundColor: 'white',
                cursor: disabled ? 'default' : 'pointer',
            }}
        >
            {label}
        </button>
    );
}
