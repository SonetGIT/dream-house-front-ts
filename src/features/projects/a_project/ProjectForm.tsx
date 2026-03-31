import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { ProjectForm, ProjectFormData } from './projectsSlice';

interface ProjectFormProps {
    project?: ProjectFormData | null;
    refs: Record<string, ReferenceResult>;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

/**Создание начального состояния формы*/
function getInitialFormData(project?: ProjectFormData | null): ProjectForm {
    return {
        name: project?.name ?? '',
        code: project?.code ?? '',
        type: project?.type ?? null,
        address: project?.address ?? '',
        customer_id: project?.customer_id ?? null,
        start_date: project?.start_date?.slice(0, 10) ?? '',
        end_date: project?.end_date?.slice(0, 10) ?? '',
        planned_budget: project?.planned_budget ?? null,
        actual_budget: project?.actual_budget ?? null,
        status: project?.status ?? null,
        manager_id: project?.manager_id ?? null,
        foreman_id: project?.foreman_id ?? null,
        master_id: project?.master_id ?? null,
        warehouse_manager_id: project?.warehouse_manager_id ?? null,
        description: project?.description ?? '',
        progress_percent: project?.progress_percent ?? 0,
    };
}

/******************************************************************************************************/
export function ProjectForm({
    project,
    refs,
    onSubmit,
    onCancel,
    loading = false,
}: ProjectFormProps) {
    const [formData, setFormData] = useState<ProjectForm>(() => getInitialFormData(project));
    const [errors, setErrors] = useState<Record<string, string>>({});

    /*Обновление формы при редактировании*/
    useEffect(() => {
        setFormData(getInitialFormData(project));
    }, [project]);

    /*Валидация*/
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Название обязательно';
        if (!formData.code.trim()) newErrors.code = 'Код обязателен';
        if (!formData.type) newErrors.type = 'Выберите тип объекта';
        if (!formData.address.trim()) newErrors.address = 'Адрес обязателен';
        if (!formData.customer_id) newErrors.customer_id = 'Выберите заказчика';
        if (!formData.start_date) newErrors.start_date = 'Дата начала обязательна';
        if (!formData.end_date) newErrors.end_date = 'Дата окончания обязательна';
        if (!formData.planned_budget) newErrors.planned_budget = 'Плановый бюджет обязателен';
        if (!formData.status) newErrors.status = 'Выберите статус';
        if (!formData.manager_id) newErrors.manager_id = 'Выберите инженера объекта';

        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);

            if (end < start) {
                newErrors.end_date = 'Дата окончания не может быть раньше даты начала';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /*Submit*/
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const payload: ProjectFormData = {
            ...formData,
            type: formData.type!,
            customer_id: formData.customer_id!,
            planned_budget: formData.planned_budget!,
            actual_budget: formData.actual_budget ?? 0,
            status: formData.status!,
            manager_id: formData.manager_id!,
            progress_percent: formData.progress_percent ?? 0,
        };

        await onSubmit(payload);
    };

