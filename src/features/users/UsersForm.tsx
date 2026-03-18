import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { UserForm, UserFormData } from './userSlice';
import { formatPhoneInput, toStoragePhone } from '@/utils/formatPhoneNumber';

interface UserFormProps {
    user?: UserFormData | null;
    refs: Record<string, ReferenceResult>;
    onSubmit: (data: UserFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

/**Создание начального состояния формы*/
function getInitialFormData(user?: UserFormData | null): UserForm {
    return {
        username: user?.username ?? '',
        email: user?.email ?? '',
        password: '', // Всегда пустой - только для создания

        first_name: user?.first_name ?? '',
        last_name: user?.last_name ?? '',
        middle_name: user?.middle_name ?? null,

        phone: user?.phone ?? null,

        role_id: user?.role_id ?? 0, // или null если у тебя select допускает

        supplier_id: user?.supplier_id ?? null,
        contractor_id: user?.contractor_id ?? null,

        required_action: user?.required_action ?? null,
    };
}

/******************************************************************************************************/
export default function UsersForm({
    user,
    refs,
    onSubmit,
    onCancel,
    loading = false,
}: UserFormProps) {
    const SUPPLIER_ROLE_ID = 13; //Поставщик
    const CONTRACTOR_ROLE_ID = 8; //Подрядчик
    const [formData, setFormData] = useState<UserForm>(() => getInitialFormData(user));
    const [errors, setErrors] = useState<Record<string, string>>({});

    /*Обновление формы при редактировании*/
    useEffect(() => {
        setFormData(getInitialFormData(user));
    }, [user]);

    /*Валидация*/
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Логин обязателен';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Некорректный email';
        }

        // Пароль обязателен только при создании
        if (!user) {
            if (!formData.password.trim()) {
                newErrors.password = 'Пароль обязателен';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Пароль должен быть не менее 6 символов';
            }
        }

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'Имя обязательно';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Фамилия обязательна';
        }

        if (!formData.role_id) {
            newErrors.role_id = 'Выберите роль';
        }

        // 👇 логика контрагентов
        if (formData.role_id === SUPPLIER_ROLE_ID && !formData.supplier_id) {
            newErrors.supplier_id = 'Выберите поставщика';
        }

        if (formData.role_id === CONTRACTOR_ROLE_ID && !formData.contractor_id) {
            newErrors.contractor_id = 'Выберите подрядчика';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /*Submit*/
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const payload: any = {
            username: formData.username.trim(),
            email: formData.email.trim(),

            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            middle_name: formData.middle_name?.trim() || null,

            phone: formData.phone?.trim() || null,

            role_id: formData.role_id!,

            //ключевая логика
            supplier_id: formData.role_id === SUPPLIER_ROLE_ID ? formData.supplier_id : null,

            contractor_id: formData.role_id === CONTRACTOR_ROLE_ID ? formData.contractor_id : null,

            required_action: formData.required_action ?? null,
        };
        console.log('PAYLOAD', payload);
        // Пароль отправляем только при создании
        if (!user) {
            payload.password = formData.password.trim();
        }

        await onSubmit(payload);
    };

    /*Изменение полей*/
    const handleChange = <K extends keyof UserForm>(field: K, value: UserForm[K]) => {
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

    // Форматирование телефона +996 XXX XXX XXX
    const handlePhoneChange = (value: string) => {
        const storageValue = toStoragePhone(value);
        handleChange('phone', storageValue);
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
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Логин <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            className={`w-full px-3 py-2 text-sm bg-white border ${
                                errors.username ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg focus:ring-1 focus:ring-sky-500`}
                            disabled={loading}
                        />
                        {errors.username && (
                            <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={`w-full px-3 py-2 text-sm bg-white border ${
                                errors.email ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg focus:ring-1 focus:ring-sky-500`}
                            disabled={loading}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Пароль - только при создании */}
                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Пароль <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className={`w-full px-3 py-2 text-sm bg-white border ${
                                    errors.password ? 'border-red-300' : 'border-gray-300'
                                } rounded-lg focus:ring-1 focus:ring-sky-500`}
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                            )}
                        </div>
                    )}

                    {/* Имя */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Имя <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                            className={`w-full px-3 py-2 text-sm bg-white border ${
                                errors.first_name ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg`}
                            disabled={loading}
                        />
                    </div>

                    {/* Фамилия */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Фамилия <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            className={`w-full px-3 py-2 text-sm bg-white border ${
                                errors.last_name ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg`}
                            disabled={loading}
                        />
                    </div>

                    {/* Отчество */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Отчество
                        </label>
                        <input
                            type="text"
                            value={formData.middle_name || ''}
                            onChange={(e) => handleChange('middle_name', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg"
                            disabled={loading}
                        />
                    </div>

                    {/* Телефон */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Телефон
                        </label>
                        <input
                            type="text"
                            value={formatPhoneInput(formData.phone)}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg"
                            disabled={loading}
                        />
                    </div>

                    {/* Роль */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Роль <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.role_id || ''}
                            onChange={(e) =>
                                handleChange(
                                    'role_id',
                                    e.target.value ? Number(e.target.value) : null,
                                )
                            }
                            className={`w-full px-3 py-2 text-sm bg-white border ${
                                errors.role_id ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg`}
                            disabled={loading}
                        >
                            <option value="">Выберите роль</option>
                            {refs.userRoles.data?.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Поставщик */}
                    {formData.role_id === SUPPLIER_ROLE_ID && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Поставщик <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.supplier_id || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'supplier_id',
                                        e.target.value ? Number(e.target.value) : null,
                                    )
                                }
                                className={`w-full px-3 py-2 text-sm bg-white border ${
                                    errors.supplier_id ? 'border-red-300' : 'border-gray-300'
                                } rounded-lg`}
                            >
                                <option value="">Выберите поставщика</option>
                                {refs.suppliers.data?.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Подрядчик */}
                    {formData.role_id === CONTRACTOR_ROLE_ID && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Подрядчик <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.contractor_id || ''}
                                onChange={(e) =>
                                    handleChange(
                                        'contractor_id',
                                        e.target.value ? Number(e.target.value) : null,
                                    )
                                }
                                className={`w-full px-3 py-2 text-sm bg-white border ${
                                    errors.contractor_id ? 'border-red-300' : 'border-gray-300'
                                } rounded-lg`}
                            >
                                <option value="">Выберите подрядчика</option>
                                {refs.contractors.data?.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 text-sm text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {user ? 'Сохранить изменения' : 'Создать пользователя'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}
