import { FolderOpen, Loader2, Pencil, ReceiptText, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { Payment, PaymentStatusRef } from './paymentSlice';

interface PaymentsTableProps {
    payments: Payment[];
    loading?: boolean;
    onView: (payment: Payment) => void;
    onEdit: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
}

const isHexColor = (value?: string | null) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value ?? '');

const buildStatusStyle = (status?: PaymentStatusRef | null) => {
    if (!status?.color || !isHexColor(status.color)) {
        return {
            className: 'bg-slate-100 text-slate-700 border-slate-200',
            style: undefined,
        };
    }

    return {
        className: '',
        style: {
            color: status.color,
            borderColor: `${status.color}55`,
            backgroundColor: `${status.color}15`,
        },
    };
};

const formatMoney = (amount: number, currencyCode?: string | null) => {
    const value = new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    return currencyCode ? `${value} ${currencyCode}` : value;
};

const formatDate = (value?: string | null) =>
    value
        ? new Date(value).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '—';

const isIncome = (payment: Payment) => {
    const code = payment.payment_type_ref?.code?.toLowerCase() ?? '';
    return code.includes('income') || code.includes('in') || payment.payment_type === 2;
};

export default function PaymentsTable({
    payments,
    loading = false,
    onView,
    onEdit,
    onDelete,
}: PaymentsTableProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                    <p className="text-sm text-gray-500">Загрузка платежей...</p>
                </div>
            </div>
        );
    }

    if (!loading && payments.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-medium text-gray-900">Платежи не найдены</h3>
                <p className="text-sm text-gray-500">
                    Добавьте платеж или измените параметры поиска
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="border-b">
                        <th className="w-12 px-3 py-3 text-sm font-semibold text-center text-blue-700 bg-blue-50">
                            №
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Платеж
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Блок
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Тип / Статья
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Контрагент
                            </div>
                        </th>
                        <th className="px-4 py-3 text-right border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Сумма
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Сроки
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left border-l bg-blue-50">
                            <div className="text-xs font-semibold text-blue-700 uppercase">
                                Статус
                            </div>
                        </th>
                        <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                            <div className="text-xs text-gray-600 uppercase">Действия</div>
                        </th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => {
                        const statusStyle = buildStatusStyle(payment.status_ref);
                        const income = isIncome(payment);

                        return (
                            <tr
                                key={payment.id}
                                className="transition-colors cursor-pointer hover:bg-sky-50/50 group"
                                onClick={() => onView(payment)}
                            >
                                <td className="px-3 py-3 text-xs font-medium text-gray-600">
                                    {payment.id}
                                </td>

                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                                        {payment.title}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                                        {payment.block?.name ?? '—'}
                                    </div>
                                </td>
                                <td className="px-3 py-3">
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium text-gray-900">
                                            {payment.payment_type_ref?.name ?? '—'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {payment.article?.name ?? '—'}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-3 py-3">
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium text-gray-900">
                                            {payment.counterparty_name || '—'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {payment.counterparty_inn || 'ИНН не указан'}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-3 py-3 text-right">
                                    <div className="space-y-1">
                                        <p
                                            className={`text-sm font-semibold ${
                                                income ? 'text-emerald-600' : 'text-rose-600'
                                            }`}
                                        >
                                            {income ? '+' : '−'}
                                            {formatMoney(
                                                payment.amount,
                                                payment.currency_ref?.code,
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            курс: {payment.currency_rate || 1}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-3 py-3">
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <p>План: {formatDate(payment.planned_date)}</p>
                                        <p>Оплата: {formatDate(payment.paid_date)}</p>
                                    </div>
                                </td>

                                <td className="px-3 py-3">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${statusStyle.className}`}
                                        style={statusStyle.style}
                                    >
                                        {payment.status_ref?.name ?? '—'}
                                    </span>
                                </td>

                                <td className="px-3 py-3 border-l">
                                    <div
                                        className="flex items-center justify-center gap-1.5"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <StyledTooltip title="Редактировать">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(payment)}
                                                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </StyledTooltip>

                                        <StyledTooltip title="Удалить">
                                            <button
                                                type="button"
                                                onClick={() => onDelete(payment)}
                                                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </StyledTooltip>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
