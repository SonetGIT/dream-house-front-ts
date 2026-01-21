import { useEffect, useState } from 'react';
import { Paper, Checkbox, Box, TextField, FormHelperText } from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import {
    fetchPurchasingAgentItems,
    type MaterialRequestItems,
} from '@/features/projects/material_request_items/materialRequestItemsSlice';
import type { EnumItem } from '@/features/reference/referenceService';
import { compactTextFieldSx } from '@/styles/ui_style';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { TablePagination } from '@/components/ui/TablePagination';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { createPurchaseOrder } from '../purchaseOrders/purchaseOrdersSlice';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Pagination } from '@/features/users/userSlice';
import type { ProjectOutletContext } from '../material_request/MaterialRequests';

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
    fullyOrderedStatusId?: number | string;
}

interface FormValues {
    items: MaterialRequestItems[];
}

export default function PurchasingAgentItemsTable({
    items,
    getRefName,
    pagination,
    onPrevPage,
    onNextPage,
    fullyOrderedStatusId,
}: PurchasingAgentItemsProps) {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);
    const { projectId } = useOutletContext<ProjectOutletContext>();

    const [suppliersId, setSuppliersId] = useState<string | number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [supplierError, setSupplierError] = useState<string | null>(null);

    const { control, reset, setValue, trigger } = useForm<FormValues>({
        defaultValues: { items: [] },
    });

    useEffect(() => {
        reset({ items });
    }, [items, reset]);

    const watchedItems = useWatch({ control, name: 'items' });

    const isReadonlyRow = (item: MaterialRequestItems) => item.status === fullyOrderedStatusId;

    useEffect(() => {
        watchedItems?.forEach((item, idx) => {
            const sum = Number(item.price || 0) * Number(item.quantity || 0);
            if (item.summ !== sum) {
                setValue(`items.${idx}.summ`, sum);
            }
        });
    }, [watchedItems, setValue]);

    const toggleOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    //Сформировать
    const handleCreate = async () => {
        let hasError = false;

        if (!suppliersId) {
            setSupplierError('Выберите поставщика');
            hasError = true;
        } else {
            setSupplierError(null);
        }

        if (!currentUser?.id) {
            toast.error('Пользователь не авторизован');
            return;
        }

        const selectedItems = watchedItems.filter(
            (item) => selectedIds.includes(item.id) && !isReadonlyRow(item)
        );

        if (selectedItems.length === 0) {
            toast.error('Выберите хотя бы один элемент');
            return;
        }

        const fieldsToValidate = selectedItems.flatMap((item) => {
            const idx = watchedItems.findIndex((i) => i.id === item.id);
            return [`items.${idx}.price`, `items.${idx}.currency`, `items.${idx}.total_ordered`];
        });

        const isValid = await trigger(fieldsToValidate as any);
        if (!isValid || hasError) {
            toast.error('Заполните обязательные поля');
            return;
        }

        const payloadItems = selectedItems.map((item) => ({
            material_request_item_id: item.id,
            material_type: item.material_type,
            material_id: item.material_id,
            unit_of_measure: item.unit_of_measure,
            quantity: item.quantity,
            price: item.price,
            summ: item.summ,
            currency: item.currency,
            total_ordered: item.total_ordered,
        }));

        const result = await dispatch(
            createPurchaseOrder({
                created_user_id: currentUser.id,
                project_id: projectId,
                supplier_id: suppliersId,
                comment: 'Закупка по заявке',
                items: payloadItems,
            })
        );

        if (createPurchaseOrder.fulfilled.match(result)) {
            toast.success('Заявка успешно создана');

            setSelectedIds([]);
            setSuppliersId(null);

            dispatch(fetchPurchasingAgentItems({ page: 1, size: 10, project_id: projectId }));
        }
    };

    /************************************************************************************************************************/
    return (
        <Paper className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Статус</th>
                        <th>Тип</th>
                        <th>Материал</th>
                        <th>Ед.</th>
                        <th>Кол-во</th>
                        <th>Цена</th>
                        <th>Сумма</th>
                        <th>Валюта</th>
                        <th>Заказать</th>
                        <th>Остаток</th>
                        <th />
                    </tr>
                </thead>

                <tbody>
                    {watchedItems?.map((item, idx) => {
                        const readonly = isReadonlyRow(item);

                        return (
                            <tr
                                key={item.id}
                                style={{
                                    opacity: readonly ? 0.5 : 1,
                                }}
                            >
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
                                            required:
                                                selectedIds.includes(item.id) && !readonly
                                                    ? 'Обязательно'
                                                    : false,
                                        }}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                value={field.value ?? ''}
                                                disabled={readonly}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                                sx={compactTextFieldSx}
                                            />
                                        )}
                                    />
                                </td>

                                <td>{item.summ?.toFixed(2) || '0.00'}</td>

                                {/* Валюта */}
                                <td>
                                    <Controller
                                        name={`items.${idx}.currency`}
                                        control={control}
                                        rules={{
                                            required:
                                                selectedIds.includes(item.id) && !readonly
                                                    ? 'Обязательно'
                                                    : false,
                                        }}
                                        render={({ field, fieldState }) => (
                                            <>
                                                <ReferenceSelect
                                                    label=""
                                                    value={field.value ?? ''}
                                                    onChange={field.onChange}
                                                    options={getRefName.currency || []}
                                                    disabled={readonly}
                                                    error={!!fieldState.error}
                                                    minWidth={10}
                                                />
                                                {fieldState.error && (
                                                    <FormHelperText error>
                                                        {fieldState.error.message}
                                                    </FormHelperText>
                                                )}
                                            </>
                                        )}
                                    />
                                </td>

                                {/* Заказано */}
                                <td>
                                    <Controller
                                        name={`items.${idx}.total_ordered`}
                                        control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (readonly) return true;
                                                if (!selectedIds.includes(item.id)) return true;
                                                return Number(value) <= Number(item.quantity)
                                                    ? true
                                                    : 'Больше количества';
                                            },
                                        }}
                                        render={({ field, fieldState }) => (
                                            <TextField
                                                {...field}
                                                type="number"
                                                disabled={readonly}
                                                error={!!fieldState.error}
                                                helperText={fieldState.error?.message}
                                                sx={compactTextFieldSx}
                                            />
                                        )}
                                    />
                                </td>

                                <td>{item.remaining_quantity ?? '—'}</td>

                                <td>
                                    <Checkbox
                                        checked={selectedIds.includes(item.id)}
                                        disabled={readonly}
                                        onChange={() => toggleOne(item.id)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} p={1}>
                <ReferenceSelect
                    label=""
                    placeholder="Выберите поставщика"
                    options={getRefName.suppliers || []}
                    value={suppliersId || ''}
                    onChange={setSuppliersId}
                    error={!!supplierError}
                    helperText={supplierError || ''}
                />

                <button className="btn btn-primary" onClick={handleCreate}>
                    Сформировать
                </button>
            </Box>

            <TablePagination pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} />
        </Paper>
    );
}
