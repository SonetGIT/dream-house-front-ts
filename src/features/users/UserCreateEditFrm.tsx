import { Controller, useForm } from 'react-hook-form';
import { BiHide } from 'react-icons/bi';
import { BiShow } from 'react-icons/bi';
import { useState } from 'react';

import type { Users } from './userSlice';
import type { EnumItem } from '../reference/referenceService';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { CiEdit } from 'react-icons/ci';
import { RiUserAddLine } from 'react-icons/ri';

interface CreateUserForm {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    phone: string;
    role_id: number | '';
    password: string;
}

interface EditUserForm {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    phone: string;
    role_id: number | '';
}

interface PropsType {
    user?: Users;
    userRoles: EnumItem[];
    onSubmit: (data: Partial<Users>) => void;
    onCancel: () => void;
}

/***********************************************************************************************************************************/
export default function UserCreateEditFrm(props: PropsType) {
    const isEdit = Boolean(props.user);
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateUserForm | EditUserForm>({
        defaultValues: {
            username: props.user?.username || '',
            email: props.user?.email || '',
            first_name: props.user?.first_name || '',
            last_name: props.user?.last_name || '',
            middle_name: props.user?.middle_name || '',
            phone: props.user?.phone || '',
            role_id: props.user?.role_id || '',
            ...(isEdit ? {} : { password: '' }),
        } as any,
    });

    const handleUpdate = (data: any) => {
        const formData: Partial<Users> = {
            ...data,
            role_id: data.role_id ? Number(data.role_id) : undefined,
        };

        if (isEdit) delete formData.password;

        props.onSubmit(formData);
    };

    const fieldLabels: Record<string, string> = {
        username: 'Логин',
        email: 'Email',
        last_name: 'Фамилия',
        first_name: 'Имя',
        middle_name: 'Отчество',
        phone: 'Телефон',
    };

    const textFields = [
        'username',
        'email',
        'last_name',
        'first_name',
        'middle_name',
        'phone',
    ] as const;

    /*UI*******************************************************************************************************************************/
    return (
        <div className="form-centered-wrapper">
            <div className="creation-form">
                {/* Шапка */}
                <div className="form-header">
                    <h3 className="form-title">
                        {isEdit ? (
                            <>
                                <CiEdit className="icon-sm icon-gap" />
                                Редактирование пользователя
                            </>
                        ) : (
                            <>
                                {' '}
                                <RiUserAddLine className="icon-sm icon-gap" /> Создание пользователя
                            </>
                        )}
                    </h3>
                </div>

                {/* Тело */}
                <div className="form-body">
                    <form onSubmit={handleSubmit(handleUpdate)} autoComplete="off">
                        {/* Text fields: username, email, fullname и т.д. */}
                        {textFields.map((key) => (
                            <div className="form-group" key={key}>
                                <label className="form-label">
                                    {fieldLabels[key]}
                                    {(key === 'username' || key === 'email') && (
                                        <span style={{ color: 'var(--danger)' }}>*</span>
                                    )}
                                </label>

                                <Controller
                                    name={key}
                                    control={control}
                                    rules={
                                        key === 'username' || key === 'email'
                                            ? { required: 'Обязательное поле' }
                                            : undefined
                                    }
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type={key === 'email' ? 'email' : 'text'}
                                            autoComplete="off"
                                            className={`form-control ${
                                                errors[key] ? 'is-invalid' : ''
                                            }`}
                                        />
                                    )}
                                />

                                {errors[key] && (
                                    <span className="form-feedback invalid">
                                        {(errors as any)[key]?.message}
                                    </span>
                                )}
                            </div>
                        ))}

                        {/* Пароль — только при создании */}
                        {!isEdit && (
                            <div className="form-group">
                                <label className="form-label">
                                    Пароль <span style={{ color: 'var(--danger)' }}>*</span>
                                </label>

                                <div style={{ position: 'relative' }}>
                                    <Controller
                                        name="password"
                                        control={control}
                                        rules={{ required: 'Введите пароль' }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                className={`form-control ${
                                                    'password' in errors ? 'is-invalid' : ''
                                                }`}
                                            />
                                        )}
                                    />

                                    {/* Кнопка показать/скрыть */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-secondary)',
                                            fontSize: '16px',
                                        }}
                                        aria-label={
                                            showPassword ? 'Скрыть пароль' : 'Показать пароль'
                                        }
                                    >
                                        {showPassword ? <BiShow /> : <BiHide />}
                                    </button>
                                </div>

                                {'password' in errors && (
                                    <span className="form-feedback invalid">
                                        {(errors as any).password?.message}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Роль */}
                        <div className="form-group">
                            <label className="form-label">
                                Роль <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>

                            <Controller
                                name="role_id"
                                control={control}
                                rules={{ required: 'Выберите роль' }}
                                render={({ field }) => (
                                    <ReferenceSelect
                                        label=""
                                        value={field.value}
                                        onChange={(val) => field.onChange(val)}
                                        options={props.userRoles || []}
                                        // Можно добавить стилизацию ReferenceSelect под вашу тему:
                                        // Например, className="form-control"
                                    />
                                )}
                            />

                            {errors.role_id && (
                                <span className="form-feedback invalid">
                                    {(errors.role_id as any)?.message}
                                </span>
                            )}
                        </div>

                        {/* Кнопки */}
                        <div className="form-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={props.onCancel}
                            >
                                Отмена
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {isEdit ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
