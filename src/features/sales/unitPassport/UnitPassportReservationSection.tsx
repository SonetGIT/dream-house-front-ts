import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import type {
    SalesClient,
    SalesPayment,
    SalesReservation,
} from '@/features/sales/slices/salesUnitPassportSlice';

type UnitPassportReservationSectionProps = {
    client: SalesClient;
    reservations: SalesReservation[];
    getReservationStatusName?: (reservation: SalesReservation) => string;
    getReservationPayments?: (reservation: SalesReservation) => SalesPayment[];
    isActiveReservation?: (reservation: SalesReservation) => boolean;
    hasActiveReservation?: boolean;
    onCreateReservation?: (payload?: { client_id?: number | null }) => void;
    onAddPayment?: (reservation: SalesReservation) => void;
    onEditReservation?: (reservation: SalesReservation) => void;
    onCancelReservation?: (reservation: SalesReservation) => void;
};

export function UnitPassportReservationSection({
    client,
    reservations,
    getReservationStatusName,
    getReservationPayments,
    isActiveReservation,
    hasActiveReservation,
    onCreateReservation,
    onAddPayment,
    onEditReservation,
    onCancelReservation,
}: UnitPassportReservationSectionProps) {
    return (
        <section>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <CalendarClock size={14} className="text-orange-600" />
                    Брони
                </div>

                {!hasActiveReservation ? (
                    <button
                        type="button"
                        title="Создать бронь"
                        onClick={() => onCreateReservation?.({ client_id: client.id })}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white transition hover:bg-orange-600"
                    >
                        <Plus size={14} />
                        Бронь
                    </button>
                ) : null}
            </div>

            {reservations.length ? (
                <div className="overflow-hidden border border-orange-100 rounded-md">
                    <div className="grid grid-cols-[1.2fr_100px_100px_110px_130px_180px] bg-orange-50 p-1.5 font-semibold uppercase tracking-wide text-orange-500">
                        <div className="text-[12px]">Статус</div>
                        <div className="text-[11px]">с</div>
                        <div className="text-[11px]">по</div>
                        <div className="text-[11px]">Сумма</div>
                        <div className="text-[11px]">Клиент</div>
                        <div className="text-[11px] text-right">Действия</div>
                    </div>

                    {reservations.map((reservation) => {
                        const payments = getReservationPayments?.(reservation) || [];
                        const active = isActiveReservation?.(reservation) ?? false;

                        return (
                            <div key={reservation.id} className="border-t border-stone-100">
                                <div className="grid grid-cols-[1.2fr_100px_100px_110px_130px_180px] items-center px-3 py-2.5 text-sm text-slate-700">
                                    <div className="text-xs font-medium text-blue-800">
                                        {getReservationStatusName?.(reservation) ||
                                            `Статус #${reservation.status}`}
                                    </div>

                                    <div className="text-xs">
                                        {formatDate(reservation.start_at)}
                                    </div>

                                    <div className="text-xs">
                                        {formatDate(reservation.expires_at)}
                                    </div>

                                    <div className="text-xs font-medium text-green-800">
                                        {formatCurrency(reservation.reservation_amount)}
                                    </div>

                                    <div className="text-xs truncate text-slate-800">
                                        {client.full_name}
                                    </div>

                                    <div className="flex justify-end gap-1">
                                        {active ? (
                                            <>
                                                <button
                                                    type="button"
                                                    title="Добавить платеж по брони"
                                                    onClick={() => onAddPayment?.(reservation)}
                                                    className="inline-flex h-8 items-center rounded-lg bg-blue-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-blue-500"
                                                >
                                                    +Платеж по брони
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Редактировать бронь"
                                                    onClick={() => onEditReservation?.(reservation)}
                                                    className="flex items-center justify-center w-8 h-8 transition rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                >
                                                    <Pencil size={14} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Снять бронь"
                                                    onClick={() =>
                                                        onCancelReservation?.(reservation)
                                                    }
                                                    className="flex items-center justify-center w-8 h-8 text-red-600 transition rounded-lg bg-red-50 hover:bg-red-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="px-3 py-2 border-t border-stone-100 bg-orange-50/40">
                                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-orange-600">
                                        Платежи по брони
                                    </div>

                                    {payments.length ? (
                                        <div className="space-y-1.5">
                                            {payments.map((payment) => (
                                                <div
                                                    key={payment.id}
                                                    className="flex items-start justify-between gap-2 rounded-lg border border-orange-100 bg-white px-2.5 py-2"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-semibold truncate text-slate-700">
                                                            {payment.title || 'Платеж'}
                                                        </div>
                                                        <div className="mt-0.5 text-[11px] text-slate-500">
                                                            {formatDate(
                                                                payment.paid_date ||
                                                                    payment.planned_date,
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-xs font-semibold shrink-0 text-emerald-700">
                                                        {formatCurrency(payment.amount)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-3 py-3 text-xs text-center bg-white border border-orange-200 border-dashed rounded-lg text-slate-500">
                                            Платежей по этой брони пока нет
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="px-4 py-6 text-sm text-center bg-white border border-dashed rounded-2xl border-stone-300 text-rose-400">
                    Броней по этой квартире пока нет
                </div>
            )}
        </section>
    );
}
