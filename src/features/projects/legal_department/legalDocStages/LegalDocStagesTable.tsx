import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight, Package, Pencil, Trash2 } from 'lucide-react';
import { TableCell, TableRow } from '@mui/material';
import { formatDateTime } from '@/utils/formatDateTime';
import type { LegalDocStages } from './legalDocStageSlice';
import LegalDocTable from '../../legal_department/legalDoc/LegalDocTable';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

interface DocumentStagesTableProps {
    stages: LegalDocStages[];
    loading?: boolean;
    onEditStage: (stage: LegalDocStages) => void;
    onDeleteStageId: (id: number) => void;
    onDeleteSubStageId: (id: number, stageId: number) => void;
}

/* СПИСОК ЭТАПОВ ЮР. ОТДЕЛА ************************************************************************************************/
export default function LegalDocStagesTable({
    stages,
    loading = false,
    onEditStage,
    onDeleteStageId,
    onDeleteSubStageId,
}: DocumentStagesTableProps) {
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

    const toggleRow = (id: number) => {
        setExpandedRowId((prev) => (prev === id ? null : id));
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

    /******************************************************************************************************************/
    return (
        <div className="space-y-4">
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 bg-gray-50"></th>

                                <th className="px-4 py-3 text-left border-l bg-gray-50">
                                    <div className="text-xs text-blue-700 uppercase">
                                        Наименование
                                    </div>
                                </th>

                                <th className="px-4 py-3 text-left border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата создания
                                    </div>
                                </th>

                                <th className="px-3 py-3 text-left border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата обновления
                                    </div>
                                </th>

                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {stages?.length > 0 ? (
                                stages.map((stage) => {
                                    const isExpanded = expandedRowId === stage.id;

                                    return (
                                        <Fragment key={stage.id}>
                                            <tr
                                                className="transition-colors border-b hover:bg-gray-50"
                                                onClick={() => toggleRow(stage.id)}
                                            >
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        className="p-2 transition-colors rounded-md hover:bg-white/80 focus:outline-none"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleRow(stage.id);
                                                        }}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="inline w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="inline w-4 h-4" />
                                                        )}
                                                    </button>
                                                </td>

                                                <td className="text-[14px] text-gray-900 border-l border-gray-200 pl-2 pr-3 py-2.5">
                                                    {stage.name}
                                                </td>

                                                <td className="w-[200px] text-[14px] text-gray-700 border-l border-gray-200 px-3 py-2.5">
                                                    {formatDateTime(stage.created_at)}
                                                </td>

                                                <td className="w-[200px] text-[14px] text-gray-700 border-l border-gray-200 px-3 py-2.5">
                                                    {formatDateTime(stage.updated_at)}
                                                </td>

                                                <td className="px-4 py-3 border-l">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <StyledTooltip title="Редактировать этап">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEditStage(stage);
                                                                }}
                                                                className="
                                                                    p-1.5
                                                                    text-gray-400
                                                                    hover:text-blue-600
                                                                    hover:bg-blue-50
                                                                    rounded
                                                                    transition-colors
                                                                "
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        </StyledTooltip>

                                                        <StyledTooltip title="Удалить этап">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDeleteStageId(stage.id);
                                                                }}
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

                                            {isExpanded && (
                                                <tr className="bg-gray-50">
                                                    <td className="border-b border-gray-200 w-9" />
                                                    <td
                                                        colSpan={4}
                                                        className="px-5 py-4 border-b border-gray-200"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="ml-3">
                                                            <LegalDocTable
                                                                entityType="document_stage"
                                                                entityId={stage.id}
                                                                onDeleteSubStageId={
                                                                    onDeleteSubStageId
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
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
