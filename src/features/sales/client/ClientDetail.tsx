import type { ReactNode } from 'react';
import {
    Lock,
    Phone,
    MessageCircle,
    Mail,
    MapPin,
    Calendar,
    User,
    Building2,
    Layers,
    FileText,
    Hash,
    CreditCard,
} from 'lucide-react';
import type { SalesClient } from '../slices/salesClientsSlice';
import { formatPhoneDisplay } from '@/utils/formatPhoneNumber';
import { formatArea } from '@/utils/formatNumber';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import { formatDateTime } from '@/utils/formatDateTime';
import { lotTypeMap } from './ClientPage';

interface ClientDetailProps {
    client: SalesClient;
    onEdit: () => void;
    onClose: () => void;
}

const DetailCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {icon}
            <span>{label}</span>
        </div>
        <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
);
export function getLotTypeLabel(type: string): string {
    return lotTypeMap[type] ?? type;
}

export default function ClientDetail({ client, onEdit, onClose }: ClientDetailProps) {
    const phoneDigits = formatPhoneDisplay(client.phone);
    const unit = client.sales_unit;

    // const lotLabel = unit ? `${getLotTypeLabel(unit.lot_type)} №${unit.unit_number}` : '—';
    const lotLabel = unit ? `${getLotTypeLabel(unit.lot_type)} №${unit.unit_number}` : '—';
    const unitStatusLabel = unit?.status?.name ?? '—';
    const areaLabel = unit ? formatArea(unit.area_total) : '—';
    const priceLabel = unit ? formatCurrency(unit.price_total /*, unit.currency_info?.code*/) : '—';

    return (
        <div className="space-y-6">
            {/* Gradient header */}
            <div className="p-4 text-white rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-medium text-white/80">
                            Клиент №{client.id}
                            {client.is_locked && (
                                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                                    <Lock className="w-3 h-3" /> Закреплён
                                </span>
                            )}
                        </p>
                        <h3 className="text-2xl font-bold">{client.full_name}</h3>
                        {client.phone && (
                            <p className="mt-2 text-sm text-white/85">{client.phone}</p>
                        )}
                        {client.email && <p className="text-sm text-white/75">{client.email}</p>}
                    </div>

                    {unit && (
                        <div className="px-4 py-3 border rounded-xl border-white/20 bg-white/10 backdrop-blur-sm shrink-0">
                            <p className="text-xs tracking-wide uppercase text-white/70">Лот</p>
                            <p className="mt-1 text-xl font-bold">{lotLabel}</p>
                            <p className="mt-1 text-sm text-white/80">{priceLabel}</p>
                            {unit.status && (
                                <span
                                    className="mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                                    style={{
                                        backgroundColor: unit.status.color + '30',
                                        color: '#fff',
                                    }}
                                >
                                    {unit.status.name}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <DetailCard
                    icon={<Building2 className="w-4 h-4" />}
                    label="Объект"
                    value={client.sales_project?.name ?? '—'}
                />
                <DetailCard
                    icon={<Layers className="w-4 h-4" />}
                    label="Блок"
                    value={client.sales_block?.name ?? '—'}
                />
                <DetailCard
                    icon={<Hash className="w-4 h-4" />}
                    label="Тип лота"
                    value={unit ? getLotTypeLabel(unit.lot_type) : '—'}
                />
                <DetailCard
                    icon={<CreditCard className="w-4 h-4" />}
                    label="Статус лота"
                    value={unitStatusLabel}
                />
                <DetailCard
                    icon={<FileText className="w-4 h-4" />}
                    label="Площадь"
                    value={areaLabel}
                />
                <DetailCard
                    icon={<FileText className="w-4 h-4" />}
                    label="Цена"
                    value={priceLabel}
                />
            </div>

            {/* Two-column sections */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="p-5 bg-white border border-gray-200 rounded-xl">
                    <h4 className="mb-4 text-sm font-semibold text-gray-900">
                        Контакты и документы
                    </h4>
                    <dl className="space-y-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
                            <dt className="flex items-center gap-2 text-gray-500">
                                <Phone className="w-4 h-4" />
                                <span>Телефон</span>
                            </dt>
                            <dd className="font-medium text-right text-gray-900">
                                {client.phone || '—'}
                            </dd>
                        </div>
                        {client.phone_extra && (
                            <div className="flex items-start justify-between gap-4">
                                <dt className="flex items-center gap-2 text-gray-500">
                                    <Phone className="w-4 h-4" />
                                    <span>Доп. телефон</span>
                                </dt>
                                <dd className="font-medium text-right text-gray-900">
                                    {client.phone_extra}
                                </dd>
                            </div>
                        )}
                        <div className="flex items-start justify-between gap-4">
                            <dt className="flex items-center gap-2 text-gray-500">
                                <Mail className="w-4 h-4" />
                                <span>Email</span>
                            </dt>
                            <dd className="font-medium text-right text-gray-900 break-all">
                                {client.email || '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="flex items-center gap-2 text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Дата рождения</span>
                            </dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDate(client.birth_date)}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="flex items-center gap-2 text-gray-500">
                                <MapPin className="w-4 h-4" />
                                <span>Адрес</span>
                            </dt>
                            <dd className="max-w-[60%] font-medium text-right text-gray-900">
                                {client.address || '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Паспорт</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {client.passport_number || '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">ПИН</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {client.pin || '—'}
                            </dd>
                        </div>
                        {client.comment && (
                            <div className="flex items-start justify-between gap-4">
                                <dt className="text-gray-500">Комментарий</dt>
                                <dd className="max-w-[65%] text-right font-medium text-gray-900">
                                    {client.comment}
                                </dd>
                            </div>
                        )}
                    </dl>
                </section>

                <section className="p-5 bg-white border border-gray-200 rounded-xl">
                    <h4 className="mb-4 text-sm font-semibold text-gray-900">Лот и даты</h4>
                    <dl className="space-y-3 text-sm">
                        {unit && (
                            <>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-gray-500">Этаж</dt>
                                    <dd className="font-medium text-right text-gray-900">
                                        {client.sales_floor
                                            ? `${client.sales_floor.floor_number} этаж`
                                            : '—'}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <dt className="text-gray-500">Комнат</dt>
                                    <dd className="font-medium text-right text-gray-900">
                                        {unit.rooms == null
                                            ? '—'
                                            : unit.rooms === 0
                                              ? 'Студия'
                                              : `${unit.rooms} комн.`}
                                    </dd>
                                </div>
                            </>
                        )}
                        <div className="flex items-start justify-between gap-4">
                            <dt className="flex items-center gap-2 text-gray-500">
                                <User className="w-4 h-4" />
                                <span>Ответственный</span>
                            </dt>
                            <dd className="font-medium text-right text-gray-900">
                                {client.manager_user_id ? `ID: ${client.manager_user_id}` : '—'}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="flex items-center gap-2 text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Закреплён</span>
                            </dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDate(client.assigned_at)}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Создан</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDateTime(client.created_at)}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="text-gray-500">Обновлён</dt>
                            <dd className="font-medium text-right text-gray-900">
                                {formatDateTime(client.updated_at)}
                            </dd>
                        </div>
                    </dl>
                </section>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <button
                    type="button"
                    onClick={onEdit}
                    className="px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-sky-600 hover:bg-sky-700"
                >
                    Редактировать
                </button>
                {client.phone && (
                    <a
                        href={phoneDigits ? `https://wa.me/${phoneDigits}` : undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-700"
                    >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                    </a>
                )}
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
