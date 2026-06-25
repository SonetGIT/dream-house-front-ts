import {
    CalendarClock,
    FileText,
    Mail,
    Pencil,
    Phone,
    Plus,
    Trash2,
    User,
    User2,
    Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import type { SalesClient, SalesReservation } from '../slices/salesUnitPassportSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { UnitPassportDeal } from './UnitPassportDeal';

export const SalesUnitPassportClientAccardion = ({ client }: any) => {
    // const statusClass =
    //     clients.status === 'current'
    //         ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    //         : clients.status === 'reservation'
    //           ? 'border-orange-200 bg-orange-50 text-orange-700'
    //           : 'border-blue-200 bg-blue-50 text-blue-700';

    // const reservationPayments = getReservationPayments(group);
    // const paymentsCount =
    //     group.deals.reduce(
    //         (sum: number, deal: PassportDeal) => sum + getDealPayments(deal.id).length,
    //         0,
    //     ) + reservationPayments.length;
    // const activeGroupReservation =
    //     group.reservations.find((item: PassportReservationBrief) => isActiveReservation(item)) ||
    //     null;

    return (
        <div className="overflow-hidden bg-white border rounded-md border-stone-200">
            <button
                type="button"
                // onClick={onToggle}
                className="w-full px-2 py-2 text-left transition hover:bg-slate-50"
            >
                <div className="flex items-center justify-between gap-3">
                    <div key={client.id} className="p-4 rounded-xl border-slate-200">
                        {/* ИНФОРМАЦИЯ О КЛИЕНТЕ */}
                        <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-100 rounded-full shrink-0">
                                <User size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="mb-2 text-base font-semibold text-left text-slate-800">
                                    {client.full_name || 'Клиент не указан'}
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-left">
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                        <Phone size={14} className="text-blue-600 shrink-0" />
                                        <span className="truncate">{client.phone || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-400">
                                        <span>ПИН: {client.pin || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-400">
                                        <Mail size={14} className="shrink-0" />
                                        <span>{client.email || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-400">
                                        <span>№паспорта: {client.passport_number || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </button>
            {/* {isExpanded && ( */}
            <div className="px-2 py-3 space-y-4 border-t border-stone-200">
                <section>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-600">
                            <CalendarClock size={14} className="text-orange-600" />
                            Брони
                        </div>
                        {/* {!hasActiveReservation ? ( */}
                        <button
                            type="button"
                            title="Создать бронь"
                            // onClick={() =>
                            //     onCreateReservation?.({ client_id: group.client_id })
                            // }
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white transition hover:bg-orange-600"
                        >
                            <Plus size={14} />
                            Бронь
                        </button>
                        {/* ) : null} */}
                    </div>
                    {client.reservations.length > 0 ? (
                        <div className="overflow-hidden border border-orange-100 rounded-md">
                            <div className="grid grid-cols-[1.2fr_100px_100px_110px_130px_130px] bg-orange-50 p-1.5 font-semibold uppercase tracking-wide text-orange-500">
                                <div className="text-[12px]">Статус</div>
                                <div className="text-[11px]">с</div>
                                <div className="text-[11px]">по</div>
                                <div className="text-[11px]">Сумма</div>
                                <div className="text-[11px] ">Менеджер</div>
                                <div className="text-[11px] text-center">Действия</div>
                            </div>

                            {client.reservations.map((reservation: SalesReservation) => {
                                // const reservationPayments =
                                //     getSingleReservationPayments?.(reservation) || [];

                                return (
                                    <div key={reservation.id} className="border-t border-stone-100">
                                        <div className="grid grid-cols-[1.2fr_100px_100px_110px_130px_130px] items-center px-3 py-2.5 text-sm text-slate-700">
                                            <div className="text-xs font-medium text-blue-800">
                                                {/* {getReservationStatusName(reservation)} */}
                                                {reservation.status_ref?.name}
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
                                            <div className="text-xs text-slate-800">
                                                {[
                                                    reservation.manager_user?.last_name,
                                                    reservation.manager_user?.first_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ') || '—'}
                                            </div>
                                            <div className="flex justify-end gap-1">
                                                {/* {isActiveReservation(reservation) ? ( */}
                                                <>
                                                    <StyledTooltip title="Добавить платеж по брони">
                                                        <button
                                                            type="button"
                                                            // onClick={() =>
                                                            //     onPaymentClick?.({
                                                            //         reservation,
                                                            //         reservation_id: reservation.id,
                                                            //         client_id: client.id,
                                                            //     })
                                                            // }
                                                            className="flex items-center justify-center text-white transition bg-green-500 rounded-lg w-7 h-7 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <Wallet size={14} />
                                                        </button>
                                                    </StyledTooltip>
                                                    <button
                                                        type="button"
                                                        title="Редактировать бронь"
                                                        // onClick={() =>
                                                        //     onEditReservation?.(reservation)
                                                        // }
                                                        className="flex items-center justify-center text-white transition bg-blue-400 rounded-lg w-7 h-7 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Снять бронь"
                                                        // onClick={() =>
                                                        //     onCancelReservation?.(
                                                        //         reservation,
                                                        //     )
                                                        // }
                                                        className="flex items-center justify-center text-white transition bg-red-400 rounded-lg w-7 h-7 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                                {/* ) : null} */}
                                            </div>
                                        </div>

                                        <div className="px-3 py-2 border-t border-stone-100 bg-orange-50/40">
                                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-orange-600">
                                                Платежи по брони
                                            </div>
                                            {reservation.payments?.length ? (
                                                <div className="space-y-1.5">
                                                    {reservation.payments.map((payment: any) => (
                                                        <div
                                                            key={payment.id}
                                                            className="flex items-start justify-between gap-2 rounded-lg border border-orange-100 bg-white px-2.5 py-2"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-semibold truncate text-slate-700">
                                                                    {payment.title || 'Платеж'}
                                                                </div>
                                                                <div className="mt-0.5 text-[11px] text-slate-500">
                                                                    {payment.status_ref?.name ||
                                                                        'Статус'}{' '}
                                                                    ·{' '}
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

                <section>
                    <div className="flex items-center justify-between gap-2 mt-6 mb-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <FileText size={14} className="text-violet-700" />
                            Сделки
                        </div>
                        <StyledTooltip title="Выкуп">
                            <button
                                type="button"
                                // onClick={() =>
                                //     onCreateDeal?.({
                                //         client_id: group.client_id,
                                //         reservation_id: activeGroupReservation?.id || null,
                                //     })
                                // }
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white transition hover:bg-violet-700"
                            >
                                <Plus size={14} />
                                Выкуп
                            </button>
                        </StyledTooltip>
                    </div>

                    {client.deals.length > 0 ? (
                        <div className="space-y-3">
                            {client.deals.map((deal: any) => (
                                <UnitPassportDeal key={deal.id} deal={deal} />
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-sm text-center bg-white border border-dashed rounded-2xl border-stone-300 text-rose-400">
                            Сделки по этому клиенту нет
                        </div>
                    )}
                </section>
            </div>
            {/* )} */}
        </div>
    );
};
