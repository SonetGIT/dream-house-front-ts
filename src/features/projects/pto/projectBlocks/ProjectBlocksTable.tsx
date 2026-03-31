import { Trash2, Pencil } from 'lucide-react';
import { type ProjectBlock } from './projectBlocksSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { useNavigate } from 'react-router-dom';

interface Props {
    prjBlocks: ProjectBlock[];
    onEdit: (block: ProjectBlock) => void;
    onDelete: (id: number) => void;
}

export default function ProjectBlocksTable({ prjBlocks, onEdit, onDelete }: Props) {
    const navigate = useNavigate();
    const handlePrjBlocksRowClick = (prjblock: ProjectBlock) => {
        navigate(`/projects/${prjblock.project_id}/prjBlocks/${prjblock.id}`, {
            state: { prjblock },
        });
    };

    /********************************************************************************************************/
    return (
        <div className="space-y-4">
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-3 py-3 text-sm font-semibold text-center text-blue-700 bg-blue-50">
                                    №
                                </th>
                                <th className="px-4 py-3 text-left border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Название
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        План бюджет (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Площадь (м²)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Прогресс
                                    </div>
                                </th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {prjBlocks.map((block, index) => (
                                <tr
                                    key={block.id}
                                    className="transition-colors hover:bg-sky-50/50 group"
                                    onClick={() => handlePrjBlocksRowClick(block)}
                                >
                                    <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                            {block.name}
                                        </div>
                                    </td>

                                    <td className="px-3 py-2 text-center text-blue-600">
                                        {block.planned_budget?.toLocaleString()}
                                    </td>

                                    <td className="px-3 py-2 text-center">{block.total_area}</td>

                                    <td className="px-3 py-2 text-center">
                                        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                                            {block.progress_percent ?? 0}%
                                        </span>
                                    </td>

                                    {/* Действия */}
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <StyledTooltip title="Редактировать">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(block);
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
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                            </StyledTooltip>
                                            <StyledTooltip title="Удалить">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(block.id);
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
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </StyledTooltip>
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
