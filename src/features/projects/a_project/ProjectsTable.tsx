import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import { Pencil, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from './projectsSlice';

interface ProjectsTableProps {
    projects: Project[];
    refs: Record<string, ReferenceResult>;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
    loading?: boolean;
}

const STATUS_CONFIG: Record<number, { label: string; className: string }> = {
    1: {
        label: 'Планирование',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    2: {
        label: 'В работе',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    3: {
        label: 'Завершён',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    4: {
        label: 'Приостановлен',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
};

/************************************************************************************************************/
export function ProjectsTable({ projects, refs, onEdit, onDelete, loading }: ProjectsTableProps) {
    const navigate = useNavigate();
    const handleRowClick = (project: Project) => {
        navigate(`/projects/${project.id}`, { state: { project } });
    };
    const getStatusConfig = (statusId: number) => {
        return (
            STATUS_CONFIG[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-gray-500">Загрузка проектов...</p>
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-medium text-gray-900">Нет проектов</h3>
                <p className="text-sm text-gray-500">
                    Создайте первый проект, нажав на кнопку "Создать проект"
                </p>
            </div>
        );
    }

    /*************************************************************************************************************************/
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1400px]">
                <thead>
                    <tr className="text-white bg-gradient-to-r from-sky-600 to-sky-600">
                        <th className="w-12 px-3 py-3 text-xs font-semibold text-left">№</th>
                        <th className="w-24 px-3 py-3 text-xs font-semibold text-left">Код</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold w-[120px]">
                            Название
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">Тип</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold w-[120px]">
                            Адрес
                        </th>
                        <th className="w-24 px-3 py-3 text-xs font-semibold text-left">
                            Даты с-по
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">
                            Плановый бюджет
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left w-36">Заказчик</th>
                        <th className="px-3 py-3 text-xs font-semibold text-left w-28">Статус</th>
                        <th className="w-24 px-3 py-3 text-xs font-semibold text-left">Прогресс</th>
                        <th className="px-3 py-3 text-xs font-semibold text-left w-28">
                            Инженер проекта
                        </th>
                        <th className="px-3 py-3 text-xs font-semibold text-left w-28">Прораб</th>
                        <th className="px-3 py-3 text-xs font-semibold text-left w-28">Мастер</th>
                        <th className="px-3 py-3 text-xs font-semibold text-left w-28">
                            Зав. склад
                        </th>
                        <th className="w-20 px-3 py-3 text-xs font-semibold text-center">
                            Действия
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project, index) => {
                        const statusInfo = getStatusConfig(project.status);

                        return (
                            <tr
                                key={project.id}
                                className="transition-colors hover:bg-blue-50/50 group"
                                onClick={() => handleRowClick(project)}
                            >
                                {/* Номер */}
                                <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                                    {index + 1}
                                </td>

                                {/* Код */}
                                <td className="px-3 py-2.5">
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded">
                                        {project.code}
                                    </span>
                                </td>

                                {/* Название */}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                        {project.name}
                                    </div>
                                </td>

                                {/* Тип */}
                                <td className="px-3 py-2.5 text-xs text-gray-700">
                                    {refs.projectTypes.lookup(project.type)}
                                </td>

                                {/* Адрес */}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                        {project.address}
                                    </div>
                                </td>
                                {/* Даты с-по*/}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs text-gray-600">
                                        <div>{formatDate(project.start_date)}</div>
                                        <div className="text-gray-400">
                                            → {formatDate(project.end_date)}
                                        </div>
                                    </div>
                                </td>
                                {/* Бюджет */}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs">
                                        <div className="font-medium text-gray-900">
                                            {formatCurrency(project.planned_budget)}
                                        </div>
                                        {project.actual_budget && (
                                            <div
                                                className={`
                                                ${
                                                    project.actual_budget > project.planned_budget
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }
                                            `}
                                            >
                                                {formatCurrency(project.actual_budget)}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Заказчик */}
                                <td className="px-3 py-2.5 text-xs text-gray-700">
                                    {refs.users.lookup(project.customer_id)}
                                </td>

                                {/* Статус */}
                                <td className="px-3 py-2.5">
                                    <span
                                        className={`
                                            inline-flex items-center px-2 py-0.5
                                            text-xs font-semibold border rounded-full
                                             ${statusInfo.className}
                                        `}
                                    >
                                        {refs.projectStatuses.lookup(project.status)}
                                    </span>
                                </td>

                                {/* Процент выполнения - Прогресс */}
                                <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all bg-blue-600 rounded-full"
                                                style={{ width: `${project.progress_percent}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600 font-medium min-w-[32px]">
                                            {project.progress_percent}%
                                        </span>
                                    </div>
                                </td>
                                {/* Руководитель объекта */}
                                <td className="px-3 py-2.5 text-xs text-gray-700">
                                    {project.manager_id
                                        ? refs.users.lookup(project.manager_id)
                                        : '—'}
                                </td>

                                {/* Прораб */}
                                <td className="px-3 py-2.5 text-xs text-gray-700">
                                    {project.foreman_id
                                        ? refs.users.lookup(project.foreman_id)
                                        : '—'}
                                </td>
                                {/* Мастер */}
                                <td className="px-3 py-2.5 text-xs text-gray-700">
                                    {project.master_id ? refs.users.lookup(project.master_id) : '_'}
                                </td>
                                {/* Зав склад */}
                                <td className="px-3 py-2.5 text-xs text-gray-700">
                                    {project.warehouse_manager_id
                                        ? refs.users.lookup(project.warehouse_manager_id)
                                        : '_'}
                                </td>
                                {/* Действия */}
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <StyledTooltip title="Редактировать объект">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(project);
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
                                                    onDelete(project);
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
