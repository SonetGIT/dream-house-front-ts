import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2, Loader2, FileText, Users, ListChecks } from 'lucide-react';
import type { WorkPerformed, WorkPerformedItem } from '@/store/workPerformedSlice';
import {
    UNIT_MAP,
    CURRENCY_MAP,
    SERVICE_TYPE_MAP,
    ITEM_TYPE_MAP,
    PROJECT_MAP,
    BLOCK_MAP,
} from '../workPerformed/constants';

type ItemFormData = Omit<
    WorkPerformedItem,
    'id' | 'created_at' | 'updated_at' | 'deleted' | 'work_performed_id'
> & { id?: number };

interface FormData {
    block_id: number;
    project_id: number;
    code: string;
    status: number;
    performed_person_name: string;
    foreman_user_id: string;
    planning_engineer_user_id: string;
    main_engineer_user_id: string;
    items: ItemFormData[];
}

interface Props {
    initial?: WorkPerformed | null;
    onSave: (data: Partial<WorkPerformed>) => Promise<void>;
    onClose: () => void;
}

const TABS = [
    { id: 'main', label: 'Основные данные', icon: FileText },
    { id: 'signers', label: 'Подписанты', icon: Users },
    { id: 'items', label: 'Позиции', icon: ListChecks },
];

export function WorkPerformedForm({ initial, onSave, onClose }: Props) {
    const isEdit = !!initial;

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        defaultValues: {
            block_id: initial?.block_id ?? 1,
            project_id: initial?.project_id ?? 101,
            code: initial?.code ?? '',
            status: initial?.status ?? 1,
            performed_person_name: initial?.performed_person_name ?? '',
            foreman_user_id: initial?.foreman_user_id?.toString() ?? '',
            planning_engineer_user_id: initial?.planning_engineer_user_id?.toString() ?? '',
            main_engineer_user_id: initial?.main_engineer_user_id?.toString() ?? '',
            items:
                initial?.items?.map((it) => ({
                    id: it.id,
                    service_type: it.service_type,
                    service_id: it.service_id,
                    name: it.name,
                    stage_id: it.stage_id,
                    subsection_id: it.subsection_id,
                    item_type: it.item_type,
                    unit_of_measure: it.unit_of_measure,
                    quantity: it.quantity,
                    currency: it.currency,
                    currency_rate: it.currency_rate,
                    price: it.price,
                    material_estimate_item_id: it.material_estimate_item_id,
                })) ?? [],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    /* active tab via simple state */
    const [activeTab, setActiveTab] = useState('main');

    const onSubmit = async (data: FormData) => {
        const payload: Partial<WorkPerformed> = {
            block_id: Number(data.block_id),
            project_id: Number(data.project_id),
            code: data.code || null,
            status: Number(data.status),
            performed_person_name: data.performed_person_name,
            foreman_user_id: data.foreman_user_id ? Number(data.foreman_user_id) : null,
            planning_engineer_user_id: data.planning_engineer_user_id
                ? Number(data.planning_engineer_user_id)
                : null,
            main_engineer_user_id: data.main_engineer_user_id
                ? Number(data.main_engineer_user_id)
                : null,
            items: data.items.map(
                (it) =>
                    ({
                        ...(it.id ? { id: it.id } : {}),
                        service_type: Number(it.service_type),
                        service_id: Number(it.service_id),
                        name: it.name,
                        stage_id: Number(it.stage_id),
                        subsection_id: Number(it.subsection_id),
                        item_type: Number(it.item_type),
                        unit_of_measure: Number(it.unit_of_measure),
                        quantity: Number(it.quantity),
                        currency: Number(it.currency),
                        currency_rate: Number(it.currency_rate),
                        price: Number(it.price),
                        material_estimate_item_id: Number(it.material_estimate_item_id),
                        created_at: '',
                        updated_at: '',
                        deleted: false,
                        work_performed_id: initial?.id ?? 0,
                    }) as WorkPerformedItem,
            ),
        };
        await onSave(payload);
    };

    const addItem = () => {
        append({
            service_type: 1,
            service_id: 0,
            name: '',
            stage_id: 1,
            subsection_id: 1,
            item_type: 1,
            unit_of_measure: 4,
            quantity: 1,
            currency: 1,
            currency_rate: 1,
            price: 0,
            material_estimate_item_id: 0,
        });
        setActiveTab('items');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh] overflow-hidden">
                {/* ── Modal header ── */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                            <FileText className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                                {isEdit ? 'Редактировать акт' : 'Новый акт выполненных работ'}
                            </h2>
                            {initial?.code && (
                                <p className="text-[11px] text-gray-400 leading-tight">
                                    {initial.code}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Tabs ── */}
                <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0 px-5">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium border-b-2 transition -mb-px ${
                                    isActive
                                        ? 'border-blue-600 text-blue-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                                {tab.id === 'items' && fields.length > 0 && (
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}
                                    >
                                        {fields.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Body ── */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {/* TAB: Основные данные */}
                        {activeTab === 'main' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                            Проект *
                                        </label>
                                        <select
                                            {...register('project_id', { required: true })}
                                            className={inputCls(!!errors.project_id)}
                                        >
                                            {Object.entries(PROJECT_MAP).map(([v, l]) => (
                                                <option key={v} value={v}>
                                                    {l}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                            Блок *
                                        </label>
                                        <select
                                            {...register('block_id', { required: true })}
                                            className={inputCls(!!errors.block_id)}
                                        >
                                            {Object.entries(BLOCK_MAP).map(([v, l]) => (
                                                <option key={v} value={v}>
                                                    {l}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                            Код акта
                                        </label>
                                        <input
                                            {...register('code')}
                                            placeholder="АКТ-2024-XXX"
                                            className={inputCls(false)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                            Статус *
                                        </label>
                                        <select
                                            {...register('status', { required: true })}
                                            className={inputCls(!!errors.status)}
                                        >
                                            <option value={1}>Черновик</option>
                                            <option value={2}>На согласовании</option>
                                            <option value={3}>Утверждён</option>
                                            <option value={4}>Отклонён</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                        ФИО исполнителя *
                                    </label>
                                    <input
                                        {...register('performed_person_name', {
                                            required: 'Обязательное поле',
                                        })}
                                        placeholder="Иванов Иван Иванович"
                                        className={inputCls(!!errors.performed_person_name)}
                                    />
                                    {errors.performed_person_name && (
                                        <p className="text-[10px] text-red-500 mt-0.5">
                                            {errors.performed_person_name.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: Подписанты */}
                        {activeTab === 'signers' && (
                            <div className="space-y-4">
                                <p className="text-[11px] text-gray-500">
                                    Укажите ID пользователей, ответственных за подписание акта.
                                </p>
                                {[
                                    {
                                        field: 'foreman_user_id' as const,
                                        label: 'Прораб (ID пользователя)',
                                        placeholder: 'Например: 10',
                                    },
                                    {
                                        field: 'planning_engineer_user_id' as const,
                                        label: 'Инженер ПТО (ID пользователя)',
                                        placeholder: 'Например: 20',
                                    },
                                    {
                                        field: 'main_engineer_user_id' as const,
                                        label: 'Главный инженер (ID пользователя)',
                                        placeholder: 'Например: 30',
                                    },
                                ].map(({ field, label, placeholder }) => (
                                    <div key={field}>
                                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                            {label}
                                        </label>
                                        <input
                                            {...register(field)}
                                            type="number"
                                            placeholder={placeholder}
                                            className={inputCls(false)}
                                        />
                                    </div>
                                ))}

                                {isEdit && (
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 space-y-2">
                                        <p className="text-[11px] font-semibold text-blue-700">
                                            Текущие подписи
                                        </p>
                                        <SignRow
                                            label="Прораб"
                                            signed={initial?.signed_by_foreman}
                                            time={initial?.signed_by_foreman_time}
                                        />
                                        <SignRow
                                            label="Инженер ПТО"
                                            signed={initial?.signed_by_planning_engineer}
                                            time={initial?.signed_by_planning_engineer_time}
                                        />
                                        <SignRow
                                            label="Главный инженер"
                                            signed={initial?.signed_by_main_engineer}
                                            time={initial?.signed_by_main_engineer_time}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: Позиции */}
                        {activeTab === 'items' && (
                            <div className="space-y-3">
                                {fields.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                        <ListChecks className="w-8 h-8 text-gray-300 mb-2" />
                                        <p className="text-xs">Позиций нет</p>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="mt-2 text-xs text-blue-600 hover:underline"
                                        >
                                            Добавить первую позицию
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {fields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="border border-gray-100 rounded-lg bg-gray-50/50 p-3 space-y-2.5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-semibold text-gray-500">
                                                        Позиция #{index + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Удалить
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                        Наименование
                                                    </label>
                                                    <input
                                                        {...register(`items.${index}.name`)}
                                                        placeholder="Название работы или материала"
                                                        className={inputSmCls}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            Тип услуги
                                                        </label>
                                                        <select
                                                            {...register(
                                                                `items.${index}.service_type`,
                                                            )}
                                                            className={inputSmCls}
                                                        >
                                                            {Object.entries(SERVICE_TYPE_MAP).map(
                                                                ([v, l]) => (
                                                                    <option key={v} value={v}>
                                                                        {l}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            Тип позиции
                                                        </label>
                                                        <select
                                                            {...register(
                                                                `items.${index}.item_type`,
                                                            )}
                                                            className={inputSmCls}
                                                        >
                                                            {Object.entries(ITEM_TYPE_MAP).map(
                                                                ([v, l]) => (
                                                                    <option key={v} value={v}>
                                                                        {l}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            Ед. измерения
                                                        </label>
                                                        <select
                                                            {...register(
                                                                `items.${index}.unit_of_measure`,
                                                            )}
                                                            className={inputSmCls}
                                                        >
                                                            {Object.entries(UNIT_MAP).map(
                                                                ([v, l]) => (
                                                                    <option key={v} value={v}>
                                                                        {l}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            Количество
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            {...register(`items.${index}.quantity`)}
                                                            className={inputSmCls}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            Цена
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            {...register(`items.${index}.price`)}
                                                            className={inputSmCls}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            Валюта
                                                        </label>
                                                        <select
                                                            {...register(`items.${index}.currency`)}
                                                            className={inputSmCls}
                                                        >
                                                            {Object.entries(CURRENCY_MAP).map(
                                                                ([v, l]) => (
                                                                    <option key={v} value={v}>
                                                                        {l}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            Курс
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            {...register(
                                                                `items.${index}.currency_rate`,
                                                            )}
                                                            className={inputSmCls}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            ID сервиса
                                                        </label>
                                                        <input
                                                            type="number"
                                                            {...register(
                                                                `items.${index}.service_id`,
                                                            )}
                                                            className={inputSmCls}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            ID этапа
                                                        </label>
                                                        <input
                                                            type="number"
                                                            {...register(`items.${index}.stage_id`)}
                                                            className={inputSmCls}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                                            ID подраздела
                                                        </label>
                                                        <input
                                                            type="number"
                                                            {...register(
                                                                `items.${index}.subsection_id`,
                                                            )}
                                                            className={inputSmCls}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-blue-300 text-blue-600 text-xs hover:bg-blue-50 transition w-full justify-center"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Добавить позицию
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
                        <span className="text-[11px] text-gray-400">
                            {fields.length} {pluralItems(fields.length)}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
                            >
                                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {isEdit ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SignRow({
    label,
    signed,
    time,
}: {
    label: string;
    signed: boolean | null;
    time: string | null;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-600">{label}</span>
            {signed === true ? (
                <span className="text-[10px] text-emerald-600 font-medium">
                    ✓ {time ? new Date(time).toLocaleDateString('ru-RU') : 'Подписано'}
                </span>
            ) : (
                <span className="text-[10px] text-gray-400">— Не подписано</span>
            )}
        </div>
    );
}

function pluralItems(n: number) {
    if (n % 10 === 1 && n % 100 !== 11) return 'позиция';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'позиции';
    return 'позиций';
}

const inputCls = (err: boolean) =>
    `w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:border-blue-400 transition ${
        err ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
    }`;

const inputSmCls =
    'w-full text-[11px] px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-blue-400 transition bg-white';
