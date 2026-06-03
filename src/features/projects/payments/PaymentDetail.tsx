import type { ReactNode } from 'react';
import { Calendar, CreditCard, FileText, Landmark, ReceiptText, Wallet } from 'lucide-react';
import { formatDateTime } from '@/utils/formatDateTime';
import type { Payment } from './paymentSlice';
import { formatNumber } from '@/utils/formatNumber';

interface PaymentDetailProps {
    payment: Payment;
    onEdit: () => void;
    onClose: () => void;
}

const formatDate = (value?: string | null) => (value ? formatDateTime(value, false) : '—');

const DetailCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {icon}
            <span>{label}</span>
        </div>
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
);

export default function PaymentDetail({ payment, onEdit, onClose }: PaymentDetailProps) {
    return (
        <div className="space-y-6">
            <div className="p-4 text-white rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-medium text-white/80">
                            Платеж №{payment.id}
                        </p>
                        <h3 className="text-2xl font-bold">{payment.title}</h3>
                        <p className="max-w-3xl mt-2 text-sm text-white/85">
                            {payment.description || 'Описание не указано'}
                        </p>
                    </div>

                    <div className="px-4 py-3 border rounded-xl border-white/20 bg-white/10 backdrop-blur-sm">
                        <p className="text-xs tracking-wide uppercase text-white/70">Сумма</p>
                        <p className="mt-1 text-2xl font-bold">{formatNumber(payment.amount, 2)}</p>
                        <p className="mt-1 text-xs text-white/70">
                            Курс валюты: {payment.currency_rate || 1}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <DetailCard
                    icon={<Landmark className="w-4 h-4" />}
                    label="Объект"
                    value={payment.project?.name ?? '—'}
                />
                <DetailCard
                    icon={<Landmark className="w-4 h-4" />}
                    label="Блок"
                    value={payment.block?.name ?? '—'}
                />
                <DetailCard
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Тип платежа"
                    value={payment.payment_type_ref?.name ?? '—'}
                />
                <DetailCard
                    icon={<ReceiptText className="w-4 h-4" />}
                    label="Тип дохода-расхода"
                    value={payment.article?.name ?? '—'}
                />
                <DetailCard
                    icon={<Wallet className="w-4 h-4" />}
                    label="Статус"
                    value={payment.status_ref?.name ?? '—'}
                />

                <DetailCard
                    icon={<FileText className="w-4 h-4" />}
                    label="Способ оплаты"
                    value={payment.payment_method_ref?.name ?? '—'}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="p-5 bg-white border border-gray-200 rounded-xl">
                    <h4 className="mb-4 text-sm font-semibold text-gray-900">
                        Контрагент и документы
                    </h4>
                    <dl className="space-y-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Тип контрагент</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {payment.counterparty_type || '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Контрагент</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {payment.counterparty_name || '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">ИНН</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {payment.counterparty_inn || '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">№ документа</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {payment.document_number || '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Внешний №</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {payment.external_number || '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Комментарий</dt>
                            <dd className="max-w-[65%] text-right font-medium text-gray-900">
                                {payment.comment || '—'}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="p-5 bg-white border border-gray-200 rounded-xl">
                    <h4 className="mb-4 text-sm font-semibold text-gray-900">Даты и аудит</h4>
                    <dl className="space-y-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
                            <dt className="flex items-center gap-2 text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Плановая дата</span>
                            </dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDate(payment.planned_date)}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="flex items-center gap-2 text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Дата оплаты</span>
                            </dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDate(payment.paid_date)}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Создан</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDateTime(payment.created_at)}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Обновлен</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDateTime(payment.updated_at)}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Проведен</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDate(payment.posted_at)}
                            </dd>
                        </div>
                    </dl>
                </section>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="button"
                    onClick={onEdit}
                    className="px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-sky-600 hover:bg-sky-700"
                >
                    Редактировать
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Закрыть
                </button>
            </div>
        </div>
    );
}
