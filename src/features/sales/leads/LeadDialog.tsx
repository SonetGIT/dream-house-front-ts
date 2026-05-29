import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { UserPlus, X } from 'lucide-react';
import type { EnumItem } from '@/features/reference/referenceService';
import type {
    SalesLeadSource,
    SalesLeadStatus,
} from '@/features/sales/slices/salesDictionariesSlice';
import type { SalesOverviewProject } from '@/features/sales/slices/salesObjOverviewSlice';
import type {
    SalesLead,
    SalesLeadCreatePayload,
} from '@/features/sales/slices/salesLeadsSlice';

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (payload: SalesLeadCreatePayload) => Promise<void>;
    saving: boolean;
    lead?: SalesLead | null;
    projects: SalesOverviewProject[];
    blocks: EnumItem[];
    statuses: SalesLeadStatus[];
    sources: SalesLeadSource[];
    defaultStatusId?: number;
}

interface FormValues {
    project_id: string;
    block_id: string;
    status_id: string;
    source_id: string;
    full_name: string;
    phone: string;
    email: string;
    inn: string;
    comment: string;
    interest_rooms: string;
    interest_budget_from: string;
    interest_budget_to: string;
}

const fieldClassName =
    'mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white';

const textareaClassName =
    'mt-1 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white';

export default function LeadDialog({
    open,
    onClose,
    onSave,
    saving,
    lead,
    projects,
    blocks,
    statuses,
    sources,
    defaultStatusId,
}: Props) {
    const { register, handleSubmit, control, watch, reset, setValue } = useForm<FormValues>({
        defaultValues: {
            project_id: '',
            block_id: '',
            status_id: '',
            source_id: '',
            full_name: '',
            phone: '',
            email: '',
            inn: '',
            comment: '',
            interest_rooms: '',
            interest_budget_from: '',
            interest_budget_to: '',
        },
    });

    const projectId = watch('project_id');
    const filteredBlocks = useMemo(() => blocks, [blocks]);

    useEffect(() => {
        if (!open) return;

        if (lead) {
            reset({
                project_id: String(lead.project_id ?? ''),
                block_id: String(lead.block_id ?? ''),
                status_id: String(lead.status_id ?? ''),
                source_id: String(lead.source_id ?? ''),
                full_name: lead.full_name ?? '',
                phone: lead.phone ?? '',
                email: lead.email ?? '',
                inn: lead.inn ?? '',
                comment: lead.comment ?? '',
                interest_rooms: lead.interest_rooms != null ? String(lead.interest_rooms) : '',
                interest_budget_from: lead.interest_budget_from ?? '',
                interest_budget_to: lead.interest_budget_to ?? '',
            });
            return;
        }

        reset({
            project_id: projects[0]?.id ? String(projects[0].id) : '',
            block_id: '',
            status_id: defaultStatusId
                ? String(defaultStatusId)
                : statuses[0]?.id
                  ? String(statuses[0].id)
                  : '',
            source_id: sources[0]?.id ? String(sources[0].id) : '',
            full_name: '',
            phone: '',
            email: '',
            inn: '',
            comment: '',
            interest_rooms: '',
            interest_budget_from: '',
            interest_budget_to: '',
        });
    }, [defaultStatusId, lead, open, projects, reset, sources, statuses]);

    const onSubmit = async (data: FormValues) => {
        await onSave({
            project_id: data.project_id ? Number(data.project_id) : null,
            block_id: data.block_id ? Number(data.block_id) : null,
            status_id: Number(data.status_id) || statuses[0]?.id || 1,
            source_id: data.source_id ? Number(data.source_id) : null,
            full_name: data.full_name.trim() || '',
            phone: data.phone.trim() || null,
            email: data.email.trim() || null,
            inn: data.inn.trim() || null,
            comment: data.comment.trim() || null,
            interest_rooms: data.interest_rooms ? Number(data.interest_rooms) : null,
            interest_budget_from: data.interest_budget_from || null,
            interest_budget_to: data.interest_budget_to || null,
        });
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
            onClick={onClose}
        >
            <div
                className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                {lead ? 'Редактировать лида' : 'Новый лид'}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Карточка лида для работы в воронке продаж
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-xs font-medium text-slate-500">
                            Объект
                            <Controller
                                name="project_id"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            setValue('block_id', '');
                                        }}
                                        className={fieldClassName}
                                    >
                                        <option value="">Выберите объект</option>
                                        {projects.map((project) => (
                                            <option key={project.id} value={String(project.id)}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Блок
                            <Controller
                                name="block_id"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className={fieldClassName}
                                    >
                                        <option value="">Выберите блок</option>
                                        {filteredBlocks.map((block) => (
                                            <option key={String(block.id)} value={String(block.id)}>
                                                {block.name ?? `Блок #${block.id}`}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Статус
                            <Controller
                                name="status_id"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className={fieldClassName}
                                    >
                                        <option value="">Выберите статус</option>
                                        {statuses.map((status) => (
                                            <option key={status.id} value={String(status.id)}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Источник
                            <Controller
                                name="source_id"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className={fieldClassName}
                                    >
                                        <option value="">Не выбран</option>
                                        {sources.map((source) => (
                                            <option key={source.id} value={String(source.id)}>
                                                {source.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                        </label>

                        <label className="md:col-span-2 text-xs font-medium text-slate-500">
                            ФИО клиента
                            <input
                                {...register('full_name')}
                                placeholder="Например: Айбек Осмонов"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Телефон
                            <input
                                {...register('phone')}
                                placeholder="+996 555 00-00-00"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Email
                            <input
                                {...register('email')}
                                placeholder="client@mail.com"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            ИНН
                            <input
                                {...register('inn')}
                                maxLength={14}
                                placeholder="Введите ИНН"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Комнат
                            <input
                                {...register('interest_rooms')}
                                placeholder="Например: 2"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Бюджет от
                            <input
                                {...register('interest_budget_from')}
                                placeholder="Например: 4 500 000"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Бюджет до
                            <input
                                {...register('interest_budget_to')}
                                placeholder="Например: 7 000 000"
                                className={fieldClassName}
                            />
                        </label>

                        <label className="md:col-span-2 text-xs font-medium text-slate-500">
                            Комментарий
                            <textarea
                                {...register('comment')}
                                rows={4}
                                placeholder="Что интересует клиента, пожелания, договоренности"
                                className={textareaClassName}
                            />
                        </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !projectId}
                            className="inline-flex h-10 items-center rounded-xl bg-sky-600 px-5 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-60"
                        >
                            {saving
                                ? 'Сохраняем...'
                                : lead
                                  ? 'Сохранить изменения'
                                  : 'Создать лида'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
