import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
} from '@mui/material';
import { useAppDispatch } from '@/app/store';
import toast from 'react-hot-toast';
import {
    createMaterialEstimateItem,
    updateMaterialEstimateItem,
    type MaterialEstimateItem,
} from './materialEstimateItemsSlice';

interface Props {
    open: boolean;
    onClose: () => void;
    estimateId: number;
    item?: MaterialEstimateItem | null;
}

export default function MaterialEstimateItemCreateEditDialog({
    open,
    onClose,
    estimateId,
    item,
}: Props) {
    const dispatch = useAppDispatch();

    const [form, setForm] = useState({
        subsection_id: '',
        item_type: '',
        material_type: '',
        material_id: '',
        unit_of_measure: '',
        quantity_planned: '',
        coefficient: '',
        price: '',
        comment: '',
    });

    useEffect(() => {
        if (item) {
            setForm({
                subsection_id: String(item.subsection_id ?? ''),
                item_type: String(item.item_type ?? ''),
                material_type: String(item.material_type ?? ''),
                material_id: String(item.material_id ?? ''),
                unit_of_measure: String(item.unit_of_measure ?? ''),
                quantity_planned: String(item.quantity_planned ?? ''),
                coefficient: String(item.coefficient ?? ''),
                price: String(item.price ?? ''),
                comment: item.comment ?? '',
            });
        } else {
            setForm({
                subsection_id: '',
                item_type: '',
                material_type: '',
                material_id: '',
                unit_of_measure: '',
                quantity_planned: '',
                coefficient: '',
                price: '',
                comment: '',
            });
        }
    }, [item]);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                material_estimate_id: estimateId,
                subsection_id: Number(form.subsection_id),
                item_type: Number(form.item_type),
                material_type: form.material_type ? Number(form.material_type) : null,
                material_id: form.material_id ? Number(form.material_id) : null,
                unit_of_measure: form.unit_of_measure ? Number(form.unit_of_measure) : null,
                quantity_planned: Number(form.quantity_planned),
                coefficient: form.coefficient ? Number(form.coefficient) : null,
                price: form.price ? Number(form.price) : 0,
                comment: form.comment || null,
            };

            if (item) {
                await dispatch(
                    updateMaterialEstimateItem({
                        id: item.id,
                        data: payload,
                    }),
                ).unwrap();
                toast.success('Позиция обновлена');
            } else {
                await dispatch(createMaterialEstimateItem(payload)).unwrap();
                toast.success('Позиция создана');
            }

            onClose();
        } catch {
            toast.error('Ошибка сохранения');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{item ? 'Редактировать позицию' : 'Добавить позицию'}</DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Подраздел"
                        value={form.subsection_id}
                        onChange={(e) => handleChange('subsection_id', e.target.value)}
                        size="small"
                        fullWidth
                    />

                    <TextField
                        label="Тип позиции"
                        value={form.item_type}
                        onChange={(e) => handleChange('item_type', e.target.value)}
                        size="small"
                        fullWidth
                    />

                    <TextField
                        label="Материал"
                        value={form.material_id}
                        onChange={(e) => handleChange('material_id', e.target.value)}
                        size="small"
                        fullWidth
                    />

                    <TextField
                        label="Количество"
                        value={form.quantity_planned}
                        onChange={(e) => handleChange('quantity_planned', e.target.value)}
                        size="small"
                        fullWidth
                    />

                    <TextField
                        label="Цена"
                        value={form.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        size="small"
                        fullWidth
                    />

                    <TextField
                        label="Комментарий"
                        value={form.comment}
                        onChange={(e) => handleChange('comment', e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                    />
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
