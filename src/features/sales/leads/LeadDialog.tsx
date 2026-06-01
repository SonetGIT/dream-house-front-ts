import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { UserPlus, X } from 'lucide-react';
import type { EnumItem } from '@/features/reference/referenceService';
import type {
    SalesLeadSource,
    SalesLeadStatus,
} from '@/features/sales/slices/salesDictionariesSlice';
import type { SalesOverviewProject } from '@/features/sales/slices/salesObjOverviewSlice';
import type { SalesLead, SalesLeadCreatePayload } from '@/features/sales/slices/salesLeadsSlice';
import { formatPhoneInput, toStoragePhone } from '@/utils/formatPhoneNumber';

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

const getFieldClassName = (hasError = false) => `
    w-full px-3 py-2 text-sm text-gray-900 bg-white
    border ${hasError ? 'border-red-300' : 'border-gray-300'}
    rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
    transition-all placeholder:text-gray-400
`;

const labelClassName = 'block text-sm font-medium text-gray-700 mb-1.5';

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
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
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
    const filteredBlocks = useMemo(() => {
        if (!projectId) {
            return blocks;
        }

        return blocks.filter((block) => Number(block.project_id) === Number(projectId));
    }, [blocks, projectId]);

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
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-sky-100 text-sky-700">
                            <UserPlus className="w-5 h-5" />
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
                        className="flex items-center justify-center transition h-9 w-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label>
                            <span className={labelClassName}>Объект</span>
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
                                        className={getFieldClassName()}
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

                        <label>
                            <span className={labelClassName}>Блок</span>
                            <Controller
                                name="block_id"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className={getFieldClassName()}
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

                        <label>
                            <span className={labelClassName}>
                                Статус <span className="text-red-500">*</span>
                            </span>
                            <Controller
                                name="status_id"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className={getFieldClassName()}
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

                        <label>
                            <span className={labelClassName}>Источник</span>
                            <Controller
                                name="source_id"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className={getFieldClassName()}
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

                        <label className="md:col-span-2">
                            <span className={labelClassName}>
                                ФИО клиента <span className="text-red-500">*</span>
                            </span>
                            <input
                                {...register('full_name', {
                                    required: 'ФИО обязательно',
                                })}
                                // placeholder="Например: Айбек Осмонов"
                                className={getFieldClassName(!!errors.full_name)}
                            />
                            {errors.full_name && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.full_name.message}
                                </p>
                            )}
                        </label>

                        <label>
                            <span className={labelClassName}>Телефон</span>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        type="tel"
                                        value={formatPhoneInput(field.value)}
                                        onChange={(e) =>
                                            field.onChange(toStoragePhone(e.target.value) ?? '')
                                        }
                                        maxLength={16}
                                        inputMode="tel"
                                        placeholder="+996 555 00-00-00"
                                        className={getFieldClassName(!!errors.phone)}
                                    />
                                )}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                            )}
                        </label>

                        <label>
                            <span className={labelClassName}>Email</span>
                            <input
                                {...register('email', {
                                    pattern: {
                                        value: /\S+@\S+\.\S+/,
                                        message: 'Некорректный email',
                                    },
                                })}
                                placeholder="client@mail.com"
                                className={getFieldClassName(!!errors.email)}
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                            )}
                        </label>

                        <label>
                            <span className={labelClassName}>ИНН</span>
                            <Controller
                                name="inn"
                                control={control}
                                rules={{
                                    validate: (value) =>
                                        !value ||
                                        (/^\d+$/.test(value) && value.length === 14) ||
                                        'ИНН должен содержать 14 цифр',
                                }}
                                render={({ field }) => (
                                    <input
                                        type="text"
                                        value={field.value}
                                        onChange={(e) =>
                                            field.onChange(e.target.value.replace(/\D/g, ''))
                                        }
                                        maxLength={14}
                                        inputMode="numeric"
                                        placeholder="Введите ИНН"
                                        className={getFieldClassName(!!errors.inn)}
                                    />
                                )}
                            />
                            {errors.inn && (
                                <p className="mt-1 text-xs text-red-600">{errors.inn.message}</p>
                            )}
                        </label>

                        <label>
                            <span className={labelClassName}>Комнат</span>
                            <input
                                {...register('interest_rooms')}
                                placeholder="Например: 2"
                                className={getFieldClassName()}
                            />
                        </label>

                        <label>
                            <span className={labelClassName}>Бюджет от</span>
                            <input
                                {...register('interest_budget_from')}
                                placeholder="Например: 4 500 000"
                                className={getFieldClassName()}
                            />
                        </label>

                        <label>
                            <span className={labelClassName}>Бюджет до</span>
                            <input
                                {...register('interest_budget_to')}
                                placeholder="Например: 7 000 000"
                                className={getFieldClassName()}
                            />
                        </label>

                        <label className="md:col-span-2">
                            <span className={labelClassName}>Комментарий</span>
                            <textarea
                                {...register('comment')}
                                rows={4}
                                placeholder="Что интересует клиента, пожелания, договоренности"
                                className={getFieldClassName(false).replace(
                                    'py-2',
                                    'py-2 resize-none',
                                )}
                            />
                        </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center h-10 px-4 text-sm font-medium transition bg-white border rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !projectId}
                            className="inline-flex items-center h-10 px-5 text-sm font-medium text-white transition rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60"
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
