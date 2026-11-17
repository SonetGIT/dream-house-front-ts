import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Box } from '@mui/material';
import { X } from 'lucide-react';
import { useAsyncActionLock } from '@/utils/useAsyncActionLock';
import { useState } from 'react';
import { MaterialForm } from './MaterialForm';
import { validateMaterial } from './materialPayload';
import type { Material, MaterialFormData } from './materialsSlice';

interface Props {
    material: Material | null;
    busy: boolean;
    onClose: () => void;
    onSubmit: (data: MaterialFormData) => Promise<void>;
}

export function MaterialCreateEditDialog({ material, busy, onClose, onSubmit }: Props) {
    const { pending, run } = useAsyncActionLock();
    const saving = busy || pending;
    const [formData, setFormData] = useState<MaterialFormData>({
        name: material?.name ?? '',
        type: material?.type ?? '',
        unit_of_measure: material?.unit_of_measure ?? '',
        coefficient: String(material?.coefficient ?? material?.coeffitient ?? ''),
        description: material?.description ?? '',
    });
    const [error, setError] = useState<string | null>(null);
    return (
        <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="xs"
            slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                    <Typography component="span" sx={{ display: 'block', fontWeight: 600, fontSize: 18 }}>
                        {material ? 'Редактирование материала' : 'Новый материал'}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary">Управление материалами</Typography>
                </Box>
                <IconButton size="small" aria-label="Закрыть" disabled={saving} onClick={onClose}><X size={18} /></IconButton>
            </DialogTitle>
            <form onSubmit={(event) => {
                event.preventDefault();
                const message = validateMaterial(formData, material === null);
                setError(message);
                if (!message && !saving) void run(() => onSubmit(formData));
            }}>
                <DialogContent sx={{ pt: 1 }}>
                    <MaterialForm data={formData} editing={material !== null} disabled={saving} onChange={setFormData} />
                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1, '& > button': { flex: 1 }, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
                    <Button disabled={saving} variant="outlined" onClick={onClose}>Отмена</Button>
                    <Button disabled={saving} variant="contained" type="submit">{saving ? 'Сохранение…' : material ? 'Сохранить' : 'Создать'}</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
