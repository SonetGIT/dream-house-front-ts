import { CalendarClock, FileText, Pencil, User2, Phone, Plus } from 'lucide-react';
import { SalesUnitPassportDeal } from './SalesUnitPassportDeal';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import type { PassportDeal, PassportReservationBrief } from '../slices/salesUnitPassportSlice';
import { HeaderIconAction } from './SalesUnitPassportSidbar';

/******************************************************************************************************************************/
export const ClientAccordionItem = ({
    group,
    isExpanded,
    onToggle,
    onEditReservation,
    onCancelReservation,
    onPaymentClick,
    onScheduleClick,
    getReservationStatusName,
    getDealStatusName,
    isActiveReservation,
}: any) => {
    console.log('group', group);
    const statusClass =
        group.status === 'buyout'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : group.status === 'reservation'
              ? 'border-orange-200 bg-orange-50 text-orange-700'
              : 'border-blue-200 bg-blue-50 text-blue-700';

    const paymentsCount =
        group.deals.reduce((sum: number, d: any) => sum + (d.payments?.length || 0), 0) +
        group.reservations.flatMap((r: any) => r.payments || []).length;

    /**********************************************************************************************************************************/
    return (
        <div className="overflow-hidden bg-white border rounded-md border-stone-200">
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-2 py-2 text-left transition hover:bg-slate-50"
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center text-blue-600 rounded-lg w-7 h-7 bg-blue-50">
                                <User2 size={15} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold truncate text-slate-700">
                                    {group.client?.full_name || 'Клиент не выбран ПРОВЕРЮ'}
                                </div>
                                <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                                    {group.client?.phone && (
                                        <span className="inline-flex items-center gap-1">
                                            <Phone size={12} />
                                            {group.client.phone || 'ПРОВЕРЮ'}
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
                <div className="px-2 py-3 space-y-4 border-t border-stone-200">
                    {/* РАЗДЕЛ БРОНИ */}
                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-600">
                                <CalendarClock size={14} className="text-orange-600" />
                                Брони
                            </div>
                            <HeaderIconAction
                                title="Создать бронь"
                                icon={<Plus size={15} />}
                                className="bg-orange-400 hover:bg-orange-500"
                                // onClick={() => setReservationModalOpen(true)}
                            />
                        </div>
                        {group.reservations.length > 0 ? (
                            <div className="overflow-hidden border border-orange-100 rounded-md">
                                <div className="grid grid-cols-[1.2fr_100px_100px_110px_130px_110px_72px] bg-orange-50 p-1.5 font-semibold uppercase tracking-wide text-orange-500">
                                    <div className="text-[12px]">Статус</div>
                                    <div className="text-[11px]">с</div>
                                    <div className="text-[11px]">по</div>
                                    <div className="text-[11px]">Сумма</div>
                                    <div className="text-[11px]">Менеджер</div>
                                    <div className="text-[11px]">Дата закрытия</div>
                                    <div></div>
                                </div>

                                {group.reservations.map((r: PassportReservationBrief) => (
                                    <div
                                        key={r.id}
                                        className="grid grid-cols-[1.2fr_100px_100px_110px_130px_110px_72px] items-center border-t border-stone-100 px-3 py-2.5 text-sm text-slate-700"
                                    >
                                        <div className="text-xs font-medium text-blue-800">
                                            {getReservationStatusName(r)}
                                        </div>
                                        <div className="text-xs font-medium text-green-800">
                                            {formatCurrency(
                                                r.reservation_amount,
                                                /*r.currency_info?.code || 'сом',*/
                                            )}
                                        </div>
                                        <div className="text-xs">{formatDate(r.start_at)}</div>
                                        <div className="text-xs">{formatDate(r.expires_at)}</div>
                                        <div className="text-xs text-slate-800">{'менеджер'}</div>
                                        <div className="text-xs">{formatDate(r.closed_at)}</div>
                                        {/* <div className="flex justify-end gap-1">
                                            {isActiveReservation(r) && (
                                                <StyledTooltip title="Снять бронь">
                                                    <button
                                                        type="button"
                                                        onClick={() => onCancelReservation(r)}
                                                        className="flex items-center justify-center text-red-500 transition rounded-md h-7 w-7 bg-red-50 hover:bg-red-100"
                                                    >
                                                        <span className="text-xs font-bold">×</span>
                                                    </button>
                                                </StyledTooltip>
                                            )}
                                            <StyledTooltip title="Редактировать">
                                                <button
                                                    type="button"
                                                    onClick={() => onEditReservation(r)}
                                                    className="flex items-center justify-center transition rounded-md h-7 w-7 bg-sky-50 text-sky-500 hover:bg-sky-100"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                            </StyledTooltip>
                                        </div> */}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-sm text-center bg-white border border-dashed rounded-2xl border-stone-300 text-rose-400">
                                Броней по этой квартире пока нет
                            </div>
                        )}
                    </section>

                    {/* РАЗДЕЛ СДЕЛКИ */}
                    <section>
                        <div className="flex items-center gap-2 mt-6 mb-2 text-sm font-semibold text-slate-600">
                            <FileText size={14} className="text-violet-700" />
                            Сделки
                        </div>

                        {group.deals.length > 0 ? (
                            <div className="space-y-3">
                                {group.deals.map((d: any) => (
                                    <SalesUnitPassportDeal
                                        key={d.id}
                                        deal={d}
                                        payments={d.payments || []}
                                        schedules={d.payment_schedules || []}
                                        getDealStatusName={getDealStatusName}
                                        onPaymentClick={onPaymentClick}
                                        onScheduleClick={onScheduleClick}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-6 text-sm text-center bg-white border border-dashed rounded-2xl border-stone-300 text-rose-400">
                                Сделки по этому клиенту нет
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};
