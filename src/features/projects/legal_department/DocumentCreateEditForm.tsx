import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Typography,
    Divider,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    MenuItem,
} from '@mui/material';
import { AiOutlineUpload } from 'react-icons/ai';
import { DocumentFilesList } from './DocumentFilesList';
import { AppButton } from '@/components/ui/AppButton';
import { useReference } from '@/features/reference/useReference';
import type { Users } from '@/features/users/userSlice';
import { useAppSelector } from '@/app/store';
import MultiSelectCheckbox from '@/components/ui/MultiSelectCheckbox';

export interface DocumentFormData {
    name: string;
    price: number;
    description: string;
    status: number;
    deadline: null;
    responsible_users: Users[];
}

interface DocumentCreateEditFormProps {
    open: boolean;
    onClose: () => void;
    documentId?: number;
    initialData: DocumentFormData;
    submitting?: boolean;
    onSubmit: (data: DocumentFormData, files: File[]) => void | Promise<void>;
}

/**********************************************************************************************************************/
export function DocumentCreateEditForm({
    open,
    onClose,
    documentId,
    initialData,
    submitting = false,
    onSubmit,
}: DocumentCreateEditFormProps) {
    const [formData, setFormData] = useState<DocumentFormData>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof DocumentFormData, string>>>({});
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const { data: statuses } = useReference('5c18ca4d-c9ab-41f3-936b-415f060b02b2');
    const { data: users } = useReference('d0336075-e674-41ef-aa38-189de9adaeb4');
    const currentUser = useAppSelector((state) => state.auth.user);
    const lawyers = users?.filter((u) => u.role_id === 14) ?? [];
    // const lawyers = users?.filter((u) => u.role_id === currentUser?.role_id) ?? [];
    console.log('currentUser', currentUser);
    console.log('lawyers', lawyers);

    useEffect(() => {
        if (open) {
            setFormData({
                ...initialData,
                status: documentId ? initialData.status : 1,
            });
            setErrors({});
            setPendingFiles([]);
        }
    }, [open, initialData, documentId]);

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        if (!formData.name.trim()) newErrors.name = 'Обязательное поле';
        if (formData.price <= 0) newErrors.price = 'Цена должна быть больше 0';
        if (formData.status == null) newErrors.status = 'Выберите статус';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: keyof DocumentFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = () => {
        if (validate()) {
            onSubmit(formData, pendingFiles);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setPendingFiles((prev) => [...prev, ...files]);
    };

    /****************************************************************************************************************************/
    return (
        <Dialog className="table" open={open} onClose={onClose} fullWidth maxWidth="md">
            <Box sx={{ m: 2 }}>
                <Typography sx={{ textTransform: 'uppercase', color: '#1f4774', fontWeight: 600 }}>
                    {documentId
                        ? `Редактировать документ № ${documentId}`
                        : 'Создать новый документ'}
                </Typography>
                <Typography variant="body2" mt={1} sx={{ color: '#888787' }}>
                    {documentId
                        ? 'Обновите информацию о документе и управляйте файлами'
                        : 'Заполните информацию о новом документе'}
                </Typography>
            </Box>

            <DialogContent dividers>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2,
                    }}
                >
                    <TextField
                        label="Название *"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        size="small"
                        fullWidth
                        required
                    />

                    <TextField
                        label="Стоимость *"
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => handleChange('price', Number(e.target.value))}
                        // error={!!errors.price}
                        helperText={errors.price}
                        size="small"
                        fullWidth
                    />

                    <TextField
                        label="Описание *"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ gridColumn: '1 / -1' }}
                    />
                    <FormControl error={!!errors.status} fullWidth required size="small">
                        <InputLabel>Соисполнители</InputLabel>
                        <MultiSelectCheckbox
                        // value={formData.responsible_users}
                        // label="Соисполнители *"
                        // onChange={(e) =>
                        //     handleChange('responsible_users', Number(e.target.value))
                        // }
                        >
                            {/* {lawyers?.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.name}
                                </MenuItem>
                            ))} */}
                        </MultiSelectCheckbox>
                        {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                    </FormControl>
                    <TextField
                        label="Крайний срок *"
                        type="date"
                        value={formData.deadline || ''}
                        onChange={(e) => handleChange('deadline', Number(e.target.value))}
                        error={!!errors.deadline}
                        helperText={errors.deadline}
                        size="small"
                        fullWidth
                    />
                    {/* Статус — занимает всю ширину, но контент выровнен по правому краю */}
                    <Box
                        sx={{
                            gridColumn: '1 / -1', // ← занимает всю ширину строки
                            display: 'flex',
                            justifyContent: 'flex-end', // ← выравнивание по правому краю
                            mt: -1,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: '#1f4774',
                            }}
                        >
                            <Typography variant="body2">Статус документа:</Typography>
                            <Typography variant="body2" fontWeight={500}>
                                {statuses?.find((s) => s.id === formData.status)?.name ?? ''}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {documentId && (
                    <>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Сохранённые файлы
                        </Typography>
                        <DocumentFilesList documentId={documentId} />
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

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
                </Box>

                {pendingFiles.length === 0 ? (
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#9e9e9e',
                            fontStyle: 'italic',
                            mt: 1,
                        }}
                    >
                        Файлы ещё не добавлены
                    </Typography>
                ) : (
                    pendingFiles.map((file, index) => (
                        <Typography key={index} variant="body2">
                            {file.name}
                        </Typography>
                    ))
                )}

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                    }}
                >
                    <AppButton
                        component="label"
                        startIcon={<AiOutlineUpload />}
                        disabled={submitting}
                    >
                        Добавить файлы
                        <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        />
                    </AppButton>

                    <Typography variant="caption">
                        Поддерживаемые форматы: .pdf .doc .docx .xls .xlsx .jpg .jpeg .png
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <AppButton onClick={onClose}>Отмена</AppButton>
                <AppButton variantType="primary" onClick={handleSubmit} disabled={submitting}>
                    Сохранить
                </AppButton>
            </DialogActions>
        </Dialog>
    );
}
