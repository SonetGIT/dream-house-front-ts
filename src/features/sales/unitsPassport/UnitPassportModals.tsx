import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Download, Trash2, Upload, X } from 'lucide-react';
import type { EnumItem } from '@/features/reference/referenceService';
import type { DocumentFile } from '@/features/projects/legal_department/files/documentFilesSlice';
import type { SalesDeal, SalesReservation } from '../slices/salesUnitPassportSlice';

type LookupOption = {
    id: number | string;
    name?: string | null;
    full_name?: string | null;
    phone?: string | null;
};

export type ReservationFormState = {
    client_id: string;
    start_at: string;
    expires_at: string;
    reservation_amount: string;
    currency: string;
    comment: string;
};

export type DealFormState = {
    client_id: string;
    reservation_id: string;
    deal_type_id: string;
    contract_number: string;
    contract_date: string;
    payment_type: string;
    total_amount: string;
    currency: string;
    currency_rate: string;
    note: string;
};

export type PaymentFormState = {
    deal_id: string;
    reservation_id: string;
    client_id: string;
    title: string;
    amount: string;
    currency: string;
    currency_rate: string;
    planned_date: string;
    paid_date: string;
};

export type ScheduleFormState = {
    deal_id: string;
    start_date: string;
    payments_count: string;
    interval_months: string;
    payment_day: string;
    first_payment_amount: string;
    total_amount: string;
    comment: string;
};

type ModalShellProps = {
    open: boolean;
    title: string;
    subtitle?: string;
    maxWidth?: string;
    onClose: () => void;
    children: ReactNode;
};

function ModalShell({
    open,
    title,
    subtitle,
    maxWidth = 'max-w-xl',
    onClose,
    children,
}: ModalShellProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
            <div className={`w-full ${maxWidth} overflow-hidden rounded-2xl bg-white shadow-2xl`}>
                <div className="flex items-start justify-between px-5 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                        {subtitle ? (
                            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 transition rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[80vh] overflow-y-auto px-5 py-4">{children}</div>
            </div>
        </div>
    );
}

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
    return (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
    );
}

function Section({ title, children }: { title?: string; children: ReactNode }) {
    return (
        <div className="p-4 border rounded-xl border-slate-200 bg-slate-50">
            {title ? (
                <div className="mb-3 text-sm font-semibold text-slate-800">{title}</div>
            ) : null}
            {children}
        </div>
    );
}

function FooterActions({
    actionLoading,
    submitLabel,
    onClose,
}: {
    actionLoading?: boolean;
    submitLabel: string;
    onClose: () => void;
}) {
    return (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium transition border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100"
            >
                Отмена
            </button>
            <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {actionLoading ? 'Сохранение...' : submitLabel}
            </button>
        </div>
    );
}

