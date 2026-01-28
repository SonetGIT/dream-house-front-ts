import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { MaterialRequest } from './materialRequestsSlice';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { TextField, Box, Button, Paper } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { EnumItem } from '@/features/reference/referenceService';
import { RiAddLine } from 'react-icons/ri';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { compactFieldSx, tableCellSx } from '@/styles/ui_style';

// Типы
export interface MaterialRequestItemForm {
    id?: number;
    material_type: number | '';
    material_id: number | '';
    unit_of_measure: number | '';
    quantity: number;
    comment: string; // ← убрали null
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
        <Paper className="form-control">
            <h3>{isEdit ? 'Редактирование заявки' : 'Создание заявки на материалы'}</h3>
            <form onSubmit={handleSubmit(props.onSubmit)} noValidate>
                <Box sx={{ p: 2 }}>
                    <Box>
                        <table>
                            <thead>
                                <tr>
                                    <th>Тип</th>
                                    <th>Материал</th>
                                    <th>Ед. изм.</th>
                                    <th>Кол-во</th>
                                    <th>Примечание</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr key={field.id}>
                                        {/* Тип материала */}
                                        <td style={tableCellSx}>
                                            <Controller
                                                name={`items.${index}.material_type`}
                                                control={control}
                                                rules={{ required: 'Обязательно' }}
                                                render={({ field: { onChange, value } }) => (
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
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Материал */}
                                        <td style={tableCellSx}>
                                            <Controller
                                                name={`items.${index}.material_id`}
                                                control={control}
                                                rules={{
                                                    required: items[index]?.material_type
                                                        ? 'Выберите материал'
                                                        : false,
                                                }}
                                                render={({ field }) => {
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
                                                        />
                                                    );
                                                }}
                                            />
                                        </td>

                                        {/* Единица измерения */}
                                        <td style={tableCellSx}>
                                            <Controller
                                                name={`items.${index}.unit_of_measure`}
                                                control={control}
                                                rules={{ required: 'Обязательно' }}
                                                render={({ field }) => {
                                                    const unitName =
                                                        props.getRefName.unitTypes?.find(
                                                            (u) => u.id === field.value,
                                                        )?.name ?? '';

                                                    return (
                                                        <TextField
                                                            value={unitName}
                                                            inputProps={{
                                                                readOnly: true,
                                                            }}
                                                            sx={compactFieldSx}
                                                            disabled
                                                        />
                                                    );
                                                }}
                                            />
                                        </td>

                                        {/* Количество */}
                                        <td style={tableCellSx} align="right">
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
                                                        error={!!fieldState.error}
                                                        helperText={fieldState.error?.message}
                                                        sx={compactFieldSx}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Примечание */}
                                        <td style={tableCellSx}>
                                            <Controller
                                                name={`items.${index}.comment`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        size="small"
                                                        placeholder="Необязательно"
                                                        sx={compactFieldSx}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Удалить */}
                                        <td style={tableCellSx} align="center">
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    size="small"
                                                    color="error"
                                                    sx={{ minWidth: '32px', p: '4px' }}
                                                >
                                                    <StyledTooltip title="Удалить">
                                                        <DeleteIcon />
                                                    </StyledTooltip>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>

                    <StyledTooltip title="Добавить позицию">
                        <RiAddLine className="icon" onClick={handleAddItem} />
                    </StyledTooltip>

                    {/* Кнопки */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={props.onCancel}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
                        </button>
                    </Box>
                </Box>
            </form>
        </Paper>
    );
}
