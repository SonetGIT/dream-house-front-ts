import { useState, useEffect, type ChangeEvent } from 'react';
import { Loader2 } from 'lucide-react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { UserForm, UserFormData, UserSubmitData } from '@/features/users/userSlice';
import { formatPhoneInput, toStoragePhone } from '@/utils/formatPhoneNumber';

interface UserFormProps {
    user?: UserFormData | null;
    refs: Record<string, ReferenceResult>;
    onSubmit: (data: UserSubmitData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

function getInitialFormData(user?: UserFormData | null): UserForm {
    return {
        username: user?.username ?? '',
        email: user?.email ?? '',
        password: '',
        first_name: user?.first_name ?? '',
        last_name: user?.last_name ?? '',
        middle_name: user?.middle_name ?? null,
        phone: user?.phone ?? null,
        role_id: user?.role_id ?? 0,
        supplier_id: user?.supplier_id ?? null,
        contractor_id: user?.contractor_id ?? null,
        required_action: user?.required_action ?? null,
    };
}

const TEXT = {
    mainInfo: '\u041e\u0441\u043d\u043e\u0432\u043d\u0430\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f',
    username: '\u041b\u043e\u0433\u0438\u043d',
    emailRequired: 'Email \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d',
    emailInvalid: '\u041d\u0435\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 email',
    password: '\u041f\u0430\u0440\u043e\u043b\u044c',
    newPassword: '\u041d\u043e\u0432\u044b\u0439 \u043f\u0430\u0440\u043e\u043b\u044c',
    passwordRequired: '\u041f\u0430\u0440\u043e\u043b\u044c \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d',
    passwordMin:
        '\u041f\u0430\u0440\u043e\u043b\u044c \u0434\u043e\u043b\u0436\u0435\u043d \u0431\u044b\u0442\u044c \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 6 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432',
    leavePasswordEmpty:
        '\u041e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u043f\u0443\u0441\u0442\u044b\u043c, \u0435\u0441\u043b\u0438 \u043f\u0435\u0440\u0435\u043d\u0430\u0437\u043d\u0430\u0447\u0430\u0442\u044c \u043f\u0430\u0440\u043e\u043b\u044c \u043d\u0435 \u043d\u0443\u0436\u043d\u043e.',
    firstName: '\u0418\u043c\u044f',
    firstNameRequired: '\u0418\u043c\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e',
    lastName: '\u0424\u0430\u043c\u0438\u043b\u0438\u044f',
    lastNameRequired: '\u0424\u0430\u043c\u0438\u043b\u0438\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u0430',
    middleName: '\u041e\u0442\u0447\u0435\u0441\u0442\u0432\u043e',
    phone: '\u0422\u0435\u043b\u0435\u0444\u043e\u043d',
    role: '\u0420\u043e\u043b\u044c',
    chooseRole: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u043e\u043b\u044c',
    roleRequired: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u043e\u043b\u044c',
    supplier: '\u041f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a',
    chooseSupplier: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430',
    supplierRequired: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430',
    contractor: '\u041f\u043e\u0434\u0440\u044f\u0434\u0447\u0438\u043a',
    chooseContractor: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u0434\u0440\u044f\u0434\u0447\u0438\u043a\u0430',
    contractorRequired: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u0434\u0440\u044f\u0434\u0447\u0438\u043a\u0430',
    requirePasswordReset:
        '\u0417\u0430\u043f\u0440\u043e\u0441\u0438\u0442\u044c \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u0443\u044e \u0441\u043c\u0435\u043d\u0443 \u043f\u0430\u0440\u043e\u043b\u044f \u043f\u0440\u0438 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u043c \u0432\u0445\u043e\u0434\u0435',
    save: '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f',
    create: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f',
    cancel: '\u041e\u0442\u043c\u0435\u043d\u0430',
    usernameRequired: '\u041b\u043e\u0433\u0438\u043d \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d',
};

export default function UsersFormMobileReset({
    user,
    refs,
    onSubmit,
    onCancel,
    loading = false,
}: UserFormProps) {
    const SUPPLIER_ROLE_ID = 13;
    const CONTRACTOR_ROLE_ID = 8;
    const [formData, setFormData] = useState<UserForm>(() => getInitialFormData(user));
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setFormData(getInitialFormData(user));
    }, [user]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = TEXT.usernameRequired;
        }

