// src/components/UnitDetails/ClientAccordionItem.tsx
import { ChevronDown, ChevronUp, CalendarClock, FileText, Pencil } from 'lucide-react';
import { DealCard } from './UnitDetails';

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
    const statusClass =
        group.status === 'buyout'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : group.status === 'reservation'
              ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
              : 'border-stone-200 bg-slate-50 text-slate-600';
    const paymentsCount =
        group.deals.reduce((sum: number, d: any) => sum + (d.payments?.length || 0), 0) +
        group.reservations.flatMap((r: any) => r.payments || []).length;

    return (
        <div className="overflow-hidden transition-all bg-white border border-stone-200 rounded-xl">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-slate-800">
                        {group.client?.full_name || group.client?.phone || 'Клиент не выбран'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                        Договоров: {group.deals.length} · Платежей: {paymentsCount}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                    <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                    >
                        {group.statusLabel}
                    </span>
                    {isExpanded ? (
                        <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="px-4 py-4 space-y-5 border-t border-stone-200 bg-slate-50/50">
                    <div className="space-y-2.5">
                        <h4 className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-slate-700">
                            <CalendarClock size={14} className="text-amber-500" /> Брони
                        </h4>
                        {group.reservations.length > 0 ? (
                            group.reservations.map((r: any) => (
                                <div
                                    key={r.id}
                                    className="rounded-lg border border-stone-200 bg-white p-3.5"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-sm font-medium text-slate-800">
                                            {getReservationStatusName(r)}
                                        </div>
                                        <div className="flex gap-1.5">
                                            {isActiveReservation(r) && (
                                                <button
                                                    onClick={() => onCancelReservation(r)}
                                                    className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition"
                                                >
                                                    Снять
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onEditReservation(r)}
                                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                                        <div>
                                            С:{' '}
                                            <span className="font-medium text-slate-800">
                                                {new Date(r.start_at).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <div>
                                            До:{' '}
                                            <span className="font-medium text-slate-800">
                                                {new Date(r.expires_at).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <div>
                                            Сумма:{' '}
                                            <span className="font-medium text-slate-800">
                                                {Number(r.reservation_amount).toLocaleString(
                                                    'ru-RU',
                                                )}{' '}
                                                {r.currency_info?.code || '₽'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-2 text-xs italic text-slate-500">Броней нет</div>
                        )}
                    </div>

                    <div className="space-y-2.5">
                        <h4 className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-slate-700">
                            <FileText size={14} className="text-blue-500" /> Договоры
                        </h4>
                        {group.deals.length > 0 ? (
                            group.deals.map((d: any) => (
                                <DealCard
                                    key={d.id}
                                    deal={d}
                                    payments={d.payments || []}
                                    schedules={d.payment_schedules || []}
                                    getDealStatusName={getDealStatusName}
                                    onPaymentClick={onPaymentClick}
                                    onScheduleClick={onScheduleClick}
                                />
                            ))
                        ) : (
                            <div className="py-2 text-xs italic text-slate-500">Договоров нет</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
