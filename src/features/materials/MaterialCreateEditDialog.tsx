import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useState } from 'react';
import { MaterialForm } from './MaterialForm';
import type { Material, MaterialFormData } from './materialsSlice';

interface Props {
    open: boolean;
    material: Material | null;
    onClose: () => void;
    onSubmit: (data: MaterialFormData) => void;
}

export function MaterialCreateEditDialog({ open, material, onClose, onSubmit }: Props) {
    const [formData, setFormData] = useState<MaterialFormData>({
        name: '',
        type: '',
        unit_of_measure: '',
        coefficient: '',
        description: '',
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{material ? 'Редактировать материал' : 'Создать материал'}</DialogTitle>

            <DialogContent dividers>
                <MaterialForm initialData={material} onChange={setFormData} />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={() => onSubmit(formData)}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
}
