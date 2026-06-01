import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Building2, DollarSign, Home, Layers3, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { EnumItem } from '@/features/reference/referenceService';
import type { SalesOverviewProject } from '@/features/sales/slices/salesObjOverviewSlice';
import type { SalesLead } from '@/features/sales/slices/salesLeadsSlice';
import { fetchSalesUnits } from '@/features/sales/slices/salesUnitsSlice';

export interface ConvertSubmitPayload {
    projectId: number;
    blockId: number | null;
    unitId: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onConvert: (payload: ConvertSubmitPayload) => Promise<void>;
    converting: boolean;
    lead: SalesLead | null;
    projects: SalesOverviewProject[];
    blocks: EnumItem[];
}

const fieldClassName =
    'mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white disabled:opacity-60';

export default function ConvertDialog({
    open,
    onClose,
    onConvert,
    converting,
    lead,
    projects,
    blocks,
}: Props) {
    const dispatch = useAppDispatch();
    const { items: units, loading } = useAppSelector((state) => state.salesUnits);

    const [projectId, setProjectId] = useState('');
    const [blockId, setBlockId] = useState('');
    const [floorId, setFloorId] = useState('');
    const [unitId, setUnitId] = useState('');

    useEffect(() => {
        if (!open || !lead) return;

        setProjectId(lead.project_id ? String(lead.project_id) : '');
        setBlockId(lead.block_id ? String(lead.block_id) : '');
        setFloorId('');
        setUnitId(lead.unit_id ? String(lead.unit_id) : '');
    }, [lead, open]);

    useEffect(() => {
        if (!open || !blockId) return;

        dispatch(
            fetchSalesUnits({
                project_id: projectId ? Number(projectId) : undefined,
                block_id: Number(blockId),
                page: 1,
                size: 200,
            }),
        );
    }, [blockId, dispatch, open, projectId]);

    const filteredBlocks = useMemo(() => {
        if (!projectId) {
            return blocks;
        }

        return blocks.filter((block) => Number(block.project_id) === Number(projectId));
    }, [blocks, projectId]);

    const floors = useMemo(() => {
        const floorsMap = new Map<
            number,
            { id: number; floor_number: number; name: string | null }
        >();

        units.forEach((unit) => {
            if (unit.floor) {
                floorsMap.set(unit.floor.id, {
                    id: unit.floor.id,
                    floor_number: unit.floor.floor_number,
                    name: unit.floor.name,
                });
            }
        });

        return Array.from(floorsMap.values()).sort((a, b) => a.floor_number - b.floor_number);
    }, [units]);

    const floorUnits = useMemo(
        () => units.filter((unit) => Number(unit.floor_id) === Number(floorId)),
        [floorId, units],
    );

    const selectedUnit = useMemo(
        () => floorUnits.find((unit) => Number(unit.id) === Number(unitId)) ?? null,
        [floorUnits, unitId],
    );

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
            onClick={onClose}
        >
            <div
                className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Конвертация лида в клиента
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {lead?.full_name || lead?.phone || 'Лид'} — выберите объект и лот
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

                <div className="px-6 py-5 space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-xs font-medium text-slate-500">
                            Объект
                            <select
                                value={projectId}
                                onChange={(e) => {
                                    setProjectId(e.target.value);
                                    setBlockId('');
                                    setFloorId('');
                                    setUnitId('');
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
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Блок
                            <select
                                value={blockId}
                                onChange={(e) => {
                                    setBlockId(e.target.value);
                                    setFloorId('');
                                    setUnitId('');
                                }}
                                className={fieldClassName}
                            >
                                <option value="">Выберите блок</option>
                                {filteredBlocks.map((block) => (
                                    <option key={String(block.id)} value={String(block.id)}>
                                        {block.name ?? `Блок #${block.id}`}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Этаж
                            <select
                                value={floorId}
                                onChange={(e) => {
                                    setFloorId(e.target.value);
                                    setUnitId('');
                                }}
                                className={fieldClassName}
                                disabled={!blockId}
                            >
                                <option value="">Выберите этаж</option>
                                {floors.map((floor) => (
                                    <option key={floor.id} value={String(floor.id)}>
                                        {floor.name || `${floor.floor_number} этаж`}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                            Лот
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className={fieldClassName}
                                disabled={!floorId}
                            >
                                <option value="">Выберите лот</option>
                                {floorUnits.map((unit) => (
                                    <option key={unit.id} value={String(unit.id)}>
                                        №{unit.unit_number} • {unit.area_total} м² •{' '}
                                        {unit.price_total} {unit.currency_info?.code || ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="p-4 border rounded-2xl border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-900">
                            <Home className="w-4 h-4 text-slate-500" />
                            Выбранный лот
                        </div>

                        {selectedUnit ? (
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="px-3 py-2 bg-white rounded-xl">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Building2 className="h-3.5 w-3.5" />
                                        Номер
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">
                                        №{selectedUnit.unit_number}
                                    </div>
                                </div>
                                <div className="px-3 py-2 bg-white rounded-xl">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Layers3 className="h-3.5 w-3.5" />
                                        Площадь
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">
                                        {selectedUnit.area_total || '—'} м²
                                    </div>
                                </div>
                                <div className="px-3 py-2 bg-white rounded-xl">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        Стоимость
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">
                                        {selectedUnit.price_total || '—'}{' '}
                                        {selectedUnit.currency_info?.code || ''}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="px-4 py-5 text-sm bg-white border border-dashed rounded-xl border-slate-200 text-slate-500">
                                {loading
                                    ? 'Загружаем лоты для выбранного блока...'
                                    : 'Выберите этаж и лот для конвертации.'}
                            </div>
                        )}
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
                            disabled={converting || !projectId || !unitId}
                            onClick={() =>
                                onConvert({
                                    projectId: Number(projectId),
                                    blockId: blockId ? Number(blockId) : null,
                                    unitId: Number(unitId),
                                })
                            }
                            className="inline-flex items-center h-10 px-5 text-sm font-medium text-white transition rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
                        >
                            {converting ? 'Создаем клиента...' : 'Создать клиента'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
