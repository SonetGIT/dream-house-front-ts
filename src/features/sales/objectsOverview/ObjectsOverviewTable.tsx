import React, { useState } from 'react';
import { Button, Collapse } from '@mui/material';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { SalesOverviewBlock, SalesOverviewProject } from '../slices/salesObjOverviewSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatArea } from '@/utils/formatNumber';
import ObjectsOverviewBlockTable from './ObjectsOverviewBlockTable';
import TypeChips from '@/components/ui/TypeChips';
import UnitStat from '@/components/ui/UnitStat';
import UnitBar from '@/components/ui/UnitBar';
import { prjStatuses } from '@/utils/getStatusColor';
import { Add } from '@mui/icons-material';

interface PropsType {
    projects: SalesOverviewProject[];
    blocks: SalesOverviewBlock[];
    refs: Record<string, ReferenceResult>;
}

/*************************************************************************************************************************/
export default function ObjectsOverviewTable(props: PropsType) {
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    /*TOGGLE*/
    const toggleRow = (id: number) => {
        const isOpening = !openRows[id];

        // 1. сначала обновляем state
        setOpenRows((prev) => ({
            ...prev,
            [id]: isOpening,
        }));
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

                                {/* <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {props.projects?.map((prj) => {
                                const statusInfo = getStatusConfig(prj.status);

                                return (
                                    <React.Fragment key={prj.id}>
                                        {/* ObjectsOverviewTable */}
                                        <tr
                                            className="transition-colors border-b hover:bg-gray-50"
                                            onClick={() => toggleRow(prj.id)}
                                        >
                                            {/* toggle */}
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(prj.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[prj.id] ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-2 py-2 text-xs font-medium text-left text-gray-700 bg-blue-40/20">
                                                {prj.id}
                                            </td>

                                            {/* статус / наименование / дата*/}
                                            <td className="px-2 py-2 text-left align-top border-l">
                                                <div className="flex flex-col gap-2">
                                                    {/* Название + Статус в одной строке */}
                                                    <div className="flex items-start gap-2">
                                                        {prj.status != null && (
                                                            <span
                                                                className={`
                                                                    inline-flex items-center px-2 py-0.5
                                                                    text-xs font-medium border rounded-full whitespace-nowrap
                                                                    ${statusInfo.className}
                                                                `}
                                                            >
                                                                {props.refs.projectStatuses.lookup(
                                                                    prj.status,
                                                                )}
                                                            </span>
                                                        )}
                                                        <span className="flex-1 text-sm font-semibold text-gray-700">
                                                            {prj.name}
                                                        </span>
                                                    </div>
                                                    {/* Площадь */}
                                                    <div className="text-xs text-gray-500">
                                                        Общая площадь:{' '}
                                                        <span className="text-xs text-sky-600">
                                                            {formatArea(prj.total_area)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 text-xs text-left align-top">
                                                {prj.address != null ? prj.address : '—'}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-center align-top">
                                                {prj.blocks_count != null ? prj.blocks_count : '—'}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-center text-gray-900 ">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <UnitStat
                                                        label="Всего"
                                                        count={prj.total_units}
                                                        color="text-gray-700"
                                                    />
                                                    <UnitStat
                                                        label="Своб"
                                                        count={prj.free_units}
                                                        color="text-emerald-600"
                                                    />
                                                    <UnitStat
                                                        label="Резв"
                                                        count={prj.reserved_units}
                                                        color="text-amber-500"
                                                    />
                                                    <UnitStat
                                                        label="Прод"
                                                        count={prj.sold_units}
                                                        color="text-sky-600"
                                                    />
                                                    <UnitStat
                                                        label="Офф"
                                                        count={prj.offmarket_units}
                                                        color="text-gray-400"
                                                    />
                                                </div>
                                                <UnitBar
                                                    total={prj.total_units}
                                                    free={prj.free_units}
                                                    reserved={prj.reserved_units}
                                                    sold={prj.sold_units}
                                                    off={prj.offmarket_units}
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-sm text-center text-gray-900">
                                                <TypeChips
                                                    apt={prj.apartments}
                                                    com={prj.commercial_units}
                                                    park={prj.parking_units}
                                                    stor={prj.storage_units}
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-left space-y-0.5">
                                                <div className="text-xs text-gray-600 ">
                                                    Своб фонд:{' '}
                                                    <span className="text-sm font-medium text-violet-600">
                                                        {formatCurrency(prj.free_price)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 ">
                                                    Продано:{' '}
                                                    <span className="text-sm font-medium text-sky-600">
                                                        {formatCurrency(prj.sold_price)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 ">
                                                    Резерв:{' '}
                                                    <span className="text-sm font-medium text-amber-500">
                                                        {formatCurrency(prj.reserved_price)}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-bold text-gray-600 ">
                                                    Итого:{' '}
                                                    <span className="text-sm font-medium text-emerald-700">
                                                        {formatCurrency(prj.total_price)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2 text-center space-y-0.5">
                                                <div className="text-xs text-gray-600 ">
                                                    Лиды:{' '}
                                                    <span className="text-sm font-medium text-violet-600">
                                                        {prj.leads_count}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 ">
                                                    Клиенты:{' '}
                                                    <span className="text-sm font-medium text-sky-600">
                                                        {prj.clients_count}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ObjectsOverviewBlockTable*/}
                                        <tr className="border-b bg-gradient-to-r to-blue-50/50">
                                            <td colSpan={10} className="px-4 py-2">
                                                <Collapse in={openRows[prj.id]} unmountOnExit>
                                                    <div className="px-4 py-2">
                                                        <div className="flex items-center justify-between py-2 border-b-2 border-blue-600">
                                                            <p className="text-sm font-medium text-blue-600">
                                                                Блоки
                                                            </p>

                                                            <button
                                                                // variant="outlined"
                                                                className="inline-flex items-center w-16 h-8 text-sm font-medium text-center text-white transition rounded-lg border-fuchsia-700 bg-fuchsia-600 hover:bg-fuchsia-700 hover:text-white"
                                                                // startIcon={<Add />}
                                                            >
                                                                + Этаж
                                                            </button>
                                                        </div>
                                                        {/* </div> */}
                                                        <ObjectsOverviewBlockTable
                                                            blocks={props.blocks.filter(
                                                                (b) => b.project_id === prj.id,
                                                            )}
                                                        />
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
