import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { SalesOverviewUnit } from '../slices/salesObjOverviewSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatArea } from '@/utils/formatNumber';
import { Car, Check, ChevronDown, Home, Package, Pencil, Store } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { SalesUnitStatus } from '../slices/salesDictionariesSlice';
import { useEffect, useRef, useState } from 'react';

interface PropsType {
    units: SalesOverviewUnit[];
    refs: Record<string, ReferenceResult>;
    unitStatuses: SalesUnitStatus[];
    onStatusChange: (unitId: number, statusId: number) => void;
}

/*************************************************************************************************************************/
const lotTypeConfig = {
    apartment: {
        label: 'Кв',
        icon: Home,
        className: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    commercial: {
        label: 'Комм',
        icon: Store,
        className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    parking: {
        label: 'Парк',
        icon: Car,
        className: 'bg-slate-50 text-slate-600 border-slate-200',
    },
    storage: {
        label: 'Клад',
        icon: Package,
        className: 'bg-orange-50 text-orange-600 border-orange-200',
    },
} as const;
export default function ObjectsOverviewUnitsTable(props: PropsType) {
    const [statusPickerUnit, setStatusPickerUnit] = useState<SalesOverviewUnit | null>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Закрытие picker при клике вне
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setStatusPickerUnit(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-4">
            {/* Table - ObjectsOverviewTable*/}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* ObjectsOverviewTable- HEADER */}
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-xs font-semibold text-left text-blue-700 border-r bg-blue-50">
                                    №
                                </th>

                                {/* Расположение */}
                                <th className="px-4 py-3 text-center border-l bg-sky-50 whitespace-nowrap">
                                    <div className="text-xs font-semibold uppercase text-sky-600 ">
                                        Объект/Блок
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-sky-50 whitespace-nowrap">
                                    <div className="text-xs font-semibold uppercase text-sky-600 ">
                                        Кадастровый №
                                    </div>
                                </th>
                                {/* Лот */}
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase whitespace-nowrap">
                                        № лота
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Тип
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Код
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-600 uppercase">
                                        Этаж
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Комнаты
                                    </div>
                                </th>

                                {/* Площади */}
                                <th className="px-4 py-3 text-center border-l bg-indigo-50">
                                    <div className="text-xs font-semibold text-indigo-700 uppercase">
                                        Общая площадь
                                    </div>
                                </th>

                                {/* Стоимость */}
                                <th className="px-4 py-3 text-center border-l bg-green-50">
                                    <div className="text-xs font-semibold text-green-700 uppercase">
                                        Общая стоимость
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-green-50">
                                    <div className="text-xs font-semibold text-green-700 uppercase">
                                        Валюта
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-green-50">
                                    <div className="text-xs font-semibold text-green-700 uppercase whitespace-nowrap">
                                        Цена за м²
                                    </div>
                                </th>
                                {/* Статус */}
                                <th className="px-4 py-3 text-center border-l bg-purple-50">
                                    <div className="text-xs font-semibold text-purple-700 uppercase">
                                        Статус
                                    </div>
                                </th>

                                {/* Характеристики */}
                                <th className="px-4 py-3 text-center border-l bg-orange-50">
                                    <div className="text-xs font-semibold text-orange-700 uppercase">
                                        Тип отделки
                                    </div>
                                </th>

                                {/* Дополнительно */}
                                <th className="px-4 py-3 text-center border-l bg-yellow-50">
                                    <div className="text-xs font-semibold text-yellow-700 uppercase">
                                        Описание
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-yellow-50">
                                    <div className="text-xs font-semibold text-yellow-700 uppercase">
                                        Комментарий
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.units.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={17}
                                        className="py-12 text-sm text-center text-gray-500"
                                    >
                                        Нет соответствующих данных
                                    </td>
                                </tr>
                            ) : (
                                props.units.map((unt) => (
                                    <tr key={unt.id} className="text-xs">
                                        <td className="px-2 py-2 text-xs font-medium text-gray-700">
                                            {unt.id}
                                        </td>

                                        {/* Расположение */}
                                        <td className="px-2 py-2 text-sm text-left whitespace-nowrap">
                                            <div className="text-sm leading-none text-gray-800 whitespace-nowrap">
                                                {unt.project_name}
                                                <span className="ml-1 text-xs text-gray-500">
                                                    / {unt.block_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.cadastral_number ?? '-'}
                                        </td>
                                        {/* Лот */}
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.unit_number}
                                        </td>

                                        <td className="px-2 py-2 text-sm text-center">
                                            {(() => {
                                                const config =
                                                    lotTypeConfig[
                                                        unt.lot_type as keyof typeof lotTypeConfig
                                                    ];

                                                if (!config) return unt.lot_type;

                                                const Icon = config.icon;

                                                return (
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${config.className}`}
                                                    >
                                                        <Icon className="w-3 h-3" />
                                                        {config.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>

                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.plan_code && (
                                                <div className="font-mono text-xs text-gray-500">
                                                    {unt.plan_code}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.floor_number}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.rooms === 0 ? 'Студия' : `${unt.rooms} комн.`}
                                        </td>

                                        {/* Площади */}
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {formatArea(unt.area_total)}
                                        </td>

                                        {/* Стоимость */}
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.price_total}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.currency_code}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.price_per_m2
                                                ? formatCurrency(unt.price_per_m2)
                                                : '-'}
                                        </td>

                                        {/* Статус */}
                                        <td className="relative px-2 py-2 text-sm text-center whitespace-nowrap">
                                            <button
                                                onClick={() => setStatusPickerUnit(unt)}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium transition-opacity border rounded-full hover:opacity-80"
                                                style={{
                                                    color: unt.status_color,
                                                    borderColor: `${unt.status_color}80`,
                                                    backgroundColor: `${unt.status_color}20`,
                                                }}
                                            >
                                                {unt.status_name}
                                                <ChevronDown size={10} />
                                            </button>

                                            {/* Dropdown для смены статуса */}
                                            {statusPickerUnit?.id === unt.id && (
                                                <div
                                                    ref={pickerRef}
                                                    className="absolute z-50 w-48 mt-1 overflow-y-auto -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg left-1/2 max-h-60"
                                                >
                                                    <div className="p-2 space-y-1">
                                                        {props.unitStatuses.map((st) => (
                                                            <button
                                                                key={st.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    props.onStatusChange(
                                                                        unt.id,
                                                                        st.id,
                                                                    );
                                                                    setStatusPickerUnit(null);
                                                                }}
                                                                className="flex items-center w-full gap-2 px-3 py-2 text-xs text-left rounded hover:bg-gray-50"
                                                            >
                                                                <span
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: st.color,
                                                                    }}
                                                                />
                                                                <span className="text-gray-700">
                                                                    {st.name}
                                                                </span>
                                                                {unt.status_id === st.id && (
                                                                    <Check
                                                                        size={12}
                                                                        className="ml-auto text-sky-600"
                                                                    />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Характеристики */}
                                        <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                            {unt.finish_type ?? '-'}
                                        </td>

                                        {/* Дополнительно */}
                                        <td className="px-2 py-2 text-sm text-center">
                                            {unt.description ?? '-'}
                                        </td>

                                        <td className="px-2 py-2 text-sm text-center">
                                            {unt.comment ?? '-'}
                                        </td>

                                        {/* Действия */}
                                        <td className="px-2 py-2 text-sm text-center">
                                            <StyledTooltip title="Редактировать лот">
                                                <button
                                                    // onClick={() => setModal({ mode: 'edit', unt })}
                                                    className="
                                                                        p-1.5
                                                                        text-gray-400
                                                                        hover:text-blue-600
                                                                        hover:bg-blue-50
                                                                        rounded
                                                                        transition-colors
                                                                    "
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            </StyledTooltip>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
