import { useEffect, useState, useCallback } from 'react';
import {
    ClipboardList,
    Plus,
    Search,
    X,
    RefreshCw,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Filter,
    CheckCircle2,
    Clock,
    FileX,
    FileText,
} from 'lucide-react';

import { WorkPerformedForm } from './WorkPerformedForm';
import { DeleteDialog } from './DeleteDialog';
import { STATUS_MAP, STATUSES, PROJECTS, BLOCKS } from './constants';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    createWorkPerformed,
    deleteWorkPerformed,
    fetchWorkPerformed,
    updateWorkPerformed,
    type WorkPerformed,
} from '../pto/workPerformed/workPerformedSlice';
import toast from 'react-hot-toast';
import { WorkPerformedRow } from './WorkPerformedRow';

export function WorkPerformedPage() {
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((s) => s.workPerformed);

    /* ui state */
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(0);
    const [projectFilter, setProjectFilter] = useState(0);
    const [blockFilter, setBlockFilter] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<WorkPerformed | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<WorkPerformed | null>(null);
    const [size, setSize] = useState(10);

    const load = useCallback(() => {
        dispatch(
            fetchWorkPerformed({
                page,
                size,
                // ...(statusFilter ? { status: statusFilter } : {}),
                // ...(projectFilter ? { project_id: projectFilter } : {}),
                // ...(blockFilter ? { block_id: blockFilter } : {}),
            }),
        );
    }, [dispatch, page, statusFilter, projectFilter, blockFilter]);

    useEffect(() => {
        load();
    }, [load]);

    /* local search filter */
    const displayed = search.trim()
        ? data.filter((it) => {
              const q = search.toLowerCase();
              return (
                  (it.code ?? '').toLowerCase().includes(q) ||
                  it.performed_person_name.toLowerCase().includes(q)
              );
          })
        : data;

    /* stats */
    const counts = {
        total: pagination?.total ?? 0,
        // draft: data.filter((i) => i.status === 1).length,
        // pending: data.filter((i) => i.status === 2).length,
        // approved: data.filter((i) => i.status === 3).length,
        // rejected: data.filter((i) => i.status === 4).length,
    };

    /* handlers */
    const handleCreate = async (data: Partial<WorkPerformed>) => {
        const res = await dispatch(createWorkPerformed(data));
        if (createWorkPerformed.fulfilled.match(res)) {
            toast.success('Акт успешно создан');
            setFormOpen(false);
        } else {
            toast.error('Ошибка при создании');
        }
    };

    const handleUpdate = async (data: Partial<WorkPerformed>) => {
        if (!editTarget) return;
        const res = await dispatch(updateWorkPerformed({ id: editTarget.id, data }));
        if (updateWorkPerformed.fulfilled.match(res)) {
            toast.success('Акт обновлён');
            setEditTarget(null);
        } else {
            toast.error('Ошибка при обновлении');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const res = await dispatch(deleteWorkPerformed(deleteTarget.id));
        if (deleteWorkPerformed.fulfilled.match(res)) {
            toast.success('Акт удалён');
            setDeleteTarget(null);
        } else {
            toast.error('Ошибка при удалении');
        }
    };

    const handleEdit = (item: WorkPerformed) => {
        setEditTarget(item);
        setFormOpen(true);
    };

    const resetFilters = () => {
        setStatusFilter(0);
        setProjectFilter(0);
        setBlockFilter(0);
        setSearch('');
        setPage(1);
    };

    const hasActiveFilters =
        statusFilter !== 0 || projectFilter !== 0 || blockFilter !== 0 || search.trim() !== '';

    return (
        <div className="min-h-screen p-5 bg-gray-50">
            <div className="mx-auto space-y-3 max-w-7xl">
                {/* ── Header ── */}
                <div className="flex justify-between data-center">
                    <div className="flex data-center gap-2.5">
                        <div className="flex justify-center bg-blue-600 shadow-sm data-center w-9 h-9 rounded-xl">
                            <ClipboardList className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-[15px] font-semibold text-gray-900 leading-tight">
                                Выполненные работы
                            </h1>
                            <p className="text-[11px] text-gray-400 leading-tight">
                                Управление актами выполненных работ
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditTarget(null);
                            setFormOpen(true);
                        }}
                        className="flex data-center gap-1.5 px-3.5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Создать акт
                    </button>
                </div>

                {/* ── Stat chips ── */}
                <div className="flex flex-wrap gap-2">
                    <StatChip
                        label="Всего"
                        value={counts.total}
                        bg="bg-blue-50"
                        border="border-blue-200"
                        text="text-blue-700"
                        icon={<FileText className="w-3.5 h-3.5" />}
                        active={statusFilter === 0}
                        onClick={() => {
                            setStatusFilter(0);
                            setPage(1);
                        }}
                    />
                    {/* <StatChip
                        label="Черновик"
                        value={counts.draft}
                        bg="bg-gray-50"
                        border="border-gray-200"
                        text="text-gray-600"
                        icon={<FileX className="w-3.5 h-3.5" />}
                        active={statusFilter === 1}
                        onClick={() => {
                            setStatusFilter(1);
                            setPage(1);
                        }}
                    />
                    <StatChip
                        label="На согласовании"
                        value={counts.pending}
                        bg="bg-amber-50"
                        border="border-amber-200"
                        text="text-amber-700"
                        icon={<Clock className="w-3.5 h-3.5" />}
                        active={statusFilter === 2}
                        onClick={() => {
                            setStatusFilter(2);
                            setPage(1);
                        }}
                    />
                    <StatChip
                        label="Утверждён"
                        value={counts.approved}
                        bg="bg-emerald-50"
                        border="border-emerald-200"
                        text="text-emerald-700"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        active={statusFilter === 3}
                        onClick={() => {
                            setStatusFilter(3);
                            setPage(1);
                        }}
                    />
                    <StatChip
                        label="Отклонён"
                        value={counts.rejected}
                        bg="bg-red-50"
                        border="border-red-200"
                        text="text-red-700"
                        icon={<X className="w-3.5 h-3.5" />}
                        active={statusFilter === 4}
                        onClick={() => {
                            setStatusFilter(4);
                            setPage(1);
                        }}
                    /> */}
                </div>

                {/* ── Main card ── */}
                <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                    {/* ── Toolbar ── */}
                    <div className="flex data-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 flex-wrap">
                        {/* search */}
                        <div className="relative flex-1 min-w-[160px] max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Поиск по коду или исполнителю..."
                                className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-blue-400 placeholder-gray-400"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2 hover:text-gray-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* filter toggle */}
                        <button
                            onClick={() => setShowFilters((p) => !p)}
                            className={`flex data-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition ${
                                showFilters || hasActiveFilters
                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Фильтры
                            {hasActiveFilters && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}
                        </button>

                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="flex data-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 transition px-2 py-1.5"
                            >
                                <X className="w-3 h-3" />
                                Сбросить
                            </button>
                        )}

                        <div className="flex-1" />

                        <button
                            onClick={load}
                            className="flex data-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-100 transition"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Обновить
                        </button>
                    </div>

                    {/* filter panel */}
                    {showFilters && (
                        <div className="flex data-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/30 flex-wrap">
                            <div className="flex data-center gap-1.5">
                                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                                    Статус:
                                </span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex data-center gap-1.5">
                                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                                    Проект:
                                </span>
                                <select
                                    value={projectFilter}
                                    onChange={(e) => {
                                        setProjectFilter(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
                                >
                                    {PROJECTS.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex data-center gap-1.5">
                                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                                    Блок:
                                </span>
                                <select
                                    value={blockFilter}
                                    onChange={(e) => {
                                        setBlockFilter(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
                                >
                                    {BLOCKS.map((b) => (
                                        <option key={b.value} value={b.value}>
                                            {b.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── Table ── */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[960px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="w-6 py-2 pl-4 pr-2" />
                                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700 w-8">
                                        #
                                    </th>
                                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700">
                                        Код / ID
                                    </th>
                                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700">
                                        Проект / Блок
                                    </th>
                                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700">
                                        Исполнитель
                                    </th>
                                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700">
                                        Статус
                                    </th>
                                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700 w-24">
                                        Подписи
                                    </th>
                                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-blue-700 w-28">
                                        Позиции / Сумма
                                    </th>
                                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700 w-28">
                                        Дата
                                    </th>
                                    <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-blue-700 w-20">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-14">
                                            <div className="flex flex-col gap-2 text-gray-400 data-center">
                                                <Loader2 className="text-blue-400 w-7 h-7 animate-spin" />
                                                <span className="text-xs">Загрузка данных...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : displayed?.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-14">
                                            <div className="flex flex-col gap-2 text-gray-400 data-center">
                                                <ClipboardList className="w-10 h-10 text-gray-200" />
                                                <span className="text-sm">Записи не найдены</span>
                                                {hasActiveFilters && (
                                                    <button
                                                        onClick={resetFilters}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Сбросить фильтры
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    displayed?.map((item, i) => (
                                        <WorkPerformedRow
                                            key={item.id}
                                            item={item}
                                            index={(page - 1) * size + i}
                                            onEdit={handleEdit}
                                            onDelete={setDeleteTarget}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Footer / Pagination ── */}
                    {!loading && (
                        <div className="flex justify-between px-4 py-2 border-t border-gray-100 data-center bg-gray-50/40">
                            <span className="text-[11px] text-gray-400">
                                Показано <b className="text-gray-600">{displayed?.length}</b> из{' '}
                                <b className="text-gray-600">{pagination?.total ?? 0}</b>
                            </span>
                            {pagination && pagination.pages > 1 && (
                                <div className="flex gap-1 data-center">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="flex justify-center text-gray-500 transition border border-gray-200 rounded w-7 h-7 data-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                                        (p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-7 h-7 flex data-center justify-center rounded border text-[11px] font-medium transition ${
                                                    p === page
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ),
                                    )}
                                    <button
                                        disabled={page >= pagination.pages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="flex justify-center text-gray-500 transition border border-gray-200 rounded w-7 h-7 data-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-default"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            {formOpen && (
                <WorkPerformedForm
                    initial={editTarget}
                    onSave={editTarget ? handleUpdate : handleCreate}
                    onClose={() => {
                        setFormOpen(false);
                        setEditTarget(null);
                    }}
                />
            )}
            {deleteTarget && (
                <DeleteDialog
                    item={deleteTarget}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}

/* ── Stat chip ── */
function StatChip({
    label,
    value,
    bg,
    border,
    text,
    icon,
    active,
    onClick,
}: {
    label: string;
    value: number;
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex data-center gap-2 px-3 py-1.5 rounded-lg border transition cursor-pointer ${bg} ${border} ${
                active ? 'ring-2 ring-offset-1 ring-blue-400' : 'hover:opacity-80'
            }`}
        >
            <span className={text}>{icon}</span>
            <div className="text-left">
                <div className={`text-[10px] leading-none ${text} opacity-70`}>{label}</div>
                <div className={`text-sm font-bold leading-tight ${text}`}>{value}</div>
            </div>
        </button>
    );
}
