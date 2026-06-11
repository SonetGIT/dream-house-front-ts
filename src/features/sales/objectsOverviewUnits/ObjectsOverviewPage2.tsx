import { useEffect, useState, useCallback, useRef } from 'react';
import {
    Search,
    SlidersHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Home,
    Store,
    Car,
    Package,
    ArrowUpDown,
    Eye,
    EyeOff,
    Plus,
    Pencil,
    X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchSalesUnits, updateSalesUnit } from '@/features/sales/salesUnitsSlice';
import type { SalesUnit, SalesUnitsSearchPayload } from '@/features/sales/salesUnitsSlice';
import { fetchSalesUnitStatuses } from '@/features/sales/salesDictionariesSlice';
import type { SalesUnitStatus } from '@/features/sales/salesDictionariesSlice';
import { fetchSalesOverview } from '@/features/sales/salesObjOverviewSlice';
import { UnitsFilterPanel, DEFAULT_UNIT_FILTERS } from './UnitsFilterPanel';
import type { UnitFilters } from './UnitsFilterPanel';
import { UnitFormModal } from './UnitFormModal';
import { toast } from 'sonner';

// ---- Helpers ----
function fmtPrice(s: string | null) {
    if (!s) return '—';
    const n = parseFloat(s);
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} млрд`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} млн`;
    return n.toLocaleString('ru-RU');
}
function fmtArea(s: string | null) {
    return s ? `${parseFloat(s).toFixed(1)}` : '—';
}

// ---- Column config ----
interface ColDef {
    key: string;
    label: string;
    visible: boolean;
    sortable?: boolean;
}
const COLS_INIT: ColDef[] = [
    { key: 'unit_number', label: 'Лот', visible: true, sortable: true },
    { key: 'lot_type', label: 'Тип', visible: true, sortable: false },
    { key: 'project_block', label: 'Объект/Блок', visible: true, sortable: false },
    { key: 'floor', label: 'Этаж', visible: true, sortable: true },
    { key: 'rooms', label: 'К-т', visible: true, sortable: true },
    { key: 'area_total', label: 'S общ (м²)', visible: true, sortable: true },
    { key: 'area_living', label: 'S жил', visible: false, sortable: false },
    { key: 'area_kitchen', label: 'S кух', visible: false, sortable: false },
    { key: 'area_balcony', label: 'S балк', visible: false, sortable: false },
    { key: 'price_total', label: 'Цена', visible: true, sortable: true },
    { key: 'price_per_m2', label: '₸/м²', visible: true, sortable: true },
    { key: 'finish_type', label: 'Отделка', visible: true, sortable: false },
    { key: 'ceiling_height', label: 'Потолок', visible: false, sortable: false },
    { key: 'orientation', label: 'Ориентация', visible: false, sortable: false },
    { key: 'status', label: 'Статус', visible: true, sortable: false },
    { key: 'is_active', label: 'Продажа', visible: true, sortable: false },
    { key: 'plan_code', label: 'Пл. код', visible: false, sortable: false },
];

const LOT_BADGE: Record<string, string> = {
    apartment: 'bg-sky-50 text-sky-700 border-sky-200',
    commercial: 'bg-purple-50 text-purple-700 border-purple-200',
    parking: 'bg-slate-50 text-slate-600 border-slate-200',
    storage: 'bg-orange-50 text-orange-600 border-orange-200',
};
const LOT_LABEL: Record<string, string> = {
    apartment: 'Кв',
    commercial: 'Ком',
    parking: 'Парк',
    storage: 'Клад',
};
const TYPE_ICON: Record<string, React.ElementType> = {
    apartment: Home,
    commercial: Store,
    parking: Car,
    storage: Package,
};

