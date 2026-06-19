import { useState } from 'react';
import { Plus, ListChecks, Receipt, CalendarRange, Wallet, Paperclip, Pencil } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import { HeaderIconAction } from './SalesUnitPassportSidbar';

/**************************************************************************************************************************/
export const SalesUnitPassportDeal = ({
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

    /***************************************************************************************************************/
    return (
        <div className="overflow-hidden border rounded-md border-violet-200">
            <div className="px-3 py-3 border-b border-violet-200 bg-violet-100">
                <div className="grid grid-cols-[1fr_140px_130px_130px] items-center gap-3">
                    <div>
                        <div className="text-sm font-semibold text-slate-800">
                            № договора: {deal.contract_number || '-'}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                            Статус договора: {getDealStatusName(deal)} {/*status*/}
                        </div>
                    </div>

                    <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">
                            Дата создание
                        </div>
                        <div className="text-sm font-medium text-slate-700">
                            {formatDate(deal.contract_date)}
                        </div>
                    </div>

                    <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-400">
                            Сумма
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                            {deal.total_amount}
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                            Валюта: {deal.currency_info?.code}
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                            Тип оплаты: {deal.payment_type_ref.name}
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                            Тип сделки: {deal.deal_type.name}
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                            Менеджер:
                            {deal.manager_user.first_name +
                                ' ' +
                                deal.manager_user.last_name +
                                deal.manager_user.middle_name}
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                            Примечание: {deal.note}
                        </div>
                    </div>

                    <div className="flex justify-end gap-1.5">
                        <HeaderIconAction
                            title="Прикрепить файл"
                            icon={<Paperclip size={15} />}
                            className="bg-violet-500 hover:bg-violet-600"
                            onClick={() => onPaymentClick(deal)}
                        />
                        <HeaderIconAction
                            title="Редактировать"
                            icon={<Pencil size={15} />}
                            className="bg-blue-400 hover:bg-blue-500"
                            onClick={() => onPaymentClick(deal)}
                        />
                    </div>
                </div>

                <div className="inline-flex p-1 mt-3 bg-white rounded-lg shadow-sm ring-1 ring-stone-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('payments')}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            activeTab === 'payments'
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Receipt size={13} />
                        Платежи
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('schedule')}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            activeTab === 'schedule'
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <CalendarRange size={13} />
                        График
                    </button>
                </div>
            </div>

            <div className="p-3">
                <HeaderIconAction
                    title="Добавить платёж"
                    icon={<Wallet size={14} />}
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => onPaymentClick(deal)}
                />
                {activeTab === 'payments' ? (
                    payments.length > 0 ? (
                        <div className="overflow-hidden border rounded-lg border-stone-200">
                            <div className="grid grid-cols-[1fr_110px_120px_120px] bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                <div>Платёж</div>
                                <div>Дата</div>
                                <div>Статус</div>
                                <div>Сумма</div>
                            </div>

                            {payments.map((p: any) => (
                                <div
                                    key={p.id}
                                    className="grid grid-cols-[1fr_110px_120px_120px] items-center border-t border-stone-100 px-3 py-2.5 text-sm"
                                >
                                    <div className="font-medium truncate text-slate-800">
                                        {p.title || 'Платёж'}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {new Date(p.paid_date || p.planned_date).toLocaleDateString(
                                            'ru-RU',
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {p.status_ref?.name || 'Статус'}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-800">
                                        {formatCurrency(p.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-5 text-sm text-center border border-dashed rounded-xl border-stone-200 bg-slate-50 text-slate-500">
                            Платежей пока нет
                        </div>
                    )
                ) : schedules.length > 0 ? (
                    <div className="space-y-3">
                        <StyledTooltip
                            title={
                                schedules.length > 0 ? 'Пересчитать график' : 'Сформировать график'
                            }
                        >
                            <button
                                type="button"
                                onClick={() => onScheduleClick(deal)}
                                className="flex items-center justify-center text-white transition bg-orange-500 rounded-lg w-7 h-7 hover:bg-orange-600"
                            >
                                <ListChecks size={14} />
                            </button>
                        </StyledTooltip>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="px-3 py-2 rounded-lg bg-slate-50">
                                <div className="text-[11px] text-slate-400">План</div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {formatCurrency(totals.planned)}
                                </div>
                            </div>
                            <div className="px-3 py-2 rounded-lg bg-emerald-50">
                                <div className="text-[11px] text-emerald-500">Оплачено</div>
                                <div className="text-sm font-semibold text-emerald-700">
                                    {formatCurrency(totals.paid)}
                                </div>
                            </div>
                            <div className="px-3 py-2 rounded-lg bg-orange-50">
                                <div className="text-[11px] text-orange-500">Остаток</div>
                                <div className="text-sm font-semibold text-orange-700">
                                    {formatCurrency(totals.remaining)}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden border rounded-lg border-stone-200">
                            <div className="grid grid-cols-[70px_120px_1fr_110px_110px] bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                <div>№</div>
                                <div>Дата</div>
                                <div>Статус</div>
                                <div>Оплачено</div>
                                <div>План</div>
                            </div>

                            {schedules.map((s: any) => (
                                <div
                                    key={s.id}
                                    className="grid grid-cols-[70px_120px_1fr_110px_110px] items-center border-t border-stone-100 px-3 py-2.5 text-sm"
                                >
                                    <div className="font-medium text-slate-800">
                                        #{s.payment_no}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {new Date(s.planned_date).toLocaleDateString('ru-RU')}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {s.status_ref?.name || 'Запланировано'}
                                        {s.overdue_days > 0
                                            ? ` • ${s.overdue_days} дн. просрочки`
                                            : ''}
                                    </div>
                                    <div className="text-xs font-medium text-slate-800">
                                        {Number(s.paid_amount || 0).toLocaleString('ru-RU')}
                                    </div>
                                    <div className="text-xs font-medium text-slate-800">
                                        {Number(s.planned_amount || 0).toLocaleString('ru-RU')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="px-4 py-5 text-sm text-center border border-dashed rounded-xl border-stone-200 bg-slate-50 text-slate-500">
                        График ещё не сформирован
                    </div>
                )}
            </div>
        </div>
    );
};
