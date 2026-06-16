import type { SalesOverviewUnit } from '@/features/sales/slices/salesObjOverviewSlice';

interface MatrixUnitStatus {
    id: number;
    name: string;
    code: string;
    color: string;
}

interface Props {
    floorLabel: string;
    units: SalesOverviewUnit[];
    selectedUnit: SalesOverviewUnit | null;
    selectedUnitId: number | null;
    statusMap: Map<number, MatrixUnitStatus>;
    onSelectUnit: React.Dispatch<React.SetStateAction<number | null>>;
    formatArea: (value: number | null) => string;
    formatPrice: (value: number | null) => string;
}

export default function SalesMatrixSidebar({
    floorLabel,
    units,
    selectedUnit,
    selectedUnitId,
    statusMap,
    onSelectUnit,
    formatArea,
    formatPrice,
}: Props) {
    return (
        <div className="flex flex-col overflow-hidden bg-white border-l border-gray-200 w-60 shrink-0">
            <div className="shrink-0 border-b border-gray-100 px-3 py-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{floorLabel}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                        {units.length}
                    </span>
                </div>

                {units.length ? (
                    <div className="mt-2 flex h-1.5 overflow-hidden rounded-full gap-px">
                        {Array.from(statusMap.values()).map((status) => {
                            const count = units.filter(
                                (unit) => unit.status_id === status.id,
                            ).length;

                            return count ? (
                                <div
                                    key={status.id}
                                    style={{ flex: count, backgroundColor: status.color }}
                                    title={status.name}
                                />
                            ) : null;
                        })}
                    </div>
                ) : null}
            </div>

            {selectedUnit ? (
                <div className="p-3 mx-3 my-2 border shrink-0 rounded-xl border-sky-100 bg-sky-50">
                    <div className="mb-1.5 flex items-start justify-between gap-1">
                        <span className="text-base font-bold text-sky-900">
                            №{selectedUnit.unit_number}
                        </span>
                        <button
                            onClick={() => onSelectUnit(null)}
                            className="text-gray-300 hover:text-gray-500"
                        >
                            ×
                        </button>
                    </div>

                    {(() => {
                        const status = selectedUnit.status_id
                            ? statusMap.get(selectedUnit.status_id)
                            : null;

                        return (
                            <span
                                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                                style={{
                                    backgroundColor: `${status?.color ?? '#999'}18`,
                                    borderColor: `${status?.color ?? '#999'}60`,
                                    color: status?.color ?? '#666',
                                }}
                            >
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: status?.color ?? '#999' }}
                                />
                                {status?.name ?? '—'}
                            </span>
                        );
                    })()}

                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                        <div>
                            <span className="block text-gray-400">Площадь</span>
                            <span className="font-medium text-gray-800">
                                {formatArea(selectedUnit.area_total)}
                            </span>
                        </div>
                        <div>
                            <span className="block text-gray-400">Цена</span>
                            <span className="font-medium text-gray-800">
                                {formatPrice(selectedUnit.price_total)}
                            </span>
                        </div>
                        {selectedUnit.rooms ? (
                            <div>
                                <span className="block text-gray-400">Комнат</span>
                                <span className="font-medium text-gray-800">
                                    {selectedUnit.rooms}
                                </span>
                            </div>
                        ) : null}
                        <div>
                            <span className="block text-gray-400">Тип</span>
                            <span className="font-medium text-gray-800 capitalize">
                                {selectedUnit.lot_type}
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {!units.length ? (
                    <div className="p-6 text-xs text-center text-gray-400">
                        Нет лотов на этом этаже
                    </div>
                ) : (
                    units.map((unit) => {
                        const status = unit.status_id ? statusMap.get(unit.status_id) : null;
                        const isSelected = unit.id === selectedUnitId;

                        return (
                            <button
                                key={unit.id}
                                onClick={() =>
                                    onSelectUnit((prev) => (prev === unit.id ? null : unit.id))
                                }
                                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                                    isSelected ? 'bg-sky-50' : 'hover:bg-gray-50'
                                }`}
                            >
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: status?.color ?? '#d1d5db' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div
                                        className={`truncate text-sm font-medium ${
                                            isSelected ? 'text-sky-700' : 'text-gray-800'
                                        }`}
                                    >
                                        №{unit.unit_number}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                        {formatArea(unit.area_total)}
                                    </div>
                                </div>
                                <span
                                    className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
                                    style={{
                                        backgroundColor: `${status?.color ?? '#999'}15`,
                                        borderColor: `${status?.color ?? '#999'}40`,
                                        color: status?.color ?? '#666',
                                    }}
                                >
                                    {status?.name ?? '—'}
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