    /*Изменение полей*/
    const handleChange = <K extends keyof ProjectForm>(field: K, value: ProjectForm[K]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field as string]) {
            setErrors((prev) => {
                const { [field as string]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    /************************************************************************************************************/
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Основная информация
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Название */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Название объекта <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.name ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="Введите название объекта"
                            disabled={loading}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    {/* Код */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Код объекта <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.code ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="PRJ-001"
                            disabled={loading}
                        />
                        {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                    </div>

                    {/* Тип объекта */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Тип объекта <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.type || ''}
                            onChange={(e) =>
                                handleChange('type', e.target.value ? Number(e.target.value) : null)
                            }
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.type ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all cursor-pointer
                            `}
                            disabled={loading}
                        >
                            <option value="">Выберите тип</option>
                            {refs.projectTypes.data?.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                    </div>

                    {/* Заказчик */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Заказчик <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.customer_id || ''}
                            onChange={(e) =>
                                handleChange(
                                    'customer_id',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.customer_id ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all cursor-pointer
                            `}
                            disabled={loading}
                        >
                            <option value="">Выберите заказчика</option>
                            {refs.projectTypes.data?.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        {errors.customer_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.customer_id}</p>
                        )}
                    </div>

                    {/* Статус */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Статус <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.status || ''}
                            onChange={(e) =>
                                handleChange(
                                    'status',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className={`
                            w-full px-3 py-2 text-sm text-gray-900 bg-white
                            border ${errors.status ? 'border-red-300' : 'border-gray-300'}
                            rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                            transition-all cursor-pointer
                        `}
                            disabled={loading}
                        >
                            <option value="">Выберите статус</option>
                            {refs.projectStatuses.data?.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-xs text-red-600">{errors.status}</p>
                        )}
                    </div>

                    {/* Адрес */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Адрес <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            rows={2}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.address ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400 resize-none
                            `}
                            placeholder="Введите адрес объекта"
                            disabled={loading}
                        />
                        {errors.address && (
                            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                        )}
                    </div>

                    {/* Описание */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Описание
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent placeholder:text-gray-400"
                            placeholder="Дополнительная информация о проекте"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Даты и бюджет */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Даты и бюджет
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Дата начала */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Дата начала <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            className={`
                            w-full px-3 py-2 text-sm text-gray-900 bg-white
                            border ${errors.start_date ? 'border-red-300' : 'border-gray-300'}
                            rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                            transition-all
                        `}
                            disabled={loading}
                        />
                        {errors.start_date && (
                            <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
                        )}
                    </div>

                    {/* Дата окончания */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Дата окончания <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => handleChange('end_date', e.target.value)}
                            className={`
                            w-full px-3 py-2 text-sm text-gray-900 bg-white
                            border ${errors.end_date ? 'border-red-300' : 'border-gray-300'}
                            rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                            transition-all
                        `}
                            disabled={loading}
                        />
                        {errors.end_date && (
                            <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>
                        )}
                    </div>

                    {/* Плановый бюджет */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Плановый бюджет (KGS) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.planned_budget || ''}
                            onChange={(e) =>
                                handleChange(
                                    'planned_budget',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className={`
                            w-full px-3 py-2 text-sm text-gray-900 bg-white
                            border ${errors.planned_budget ? 'border-red-300' : 'border-gray-300'}
                            rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                            transition-all placeholder:text-gray-400
                        `}
                            placeholder="0"
                            min="0"
                            disabled={loading}
                        />
                        {errors.planned_budget && (
                            <p className="mt-1 text-xs text-red-600">{errors.planned_budget}</p>
                        )}
                    </div>

                    {/* Фактический бюджет */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Фактический бюджет (KGS)
                        </label>
                        <input
                            type="number"
                            value={formData.actual_budget ?? ''}
                            readOnly
                            className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg cursor-default"
                        />
                    </div>
                </div>
            </div>

            {/* Ответственные лица */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Ответственные лица
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Инженер объекта */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Инженер объекта <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.manager_id || ''}
                            onChange={(e) =>
                                handleChange(
                                    'manager_id',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.manager_id ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all cursor-pointer
                            `}
                            disabled={loading}
                        >
                            <option value="">Выберите инженера</option>
                            {refs.users.data?.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name}
                                </option>
                            ))}
                        </select>
                        {errors.manager_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.manager_id}</p>
                        )}
                    </div>

                    {/* Прораб */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Прораб
                        </label>
                        <select
                            value={formData.foreman_id || ''}
                            onChange={(e) =>
                                handleChange(
                                    'foreman_id',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className="w-full px-3 py-2 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="">Не назначен</option>
                            {refs.users.data?.map((foreman) => (
                                <option key={foreman.id} value={foreman.id}>
                                    {foreman.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Мастер */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Мастер
                        </label>
                        <select
                            value={formData.master_id || ''}
                            onChange={(e) =>
                                handleChange(
                                    'master_id',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className="w-full px-3 py-2 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="">Не назначен</option>
                            {refs.users.data?.map((master) => (
                                <option key={master.id} value={master.id}>
                                    {master.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Заведующий складом */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Заведующий складом
                        </label>
                        <select
                            value={formData.warehouse_manager_id || ''}
                            onChange={(e) =>
                                handleChange(
                                    'warehouse_manager_id',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className="w-full px-3 py-2 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="">Не назначен</option>
                            {refs.users.data?.map((manager) => (
                                <option key={manager.id} value={manager.id}>
                                    {manager.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="
                        flex-1 flex items-center justify-center gap-2
                        px-4 py-2.5
                        text-sm font-medium text-white
                        bg-sky-600
                        hover:bg-sky-700
                        rounded-lg
                        transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-2
                    "
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {project ? 'Сохранить изменения' : 'Создать объект'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="
                        flex-1
                        px-4 py-2.5
                        text-sm font-medium text-gray-700
                        bg-white
                        border border-gray-300
                        hover:bg-gray-50
                        rounded-lg
                        transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}
