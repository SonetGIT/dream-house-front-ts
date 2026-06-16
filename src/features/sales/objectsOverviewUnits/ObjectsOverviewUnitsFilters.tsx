import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Check, Package, Car, Store, Home } from 'lucide-react';
import type { SalesOverviewProject } from '../slices/salesObjOverviewSlice';
import type { SalesUnitStatus } from '../slices/salesDictionariesSlice';
import type { EnumItem } from '@/features/reference/referenceService';
import { getManagerLabel } from '../leads/LeadCard';

export interface UnitFilters {
    sort_by: string;
    sort_desc: boolean;

    project_ids: number[];

    floor_exact: string;
    floor_from: string;
    floor_to: string;

    status_code: string[];
    lot_types: string[];

    rooms: number;
    rooms_from: string;
    rooms_to: string;

    area_from: string;
    area_to: string;

    price_from: string;
    price_to: string;

    price_m2_from: string;
    price_m2_to: string;

    deal_manager_user_id: number;

    client_search: string;
    client_pin: string;
    client_passport: string;
}

export const DEFAULT_UNIT_FILTERS: UnitFilters = {
    sort_by: 'id',
    sort_desc: true,
    project_ids: [],
    floor_exact: '',
    floor_from: '',
    floor_to: '',
    status_code: [],
    lot_types: [],
    rooms: 0,
    rooms_from: '',
    rooms_to: '',
    area_from: '',
    area_to: '',
    price_from: '',
    price_to: '',
    price_m2_from: '',
    price_m2_to: '',
    deal_manager_user_id: 0,
    client_search: '',
    client_pin: '',
    client_passport: '',
};

const SORT_OPTIONS = [
    { value: 'created_desc', label: 'Новые' },
    { value: 'price_asc', label: 'Цена ↑' },
    { value: 'price_desc', label: 'Цена ↓' },
    { value: 'area_asc', label: 'Площадь ↑' },
    { value: 'area_desc', label: 'Площадь ↓' },
    { value: 'floor_asc', label: 'Этаж ↑' },
    { value: 'floor_desc', label: 'Этаж ↓' },
];

export const LOT_TYPE_OPTIONS = [
    {
        value: 'apartment',
        label: 'Кв',
        icon: Home,
        className: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
        value: 'commercial',
        label: 'Комм',
        icon: Store,
        className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
        value: 'parking',
        label: 'Парк',
        icon: Car,
        className: 'bg-slate-50 text-slate-600 border-slate-200',
    },
    {
        value: 'storage',
        label: 'Клад',
        icon: Package,
        className: 'bg-orange-50 text-orange-600 border-orange-200',
    },
];

