import { useMemo, useState } from 'react';
import {
    BadgeCheck,
    Ban,
    CalendarRange,
    FileText,
    Paperclip,
    Pencil,
    Plus,
    Receipt,
    Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import type {
    SalesClient,
    SalesDeal,
    SalesPayment,
    SalesPaymentSchedule,
} from '@/features/sales/slices/salesUnitPassportSlice';

type UnitPassportDealSectionProps = {
    client: SalesClient;
    deals: SalesDeal[];
    getDealStatusName?: (deal: SalesDeal) => string;
    getDealPayments?: (deal: SalesDeal) => SalesPayment[];
    getDealSchedules?: (deal: SalesDeal) => SalesPaymentSchedule[];
    canSignDeal?: (deal: SalesDeal) => boolean;
    canCancelDeal?: (deal: SalesDeal) => boolean;
    onCreateDeal?: (payload?: {
        client_id?: number | null;
        reservation_id?: number | null;
    }) => void;
    onAddPayment?: (deal: SalesDeal) => void;
    onOpenSchedule?: (deal: SalesDeal) => void;
    onEditDeal?: (deal: SalesDeal) => void;
    onSignDeal?: (deal: SalesDeal) => void;
    onCancelDeal?: (deal: SalesDeal) => void;
    onOpenFiles?: (deal: SalesDeal) => void;
};

function DealCard({
    deal,
    payments,
    schedules,
    getDealStatusName,
    canSign,
    canCancel,
    onAddPayment,
    onOpenSchedule,
    onEditDeal,
    onSignDeal,
    onCancelDeal,
    onOpenFiles,
}: {
    deal: SalesDeal;
    payments: SalesPayment[];
    schedules: SalesPaymentSchedule[];
    getDealStatusName?: (deal: SalesDeal) => string;
    canSign?: boolean;
    canCancel?: boolean;
    onAddPayment?: (deal: SalesDeal) => void;
    onOpenSchedule?: (deal: SalesDeal) => void;
    onEditDeal?: (deal: SalesDeal) => void;
    onSignDeal?: (deal: SalesDeal) => void;
    onCancelDeal?: (deal: SalesDeal) => void;
    onOpenFiles?: (deal: SalesDeal) => void;
}) {
    const [activeTab, setActiveTab] = useState<'payments' | 'schedule'>('payments');

    const totals = useMemo(
        () =>
            schedules.reduce(
                (acc, item) => {
                    acc.planned += Number(item.planned_amount || 0);
                    acc.paid += Number(item.paid_amount || 0);
                    acc.remaining += Number(item.remaining_amount || 0);
                    return acc;
                },
                { planned: 0, paid: 0, remaining: 0 },
            ),
        [schedules],
    );

    return (
        <div className="overflow-hidden border rounded-md border-violet-200">
            <div className="grid grid-cols-[1fr_120px_140px_100px_88px] border-b border-violet-200 bg-violet-50 font-semibold uppercase tracking-wide text-violet-500">
                <div className="px-2.5 py-1.5 text-[12px]">Договор</div>
                <div className="px-2.5 py-1.5 text-[12px]">Дата</div>
                <div className="px-2.5 py-1.5 text-[12px]">Сумма</div>
                <div className="px-2.5 py-1.5 text-[12px]">Статус</div>
                <div className="px-2.5 py-1.5 text-[12px]">Действия</div>
            </div>

            <div className="grid grid-cols-[1fr_120px_140px_100px_88px] items-center px-3 py-2.5">
                <div className="min-w-0">
                    <div className="text-xs font-semibold truncate text-slate-800">
                        №{deal.contract_number || deal.id}
                    </div>
                    <div className="truncate text-[12px] text-lime-600">
                        {getDealStatusName?.(deal) || `Статус #${deal.status}`}
                    </div>

                    {(canSign || canCancel) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {canSign ? (
                                <button
                                    type="button"
                                    onClick={() => onSignDeal?.(deal)}
                                    className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <BadgeCheck size={13} />
                                    Подписать
                                </button>
                            ) : null}

                            {canCancel ? (
                                <button
                                    type="button"
                                    onClick={() => onCancelDeal?.(deal)}
                                    className="inline-flex h-7 items-center gap-1 rounded-lg bg-red-50 px-2.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100"
                                >
                                    <Ban size={13} />
                                    Отменить
                                </button>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="text-xs font-medium text-slate-700">
                    {formatDate(deal.contract_date)}
                </div>

                <div>
                    <div className="text-sm font-bold text-green-700">
                        {formatCurrency(deal.total_amount)}
                    </div>
                </div>

                <div className="text-xs text-slate-600">
                    {getDealStatusName?.(deal) || `#${deal.status}`}
                </div>

                <div className="flex justify-end gap-1">
                    <button
                        type="button"
                        title="Файлы договора"
                        onClick={() => onOpenFiles?.(deal)}
                        className="flex items-center justify-center w-8 h-8 text-white transition rounded-lg bg-violet-500 hover:bg-violet-600"
                    >
                        <Paperclip size={13} />
                    </button>

                    <button
                        type="button"
                        title="Редактировать договор"
                        onClick={() => onEditDeal?.(deal)}
                        className="flex items-center justify-center w-8 h-8 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                        <Pencil size={13} />
                    </button>
                </div>
            </div>

            <div className="px-3 pb-3">
                <div className="inline-flex bg-white rounded-lg shadow-sm ring-1 ring-stone-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('payments')}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            activeTab === 'payments'
                                ? 'bg-green-100 text-green-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Receipt size={15} />
                        Платежи
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('schedule')}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            activeTab === 'schedule'
                                ? 'bg-rose-100 text-rose-500'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <CalendarRange size={15} />
                        График
                    </button>
                </div>

                <div className="pt-3">
                    {activeTab === 'payments' ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    title="Добавить платеж"
                                    onClick={() => onAddPayment?.(deal)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white transition hover:bg-emerald-600"
                                >
                                    <Wallet size={14} />
                                    Платеж
                                </button>
                            </div>

                            {payments.length ? (
                                <div className="overflow-hidden border border-green-200 rounded-lg">
                                    <div className="grid grid-cols-[1fr_180px_130px] border-b border-green-200 bg-green-50 px-2 py-1 font-semibold uppercase tracking-wide text-green-700">
                                        <div className="text-[12px]">Платеж</div>
                                        <div className="text-[12px]">Дата</div>
                                        <div className="text-[12px]">Сумма</div>
                                    </div>

                                    {payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="grid grid-cols-[1fr_180px_130px] border-t border-stone-100 px-3 py-2.5 text-sm"
                                        >
                                            <div className="text-sm font-medium truncate text-slate-700">
                                                {payment.title || 'Платеж'}
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                {formatDate(
                                                    payment.paid_date || payment.planned_date,
                                                )}
                                            </div>
                                            <div className="text-sm font-semibold text-green-800">
                                                {formatCurrency(payment.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-5 text-sm text-center border border-dashed rounded-xl border-stone-200 bg-slate-50 text-slate-500">
                                    Платежей пока нет
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="px-3 py-2 rounded-lg bg-slate-50">
                                    <div className="text-[12px] text-slate-500">План</div>
                                    <div className="text-sm font-semibold text-slate-800">
                                        {formatCurrency(totals.planned)}
                                    </div>
                                </div>
                                <div className="px-3 py-2 rounded-lg bg-emerald-50">
                                    <div className="text-[12px] text-emerald-500">Оплачено</div>
                                    <div className="text-sm font-semibold text-emerald-700">
                                        {formatCurrency(totals.paid)}
                                    </div>
                                </div>
                                <div className="px-3 py-2 rounded-lg bg-orange-50">
                                    <div className="text-[12px] text-rose-500">Остаток</div>
                                    <div className="text-sm font-semibold text-rose-600">
                                        {formatCurrency(totals.remaining)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => onOpenSchedule?.(deal)}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-rose-500 px-3 text-xs font-semibold text-white transition hover:bg-rose-600"
                                >
                                    <FileText size={14} />
                                    График
                                </button>
                            </div>

                            {schedules.length ? (
                                <div className="overflow-hidden border rounded-lg border-rose-200">
                                    <div className="grid grid-cols-[80px_140px_140px_140px] border-b border-rose-200 bg-rose-50 px-2 py-1 font-semibold uppercase tracking-wide text-rose-600">
                                        <div className="text-[12px]">№</div>
                                        <div className="text-[12px]">План</div>
                                        <div className="text-[12px]">Оплачено</div>
                                        <div className="text-[12px]">Остаток</div>
                                    </div>

                                    {schedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="grid grid-cols-[80px_140px_140px_140px] border-t border-stone-100 px-3 py-2.5 text-sm"
                                        >
                                            <div className="text-slate-700">#{schedule.id}</div>
                                            <div className="font-medium text-slate-700">
                                                {formatCurrency(schedule.planned_amount)}
                                            </div>
                                            <div className="font-medium text-emerald-700">
                                                {formatCurrency(schedule.paid_amount)}
                                            </div>
                                            <div className="font-medium text-rose-600">
                                                {formatCurrency(schedule.remaining_amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-5 text-sm text-center border border-dashed rounded-xl border-stone-200 bg-slate-50 text-slate-500">
                                    График пока не сформирован
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function UnitPassportDealSection({
    client,
    deals,
    getDealStatusName,
    getDealPayments,
    getDealSchedules,
    canSignDeal,
    canCancelDeal,
    onCreateDeal,
    onAddPayment,
    onOpenSchedule,
    onEditDeal,
    onSignDeal,
    onCancelDeal,
    onOpenFiles,
}: UnitPassportDealSectionProps) {
    return (
        <section>
            <div className="flex items-center justify-between gap-2 mt-6 mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <FileText size={14} className="text-violet-700" />
                    Сделки
                </div>

                <button
                    type="button"
                    title="Выкуп"
                    onClick={() =>
                        onCreateDeal?.({
                            client_id: client.id,
                            reservation_id: null,
                        })
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white transition hover:bg-violet-700"
                >
                    <Plus size={14} />
                    Выкуп
                </button>
            </div>

            {deals.length ? (
                <div className="space-y-3">
                    {deals.map((deal) => (
                        <DealCard
                            key={deal.id}
                            deal={deal}
                            payments={getDealPayments?.(deal) || []}
                            schedules={getDealSchedules?.(deal) || []}
                            getDealStatusName={getDealStatusName}
                            canSign={canSignDeal?.(deal)}
                            canCancel={canCancelDeal?.(deal)}
                            onAddPayment={onAddPayment}
                            onOpenSchedule={onOpenSchedule}
                            onEditDeal={onEditDeal}
                            onSignDeal={onSignDeal}
                            onCancelDeal={onCancelDeal}
                            onOpenFiles={onOpenFiles}
                        />
                    ))}
                </div>
            ) : (
                <div className="px-4 py-6 text-sm text-center bg-white border border-dashed rounded-2xl border-stone-300 text-rose-400">
                    Сделок по этому клиенту нет
                </div>
            )}
        </section>
    );
}
