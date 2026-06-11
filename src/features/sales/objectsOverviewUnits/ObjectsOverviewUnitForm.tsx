import { useState, useEffect } from 'react';
import { X, Home, Store, Car, Package, Plus, Pencil } from 'lucide-react';
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

interface Props {
    mode: 'create' | 'edit';
    unit?: SalesUnit;
    onClose: () => void;
}

const LOT_TYPES = [
    {
        value: 'apartment',
        label: 'Квартира',
        Icon: Home,
        cls: 'border-sky-300 text-sky-700 bg-sky-50',
    },
    {
        value: 'commercial',
        label: 'Помещение',
        Icon: Store,
        cls: 'border-purple-300 text-purple-700 bg-purple-50',
    },
    {
        value: 'parking',
        label: 'Паркинг',
        Icon: Car,
        cls: 'border-slate-300 text-slate-600 bg-slate-50',
    },
    {
        value: 'storage',
        label: 'Кладовая',
        Icon: Package,
        cls: 'border-orange-300 text-orange-600 bg-orange-50',
    },
];

const inputCls =
    'w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all';
const inputErrCls =
    'w-full px-3 py-2 text-sm text-gray-900 bg-white border border-red-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-transparent transition-all';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';
const sectionCls =
    'pb-2 mb-4 text-sm font-semibold text-gray-900 border-b border-gray-200 flex items-center gap-2';

type Errors = Partial<Record<string, string>>;

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

