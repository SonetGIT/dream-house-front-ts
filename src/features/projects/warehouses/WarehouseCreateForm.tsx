import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { WarehouseForm, WarehouseFormData } from './warehousesSlice';
import { formatPhoneInput, toStoragePhone } from '@/utils/formatPhoneNumber';

interface WarehouseFormProps {
    warehouse?: WarehouseFormData | null;
    refs: Record<string, ReferenceResult>;
    onSubmit: (data: WarehouseFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

/**Создание начального состояния формы*/
function getInitialFormData(warehouse?: WarehouseFormData | null): WarehouseForm {
    return {
        name: warehouse?.name ?? '',
        code: warehouse?.code ?? '',
        address: warehouse?.address ?? '',
        manager_id: warehouse?.manager_id ?? null,
        phone: warehouse?.phone ?? null,
    };
}

/******************************************************************************************************/
export function WarehouseCreateForm({
    warehouse,
    refs,
    onSubmit,
    onCancel,
    isLoading = false,
}: WarehouseFormProps) {
    const [formData, setFormData] = useState<WarehouseForm>(() => getInitialFormData(warehouse));
    const [errors, setErrors] = useState<Record<string, string>>({});

    /*Обновление формы при редактировании*/
    useEffect(() => {
        setFormData(getInitialFormData(warehouse));
    }, [warehouse]);

    /*Валидация*/
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Название обязательно';
        if (!formData.code.trim()) newErrors.code = 'Код обязателен';
        if (!formData.address.trim()) newErrors.address = 'Адрес обязателен';
        if (!formData.manager_id) newErrors.manager_id = 'Выберите кладовщик склада';
        if (!formData.phone?.trim()) {
            newErrors.phone = 'Телефон обязателен';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /*Submit*/
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const payload: WarehouseFormData = {
            ...formData,
            name: formData.name!,
            code: formData.code!,
            address: formData.address!,
            manager_id: formData.manager_id!,
            phone: formData.phone!,
        };

        await onSubmit(payload);
    };

    /*Изменение полей*/
    const handleChange = <K extends keyof WarehouseForm>(field: K, value: WarehouseForm[K]) => {
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

    /*Изменение телефона*/
    const handlePhoneChange = (value: string) => {
        const storage = toStoragePhone(value);
        handleChange('phone', storage);
    };
    /************************************************************************************************************/
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
                            Название склада <span className="text-red-500">*</span>
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
                            placeholder="Введите название склада"
                            disabled={isLoading}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>

                    {/* Код */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Код склада <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.code ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="WH-001"
                            disabled={isLoading}
                        />
                        {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                    </div>

                    {/* Адрес */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Адрес <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            rows={2}
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.address ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400 resize-none
                            `}
                            placeholder="Введите адрес склада"
                            disabled={isLoading}
                        />
                        {errors.address && (
                            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                        )}
                    </div>

                    {/* Кладовщик */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Кладовщик <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.manager_id || ''}
                            onChange={(e) =>
                                handleChange(
                                    'manager_id',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.manager_id ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all cursor-pointer
                            `}
                            disabled={isLoading}
                        >
                            <option value="">Выберите кладовщик склада</option>
                            {refs.users.data?.map((user: any) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                        {errors.manager_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.manager_id}</p>
                        )}
                    </div>

                    {/* Телефон */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Телефон
                        </label>

                        <input
                            type="tel"
                            value={formatPhoneInput(formData.phone)}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            maxLength={16}
                            inputMode="tel"
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-white
                                border ${errors.phone ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent
                                transition-all placeholder:text-gray-400
                            `}
                            placeholder="996700123456"
                            disabled={isLoading}
                        />

                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={isLoading}
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
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {warehouse ? 'Сохранить изменения' : 'Создать склад'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
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
