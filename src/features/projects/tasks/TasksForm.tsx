import { X, Building2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Task } from './tasksSlice';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

interface TaskFormProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    task: Task | null;
    refs: Record<string, ReferenceResult>;
    onSubmit: (data: Partial<Task>) => Promise<void> | void;
}

type TaskFormData = {
    project_id: number;
    title: string;
    description: string;
    priority: number | null;
    deadline: string;
    responsible_user_id: number | null;
};

type TaskFormErrors = Partial<Record<keyof TaskFormData, string>>;

export default function TaskForm({
    open,
    onClose,
    projectId,
    task,
    refs,
    onSubmit,
}: TaskFormProps) {
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<TaskFormData>({
        project_id: projectId,
        title: task?.title ?? '',
        description: task?.description ?? '',
        priority: task?.priority ?? null,
        deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
        responsible_user_id: task?.responsible_user_id ?? null,
    });

    const [errors, setErrors] = useState<TaskFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setFormData({
                project_id: projectId,
                title: task?.title ?? '',
                description: task?.description ?? '',
                priority: task?.priority ?? null,
                deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
                responsible_user_id: task?.responsible_user_id ?? null,
            });
            setErrors({});
        }
    }, [open, task, projectId]);

    useEffect(() => {
        if (open) {
            nameInputRef.current?.focus();
        }
    }, [open]);

    const validateField = (
        field: keyof TaskFormData,
        value: TaskFormData[keyof TaskFormData],
    ): string => {
        switch (field) {
            case 'title':
                if (!String(value || '').trim()) return 'Введите название задачи';
                if (String(value).trim().length < 3) {
                    return 'Название должно содержать минимум 3 символа';
                }
                return '';

            case 'description':
                if (!String(value || '').trim()) return 'Введите описание задачи';
                if (String(value).trim().length < 5) {
                    return 'Описание должно содержать минимум 5 символов';
                }
                return '';

            case 'priority':
                if (value == null) return 'Выберите приоритет';
                return '';

            case 'responsible_user_id':
                if (value == null) return 'Выберите исполнителя';
                return '';

            case 'deadline':
                if (!String(value || '').trim()) return 'Укажите дедлайн';
                return '';

            case 'project_id':
                if (!value) return 'Проект не определён';
                return '';

            default:
                return '';
        }
    };

    const validateForm = () => {
        const nextErrors: TaskFormErrors = {};

        (Object.keys(formData) as (keyof TaskFormData)[]).forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) {
                nextErrors[field] = error;
            }
        });

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));

        const error = validateField(key, value);

        setErrors((prev) => {
            if (!error) {
                const { [key]: _, ...rest } = prev;
                return rest;
            }

            return {
                ...prev,
                [key]: error,
            };
        });
    };

    const handleBlur = (field: keyof TaskFormData) => {
        const error = validateField(field, formData[field]);

        setErrors((prev) => {
            if (!error) {
                const { [field]: _, ...rest } = prev;
                return rest;
            }

            return {
                ...prev,
                [field]: error,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            await onSubmit({
                ...formData,
                title: formData.title.trim(),
                description: formData.description.trim(),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldClassName = (field: keyof TaskFormData) =>
        `w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border rounded-md focus:outline-none focus:ring-2 transition-all ${
            errors[field]
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
        }`;

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[600px] bg-white rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {task ? 'Редактировать задачу' : 'Добавить новую задачу'}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Закрыть (Esc)"
                    >
                        <X className="w-5 h-5 text-red-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-5">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Название задачи
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                onBlur={() => handleBlur('title')}
                                placeholder="Например: Задача ..."
                                className={getFieldClassName('title')}
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Описание задачи
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                onBlur={() => handleBlur('description')}
                                className={getFieldClassName('description')}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Приоритет <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.priority || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'priority',
                                        e.target.value ? Number(e.target.value) : null,
                                    )
                                }
                                onBlur={() => handleBlur('priority')}
                                className={`${getFieldClassName('priority')} text-right`}
                            >
                                <option value="">Выберите приоритет задачи</option>
                                {refs.taskPriorities.data?.map((tskPriority) => (
                                    <option key={tskPriority.id} value={tskPriority.id}>
                                        {tskPriority.name}
                                    </option>
                                ))}
                            </select>
                            {errors.priority && (
                                <p className="text-sm text-red-500">{errors.priority}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Исполнитель/Ответственный <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.responsible_user_id || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'responsible_user_id',
                                        e.target.value ? Number(e.target.value) : null,
                                    )
                                }
                                onBlur={() => handleBlur('responsible_user_id')}
                                className={`${getFieldClassName('responsible_user_id')} text-right`}
                            >
                                <option value="">Выберите исполнителя</option>
                                {refs.users.data?.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            {errors.responsible_user_id && (
                                <p className="text-sm text-red-500">{errors.responsible_user_id}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Дедлайн <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => handleChange('deadline', e.target.value)}
                                onBlur={() => handleBlur('deadline')}
                                className={`${getFieldClassName('deadline')} text-right`}
                            />
                            {errors.deadline && (
                                <p className="text-sm text-red-500">{errors.deadline}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.title.trim()}
                            className="px-5 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-md"
                        >
                            {isSubmitting
                                ? task
                                    ? 'Сохранение...'
                                    : 'Создание...'
                                : task
                                  ? 'Сохранить изменения'
                                  : 'Создать задачу'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
