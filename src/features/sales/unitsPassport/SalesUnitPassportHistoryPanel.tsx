import { Plus } from 'lucide-react';
import type { SalesClient } from '../slices/salesUnitPassportSlice';
import { SalesUnitPassportClientAccardion } from './SalesUnitPassportClientAccardion';

export type SalesUnitPassportHistoryPanelProps = {
    clients: SalesClient[];
};
export function SalesUnitPassportHistoryPanel({ clients }: SalesUnitPassportHistoryPanelProps) {
    return (
        <div className="flex-1 px-2 py-2 overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">История клиента</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        История брони, сделки, платежей, и по графику платежей
                    </p>
                </div>

                {clients?.length ? (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                            // onClick={() => onCreateDeal()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-emerald-600 rounded-lg h-8 px-3.5 hover:bg-emerald-700 active:scale-95 shadow-sm"
                        >
                            <Plus size={14} />
                            Выкуп
                        </button>

                        {/* {!hasActiveReservation ? ( */}
                        <button
                            // onClick={() => onCreateReservation()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-blue-600 rounded-lg h-8 px-3.5 hover:bg-blue-700 active:scale-95 shadow-sm"
                        >
                            <Plus size={14} />
                            Создать бронь
                        </button>
                        {/* ) : null} */}
                    </div>
                ) : null}
            </div>

            {clients?.length > 0 ? (
                <div className="space-y-3">
                    {clients.map((client) => (
                        <SalesUnitPassportClientAccardion key={client.id} client={client} />
                    ))}
                </div>
            ) : (
                <div className="px-4 py-6 text-center bg-white border border-dashed rounded-2xl border-stone-300">
                    <p className="text-sm text-rose-400">По квартире пока нет истории клиентов</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        <button
                            // onClick={() => onCreateDeal()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-emerald-600 rounded-lg h-8 px-3.5 hover:bg-emerald-700 active:scale-95 shadow-sm"
                        >
                            <Plus size={14} />
                            Выкуп
                        </button>

                        {/* {!hasActiveReservation ? ( */}
                        <button
                            // onClick={() => onCreateReservation()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-blue-600 rounded-lg h-8 px-3.5 hover:bg-blue-700 active:scale-95 shadow-sm"
                        >
                            <Plus size={14} />
                            Создать бронь
                        </button>
                        {/* ) : null} */}
                    </div>
                </div>
            )}
        </div>
    );
}
