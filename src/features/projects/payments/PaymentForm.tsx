import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { Payment, PaymentCreatePayload, PaymentUpdatePayload } from './paymentSlice';

type CounterpartyMode = 'manual' | 'supplier' | 'contractor';

interface PaymentFormProps {
    mode: 'create' | 'edit';
    payment?: Payment | null;
    projectId?: number | null;
    blockId?: number | null;
    refs: {
        currencies: ReferenceResult;
        projectBlocks: ReferenceResult;
        suppliers: ReferenceResult;
        contractors: ReferenceResult;
    };
    loading?: boolean;
    onSubmit: (data: PaymentCreatePayload | PaymentUpdatePayload) => void | Promise<void>;
    onCancel: () => void;
}

interface FormState {
    blockId: string;
    paymentType: string;
    articleId: string;
    status: string;
    title: string;
    description: string;
    amount: string;
    currency: string;
    currencyRate: string;
    plannedDate: string;
    paidDate: string;
    paymentMethod: string;
    documentNumber: string;
    externalNumber: string;
    comment: string;
    counterpartyMode: CounterpartyMode;
    counterpartyId: string;
    counterpartyName: string;
    counterpartyInn: string;
}

const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');

const getInitialCounterpartyMode = (payment?: Payment | null): CounterpartyMode => {
    if (payment?.counterparty_type === 'supplier') return 'supplier';
    if (payment?.counterparty_type === 'contractor') return 'contractor';
    return 'manual';
};

const getInitialState = (
    payment: Payment | null | undefined,
    defaults: {
        blockId?: number | null;
        paymentTypeId?: number;
        articleId?: number;
        statusId?: number;
        currencyId?: number;
        paymentMethodId?: number;
    },
): FormState => ({
    blockId: String(payment?.block_id ?? defaults.blockId ?? ''),
    paymentType: String(payment?.payment_type ?? defaults.paymentTypeId ?? ''),
    articleId: String(payment?.article_id ?? defaults.articleId ?? ''),
    status: String(payment?.status ?? defaults.statusId ?? ''),
    title: payment?.title ?? '',
    description: payment?.description ?? '',
    amount: payment?.amount != null ? String(payment.amount) : '',
    currency: String(payment?.currency ?? defaults.currencyId ?? ''),
    currencyRate: String(payment?.currency_rate ?? 1),
    plannedDate: toDateInput(payment?.planned_date),
    paidDate: toDateInput(payment?.paid_date),
    paymentMethod: String(payment?.payment_method ?? defaults.paymentMethodId ?? ''),
    documentNumber: payment?.document_number ?? '',
    externalNumber: payment?.external_number ?? '',
    comment: payment?.comment ?? '',
    counterpartyMode: getInitialCounterpartyMode(payment),
    counterpartyId: String(payment?.counterparty_id ?? ''),
    counterpartyName: payment?.counterparty_name ?? '',
    counterpartyInn: payment?.counterparty_inn ?? '',
});

const normalizeOptionalText = (value: string) => {
    const normalized = value.trim();
    return normalized ? normalized : null;
};

