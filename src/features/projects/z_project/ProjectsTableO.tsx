import { LinearProgress } from '@mui/material';
import type { Project } from './projectsSliceo';
import { useNavigate } from 'react-router-dom';
import type { Pagination } from '../../users/userSlice';
import { TablePagination } from '@/components/ui/TablePagination';
import type { ReferenceResult } from '../../reference/referenceSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { Pencil, Trash2 } from 'lucide-react';

interface PropsType {
    items: Project[];
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    onPrevPage: () => void;
    onNextPage: () => void;
    onEdit: (project: Project) => void;
    onDelete: (id: number) => void;
    refs: Record<string, ReferenceResult>;
}

/*******************************************************************************************************************************/
export default function ProjectsTable(props: PropsType) {
    const navigate = useNavigate();
    const handleRowClick = (project: Project) => {
        navigate(`/projects/${project.id}`, { state: { project } });
    };

    return (
        <div className="table-container">
            {props.loading && (
                <LinearProgress
                    style={{
                        width: '100%',
                        height: '2px',
                    }}
                />
            )}
            <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* PROJECT- HEADER */}
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-blue-500 border-b-1">
                                <th className="px-4 py-2 text-center border-r border-slate-200/60">
                                    <div className="text-[11px] font-semibold text-white uppercase tracking-wide">
                                        Наименование
                                    </div>
                                </th>
                                <th className="px-4 py-2 text-left border-r border-slate-200/60">
                                    <div className="text-[11px] font-semibold text-white uppercase tracking-wide">
                                        Код
                                    </div>
                                </th>
                                <th className="px-4 py-2 text-left border-r border-slate-200/60">
                                    <div className="text-[11px] font-semibold text-white uppercase tracking-wide">
                                        Тип
                                    </div>
                                </th>
                                <th className="px-4 py-2 text-left border-r border-slate-200/60">
                                    <div className="text-[11px] font-semibold text-white uppercase tracking-wide">
                                        Статус
                                    </div>
                                </th>
                                <th className="px-4 py-2 text-left border-r border-slate-200/60">
                                    <div className="text-[11px] font-semibold text-white uppercase tracking-wide">
                                        Адрес
                                    </div>
                                </th>
                                <th className="w-20 px-3 py-2 text-center">
                                    <div className="text-[11px] font-medium text-white uppercase">
                                        Действия
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {props.items.length > 0 ? (
                                props.items.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => handleRowClick(item)}
                                        className={`
                                            cursor-pointer group
                                            border-b border-gray-100 last:border-b-0
                                            hover:bg-blue-50/70
                                            hover:shadow-[inset_3px_0_0_0_rgb(81, 125, 197)]
                                            transition-all duration-150
                                            ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                                        `}
                                    >
                                        <td className="px-4 py-2 font-medium text-center text-gray-900 text-[13px]">
                                            {item.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono font-semibold text-slate-700 border border-slate-200/70">
                                                {item.code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-[13px] text-gray-700">
                                            {props.refs.projectTypes.lookup(item.type)}
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/70">
                                                {props.refs.projectStatuses.lookup(item.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-[13px] text-gray-600">
                                            {item.address}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <StyledTooltip title="Редактировать объект">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            props.onEdit(item);
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
                                                <StyledTooltip title="Удалить объект">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            props.onDelete(item.id);
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="flex items-center justify-center border-2 border-red-200 rounded-full w-14 h-14 bg-red-50">
                                                <svg
                                                    className="text-red-500 w-7 h-7"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-base font-semibold text-red-600 mb-0.5">
                                                    Ничего не найдено
                                                </p>
                                                <p className="text-[13px] text-gray-500">
                                                    Попробуйте изменить параметры поиска
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/*Пагинация******************************************************************************************************************************/}
            <TablePagination
                pagination={props.pagination}
                onPrev={props.onPrevPage}
                onNext={props.onNextPage}
            />
        </div>
    );
}
