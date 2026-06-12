import { useState, useEffect, useMemo } from 'react';
import {
    X,
    Package,
    Plus,
    Pencil,
    Building2,
    Ruler,
    DollarSign,
    FileText,
    MessageSquare,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { apiRequest } from '@/utils/apiRequest';
import {
    createSalesUnit,
    updateSalesUnit,
    type SalesUnit,
    type SalesUnitCreatePayload,
    type SalesUnitFloor,
} from '../slices/salesUnitsSlice';
import toast from 'react-hot-toast';
import { LOT_TYPE_OPTIONS } from './ObjectsOverviewUnitsFilters';
import type { SalesUnitFinishTypes, SalesUnitStatus } from '../slices/salesDictionariesSlice';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { EnumItem } from '@/features/reference/referenceService';

interface Props {
    mode: 'create' | 'edit';
    unit?: SalesUnit;
    unitStatuses: SalesUnitStatus[];
    finishTypes: SalesUnitFinishTypes[];
    refs: Record<string, ReferenceResult>;
    onClose: () => void;
}

// Стили
const inputCls =
    'w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all';
const inputErrCls =
    'w-full px-3 py-2 text-sm text-gray-900 bg-white border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all';
const labelCls =
    'flex items-center gap-2 py-2 mb-1 text-sm font-semibold text-sky-800 rounded-r-lg';

type Errors = Partial<Record<string, string>>;

// Инициализация формы
function initForm(unit?: SalesUnit): Partial<SalesUnitCreatePayload> {
    if (!unit) return { lot_type: 'apartment', is_active_for_sale: true, currency: 1 };
    return {
        project_id: unit.project_id,
        block_id: unit.block_id,
        floor_id: unit.floor_id,
        unit_number: unit.unit_number,
        lot_type: unit.lot_type,
        plan_code: unit.plan_code,
        external_code: unit.external_code,
        rooms: unit.rooms ?? undefined,
        area_total: unit.area_total,
        price_total: unit.price_total,
        price_per_m2: unit.price_per_m2,
        currency: unit.currency ?? 1,
        status_id: unit.status_id ?? undefined,
        finish_type: unit.finish_type,
        cadastral_number: unit.cadastral_number,
        is_active_for_sale: unit.is_active_for_sale,
        description: unit.description,
        comment: unit.comment,
        manager_user_id: unit.manager_user_id,
    };
}

export function ObjectsOverviewUnitForm({
    mode,
    unit,
    unitStatuses,
    finishTypes,
    refs,
    onClose,
}: Props) {
    const dispatch = useAppDispatch();
    const { projects, blocks } = useAppSelector((s) => s.salesObjOverview);
    const [form, setForm] = useState<Partial<SalesUnitCreatePayload>>(() => initForm(unit));
    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);
    const [floors, setFloors] = useState<SalesUnitFloor[]>([]);
    const [loadingFloors, setLoadingFloors] = useState(false);

    const projectBlocks = useMemo(
        () => blocks.filter((b) => form.project_id && b.project_id === form.project_id),
        [blocks, form.project_id],
    );

    // Загрузка этажей при выборе блока
    useEffect(() => {
        if (!form.block_id) {
            setFloors([]);
            return;
        }
        setLoadingFloors(true);
        apiRequest<SalesUnitFloor[]>(`/sales/blocks/${form.block_id}/floors`, 'GET')
            .then((res) => setFloors(res.data ?? []))
            .finally(() => setLoadingFloors(false));
    }, [form.block_id]);

    function set<K extends keyof SalesUnitCreatePayload>(key: K, value: SalesUnitCreatePayload[K]) {
        setForm((f) => ({ ...f, [key]: value }));
        if (errors[key as string]) setErrors((e) => ({ ...e, [key]: '' }));
    }

    function validate(): boolean {
        const e: Errors = {};
        if (!form.project_id) e.project_id = 'Выберите объект';
        if (!form.block_id) e.block_id = 'Выберите блок';
        if (!form.floor_id) e.floor_id = 'Выберите этаж';
        if (!form.unit_number?.trim()) e.unit_number = 'Введите номер лота';
        if (!form.lot_type) e.lot_type = 'Выберите тип';
        if (form.area_total && isNaN(parseFloat(form.area_total)))
            e.area_total = 'Некорректная площадь';
        if (form.price_total && isNaN(parseFloat(form.price_total)))
            e.price_total = 'Некорректная цена';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            if (mode === 'edit' && unit) {
                await dispatch(updateSalesUnit({ id: unit.id, payload: form })).unwrap();
                toast.success(`Лот ${form.unit_number} обновлён`);
            } else {
                await dispatch(createSalesUnit(form as SalesUnitCreatePayload)).unwrap();
                toast.success(`Лот ${form.unit_number} создан`);
            }
            onClose();
        } catch (e) {
            toast.error(`Ошибка: ${e}`);
        } finally {
            setSubmitting(false);
        }
    }

    const isEdit = mode === 'edit';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-white">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                                isEdit ? 'bg-amber-500' : 'bg-sky-500'
                            }`}
                        >
                            {isEdit ? (
                                <Pencil size={15} className="text-white" />
                            ) : (
                                <Plus size={16} className="text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                {isEdit ? 'Редактировать лот' : 'Создать лот'}
                            </h2>
                            {isEdit && unit && (
                                <p className="text-xs text-gray-500">
                                    {unit.unit_number} • {unit.plan_code}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 px-6 py-5 space-y-5 overflow-y-auto"
                >
                    {/*1. РАСПОЛОЖЕНИЕ*/}
                    <div>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Объект */}
                            <div>
                                <label className={labelCls}>Объект *</label>
                                <select
                                    value={form.project_id ?? ''}
                                    onChange={(e) => {
                                        const v = +e.target.value || undefined;
                                        setForm((f) => ({
                                            ...f,
                                            project_id: v as never,
                                            block_id: undefined as never,
                                            floor_id: undefined as never,
                                        }));
                                        setErrors((er) => ({ ...er, project_id: '' }));
                                    }}
                                    className={errors.project_id ? inputErrCls : inputCls}
                                >
                                    <option value="">Выберите объект</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.project_id && (
                                    <p className="mt-1 text-xs text-red-600">{errors.project_id}</p>
                                )}
                            </div>

                            {/* Блок */}
                            <div>
                                <label className={labelCls}>Блок *</label>
                                <select
                                    value={form.block_id ?? ''}
                                    onChange={(e) => {
                                        const v = +e.target.value || undefined;
                                        setForm((f) => ({
                                            ...f,
                                            block_id: v as never,
                                            floor_id: undefined as never,
                                        }));
                                        setErrors((er) => ({ ...er, block_id: '' }));
                                    }}
                                    disabled={!form.project_id}
                                    className={`${errors.block_id ? inputErrCls : inputCls} disabled:opacity-50`}
                                >
                                    <option value="">Выберите блок</option>
                                    {projectBlocks.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.block_id && (
                                    <p className="mt-1 text-xs text-red-600">{errors.block_id}</p>
                                )}
                            </div>

                            {/* Этаж */}
                            <div>
                                <label className={labelCls}>Этаж *</label>
                                <select
                                    value={form.floor_id ?? ''}
                                    onChange={(e) =>
                                        set('floor_id', +e.target.value || (undefined as never))
                                    }
                                    disabled={!form.block_id || loadingFloors}
                                    className={`${errors.floor_id ? inputErrCls : inputCls} disabled:opacity-50`}
                                >
                                    <option value="">
                                        {loadingFloors ? 'Загрузка...' : 'Выберите этаж'}
                                    </option>
                                    {floors.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name ?? `Этаж ${f.floor_number}`}
                                        </option>
                                    ))}
                                </select>
                                {errors.floor_id && (
                                    <p className="mt-1 text-xs text-red-600">{errors.floor_id}</p>
                                )}
                            </div>

                            {/* Отделка (из справочника finishTypes) */}
                            <div>
                                <label className={labelCls}>Отделка</label>
                                <select
                                    value={form.finish_type ?? ''}
                                    onChange={(e) => set('finish_type', e.target.value || null)}
                                    className={inputCls}
                                >
                                    <option value="">Не указана</option>
                                    {finishTypes?.map((f) => (
                                        <option key={f.id ?? f.name} value={f.name}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Плановый код */}
                            <div>
                                <label className={labelCls}>Плановый код</label>
                                <input
                                    value={form.plan_code ?? ''}
                                    onChange={(e) => set('plan_code', e.target.value || null)}
                                    placeholder="FLA-A-01-002"
                                    className={`${inputCls} font-mono text-xs`}
                                />
                                <p className="mt-1 text-[10px] text-gray-400">
                                    Формат: ТИП-БЛОК-ЭТАЖ-№
                                </p>
                            </div>

                            {/* Внешний код */}
                            <div>
                                <label className={labelCls}>Внешний код</label>
                                <input
                                    value={form.external_code ?? ''}
                                    onChange={(e) => set('external_code', e.target.value || null)}
                                    placeholder="EXT-001"
                                    className={inputCls}
                                />
                            </div>

                            {/* № лота */}
                            <div>
                                <label className={labelCls}>№ лота *</label>
                                <input
                                    value={form.unit_number ?? ''}
                                    onChange={(e) => set('unit_number', e.target.value)}
                                    placeholder="Напр. 15"
                                    className={errors.unit_number ? inputErrCls : inputCls}
                                />
                                {errors.unit_number && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.unit_number}
                                    </p>
                                )}
                            </div>

                            {/* Кадастровый номер */}
                            <div>
                                <label className={labelCls}>Кадастровый номер</label>
                                <input
                                    value={form.cadastral_number ?? ''}
                                    onChange={(e) =>
                                        set('cadastral_number', e.target.value || null)
                                    }
                                    placeholder="1-02-03-0004-0005"
                                    className={inputCls}
                                />
                            </div>
                            {/* </div>
                    </div> */}

                            {/*2. ТИП ЛОТА + КОМНАТЫ (в одной строке)*/}
                            {/* <div>
                        <div className="grid items-start grid-cols-2 gap-4">
                            <p className={labelCls}>Тип лота</p> */}
                            <div>
                                <p className={labelCls}>Тип лота</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {LOT_TYPE_OPTIONS.map((lt) => {
                                        const active = form.lot_type === lt.value;
                                        const Icon = lt.icon;
                                        return (
                                            <button
                                                key={lt.value}
                                                type="button"
                                                onClick={() => set('lot_type', lt.value)}
                                                className={`
                                                    inline-flex items-center gap-1 rounded-md border
                                                    px-2.5 py-1.5 text-xs font-medium transition-all
                                                    ${
                                                        active
                                                            ? 'bg-sky-500 border-sky-500 text-white shadow-sm'
                                                            : `bg-white border-gray-200 text-gray-600 hover:border-sky-300 ${lt.className}`
                                                    }
                                                `}
                                            >
                                                <Icon className="w-3 h-3" />
                                                {lt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.lot_type && (
                                    <p className="mt-1 text-xs text-red-600">{errors.lot_type}</p>
                                )}
                            </div>

                            {/* Комнаты (только 1, 2, 3, 4) */}
                            {/* {form.lot_type === 'apartment' && ( */}
                            <div>
                                <label className={labelCls}>Комнат</label>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => set('rooms', r)}
                                            className={`w-8 h-7 text-xs rounded-lg border-2 font-semibold transition-all ${
                                                form.rooms === r
                                                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* )} */}
                        </div>
                    </div>

                    {/*3. СТАТУС + ПЛОЩАДИ (в одной строке)*/}
                    <div className="grid items-start grid-cols-[1fr_auto] gap-4">
                        {/* Статус */}
                        <div>
                            <p className={labelCls}>Статус</p>

                            <div className="flex flex-wrap gap-1.5">
                                {unitStatuses.map((us) => {
                                    const active = form.status_id === us.id;

                                    return (
                                        <button
                                            key={us.id}
                                            type="button"
                                            onClick={() => set('status_id', us.id)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-all border rounded-md"
                                            style={
                                                active
                                                    ? {
                                                          backgroundColor: `${us.color}20`,
                                                          borderColor: us.color,
                                                          color: us.color,
                                                          boxShadow: `0 0 0 2px ${us.color}30`,
                                                      }
                                                    : {
                                                          backgroundColor: `${us.color}08`,
                                                          borderColor: `${us.color}30`,
                                                          color: `${us.color}90`,
                                                      }
                                            }
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{
                                                    backgroundColor: active
                                                        ? us.color
                                                        : `${us.color}50`,
                                                }}
                                            />
                                            {us.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Общая площадь */}
                        <div className="w-44">
                            <label className={`${labelCls} text-right block`}>Общая площадь</label>

                            <input
                                type="number"
                                step="0.01"
                                value={form.area_total ?? ''}
                                onChange={(e) => set('area_total', e.target.value || null)}
                                placeholder="55.00"
                                className={errors.area_total ? inputErrCls : inputCls}
                            />

                            {errors.area_total && (
                                <p className="mt-1 text-xs text-red-600">{errors.area_total}</p>
                            )}
                        </div>
                    </div>

                    {/*4. СТОИМОСТЬ*/}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className={labelCls}>Цена</label>
                            <input
                                type="number"
                                value={form.price_total ?? ''}
                                onChange={(e) => set('price_total', e.target.value || null)}
                                placeholder="5 500 000"
                                className={errors.price_total ? inputErrCls : inputCls}
                            />
                            {errors.price_total && (
                                <p className="mt-1 text-xs text-red-600">{errors.price_total}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>Цена за м²</label>
                            <input
                                type="number"
                                value={form.price_per_m2 ?? ''}
                                onChange={(e) => set('price_per_m2', e.target.value || null)}
                                placeholder="Авто"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Валюта</label>
                            <select
                                value={form.currency ?? 1}
                                onChange={(e) => set('currency', +e.target.value)}
                                className={inputCls}
                            >
                                <option value={1}>KZT ()</option>
                                {refs.currencies?.data?.map((c: EnumItem) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/*5. ОПИСАНИЕ*/}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Описание</label>
                            <textarea
                                value={form.description ?? ''}
                                onChange={(e) => set('description', e.target.value || null)}
                                rows={3}
                                className={inputCls + ' resize-none'}
                                placeholder="Описание лота..."
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Комментарий</label>
                            <textarea
                                value={form.comment ?? ''}
                                onChange={(e) => set('comment', e.target.value || null)}
                                rows={3}
                                className={inputCls + ' resize-none'}
                                placeholder="Комментарий..."
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit as never}
                        disabled={submitting}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm ${
                            isEdit
                                ? 'bg-amber-500 hover:bg-amber-600'
                                : 'bg-sky-600 hover:bg-sky-700'
                        }`}
                    >
                        {submitting
                            ? isEdit
                                ? 'Сохранение...'
                                : 'Создание...'
                            : isEdit
                              ? 'Сохранить изменения'
                              : 'Создать лот'}
                    </button>
                </div>
            </div>
        </div>
    );
}
