import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { MaterialRequest } from './materialRequestsSlice';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { TextField, Box, Button, Paper, Typography, Divider } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { EnumItem } from '@/features/reference/referenceService';
import { RiAddLine } from 'react-icons/ri';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

// Типы (без изменений)
export interface MaterialRequestItemForm {
    id?: number;
    material_type: number | '';
    material_id: number | '';
    unit_of_measure: number | '';
    quantity: number;
    comment: string;
}

export interface MaterialRequestCreatePayload {
    project_id: number;
    status: number;
    items: MaterialRequestItemForm[];
}

interface Props {
    request?: MaterialRequest;
    projectId?: number;
    statusId: number;
    getRefName: {
        materialTypes?: EnumItem[];
        materials?: EnumItem[];
        unitTypes?: EnumItem[];
    };
    onSubmit: (data: MaterialRequestCreatePayload) => void;
    onCancel: () => void;
}

/*****************************************************************************************************************************/
export default function MaterialReqCreateEditForm(props: Props) {
    const isEdit = Boolean(props.request);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { isSubmitting },
    } = useForm<MaterialRequestCreatePayload>({
        defaultValues: {
            project_id: props.projectId,
            status: props.statusId,
            items: props.request?.items?.map((i) => ({
                id: i.id,
                material_type: i.material_type ?? '',
                material_id: i.material_id ?? '',
                unit_of_measure: i.unit_of_measure ?? '',
                quantity: i.quantity ?? 1,
                comment: i.comment ?? '',
            })) ?? [
                {
                    material_type: '',
                    material_id: '',
                    unit_of_measure: '',
                    quantity: 1,
                    comment: '',
                },
            ],
        },
        mode: 'onChange',
        shouldUnregister: false,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const items = useWatch({ control, name: 'items' });

    const handleAddItem = () => {
        append({
            material_type: '',
            material_id: '',
            unit_of_measure: '',
            quantity: 1,
            comment: '',
        });
    };

    return (
        <Paper
            sx={{
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: 'background.default',
                    p: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="h6" fontWeight={600} color="text.primary">
                    {isEdit ? 'Редактирование заявки' : 'Создание заявки на материалы'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Заполните информацию о материалах для заявки
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(props.onSubmit)} noValidate>
                <Box sx={{ p: 3 }}>
                    {/* Таблица материалов */}
                    <Box
                        sx={{
                            overflowX: 'auto',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            mb: 3,
                        }}
                    >
                        <table style={{ width: '100%', minWidth: 800 }}>
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: '#f8fafc',
                                        borderBottom: '1px solid #e2e8f0',
                                    }}
                                >
                                    <th
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            color: '#475569',
                                        }}
                                    >
                                        Тип
                                    </th>
                                    <th
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            color: '#475569',
                                        }}
                                    >
                                        Материал
                                    </th>
                                    <th
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            color: '#475569',
                                        }}
                                    >
                                        Ед. изм.
                                    </th>
                                    <th
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'right',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            color: '#475569',
                                        }}
                                    >
                                        Кол-во
                                    </th>
                                    <th
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            color: '#475569',
                                        }}
                                    >
                                        Примечание
                                    </th>
                                    <th
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            color: '#475569',
                                        }}
                                    ></th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr
                                        key={field.id}
                                        style={{
                                            borderBottom:
                                                index === fields.length - 1
                                                    ? 'none'
                                                    : '1px solid #f1f5f9',
                                            transition: 'background-color 0.2s',
                                        }}
                                    >
                                        {/* Тип материала */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <Controller
                                                name={`items.${index}.material_type`}
                                                control={control}
                                                rules={{ required: 'Обязательно' }}
                                                render={({
                                                    field: { onChange, value },
                                                    fieldState,
                                                }) => (
                                                    <ReferenceSelect
                                                        label=""
                                                        placeholder="Выберите тип"
                                                        value={value}
                                                        onChange={(v) => {
                                                            onChange(v);
                                                            setValue(
                                                                `items.${index}.material_id`,
                                                                '',
                                                            );
                                                            setValue(
                                                                `items.${index}.unit_of_measure`,
                                                                '',
                                                            );
                                                        }}
                                                        options={
                                                            props.getRefName.materialTypes || []
                                                        }
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        // size="small"
                                                        // sx={{
                                                        //     width: '100%',
                                                        //     '& .MuiOutlinedInput-root': {
                                                        //         borderRadius: '8px',
                                                        //         fontSize: '0.875rem',
                                                        //         height: '36px',
                                                        //     }
                                                        // }}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Материал */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <Controller
                                                name={`items.${index}.material_id`}
                                                control={control}
                                                rules={{
                                                    required: items[index]?.material_type
                                                        ? 'Выберите материал'
                                                        : false,
                                                }}
                                                render={({ field, fieldState }) => {
                                                    const selectedType =
                                                        items[index]?.material_type;
                                                    const materials =
                                                        selectedType && props.getRefName.materials
                                                            ? props.getRefName.materials.filter(
                                                                  (m) =>
                                                                      Number(m.type) ===
                                                                      Number(selectedType),
                                                              )
                                                            : [];

                                                    return (
                                                        <ReferenceSelect
                                                            label=""
                                                            placeholder={
                                                                selectedType
                                                                    ? 'Выберите материал'
                                                                    : 'Сначала тип'
                                                            }
                                                            value={field.value}
                                                            onChange={(value) => {
                                                                field.onChange(value);
                                                                const material =
                                                                    props.getRefName.materials?.find(
                                                                        (m) => m.id === value,
                                                                    );
                                                                setValue(
                                                                    `items.${index}.unit_of_measure`,
                                                                    material?.unit_of_measure ?? '',
                                                                    { shouldValidate: true },
                                                                );
                                                            }}
                                                            options={materials}
                                                            disabled={!selectedType}
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            // size="small"
                                                            // sx={{
                                                            //     width: '100%',
                                                            //     '& .MuiOutlinedInput-root': {
                                                            //         borderRadius: '8px',
                                                            //         fontSize: '0.875rem',
                                                            //         height: '36px',
                                                            //     }
                                                            // }}
                                                        />
                                                    );
                                                }}
                                            />
                                        </td>

                                        {/* Единица измерения */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <Controller
                                                name={`items.${index}.unit_of_measure`}
                                                control={control}
                                                rules={{ required: 'Обязательно' }}
                                                render={({ field, fieldState }) => {
                                                    const unitName =
                                                        props.getRefName.unitTypes?.find(
                                                            (u) => u.id === field.value,
                                                        )?.name ?? '';

                                                    return (
                                                        <TextField
                                                            value={unitName}
                                                            inputProps={{ readOnly: true }}
                                                            size="small"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{
                                                                width: '100%',
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.875rem',
                                                                    height: '36px',
                                                                },
                                                            }}
                                                            disabled
                                                        />
                                                    );
                                                }}
                                            />
                                        </td>

                                        {/* Количество */}
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <Controller
                                                name={`items.${index}.quantity`}
                                                control={control}
                                                rules={{
                                                    required: 'Обязательно',
                                                    min: { value: 0.01, message: '> 0' },
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <TextField
                                                        {...field}
                                                        type="number"
                                                        size="small"
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        sx={{
                                                            width: '100px',
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: '8px',
                                                                fontSize: '0.875rem',
                                                                height: '36px',
                                                                textAlign: 'right',
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Примечание */}
                                        <td style={{ padding: '12px 16px' }}>
                                            <Controller
                                                name={`items.${index}.comment`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        size="small"
                                                        placeholder="Необязательно"
                                                        sx={{
                                                            width: '100%',
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: '8px',
                                                                fontSize: '0.875rem',
                                                                height: '36px',
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Удалить */}
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            {fields.length > 1 && (
                                                <StyledTooltip title="Удалить позицию">
                                                    <Button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            minWidth: '36px',
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '8px',
                                                            p: 0,
                                                            '&:hover': {
                                                                bgcolor: 'error.lighter',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </Button>
                                                </StyledTooltip>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>

                    {/* Кнопка добавления */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            startIcon={<RiAddLine />}
                            onClick={handleAddItem}
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 500,
                                color: 'primary.main',
                                borderColor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.lighter',
                                    borderColor: 'primary.dark',
                                },
                            }}
                        >
                            Добавить позицию
                        </Button>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Кнопки действия */}
                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={props.onCancel}
                            disabled={isSubmitting}
                            sx={{
                                px: 2.5,
                                py: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                px: 2.5,
                                py: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                bgcolor: '#2c7ecb',
                                '&:hover': {
                                    bgcolor: '#1f6fb5',
                                },
                                '&:disabled': {
                                    bgcolor: 'action.disabledBackground',
                                },
                            }}
                        >
                            {isSubmitting
                                ? 'Сохранение...'
                                : isEdit
                                  ? 'Сохранить изменения'
                                  : 'Создать заявку'}
                        </Button>
                    </Box>
                </Box>
            </form>
        </Paper>
    );
}
