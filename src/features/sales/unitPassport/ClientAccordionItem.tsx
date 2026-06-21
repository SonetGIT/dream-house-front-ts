import { CalendarClock, FileText, Phone, Plus, User2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import type { PassportDeal, PassportReservationBrief } from '../slices/salesUnitPassportSlice';
import { HeaderIconAction } from './SalesUnitPassportSidbar';
import { SalesUnitPassportDeal } from './SalesUnitPassportDeal';

export const ClientAccordionItem = ({
    group,
    isExpanded,
    onToggle,
    onCreateDeal,
    onEditReservation,
    onCancelReservation,
    onPaymentClick,
    onScheduleClick,
    onEditDeal,
    onDealFiles,
    onDownloadScheduleClick,
    downloadingScheduleDealId,
    getReservationStatusName,
    getDealStatusName,
    isActiveReservation,
    getDealPayments,
    getDealSchedules,
    getReservationPayments,
}: any) => {
    const statusClass =
        group.status === 'buyout'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : group.status === 'reservation'
              ? 'border-orange-200 bg-orange-50 text-orange-700'
              : 'border-blue-200 bg-blue-50 text-blue-700';

    const reservationPayments = getReservationPayments(group);
    const paymentsCount =
        group.deals.reduce((sum: number, deal: PassportDeal) => sum + getDealPayments(deal.id).length, 0) +
        reservationPayments.length;
    const activeGroupReservation =
        group.reservations.find((item: PassportReservationBrief) => isActiveReservation(item)) || null;

    return (
        <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-2 py-2 text-left transition hover:bg-slate-50"
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <User2 size={15} />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-700">
                                    {group.client?.full_name || 'Клиент не выбран'}
                                </div>
                                <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                                    {group.client?.phone && (
                                        <span className="inline-flex items-center gap-1">
                                            <Phone size={12} />
                                            {group.client.phone}
                                        </span>
                                    )}
                                    <span>Сделок: {group.deals.length}</span>
                                    <span>Платежей: {paymentsCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
                        >
                            {group.statusLabel}
                        </span>
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="space-y-4 border-t border-stone-200 px-2 py-3">
                    <section>
                        <div className="mb-2 flex items-center justify-between">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                                <CalendarClock size={14} className="text-orange-600" />
                                Брони
                            </div>
                            <HeaderIconAction
                                title="Создать бронь"
                                icon={<Plus size={15} />}
                                className="bg-orange-400 hover:bg-orange-500"
                            />
                        </div>
                        {group.reservations.length > 0 ? (
                            <div className="overflow-hidden rounded-md border border-orange-100">
                                <div className="grid grid-cols-[1.2fr_100px_100px_110px_130px_110px_72px] bg-orange-50 p-1.5 font-semibold uppercase tracking-wide text-orange-500">
                                    <div className="text-[12px]">Статус</div>
                                    <div className="text-[11px]">с</div>
                                    <div className="text-[11px]">по</div>
                                    <div className="text-[11px]">Сумма</div>
                                    <div className="text-[11px]">Менеджер</div>
                                    <div className="text-[11px]">Дата закрытия</div>
                                    <div />
                                </div>

                                {group.reservations.map((reservation: PassportReservationBrief) => (
                                    <div
                                        key={reservation.id}
                                        className="grid grid-cols-[1.2fr_100px_100px_110px_130px_110px_72px] items-center border-t border-stone-100 px-3 py-2.5 text-sm text-slate-700"
                                    >
                                        <div className="text-xs font-medium text-blue-800">
                                            {getReservationStatusName(reservation)}
                                        </div>
                                        <div className="text-xs">{formatDate(reservation.start_at)}</div>
                                        <div className="text-xs">{formatDate(reservation.expires_at)}</div>
                                        <div className="text-xs font-medium text-green-800">
                                            {formatCurrency(reservation.reservation_amount)}
                                        </div>
                                        <div className="text-xs text-slate-800">менеджер</div>
                                        <div className="text-xs">{formatDate(reservation.closed_at)}</div>
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onEditReservation?.(reservation)}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => onCancelReservation?.(reservation)}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-6 text-center text-sm text-rose-400">
                                Броней по этой квартире пока нет
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="mb-2 mt-6 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                <FileText size={14} className="text-violet-700" />
                                Сделки
                            </div>
                            <HeaderIconAction
                                title="Новый договор"
                                icon={<Plus size={15} />}
                                className="bg-violet-500 hover:bg-violet-600"
                                onClick={() =>
                                    onCreateDeal?.({
                                        client_id: group.client_id,
                                        reservation_id: activeGroupReservation?.id || null,
                                    })
                                }
                            />
                        </div>

                        {group.deals.length > 0 ? (
                            <div className="space-y-3">
                                {group.deals.map((deal: PassportDeal) => (
                                    <SalesUnitPassportDeal
                                        key={deal.id}
                                        deal={deal}
                                        payments={getDealPayments(deal.id)}
                                        schedules={getDealSchedules(deal.id)}
                                        getDealStatusName={getDealStatusName}
                                        onPaymentClick={onPaymentClick}
                                        onScheduleClick={onScheduleClick}
                                        onEditClick={onEditDeal}
                                        onFileClick={onDealFiles}
                                        onDownloadScheduleClick={onDownloadScheduleClick}
                                        downloadingScheduleDealId={downloadingScheduleDealId}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-6 text-center text-sm text-rose-400">
                                Сделки по этому клиенту нет
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};
