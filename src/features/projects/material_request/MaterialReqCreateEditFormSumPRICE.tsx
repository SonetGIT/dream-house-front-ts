import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { MaterialRequest } from './materialRequestsSlice';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { TextField, Box, Button, Paper } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { EnumItem } from '@/features/reference/referenceService';

// Типы
export interface MaterialRequestItemForm {
    id?: number;
    material_type: number | '';
    material_id: number | '';
    unit_of_measure: number | '';
    quantity: number;
    // price: number;
    // summ: number;
    comment: string | null;
}

export interface MaterialRequestCreatePayload {
    project_id: number;
    status: number;
    items: MaterialRequestItemForm[];
}

interface Props {
    request?: MaterialRequest;
    projectId?: number; // явно передаём при создании
    statusId: number;
    getRefName: {
        materialTypes?: EnumItem[];
        materials?: EnumItem[];
        unitTypes?: EnumItem[];
    };
    onSubmit: (data: MaterialRequestCreatePayload) => void;
    onCancel: () => void;
}

export default function MaterialReqCreateEditForm(props: Props) {
    console.log('Status', props.statusId);
    console.log('project_id ', props.projectId);
    const isEdit = Boolean(props.request);

    // Форма с продвинутыми настройками
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        trigger,
    } = useForm<MaterialRequestCreatePayload>({
        defaultValues: {
            project_id: props.projectId,
            status: props.statusId,
            items: props.request?.items?.map((i) => ({
                id: i.id,
                material_type: i.material_type,
                material_id: i.material_id,
                unit_of_measure: i.unit_of_measure,
                quantity: i.quantity,
                // price: i.price,
                // summ: i.summ,
                comment: i.comment,
            })) ?? [
                {
                    material_type: '',
                    material_id: '',
                    unit_of_measure: '',
                    quantity: 1,
                    // price: 0,
                    // summ: 0,
                    comment: null,
                },
            ],
        },
        mode: 'onChange', // валидация при каждом изменении
        shouldUnregister: false, // сохраняем значения при удалении поля
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'items',
    });

    // Отслеживаем изменения quantity/price для пересчёта summ
    const items = useWatch({ control, name: 'items' });

    // useEffect(() => {
    //     items.forEach((item, index) => {
    //         const summ = (item.quantity || 0) * (item.price || 0);
    //         if (summ !== item.summ) {
    //             setValue(`items.${index}.summ`, summ, { shouldValidate: false });
    //         }
    //     });
    // }, [items, setValue]);

    // Добавление строки
    const handleAddItem = () => {
        append({
            material_type: '',
            material_id: '',
            unit_of_measure: '',
            quantity: 1,
            comment: null,
            // price: 0,
            // summ: 0,
        });
    };

    // const handleUpdate = (data: any) => {
    //     const formData: Partial<MaterialRequestCreatePayload> = {
    //         ...data,
    //         // role_id: data.role_id ? Number(data.role_id) : undefined,
    //     };

    //     // if (isEdit) delete formData.password;

    //     props.onSubmit(formData);
    // };

    // Валидация зависимости: material_id зависит от material_type
    const validateMaterial = (value: number, index: number) => {
        const type = items[index]?.material_type;
        if (type && !value) return 'Выберите материал';
        return true;
    };

    /**************************************************************************************************************************************/
    return (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <div className="detail-form-header">
                <h2>{isEdit ? 'Редактирование заявки' : 'Создание заявки на материалы'}</h2>
            </div>

            <form onSubmit={handleSubmit(props.onSubmit)} noValidate>
                <Box sx={{ p: 3 }}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <table className="table-form" width="100%">
                            <thead>
                                <tr>
                                    <th style={{ width: '15%', textAlign: 'left' }}>Тип</th>
                                    <th style={{ width: '20%', textAlign: 'left' }}>Материал</th>
                                    <th style={{ width: '8%', textAlign: 'left' }}>Ед.</th>
                                    <th style={{ width: '8%', textAlign: 'right' }}>Кол-во</th>
                                    {/* <th style={{ width: '8%', textAlign: 'right' }}>Цена</th>
                                    <th style={{ width: '10%', textAlign: 'right' }}>Сумма</th> */}
                                    <th style={{ width: '20%', textAlign: 'left' }}>Примечание</th>
                                    <th style={{ width: '5%', textAlign: 'center' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr key={field.id}>
                                        {/* Тип материала */}
                                        <td>
                                            <Controller
                                                name={`items.${index}.material_type`}
                                                control={control}
                                                rules={{ required: 'Обязательно' }}
                                                render={({ field: { onChange, value } }) => (
                                                    <ReferenceSelect
                                                        label=""
                                                        value={value}
                                                        onChange={(v) => {
                                                            onChange(v);
                                                            // Сбрасываем материал при смене типа
                                                            setValue(
                                                                `items.${index}.material_id`,
                                                                ''
                                                            );
                                                        }}
                                                        options={
                                                            props.getRefName.materialTypes || []
                                                        }
                                                        // error={!!fieldState.error}
                                                        // helperText={fieldState.error?.message}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Материал */}
                                        <Controller
                                            name={`items.${index}.material_id`}
                                            control={control}
                                            rules={{
                                                required: items[index]?.material_type
                                                    ? 'Выберите материал'
                                                    : false,
                                            }}
                                            render={({ field }) => {
                                                const selectedType = items[index]?.material_type;
                                                /*const materials = selectedType
                                                    ? props.getRefName.materials?.filter(
                                                          (m) => m.type === selectedType
                                                      )
                                                    : [];
                                                console.log('selectedType', selectedType);
                                                console.log('materials', materials);*/

                                                // const selectedType = Number(
                                                //     items[index]?.material_type
                                                // );

                                                const materials = selectedType
                                                    ? props.getRefName.materials?.filter(
                                                          (m) => Number(m.type) === selectedType
                                                      )
                                                    : [];

                                                return (
                                                    <ReferenceSelect
                                                        label=""
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        options={materials || []}
                                                        disabled={!selectedType}
                                                    />
                                                );
                                            }}
                                        />

                                        {/* Единица измерения */}
                                        <td>
                                            <Controller
                                                name={`items.${index}.unit_of_measure`}
                                                control={control}
                                                rules={{ required: 'Обязательно' }}
                                                render={({ field, fieldState }) => (
                                                    <ReferenceSelect
                                                        label=""
                                                        {...field}
                                                        options={props.getRefName.unitTypes || []}
                                                        // error={!!fieldState.error}
                                                        // helperText={fieldState.error?.message}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Количество */}
                                        <td align="right">
                                            <Controller
                                                name={`items.${index}.quantity`}
                                                control={control}
                                                rules={{
                                                    required: 'Обязательно',
                                                    min: {
                                                        value: 1,
                                                        message:
                                                            'Минимальное значение должно быть > 1',
                                                    },
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <TextField
                                                        {...field}
                                                        // type="number"
                                                        size="small"
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        inputProps={{
                                                            step: 0.01,
                                                            min: 0.01,
                                                            style: {
                                                                textAlign: 'right',
                                                                width: '80px',
                                                            },
                                                        }}
                                                        sx={{
                                                            '& .MuiInputBase-input': {
                                                                p: '6px 8px',
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Цена */}
                                        {/* <td align="right">
                                            <Controller
                                                name={`items.${index}.price`}
                                                control={control}
                                                rules={{
                                                    required: 'Обязательно',
                                                    min: {
                                                        value: 0.01,
                                                        message: 'Цена должна быть > 0',
                                                    },
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <TextField
                                                        {...field}
                                                        // type="number"
                                                        size="small"
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        inputProps={{
                                                            step: 0.01,
                                                            min: 0.01,
                                                            style: {
                                                                textAlign: 'right',
                                                                width: '80px',
                                                            },
                                                        }}
                                                        sx={{
                                                            '& .MuiInputBase-input': {
                                                                p: '6px 8px',
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </td> */}

                                        {/* Сумма */}
                                        {/* <td align="right">
                                            <Typography
                                                sx={{
                                                    fontWeight: 500,
                                                    color:
                                                        items[index]?.summ > 0
                                                            ? '#0d9488'
                                                            : 'text.secondary',
                                                }}
                                            >
                                                {items[index]?.summ?.toLocaleString('ru-RU', {
                                                    minimumFractionDigits: 2,
                                                }) || '0,00'}
                                            </Typography>
                                        </td> */}

                                        {/* Комментарий */}
                                        <td>
                                            <Controller
                                                name={`items.${index}.comment`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        size="small"
                                                        placeholder="Необязательно"
                                                        sx={{ width: '100%' }}
                                                        inputProps={{
                                                            style: { fontSize: '0.875rem' },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Удалить */}
                                        <td align="center">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    size="small"
                                                    sx={{
                                                        minWidth: '32px',
                                                        p: '4px',
                                                        color: 'error.main',
                                                        '&:hover': { bgcolor: 'error.lighter' },
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>

                    <Button
                        type="button"
                        startIcon={<AddIcon />}
                        onClick={handleAddItem}
                        variant="outlined"
                        sx={{
                            mt: 2,
                            textTransform: 'none',
                            borderColor: '#476dcc',
                            color: '#476dcc',
                            '&:hover': {
                                bgcolor: 'rgba(71, 109, 204, 0.04)',
                                borderColor: '#5580b5',
                            },
                        }}
                    >
                        Добавить позицию
                    </Button>

                    {/* Кнопки */}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 3, justifyContent: 'flex-end' }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={props.onCancel}
                            disabled={isSubmitting}
                            sx={{ textTransform: 'none', px: 3 }}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                bgcolor: '#476dcc',
                                '&:hover': { bgcolor: '#5580b5' },
                                textTransform: 'none',
                                px: 3,
                            }}
                        >
                            {isSubmitting
                                ? 'Сохранение...'
                                : isEdit
                                ? 'Сохранить'
                                : 'Создать заявку'}
                        </Button>
                    </Box>
                </Box>
            </form>
        </Paper>
    );
}
