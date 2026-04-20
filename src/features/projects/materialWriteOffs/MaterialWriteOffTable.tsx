import React, { useState } from 'react';
import { Collapse } from '@mui/material';
import { ChevronDown, ChevronRight, Pencil, Trash2, ListChecks } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { MaterialWriteOff } from './materialWriteOffSlice';
import { writeOffStatuses } from '@/utils/getStatusColor';
import { formatDate } from '@/utils/formatData';
import { formatDateTime } from '@/utils/formatDateTime';
import { TabBtn } from '../pto/workPerformed/WorkPerformedTable';
import type { Pagination } from '@/features/users/userSlice';
import { TablePagination } from '@/components/ui/TablePagination';

interface MaterialWriteOffTableProps {
    data: MaterialWriteOff[];
    refs: Record<string, ReferenceResult>;
    loading?: boolean;
    pagination?: Pagination | null;
    onPageChange?: (page: number) => void;
    onSizeChange?: (size: number) => void;
    // onEdit: (item: MaterialWriteOff) => void;
    // onDelete: (id: number) => void;
}

export default function MaterialWriteOffTable({
    data,
    refs,
    loading = false,
    pagination = null,
    onPageChange,
    onSizeChange,
    // onEdit,
    // onDelete,
}: MaterialWriteOffTableProps) {
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const getStatusConfig = (statusId: number) => {
        return (
            writeOffStatuses[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };

    if (loading) {
        return (
            <div className="w-full p-4 overflow-hidden text-sm text-gray-500 bg-white border rounded-xl">
                Загрузка...
            </div>
        );
    }

    /************************************************************************************************************************/
    return (
        <div className="space-y-4">
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="px-1 py-1 text-left bg-blue-50"></th>

                                <th className="px-1 py-1 text-sm font-semibold text-left text-violet-700 bg-blue-50">
                                    №
                                </th>

                                <th className="px-1 py-1 text-center border-l bg-violet-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Статус
                                    </div>
                                </th>

                                <th className="px-1 py-1 text-center border-l bg-violet-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Блок
                                    </div>
                                </th>

                                <th className="px-1 py-1 text-center border-l bg-violet-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Склад
                                    </div>
                                </th>

                                <th className="px-1 py-1 text-center border-l bg-violet-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        АВР
                                    </div>
                                </th>

                                <th className="px-1 py-1 text-center border-l bg-violet-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Выполненная работа
                                    </div>
                                </th>
                                <th className="px-1 py-1 text-center border-l bg-violet-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Дата списания
                                    </div>
                                </th>
                                <th className="px-1 py-1 text-center border-l bg-violet-50">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Примечание
                                    </div>
                                </th>

                                <th className="px-1 py-1  text-center border-l bg-violet-50 w-[760px]">
                                    <div className="text-xs font-semibold uppercase text-violet-700">
                                        Этап подписи
                                    </div>
                                </th>

                                <th className="px-1 py-1 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {data?.map((writeOff) => {
                                const statusInfo = getStatusConfig(writeOff.status);

                                const signatures = [
                                    {
                                        label: 'Прораб',
                                        userId: writeOff.foreman_user_id,
                                        approved: writeOff.signed_by_foreman,
                                        approvedTime: writeOff.signed_by_foreman_time,
                                    },
                                    {
                                        label: 'Инженер ПТО',
                                        userId: writeOff.planning_engineer_user_id,
                                        approved: writeOff.signed_by_planning_engineer,
                                        approvedTime: writeOff.signed_by_planning_engineer_time,
                                    },
                                    {
                                        label: 'Гл. инженер',
                                        userId: writeOff.main_engineer_user_id,
                                        approved: writeOff.signed_by_main_engineer,
                                        approvedTime: writeOff.signed_by_main_engineer_time,
                                    },
                                    {
                                        label: 'Ген. директор',
                                        userId: writeOff.general_director_user_id,
                                        approved: writeOff.signed_by_general_director,
                                        approvedTime: writeOff.signed_by_general_director_time,
                                    },
                                ];

                                return (
                                    <React.Fragment key={writeOff.id}>
                                        <tr
                                            className="transition-colors border-b hover:bg-gray-50"
                                            onClick={() => toggleRow(writeOff.id)}
                                        >
                                            <td className="px-2 py-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(writeOff.id);
                                                    }}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {openRows[writeOff.id] ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>

                                            <td className="px-2 py-2 text-xs font-medium text-left text-gray-700 bg-violet-40/20">
                                                {writeOff.id}
                                            </td>

                                            <td className="px-2 py-2 text-center text-gray-900">
                                                <span
                                                    className={`
                                                        inline-flex text-center px-2 py-0.5
                                                        text-xs font-semibold border rounded-full
                                                        ${statusInfo.className}
                                                    `}
                                                >
                                                    {refs.materialWriteOffStatuses?.lookup?.(
                                                        Number(writeOff.status),
                                                    ) || statusInfo.label}
                                                </span>
                                            </td>

                                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-700 bg-blue-40/20">
                                                {refs.projectBlocks?.lookup?.(
                                                    Number(writeOff.block_id),
                                                ) || statusInfo.label}
                                            </td>

                                            <td className="px-2 py-2 text-xs font-medium text-center text-gray-700">
                                                {refs.warehouses?.lookup?.(
                                                    Number(writeOff.warehouse_id),
                                                ) || statusInfo.label}
                                            </td>

                                            <td className="px-2 py-2 text-xs text-center text-gray-900">
                                                {`Акт №${writeOff.work_performed_id}`}
                                            </td>
                                            <td className="px-2 py-2 text-xs text-center text-gray-900">
                                                {refs.services?.lookup?.(
                                                    Number(
                                                        writeOff.work_performed_item?.service_id,
                                                    ),
                                                ) || statusInfo.label}
                                            </td>

                                            <td className="px-2 py-2 text-xs text-center text-gray-900">
                                                {formatDate(writeOff.write_off_date)}
                                            </td>
                                            <td className="px-2 py-2 text-xs text-center text-gray-900">
                                                {writeOff.note || '---'}
                                            </td>
                                            <td className="px-2 py-2 pl-2 text-sm text-center text-gray-900">
                                                <div className="grid grid-cols-4 gap-3 text-xs items-left">
                                                    {signatures.map((signature) => (
                                                        <div
                                                            key={signature.label}
                                                            className="space-y-0.5 text-left"
                                                        >
                                                            <div className="flex items-center gap-1 pl-1 font-medium text-gray-700">
                                                                <span className="space-y-0.5 text-left min-w-0 text-xs">
                                                                    {signature.label}
                                                                </span>
                                                            </div>

                                                            <div className="text-[0.75rem] text-gray-500 italic truncate pl-1">
                                                                {signature.userId
                                                                    ? refs.users.lookup(
                                                                          signature.userId,
                                                                      )
                                                                    : '—'}
                                                            </div>

                                                            <div
                                                                className={`text-[0.75rem] pl-1 whitespace-nowrap ${
                                                                    signature.approved
                                                                        ? 'text-green-600'
                                                                        : signature.approved ===
                                                                            false
                                                                          ? 'text-red-500'
                                                                          : 'text-gray-400'
                                                                }`}
                                                            >
                                                                {signature.approved === true
                                                                    ? `✔ ${formatDateTime(
                                                                          signature.approvedTime,
                                                                      )}`
                                                                    : signature.approved === false
                                                                      ? `✖ ${formatDateTime(
                                                                            signature.approvedTime,
                                                                        )}`
                                                                      : '⏳ Ожидает'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="px-3 py-2 border-l bg-gray-50">
                                                <div className="flex items-center justify-center">
                                                    <StyledTooltip title="Удалить">
                                                        <button
                                                            type="button"
                                                            // onClick={(e) => {
                                                            //     e.stopPropagation();
                                                            //     onDelete(writeOff.id);
                                                            // }}
                                                            className="
                                                                p-1.5
                                                                text-gray-400
                                                                hover:text-red-600
                                                                hover:bg-red-50
                                                                rounded
                                                                transition-colors
                                                            "
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </StyledTooltip>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr className="border-b bg-gradient-to-r to-blue-50/50">
                                            <td colSpan={9} className="px-3 py-2">
                                                <Collapse in={openRows[writeOff.id]} unmountOnExit>
                                                    <div className="px-3 py-2">
                                                        <div className="flex items-center gap-0 mb-3 border-b border-gray-200">
                                                            <TabBtn
                                                                active
                                                                icon={
                                                                    <ListChecks className="w-3.5 h-3.5" />
                                                                }
                                                                label="Материалы"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>

                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                                                                <table className="w-full">
                                                                    <thead className="text-gray-700 bg-gray-50">
                                                                        <tr className="border-b">
                                                                            <th className="w-12 px-3 py-3 text-sm font-semibold text-left">
                                                                                №
                                                                            </th>
                                                                            <th className="px-3 py-2 text-sm text-left">
                                                                                Материал
                                                                            </th>
                                                                            <th className="w-32 px-3 py-2 text-sm text-center">
                                                                                Ед. изм
                                                                            </th>
                                                                            <th className="w-32 px-3 py-2 text-sm text-right">
                                                                                Кол-во
                                                                            </th>
                                                                            <th className="px-3 py-2 text-sm text-left">
                                                                                Примечание
                                                                            </th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        {writeOff.items?.map(
                                                                            (item, index) => (
                                                                                <tr
                                                                                    key={item.id}
                                                                                    className="border-b bg-blue-50/40 hover:bg-gray-50"
                                                                                >
                                                                                    <td className="px-2 py-2 text-xs font-medium text-gray-600">
                                                                                        {index + 1}
                                                                                    </td>

                                                                                    <td className="px-2 py-2 text-sm text-gray-800">
                                                                                        {item.material_id
                                                                                            ? refs.materials.lookup(
                                                                                                  item.material_id,
                                                                                              )
                                                                                            : '—'}
                                                                                    </td>

                                                                                    <td className="px-2 py-2 text-sm text-center text-gray-700">
                                                                                        {item.unit_of_measure
                                                                                            ? refs.unitsOfMeasure.lookup(
                                                                                                  item.unit_of_measure,
                                                                                              )
                                                                                            : '—'}
                                                                                    </td>

                                                                                    <td className="px-2 py-2 font-bold text-right text-green-700">
                                                                                        {
                                                                                            item.quantity
                                                                                        }
                                                                                    </td>
                                                                                    {/* <td className="px-2 py-2 text-sm text-center text-gray-700">
                                                                                        {item.movement_id
                                                                                            ? refs.materialMovementStatuses.lookup(
                                                                                                  item.movement_id,
                                                                                              )
                                                                                            : '—'}
                                                                                    </td> */}

                                                                                    <td className="px-2 py-2 text-sm text-gray-600">
                                                                                        {item.note ||
                                                                                            '—'}
                                                                                    </td>
                                                                                </tr>
                                                                            ),
                                                                        )}

                                                                        {!writeOff.items
                                                                            ?.length && (
                                                                            <tr>
                                                                                <td
                                                                                    colSpan={5}
                                                                                    className="px-3 py-8 text-sm text-center text-gray-400"
                                                                                >
                                                                                    Нет материалов
                                                                                    для списания
                                                                                </td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                            {!data?.length && (
                                <tr>
                                    <td colSpan={9} className="py-20 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                                            <ListChecks className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="mb-1 text-base font-medium text-gray-900">
                                            Списания материалов отсутствуют
                                        </h3>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                onPageChange?.(newPage);
                            }}
                            onSizeChange={(newSize) => {
                                onSizeChange?.(newSize);
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
