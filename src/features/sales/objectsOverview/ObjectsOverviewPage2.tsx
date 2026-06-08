import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Building2,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    Filter,
    Home,
    Layers3,
    MapPin,
    RefreshCw,
    Search,
    Users,
    Wallet,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '@/features/reference/useReference';
import {
    fetchSalesUnitStatuses,
    type SalesUnitStatus,
} from '@/features/sales/slices/salesDictionariesSlice';
import { formatNumber } from '@/utils/formatNumber';
import {
    fetchSalesOverview,
    type SalesOverviewBlock,
    type SalesOverviewFilters,
    type SalesOverviewProject,
    type SalesOverviewSummary,
} from '../slices/salesObjOverviewSlice';

type FilterFormState = {
    search: string;
    projectId: string;
    projectIds: string;
    blockId: string;
    floorNumber: string;
    floorNumbers: string;
    floorFrom: string;
    floorTo: string;
    statusId: string;
    statusIds: string;
    statusCode: string;
    statusCodes: string;
    lotType: string;
    lotTypes: string;
    rooms: string;
    roomsFrom: string;
    roomsTo: string;
    areaFrom: string;
    areaTo: string;
    areaLivingFrom: string;
    areaLivingTo: string;
    areaKitchenFrom: string;
    areaKitchenTo: string;
    areaBalconyFrom: string;
    areaBalconyTo: string;
    priceFrom: string;
    priceTo: string;
    pricePerM2From: string;
    pricePerM2To: string;
    managerUserId: string;
    clientId: string;
    clientSearch: string;
    clientPhone: string;
    clientPin: string;
    clientPassport: string;
    sortBy: string;
};

const initialFilters: FilterFormState = {
    search: '',
    projectId: '',
    projectIds: '',
    blockId: '',
    floorNumber: '',
    floorNumbers: '',
    floorFrom: '',
    floorTo: '',
    statusId: '',
    statusIds: '',
    statusCode: '',
    statusCodes: '',
    lotType: '',
    lotTypes: '',
    rooms: '',
    roomsFrom: '',
    roomsTo: '',
    areaFrom: '',
    areaTo: '',
    areaLivingFrom: '',
    areaLivingTo: '',
    areaKitchenFrom: '',
    areaKitchenTo: '',
    areaBalconyFrom: '',
    areaBalconyTo: '',
    priceFrom: '',
    priceTo: '',
    pricePerM2From: '',
    pricePerM2To: '',
    managerUserId: '',
    clientId: '',
    clientSearch: '',
    clientPhone: '',
    clientPin: '',
    clientPassport: '',
    sortBy: 'default',
};

const lotTypeOptions = [
    { value: 'apartment', label: 'Квартира' },
    { value: 'commercial', label: 'Коммерция' },
    { value: 'parking', label: 'Паркинг' },
    { value: 'storage', label: 'Кладовая' },
];

