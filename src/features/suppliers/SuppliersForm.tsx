import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { SupplierForm, SupplierFormData } from './suppliersSlice';

interface SupplierFormProps {
    supplier?: SupplierFormData | null;
    onSubmit: (data: SupplierFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

/**Создание начального состояния формы*/
function getInitialFormData(supplier?: SupplierFormData | null): SupplierForm {
    return {
        name: supplier?.name || '',
        inn: supplier?.inn || '',
        kpp: supplier?.kpp ?? null,
        ogrn: supplier?.ogrn ?? null,
        address: supplier?.address ?? null,
        phone: supplier?.phone ?? null,
        email: supplier?.email ?? null,
        contact_person: supplier?.contact_person ?? null,
    };
}

export default function SuppliersForm({
    supplier,
    onSubmit,
    onCancel,
    loading = false,
}: SupplierFormProps) {
    const [formData, setFormData] = useState<SupplierForm>(() => getInitialFormData(supplier));
    const [errors, setErrors] = useState<Record<string, string>>({});

    /*Обновление формы при редактировании*/
    useEffect(() => {
        setFormData(getInitialFormData(supplier));
    }, [supplier]);

    /*Валидация*/
    const validate = () => {
        const newErrors: Record<string, string> = {};
        const isDigits = (value: string) => /^\d+$/.test(value);

        if (!formData.name.trim()) {
            newErrors.name = 'Название обязательно';
        }

        if (formData.inn && (!isDigits(formData.inn) || formData.inn.length !== 14)) {
            newErrors.inn = 'ИНН должен содержать 14 цифр';
        }

        if (formData.kpp && (!isDigits(formData.kpp) || formData.kpp.length !== 9)) {
            newErrors.kpp = 'КПП должен содержать 9 цифр';
        }

        if (formData.ogrn && (!isDigits(formData.ogrn) || formData.ogrn.length !== 13)) {
            newErrors.ogrn = 'ОГРН должен содержать 13 цифр';
        }

        if (!formData.address?.trim()) {
            newErrors.address = 'Адрес обязателен';
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = 'Телефон обязателен';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный email';
        }

        if (!formData.contact_person?.trim()) {
            newErrors.contact_person = 'Контактное лицо обязательно';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /*Submit*/
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const payload: SupplierFormData = {
            ...formData,
            inn: formData.inn!,
            kpp: formData.kpp!,
            ogrn: formData.ogrn!,
            address: formData.address!,
            phone: formData.phone!,
            email: formData.email!,
            contact_person: formData.contact_person!,
        };

        await onSubmit(payload);
    };

    /*Изменение полей*/
    const handleChange = <K extends keyof SupplierForm>(field: K, value: SupplierForm[K]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field as string]) {
            setErrors((prev) => {
                const { [field as string]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Основная информация
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {/* Название */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Название организации <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.name ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="Введите название поставщика"
                            disabled={loading}
                        />

                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    {/* ИНН */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            ИНН
                        </label>

                        <input
                            type="text"
                            value={formData.inn}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                handleChange('inn', value);
                            }}
                            maxLength={14}
                            inputMode="numeric"
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.inn ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="12345678901234"
                            disabled={loading}
                        />

                        {errors.inn && <p className="mt-1 text-xs text-red-600">{errors.inn}</p>}
                    </div>

                    {/* КПП */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            КПП
                        </label>

                        <input
                            type="text"
                            value={formData.kpp ?? ''}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                handleChange('kpp', value);
                            }}
                            maxLength={9}
                            inputMode="numeric"
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.kpp ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="770101001"
                            disabled={loading}
                        />

                        {errors.kpp && <p className="mt-1 text-xs text-red-600">{errors.kpp}</p>}
                    </div>

                    {/* ОГРН */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            ОГРН
                        </label>

                        <input
                            type="text"
                            value={formData.ogrn ?? ''}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                handleChange('ogrn', value);
                            }}
                            maxLength={13}
                            inputMode="numeric"
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.ogrn ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="1027700132195"
                            disabled={loading}
                        />

                        {errors.ogrn && <p className="mt-1 text-xs text-red-600">{errors.ogrn}</p>}
                    </div>

                    {/* Адрес */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Адрес <span className="text-red-500">*</span>
                        </label>

                        <textarea
                            value={formData.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            rows={2}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.address ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400 resize-none
                            `}
                            placeholder="Введите адрес поставщика"
                            disabled={loading}
                        />

                        {errors.address && (
                            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                        )}
                    </div>

                    {/* Контактное лицо */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Контактное лицо <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            value={formData.contact_person || ''}
                            onChange={(e) => handleChange('contact_person', e.target.value)}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.contact_person ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="Введите контактное лицо"
                            disabled={loading}
                        />

                        {errors.contact_person && (
                            <p className="mt-1 text-xs text-red-600">{errors.contact_person}</p>
                        )}
                    </div>

                    {/* Телефон */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Телефон
                        </label>

                        <input
                            type="tel"
                            value={formData.phone ?? ''}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^\d]/g, '');
                                handleChange('phone', value);
                            }}
                            maxLength={16}
                            inputMode="tel"
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.phone ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="996700123456"
                            disabled={loading}
                        />

                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email
                        </label>

                        <input
                            type="email"
                            value={formData.email ?? ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.email ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="info@company.com"
                            disabled={loading}
                        />

                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="
                        flex-1 flex items-center justify-center gap-2
                        px-4 py-2.5
                        text-sm font-medium text-white
                        bg-sky-600
                        hover:bg-sky-700
                        rounded-lg
                        transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-2
                    "
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {supplier ? 'Сохранить изменения' : 'Создать поставщика'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="
                        flex-1
                        px-4 py-2.5
                        text-sm font-medium text-gray-700
                        bg-white
                        border border-gray-300
                        hover:bg-gray-50
                        rounded-lg
                        transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}