        if (!formData.email.trim()) {
            newErrors.email = TEXT.emailRequired;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = TEXT.emailInvalid;
        }

        if (!user) {
            if (!formData.password.trim()) {
                newErrors.password = TEXT.passwordRequired;
            } else if (formData.password.trim().length < 6) {
                newErrors.password = TEXT.passwordMin;
            }
        } else if (formData.password.trim() && formData.password.trim().length < 6) {
            newErrors.password = TEXT.passwordMin;
        }

        if (!formData.first_name.trim()) {
            newErrors.first_name = TEXT.firstNameRequired;
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = TEXT.lastNameRequired;
        }

        if (!formData.role_id) {
            newErrors.role_id = TEXT.roleRequired;
        }

        if (formData.role_id === SUPPLIER_ROLE_ID && !formData.supplier_id) {
            newErrors.supplier_id = TEXT.supplierRequired;
        }

        if (formData.role_id === CONTRACTOR_ROLE_ID && !formData.contractor_id) {
            newErrors.contractor_id = TEXT.contractorRequired;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const payload: UserSubmitData = {
            username: formData.username.trim(),
            email: formData.email.trim(),
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            middle_name: formData.middle_name?.trim() || null,
            phone: formData.phone?.trim() || null,
            role_id: formData.role_id!,
            supplier_id: formData.role_id === SUPPLIER_ROLE_ID ? formData.supplier_id : null,
            contractor_id: formData.role_id === CONTRACTOR_ROLE_ID ? formData.contractor_id : null,
            required_action: formData.required_action ?? null,
        };

        const trimmedPassword = formData.password.trim();
        if (trimmedPassword) {
            payload.password = trimmedPassword;
        }

        await onSubmit(payload);
    };

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

    const handlePhoneChange = (value: string) => {
        const storageValue = toStoragePhone(value);
        handleChange('phone', storageValue);
    };

    const handleResetPasswordRequirementChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleChange('required_action', e.target.checked ? 'RESET_PASSWORD' : null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    {TEXT.mainInfo}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {TEXT.username} <span className="text-red-500">*</span>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {user ? TEXT.newPassword : TEXT.password}{' '}
                            {!user && <span className="text-red-500">*</span>}
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
                        {user && (
                            <p className="mt-1 text-xs text-gray-500">{TEXT.leavePasswordEmpty}</p>
                        )}
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {TEXT.firstName} <span className="text-red-500">*</span>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {TEXT.lastName} <span className="text-red-500">*</span>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {TEXT.middleName}
                        </label>
                        <input
                            type="text"
                            value={formData.middle_name || ''}
                            onChange={(e) => handleChange('middle_name', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {TEXT.phone}
                        </label>
                        <input
                            type="text"
                            value={formatPhoneInput(formData.phone)}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {TEXT.role} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.role_id || ''}
                            onChange={(e) =>
                                handleChange('role_id', e.target.value ? Number(e.target.value) : null)
                            }
                            className={`w-full px-3 py-2 text-sm bg-white border ${
                                errors.role_id ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg`}
                            disabled={loading}
                        >
                            <option value="">{TEXT.chooseRole}</option>
                            {refs.userRoles.data?.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="flex items-start gap-3 px-3 py-3 border border-gray-200 rounded-lg bg-gray-50">
                            <input
                                type="checkbox"
                                checked={formData.required_action === 'RESET_PASSWORD'}
                                onChange={handleResetPasswordRequirementChange}
                                disabled={loading}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                            />
                            <span className="text-sm text-gray-700">
                                {TEXT.requirePasswordReset}
                            </span>
                        </label>
                    </div>

                    {formData.role_id === SUPPLIER_ROLE_ID && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {TEXT.supplier} <span className="text-red-500">*</span>
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
                                <option value="">{TEXT.chooseSupplier}</option>
                                {refs.suppliers.data?.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.role_id === CONTRACTOR_ROLE_ID && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {TEXT.contractor} <span className="text-red-500">*</span>
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
                                <option value="">{TEXT.chooseContractor}</option>
                                {refs.contractors.data?.map((contractor) => (
                                    <option key={contractor.id} value={contractor.id}>
                                        {contractor.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {user ? TEXT.save : TEXT.create}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg"
                >
                    {TEXT.cancel}
                </button>
            </div>
        </form>
    );
}
