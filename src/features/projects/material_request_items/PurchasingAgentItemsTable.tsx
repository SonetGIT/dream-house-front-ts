import { useEffect, useState } from 'react';
import { Paper, Checkbox, Box, Typography, TextField } from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import type { MaterialRequestItems } from '@/features/projects/material_request_items/materialRequestItemsSlice';
import type { EnumItem } from '@/features/reference/referenceService';
import { compactTextFieldSx } from '@/styles/ui_style';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { TablePagination } from '@/components/ui/TablePagination';
import type { Pagination } from '../projectsSlice';

interface PurchasingAgentItemsProps {
    items: MaterialRequestItems[];
    getRefName: {
        materialType: (id: number) => string;
        materialName: (id: number) => string;
        unitName: (id: number) => string;
        statusName: (id: number) => string;
        currency?: EnumItem[];
        suppliers?: EnumItem[];
    };
    pagination: Pagination | null;
    onPrevPage: () => void;
    onNextPage: () => void;
}

interface FormValues {
    items: MaterialRequestItems[];
}

/*****************************************************************************************************************/
export default function PurchasingAgentItemsTable({
    items,
    getRefName,
    pagination,
    onPrevPage,
    onNextPage,
}: PurchasingAgentItemsProps) {
    // Локальные состояния
    const [suppliersId, setSuppliersId] = useState<string | number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { control, reset, setValue } = useForm<FormValues>({
        defaultValues: { items: [] },
    });

    /* Инициализация формы из API */
    useEffect(() => {
        reset({ items });
    }, [items, reset]);

    /* Следим за строками */
    const watchedItems = useWatch({
        control,
        name: 'items',
    });

    /* Автоподсчёт суммы */
    useEffect(() => {
        watchedItems?.forEach((item, idx) => {
            const price = Number(item.price || 0);
            const qty = Number(item.quantity || 0);
            const sum = price * qty;

            if (item.summ !== sum) {
                setValue(`items.${idx}.summ`, sum);
            }
        });
    }, [watchedItems, setValue]);

    // === Логика чекбоксов ===
    const allSelected = watchedItems?.length > 0 && selectedIds.length === watchedItems.length;
    const someSelected = selectedIds.length > 0 && !allSelected;

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            const ids = watchedItems?.map((item) => item.id) || [];
            setSelectedIds(ids);
        }
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    /**********************************************************************************************************************/
    return (
        <Paper className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Статус</th>
                        <th>Тип материала</th>
                        <th>Материал</th>
                        <th>Ед. изм.</th>
                        <th>Кол-во</th>
                        <th>Цена</th>
                        <th>Сумма</th>
                        <th>Валюта</th>
                        <th>Заказано</th>
                        <th>Остаток</th>
                        <th>Комментарий</th>
                        <th>
                            <Checkbox
                                style={{ padding: 0 }}
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={toggleAll}
                            />
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {watchedItems?.map((item, idx) => (
                        <tr key={item.id}>
                            <td>{getRefName.statusName(item.status)}</td>
                            <td>{getRefName.materialType(item.material_type)}</td>
                            <td>{getRefName.materialName(item.material_id)}</td>
                            <td>{getRefName.unitName(item.unit_of_measure)}</td>
                            <td>{item.quantity}</td>

                            {/* Цена */}
                            <td>
                                <Controller
                                    name={`items.${idx}.price`}
                                    control={control}
                                    rules={{
                                        required: 'Обязательно',
                                        min: { value: 111, message: '> 0' },
                                    }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={compactTextFieldSx}
                                        />
                                    )}
                                />
                            </td>

                            {/* Сумма (readonly) */}
                            <td>{item.summ?.toFixed(2) || '0.00'}</td>

                            {/* Валюта */}
                            <td>
                                <Controller
                                    name={`items.${idx}.currency`}
                                    control={control}
                                    render={({ field }) => (
                                        <ReferenceSelect
                                            label=""
                                            placeholder="Выберите валюту"
                                            options={getRefName.currency || []}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            disabled={field.disabled}
                                            minWidth={10}
                                        />
                                    )}
                                />
                            </td>

                            {/* Заказано */}
                            <td>
                                <Controller
                                    name={`items.${idx}.total_ordered`}
                                    control={control}
                                    rules={{
                                        required: 'Обязательно',
                                        min: { value: 111, message: '> 0' },
                                    }}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            type="number"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={compactTextFieldSx}
                                        />
                                    )}
                                />
                            </td>

                            {/* Остаток */}
                            <td>{item.remaining_quantity ?? '—'}</td>

                            {/* Комментарий */}
                            <td>{item.comment?.trim() ? item.comment : '—'}</td>

                            <td>
                                <Checkbox
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => toggleOne(item.id)}
                                />
                            </td>
                        </tr>
                    ))}

                    {(!watchedItems || watchedItems.length === 0) && (
                        <tr>
                            <td colSpan={12}>
                                <Box textAlign="center" py={3}>
                                    <Typography color="text.secondary" fontSize="0.9rem">
                                        Данные не найдены
                                    </Typography>
                                </Box>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* <div style={{ display: 'flex', justifyContent: 'flex-end' }}> */}
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} p={1}>
                <Box flex={1} maxWidth={320}>
                    <ReferenceSelect
                        label=""
                        placeholder="Выберите поставщика"
                        options={getRefName.suppliers || []}
                        value={suppliersId || ''}
                        onChange={setSuppliersId}
                    />
                </Box>
                <Box display="flex" gap={1}>
                    {/* <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => reset()}
                        // disabled={isSubmitting}
                    >
                        Отмена
                    </button> */}
                    {/* <button type="submit" className="btn btn-primary" disabled={isSubmitting}> */}
                    <button type="submit" className="btn btn-primary">
                        Сформировать
                        {/* {isSubmitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'} */}
                    </button>
                </Box>
            </Box>
            {/*Пагинация****************************************************************************************************/}
            <TablePagination pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} />
        </Paper>
    );
}