const roomChipOptions = [
    { value: 'all', label: 'Все' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4+', label: '4+' },
];

const sortOptions = [
    { value: 'default', label: 'Сортировка: по умолч.' },
    { value: 'name-asc', label: 'По названию А-Я' },
    { value: 'name-desc', label: 'По названию Я-А' },
    { value: 'total-desc', label: 'По количеству лотов' },
    { value: 'free-desc', label: 'По свободным лотам' },
    { value: 'sold-desc', label: 'По проданным лотам' },
    { value: 'price-desc', label: 'По стоимости портфеля' },
];

const cellLabelClassName =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';
const textInputClassName =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500';
const tableHeaderClassName =
    'bg-blue-50 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-700';
const toolbarSelectClassName =
    'h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm text-slate-700 transition focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500';
const toolbarButtonClassName =
    'inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors';
const chipBaseClassName =
    'inline-flex h-8 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors';

const parseNumberValue = (value: string) => {
    const normalized = value.trim().replace(',', '.');

    if (!normalized) {
        return undefined;
    }

    const numberValue = Number(normalized);
    return Number.isFinite(numberValue) ? numberValue : undefined;
};

const parseNumberArray = (value: string) => {
    const items = value
        .split(/[;,]/)
        .map((item) => parseNumberValue(item))
        .filter((item): item is number => item !== undefined);

    return items.length > 0 ? items : undefined;
};

const parseStringValue = (value: string) => {
    const normalized = value.trim();
    return normalized ? normalized : undefined;
};

const parseStringArray = (value: string) => {
    const items = value
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter(Boolean);

    return items.length > 0 ? items : undefined;
};

const buildSalesOverviewFilters = (filters: FilterFormState): SalesOverviewFilters => ({
    project_id: parseNumberValue(filters.projectId),
    project_ids: parseNumberArray(filters.projectIds),
    floor_number: parseNumberValue(filters.floorNumber),
    floor_numbers: parseNumberArray(filters.floorNumbers),
    floor_from: parseNumberValue(filters.floorFrom),
    floor_to: parseNumberValue(filters.floorTo),
    status_id: parseNumberValue(filters.statusId),
    status_ids: parseNumberArray(filters.statusIds),
    status_code: parseStringValue(filters.statusCode),
    status_codes: parseStringArray(filters.statusCodes),
    lot_type: parseStringValue(filters.lotType),
    lot_types: parseStringArray(filters.lotTypes),
    rooms: parseNumberValue(filters.rooms),
    rooms_from: parseNumberValue(filters.roomsFrom),
    rooms_to: parseNumberValue(filters.roomsTo),
    area_from: parseNumberValue(filters.areaFrom),
    area_to: parseNumberValue(filters.areaTo),
    area_living_from: parseNumberValue(filters.areaLivingFrom),
    area_living_to: parseNumberValue(filters.areaLivingTo),
    area_kitchen_from: parseNumberValue(filters.areaKitchenFrom),
    area_kitchen_to: parseNumberValue(filters.areaKitchenTo),
    area_balcony_from: parseNumberValue(filters.areaBalconyFrom),
    area_balcony_to: parseNumberValue(filters.areaBalconyTo),
    price_from: parseNumberValue(filters.priceFrom),
    price_to: parseNumberValue(filters.priceTo),
    price_per_m2_from: parseNumberValue(filters.pricePerM2From),
    price_per_m2_to: parseNumberValue(filters.pricePerM2To),
    manager_user_id: parseNumberValue(filters.managerUserId),
    client_id: parseNumberValue(filters.clientId),
    client_search: parseStringValue(filters.clientSearch),
    client_phone: parseStringValue(filters.clientPhone),
    client_pin: parseStringValue(filters.clientPin),
    client_passport: parseStringValue(filters.clientPassport),
});

const countActiveFilters = (filters: FilterFormState) =>
    Object.entries(filters).filter(([key, value]) => {
        if (key === 'sortBy') {
            return value.trim() !== '' && value !== 'default';
        }

        return value.trim() !== '';
    }).length;

const formatMoney = (value: string | number | null | undefined) => {
    const amount = Number(value ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
        return '-';
    }

    return `${formatNumber(amount, 0)} сом`;
};

const formatArea = (value: string | number | null | undefined) => {
    const area = Number(value ?? 0);

    if (!Number.isFinite(area) || area <= 0) {
        return '-';
    }

    return `${formatNumber(area, Number.isInteger(area) ? 0 : 1)} м2`;
};

const formatDate = (value: string | null | undefined) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

const getLotTypeItems = (item: {
    apartments: number;
    commercial_units: number;
    parking_units: number;
    storage_units: number;
}) => [
    { label: 'Кв', value: item.apartments },
    { label: 'Ком', value: item.commercial_units },
    { label: 'Пар', value: item.parking_units },
    { label: 'Клад', value: item.storage_units },
];

const getStatusItems = (item: {
    total_units: number;
    free_units: number;
    reserved_units: number;
    sold_units: number;
    offmarket_units: number;
}) => [
    {
        label: 'Всего',
        value: item.total_units,
        className: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
        label: 'Свободно',
        value: item.free_units,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
        label: 'Бронь',
        value: item.reserved_units,
        className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
        label: 'Продано',
        value: item.sold_units,
        className: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
        label: 'Вне продажи',
        value: item.offmarket_units,
        className: 'bg-slate-50 text-slate-600 border-slate-200',
    },
];

const mergeProjects = (current: SalesOverviewProject[], next: SalesOverviewProject[]) => {
    const map = new Map<number, SalesOverviewProject>();

    current.forEach((project) => {
        map.set(project.id, project);
    });

    next.forEach((project) => {
        map.set(project.id, project);
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
};

function SummaryCard({
    title,
    value,
    hint,
    accentClass,
    icon,
}: {
    title: string;
    value: string;
    hint: string;
    accentClass: string;
    icon: ReactNode;
}) {
    return (
        <div className="p-4 bg-white border shadow-sm rounded-2xl border-sky-100">
            <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                    <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                        {title}
                    </p>
                    <p className={`mt-2 text-2xl font-bold ${accentClass}`}>{value}</p>
                </div>
                <div className="flex items-center justify-center w-5 h-5 rounded-xl bg-sky-50 text-sky-700">
                    {icon}
                </div>
            </div>
            <p className="text-xs text-slate-500">{hint}</p>
        </div>
    );
}

function StatusBadges({
    item,
}: {
    item: {
        total_units: number;
        free_units: number;
        reserved_units: number;
        sold_units: number;
        offmarket_units: number;
    };
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {getStatusItems(item).map((status) => (
                <span
                    key={status.label}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${status.className}`}
                >
                    <span>{status.label}</span>
                    <span>{formatNumber(status.value)}</span>
                </span>
            ))}
        </div>
    );
}

function PortfolioStatusBar({ summary }: { summary: SalesOverviewSummary }) {
    const totalUnits = summary.total_units || 0;
    const freeShare = totalUnits > 0 ? Math.round((summary.free_units / totalUnits) * 100) : 0;
    const soldShare = totalUnits > 0 ? Math.round((summary.sold_units / totalUnits) * 100) : 0;

    const items = [
        {
            key: 'projects',
            icon: <Building2 className="w-4 h-4 text-sky-500" />,
            label: `${formatNumber(summary.total_projects)} объектов`,
            value: '',
            valueClassName: 'text-slate-700',
        },
        {
            key: 'total',
            icon: <Layers3 className="w-4 h-4 text-slate-400" />,
            label: 'Всего:',
            value: formatNumber(summary.total_units),
            valueClassName: 'text-slate-900',
        },
        {
            key: 'free',
            icon: <ArrowUpRight className="w-4 h-4 text-emerald-500" />,
            label: `${formatNumber(summary.free_units)} своб`,
            value: `(${freeShare}%)`,
            valueClassName: 'text-emerald-700',
        },
        {
            key: 'reserved',
            icon: <ArrowDownRight className="w-4 h-4 text-amber-500" />,
            label: `${formatNumber(summary.reserved_units)} рез`,
            value: '',
            valueClassName: 'text-amber-700',
        },
        {
            key: 'sold',
            icon: <ArrowDownRight className="w-4 h-4 text-sky-500" />,
            label: `${formatNumber(summary.sold_units)} прод`,
            value: `(${soldShare}%)`,
            valueClassName: 'text-sky-700',
        },
        {
            key: 'soldPrice',
            icon: <CircleDollarSign className="w-4 h-4 text-slate-400" />,
            label: 'Продано:',
            value: formatMoney(summary.sold_price),
            valueClassName: 'text-slate-900',
        },
        {
            key: 'freePrice',
            icon: <Wallet className="w-4 h-4 text-slate-400" />,
            label: 'Своб фонд:',
            value: formatMoney(summary.free_price),
            valueClassName: 'text-slate-900',
        },
    ];

    return (
        <div className="px-4 py-3 bg-white border shadow-sm rounded-2xl border-sky-100">
            <div className="flex flex-wrap items-center text-sm gap-x-5 gap-y-2">
                {items.map((item, index) => (
                    <Fragment key={item.key}>
                        {index > 0 && <span className="hidden w-px h-5 bg-slate-200 lg:block" />}
                        <div className="inline-flex items-center gap-2 whitespace-nowrap">
                            {item.icon}
                            <span className="text-slate-600">{item.label}</span>
                            {item.value ? (
                                <span className={`font-semibold ${item.valueClassName}`}>
                                    {item.value}
                                </span>
                            ) : null}
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

function LotTypeBadges({
    item,
}: {
    item: {
        apartments: number;
        commercial_units: number;
        parking_units: number;
        storage_units: number;
    };
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {getLotTypeItems(item).map((lot) => (
                <span
                    key={lot.label}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700"
                >
                    <span>{lot.label}</span>
                    <span>{formatNumber(lot.value)}</span>
                </span>
            ))}
        </div>
    );
}

function ProjectExpandedRow({
    project,
    blocks,
}: {
    project: SalesOverviewProject;
    blocks: SalesOverviewBlock[];
}) {
    return (
        <div className="px-4 py-4 bg-slate-50/70">
            <div className="bg-white border shadow-sm rounded-2xl border-sky-100">
                <div className="flex flex-col gap-3 px-4 py-3 border-b border-sky-100 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-sky-800">
                            Блоки проекта {project.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Детализация по блокам внутри выбранного объекта
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full border-sky-200 bg-sky-50 text-sky-700">
                            Блоков: {formatNumber(blocks.length)}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                            Свободно: {formatNumber(project.free_units)}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-white border rounded-full border-slate-200 text-slate-700">
                            Портфель: {formatMoney(project.total_price)}
                        </span>
                    </div>
                </div>

                {blocks.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-center text-slate-500">
                        Для этого проекта пока нет блоков в обзоре.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead>
                                <tr className="border-b border-sky-100 bg-sky-50/80">
                                    <th className={tableHeaderClassName}>Блок</th>
                                    <th className={tableHeaderClassName}>Лоты</th>
                                    <th className={tableHeaderClassName}>Типы</th>
                                    <th className={tableHeaderClassName}>Площадь</th>
                                    <th className={tableHeaderClassName}>Стоимость</th>
                                    <th className={tableHeaderClassName}>Создан</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sky-100">
                                {blocks.map((block) => (
                                    <tr
                                        key={block.id}
                                        className="transition-colors hover:bg-sky-50/40"
                                    >
                                        <td className="px-4 py-3 align-top">
                                            <div className="font-semibold text-slate-900">
                                                {block.name}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                ID: {block.id}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <StatusBadges item={block} />
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <LotTypeBadges item={block} />
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="font-semibold text-slate-900">
                                                {formatArea(block.total_area)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <div className="space-y-1 text-xs text-slate-600">
                                                <div>
                                                    <span className="font-medium text-slate-900">
                                                        Всего:
                                                    </span>{' '}
                                                    {formatMoney(block.total_price)}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-emerald-700">
                                                        Свободно:
                                                    </span>{' '}
                                                    {formatMoney(block.free_price)}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-amber-700">
                                                        Бронь:
                                                    </span>{' '}
                                                    {formatMoney(block.reserved_price)}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-sky-700">
                                                        Продано:
                                                    </span>{' '}
                                                    {formatMoney(block.sold_price)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm align-top text-slate-600">
                                            {formatDate(block.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterChip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${chipBaseClassName} ${
                active
                    ? 'border-sky-500 bg-sky-500 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50'
            }`}
        >
            {children}
        </button>
    );
}

export default function ObjectsOverviewPage() {
    const dispatch = useAppDispatch();
    const usersRef = useReference('users');
    const projectBlocksRef = useReference('projectBlocks');
    const { projects, blocks, loading, error } = useAppSelector((state) => state.salesObjOverview);
    console.log('projects', projects);
    const { unitStatuses } = useAppSelector((state) => state.salesDictionaries);

    const [filters, setFilters] = useState<FilterFormState>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<FilterFormState>(initialFilters);
    const [refreshing, setRefreshing] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [expandedProjectIds, setExpandedProjectIds] = useState<number[]>([]);
    const [projectOptions, setProjectOptions] = useState<SalesOverviewProject[]>([]);

    const requestPayload = useMemo(
        () => buildSalesOverviewFilters(appliedFilters),
        [appliedFilters],
    );

    const activeFiltersCount = useMemo(() => countActiveFilters(appliedFilters), [appliedFilters]);

    const managers = useMemo(() => {
        const items = usersRef.data ?? [];
        const salesManagers = items.filter((item) => String(item.role_id) === '16');
        return salesManagers.length > 0 ? salesManagers : items;
    }, [usersRef.data]);

    const selectedProjectId = useMemo(
        () => parseNumberValue(appliedFilters.projectId),
        [appliedFilters.projectId],
    );

    const selectedBlockId = useMemo(
        () => parseNumberValue(appliedFilters.blockId),
        [appliedFilters.blockId],
    );

    const blockOptions = useMemo(() => {
        const items = projectBlocksRef.data ?? [];

        return items.filter((item) => {
            if (!filters.projectId) {
                return true;
            }

            return Number(item.project_id) === Number(filters.projectId);
        });
    }, [filters.projectId, projectBlocksRef.data]);

    useEffect(() => {
        if (unitStatuses.length === 0) {
            dispatch(fetchSalesUnitStatuses());
        }
    }, [dispatch, unitStatuses.length]);

    useEffect(() => {
        void dispatch(fetchSalesOverview(requestPayload));
    }, [dispatch, requestPayload]);

    useEffect(() => {
        if (projects.length > 0) {
            setProjectOptions((prev) => mergeProjects(prev, projects));
        }
    }, [projects]);

    const visibleBlocksByProject = useMemo(() => {
        const searchTerm = appliedFilters.search.trim().toLowerCase();
        const filteredBlocks = blocks.filter((block) => {
            if (selectedProjectId && block.project_id !== selectedProjectId) {
                return false;
            }

            if (selectedBlockId && block.id !== selectedBlockId) {
                return false;
            }

            if (!searchTerm) {
                return true;
            }

            return (
                block.name.toLowerCase().includes(searchTerm) ||
                String(block.id).includes(searchTerm) ||
                String(block.project_id).includes(searchTerm)
            );
        });

        return filteredBlocks.reduce<Record<number, SalesOverviewBlock[]>>((acc, block) => {
            if (!acc[block.project_id]) {
                acc[block.project_id] = [];
            }

            acc[block.project_id].push(block);
            return acc;
        }, {});
    }, [appliedFilters.search, blocks, selectedBlockId, selectedProjectId]);

    const visibleProjects = useMemo(() => {
        const searchTerm = appliedFilters.search.trim().toLowerCase();
        const next = projects.filter((project) => {
            if (selectedProjectId && project.id !== selectedProjectId) {
                return false;
            }

            const projectBlocks = visibleBlocksByProject[project.id] ?? [];

            if (selectedBlockId && projectBlocks.length === 0) {
                return false;
            }

            if (!searchTerm) {
                return selectedBlockId ? projectBlocks.length > 0 : true;
            }

            const matchesProject =
                project.name.toLowerCase().includes(searchTerm) ||
                (project.address ?? '').toLowerCase().includes(searchTerm) ||
                String(project.id).includes(searchTerm);

            const matchesBlock = projectBlocks.some(
                (block) =>
                    block.name.toLowerCase().includes(searchTerm) ||
                    String(block.id).includes(searchTerm),
            );

            return matchesProject || matchesBlock;
        });

        switch (appliedFilters.sortBy) {
            case 'name-asc':
                next.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
                break;
            case 'name-desc':
                next.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
                break;
            case 'total-desc':
                next.sort(
                    (a, b) =>
                        (visibleBlocksByProject[b.id]?.reduce(
                            (sum, block) => sum + block.total_units,
                            0,
                        ) ?? b.total_units) -
                        (visibleBlocksByProject[a.id]?.reduce(
                            (sum, block) => sum + block.total_units,
                            0,
                        ) ?? a.total_units),
                );
                break;
            case 'free-desc':
                next.sort(
                    (a, b) =>
                        (visibleBlocksByProject[b.id]?.reduce(
                            (sum, block) => sum + block.free_units,
                            0,
                        ) ?? b.free_units) -
                        (visibleBlocksByProject[a.id]?.reduce(
                            (sum, block) => sum + block.free_units,
                            0,
                        ) ?? a.free_units),
                );
                break;
            case 'sold-desc':
                next.sort(
                    (a, b) =>
                        (visibleBlocksByProject[b.id]?.reduce(
                            (sum, block) => sum + block.sold_units,
                            0,
                        ) ?? b.sold_units) -
                        (visibleBlocksByProject[a.id]?.reduce(
                            (sum, block) => sum + block.sold_units,
                            0,
                        ) ?? a.sold_units),
                );
                break;
            case 'price-desc':
                next.sort(
                    (a, b) =>
                        (visibleBlocksByProject[b.id]?.reduce(
                            (sum, block) => sum + Number(block.total_price || 0),
                            0,
                        ) ?? Number(b.total_price || 0)) -
                        (visibleBlocksByProject[a.id]?.reduce(
                            (sum, block) => sum + Number(block.total_price || 0),
                            0,
                        ) ?? Number(a.total_price || 0)),
                );
                break;
            default:
                next.sort((a, b) => a.id - b.id);
                break;
        }

        return next;
    }, [
        appliedFilters.search,
        appliedFilters.sortBy,
        projects,
        selectedBlockId,
        selectedProjectId,
        visibleBlocksByProject,
    ]);

    const visibleProjectMetrics = useMemo(() => {
        return Object.entries(visibleBlocksByProject).reduce<
            Record<
                number,
                Omit<SalesOverviewSummary, 'total_projects' | 'leads_count' | 'clients_count'>
            >
        >((acc, [projectId, projectBlocks]) => {
            acc[Number(projectId)] = {
                total_units: projectBlocks.reduce((sum, item) => sum + item.total_units, 0),
                free_units: projectBlocks.reduce((sum, item) => sum + item.free_units, 0),
                reserved_units: projectBlocks.reduce((sum, item) => sum + item.reserved_units, 0),
                sold_units: projectBlocks.reduce((sum, item) => sum + item.sold_units, 0),
                offmarket_units: projectBlocks.reduce((sum, item) => sum + item.offmarket_units, 0),
                apartments: projectBlocks.reduce((sum, item) => sum + item.apartments, 0),
                commercial_units: projectBlocks.reduce(
                    (sum, item) => sum + item.commercial_units,
                    0,
                ),
                parking_units: projectBlocks.reduce((sum, item) => sum + item.parking_units, 0),
                storage_units: projectBlocks.reduce((sum, item) => sum + item.storage_units, 0),
                total_area: String(
                    projectBlocks.reduce((sum, item) => sum + Number(item.total_area || 0), 0),
                ),
                total_price: String(
                    projectBlocks.reduce((sum, item) => sum + Number(item.total_price || 0), 0),
                ),
                free_price: String(
                    projectBlocks.reduce((sum, item) => sum + Number(item.free_price || 0), 0),
                ),
                reserved_price: String(
                    projectBlocks.reduce((sum, item) => sum + Number(item.reserved_price || 0), 0),
                ),
                sold_price: String(
                    projectBlocks.reduce((sum, item) => sum + Number(item.sold_price || 0), 0),
                ),
            };

            return acc;
        }, {});
    }, [visibleBlocksByProject]);

    const handleRefresh = async () => {
        setRefreshing(true);

        try {
            await dispatch(fetchSalesOverview(requestPayload)).unwrap();
        } finally {
            setRefreshing(false);
        }
    };

    const setField = <K extends keyof FilterFormState>(field: K, value: FilterFormState[K]) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleProjectChange = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            projectId: value,
            blockId: '',
        }));
    };

    const handleLotTypeSelect = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            lotType: value === 'all' ? '' : value,
            lotTypes: '',
        }));
    };

    const handleStatusSelect = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            statusCode: value === 'all' ? '' : value,
            statusId: '',
            statusIds: '',
            statusCodes: '',
        }));
    };

    const handleRoomsSelect = (value: string) => {
        if (value === 'all') {
            setFilters((prev) => ({
                ...prev,
                rooms: '',
                roomsFrom: '',
                roomsTo: '',
            }));
            return;
        }

        if (value === '4+') {
            setFilters((prev) => ({
                ...prev,
                rooms: '',
                roomsFrom: '4',
                roomsTo: '',
            }));
            return;
        }

        setFilters((prev) => ({
            ...prev,
            rooms: value,
            roomsFrom: '',
            roomsTo: '',
        }));
    };

    const handleApplyFilters = () => {
        setExpandedProjectIds([]);
        setAppliedFilters(filters);
    };

    const handleResetFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setExpandedProjectIds([]);
    };

    const toggleProject = (projectId: number) => {
        setExpandedProjectIds((prev) =>
            prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
        );
    };

    const visibleBlocks = useMemo(
        () => Object.values(visibleBlocksByProject).flat(),
        [visibleBlocksByProject],
    );

    const headerSummary = {
        total_projects: visibleProjects.length,
        total_units: visibleBlocks.reduce((acc, block) => acc + block.total_units, 0),
        free_units: visibleBlocks.reduce((acc, block) => acc + block.free_units, 0),
        reserved_units: visibleBlocks.reduce((acc, block) => acc + block.reserved_units, 0),
        sold_units: visibleBlocks.reduce((acc, block) => acc + block.sold_units, 0),
        offmarket_units: visibleBlocks.reduce((acc, block) => acc + block.offmarket_units, 0),
        apartments: visibleBlocks.reduce((acc, block) => acc + block.apartments, 0),
        commercial_units: visibleBlocks.reduce((acc, block) => acc + block.commercial_units, 0),
        parking_units: visibleBlocks.reduce((acc, block) => acc + block.parking_units, 0),
        storage_units: visibleBlocks.reduce((acc, block) => acc + block.storage_units, 0),
        total_area: String(
            visibleBlocks.reduce((acc, block) => acc + Number(block.total_area || 0), 0),
        ),
        total_price: String(
            visibleBlocks.reduce((acc, block) => acc + Number(block.total_price || 0), 0),
        ),
        free_price: String(
            visibleBlocks.reduce((acc, block) => acc + Number(block.free_price || 0), 0),
        ),
        reserved_price: String(
            visibleBlocks.reduce((acc, block) => acc + Number(block.reserved_price || 0), 0),
        ),
        sold_price: String(
            visibleBlocks.reduce((acc, block) => acc + Number(block.sold_price || 0), 0),
        ),
        leads_count: visibleProjects.reduce((acc, project) => acc + project.leads_count, 0),
        clients_count: visibleProjects.reduce((acc, project) => acc + project.clients_count, 0),
    } satisfies SalesOverviewSummary;

    const summaryCards = [
        {
            title: 'Проекты',
            value: formatNumber(headerSummary.total_projects),
            hint: 'Всего объектов в текущем срезе',
            accentClass: 'text-sky-800',
            icon: <Building2 className="w-5 h-5" />,
        },
        {
            title: 'Лоты',
            value: formatNumber(headerSummary.total_units),
            hint: 'Количество лотов по фильтру',
            accentClass: 'text-slate-900',
            icon: <Layers3 className="w-5 h-5" />,
        },
        {
            title: 'Свободно',
            value: formatNumber(headerSummary.free_units),
            hint: 'Доступно для продажи',
            accentClass: 'text-emerald-700',
            icon: <Home className="w-5 h-5" />,
        },
        {
            title: 'Бронь',
            value: formatNumber(headerSummary.reserved_units),
            hint: 'Лоты в резерве',
            accentClass: 'text-amber-700',
            icon: <Home className="w-5 h-5" />,
        },
        {
            title: 'Продано',
            value: formatNumber(headerSummary.sold_units),
            hint: 'Завершенные продажи',
            accentClass: 'text-sky-700',
            icon: <CircleDollarSign className="w-5 h-5" />,
        },
        {
            title: 'Лиды / Клиенты',
            value: `${formatNumber(headerSummary.leads_count)} / ${formatNumber(headerSummary.clients_count)}`,
            hint: 'Воронка и клиентская база',
            accentClass: 'text-slate-900',
            icon: <Users className="w-5 h-5" />,
        },
    ];

    const showEmpty = !loading && visibleProjects.length === 0;
    const showLargeError = !loading && visibleProjects.length === 0 && Boolean(error);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="mx-auto max-w-[1800px] px-6 py-3">
                <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between"></div>

                {/* <div className="mb-6 overflow-hidden bg-white border border-gray-200 shadow-sm rounded-3xl">
                    <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(event) => setField('search', event.target.value)}
                                placeholder="Поиск по номеру лота..."
                                className="w-full h-12 pr-4 text-sm transition bg-white border border-gray-300 rounded-xl pl-11 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                        </div>

                        <select
                            value={filters.projectId}
                            onChange={(event) => handleProjectChange(event.target.value)}
                            className={`${toolbarSelectClassName} min-w-[176px]`}
                        >
                            <option value="">Все объекты</option>
                            {projectOptions.map((project) => (
                                <option key={project.id} value={String(project.id)}>
                                    {project.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.blockId}
                            onChange={(event) => setField('blockId', event.target.value)}
                            className={`${toolbarSelectClassName} min-w-[150px]`}
                        >
                            <option value="">Все блоки</option>
                            {blockOptions.map((block) => (
                                <option key={block.id} value={String(block.id)}>
                                    {block.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(event) => setField('sortBy', event.target.value)}
                            className={`${toolbarSelectClassName} min-w-[200px]`}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={() => setFiltersOpen((prev) => !prev)}
                            className={`${toolbarButtonClassName} border border-sky-500 bg-sky-50 text-sky-700 hover:bg-sky-100`}
                        >
                            <Filter className="w-4 h-4" />
                            Фильтры
                            {activeFiltersCount > 0 ? (
                                <span className="rounded-full bg-sky-500 px-2 py-0.5 text-xs text-white">
                                    {activeFiltersCount}
                                </span>
                            ) : null}
                        </button>

                        <div className="flex justify-end flex-1 gap-2">
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className={`${toolbarButtonClassName} border border-rose-300 bg-white text-rose-500 hover:bg-rose-50`}
                            >
                                Сбросить
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className={`${toolbarButtonClassName} border border-sky-500 bg-white text-sky-700 hover:bg-sky-50`}
                            >
                                Применить
                            </button>
                        </div>
                    </div>

                    {filtersOpen && (
                        <div className="px-4 py-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1.25fr_0.8fr_0.9fr]">
                                <div>
                                    <label className={cellLabelClassName}>Тип лота</label>
                                    <div className="flex flex-wrap gap-2">
                                        <FilterChip
                                            active={!filters.lotType}
                                            onClick={() => handleLotTypeSelect('all')}
                                        >
                                            Все типы
                                        </FilterChip>
                                        {lotTypeOptions.map((option) => (
                                            <FilterChip
                                                key={option.value}
                                                active={filters.lotType === option.value}
                                                onClick={() => handleLotTypeSelect(option.value)}
                                            >
                                                {option.label}
                                            </FilterChip>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className={cellLabelClassName}>Статус</label>
                                    <div className="flex flex-wrap gap-2">
                                        <FilterChip
                                            active={!filters.statusCode}
                                            onClick={() => handleStatusSelect('all')}
                                        >
                                            Любой
                                        </FilterChip>
                                        {unitStatuses.map((status: SalesUnitStatus) => (
                                            <FilterChip
                                                key={status.id}
                                                active={filters.statusCode === status.code}
                                                onClick={() => handleStatusSelect(status.code)}
                                            >
                                                {status.name}
                                            </FilterChip>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className={cellLabelClassName}>Комнат</label>
                                    <div className="flex flex-wrap gap-2">
                                        {roomChipOptions.map((option) => (
                                            <FilterChip
                                                key={option.value}
                                                active={
                                                    option.value === 'all'
                                                        ? !filters.rooms &&
                                                          !filters.roomsFrom &&
                                                          !filters.roomsTo
                                                        : option.value === '4+'
                                                          ? !filters.rooms &&
                                                            filters.roomsFrom === '4' &&
                                                            !filters.roomsTo
                                                          : filters.rooms === option.value
                                                }
                                                onClick={() => handleRoomsSelect(option.value)}
                                            >
                                                {option.label}
                                            </FilterChip>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className={cellLabelClassName}>Площадь (м²)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            value={filters.areaFrom}
                                            onChange={(event) =>
                                                setField('areaFrom', event.target.value)
                                            }
                                            placeholder="От"
                                            className={textInputClassName}
                                        />
                                        <input
                                            type="number"
                                            value={filters.areaTo}
                                            onChange={(event) =>
                                                setField('areaTo', event.target.value)
                                            }
                                            placeholder="До"
                                            className={textInputClassName}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.75fr_1fr_1fr]">
                                <div>
                                    <label className={cellLabelClassName}>Цена (₸)</label>
                                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                        <input
                                            type="number"
                                            value={filters.priceFrom}
                                            onChange={(event) =>
                                                setField('priceFrom', event.target.value)
                                            }
                                            placeholder="От"
                                            className={textInputClassName}
                                        />
                                        <span className="text-slate-300">—</span>
                                        <input
                                            type="number"
                                            value={filters.priceTo}
                                            onChange={(event) =>
                                                setField('priceTo', event.target.value)
                                            }
                                            placeholder="До"
                                            className={textInputClassName}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={cellLabelClassName}>Этаж</label>
                                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                        <input
                                            type="number"
                                            value={filters.floorFrom}
                                            onChange={(event) =>
                                                setField('floorFrom', event.target.value)
                                            }
                                            placeholder="От"
                                            className={textInputClassName}
                                        />
                                        <span className="text-slate-300">—</span>
                                        <input
                                            type="number"
                                            value={filters.floorTo}
                                            onChange={(event) =>
                                                setField('floorTo', event.target.value)
                                            }
                                            placeholder="До"
                                            className={textInputClassName}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={cellLabelClassName}>Цена за м²</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            value={filters.pricePerM2From}
                                            onChange={(event) =>
                                                setField('pricePerM2From', event.target.value)
                                            }
                                            placeholder="От"
                                            className={textInputClassName}
                                        />
                                        <input
                                            type="number"
                                            value={filters.pricePerM2To}
                                            onChange={(event) =>
                                                setField('pricePerM2To', event.target.value)
                                            }
                                            placeholder="До"
                                            className={textInputClassName}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={cellLabelClassName}>Менеджер</label>
                                    <select
                                        value={filters.managerUserId}
                                        onChange={(event) =>
                                            setField('managerUserId', event.target.value)
                                        }
                                        className={textInputClassName}
                                    >
                                        <option value="">Все менеджеры</option>
                                        {managers.map((manager) => (
                                            <option key={manager.id} value={String(manager.id)}>
                                                {manager.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="px-4 py-4 mt-5 border border-dashed rounded-2xl border-slate-200 bg-slate-50">
                                <div className="mb-3 text-xs font-semibold tracking-wide uppercase text-slate-500">
                                    Дополнительные параметры
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                                    <input
                                        type="text"
                                        value={filters.projectIds}
                                        onChange={(event) =>
                                            setField('projectIds', event.target.value)
                                        }
                                        placeholder="project_ids: 1,2,3"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="text"
                                        value={filters.floorNumbers}
                                        onChange={(event) =>
                                            setField('floorNumbers', event.target.value)
                                        }
                                        placeholder="floor_numbers: 2,5,8"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="text"
                                        value={filters.statusIds}
                                        onChange={(event) =>
                                            setField('statusIds', event.target.value)
                                        }
                                        placeholder="status_ids: 1,2"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="text"
                                        value={filters.statusCodes}
                                        onChange={(event) =>
                                            setField('statusCodes', event.target.value)
                                        }
                                        placeholder="status_codes: free,reserved"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="text"
                                        value={filters.lotTypes}
                                        onChange={(event) =>
                                            setField('lotTypes', event.target.value)
                                        }
                                        placeholder="lot_types: apartment,parking"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.floorNumber}
                                        onChange={(event) =>
                                            setField('floorNumber', event.target.value)
                                        }
                                        placeholder="floor_number"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.roomsFrom}
                                        onChange={(event) =>
                                            setField('roomsFrom', event.target.value)
                                        }
                                        placeholder="rooms_from"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.roomsTo}
                                        onChange={(event) =>
                                            setField('roomsTo', event.target.value)
                                        }
                                        placeholder="rooms_to"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="text"
                                        value={filters.clientSearch}
                                        onChange={(event) =>
                                            setField('clientSearch', event.target.value)
                                        }
                                        placeholder="client_search"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.clientId}
                                        onChange={(event) =>
                                            setField('clientId', event.target.value)
                                        }
                                        placeholder="client_id"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="text"
                                        value={filters.clientPhone}
                                        onChange={(event) =>
                                            setField('clientPhone', event.target.value)
                                        }
                                        placeholder="client_phone"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="text"
                                        value={filters.clientPin}
                                        onChange={(event) =>
                                            setField('clientPin', event.target.value)
                                        }
                                        placeholder="client_pin"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="text"
                                        value={filters.clientPassport}
                                        onChange={(event) =>
                                            setField('clientPassport', event.target.value)
                                        }
                                        placeholder="client_passport"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.areaLivingFrom}
                                        onChange={(event) =>
                                            setField('areaLivingFrom', event.target.value)
                                        }
                                        placeholder="area_living_from"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.areaLivingTo}
                                        onChange={(event) =>
                                            setField('areaLivingTo', event.target.value)
                                        }
                                        placeholder="area_living_to"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.areaKitchenFrom}
                                        onChange={(event) =>
                                            setField('areaKitchenFrom', event.target.value)
                                        }
                                        placeholder="area_kitchen_from"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.areaKitchenTo}
                                        onChange={(event) =>
                                            setField('areaKitchenTo', event.target.value)
                                        }
                                        placeholder="area_kitchen_to"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.areaBalconyFrom}
                                        onChange={(event) =>
                                            setField('areaBalconyFrom', event.target.value)
                                        }
                                        placeholder="area_balcony_from"
                                        className={textInputClassName}
                                    />
                                    <input
                                        type="number"
                                        value={filters.areaBalconyTo}
                                        onChange={(event) =>
                                            setField('areaBalconyTo', event.target.value)
                                        }
                                        placeholder="area_balcony_to"
                                        className={textInputClassName}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 xl:grid-cols-6">
                    {summaryCards.map((card) => (
                        <SummaryCard key={card.title} {...card} />
                    ))}
                </div>

                <div className="mb-6">
                    <PortfolioStatusBar summary={headerSummary} />
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
                    <div className="p-4 bg-white border shadow-sm rounded-2xl border-sky-100">
                        <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                            Структура лотов
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <LotTypeBadges item={headerSummary} />
                        </div>
                    </div>

                    <div className="p-4 bg-white border shadow-sm rounded-2xl border-sky-100">
                        <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                            Стоимость и площадь
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="p-3 rounded-xl bg-slate-50">
                                <p className="text-xs text-slate-500">Площадь</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {formatArea(headerSummary.total_area)}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50">
                                <p className="text-xs text-slate-500">Портфель</p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {formatMoney(headerSummary.total_price)}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50">
                                <p className="text-xs text-emerald-700">Свободно</p>
                                <p className="mt-1 text-sm font-semibold text-emerald-800">
                                    {formatMoney(headerSummary.free_price)}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-sky-50">
                                <p className="text-xs text-sky-700">Продано</p>
                                <p className="mt-1 text-sm font-semibold text-sky-800">
                                    {formatMoney(headerSummary.sold_price)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div> */}

                {error && projects.length > 0 && (
                    <div className="flex items-start gap-3 px-4 py-3 mb-4 text-sm border rounded-2xl border-rose-200 bg-rose-50 text-rose-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
                    {loading && projects.length === 0 ? (
                        <div className="flex items-center justify-center py-24 text-sm text-slate-500">
                            <RefreshCw className="w-5 h-5 mr-3 animate-spin text-sky-600" />
                            Загружаем сводку по объектам...
                        </div>
                    ) : showLargeError ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                            <div className="flex items-center justify-center rounded-full h-14 w-14 bg-rose-50 text-rose-500">
                                <AlertCircle className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-slate-900">
                                    Не удалось загрузить обзор
                                </p>
                                <p className="mt-1 text-sm text-slate-500">{error}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium transition-colors bg-white border rounded-lg border-sky-300 text-sky-700 hover:bg-sky-50"
                            >
                                Повторить
                            </button>
                        </div>
                    ) : showEmpty ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                            <div className="flex items-center justify-center rounded-full h-14 w-14 bg-slate-100 text-slate-400">
                                <Building2 className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-slate-900">
                                    Объекты не найдены
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Попробуйте ослабить параметры фильтрации или сбросить фильтр.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1360px] text-sm">
                                <thead className="sticky top-0 z-10 bg-gray-50">
                                    <tr className="border-b border-gray-200">
                                        <th className="w-14 bg-blue-50 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                                            #
                                        </th>
                                        <th className={tableHeaderClassName}>Объект</th>
                                        <th className={tableHeaderClassName}>Адрес / Дата</th>
                                        <th className={tableHeaderClassName}>Блоки</th>
                                        <th className={tableHeaderClassName}>Лоты</th>
                                        <th className={tableHeaderClassName}>Типы</th>
                                        <th className={tableHeaderClassName}>
                                            Площадь / Стоимость
                                        </th>
                                        <th className={tableHeaderClassName}>Лиды / Клиенты</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {visibleProjects.map((project) => {
                                        const projectBlocks =
                                            visibleBlocksByProject[project.id] ?? [];
                                        const projectMetrics =
                                            visibleProjectMetrics[project.id] ?? project;
                                        const isExpanded = expandedProjectIds.includes(project.id);

                                        return (
                                            <Fragment key={project.id}>
                                                <tr
                                                    className="transition-colors cursor-pointer hover:bg-sky-50/50"
                                                    onClick={() => toggleProject(project.id)}
                                                >
                                                    <td className="px-3 py-3 text-center align-top">
                                                        <button
                                                            type="button"
                                                            aria-expanded={isExpanded}
                                                            aria-label={
                                                                isExpanded
                                                                    ? 'Свернуть блоки проекта'
                                                                    : 'Развернуть блоки проекта'
                                                            }
                                                            className="inline-flex items-center justify-center w-8 h-8 transition-colors bg-white border rounded-lg border-slate-200 text-slate-500 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </td>

                                                    <td className="px-4 py-3 align-top">
                                                        <div className="font-semibold text-slate-900">
                                                            {project.name}
                                                        </div>
                                                        <div className="mt-1 text-xs text-slate-500">
                                                            ID: {project.id}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 align-top">
                                                        <div className="flex items-start gap-2 text-sm text-slate-700">
                                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                            <div>
                                                                <div>
                                                                    {project.address ||
                                                                        'Адрес не указан'}
                                                                </div>
                                                                <div className="mt-1 text-xs text-slate-500">
                                                                    Создан:{' '}
                                                                    {formatDate(project.created_at)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 align-top">
                                                        <div className="px-3 py-2 text-sm font-semibold rounded-xl bg-slate-50 text-slate-800">
                                                            {formatNumber(projectBlocks.length)}
                                                        </div>
                                                        <div className="mt-2 text-xs text-slate-500">
                                                            Нажмите строку для раскрытия
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 align-top">
                                                        <StatusBadges item={projectMetrics} />
                                                    </td>

                                                    <td className="px-4 py-3 align-top">
                                                        <LotTypeBadges item={projectMetrics} />
                                                    </td>

                                                    <td className="px-4 py-3 align-top">
                                                        <div className="space-y-1 text-xs text-slate-600">
                                                            <div>
                                                                <span className="font-medium text-slate-900">
                                                                    Площадь:
                                                                </span>{' '}
                                                                {formatArea(
                                                                    projectMetrics.total_area,
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-slate-900">
                                                                    Портфель:
                                                                </span>{' '}
                                                                {formatMoney(
                                                                    projectMetrics.total_price,
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-emerald-700">
                                                                    Свободно:
                                                                </span>{' '}
                                                                {formatMoney(
                                                                    projectMetrics.free_price,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 align-top">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="px-3 py-2 rounded-xl bg-sky-50">
                                                                <div className="text-[11px] uppercase tracking-wide text-sky-700">
                                                                    Лиды
                                                                </div>
                                                                <div className="mt-1 text-sm font-semibold text-sky-800">
                                                                    {formatNumber(
                                                                        project.leads_count,
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="px-3 py-2 rounded-xl bg-emerald-50">
                                                                <div className="text-[11px] uppercase tracking-wide text-emerald-700">
                                                                    Клиенты
                                                                </div>
                                                                <div className="mt-1 text-sm font-semibold text-emerald-800">
                                                                    {formatNumber(
                                                                        project.clients_count,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={8} className="p-0">
                                                            <ProjectExpandedRow
                                                                project={project}
                                                                blocks={projectBlocks}
                                                            />
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
