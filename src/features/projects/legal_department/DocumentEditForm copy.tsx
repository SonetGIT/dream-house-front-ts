// DocumentEditForm.tsx
import { useEffect, useState, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import { AiOutlineUpload } from 'react-icons/ai';
import { DocumentFilesList } from './DocumentFilesList';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { uploadDocumentFile } from './documentFilesSlice';

interface DocumentFormData {
    name: string;
    description: string;
    price: number;
    status: number;
}

interface DocumentEditFormProps {
    open: boolean;
    onClose: () => void;
    documentId: number;
    initialData: DocumentFormData;
    onSave: (updatedValues: DocumentFormData) => void;
}

export function DocumentEditForm({
    open,
    onClose,
    documentId,
    initialData,
    onSave,
}: DocumentEditFormProps) {
    const dispatch = useAppDispatch();
    const { loading: uploadLoading, error: uploadError } = useAppSelector(
        (state) => state.documentFiles,
    );

    const [formData, setFormData] = useState<DocumentFormData>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof DocumentFormData, string>>>({});
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Справочники
    //   const { lookup: getStatusName,  statuses } = useReference('documentStatuses');

    useEffect(() => {
        if (open) {
            setFormData(initialData);
            setErrors({});
        }
    }, [open, initialData]);

    const validate = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof DocumentFormData, string>> = {};

        if (!formData.name.trim()) newErrors.name = 'Обязательное поле';
        if (formData.price <= 0) newErrors.price = 'Цена должна быть больше 0';
        if (formData.status === undefined || formData.status === null)
            newErrors.status = 'Выберите статус';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleChange = (field: keyof DocumentFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        for (const file of files) {
            try {
                await dispatch(uploadDocumentFile({ documentId, file })).unwrap();
                setSnackbar({
                    open: true,
                    message: `Файл "${file.name}" загружен`,
                    severity: 'success',
                });
            } catch (err: any) {
                setSnackbar({
                    open: true,
                    message: err.message || 'Ошибка загрузки файла',
                    severity: 'error',
                });
            }
        }
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>Редактировать документ #{documentId}</DialogTitle>

            <DialogContent dividers>
                {/* Основная форма */}
                <Box
                    component="form"
                    noValidate
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <TextField
                        label="Название *"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Цена *"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleChange('price', Number(e.target.value))}
                        error={!!errors.price}
                        helperText={errors.price}
                        fullWidth
                        required
                        inputProps={{ min: 0.01, step: 0.01 }}
                    />

                    <TextField
                        label="Описание"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        fullWidth
                        sx={{ gridColumn: '1 / -1' }}
                    />

                    <FormControl error={!!errors.status} fullWidth required>
                        <InputLabel>Статус *</InputLabel>
                        <Select
                            value={formData.status}
                            onChange={(e) => handleChange('status', Number(e.target.value))}
                            label="Статус *"
                        >
                            {/* {statuses?.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              )) || (
                <MenuItem value={0}>Черновик</MenuItem>
              )} */}
                        </Select>
                        {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                    </FormControl>
                </Box>

                {/* Файлы */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Файлы документа
                    </Typography>

                    <DocumentFilesList documentId={documentId} />

                    {/* Кнопка загрузки */}
                    <Button
                        variant="outlined"
                        startIcon={
                            uploadLoading ? <CircularProgress size={16} /> : <AiOutlineUpload />
                        }
                        component="label"
                        disabled={uploadLoading}
                        sx={{ mt: 1.5 }}
                    >
                        Добавить файлы
                        <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                        />
                    </Button>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="secondary">
                    Отмена
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!formData.name.trim() || formData.price <= 0 || uploadLoading}
                >
                    Сохранить
                </Button>
            </DialogActions>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}
