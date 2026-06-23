import type { ChangeEvent, FormEvent } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import type { EnumItem } from '@/features/reference/referenceService';
import type { DocumentFile } from '@/features/projects/legal_department/files/documentFilesSlice';
import type {
    PassportDeal,
    PassportReservation,
    PassportReservationBrief,
} from '../slices/salesUnitPassportSlice';
import {
    InlineHint,
    InputField,
    ModalActions,
    ModalSection,
    ModalWrapper,
    PrimaryButton,
    SecondaryButton,
    SelectField,
    TextareaField,
} from './SalesUnitPassportUI';

type LookupOption = {
    id: number | string;
    name?: string | null;
    full_name?: string | null;
    phone?: string | null;
};

type ReservationFormState = {
    client_id: string;
    start_at: string;
    expires_at: string;
    reservation_amount: string;
    currency: string;
    comment: string;
};

type DealFormState = {
    client_id: string;
    reservation_id: string;
    deal_type_id: string;
    contract_number: string;
    contract_date: string;
    payment_type: string;
    total_amount: string;
    currency: string;
    note: string;
};

type PaymentFormState = {
    deal_id: string;
    title: string;
    amount: string;
    currency: string;
    planned_date: string;
    paid_date: string;
};

type ScheduleFormState = {
    deal_id: string;
    start_date: string;
    payments_count: string;
    interval_months: string;
    payment_day: string;
    first_payment_amount: string;
    total_amount: string;
    comment: string;
};

/*****************************************************************************************************/
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
    onSubmit: (event: FormEvent) => void;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <ModalWrapper
            title={isEditing ? 'Редактировать бронь' : 'Новая бронь'}
            subtitle={`Квартира №${unitNumber}`}
            onClose={onClose}
            maxWidth="max-w-lg"
        >
            <form onSubmit={onSubmit} className="space-y-3">
                <ModalSection className="space-y-3">
                    <SelectField
                        label="Клиент *"
                        value={resForm.client_id}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            onChange({ client_id: e.target.value })
                        }
                        required
                    >
                        <option value="">Выберите клиента</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.full_name || client.phone}
                            </option>
                        ))}
                    </SelectField>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InputField
                            label="Начало"
                            type="date"
                            value={resForm.start_at}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ start_at: e.target.value })
                            }
                        />
                        <InputField
                            label="Окончание"
                            type="date"
                            value={resForm.expires_at}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ expires_at: e.target.value })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InputField
                            label="Сумма брони"
                            value={resForm.reservation_amount}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ reservation_amount: e.target.value })
                            }
                        />
                        <SelectField
                            label="Валюта"
                            value={resForm.currency}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                onChange({ currency: e.target.value })
                            }
                        >
                            <option value="">Выберите валюту</option>
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.id}>
                                    {currency.name}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <TextareaField
                        label="Комментарий"
                        value={resForm.comment}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            onChange({ comment: e.target.value })
                        }
                    />
                </ModalSection>

                <ModalActions>
                    <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
                    <PrimaryButton type="submit" disabled={actionLoading}>
                        {actionLoading ? 'Сохранение...' : 'Сохранить'}
                    </PrimaryButton>
                </ModalActions>
            </form>
        </ModalWrapper>
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
    editingDeal: PassportDeal | null;
    actionLoading: boolean;
    dealForm: DealFormState;
    clients: LookupOption[];
    dealReservationOptions: (PassportReservation | PassportReservationBrief)[];
    dealTypes: LookupOption[];
    dealPaymentTypes: EnumItem[];
    currencies: EnumItem[];
    getReservationStatusName: (value: PassportReservation | PassportReservationBrief) => string;
    onChange: (patch: Partial<DealFormState>) => void;
    onSubmit: (event: FormEvent) => void;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <ModalWrapper
            title={editingDeal ? 'Редактировать договор' : 'Новый договор'}
            subtitle={`Квартира №${unitNumber}`}
            onClose={onClose}
            maxWidth="max-w-xl"
        >
            <form onSubmit={onSubmit} className="space-y-3">
                <ModalSection className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <SelectField
                            label="Клиент *"
                            value={dealForm.client_id}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                onChange({ client_id: e.target.value })
                            }
                            required
                        >
                            <option value="">Выберите клиента</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.full_name || client.phone || `Клиент #${client.id}`}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Бронь"
                            value={dealForm.reservation_id}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                onChange({ reservation_id: e.target.value })
                            }
                        >
                            <option value="">Без брони</option>
                            {dealReservationOptions.map((reservation) => (
                                <option key={reservation.id} value={reservation.id}>
                                    Бронь #{reservation.id} ·{' '}
                                    {getReservationStatusName(reservation)}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InputField
                            label="№ договора"
                            value={dealForm.contract_number}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ contract_number: e.target.value })
                            }
                        />
                        <InputField
                            label="Дата договора"
                            type="date"
                            value={dealForm.contract_date}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ contract_date: e.target.value })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <SelectField
                            label="Тип сделки"
                            value={dealForm.deal_type_id}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                onChange({ deal_type_id: e.target.value })
                            }
                        >
                            <option value="">Не выбран</option>
                            {dealTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </SelectField>

                        <SelectField
                            label="Оплата"
                            value={dealForm.payment_type}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                onChange({ payment_type: e.target.value })
                            }
                        >
                            <option value="">Не выбрана</option>
                            {dealPaymentTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <SelectField
                            label="Валюта"
                            value={dealForm.currency}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                onChange({ currency: e.target.value })
                            }
                        >
                            <option value="">Не выбрана</option>
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.id}>
                                    {currency.name}
                                </option>
                            ))}
                        </SelectField>
                        <InputField
                            label="Сумма"
                            value={dealForm.total_amount}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ total_amount: e.target.value })
                            }
                        />
                    </div>
                </ModalSection>

                <ModalSection>
                    <TextareaField
                        label="Заметка"
                        value={dealForm.note}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            onChange({ note: e.target.value })
                        }
                    />
                </ModalSection>

                <ModalActions>
                    <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
                    <PrimaryButton type="submit" disabled={actionLoading}>
                        {actionLoading ? 'Сохранение...' : 'Сохранить договор'}
                    </PrimaryButton>
                </ModalActions>
            </form>
        </ModalWrapper>
    );
}

