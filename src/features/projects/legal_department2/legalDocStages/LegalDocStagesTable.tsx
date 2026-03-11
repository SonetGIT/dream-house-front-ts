import { useState } from 'react';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { TableCell, TableRow } from '@mui/material';
import { formatDateTime } from '@/utils/formatDateTime';
import type { LegalDocStages } from './legalDocStageSlice';
import LegalDocTable from '../legalDoc/LegalDocTable';
interface DocumentStagesTableProps {
    stages: LegalDocStages[];
    loading?: boolean;
}

/*СПИСОК ЭТАПОВ ЮР. ОТДЕЛА************************************************************************************************/
export default function LegalDocStagesTable({ stages, loading = false }: DocumentStagesTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (id: number) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-center h-96">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
                        <p className="text-sm font-medium text-gray-600">Загрузка этапов...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Table - ESTIMATES*/}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                {/* Chevron col */}
                                <th className="w-12 px-4 py-3 bg-gray-50"></th>

                                {/* Name */}
                                <th className="px-4 py-3 text-left border-l bg-gray-50">
                                    <div className="text-xs text-blue-700 uppercase">
                                        Наименование
                                    </div>
                                </th>

                                {/* Start */}
                                <th className="px-4 py-3 text-left border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата создания
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата обновления
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {stages?.length > 0 ? (
                                stages.map((stage) => (
                                    <>
                                        <tr
                                            key={stage.id}
                                            className="transition-colors border-b hover:bg-gray-50"
                                            onClick={() => toggleRow(stage.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    className="p-2 transition-colors rounded-md hover:bg-white/80 focus:outline-none"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // чтобы не сработал клик строки
                                                        toggleRow(stage.id);
                                                    }}
                                                >
                                                    {expandedRows.has(stage.id) ? (
                                                        <ChevronDown className="inline w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="inline w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                            {/* Name */}
                                            <td className="text-[14px] text-gray-900 border-l border-gray-200 pl-2 pr-3 py-2.5">
                                                {stage.name}
                                            </td>
                                            <td className="w-[200px] text-[14px] text-gray-700 border-l border-gray-200 px-3 py-2.5">
                                                {formatDateTime(stage.created_at)}
                                            </td>
                                            <td className="w-[200px] text-[14px] text-gray-700 border-l border-gray-200 px-3 py-2.5">
                                                {formatDateTime(stage.updated_at)}
                                            </td>
                                            {/* Stage Actions */}
                                        </tr>

                                        {/* Раскрываемая строка с вложенной таблицей документов */}
                                        {expandedRows.has(stage.id) && (
                                            <tr className="bg-gray-50">
                                                <td className="border-b border-gray-200 w-9" />
                                                <td
                                                    colSpan={5}
                                                    className="px-5 py-4 border-b border-gray-200"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="ml-3">
                                                        <LegalDocTable
                                                            entityType={'document_stage'}
                                                            entityId={stage.id}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Package className="w-16 h-16 text-gray-300" />
                                            <div>
                                                <p className="mb-1 text-sm font-semibold text-gray-900">
                                                    Этапы не найдены
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Попробуйте изменить параметры поиска
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
