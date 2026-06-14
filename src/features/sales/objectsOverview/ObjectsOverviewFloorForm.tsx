import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Pencil } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    createSalesFloor,
    updateSalesFloor,
    type SalesFloor,
    type SalesFloorCreatePayload,
} from '../slices/salesFloorsSlice';
import toast from 'react-hot-toast';

interface Props {
    mode: 'create' | 'edit';
    floor?: SalesFloor;
    projectId?: number;
    onClose: () => void;
    onSuccess?: () => void; // <-- Колбэк для уведомления родителя об успехе
}

const inputCls =
    'w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all';
const inputErrCls =
    'w-full px-3 py-2 text-sm text-gray-900 bg-white border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all';
const labelCls =
    'flex items-center gap-2 py-2 mb-1 text-sm font-semibold text-sky-800 rounded-r-lg';

type Errors = Partial<Record<string, string>>;

export default function ObjectsOverviewFloorForm({
    mode,
    floor,
    projectId,
    onClose,
    onSuccess,
}: Props) {
    const dispatch = useAppDispatch();
    const { projects, blocks } = useAppSelector((s) => s.salesObjOverview);

    const project = projects.find((p) => p.id === projectId);

    const [form, setForm] = useState<Partial<SalesFloorCreatePayload>>(() => {
        if (floor) {
            return {
                project_id: floor.project_id,
                block_id: floor.block_id,
                floor_number: floor.floor_number,
                name: floor.name,
                sort_order: floor.sort_order,
            };
        }

        return {
            project_id: projectId,
            sort_order: 1,
        };
    });

    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);

    const isEdit = mode === 'edit';

    const projectBlocks = useMemo(
        () => blocks.filter((b) => b.project_id === form.project_id),
        [blocks, form.project_id],
    );

    // Автоподбор номера этажа при выборе блока (только при создании)
    useEffect(() => {
        if (mode === 'create' && form.block_id) {
            const selectedBlock = blocks.find((b) => b.id === form.block_id);
            if (selectedBlock?.floors && selectedBlock.floors.length > 0) {
                const maxFloor = Math.max(...selectedBlock.floors.map((f) => f.floor_number));
                set('floor_number', maxFloor + 1);
            } else {
                set('floor_number', 1);
            }
        }
    }, [mode, form.block_id, blocks]);

    function set<K extends keyof SalesFloorCreatePayload>(
        key: K,
        value: SalesFloorCreatePayload[K],
    ) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));

        if (errors[key as string]) {
            setErrors((prev) => ({
                ...prev,
                [key]: '',
            }));
        }
    }

    function validate() {
        const e: Errors = {};

        if (!form.block_id) {
            e.block_id = 'Выберите блок';
        }

        if (form.floor_number === undefined || form.floor_number === null) {
            e.floor_number = 'Введите номер этажа';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!validate()) return;

        setSubmitting(true);

        try {
            if (isEdit && floor) {
                await dispatch(
                    updateSalesFloor({
                        id: floor.id,
                        payload: form,
                    }),
                ).unwrap(); // Исправлена опечатка

                toast.success('Этаж обновлён'); // Исправлена опечатка
            } else {
                await dispatch(createSalesFloor(form as SalesFloorCreatePayload)).unwrap();
                toast.success('Этаж создан'); // Исправлена опечатка
            }

            // 1. Сообщаем родителю, что нужно обновить данные
            onSuccess?.();
            // 2. Закрываем модалку
            onClose();
        } catch (err: any) {
            const errorMessage = err?.message || err?.data?.message || 'Произошла ошибка';
            toast.error(`Ошибка: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-white">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                                isEdit ? 'bg-amber-500' : 'bg-violet-600'
                            }`}
                        >
                            {isEdit ? (
                                <Pencil size={15} className="text-white" />
                            ) : (
                                <Plus size={15} className="text-white" />
                            )}
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-gray-900">
                                {isEdit ? 'Редактировать этаж' : 'Создать этаж'}
                            </h2>
                            {floor && (
                                <p className="text-xs text-gray-500">Этаж №{floor.floor_number}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* ОБЪЕКТ */}
                        <div>
                            <label className={labelCls}>Объект</label>
                            <input
                                value={project?.name ?? ''}
                                readOnly
                                className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                            />
                        </div>

                        {/* БЛОК */}
                        <div>
                            <label className={labelCls}>Блок</label>
                            <select
                                value={form.block_id ?? ''}
                                disabled={!form.project_id}
                                onChange={(e) => set('block_id', Number(e.target.value))}
                                className={errors.block_id ? inputErrCls : inputCls}
                            >
                                <option value="">Выберите блок</option>
                                {projectBlocks.map((block) => (
                                    <option key={block.id} value={block.id}>
                                        {block.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* НОМЕР ЭТАЖА */}
                        <div>
                            <label className={labelCls}>Номер этажа *</label>
                            <input
                                type="number"
                                value={form.floor_number ?? ''}
                                onChange={(e) => set('floor_number', Number(e.target.value))}
                                placeholder="1"
                                className={errors.floor_number ? inputErrCls : inputCls}
                            />
                        </div>

                        {/* НАЗВАНИЕ */}
                        <div>
                            <label className={labelCls}>Название</label>
                            <input
                                value={form.name ?? ''}
                                onChange={(e) => set('name', e.target.value || null)}
                                placeholder="Первый этаж"
                                className={inputCls}
                            />
                        </div>

                        {/* ПОРЯДОК */}
                        <div>
                            <label className={labelCls}>Порядок сортировки</label>
                            <input
                                type="number"
                                value={form.sort_order ?? ''}
                                onChange={(e) => set('sort_order', Number(e.target.value) || null)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                                isEdit
                                    ? 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300'
                                    : 'bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400'
                            }`}
                        >
                            {submitting
                                ? isEdit
                                    ? 'Сохранение...'
                                    : 'Создание...'
                                : isEdit
                                  ? 'Сохранить'
                                  : 'Создать этаж'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