export function PaymentModal({
    open,
    unitNumber,
    deals,
    paymentForm,
    currencies,
    actionLoading,
    onDealChange,
    onChange,
    onSubmit,
    onClose,
}: {
    open: boolean;
    unitNumber: string | number;
    deals: PassportDeal[];
    paymentForm: PaymentFormState;
    currencies: EnumItem[];
    actionLoading: boolean;
    onDealChange: (dealId: string) => void;
    onChange: (patch: Partial<PaymentFormState>) => void;
    onSubmit: (event: FormEvent) => void;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <ModalWrapper
            title="Добавить платеж"
            subtitle={`Квартира №${unitNumber}`}
            onClose={onClose}
            maxWidth="max-w-lg"
        >
            <form onSubmit={onSubmit} className="space-y-3">
                <ModalSection className="space-y-3">
                    <SelectField
                        label="Договор"
                        value={paymentForm.deal_id}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            onDealChange(e.target.value)
                        }
                    >
                        <option value="">Выберите договор</option>
                        {deals.map((deal) => (
                            <option key={deal.id} value={deal.id}>
                                Договор №{deal.contract_number || deal.id}
                            </option>
                        ))}
                    </SelectField>

                    <InputField
                        label="Название"
                        value={paymentForm.title}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onChange({ title: e.target.value })
                        }
                    />

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InputField
                            label="Сумма"
                            value={paymentForm.amount}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ amount: e.target.value })
                            }
                        />
                        <SelectField
                            label="Валюта"
                            value={paymentForm.currency}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                onChange({ currency: e.target.value })
                            }
                        >
                            <option value="">Не выбрана</option>
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.id}>
                                    {currency.name}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InputField
                            label="Плановая дата"
                            type="date"
                            value={paymentForm.planned_date}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ planned_date: e.target.value })
                            }
                        />
                        <InputField
                            label="Фактическая дата"
                            type="date"
                            value={paymentForm.paid_date}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ paid_date: e.target.value })
                            }
                        />
                    </div>
                </ModalSection>

                <ModalActions>
                    <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
                    <PrimaryButton type="submit" disabled={actionLoading}>
                        {actionLoading ? 'Создание...' : 'Создать платеж'}
                    </PrimaryButton>
                </ModalActions>
            </form>
        </ModalWrapper>
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
    onSubmit: (event: FormEvent) => void;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <ModalWrapper
            title="График платежей"
            subtitle={`Квартира №${unitNumber}`}
            onClose={onClose}
            maxWidth="max-w-2xl"
        >
            <form onSubmit={onSubmit} className="space-y-3">
                <ModalSection className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InputField
                            label="Дата старта"
                            type="date"
                            value={scheduleForm.start_date}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ start_date: e.target.value })
                            }
                        />
                        <InputField
                            label="День месяца"
                            value={scheduleForm.payment_day}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({
                                    payment_day: e.target.value.replace(/[^\d]/g, '').slice(0, 2),
                                })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InputField
                            label="Количество платежей"
                            value={scheduleForm.payments_count}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({
                                    payments_count: e.target.value.replace(/[^\d]/g, ''),
                                })
                            }
                        />
                        <SelectField
                            label="Интервал, мес."
                            value={scheduleForm.interval_months}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                onChange({ interval_months: e.target.value })
                            }
                        >
                            <option value="1">Каждый месяц</option>
                            <option value="2">Раз в 2 месяца</option>
                            <option value="3">Раз в 3 месяца</option>
                            <option value="6">Раз в 6 месяцев</option>
                        </SelectField>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InputField
                            label="Сумма договора"
                            value={scheduleForm.total_amount}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ total_amount: e.target.value })
                            }
                        />
                        <InputField
                            label="Первый платеж"
                            value={scheduleForm.first_payment_amount}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                onChange({ first_payment_amount: e.target.value })
                            }
                        />
                    </div>
                </ModalSection>

                <ModalSection className="space-y-3">
                    <TextareaField
                        label="Комментарий"
                        value={scheduleForm.comment}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            onChange({ comment: e.target.value })
                        }
                    />

                    <InlineHint tone="amber">
                        Новый график заменит старый по этому договору. Уже оплаченные платежи будут
                        перераспределены сервером автоматически.
                    </InlineHint>
                </ModalSection>

                <ModalActions>
                    <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
                    <PrimaryButton type="submit" disabled={actionLoading}>
                        {actionLoading ? 'Формирование...' : 'Сформировать график'}
                    </PrimaryButton>
                </ModalActions>
            </form>
        </ModalWrapper>
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
        deal: PassportDeal | null;
        documentId: number | null;
        files: DocumentFile[];
    };
    onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
    onDownload: (file: DocumentFile) => void;
    onDelete: (fileId: number) => void;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <ModalWrapper
            title={`Файлы договора №${dealFilesContext.deal?.contract_number || dealFilesContext.deal?.id || ''}`}
            subtitle={`Квартира №${unitNumber}`}
            onClose={onClose}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-3">
                <ModalSection className="space-y-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition bg-blue-600 cursor-pointer rounded-xl hover:bg-blue-700">
                        <Upload size={16} />
                        {filesLoading ? 'Загрузка...' : 'Добавить файлы'}
                        <input type="file" multiple className="hidden" onChange={onUpload} />
                    </label>

                    <InlineHint>
                        Загрузите один или несколько файлов договора, чтобы они были доступны для
                        скачивания из карточки.
                    </InlineHint>
                </ModalSection>

                <ModalSection className="space-y-2">
                    {dealFilesContext.files.length ? (
                        dealFilesContext.files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5"
                            >
                                <div className="min-w-0 text-sm font-medium truncate text-slate-700">
                                    {file.name || `Файл #${file.id}`}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onDownload(file)}
                                        className="flex items-center justify-center w-8 h-8 transition rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    >
                                        <Download size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(file.id)}
                                        className="flex items-center justify-center w-8 h-8 text-red-600 transition rounded-xl bg-red-50 hover:bg-red-100"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-sm text-center bg-white border border-dashed rounded-xl border-stone-200 text-slate-500">
                            Файлы пока не прикреплены
                        </div>
                    )}
                </ModalSection>
            </div>
        </ModalWrapper>
    );
}