export function UnitFormModal({ mode, unit, onClose }: Props) {
    const dispatch = useAppDispatch();
    const { projects, blocks } = useAppSelector((s) => s.salesObjOverview);
    const { unitStatuses } = useAppSelector((s) => s.salesDictionaries);

    const [form, setForm] = useState<Partial<SalesUnitCreatePayload>>(() => initForm(unit));
    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);
    const [floors, setFloors] = useState<SalesUnitFloor[]>([]);
    const [loadingFloors, setLoadingFloors] = useState(false);

    const projectBlocks = blocks.filter((b) => form.project_id && b.project_id === form.project_id);

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

    /*************************************************************************************************************************/
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${isEdit ? 'bg-amber-500' : 'bg-sky-500'}`}
                        >
                            {isEdit ? (
                                <Pencil size={13} className="text-white" />
                            ) : (
                                <Plus size={14} className="text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                {isEdit ? `Редактировать лот` : 'Создать лот'}
                            </h2>
                            {isEdit && unit && (
                                <p className="text-xs text-gray-400">{unit.unit_number}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 px-6 py-5 space-y-6 overflow-y-auto"
                >
                    {/* РАСПОЛОЖЕНИЕ */}
                    <div>
                        <p className={sectionCls}>
                            <Home size={14} className="text-gray-400" />
                            Расположение
                        </p>
                        <div className="grid grid-cols-2 gap-4">
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

                            <div>
                                <label className={labelCls}>Номер лота *</label>
                                <input
                                    value={form.unit_number ?? ''}
                                    onChange={(e) => set('unit_number', e.target.value)}
                                    placeholder="Напр. А-0101"
                                    className={errors.unit_number ? inputErrCls : inputCls}
                                />
                                {errors.unit_number && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.unit_number}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelCls}>Плановый код</label>
                                <input
                                    value={form.plan_code ?? ''}
                                    onChange={(e) => set('plan_code', e.target.value || null)}
                                    placeholder="PL-0001"
                                    className={inputCls}
                                />
                            </div>

                            <div>
                                <label className={labelCls}>Внешний код</label>
                                <input
                                    value={form.external_code ?? ''}
                                    onChange={(e) => set('external_code', e.target.value || null)}
                                    placeholder="EXT-001"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ТИП */}
                    <div>
                        <p className={sectionCls}>
                            <Package size={14} className="text-gray-400" />
                            Тип лота
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {LOT_TYPES.map(({ value, label, Icon, cls }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => set('lot_type', value)}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border-2 transition-colors font-medium ${form.lot_type === value ? cls + ' ring-2 ring-offset-1 ring-sky-400' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                >
                                    <Icon size={14} />
                                    {label}
                                </button>
                            ))}
                        </div>
                        {errors.lot_type && (
                            <p className="mt-1 text-xs text-red-600">{errors.lot_type}</p>
                        )}

                        {form.lot_type === 'apartment' && (
                            <div className="mt-4">
                                <label className={labelCls}>Комнат</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => set('rooms', r)}
                                            className={`w-10 h-10 text-sm rounded-xl border-2 font-semibold transition-colors ${form.rooms === r ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => set('rooms', undefined as never)}
                                        className={`px-3 h-10 text-sm rounded-xl border-2 font-medium transition-colors ${!form.rooms ? 'border-gray-400 bg-gray-50 text-gray-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                                    >
                                        Студия
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ПЛОЩАДИ */}
                    <div>
                        <p className={sectionCls}>Площади (м²)</p>
                        <div className="grid grid-cols-4 gap-3">
                            <div>
                                <label className={labelCls}>Общая</label>
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
                    </div>

                    {/* СТОИМОСТЬ И СТАТУС */}
                    <div>
                        <p className={sectionCls}>Стоимость и статус</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Цена (₸)</label>
                                <input
                                    type="number"
                                    value={form.price_total ?? ''}
                                    onChange={(e) => set('price_total', e.target.value || null)}
                                    placeholder="5 500 000"
                                    className={errors.price_total ? inputErrCls : inputCls}
                                />
                                {errors.price_total && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.price_total}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className={labelCls}>Цена за м² (₸)</label>
                                <input
                                    type="number"
                                    value={form.price_per_m2 ?? ''}
                                    onChange={(e) => set('price_per_m2', e.target.value || null)}
                                    placeholder="Авто"
                                    className={inputCls}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className={labelCls}>Статус лота</label>
                                <div className="flex flex-wrap gap-2">
                                    {unitStatuses.map((st) => (
                                        <button
                                            key={st.id}
                                            type="button"
                                            onClick={() =>
                                                set(
                                                    'status_id',
                                                    form.status_id === st.id
                                                        ? (undefined as never)
                                                        : st.id,
                                                )
                                            }
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border-2 font-medium transition-all"
                                            style={
                                                form.status_id === st.id
                                                    ? {
                                                          backgroundColor: `${st.color}18`,
                                                          borderColor: st.color,
                                                          color: st.color,
                                                          outline: `2px solid ${st.color}30`,
                                                          outlineOffset: '2px',
                                                      }
                                                    : { borderColor: '#e5e7eb', color: '#6b7280' }
                                            }
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        form.status_id === st.id
                                                            ? st.color
                                                            : '#d1d5db',
                                                }}
                                            />
                                            {st.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center col-span-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        set('is_active_for_sale', !form.is_active_for_sale)
                                    }
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.is_active_for_sale ? 'bg-sky-500' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.is_active_for_sale ? 'translate-x-4' : 'translate-x-1'}`}
                                    />
                                </button>
                                <span className="text-sm text-gray-700">Доступен к продаже</span>
                            </div>
                        </div>
                    </div>

                    {/* ХАРАКТЕРИСТИКИ */}
                    <div>
                        <p className={sectionCls}>Характеристики</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>Отделка</label>
                                <select
                                    value={form.finish_type ?? ''}
                                    onChange={(e) => set('finish_type', e.target.value || null)}
                                    className={inputCls}
                                >
                                    <option value="">Не указана</option>
                                    {FINISH_TYPES.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className={labelCls}>Кадастровый номер</label>
                                <input
                                    value={form.cadastral_number ?? ''}
                                    onChange={(e) =>
                                        set('cadastral_number', e.target.value || null)
                                    }
                                    placeholder="05:00:000000:0000"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Менеджер</label>
                                <select
                                    value={form.manager_user_id ?? ''}
                                    onChange={(e) =>
                                        set('manager_user_id', +e.target.value || null)
                                    }
                                    className={inputCls}
                                >
                                    <option value="">Не назначен</option>
                                    {/* {MOCK_MANAGERS.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))} */}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ОПИСАНИЕ */}
                    <div>
                        <p className={sectionCls}>Описание и примечание</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Описание</label>
                                <textarea
                                    value={form.description ?? ''}
                                    onChange={(e) => set('description', e.target.value || null)}
                                    rows={3}
                                    className={inputCls + ' resize-none'}
                                    placeholder="Публичное описание лота..."
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Комментарий</label>
                                <textarea
                                    value={form.comment ?? ''}
                                    onChange={(e) => set('comment', e.target.value || null)}
                                    rows={3}
                                    className={inputCls + ' resize-none'}
                                    placeholder="Внутренний комментарий..."
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit as never}
                        disabled={submitting}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-sky-600 hover:bg-sky-700'}`}
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