export function ReservationModal({
    open,
    unitNumber,
    isEditing,
    actionLoading,
    resForm,
    clients,
    currencies,
    onChange,
    onSubmit,
    onClose,
}: {
    open: boolean;
    unitNumber: string | number;
    isEditing: boolean;
    actionLoading: boolean;
    resForm: ReservationFormState;
    clients: LookupOption[];
    currencies: EnumItem[];
    onChange: (patch: Partial<ReservationFormState>) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}) {
    return (
        <ModalShell
            open={open}
            title={isEditing ? 'Редактировать бронь' : 'Новая бронь'}
            subtitle={`Лот №${unitNumber}`}
            maxWidth="max-w-2xl"
            onClose={onClose}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <Section title="Основная информация">
                    <div className="space-y-4">
                        <div>
                            <FieldLabel label="Клиент" required />
                            <select
                                value={resForm.client_id}
                                onChange={(e) => onChange({ client_id: e.target.value })}
                                required
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 text-slate-800 focus:border-blue-500"
                            >
                                <option value="">Выберите клиента</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.full_name || client.phone || `Клиент #${client.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <FieldLabel label="Дата начала" />
                                <input
                                    type="date"
                                    value={resForm.start_at}
                                    onChange={(e) => onChange({ start_at: e.target.value })}
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <FieldLabel label="Дата окончания" />
                                <input
                                    type="date"
                                    value={resForm.expires_at}
                                    onChange={(e) => onChange({ expires_at: e.target.value })}
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <FieldLabel label="Сумма брони" />
                                <input
                                    value={resForm.reservation_amount}
                                    onChange={(e) =>
                                        onChange({ reservation_amount: e.target.value })
                                    }
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <FieldLabel label="Валюта" />
                                <select
                                    value={resForm.currency}
                                    onChange={(e) => onChange({ currency: e.target.value })}
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 text-slate-800 focus:border-blue-500"
                                >
                                    <option value="">Выберите валюту</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.id}>
                                            {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <FieldLabel label="Комментарий" />
                            <textarea
                                rows={4}
                                value={resForm.comment}
                                onChange={(e) => onChange({ comment: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </Section>

                <FooterActions
                    actionLoading={actionLoading}
                    submitLabel="Сохранить бронь"
                    onClose={onClose}
                />
            </form>
        </ModalShell>
    );
}

export function DealModal({
    open,
    unitNumber,
    editingDeal,
    actionLoading,
    dealForm,
    clients,
    dealReservationOptions,
    dealTypes,
    dealPaymentTypes,
    currencies,
    getReservationStatusName,
    onChange,
    onSubmit,
    onClose,
}: {
    open: boolean;
    unitNumber: string | number;
    editingDeal: SalesDeal | null;
    actionLoading: boolean;
    dealForm: DealFormState;
    clients: LookupOption[];
    dealReservationOptions: SalesReservation[];
    dealTypes: LookupOption[];
    dealPaymentTypes: EnumItem[];
    currencies: EnumItem[];
    getReservationStatusName: (value: SalesReservation) => string;
    onChange: (patch: Partial<DealFormState>) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}) {
    return (
        <ModalShell
            open={open}
            title={editingDeal ? 'Редактировать договор' : 'Новый договор'}
            subtitle={`Лот №${unitNumber}`}
            maxWidth="max-w-3xl"
            onClose={onClose}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <Section title="Основная информация">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <FieldLabel label="Клиент" required />
                            <select
                                value={dealForm.client_id}
                                onChange={(e) => onChange({ client_id: e.target.value })}
                                required
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            >
                                <option value="">Выберите клиента</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.full_name || client.phone || `Клиент #${client.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <FieldLabel label="Бронь" />
                            <select
                                value={dealForm.reservation_id}
                                onChange={(e) => onChange({ reservation_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            >
                                <option value="">Без брони</option>
                                {dealReservationOptions.map((reservation) => (
                                    <option key={reservation.id} value={reservation.id}>
                                        Бронь №{reservation.id} ·{' '}
                                        {getReservationStatusName(reservation)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                        <div>
                            <FieldLabel label="Номер договора" />
                            <input
                                value={dealForm.contract_number}
                                onChange={(e) => onChange({ contract_number: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <FieldLabel label="Дата договора" />
                            <input
                                type="date"
                                value={dealForm.contract_date}
                                onChange={(e) => onChange({ contract_date: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                        <div>
                            <FieldLabel label="Тип сделки" />
                            <select
                                value={dealForm.deal_type_id}
                                onChange={(e) => onChange({ deal_type_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            >
                                <option value="">Не выбран</option>
                                {dealTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <FieldLabel label="Тип оплаты" />
                            <select
                                value={dealForm.payment_type}
                                onChange={(e) => onChange({ payment_type: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            >
                                <option value="">Не выбран</option>
                                {dealPaymentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
                        <div>
                            <FieldLabel label="Валюта" />
                            <select
                                value={dealForm.currency}
                                onChange={(e) => onChange({ currency: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            >
                                <option value="">Не выбрана</option>
                                {currencies.map((currency) => (
                                    <option key={currency.id} value={currency.id}>
                                        {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <FieldLabel label="Сумма" />
                            <input
                                value={dealForm.total_amount}
                                onChange={(e) => onChange({ total_amount: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <FieldLabel label="Курс валюты" />
                            <input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={dealForm.currency_rate}
                                onChange={(e) => onChange({ currency_rate: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </Section>

                <Section title="Примечание">
                    <textarea
                        rows={4}
                        value={dealForm.note}
                        onChange={(e) => onChange({ note: e.target.value })}
                        className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                    />
                </Section>

                <FooterActions
                    actionLoading={actionLoading}
                    submitLabel="Сохранить договор"
                    onClose={onClose}
                />
            </form>
        </ModalShell>
    );
}

export function PaymentModal({
    open,
    unitNumber,
    deals,
    paymentForm,
    reservationOptionLabel,
    currencies,
    actionLoading,
    onDealChange,
    onChange,
    onSubmit,
    onClose,
}: {
    open: boolean;
    unitNumber: string | number;
    deals: SalesDeal[];
    paymentForm: PaymentFormState;
    reservationOptionLabel?: string | null;
    currencies: EnumItem[];
    actionLoading: boolean;
    onDealChange: (dealId: string) => void;
    onChange: (patch: Partial<PaymentFormState>) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}) {
    return (
        <ModalShell
            open={open}
            title="Добавить платеж"
            subtitle={`Лот №${unitNumber}`}
            maxWidth="max-w-2xl"
            onClose={onClose}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <Section title="Платеж">
                    <div className="space-y-4">
                        <div>
                            <FieldLabel label="Привязка" />
                            <select
                                value={paymentForm.deal_id}
                                onChange={(e) => onDealChange(e.target.value)}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            >
                                <option value="">
                                    {reservationOptionLabel || 'Выберите договор'}
                                </option>
                                {deals.map((deal) => (
                                    <option key={deal.id} value={deal.id}>
                                        Договор №{deal.contract_number || deal.id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <FieldLabel label="Название" />
                            <input
                                value={paymentForm.title}
                                onChange={(e) => onChange({ title: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <FieldLabel label="Сумма" />
                                <input
                                    value={paymentForm.amount}
                                    onChange={(e) => onChange({ amount: e.target.value })}
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <FieldLabel label="Валюта" />
                                <select
                                    value={paymentForm.currency}
                                    onChange={(e) => onChange({ currency: e.target.value })}
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                                >
                                    <option value="">Не выбрана</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.id}>
                                            {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <FieldLabel label="Курс валюты" />
                                <input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={paymentForm.currency_rate}
                                    onChange={(e) => onChange({ currency_rate: e.target.value })}
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <FieldLabel label="Плановая дата" />
                                <input
                                    type="date"
                                    value={paymentForm.planned_date}
                                    onChange={(e) => onChange({ planned_date: e.target.value })}
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <FieldLabel label="Фактическая дата" />
                                <input
                                    type="date"
                                    value={paymentForm.paid_date}
                                    onChange={(e) => onChange({ paid_date: e.target.value })}
                                    className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </Section>

                <FooterActions
                    actionLoading={actionLoading}
                    submitLabel="Создать платеж"
                    onClose={onClose}
                />
            </form>
        </ModalShell>
    );
}

export function ScheduleModal({
    open,
    unitNumber,
    scheduleForm,
    actionLoading,
    onChange,
    onSubmit,
    onClose,
}: {
    open: boolean;
    unitNumber: string | number;
    scheduleForm: ScheduleFormState;
    actionLoading: boolean;
    onChange: (patch: Partial<ScheduleFormState>) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}) {
    return (
        <ModalShell
            open={open}
            title="График платежей"
            subtitle={`Лот №${unitNumber}`}
            maxWidth="max-w-3xl"
            onClose={onClose}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <Section title="Параметры графика">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <FieldLabel label="Дата старта" />
                            <input
                                type="date"
                                value={scheduleForm.start_date}
                                onChange={(e) => onChange({ start_date: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <FieldLabel label="День месяца" />
                            <input
                                value={scheduleForm.payment_day}
                                onChange={(e) =>
                                    onChange({
                                        payment_day: e.target.value
                                            .replace(/[^\d]/g, '')
                                            .slice(0, 2),
                                    })
                                }
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                        <div>
                            <FieldLabel label="Количество платежей" />
                            <input
                                value={scheduleForm.payments_count}
                                onChange={(e) =>
                                    onChange({
                                        payments_count: e.target.value.replace(/[^\d]/g, ''),
                                    })
                                }
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <FieldLabel label="Интервал, мес." />
                            <select
                                value={scheduleForm.interval_months}
                                onChange={(e) => onChange({ interval_months: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            >
                                <option value="1">Каждый месяц</option>
                                <option value="2">Раз в 2 месяца</option>
                                <option value="3">Раз в 3 месяца</option>
                                <option value="6">Раз в 6 месяцев</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                        <div>
                            <FieldLabel label="Сумма договора" />
                            <input
                                value={scheduleForm.total_amount}
                                onChange={(e) => onChange({ total_amount: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <FieldLabel label="Первый платеж" />
                            <input
                                value={scheduleForm.first_payment_amount}
                                onChange={(e) => onChange({ first_payment_amount: e.target.value })}
                                className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </Section>

                <Section title="Комментарий">
                    <textarea
                        rows={4}
                        value={scheduleForm.comment}
                        onChange={(e) => onChange({ comment: e.target.value })}
                        className="w-full px-3 py-2 text-sm transition bg-white border rounded-lg outline-none border-slate-300 focus:border-blue-500"
                    />
                    <div className="px-3 py-2 mt-3 text-sm border rounded-lg border-amber-200 bg-amber-50 text-amber-800">
                        Новый график заменит старый по этому договору. Уже оплаченные платежи будут
                        перераспределены сервером автоматически.
                    </div>
                </Section>

                <FooterActions
                    actionLoading={actionLoading}
                    submitLabel="Сформировать график"
                    onClose={onClose}
                />
            </form>
        </ModalShell>
    );
}

export function DealFilesModal({
    open,
    unitNumber,
    filesLoading,
    dealFilesContext,
    onUpload,
    onDownload,
    onDelete,
    onClose,
}: {
    open: boolean;
    unitNumber: string | number;
    filesLoading: boolean;
    dealFilesContext: {
        deal: SalesDeal | null;
        documentId: number | null;
        files: DocumentFile[];
    };
    onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
    onDownload: (file: DocumentFile) => void;
    onDelete: (fileId: number) => void;
    onClose: () => void;
}) {
    return (
        <ModalShell
            open={open}
            title={`Файлы договора №${dealFilesContext.deal?.contract_number || dealFilesContext.deal?.id || ''}`}
            subtitle={`Лот №${unitNumber}`}
            maxWidth="max-w-3xl"
            onClose={onClose}
        >
            <div className="space-y-4">
                <Section title="Загрузка файлов">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition bg-blue-600 cursor-pointer rounded-xl hover:bg-blue-700">
                        <Upload size={16} />
                        {filesLoading ? 'Загрузка...' : 'Добавить файлы'}
                        <input type="file" multiple className="hidden" onChange={onUpload} />
                    </label>

                    <div className="px-3 py-2 mt-3 text-sm bg-white border rounded-lg border-slate-200 text-slate-500">
                        Загрузи один или несколько файлов договора, чтобы они были доступны из
                        карточки.
                    </div>
                </Section>

                <Section title="Список файлов">
                    {dealFilesContext.files.length ? (
                        <div className="space-y-2">
                            {dealFilesContext.files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium truncate text-slate-800">
                                            {file.name || `Файл #${file.id}`}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onDownload(file)}
                                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        >
                                            <Download size={14} />
                                            Скачать
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(file.id)}
                                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 transition rounded-lg bg-red-50 hover:bg-red-100"
                                        >
                                            <Trash2 size={14} />
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-sm text-center bg-white border border-dashed rounded-xl border-slate-300 text-slate-500">
                            Файлы пока не прикреплены
                        </div>
                    )}
                </Section>
            </div>
        </ModalShell>
    );
}