// ---- Status Picker ----
function StatusPicker({
    unit,
    statuses,
    onPick,
    onClose,
}: {
    unit: SalesUnit;
    statuses: SalesUnitStatus[];
    onPick: (statusId: number) => void;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!ref.current?.contains(e.target as Node)) onClose();
        }
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute z-30 right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 overflow-hidden"
        >
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Сменить статус
            </div>
            {statuses.map((st) => (
                <button
                    key={st.id}
                    onClick={() => onPick(st.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${unit.status_id === st.id ? 'font-semibold' : 'text-gray-700'}`}
                >
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: st.color }}
                    />
                    {st.name}
                    {unit.status_id === st.id && (
                        <span className="ml-auto text-xs text-gray-400">✓</span>
                    )}
                </button>
            ))}
        </div>
    );
}

// ---- Build search payload ----
function buildPayload(filters: UnitFilters, search: string, page: number): SalesUnitsSearchPayload {
    const payload: SalesUnitsSearchPayload = {
        page,
        size: 25,
        sort_by: filters.sort_by,
        sort_desc: filters.sort_desc,
    };
    if (search.trim()) payload.search = search.trim();
    if (filters.project_ids.length > 0) payload.project_ids = filters.project_ids;
    if (filters.status_ids.length > 0) payload.status_ids = filters.status_ids;
    if (filters.lot_types.length > 0) payload.lot_types = filters.lot_types;
    if (filters.rooms > 0) payload.rooms = filters.rooms;
    if (filters.manager_user_id > 0) payload.manager_user_id = filters.manager_user_id;

    if (filters.floor_exact) {
        const n = parseInt(filters.floor_exact);
        if (!isNaN(n)) {
            payload.floor_from = n;
            payload.floor_to = n;
        }
    } else {
        if (filters.floor_from) {
            const n = parseInt(filters.floor_from);
            if (!isNaN(n)) payload.floor_from = n;
        }
        if (filters.floor_to) {
            const n = parseInt(filters.floor_to);
            if (!isNaN(n)) payload.floor_to = n;
        }
    }
    if (filters.rooms_from) {
        const n = parseInt(filters.rooms_from);
        if (!isNaN(n)) payload.rooms_from = n;
    }
    if (filters.rooms_to) {
        const n = parseInt(filters.rooms_to);
        if (!isNaN(n)) payload.rooms_to = n;
    }
    if (filters.area_from) {
        const n = parseFloat(filters.area_from);
        if (!isNaN(n)) payload.area_from = n;
    }
    if (filters.area_to) {
        const n = parseFloat(filters.area_to);
        if (!isNaN(n)) payload.area_to = n;
    }
    if (filters.price_from) {
        const n = parseFloat(filters.price_from);
        if (!isNaN(n)) payload.price_from = n;
    }
    if (filters.price_to) {
        const n = parseFloat(filters.price_to);
        if (!isNaN(n)) payload.price_to = n;
    }
    if (filters.price_m2_from) {
        const n = parseFloat(filters.price_m2_from);
        if (!isNaN(n)) payload.price_m2_from = n;
    }
    if (filters.price_m2_to) {
        const n = parseFloat(filters.price_m2_to);
        if (!isNaN(n)) payload.price_m2_to = n;
    }
    return payload;
}

// ---- Main component ----
export function UnitsPage() {
    const dispatch = useAppDispatch();
    const { items: units, pagination, loading } = useAppSelector((s) => s.salesUnits);
    const { projects, blocks } = useAppSelector((s) => s.salesObjOverview);
    const { unitStatuses } = useAppSelector((s) => s.salesDictionaries);

    const [filters, setFilters] = useState<UnitFilters>(DEFAULT_UNIT_FILTERS);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(true);
    const [columns, setColumns] = useState<ColDef[]>(COLS_INIT);
    const [showColMenu, setShowColMenu] = useState(false);
    const [modal, setModal] = useState<{ mode: 'create' | 'edit'; unit?: SalesUnit } | null>(null);
    const [statusPickerUnit, setStatusPickerUnit] = useState<SalesUnit | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

    const load = useCallback(
        (f: UnitFilters, s: string, p: number) => {
            dispatch(fetchSalesUnits(buildPayload(f, s, p)));
        },
        [dispatch],
    );

    useEffect(() => {
        dispatch(fetchSalesOverview({}));
        dispatch(fetchSalesUnitStatuses());
        load(DEFAULT_UNIT_FILTERS, '', 1);
    }, []);

    function handleApply() {
        setPage(1);
        load(filters, search, 1);
    }

    function handleReset() {
        setFilters(DEFAULT_UNIT_FILTERS);
        setSearch('');
        setPage(1);
        load(DEFAULT_UNIT_FILTERS, '', 1);
    }

    function handlePageChange(p: number) {
        setPage(p);
        load(filters, search, p);
    }

    function handleSort(field: string) {
        const isActive = filters.sort_by === field;
        const next: UnitFilters = {
            ...filters,
            sort_by: field,
            sort_desc: isActive ? !filters.sort_desc : false,
        };
        setFilters(next);
        setPage(1);
        load(next, search, 1);
    }

    async function handleStatusPick(unit: SalesUnit, statusId: number) {
        setStatusPickerUnit(null);
        if (unit.status_id === statusId) return;
        setUpdatingStatus(unit.id);
        try {
            await dispatch(
                updateSalesUnit({ id: unit.id, payload: { status_id: statusId } }),
            ).unwrap();
            const st = unitStatuses.find((s) => s.id === statusId);
            toast.success(`Статус лота ${unit.unit_number} изменён на «${st?.name}»`);
        } catch (e) {
            toast.error(`Ошибка: ${e}`);
        } finally {
            setUpdatingStatus(null);
        }
    }

    const visibleCols = columns.filter((c) => c.visible);
    const totalPages = pagination?.pages ?? 1;
    const totalCount = pagination?.total ?? 0;

    const pageButtons: number[] = [];
    const btnStart = Math.max(1, Math.min(page - 2, totalPages - 5));
    for (let i = btnStart; i <= Math.min(btnStart + 5, totalPages); i++) pageButtons.push(i);

    function renderCell(unit: SalesUnit, col: ColDef) {
        const Icon = TYPE_ICON[unit.lot_type];
        switch (col.key) {
            case 'unit_number':
                return (
                    <div>
                        <div className="text-sm font-semibold text-gray-900">
                            {unit.unit_number}
                        </div>
                        {unit.plan_code && (
                            <div className="text-xs text-gray-400 font-mono">{unit.plan_code}</div>
                        )}
                    </div>
                );
            case 'lot_type':
                return (
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium ${LOT_BADGE[unit.lot_type] ?? ''}`}
                    >
                        {Icon && <Icon size={10} />}
                        {LOT_LABEL[unit.lot_type] ?? unit.lot_type}
                    </span>
                );
            case 'project_block':
                return (
                    <div>
                        <div className="text-sm text-gray-800 leading-none">
                            {projects.find((p) => p.id === unit.project_id)?.name ??
                                `Объект ${unit.project_id}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                            {blocks.find((b) => b.id === unit.block_id)?.name ??
                                `Блок ${unit.block_id}`}
                        </div>
                    </div>
                );
            case 'floor':
                return (
                    <span className="text-sm text-gray-700">
                        {unit.floor?.floor_number ?? unit.floor_id}
                    </span>
                );
            case 'rooms':
                return <span className="text-sm text-gray-700">{unit.rooms ?? '—'}</span>;
            case 'area_total':
                return (
                    <span className="text-sm font-medium text-gray-800">
                        {fmtArea(unit.area_total)} м²
                    </span>
                );
            case 'area_living':
                return <span className="text-sm text-gray-600">{fmtArea(unit.area_living)}</span>;
            case 'area_kitchen':
                return <span className="text-sm text-gray-600">{fmtArea(unit.area_kitchen)}</span>;
            case 'area_balcony':
                return <span className="text-sm text-gray-600">{fmtArea(unit.area_balcony)}</span>;
            case 'price_total':
                return (
                    <div>
                        <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {fmtPrice(unit.price_total)}
                        </div>
                        <div className="text-xs text-gray-400">
                            {unit.currency_info?.code ?? 'KZT'}
                        </div>
                    </div>
                );
            case 'price_per_m2':
                return <span className="text-sm text-gray-700">{fmtPrice(unit.price_per_m2)}</span>;
            case 'finish_type':
                return unit.finish_type ? (
                    <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {unit.finish_type}
                    </span>
                ) : (
                    <span className="text-gray-300 text-xs">—</span>
                );
            case 'ceiling_height':
                return (
                    <span className="text-sm text-gray-600">
                        {unit.ceiling_height ? `${unit.ceiling_height} м` : '—'}
                    </span>
                );
            case 'orientation':
                return <span className="text-xs text-gray-600">{unit.orientation ?? '—'}</span>;
            case 'status':
                return (
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setStatusPickerUnit(statusPickerUnit?.id === unit.id ? null : unit);
                            }}
                            disabled={updatingStatus === unit.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${updatingStatus === unit.id ? 'opacity-50 cursor-wait' : ''}`}
                            style={
                                unit.status
                                    ? {
                                          backgroundColor: `${unit.status.color}18`,
                                          borderColor: `${unit.status.color}50`,
                                          color: unit.status.color,
                                      }
                                    : {
                                          backgroundColor: '#f3f4f6',
                                          borderColor: '#e5e7eb',
                                          color: '#6b7280',
                                      }
                            }
                        >
                            {updatingStatus === unit.id ? (
                                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: unit.status?.color ?? '#9ca3af' }}
                                />
                            )}
                            {unit.status?.name ?? 'Не задан'}
                            <ChevronDown size={10} className="opacity-60" />
                        </button>
                        {statusPickerUnit?.id === unit.id && (
                            <StatusPicker
                                unit={unit}
                                statuses={unitStatuses}
                                onPick={(statusId) => handleStatusPick(unit, statusId)}
                                onClose={() => setStatusPickerUnit(null)}
                            />
                        )}
                    </div>
                );
            case 'is_active':
                return (
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${unit.is_active_for_sale ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
                    >
                        {unit.is_active_for_sale ? 'Да' : 'Нет'}
                    </span>
                );
            case 'plan_code':
                return (
                    <span className="text-xs text-gray-500 font-mono">{unit.plan_code ?? '—'}</span>
                );
            default:
                return null;
        }
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
                <div className="flex-shrink-0">
                    <h1 className="text-base font-semibold text-gray-900">Лоты</h1>
                    {totalCount > 0 && (
                        <p className="text-xs text-gray-400">{totalCount} объектов</p>
                    )}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                        placeholder="Поиск по лоту, плану, коду..."
                        className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    {search && (
                        <button
                            onClick={() => {
                                setSearch('');
                                load(filters, '', page);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={() => setShowFilters((f) => !f)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${showFilters ? 'border-sky-400 text-sky-600 bg-sky-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                        <SlidersHorizontal size={14} />
                        Фильтры
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowColMenu((m) => !m)}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50"
                        >
                            <Eye size={14} />
                            Столбцы
                        </button>
                        {showColMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowColMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-2 max-h-72 overflow-y-auto">
                                    {columns.map((col) => (
                                        <button
                                            key={col.key}
                                            onClick={() =>
                                                setColumns((cs) =>
                                                    cs.map((c) =>
                                                        c.key === col.key
                                                            ? { ...c, visible: !c.visible }
                                                            : c,
                                                    ),
                                                )
                                            }
                                            className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                                        >
                                            {col.label}
                                            {col.visible ? (
                                                <Eye size={13} className="text-sky-500" />
                                            ) : (
                                                <EyeOff size={13} className="text-gray-300" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setModal({ mode: 'create' })}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                    >
                        <Plus size={14} />
                        Создать лот
                    </button>
                </div>
            </header>

            {/* MAIN AREA */}
            <div className="flex-1 flex overflow-hidden">
                {/* FILTER SIDEBAR */}
                {showFilters && (
                    <UnitsFilterPanel
                        filters={filters}
                        projects={projects}
                        unitStatuses={unitStatuses}
                        onFiltersChange={setFilters}
                        onApply={handleApply}
                        onReset={handleReset}
                    />
                )}

                {/* TABLE AREA */}
                <div className="flex-1 flex flex-col overflow-hidden p-4">
                    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-sm min-w-max">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-sky-50 border-b border-sky-100">
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-sky-600 uppercase tracking-wide w-8">
                                            #
                                        </th>
                                        {visibleCols.map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() =>
                                                    col.sortable &&
                                                    handleSort(
                                                        col.key === 'floor'
                                                            ? 'floor_number'
                                                            : col.key,
                                                    )
                                                }
                                                className={`px-3 py-3 text-left text-xs font-semibold text-sky-600 uppercase tracking-wide whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:bg-sky-100 select-none' : ''}`}
                                            >
                                                {col.label}
                                                {col.sortable &&
                                                    (() => {
                                                        const sf =
                                                            col.key === 'floor'
                                                                ? 'floor_number'
                                                                : col.key;
                                                        const active = filters.sort_by === sf;
                                                        if (!active)
                                                            return (
                                                                <ArrowUpDown
                                                                    size={10}
                                                                    className="ml-1 inline text-gray-300"
                                                                />
                                                            );
                                                        return (
                                                            <ChevronDown
                                                                size={10}
                                                                className={`ml-1 inline text-sky-500 transition-transform ${filters.sort_desc ? '' : 'rotate-180'}`}
                                                            />
                                                        );
                                                    })()}
                                            </th>
                                        ))}
                                        <th className="px-3 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wide w-14 text-center">
                                            Ред.
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={visibleCols.length + 2}
                                                className="py-20 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-sm">Загрузка...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : units.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={visibleCols.length + 2}
                                                className="py-20 text-center text-gray-400 text-sm"
                                            >
                                                Лоты не найдены. Измените параметры фильтра.
                                            </td>
                                        </tr>
                                    ) : (
                                        units.map((unit, idx) => (
                                            <tr
                                                key={unit.id}
                                                className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                                            >
                                                <td className="px-3 py-3 text-xs text-gray-400 tabular-nums">
                                                    {(page - 1) * 25 + idx + 1}
                                                </td>
                                                {visibleCols.map((col) => (
                                                    <td key={col.key} className="px-3 py-3">
                                                        {renderCell(unit, col)}
                                                    </td>
                                                ))}
                                                <td className="px-3 py-3 text-center">
                                                    <button
                                                        onClick={() =>
                                                            setModal({ mode: 'edit', unit })
                                                        }
                                                        className="p-1.5 hover:bg-amber-50 hover:text-amber-600 text-gray-300 rounded-lg transition-colors"
                                                        title="Редактировать лот"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {pagination && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                    {Math.min((page - 1) * 25 + 1, pagination.total)}–
                                    {Math.min(page * 25, pagination.total)} из {pagination.total}{' '}
                                    лотов
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                                        disabled={page <= 1}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-600"
                                    >
                                        <ChevronLeft size={15} />
                                    </button>
                                    {page > 3 && totalPages > 7 && (
                                        <>
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                className="w-7 h-7 text-xs rounded-lg hover:bg-gray-100 text-gray-600"
                                            >
                                                1
                                            </button>
                                            <span className="text-gray-300 text-xs px-1">…</span>
                                        </>
                                    )}
                                    {pageButtons.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === page ? 'bg-sky-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    {page < totalPages - 2 && totalPages > 7 && (
                                        <>
                                            <span className="text-gray-300 text-xs px-1">…</span>
                                            <button
                                                onClick={() => handlePageChange(totalPages)}
                                                className="w-7 h-7 text-xs rounded-lg hover:bg-gray-100 text-gray-600"
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() =>
                                            handlePageChange(Math.min(totalPages, page + 1))
                                        }
                                        disabled={page >= totalPages}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-600"
                                    >
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                                <span className="text-xs text-gray-400">
                                    Стр. {page} из {totalPages}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {modal && (
                <UnitFormModal mode={modal.mode} unit={modal.unit} onClose={() => setModal(null)} />
            )}
        </div>
    );
}
