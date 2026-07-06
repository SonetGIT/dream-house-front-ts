import { Building2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { CreateTaskPayload, Task, UpdateTaskPayload } from './tasksSlice';

interface TaskFormProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    task: Task | null;
    refs: Record<string, ReferenceResult>;
    onSubmit: (
        data: CreateTaskPayload | (UpdateTaskPayload & { assignee_user_ids: number[] }),
    ) => Promise<void> | void;
}

type TaskFormData = {
    project_id: number;
    title: string;
    description: string;
    priority: number | null;
    deadline: string;
    assignee_user_ids: number[];
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

    const existingAssigneeIds = useMemo(
        () =>
            new Set(
                task?.assignee_user_ids ??
                    (task?.responsible_user_id ? [task.responsible_user_id] : []),
            ),
        [task],
    );

    const [formData, setFormData] = useState<TaskFormData>({
        project_id: projectId,
        title: task?.title ?? '',
        description: task?.description ?? '',
        priority: task?.priority ?? null,
        deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
        assignee_user_ids:
            task?.assignee_user_ids ??
            (task?.responsible_user_id ? [task.responsible_user_id] : []),
    });

    const [errors, setErrors] = useState<TaskFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        setFormData({
            project_id: projectId,
            title: task?.title ?? '',
            description: task?.description ?? '',
            priority: task?.priority ?? null,
            deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
            assignee_user_ids:
                task?.assignee_user_ids ??
                (task?.responsible_user_id ? [task.responsible_user_id] : []),
        });
        setErrors({});
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
            case 'assignee_user_ids':
                if (!Array.isArray(value) || value.length === 0) {
                    return 'Выберите хотя бы одного исполнителя';
                }
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
                const nextErrors = { ...prev };
                delete nextErrors[key];
                return nextErrors;
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
                const nextErrors = { ...prev };
                delete nextErrors[field];
                return nextErrors;
            }

            return {
                ...prev,
                [field]: error,
            };
        });
    };

    const toggleAssignee = (userId: number) => {
        const isExisting = task && existingAssigneeIds.has(userId);
        if (isExisting) return;

        const nextIds = formData.assignee_user_ids.includes(userId)
            ? formData.assignee_user_ids.filter((id) => id !== userId)
            : [...formData.assignee_user_ids, userId];

        handleChange('assignee_user_ids', nextIds);
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[700px] rounded-lg bg-white shadow-2xl"
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
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        title="Закрыть"
                    >
                        <X className="w-5 h-5 text-red-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-5">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Название задачи <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                onBlur={() => handleBlur('title')}
                                placeholder="Например: Подготовить документы"
                                className={getFieldClassName('title')}
                            />
                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Описание задачи <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                onBlur={() => handleBlur('description')}
                                rows={3}
                                className={`${getFieldClassName('description')} resize-none`}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                                    className={getFieldClassName('priority')}
                                >
                                    <option value="">Выберите приоритет задачи</option>
                                    {refs.taskPriorities.data?.map((taskPriority) => (
                                        <option key={taskPriority.id} value={taskPriority.id}>
                                            {taskPriority.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.priority && (
                                    <p className="text-sm text-red-500">{errors.priority}</p>
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
                                    className={getFieldClassName('deadline')}
                                />
                                {errors.deadline && (
                                    <p className="text-sm text-red-500">{errors.deadline}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Исполнители <span className="text-red-500">*</span>
                            </label>
                            {task ? (
                                <p className="text-xs text-amber-700">
                                    Для существующей задачи можно добавлять новых исполнителей. Уже
                                    назначенные пользователи заблокированы.
                                </p>
                            ) : null}
                            <div className="p-3 space-y-2 overflow-y-auto border border-gray-200 rounded-md max-h-64 bg-gray-50">
                                {refs.users.data?.map((user) => {
                                    const userId = Number(user.id);
                                    const checked = formData.assignee_user_ids.includes(userId);
                                    const disabled = Boolean(
                                        task && existingAssigneeIds.has(userId),
                                    );

                                    return (
                                        <label
                                            key={user.id}
                                            className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition-colors ${
                                                checked
                                                    ? 'border-blue-300 bg-blue-50'
                                                    : 'border-gray-200 bg-white hover:border-blue-200'
                                            } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={disabled}
                                                onChange={() => toggleAssignee(userId)}
                                                className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded"
                                            />
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-800">
                                                    {user.name}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.assignee_user_ids && (
                                <p className="text-sm text-red-500">{errors.assignee_user_ids}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.title.trim()}
                            className="px-5 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-300"
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
