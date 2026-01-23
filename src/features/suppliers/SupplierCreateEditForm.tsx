import { Controller, useForm } from 'react-hook-form';
import { RiUserAddLine } from 'react-icons/ri';
import { CiEdit } from 'react-icons/ci';

export interface Supplier {
    id: number;
    name: string;
    inn: string;
    kpp: string | null;
    ogrn: string | null;
    address: string;
    phone: string;
    email: string;
    contact_person: string | null;
    // rating: number | null;
}

export interface SupplierFormValues {
    name: string;
    inn: string;
    kpp?: string;
    ogrn?: string;
    address: string;
    phone: string;
    email: string;
    contact_person?: string;
    // rating?: number;
}

interface PropsType {
    supplier?: Supplier; // если есть — edit, если нет — create
    onSubmit: (data: Partial<SupplierFormValues>) => void;
    onCancel: () => void;
}

/*********************************************************************************************************************/
export default function SupplierCreateEditForm({ supplier, onSubmit, onCancel }: PropsType) {
    const isEdit = Boolean(supplier);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<SupplierFormValues>({
        defaultValues: {
            name: supplier?.name ?? '',
            inn: supplier?.inn ?? '',
            kpp: supplier?.kpp ?? '',
            ogrn: supplier?.ogrn ?? '',
            address: supplier?.address ?? '',
            phone: supplier?.phone ?? '',
            email: supplier?.email ?? '',
            contact_person: supplier?.contact_person ?? '',
            // rating: supplier?.rating ?? undefined,
        },
    });

    const fieldLabels: Record<keyof SupplierFormValues, string> = {
        name: 'Поставщик',
        inn: 'ИНН',
        kpp: 'КПП',
        ogrn: 'ОГРН',
        address: 'Адрес',
        phone: 'Телефон',
        email: 'Email',
        contact_person: 'Контактное лицо',
        // rating: 'Рейтинг',
    };

    const textFields: (keyof SupplierFormValues)[] = [
        'name',
        'inn',
        'kpp',
        'ogrn',
        'address',
        'phone',
        'email',
        'contact_person',
    ];

    const getRules = (key: string) => {
        switch (key) {
            case 'name':
                return { required: 'Обязательное поле' };

            case 'inn':
                return {
                    required: 'Обязательное поле',
                    minLength: { value: 14, message: 'ПИН должен состоять из 14 цифр' },
                    maxLength: { value: 14, message: 'ПИН должен состоять из 14 цифр' },
                    pattern: { value: /^\d+$/, message: 'ПИН должен содержать только цифры' },
                };

            case 'email':
                return {
                    required: 'Обязательное поле',
                    pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Некорректный email',
                    },
                };

            default:
                return undefined;
        }
    };

    /*****************************************************************************************************************/
    return (
        <div className="form-centered-wrapper">
            <div className="creation-form">
                {/* Header */}
                <div className="form-header">
                    <h3 className="form-title">
                        {isEdit ? (
                            <>
                                <CiEdit className="icon-sm icon-gap" />
                                Редактирование поставщика
                            </>
                        ) : (
                            <>
                                <RiUserAddLine className="icon-sm icon-gap" />
                                Создание поставщика
                            </>
                        )}
                    </h3>
                </div>

                {/* Body */}
                <div className="form-body">
                    {/* <form onSubmit={handleSubmit(onSubmit)} autoComplete="off"> */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Text fields */}
                        {textFields.map((key) => (
                            <div className="form-group" key={key}>
                                <label className="form-label">
                                    {fieldLabels[key]}
                                    {(key === 'name' || key === 'inn') && (
                                        <span style={{ color: 'var(--danger)' }}>*</span>
                                    )}
                                </label>

                                <Controller
                                    name={key}
                                    control={control}
                                    rules={getRules(key)}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type={key === 'email' ? 'email' : 'text'}
                                            maxLength={key === 'inn' ? 14 : undefined}
                                            className={`form-control ${
                                                errors[key] ? 'is-invalid' : ''
                                            }`}
                                        />
                                    )}
                                />

                                {errors[key] && (
                                    <span className="form-feedback invalid">
                                        {errors[key]?.message}
                                    </span>
                                )}
                            </div>
                        ))}

                        {/* Rating */}
                        {/* <div className="form-group">
                            <label className="form-label">{fieldLabels.rating}</label>
                            <Controller
                                name="rating"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        className="form-control"
                                    />
                                )}
                            />
                        </div> */}

                        {/* Footer */}
                        <div className="form-footer">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
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
