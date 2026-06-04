import { useMemo, useState, type FormEvent } from 'react';
import { Loader2, Save } from 'lucide-react';
import type {
    SalesClient,
    SalesClientCreatePayload,
    SalesClientUpdatePayload,
} from '../slices/salesClientsSlice';

interface Project {
    id: number;
    name: string;
}
interface Block {
    id: number;
    name: string;
    project_id: number;
}

interface ClientFormProps {
    mode: 'create' | 'edit';
    client?: SalesClient | null;
    projects?: Project[];
    blocks?: Block[];
    loading?: boolean;
    onSubmit: (data: SalesClientCreatePayload | SalesClientUpdatePayload) => void | Promise<void>;
    onCancel: () => void;
}

interface FormState {
    last_name: string;
    first_name: string;
    middle_name: string;
    phone: string;
    phone_extra: string;
    email: string;
    birth_date: string;
    passport_number: string;
    pin: string;
    address: string;
    project_id: string;
    block_id: string;
    unit_id: string;
    comment: string;
}

const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');

const normalize = (value: string): string | null => {
    const trimmed = value.trim();
    return trimmed || null;
};

const getInitialState = (client: SalesClient | null | undefined): FormState => ({
    last_name: client?.last_name ?? '',
    first_name: client?.first_name ?? '',
    middle_name: client?.middle_name ?? '',
    phone: client?.phone ?? '',
    phone_extra: client?.phone_extra ?? '',
    email: client?.email ?? '',
    birth_date: toDateInput(client?.birth_date),
    passport_number: client?.passport_number ?? '',
    pin: client?.pin ?? '',
    address: client?.address ?? '',
    project_id: client?.project_id != null ? String(client.project_id) : '',
    block_id: client?.block_id != null ? String(client.block_id) : '',
    unit_id: client?.unit_id != null ? String(client.unit_id) : '',
    comment: client?.comment ?? '',
});

export default function ClientForm({
    mode,
    client,
    projects = [],
    blocks = [],
    loading = false,
    onSubmit,
    onCancel,
}: ClientFormProps) {
    const [form, setForm] = useState<FormState>(() => getInitialState(client));
    const [error, setError] = useState<string | null>(null);

    const filteredBlocks = useMemo(
        () => blocks.filter((b) => !form.project_id || b.project_id === Number(form.project_id)),
        [blocks, form.project_id],
    );

    const set =
        <K extends keyof FormState>(field: K) =>
        (value: FormState[K]) =>
            setForm((prev) => ({ ...prev, [field]: value }));

    const handleProjectChange = (value: string) => {
        setForm((prev) => ({ ...prev, project_id: value, block_id: '' }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.last_name.trim()) {
            setError('Укажите фамилию');
            return;
        }
        if (!form.first_name.trim()) {
            setError('Укажите имя');
            return;
        }

        setError(null);

        const payload: SalesClientCreatePayload = {
            last_name: form.last_name.trim(),
            first_name: form.first_name.trim(),
            middle_name: normalize(form.middle_name),
            phone: normalize(form.phone),
            phone_extra: normalize(form.phone_extra),
            email: normalize(form.email),
            birth_date: form.birth_date || null,
            passport_number: normalize(form.passport_number),
            pin: normalize(form.pin),
            address: normalize(form.address),
            project_id: form.project_id ? Number(form.project_id) : null,
            block_id: form.block_id ? Number(form.block_id) : null,
            unit_id: form.unit_id ? Number(form.unit_id) : null,
            comment: normalize(form.comment),
        };

        await onSubmit(mode === 'edit' ? (payload as SalesClientUpdatePayload) : payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Личные данные */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Личные данные
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Фамилия <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.last_name}
                                onChange={(e) => set('last_name')(e.target.value)}
                                disabled={loading}
                                placeholder="Иванов"
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Имя <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.first_name}
                                onChange={(e) => set('first_name')(e.target.value)}
                                disabled={loading}
                                placeholder="Иван"
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Отчество
                            </label>
                            <input
                                type="text"
                                value={form.middle_name}
                                onChange={(e) => set('middle_name')(e.target.value)}
                                disabled={loading}
                                placeholder="Иванович"
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Контакты */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Контакты
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr_1fr]">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Телефон
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => set('phone')(e.target.value)}
                                disabled={loading}
                                placeholder="+996 555 000-00-00"
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Доп. телефон
                            </label>
                            <input
                                type="tel"
                                value={form.phone_extra}
                                onChange={(e) => set('phone_extra')(e.target.value)}
                                disabled={loading}
                                placeholder="+996 700 000-00-00"
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Дата рождения
                            </label>
                            <input
                                type="date"
                                value={form.birth_date}
                                onChange={(e) => set('birth_date')(e.target.value)}
                                disabled={loading}
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => set('email')(e.target.value)}
                                disabled={loading}
                                placeholder="example@mail.com"
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Адрес
                            </label>
                            <input
                                type="text"
                                value={form.address}
                                onChange={(e) => set('address')(e.target.value)}
                                disabled={loading}
                                placeholder="г. Бишкек, ул. ..."
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Документы */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Документы
                </h3>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Серия и номер паспорта
                        </label>
                        <input
                            type="text"
                            value={form.passport_number}
                            onChange={(e) => set('passport_number')(e.target.value)}
                            disabled={loading}
                            placeholder="AN1234567"
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            ПИН
                        </label>
                        <input
                            type="text"
                            maxLength={14}
                            inputMode="numeric"
                            value={form.pin}
                            onChange={(e) => set('pin')(e.target.value)}
                            disabled={loading}
                            placeholder="14 цифр"
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                        />
                    </div>
                </div>
            </div>

            {/* Section: Назначение */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Назначение
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.9fr_0.9fr]">
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Объект
                            </label>
                            <select
                                value={form.project_id}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                disabled={loading}
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            >
                                <option value="">Не выбран</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                Блок
                            </label>
                            <select
                                value={form.block_id}
                                onChange={(e) => set('block_id')(e.target.value)}
                                disabled={loading || !form.project_id}
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            >
                                <option value="">Не выбран</option>
                                {filteredBlocks.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                ID лота
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.unit_id}
                                onChange={(e) => set('unit_id')(e.target.value)}
                                disabled={loading}
                                placeholder="—"
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Комментарий
                        </label>
                        <textarea
                            value={form.comment}
                            onChange={(e) => set('comment')(e.target.value)}
                            disabled={loading}
                            rows={3}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg resize-none focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-100"
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
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {mode === 'create' ? 'Сохранить клиента' : 'Обновить клиента'}
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
