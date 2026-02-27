import { Dialog, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import toast from 'react-hot-toast';

import { useMaterialEstimateItemsForm } from './useMaterialEstimateItemsForm';
import EstimateItemsTable from './EstimateItemsTable';
import { useReference } from '@/features/reference/useReference';
import { useAppDispatch } from '@/app/store';
import {
    createMaterialEstimateItem,
    fetchMaterialEstimateItems,
    type MaterialEstimateItemFormData,
} from '../materialEstimateItemsSlice';

interface Props {
    open: boolean;
    onClose: () => void;
    estimateId: number; // реальный id сметы
}

export default function EstimateItemDialog({ open, onClose, estimateId }: Props) {
    const dispatch = useAppDispatch();
    // ─────────────────────────────────────────────
    // REFERENCES
    // ─────────────────────────────────────────────
    const serviceTypes = useReference('serviceTypes');
    const services = useReference('services');
    const materialTypes = useReference('materialTypes');
    const materials = useReference('materials');
    const unitsOfMeasure = useReference('unitsOfMeasure');
    const currencies = useReference('currencies');
    const materialEstimateItemTypes = useReference('materialEstimateItemTypes');
    // Определяем ID типов из справочника
    const MATERIAL_TYPE_ID = 1; //aterialEstimateItemTypes.data?.find((t) => t.id === 1)?.id;
    const SERVICE_TYPE_ID = 2; //materialEstimateItemTypes.data?.find((t) => t.id === 2)?.id;

    // ─────────────────────────────────────────────
    // FORM HOOK
    // ─────────────────────────────────────────────
    const { rows, addRow, removeRow, updateField, rowTotal, grandTotal, reset } =
        useMaterialEstimateItemsForm({
            defaultItemType: 1,
            refs: { materials },
        });

    // ─────────────────────────────────────────────
    // SUBMIT
    // ─────────────────────────────────────────────
    const handleSubmit = async () => {
        const validRows = rows.filter((row) => {
            if (row.item_type === MATERIAL_TYPE_ID) {
                return row.material_id && row.price > 0;
            }
            if (row.item_type === SERVICE_TYPE_ID) {
                return row.service_id && row.price > 0;
            }
            return false;
        });

        if (!validRows.length) {
            toast.error('Добавьте корректную строку');
            return;
        }

        try {
            for (const row of validRows) {
                const payload: MaterialEstimateItemFormData = {
                    material_estimate_id: estimateId,
                    subsection_id: 1,

                    item_type: Number(row.item_type),

                    service_type: row.service_type ? Number(row.service_type) : null,
                    service_id: row.service_id ? Number(row.service_id) : null,

                    material_type: row.material_type ? Number(row.material_type) : null,
                    material_id: row.material_id ? Number(row.material_id) : null,

                    unit_of_measure: row.unit_of_measure ? Number(row.unit_of_measure) : 1, // временно шт

                    quantity_planned: Number(row.quantity) || 1,

                    coefficient: Number(row.coefficient) || 1,

                    currency: row.currency ? Number(row.currency) : null,

                    price: Number(row.price) || 0,
                    comment: row.comment || '',
                };

                await dispatch(createMaterialEstimateItem(payload)).unwrap();
            }

            await dispatch(fetchMaterialEstimateItems(estimateId));

            toast.success('Позиции добавлены');

            reset();
            onClose();
        } catch (error: any) {
            toast.error(error || 'Ошибка сохранения');
        }
    };

    // ─────────────────────────────────────────────

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullWidth
            PaperProps={{
                sx: { width: '98vw' },
            }}
        >
            <DialogContent>
                <EstimateItemsTable
                    rows={rows}
                    updateField={updateField}
                    removeRow={removeRow}
                    rowTotal={rowTotal}
                    refs={{
                        serviceTypes,
                        services,
                        materialTypes,
                        materials,
                        unitsOfMeasure,
                        currencies,
                        materialEstimateItemTypes,
                    }}
                />

                <Button startIcon={<Add />} sx={{ mt: 1 }} onClick={addRow}>
                    Добавить строку
                </Button>

                <Box mt={2} textAlign="right">
                    <Typography variant="h6">
                        Итого:{' '}
                        {grandTotal.toLocaleString('ru-RU', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
}
