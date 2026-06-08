import React, { useState } from 'react';
import { Collapse } from '@mui/material';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type {
    SalesOverviewBlock,
    SalesOverviewProject,
    SalesOverviewUnit,
} from '../slices/salesObjOverviewSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatArea } from '@/utils/formatNumber';
import ObjectsOverviewBlockTable from '../objectsOverview/ObjectsOverviewBlockTable';
import TypeChips from '@/components/ui/TypeChips';
import UnitStat from '@/components/ui/UnitStat';
import UnitBar from '@/components/ui/UnitBar';

interface PropsType {
    units: SalesOverviewUnit[];
    refs: Record<string, ReferenceResult>;
}
const prjStatuses: Record<number, { label: string; className: string }> = {
    1: {
        label: 'На одобрении',
        className: 'bg-violet text-violet-800 border-violet-200',
    },
    2: {
        label: 'Одобрена',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    3: {
        label: 'На исполнении',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    4: {
        label: 'Исполнена',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    5: {
        label: 'Отменена',
        className: 'bg-red-100 text-red-800 border-red-200',
    },
};

/*************************************************************************************************************************/
export default function ObjectsOverviewUnitsTable(props: PropsType) {
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    /*TOGGLE*/
    const toggleRow = (id: number) => {
        const isOpening = !openRows[id];

        // 1. сначала обновляем state
        setOpenRows((prev) => ({
            ...prev,
            [id]: isOpening,
        }));

        // 2. потом dispatch
        // if (isOpening) {
        //     dispatch(
        //         fetchMaterialprjuestItems({
        //             material_prjuest_id: id,
        //             page: 1,
        //             size: 10,
        //         }),
        //     );
        // }
    };

    /*STATUS************************************************************************************************************/
    const getStatusConfig = (statusId: number) => {
        return (
            prjStatuses[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };

    /********************************************************************************************************************************/
    return (
        <div className="space-y-4">
            {/* Table - ObjectsOverviewTable*/}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* ObjectsOverviewTable- HEADER */}
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-left bg-blue-50"></th>
                                <th className="w-12 px-3 py-3 text-sm font-semibold text-left text-blue-700 bg-blue-50">
                                    №
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Объект
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Адрес
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Блоки
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Лоты
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Типы лотов
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Финансы
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Лиды / Клиенты
                                    </div>
                                </th>

                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.units.map((unt) => (
                                <tr key={unt.id}>
                                    <td className="px-2 py-2 text-xs font-medium text-gray-700">
                                        {unt.id}
                                    </td>

                                    <td className="px-2 py-2 border-l">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {unt.lot_type === 'apartment'
                                                        ? 'Квартира'
                                                        : unt.lot_type === 'commercial'
                                                          ? 'Коммерция'
                                                          : unt.lot_type === 'parking'
                                                            ? 'Паркинг'
                                                            : unt.lot_type === 'storage'
                                                              ? 'Кладовая'
                                                              : unt.lot_type}{' '}
                                                    №{unt.unit_number}
                                                </span>

                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                                                    style={{ backgroundColor: unt.status_color }}
                                                >
                                                    {unt.status_name}
                                                </span>
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                {unt.project_name} · {unt.block_name}
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                Этаж: {unt.floor_number}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-2 py-2 text-center">
                                        <div className="text-sm font-medium text-gray-700">
                                            {unt.rooms === 0 ? 'Студия' : `${unt.rooms} комн.`}
                                        </div>
                                    </td>

                                    <td className="px-2 py-2 text-center">
                                        <div className="text-sm font-medium text-sky-600">
                                            {formatArea(unt.area_total)}
                                        </div>
                                    </td>

                                    <td className="px-2 py-2 text-center">
                                        <div className="text-sm text-gray-700">
                                            {unt.currency_code}
                                        </div>
                                    </td>

                                    <td className="px-2 py-2">
                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-500">
                                                Общая стоимость
                                            </div>

                                            <div className="text-sm font-semibold text-emerald-700">
                                                {formatCurrency(unt.price_total)}
                                            </div>

                                            {unt.price_per_m2 && (
                                                <div className="text-xs text-gray-500">
                                                    {formatCurrency(unt.price_per_m2)} / м²
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
