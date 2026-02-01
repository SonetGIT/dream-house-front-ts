import { useEffect, useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    CircularProgress,
    Divider,
} from '@mui/material';
import { AiOutlineUpload } from 'react-icons/ai';
import { DocumentFilesList } from './DocumentFilesList';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { uploadDocumentFile } from './documentFilesSlice';
import { AppButton } from '@/components/ui/AppButton';
import toast from 'react-hot-toast';
import { useReference } from '@/features/reference/useReference';
import { fetchDocuments, updateDocuments } from './documentsSlice';

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

/*************************************************************************************************************************/
export function DocumentEditForm({
    open,
    onClose,
    documentId,
    initialData,
    onSave,
}: DocumentEditFormProps) {
    const dispatch = useAppDispatch();
    const { loading: uploadLoading } = useAppSelector((state) => state.documentFiles);

    const [formData, setFormData] = useState<DocumentFormData>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof DocumentFormData, string>>>({});

    // Справочники
    const { data: getdocStagesData } = useReference('8ba2b356-f147-4926-827c-113aafb7b2ff');

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

    /*Загрузка файла*/
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        for (const file of files) {
            try {
                await dispatch(uploadDocumentFile({ documentId, file })).unwrap();
                toast.success(`Файл "${file.name}" успешно загружен`);
            } catch (err: any) {
                toast.error(err || 'Ошибка загрузки файла');
            }
        }
    };

    const handleSubmit = () => {
        if (validate()) {
            dispatch(updateDocuments({ id: documentId, data: formData }))
                .unwrap()
                .then(() => {
                    dispatch(fetchDocuments({ page: 1, size: 10 }));
                    toast.success('Документ успешно обновлён');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при обновлении документа');
                });
            onSave(formData);
        }
    };

    /*****************************************************************************************************************************************/
    return (
        <Dialog className="table" open={open} onClose={onClose} fullWidth maxWidth="md">
            {/* Header */}
            <Box sx={{ m: 2 }}>
                <Typography sx={{ textTransform: 'uppercase', color: '#1f4774', fontWeight: 600 }}>
                    Редактировать документ под №: {documentId}
                </Typography>

                <Typography variant="body2" mt={1} sx={{ color: '#888787' }}>
                    Обновите информацию о документе и управляйте прикреплёнными файлами
                </Typography>
            </Box>

            <DialogContent dividers sx={{ p: 2 }}>
                {/* Основная форма */}
                <Box
                    component="form"
                    noValidate
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2.5,
                        mb: 3,
                    }}
                >
                    {/* Название */}
                    <TextField
                        label="Название документа *"
                        placeholder="Введите название..."
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                        required
                        size="small"
                        // slotProps={{
                        //     input: {
                        //         sx: {
                        //             borderRadius: 1.5,
                        //             px: 1.5,
                        //             py: 1,
                        //         },
                        //     },
                        // }}
                    />

                    {/* Цена */}
                    <TextField
                        label="Стоимость *"
                        placeholder="0.00"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleChange('price', Number(e.target.value))}
                        error={!!errors.price}
                        helperText={errors.price}
                        fullWidth
                        required
                        size="small"
                        // slotProps={{
                        //     input: {
                        //         sx: {
                        //             borderRadius: 1.5,
                        //             px: 1.5,
                        //             py: 1,
                        //         },
                        //     },
                        // }}
                        // InputProps={{
                        //     endAdornment: (
                        //         <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        //             ₸
                        //         </Typography>
                        //     ),
                        // }}
                    />

                    {/* Описание */}
                    <TextField
                        label="Описание"
                        placeholder="Добавьте описание документа..."
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ gridColumn: '1 / -1' }}
                        slotProps={{
                            input: {
                                sx: {
                                    borderRadius: 1.5,
                                    px: 1.5,
                                    py: 1,
                                },
                            },
                        }}
                    />

                    {/* Статус */}
                    <FormControl error={!!errors.status} fullWidth required size="small">
                        <InputLabel>Статус документа *</InputLabel>
                        <Select
                            value={formData.status}
                            onChange={(e) => handleChange('status', Number(e.target.value))}
                            label="Статус документа *"
                        >
                            {getdocStagesData?.map((status) => (
                                <MenuItem key={status.id} value={status.id}>
                                    {status.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                    </FormControl>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Раздел с прикрепленными файлами */}
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight={600}>
                            Прикреплённые файлы
                        </Typography>
                        <Typography variant="caption">
                            Поддерживаемые форматы: PDF, DOC, XLS, JPG, PNG
                        </Typography>
                    </Box>

                    <DocumentFilesList documentId={documentId} />

                    {/* Кнопка загрузки */}
                    <AppButton
                        variant="outlined"
                        startIcon={
                            uploadLoading ? (
                                <CircularProgress size={18} />
                            ) : (
                                <AiOutlineUpload size={18} />
                            )
                        }
                        component="label"
                        disabled={uploadLoading}
                    >
                        {uploadLoading ? 'Загрузка...' : 'Добавить файлы'}
                        <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        />
                    </AppButton>
                </Box>
            </DialogContent>

            {/* Footer */}
            <DialogActions>
                <AppButton onClick={onClose}>Отмена</AppButton>
                <AppButton
                    variantType="primary"
                    onClick={handleSubmit}
                    disabled={!formData.name.trim() || formData.price <= 0 || uploadLoading}
                >
                    {uploadLoading ? 'Сохранение...' : 'Сохранить'}
                </AppButton>
            </DialogActions>
        </Dialog>
    );
}
