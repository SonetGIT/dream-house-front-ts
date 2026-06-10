import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { SalesOverviewUnit } from '../slices/salesObjOverviewSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatArea } from '@/utils/formatNumber';
import { Car, Home, Package, Store } from 'lucide-react';

interface PropsType {
    units: SalesOverviewUnit[];
    refs: Record<string, ReferenceResult>;
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

                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.units.map((unt) => (
                                <tr key={unt.id} className="text-xs">
                                    <td className="px-2 py-2 text-xs font-medium text-gray-700">
                                        {unt.id}
                                    </td>

                                    {/* Расположение */}
                                    <td className="px-2 py-2 text-sm text-left whitespace-nowrap">
                                        <div className="text-sm leading-none text-gray-800">
                                            {unt.project_name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {unt.block_name}
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
                                        {unt.price_per_m2 ? formatCurrency(unt.price_per_m2) : '-'}
                                    </td>

                                    {/* Статус */}
                                    <td className="px-2 py-2 text-sm text-center whitespace-nowrap">
                                        <span
                                            className="px-2 py-1 text-xs font-medium border rounded-full"
                                            style={{
                                                color: unt.status_color,
                                                borderColor: `${unt.status_color}80`,
                                                backgroundColor: `${unt.status_color}20`,
                                            }}
                                        >
                                            {unt.status_name}
                                        </span>
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
                                    <td className="px-2 py-2 text-sm text-center">...</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
