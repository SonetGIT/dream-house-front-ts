import { Plus } from 'lucide-react';
import type { SalesClient, SalesDeal, SalesReservation } from '../slices/salesUnitPassportSlice';
import { UnitPassportClientAccardion } from './UnitPassportClientAccardion';

export type UnitPassportHistoryPanelProps = {
    clients: SalesClient[];
    hasBlockedReservation: boolean;
    onCreateReservation: (payload?: { client_id?: number | null }) => void;
    onCreateDeal: (payload?: { client_id?: number | null; reservation_id?: number | null }) => void;
    onAddReservationPayment: (reservation: SalesReservation, clientId: number) => void;
    onEditReservation: (reservation: SalesReservation) => void;
    onCancelReservation: (reservation: SalesReservation) => void;
    isReservationActive: (reservation: SalesReservation) => boolean;
    onEditDeal: (deal: SalesDeal) => void;
    isDealDraft: (deal: SalesDeal) => boolean;
    onSignDeal: (deal: SalesDeal) => void;
    onCancelDeal: (deal: SalesDeal) => void;
    onDealFiles: (deal: SalesDeal) => void;
    onAddDealPayment: (deal: SalesDeal) => void;
    onOpenDealSchedule: (deal: SalesDeal) => void;
    onDownloadDealSchedule: (deal: SalesDeal) => void;
};
export function UnitPassportHistoryPanel({
    clients,
    hasBlockedReservation,
    onCreateReservation,
    onCreateDeal,
    onAddReservationPayment,
    onEditReservation,
    onCancelReservation,
    isReservationActive,
    onEditDeal,
    isDealDraft,
    onSignDeal,
    onCancelDeal,
    onDealFiles,
    onAddDealPayment,
    onOpenDealSchedule,
    onDownloadDealSchedule,
}: UnitPassportHistoryPanelProps) {
    const reservationButtonClass = hasBlockedReservation
        ? 'bg-slate-300 text-white cursor-not-allowed'
        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm';

    return (
        <div className="flex-1 px-2 py-2 overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">История клиента</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        История брони, сделки, платежей, и по графику платежей
                    </p>
                    {hasBlockedReservation ? (
                        <p className="mt-1 text-xs font-medium text-amber-600">
                            Новую бронь создать нельзя, пока есть активная или подтвержденная бронь.
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => onCreateDeal()}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-emerald-600 rounded-lg h-8 px-3.5 hover:bg-emerald-700 active:scale-95 shadow-sm"
                    >
                        <Plus size={14} />
                        Выкуп
                    </button>

                    {/* {!hasActiveReservation ? ( */}
                    <button
                        type="button"
                        onClick={() => onCreateReservation()}
                        disabled={hasBlockedReservation}
                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition rounded-lg h-8 px-3.5 ${reservationButtonClass}`}
                    >
                        <Plus size={14} />
                        Создать бронь
                    </button>
                    {/* ) : null} */}
                </div>
            </div>

            {clients?.length > 0 ? (
                <div className="space-y-3">
                    {clients.map((client) => (
                        <UnitPassportClientAccardion
                            key={client.id}
                            client={client}
                            hasBlockedReservation={hasBlockedReservation}
                            onCreateReservation={onCreateReservation}
                            onAddReservationPayment={onAddReservationPayment}
                            onEditReservation={onEditReservation}
                            onCancelReservation={onCancelReservation}
                            isReservationActive={isReservationActive}
                            onCreateDeal={onCreateDeal}
                            onEditDeal={onEditDeal}
                            isDealDraft={isDealDraft}
                            onSignDeal={onSignDeal}
                            onCancelDeal={onCancelDeal}
                            onDealFiles={onDealFiles}
                            onAddDealPayment={onAddDealPayment}
                            onOpenDealSchedule={onOpenDealSchedule}
                            onDownloadDealSchedule={onDownloadDealSchedule}
                        />
                    ))}
                </div>
            ) : (
                <div className="px-4 py-6 text-center bg-white border border-dashed rounded-2xl border-stone-300">
                    <p className="text-sm text-rose-400">По квартире пока нет истории клиентов</p>
                </div>
            )}
        </div>
    );
}
