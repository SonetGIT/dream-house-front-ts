import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useMaterialEstimateItemsForm, emptyRow } from './useMaterialEstimateItemsForm';
import MaterialEstimateItemsFormTable from './MaterialEstimateItemsFormTable';
import toast from 'react-hot-toast';

export default function MaterialEstimateItemCreateEditDialog({ open, onClose }: any) {
    const { rows, updateField, addRow, removeRow, rowTotal, grandTotal, isFormValid } =
        useMaterialEstimateItemsForm([emptyRow()]);

    const handleSubmit = () => {
        if (!isFormValid) {
            toast.error('Заполните обязательные поля');
            return;
        }

        console.log('Submit rows:', rows);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullWidth
            PaperProps={{
                sx: {
                    width: '98vw',
                    // maxWidth: '1600px',
                },
            }}
        >
            <DialogContent>
                <MaterialEstimateItemsFormTable
                    rows={rows}
                    updateField={updateField}
                    removeRow={removeRow}
                    rowTotal={rowTotal}
                    isEditMode={false}
                />

                <Button startIcon={<Add />} sx={{ mt: 1 }} onClick={addRow}>
                    Добавить строку
                </Button>

                <Box mt={2} textAlign="right">
                    <Typography variant="h6">Итого: {grandTotal.toLocaleString()}</Typography>
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
