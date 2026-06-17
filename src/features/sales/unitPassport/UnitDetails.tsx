// src/components/UnitDetails/DealCard.tsx
import { useState } from 'react';
import { Plus, ListChecks } from 'lucide-react';

export const DealCard = ({
    deal,
    payments,
    schedules,
    onPaymentClick,
    onScheduleClick,
    getDealStatusName,
}: any) => {
    const [activeTab, setActiveTab] = useState<'payments' | 'schedule'>('payments');
    const totals = schedules.reduce(
        (acc: any, item: any) => {
            acc.planned += Number(item.planned_amount || 0);
            acc.paid += Number(item.paid_amount || 0);
            acc.remaining += Number(item.remaining_amount || 0);
            return acc;
        },
        { planned: 0, paid: 0, remaining: 0 },
    );

    return (
        <div className="p-4 space-y-3 bg-white border rounded-xl border-stone-200">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="text-sm font-semibold text-slate-800">
                        №{deal.contract_number || deal.deal_number || deal.id}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{getDealStatusName(deal)}</div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <div>
                    Дата:{' '}
                    <span className="font-medium text-slate-800">
                        {new Date(deal.contract_date).toLocaleDateString('ru-RU')}
                    </span>
                </div>
                <div>
                    Сумма:{' '}
                    <span className="font-medium text-slate-800">
                        {Number(deal.total_amount).toLocaleString('ru-RU')}{' '}
                        {deal.currency_info?.code || '₽'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 border rounded-lg border-stone-200 bg-slate-50">
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`rounded px-3 py-1.5 text-xs font-semibold transition ${activeTab === 'payments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    Платежи
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`rounded px-3 py-1.5 text-xs font-semibold transition ${activeTab === 'schedule' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    График
                </button>
            </div>

            {activeTab === 'payments' ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">
                            Платежи по договору
                        </span>
                        <button
                            onClick={() => onPaymentClick(deal)}
                            className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition"
                        >
                            <Plus size={12} /> Платеж
                        </button>
                    </div>
                    {payments.length > 0 ? (
                        payments.map((p: any) => (
                            <div
                                key={p.id}
                                className="flex items-start justify-between p-2.5 rounded-lg border border-stone-100 bg-slate-50/50"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate text-slate-800">
                                        {p.title}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                        {p.status_ref?.name || 'Статус'} ·{' '}
                                        {new Date(p.paid_date || p.planned_date).toLocaleDateString(
                                            'ru-RU',
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs font-semibold text-right text-slate-800 shrink-0">
                                    {Number(p.amount).toLocaleString('ru-RU')}{' '}
                                    {p.currency_ref?.code || '₽'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-2 text-xs italic text-center text-slate-500">
                            Платежей пока нет
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                            <ListChecks size={14} className="text-amber-500" /> График платежей
                        </span>
                        <button
                            onClick={() => onScheduleClick(deal)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition"
                        >
                            {schedules.length > 0 ? 'Пересчитать' : 'Сформировать'}
                        </button>
                    </div>
                    {schedules.length > 0 ? (
                        <>
                            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-stone-200">
                                <div>
                                    План:{' '}
                                    <span className="font-semibold text-slate-800">
                                        {Number(totals.planned).toLocaleString('ru-RU')}
                                    </span>
                                </div>
                                <div>
                                    Оплачено:{' '}
                                    <span className="font-semibold text-slate-800">
                                        {Number(totals.paid).toLocaleString('ru-RU')}
                                    </span>
                                </div>
                                <div>
                                    Остаток:{' '}
                                    <span className="font-semibold text-slate-800">
                                        {Number(totals.remaining).toLocaleString('ru-RU')}
                                    </span>
                                </div>
                            </div>
                            <div className="pr-1 space-y-2 overflow-y-auto max-h-48">
                                {schedules.map((s: any) => (
                                    <div
                                        key={s.id}
                                        className="p-2.5 rounded-lg border border-stone-200 bg-white"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-xs font-medium text-slate-800">
                                                    #{s.payment_no} ·{' '}
                                                    {new Date(s.planned_date).toLocaleDateString(
                                                        'ru-RU',
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                    {s.status_ref?.name || 'Запланирован'}
                                                    {s.overdue_days > 0
                                                        ? ` · ${s.overdue_days} дн. просрочки`
                                                        : ''}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-semibold text-slate-800">
                                                    {Number(s.paid_amount).toLocaleString('ru-RU')}
                                                </div>
                                                <div className="text-[11px] text-slate-500">
                                                    из{' '}
                                                    {Number(s.planned_amount).toLocaleString(
                                                        'ru-RU',
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-2 text-xs italic text-center text-slate-500">
                            График не сформирован
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
