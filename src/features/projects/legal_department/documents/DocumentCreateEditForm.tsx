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
    Checkbox,
    ListItemText,
    DialogTitle,
    Button,
} from '@mui/material';
import { AiOutlineUpload } from 'react-icons/ai';
import { AppButton } from '@/components/ui/AppButton';
import { useReference } from '@/features/reference/useReference';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { documentFormData } from '@/features/auditLog/metaData/document';
import { AuditLogTable } from '@/features/auditLog/AuditLogTable';
import { MdHistory } from 'react-icons/md';
import { DocumentFilesList } from '../files/DocumentFilesList';
import { fetchDocuments, signDocument } from './documentsSlice';
import toast from 'react-hot-toast';
import StatusChip from '@/components/ui/StatusChip';

export interface DocumentFormData {
    name: string;
    price: number;
    description: string;
    status: number;
    deadline: null;
    responsible_users: number[];
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
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<DocumentFormData>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof DocumentFormData, string>>>({});
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [openHistory, setOpenHistory] = useState(false);

    const documentStatuses = useReference('documentStatuses');
    const users = useReference('users');
    const currentUser = useAppSelector((state) => state.auth.user); //users?.filter((u) => u.role_id === 14) ?? [];
    const lawyers = users.data?.filter((u) => u.role_id === String(currentUser?.role_id)) ?? [];

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

    const handleChange = (field: keyof DocumentFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = () => {
        onSubmit(formData, pendingFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setPendingFiles((prev) => [...prev, ...files]);
    };

    const handleSign = (documentId: number) => {
        const roleId = Number(currentUser?.role_id);

        // роли, которые могут подписывать - админ, директор
        if (roleId !== 1 && roleId !== 2) {
            toast.error('У вас нет прав на подписание документа');
            return;
        }

        dispatch(signDocument(documentId))
            .unwrap()
            .then(() => {
                dispatch(fetchDocuments({ page: 1, size: 10 }));
                toast.success('Документ успешно подписан');
            })
            .catch((err) => {
                toast.error(err || 'Ошибка при подписании');
            });
    };

    /****************************************************************************************************************************/
    return (
        <Dialog className="table" open={open} onClose={onClose} fullWidth maxWidth="md">
            <Box
                sx={{
                    m: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Box>
                    <Typography
                        sx={{ textTransform: 'uppercase', color: '#1f4774', fontWeight: 600 }}
                    >
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

                {/* История */}
                {documentId && (
                    <Box>
                        <AppButton
                            variant="outlined"
                            size="small"
                            startIcon={<MdHistory />}
                            onClick={() => setOpenHistory(true)}
                            sx={{ border: 'none', fontWeight: '500' }}
                        >
                            История
                        </AppButton>
                    </Box>
                )}
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
                    <FormControl error={!!errors.responsible_users} fullWidth required size="small">
                        <InputLabel>Исполнители</InputLabel>

                        <Select
                            multiple
                            label="Исполнители *"
                            value={formData.responsible_users}
                            onChange={(e) =>
                                handleChange('responsible_users', e.target.value as number[])
                            }
                            renderValue={(selected) =>
                                lawyers
                                    ?.filter((u) => selected.includes(Number(u.id)))
                                    .map((u) => u.name)
                                    .join(', ')
                            }
                        >
                            {lawyers?.map((u) => {
                                const id = Number(u.id);

                                return (
                                    <MenuItem key={id} value={id}>
                                        <Checkbox
                                            checked={formData.responsible_users.includes(id)}
                                        />
                                        <ListItemText primary={u.name} />
                                    </MenuItem>
                                );
                            })}
                        </Select>

                        {errors.responsible_users && (
                            <FormHelperText>{errors.responsible_users}</FormHelperText>
                        )}
                    </FormControl>

                    <TextField
                        label="Крайний срок *"
                        type="date"
                        value={formData.deadline || ''}
                        onChange={(e) => handleChange('deadline', e.target.value)}
                        error={!!errors.deadline}
                        helperText={errors.deadline}
                        size="small"
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
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
                            <StatusChip
                                label={documentStatuses.lookup(formData.status)}
                                status={formData.status}
                            />
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
            <Dialog
                open={openHistory}
                onClose={() => setOpenHistory(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>История изменений</DialogTitle>

                <DialogContent dividers>
                    <AuditLogTable
                        entity_type={'document'}
                        entity_id={documentId || 0}
                        formMetadata={documentFormData}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenHistory(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>
            <DialogActions>
                <AppButton
                    variantType="primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (documentId) {
                            handleSign(documentId);
                        }
                    }}
                    disabled={!documentId}
                    sx={{ mr: 'auto' }}
                >
                    Подписать
                </AppButton>

                <AppButton onClick={onClose}>Отмена</AppButton>
                <AppButton variantType="primary" onClick={handleSubmit} disabled={submitting}>
                    Сохранить
                </AppButton>
            </DialogActions>
        </Dialog>
    );
}
