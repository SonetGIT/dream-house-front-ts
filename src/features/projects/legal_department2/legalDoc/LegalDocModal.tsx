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
    Stack,
    Chip,
} from '@mui/material';
import { AiOutlineUpload } from 'react-icons/ai';
import { MdHistory } from 'react-icons/md';
import { AppButton } from '@/components/ui/AppButton';
import { useReference } from '@/features/reference/useReference';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { documentFormData } from '@/features/auditLog/metaData/document';
import { AuditLogTable } from '@/features/auditLog/AuditLogTable';
import { DocumentFilesList } from '../files/DocumentFilesList';
import toast from 'react-hot-toast';
import StatusChip from '@/components/ui/StatusChip';
import { signDocument, type LegalDocument } from './legalDocSlice';
import { fetchDocuments } from '../../legal_department/documents/documentsSlice';

// Вынесли константы стилей
const COLORS = {
    primary: '#1f4774',
    textSecondary: '#888787',
    textDisabled: '#9e9e9e',
} as const;

export interface DocumentFormData {
    project_id: number;
    stage_id?: number;
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
    initialData: LegalDocument | null;
    submitting?: boolean;
    onSubmit: (data: LegalDocument, files: File[]) => void | Promise<void>;
}

export default function LegalDocModal({
    open,
    onClose,
    documentId,
    initialData,
    submitting = false,
    onSubmit,
}: DocumentCreateEditFormProps) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<LegalDocument>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof LegalDocument, string>>>({});
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [openHistory, setOpenHistory] = useState(false);

    const documentStatuses = useReference('documentStatuses');
    const users = useReference('users');
    const currentUser = useAppSelector((state) => state.auth.user);
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

    const handleChange = (field: keyof LegalDocument, value: any) => {
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

        if (roleId !== 1 && roleId !== 2) {
            toast.error('У вас нет прав на подписание документа');
            return;
        }

        dispatch(signDocument(documentId))
            .unwrap()
            .then(() => {
                // dispatch(fetchDocuments({ page: 1, size: 10, project_id: initialData.project_id }));
                toast.success('Документ успешно подписан');
            })
            .catch((err) => {
                toast.error(err || 'Ошибка при подписании');
            });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                {/* Шапка */}
                <Box sx={{ p: 3, pb: 2 }}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: COLORS.primary,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                }}
                            >
                                {documentId
                                    ? `Редактировать документ № ${documentId}`
                                    : 'Создать новый документ'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {documentId
                                    ? 'Обновите информацию о документе и управляйте файлами'
                                    : 'Заполните информацию о новом документе'}
                            </Typography>
                        </Box>

                        {documentId && (
                            <AppButton
                                variant="outlined"
                                size="small"
                                startIcon={<MdHistory />}
                                onClick={() => setOpenHistory(true)}
                                sx={{ border: 'none', fontWeight: 500 }}
                            >
                                История
                            </AppButton>
                        )}
                    </Stack>
                </Box>

                <DialogContent dividers>
                    {/* Основные поля */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Название"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            size="small"
                            fullWidth
                            required
                        />

                        <TextField
                            label="Стоимость"
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => handleChange('price', Number(e.target.value))}
                            helperText={errors.price}
                            size="small"
                            fullWidth
                            required
                        />

                        <TextField
                            label="Описание"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ gridColumn: '1 / -1' }}
                        />

                        <FormControl
                            error={!!errors.responsible_users}
                            fullWidth
                            required
                            size="small"
                        >
                            <InputLabel>Исполнители</InputLabel>
                            <Select
                                multiple
                                label="Исполнители"
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
                            label="Крайний срок"
                            type="date"
                            value={formData.deadline || ''}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                            error={!!errors.deadline}
                            helperText={errors.deadline}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Статус */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}
                        >
                            <Typography variant="body2" color={COLORS.primary}>
                                Статус документа:
                            </Typography>
                            <StatusChip
                                label={documentStatuses.lookup(formData.status)}
                                status={formData.status}
                            />
                        </Stack>
                    </Box>

                    {/* Файлы */}
                    {documentId && (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Сохранённые файлы
                            </Typography>
                            <DocumentFilesList documentId={documentId} />
                        </>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* Прикреплённые файлы */}
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight={600}>
                                Прикреплённые файлы
                            </Typography>
                        </Stack>

                        {pendingFiles.length === 0 ? (
                            <Typography variant="body2" color="text.disabled" fontStyle="italic">
                                Файлы ещё не добавлены
                            </Typography>
                        ) : (
                            <Stack spacing={0.5}>
                                {pendingFiles.map((file, index) => (
                                    <Chip
                                        key={index}
                                        label={file.name}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>
                        )}

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={2}
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

                            <Typography variant="caption" color="text.secondary">
                                PDF, DOC, XLS, JPG, PNG
                            </Typography>
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <AppButton
                        variantType="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (documentId) handleSign(documentId);
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

            {/* История изменений */}
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
        </>
    );
}
