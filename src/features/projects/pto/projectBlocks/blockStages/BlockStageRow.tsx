import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Pencil, PlusCircle, Trash2, X } from 'lucide-react';

import { useAppDispatch, useAppSelector, type RootAppState } from '@/app/store';
import {
    createStageSubsection,
    fetchStageSubsections,
    updateStageSubsection,
    type StageSubsection,
} from './subStages/stageSubsectionsSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { BlockStage } from './blockStagesSlice';
import toast from 'react-hot-toast';
import { fetchEnum } from '@/features/reference/referenceSlice';

interface BlockStageRowProps {
    stage: BlockStage;
    onEditStage: (stage: BlockStage) => void;
    onDeleteStageId: (id: number) => void;
    onDeleteSubStageId: (id: number, stageId: number) => void;
}

/******************************************************************************************************************************/
export default function BlockStageRow({
    stage,
    onEditStage,
    onDeleteStageId,
    onDeleteSubStageId,
}: BlockStageRowProps) {
    const dispatch = useAppDispatch();

    const EMPTY: StageSubsection[] = [];
    const selectSubStagesByStageId = (state: RootAppState, stageId: number) =>
        state.stageSubsections.byStageId[stageId] ?? EMPTY;
    const subStages = useAppSelector((s) => selectSubStagesByStageId(s, stage.id));

    // const loading = useAppSelector((s) => s.stageSubsections.loadingByStageId[stage.id]);

    const [expanded, setExpanded] = useState(false);
    const [isAddingSubstage, setIsAddingSubstage] = useState(false);
    const [newSubstageName, setNewSubstageName] = useState('');
    const [editingSubstageId, setEditingSubstageId] = useState<number | null>(null);
    const [editingSubstageName, setEditingSubstageName] = useState('');

    useEffect(() => {
        if (expanded && subStages.length === 0) {
            dispatch(
                fetchStageSubsections({
                    stage_id: stage.id,
                    page: 1,
                    size: 10,
                }),
            ).unwrap();
            dispatch(fetchEnum('stageSubsections'));
        }
    }, [expanded]);

    // Функция подсчёта дней между датами/
    function diffDays(start?: string, end?: string) {
        if (!start || !end) return '';

        const startDate = new Date(start);
        const endDate = new Date(end);

        const diff = endDate.getTime() - startDate.getTime();

        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    const handleAddSubstage = () => {
        if (newSubstageName.trim()) {
            dispatch(
                createStageSubsection({
                    name: newSubstageName.trim(),
                    stage_id: stage.id,
                }),
            ).unwrap();
            dispatch(fetchEnum('stageSubsections'));
            setNewSubstageName('');
            setIsAddingSubstage(false);
        }
    };

    const handleCancelAdd = () => {
        setNewSubstageName('');
        setIsAddingSubstage(false);
    };
    const handleEditSubstage = (sub: StageSubsection) => {
        setEditingSubstageId(sub.id);
        setEditingSubstageName(sub.name);
    };

    const handleSaveEdit = async () => {
        if (!editingSubstageName.trim() || editingSubstageId === null) return;

        try {
            await dispatch(
                updateStageSubsection({
                    id: editingSubstageId,
                    data: {
                        name: editingSubstageName.trim(),
                        stage_id: stage.id,
                    },
                }),
            ).unwrap();

            toast.success('Подэтап обновлен');

            setEditingSubstageId(null);
            setEditingSubstageName('');
        } catch {
            toast.error('Ошибка обновления');
        }
    };

    const handleCancelEdit = () => {
        setEditingSubstageId(null);
        setEditingSubstageName('');
    };

    /**************************************************************************************************************************/
    return (
        <>
            <tr
                className="transition-colors border-b hover:bg-gray-50"
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Chevron */}
                <td className="px-4 py-3">
                    {expanded ? (
                        <ChevronDown className="inline w-4 h-4" />
                    ) : (
                        <ChevronRight className="inline w-4 h-4" />
                    )}
                </td>

                {/* Name */}
                <td className="text-[14px] text-gray-900 border-l border-gray-200 pl-2 pr-3 py-2.5">
                    {stage.name}
                </td>

                {/* Start */}
                <td className="w-[200px] text-[14px] text-gray-700 border-l border-gray-200 px-3 py-2.5">
                    {formatDateTime(stage.start_date)}
                </td>

                {/* End */}
                <td className="w-[200px] text-[14px] text-gray-700 border-l border-gray-200 px-3 py-2.5">
                    {formatDateTime(stage.end_date)}
                </td>

                {/* Duration */}
                <td
                    className="w-[180px] text-[14px] text-red-500 font-medium text-center border-l border-gray-200 px-3 py-2.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {diffDays(stage.start_date, stage.end_date)} дн.
                </td>

                {/* Stage Actions */}
                <td className="px-4 py-3 border-l">
                    <div className="flex items-center justify-center gap-2">
                        <StyledTooltip title="Редактировать этап">
                            <button
                                onClick={onEditStage.bind(null, stage)}
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

            {/* Подэтапы */}
            {expanded && (
                <tr className="bg-gray-50">
                    <td className="border-b border-gray-200 w-9" />
                    <td
                        colSpan={5}
                        className="px-5 py-4 border-b border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="ml-3">
                            {/* Substages header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Подэтапы
                                </div>
                                {!isAddingSubstage && (
                                    <button
                                        onClick={() => setIsAddingSubstage(true)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-all rounded-lg shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-md"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Добавить подэтап
                                    </button>
                                )}
                            </div>

                            {/* SubStage list - ПОДЭТАПЫ */}
                            <div className="flex flex-col gap-2">
                                {subStages.map((sub, idx) =>
                                    // Если этот подэтап редактируется, показываем форму редактирования
                                    editingSubstageId === sub.id ? (
                                        <div
                                            key={sub.id}
                                            className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-md border-2 border-sky-400 shadow-md text-[13px]"
                                        >
                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={editingSubstageName}
                                                onChange={(e) =>
                                                    setEditingSubstageName(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit();
                                                    if (e.key === 'Escape') handleCancelEdit();
                                                }}
                                                autoFocus
                                                className="flex-1 border-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400"
                                            />
                                            <div className="flex flex-shrink-0 gap-1">
                                                <StyledTooltip title="Сохранить">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="p-1.5 text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                </StyledTooltip>
                                                <StyledTooltip title="Отменить (Esc)">
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        <X className="w-5 h-5 text-red-500" />
                                                    </button>
                                                </StyledTooltip>
                                            </div>
                                        </div>
                                    ) : (
                                        // Обычное отображение подэтапа
                                        <div
                                            key={sub.id}
                                            className="group/substage flex items-center justify-between px-3.5 py-2.5 bg-white rounded-md border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all text-[13px]"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-gray-700">{sub.name}</span>
                                            </div>

                                            <div className="flex items-center gap-1 transition-opacity opacity-0 group-hover/substage:opacity-100">
                                                {/* SubStage Actions */}
                                                <StyledTooltip title="Редактировать подэтап">
                                                    <button
                                                        onClick={() => handleEditSubstage(sub)}
                                                        className="
                                                            p-1.5
                                                            text-gray-400
                                                            hover:text-blue-600
                                                            hover:bg-blue-50
                                                            rounded
                                                            transition-colors
                                                        "
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                </StyledTooltip>
                                                <StyledTooltip title="Удалить подэтап">
                                                    <button
                                                        onClick={() =>
                                                            onDeleteSubStageId(sub.id, stage.id)
                                                        }
                                                        className="
                                                            p-1.5
                                                            text-gray-400
                                                            hover:text-red-600
                                                            hover:bg-red-50
                                                            rounded
                                                            transition-colors
                                                        "
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </StyledTooltip>
                                            </div>
                                        </div>
                                    ),
                                )}

                                {/* Empty state */}
                                {subStages.length === 0 && !isAddingSubstage && (
                                    <div className="py-5 text-center text-gray-400 text-[13px] italic">
                                        Нет подэтапов
                                    </div>
                                )}

                                {/* Add substage form */}
                                {isAddingSubstage && (
                                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white rounded-md border-2 border-indigo-300 shadow-sm text-[13px]">
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold flex-shrink-0">
                                            {subStages.length + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={newSubstageName}
                                            onChange={(e) => setNewSubstageName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddSubstage();
                                                if (e.key === 'Escape') handleCancelAdd();
                                            }}
                                            placeholder="Введите название подэтапа..."
                                            autoFocus
                                            className="flex-1 border-none outline-none text-[13px] text-gray-700 placeholder:text-gray-400"
                                        />
                                        <div className="flex flex-shrink-0 gap-1">
                                            <button
                                                onClick={handleAddSubstage}
                                                className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                                                title="Сохранить"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={handleCancelAdd}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                title="Отменить"
                                            >
                                                <X className="w-5 h-5 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
