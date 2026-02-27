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
import {
    createMaterialEstimate,
    updateMaterialEstimate,
    type MaterialEstimate,
} from '../estimates/materialEstimatesSlice';
import toast from 'react-hot-toast';

interface Props {
    open: boolean;
    onClose: () => void;
    blockId: number;
    estimate?: MaterialEstimate | null;
}

export default function MaterialEstimateCreateEditDialog({
    open,
    onClose,
    blockId,
    estimate,
}: Props) {
    const dispatch = useAppDispatch();

    const [form, setForm] = useState({
        blockId: blockId,
        planned_budget: '',
        total_area: '',
        sale_area: '',
        status: '',
    });

    useEffect(() => {
        if (estimate) {
            setForm({
                blockId: blockId,
                planned_budget: String(estimate.planned_budget ?? ''),
                total_area: String(estimate.total_area ?? ''),
                sale_area: String(estimate.sale_area ?? ''),
                status: '',
            });
        } else {
            setForm({
                blockId: blockId,
                planned_budget: '',
                total_area: '',
                sale_area: '',
                status: '',
            });
        }
    }, [estimate]);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                block_id: blockId,
                planned_budget: form.planned_budget ? Number(form.planned_budget) : null,
                total_area: form.total_area ? Number(form.total_area) : null,
                sale_area: form.sale_area ? Number(form.sale_area) : null,
                status: form.status ? Number(form.status) : 1, //черновки
            };
            console.log('payload', payload);
            if (estimate) {
                await dispatch(
                    updateMaterialEstimate({
                        id: estimate.id,
                        data: payload,
                    }),
                ).unwrap();
                toast.success('Смета обновлена');
            } else {
                await dispatch(createMaterialEstimate(payload)).unwrap();
                toast.success('Смета создана');
            }

            onClose();
        } catch (err) {
            toast.error('Ошибка сохранения');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{estimate ? 'Редактировать смету' : 'Создать смету'}</DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Плановый бюджет"
                        value={form.planned_budget}
                        onChange={(e) => handleChange('planned_budget', e.target.value)}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Общая площадь"
                        value={form.total_area}
                        onChange={(e) => handleChange('total_area', e.target.value)}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Продаваемая площадь"
                        value={form.sale_area}
                        onChange={(e) => handleChange('sale_area', e.target.value)}
                        fullWidth
                        size="small"
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