export default function PaymentForm({
    mode,
    payment,
    projectId,
    blockId,
    refs,
    loading = false,
    onSubmit,
    onCancel,
}: PaymentFormProps) {
    const { types, statuses, articles, methods } = useAppSelector((state) => state.payments);

    const [form, setForm] = useState<FormState>(() =>
        getInitialState(payment, {
            blockId,
            paymentTypeId: types[0]?.id,
            articleId: articles[0]?.id,
            statusId: statuses[0]?.id,
            currencyId: Number(refs.currencies.data?.[0]?.id),
            paymentMethodId: methods[0]?.id,
        }),
    );
    const [error, setError] = useState<string | null>(null);

    const visibleArticles = useMemo(() => {
        if (!form.paymentType) return articles;

        return articles.filter((article) => article.payment_type === Number(form.paymentType));
    }, [articles, form.paymentType]);

    useEffect(() => {
        setForm((prev) => {
            const next: FormState = { ...prev };

            if (!next.paymentType && types[0]?.id) {
                next.paymentType = String(types[0].id);
            }

            if (!next.status && statuses[0]?.id) {
                next.status = String(statuses[0].id);
            }

            if (!next.currency && refs.currencies.data?.[0]?.id) {
                next.currency = String(refs.currencies.data[0].id);
            }

            if (!next.blockId && blockId) {
                next.blockId = String(blockId);
            }

            if (!next.paymentMethod && methods[0]?.id) {
                next.paymentMethod = String(methods[0].id);
            }

            if (
                next.articleId &&
                visibleArticles.length > 0 &&
                !visibleArticles.some((article) => article.id === Number(next.articleId))
            ) {
                next.articleId = '';
            }

            if (!next.articleId && visibleArticles[0]?.id) {
                next.articleId = String(visibleArticles[0].id);
            }

            return next;
        });
    }, [types, statuses, methods, refs.currencies.data, blockId, visibleArticles]);

    const counterpartyOptions =
        form.counterpartyMode === 'supplier' ? refs.suppliers.data : refs.contractors.data;

    const lockedBlock = Boolean(blockId);
    const resolvedProjectId = payment?.project_id ?? projectId ?? null;

    const updateField =
        <K extends keyof FormState>(field: K) =>
        (value: FormState[K]) => {
            setForm((prev) => ({ ...prev, [field]: value }));
        };

    const handleCounterpartyModeChange = (value: CounterpartyMode) => {
        setForm((prev) => ({
            ...prev,
            counterpartyMode: value,
            counterpartyId: '',
            counterpartyName: value === 'manual' ? prev.counterpartyName : '',
            counterpartyInn: value === 'manual' ? prev.counterpartyInn : '',
        }));
    };

    const handleCounterpartyIdChange = (value: string) => {
        const source = form.counterpartyMode === 'supplier' ? refs.suppliers : refs.contractors;

        setForm((prev) => ({
            ...prev,
            counterpartyId: value,
            counterpartyName: value ? source.lookup(value) : '',
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!resolvedProjectId) {
            setError('Не удалось определить проект для платежа');
            return;
        }

        if (!form.blockId) {
            setError('Выберите блок проекта');
            return;
        }

        if (!form.paymentType) {
            setError('Выберите тип платежа');
            return;
        }

        if (!form.articleId) {
            setError('Выберите статью платежа');
            return;
        }

        if (!form.title.trim()) {
            setError('Укажите название платежа');
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            setError('Сумма платежа должна быть больше нуля');
            return;
        }

        if (!form.currency) {
            setError('Выберите валюту');
            return;
        }

        if (
            form.counterpartyMode !== 'manual' &&
            !form.counterpartyId &&
            !form.counterpartyName.trim()
        ) {
            setError('Выберите контрагента');
            return;
        }

        setError(null);

        const payload: PaymentCreatePayload = {
            project_id: resolvedProjectId,
            block_id: Number(form.blockId),
            payment_type: Number(form.paymentType),
            article_id: Number(form.articleId),
            status: form.status ? Number(form.status) : undefined,
            title: form.title.trim(),
            description: normalizeOptionalText(form.description),
            amount: Number(form.amount),
            currency: Number(form.currency),
            currency_rate: form.currencyRate ? Number(form.currencyRate) : 1,
            planned_date: form.plannedDate || null,
            paid_date: form.paidDate || null,
            payment_method: form.paymentMethod ? Number(form.paymentMethod) : null,
            document_number: normalizeOptionalText(form.documentNumber),
            external_number: normalizeOptionalText(form.externalNumber),
            comment: normalizeOptionalText(form.comment),
            counterparty_type: form.counterpartyMode === 'manual' ? null : form.counterpartyMode,
            counterparty_id:
                form.counterpartyMode === 'manual' || !form.counterpartyId
                    ? null
                    : Number(form.counterpartyId),
            counterparty_name: normalizeOptionalText(form.counterpartyName),
            counterparty_inn: normalizeOptionalText(form.counterpartyInn),
            entity_type: payment?.entity_type ?? null,
            entity_id: payment?.entity_id ?? null,
            account_type: payment?.account_type ?? null,
            is_manual: form.counterpartyMode === 'manual',
        };

        if (
            (form.counterpartyMode === 'supplier' || form.counterpartyMode === 'contractor') &&
            form.counterpartyId
        ) {
            payload.counterparty_name =
                form.counterpartyMode === 'supplier'
                    ? refs.suppliers.lookup(form.counterpartyId)
                    : refs.contractors.lookup(form.counterpartyId);
        }

        if (mode === 'edit') {
            await onSubmit(payload as PaymentUpdatePayload);
            return;
        }

        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Основные параметры
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Блок проекта <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.blockId}
                            onChange={(event) => updateField('blockId')(event.target.value)}
                            disabled={lockedBlock || loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                        >
                            <option value="">Выберите блок</option>
                            {refs.projectBlocks.data?.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Тип платежа <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.paymentType}
                            onChange={(event) => updateField('paymentType')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                            <option value="">Выберите тип</option>
                            {types.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Статья платежа <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.articleId}
                            onChange={(event) => updateField('articleId')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                            <option value="">Выберите статью</option>
                            {visibleArticles.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Статус
                        </label>
                        <select
                            value={form.status}
                            onChange={(event) => updateField('status')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                            <option value="">Выберите статус</option>
                            {statuses.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Название платежа <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(event) => updateField('title')(event.target.value)}
                            disabled={loading}
                            placeholder="Например: Аванс поставщику по договору"
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Описание
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(event) => updateField('description')(event.target.value)}
                            disabled={loading}
                            rows={3}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg resize-none focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Контрагент и документы
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Тип контрагента
                        </label>
                        <select
                            value={form.counterpartyMode}
                            onChange={(event) =>
                                handleCounterpartyModeChange(
                                    event.target.value as CounterpartyMode,
                                )
                            }
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                            <option value="manual">Ручной ввод</option>
                            <option value="supplier">Поставщик</option>
                            <option value="contractor">Подрядчик</option>
                        </select>
                    </div>

                    {form.counterpartyMode !== 'manual' ? (
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Контрагент
                            </label>
                            <select
                                value={form.counterpartyId}
                                onChange={(event) => handleCounterpartyIdChange(event.target.value)}
                                disabled={loading}
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            >
                                <option value="">Выберите значение</option>
                                {counterpartyOptions?.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Наименование контрагента
                            </label>
                            <input
                                type="text"
                                value={form.counterpartyName}
                                onChange={(event) =>
                                    updateField('counterpartyName')(event.target.value)
                                }
                                disabled={loading}
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            ИНН
                        </label>
                        <input
                            type="text"
                            value={form.counterpartyInn}
                            onChange={(event) => updateField('counterpartyInn')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Способ оплаты
                        </label>
                        <select
                            value={form.paymentMethod}
                            onChange={(event) => updateField('paymentMethod')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                            <option value="">Не выбран</option>
                            {methods.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Номер документа
                        </label>
                        <input
                            type="text"
                            value={form.documentNumber}
                            onChange={(event) =>
                                updateField('documentNumber')(event.target.value)
                            }
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Внешний номер
                        </label>
                        <input
                            type="text"
                            value={form.externalNumber}
                            onChange={(event) =>
                                updateField('externalNumber')(event.target.value)
                            }
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Сумма и даты
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Сумма <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={(event) => updateField('amount')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Валюта <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.currency}
                            onChange={(event) => updateField('currency')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                            <option value="">Выберите валюту</option>
                            {refs.currencies.data?.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Курс валюты
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.0001"
                            value={form.currencyRate}
                            onChange={(event) => updateField('currencyRate')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Плановая дата
                        </label>
                        <input
                            type="date"
                            value={form.plannedDate}
                            onChange={(event) => updateField('plannedDate')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Дата оплаты
                        </label>
                        <input
                            type="date"
                            value={form.paidDate}
                            onChange={(event) => updateField('paidDate')(event.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Комментарий
                        </label>
                        <textarea
                            value={form.comment}
                            onChange={(event) => updateField('comment')(event.target.value)}
                            disabled={loading}
                            rows={3}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg resize-none focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                    {error}
                </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-sky-600 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {mode === 'create' ? 'Сохранить платеж' : 'Обновить платеж'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}