const ROOMS_OPTS = [
    { value: 0, label: 'Все комн.' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4+' },
];

interface Props {
    filters: UnitFilters;
    projects: SalesOverviewProject[];
    unitStatuses: SalesUnitStatus[];
    onFiltersChange: (f: UnitFilters) => void;
    onApply: () => void;
    onReset: () => void;
    managers: EnumItem[];
}

export const inputCls =
    'w-full px-2.5 py-1.5 text-xs border border-blue-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-800 placeholder-gray-400';
export const labelCls =
    'text-[10px] text-left font-semibold text-blue-500 uppercase tracking-wide mb-1.5 block';

export default function ObjectsOverviewUnitsFilters({
    filters,
    projects,
    unitStatuses,
    onFiltersChange,
    onApply,
    onReset,
    managers = [],
}: Props) {
    const [projectsOpen, setProjectsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Закрытие dropdown при клике вне
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProjectsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function set<K extends keyof UnitFilters>(key: K, value: UnitFilters[K]) {
        onFiltersChange({ ...filters, [key]: value });
    }

    function toggleProjectId(id: number) {
        const next = filters.project_ids.includes(id)
            ? filters.project_ids.filter((x) => x !== id)
            : [...filters.project_ids, id];
        onFiltersChange({ ...filters, project_ids: next });
    }

    function toggleStatusCode(val: string) {
        const next = filters.status_code.includes(val)
            ? filters.status_code.filter((x) => x !== val)
            : [...filters.status_code, val];
        onFiltersChange({ ...filters, status_code: next });
    }

    function toggleLotType(val: string) {
        const next = filters.lot_types.includes(val)
            ? filters.lot_types.filter((x) => x !== val)
            : [...filters.lot_types, val];
        onFiltersChange({ ...filters, lot_types: next });
    }

    const hasFilters =
        filters.project_ids.length > 0 ||
        filters.status_code.length > 0 ||
        filters.lot_types.length > 0 ||
        filters.rooms > 0 ||
        filters.floor_exact ||
        filters.floor_from ||
        filters.floor_to ||
        filters.rooms_from ||
        filters.rooms_to ||
        filters.area_from ||
        filters.area_to ||
        filters.price_from ||
        filters.price_to ||
        filters.price_m2_from ||
        filters.price_m2_to ||
        filters.deal_manager_user_id > 0 ||
        filters.client_search ||
        filters.client_pin ||
        filters.client_passport;

    /*******************************************************************************************************************************/
    return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm mb-7">
            {/* Filters Grid */}
            <div className="grid grid-cols-4 gap-3">
                {/* Сортировка */}
                <div>
                    <label className={labelCls}>Сортировка</label>

                    <select
                        value={filters.sort_by}
                        onChange={(e) =>
                            onFiltersChange({
                                ...filters,
                                sort_by: e.target.value,
                            })
                        }
                        className={inputCls}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Объекты (Dropdown) */}
                <div className="relative" ref={dropdownRef}>
                    <label className={labelCls}>
                        Объекты
                        {filters.project_ids.length > 0 && (
                            <span className="ml-1 text-sky-600">
                                ({filters.project_ids.length})
                            </span>
                        )}
                    </label>
                    <button
                        type="button"
                        onClick={() => setProjectsOpen(!projectsOpen)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs border rounded-md transition-colors ${
                            projectsOpen
                                ? 'border-sky-500 bg-sky-50'
                                : 'border-gray-200 bg-white hover:border-sky-300'
                        }`}
                    >
                        <span className="text-gray-700 truncate">
                            {filters.project_ids.length > 0
                                ? `Выбрано: ${filters.project_ids.length}`
                                : 'Все объекты'}
                        </span>
                        {projectsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {/* Dropdown */}
                    {projectsOpen && (
                        <div className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-60">
                            <div className="p-2 space-y-1">
                                {projects.map((p) => {
                                    const checked = filters.project_ids.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => toggleProjectId(p.id)}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-left text-xs"
                                        >
                                            <div
                                                className={`w-3.5 h-3.5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                                                    checked
                                                        ? 'bg-sky-500 border-sky-500'
                                                        : 'border-gray-300'
                                                }`}
                                            >
                                                {checked && (
                                                    <Check size={8} className="text-white" />
                                                )}
                                            </div>
                                            <span
                                                className={`truncate ${
                                                    checked
                                                        ? 'text-sky-700 font-medium'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                {p.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Комнат */}
                <div>
                    <label className={labelCls}>Комнат</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        <select
                            value={filters.rooms}
                            onChange={(e) => set('rooms', +e.target.value)}
                            className={inputCls}
                        >
                            {ROOMS_OPTS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        <input
                            value={filters.rooms_from}
                            onChange={(e) => set('rooms_from', e.target.value)}
                            placeholder="От"
                            className={inputCls}
                        />
                        <input
                            value={filters.rooms_to}
                            onChange={(e) => set('rooms_to', e.target.value)}
                            placeholder="До"
                            className={inputCls}
                        />
                    </div>
                </div>

                {/* Этаж */}
                <div>
                    <label className={labelCls}>Этаж</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        <input
                            value={filters.floor_exact}
                            onChange={(e) => set('floor_exact', e.target.value)}
                            placeholder="Этаж"
                            className={inputCls}
                        />
                        <input
                            value={filters.floor_from}
                            onChange={(e) => set('floor_from', e.target.value)}
                            placeholder="От"
                            className={inputCls}
                        />
                        <input
                            value={filters.floor_to}
                            onChange={(e) => set('floor_to', e.target.value)}
                            placeholder="До"
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>
            {/* Площадь / Цена () / Цена за м² */}
            <div className="grid grid-cols-3 gap-3 mt-4">
                {/* Площадь */}
                <div>
                    <label className={labelCls}>Площадь (м²)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                        <input
                            value={filters.area_from}
                            onChange={(e) => set('area_from', e.target.value)}
                            placeholder="От"
                            className={inputCls}
                        />
                        <input
                            value={filters.area_to}
                            onChange={(e) => set('area_to', e.target.value)}
                            placeholder="До"
                            className={inputCls}
                        />
                    </div>
                </div>

                {/* Цена */}
                <div>
                    <label className={labelCls}>Цена ()</label>
                    <div className="grid grid-cols-2 gap-1.5">
                        <input
                            value={filters.price_from}
                            onChange={(e) => set('price_from', e.target.value)}
                            placeholder="От"
                            className={inputCls}
                        />
                        <input
                            value={filters.price_to}
                            onChange={(e) => set('price_to', e.target.value)}
                            placeholder="До"
                            className={inputCls}
                        />
                    </div>
                </div>

                {/* Цена за м² */}
                <div>
                    <label className={labelCls}>Цена за м²</label>
                    <div className="grid grid-cols-2 gap-1.5">
                        <input
                            value={filters.price_m2_from}
                            onChange={(e) => set('price_m2_from', e.target.value)}
                            placeholder="От"
                            className={inputCls}
                        />
                        <input
                            value={filters.price_m2_to}
                            onChange={(e) => set('price_m2_to', e.target.value)}
                            placeholder="До"
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>

            {/* Типы лотов /статус / клиент */}
            <div className="flex items-start gap-3 mt-4">
                {/* Типы лотов */}
                <div className="flex-shrink-0">
                    <label className={labelCls}>Типы</label>
                    <div className="flex flex-wrap gap-1">
                        {LOT_TYPE_OPTIONS.map((lt) => {
                            const active = filters.lot_types.includes(lt.value);
                            const Icon = lt.icon;
                            return (
                                <button
                                    key={lt.value}
                                    type="button"
                                    onClick={() => toggleLotType(lt.value)}
                                    className={`
                                        inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 
                                        text-xs font-medium transition-colors
                                        ${
                                            active
                                                ? 'bg-sky-500 border-sky-500 text-white'
                                                : `bg-white border-gray-200 text-gray-600 hover:border-sky-300 ${lt.className}`
                                        }
                                    `}
                                >
                                    <Icon className="w-3 h-3" />
                                    {lt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Статусы лота */}
                <div className="flex-shrink-0">
                    <label className={labelCls}>Статусы</label>
                    <div className="flex flex-wrap gap-1">
                        {unitStatuses.map((st) => {
                            const active = filters.status_code.includes(st.code);
                            return (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => toggleStatusCode(st.code)}
                                    className="flex items-center gap-1 px-2.5 py-1.5  text-xs font-medium transition-colors border rounded-md"
                                    style={
                                        active
                                            ? {
                                                  backgroundColor: `${st.color}20`,
                                                  borderColor: st.color,
                                                  color: st.color,
                                              }
                                            : {
                                                  backgroundColor: `${st.color}10`,
                                                  borderColor: `${st.color}30`,
                                                  color: `${st.color}90`,
                                              }
                                    }
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                            backgroundColor: active ? st.color : `${st.color}50`,
                                        }}
                                    />
                                    {st.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Клиент */}
                <div className="flex-1 min-w-0">
                    <label className={labelCls}>Клиент</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        <input
                            value={filters.client_search}
                            onChange={(e) => set('client_search', e.target.value)}
                            placeholder="ФИО / телефон"
                            className={inputCls}
                        />
                        <input
                            value={filters.client_pin}
                            onChange={(e) => set('client_pin', e.target.value)}
                            placeholder="ПИН"
                            className={inputCls}
                        />
                        <input
                            value={filters.client_passport}
                            onChange={(e) => set('client_passport', e.target.value)}
                            placeholder="Паспорт"
                            className={inputCls}
                        />
                    </div>
                </div>
                {/* Менеджер */}
                <div className="flex-shrink-0 w-56 ">
                    <label className={labelCls}>Менеджер</label>
                    <select
                        value={filters.deal_manager_user_id}
                        onChange={(e) => set('deal_manager_user_id', +e.target.value)}
                        className={inputCls}
                    >
                        <option value="">Не выбран</option>
                        {managers?.map((manager) => (
                            <option key={String(manager.id)} value={String(manager.id)}>
                                {getManagerLabel(manager)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-gray-200">
                {hasFilters && (
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-rose-500 border border-rose-300 rounded-md hover:bg-rose-50 transition-colors min-w-[100px]"
                    >
                        <RotateCcw size={12} />
                        Сбросить
                    </button>
                )}
                <button
                    onClick={onApply}
                    className="px-3 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors min-w-[100px]"
                >
                    Применить
                </button>
            </div>
        </div>
    );
}
